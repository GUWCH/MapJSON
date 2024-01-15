import { useMemo } from 'react';
import moment from 'moment';
import {
    action,
    computed,
    makeObservable, observable, runInAction
} from 'mobx';
import { notify } from 'Notify';
import { daoIsOk, _dao } from '@/common/dao';
import Memory, { getMemoryDesc, getPageMemoryReq } from '@/common/util-memory';
import { combineToFullAlias } from '@/common/util-scada';
import { NumberUtil } from '@/common/utils';
import { useWidgetContext } from '../../hooks';
import { getPointConfigurationI18nMap } from '../../i18n';
import { mockNonStandPoints, mockPointsValue, mockTpl } from './mock';
import { Point, PointsTemplate, RawPoint, TPointTypes } from './models';
import { convertRawPointToPoint } from './utils';
import msg from '@/common/lang';
import { isProductEnv } from '@/common/const-scada';
const isZh = msg.isZh

const i18n = getPointConfigurationI18nMap()

export enum STATE {
    PENDING, COMPLETE
}
export enum RESULT {
    WAITTING, SUC, FAIL
}

type MemoryContent = {
    [key: string]: PointsTemplate
}

const idGenerator = (function* idGen() {
    while (true) {
        yield moment.now() + ''
    }
})()

const extractOkData = (res: any) => {
    if (daoIsOk(res)) {
        return res.data
    }
    throw new Error('res code error:' + res.code)
}

export const dao = {
    getObjects: () => _dao.getObjects().then(extractOkData),
    getModelsById: (domainId: string, modalId: string, isPublic: boolean = true) => _dao.getModelsById({
        domain_id: domainId,
        model_id: modalId,
        if_public: isPublic
    }).then(extractOkData),
    getPointsValue: (assetAlias: string | { alias: string; name: string; showName: string }[], points: (Point & { decimal?: number })[]) => {
        const req: any[] = [];
        points.map(p => {
            if (Array.isArray(assetAlias)) {
                assetAlias.map(s => {
                    const finalAlias = combineToFullAlias(s.alias, p.alias)
                    req.push({
                        id: "",
                        key: `1:${p.tableNo}:${finalAlias}:${p.fieldNo}`,
                        decimal: p.decimal || 3
                    });
                });
            } else {
                const finalAlias = combineToFullAlias(assetAlias, p.alias)
                req.push({
                    id: "",
                    key: `1:${p.tableNo}:${finalAlias}:${p.fieldNo}`,
                    decimal: p.decimal || 3
                });
            }
        })

        return _dao.getDynData(req, { f: 'baseinfo' }).then(extractOkData)
    }
}


export class DataStore {
    constructor(
        tplId: string,
        componentId: string,
        isMock: boolean = false,
        widgetName: string = 'BaseInfo',
        defaultTplName?: string
    ) {
        makeObservable(this);
        this.defaultTplName = defaultTplName
        this.isMock = isMock
        this.widgetName = widgetName
        this.memory = new Memory(Object.assign({}, getPageMemoryReq(), {
            description: getMemoryDesc(tplId, componentId)
        }))
    }
    
    private defaultTplName?: string
    private isMock: boolean
    private widgetName: string
    private memory: Memory

    @observable
    currentTplId?: string = ''

    @action
    setCurrentTplId = (tplId?: string) => {
        this.currentTplId = tplId;
    }

    @observable
    tplMap: MemoryContent | null = null

    @computed
    get tplList(): PointsTemplate[] {
        const list = Object.entries(this.tplMap || {}).map(v => {
            const [id, tpl] = v
            return tpl
        })
        return list
    }

    @action
    fetchTpls = (defaultShowNum?: number, defaultPoints?:string[]) => {
        if (this.isMock) {
            this.tplMap = Object.assign({}, mockTpl[this.widgetName])
            console.log('update mock content');
            return
        }

        return this.memory.init().then(v => {
            if (!v.isOk) {
                throw new Error('fetch memory error');
            }
            if (v.content.toString()) {
                return JSON.parse(v.content.toString()) as MemoryContent
            }
            return {}
        }).then(content => {
            if (/(^\?|.*\&)+?debug(\=.*|\&.*|\s)/.test(window.location.search)) {
                console.log(content);
            }

            const cfg = Object.entries(content);
            if (cfg.length === 0) {
                let finalDefaultTplName = defaultShowNum ?? 0;
                const id = idGenerator.next().value
                if(defaultPoints && defaultPoints.length > 0){
                    finalDefaultTplName = 0
                    this.nonStandardPoints = this.nonStandardPoints.map(p => {
                        if(defaultPoints.indexOf(p.key) > -1){
                            finalDefaultTplName += 1;
                            return {...p, ...{defaultSortIndex: defaultPoints.indexOf(p.key)}}
                        }else{
                            return {...p, ...{defaultSortIndex: 999999}}
                        }
                    }).sort((a, b) => {
                        return a.defaultSortIndex - b.defaultSortIndex
                    })
                }
                
                const newMap = Object.assign({}, this.tplMap, {
                    [id]: {
                        id: id,
                        name: this.defaultTplName || i18n('defaultTpl'),
                        name_en: this.defaultTplName || i18n('defaultTpl'),
                        points: NumberUtil.isValidNumber(finalDefaultTplName)
                            ? JSON.parse(JSON.stringify(this.nonStandardPoints.slice(0, Number(finalDefaultTplName))))
                                .map(p => {
                                    p.conf = {};
                                    return p;
                                })
                            : [],
                        type: 'default'
                    }
                })
                //this.memory.save(newMap)
                runInAction(() => {
                    this.currentTplId = id;
                    this.tplMap = newMap
                })
            } else {
                runInAction(() => {
                    // 重新刷新时保留当前模板
                    if (!this.currentTplId) {
                        this.currentTplId = cfg[0][0];
                    }

                    this.tplMap = content
                })
            }
        }).catch(e => console.error(e))
    }

    @action
    renameTpl = (id: string, name: string, name_en: string, cb?: () => void) => {
        if (!this.tplMap || !this.tplMap[id]) {
            console.error('no tpl found for', id);
            return
        }
        let nameParam: { name?: string, name_en?: string }
        if (isProductEnv) {
            nameParam = { name, name_en }
        } else {
            nameParam = isZh ? { name } : { name_en }
        }

        const newTpl = Object.assign({}, this.tplMap[id], nameParam)
        this.saveTpl(newTpl, cb)
    }

    @action
    saveTpl = async (tpl: Omit<PointsTemplate, 'id'> & { id?: string }, cb?: () => void) => {
        let isOk = false;
        let newMap = this.tplMap;
        if (this.isMock) {
            console.log('mock save', tpl)
        } else {
            if (this.tplList.length >= 6 && !tpl.id) {
                notify(i18n('save_overflow'))
                return
            }
            const tplId = tpl.id || idGenerator.next().value;
            newMap = Object.assign({}, newMap, { [tplId]: Object.assign(tpl, { id: tplId }) })
            isOk = await this.memory.save(newMap)
        }
        if (isOk) {
            notify(i18n('save_success'))
            this.tplMap = newMap;
            typeof cb === 'function' && cb();
        } else {
            notify(i18n('save_failed'))
        }
    }

    @action
    deleteTpl = async (id: string, cb?: () => void) => {
        if (!this.tplMap) {
            console.warn('no tpl found');
            return
        } else if (this.isMock) {
            console.log('mock delete');
        } else {
            let newTpLMap = {};
            Object.keys(this.tplMap).filter(k => k !== id).map(k => {
                newTpLMap[k] = this.tplMap![k];
            });
            const isOk = await this.memory.save(newTpLMap)
            if (isOk) {
                this.tplMap = newTpLMap;
                this.setCurrentTplId(Object.entries(this.tplMap)[0][0]);
                typeof cb === 'function' && cb();
            }
        }
    }

    @observable
    nonStandardPoints: Point[] = []

    @action
    fetchPoints = (
        firstDeviceAlias:string, 
        options?: {
            publicTypes?: TPointTypes,
            modelLevels?: number[]
        }
    ) => {
        if (this.isMock) {
            this.nonStandardPoints = mockNonStandPoints[this.widgetName]
            return
        }

        return _dao.getModelByObjectAlias({
            object_alias: firstDeviceAlias,
            type: '',
            is_sample: false
        })
        .then(res => {
            if (daoIsOk(res)) {
                return res.data
            }
            return [];
        })
        .then((data: RawPoint[]) => {
            runInAction(() => {
                this.nonStandardPoints = data
                    .filter(p => {
                        if(!options){
                            return true
                        }
                        const types = options.publicTypes
                        const typeFilterRes = !Array.isArray(types) || 
                            types.length === 0 || 
                            types.map(p => String(p)).indexOf(String(p.table_no)) > -1

                        const modelLevels = options.modelLevels
                        
                        const modelLevelRes = !Array.isArray(modelLevels) ||
                        (modelLevels.length > 0 &&
                        modelLevels.findIndex(l => l === p.model_level) >= 0)
                        return typeFilterRes && modelLevelRes
                    })
                    .map(p => convertRawPointToPoint(p))
            })
        })
    }

    @observable
    pointsValueMap: { [key: string]: IDyn } = {} // 此处key为Point的key，非PointValue key

    @action
    fetchPointsValue = (
        deviceAlias: string | { alias: string; name: string; showName: string }[],
        points: (Point & { decimal?: number })[]
    ) => {
        if (this.isMock) {
            this.pointsValueMap = mockPointsValue[this.widgetName]
            return
        }

        if (!Array.isArray(points) || points.length === 0) return;

        return dao.getPointsValue(deviceAlias, points).then(data => {
            const newMap = (data as IDyn[]).reduce((p, c) => {
                return {
                    ...p,
                    [c.key]: c
                }
            }, {})
            runInAction(() => {
                this.pointsValueMap = newMap
            })
        }).catch((e) => {
            console.error('fetch points value error', e);
            runInAction(() => {
                this.pointsValueMap = {}
            })
        })
    }

}

const useDataStore = ({
    defaultTplName
}: {
    defaultTplName?: string; 
}={}): DataStore => {
    const context = useWidgetContext()
    const cId = context.componentId
    const isDemo = context.isDemo
    const tplId = context.pageId || 'tplid'
    const widgetName = context.widgetName

    return useMemo(
        () => new DataStore(tplId, cId, isDemo, widgetName, defaultTplName),
        [tplId, cId, isDemo, defaultTplName]
    )
}
export default useDataStore
