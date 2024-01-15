import { _dao, daoIsOk } from "@/common/dao";
import { toNewestVersionTemplate } from "./DataAdapter";
import { CURRENT_VERSION, ProtoKeys } from "./constant";
import { Template, TemplateRuleType, TemplateType } from "./types";
import { getDataExportParams } from "./utils";
import { notify } from "Notify";
import { isZh } from "@/common/util-scada";
import { confirm } from "Modal"
import { msgTag } from "@/common/lang";

const msg = msgTag('paramsGenerator')

export const protoService = {
    mapKeyToType: (k: string) => k as TemplateRuleType,
    list: (): ProtoKeys[] => [ProtoKeys.points, ProtoKeys.SOE, ProtoKeys.warn, ProtoKeys.points_trend],
}

const getTypeCode = (type: TemplateType) => {
    switch (type) {
        case 'trend_analysis': return '7001'
        default: return '7000'
    }
}
export const templateService = {
    list: async (type: TemplateType): Promise<Template[]> => {
        const res = await _dao.memo('get', { type: getTypeCode(type), domain_id: '-1' }) as ScadaResponse<IUserPreference[]>

        if (daoIsOk(res)) {
            const tpls: Template[] = []
            res.data.forEach(d => {
                try {
                    const tplContent = toNewestVersionTemplate(JSON.parse(d.content))
                    tpls.push({
                        ...tplContent,
                        key: d.id
                    })
                } catch (e) {
                    console.error('parse template error', e, d.content)
                }
            })
            return tpls
        }
        console.error('res not ok');
        return []
    },
    add: async (tpl: Omit<Template, 'key'>, type: TemplateType, domainInfos: IDomainInfo[]) => {
        if (tpl.isDefault) {
            await templateService.resetDefault(type, domainInfos)
        }
        const res = await _dao.memo('insert', {
            type: getTypeCode(type),
            domain_id: '-1',
            content: JSON.stringify(Object.assign({}, tpl, {
                version: CURRENT_VERSION,
                dataExportParams: type === 'data_export' ? getDataExportParams(tpl, domainInfos) : undefined
            })),
            is_desc: 1,
            description: tpl.name,
            is_desc_uni: 1
        })

        if (res.code === '20002') {
            return new Promise<string | undefined>((res, rej) => {
                confirm({
                    title: msg('templateSelector.replaceTitle'),
                    content: msg('templateSelector.replaceContent'),
                    onCancel() {
                        res(undefined)
                    },
                    onOk: async () => {
                        const existsTpl = (await templateService.list(type)).find(t => t.name === tpl.name)
                        if (existsTpl) {
                            const result = await templateService.update(Object.assign({}, tpl, { key: existsTpl.key }), type, domainInfos)
                            if (result) {
                                res(result.key)
                                return
                            }
                        }
                        console.error('update tpl failed, name:', tpl.name)
                        res(undefined)
                    },
                })
            })
        }

        return 'id' in res ? res.id : undefined
    },
    update: async (tpl: Template, type: TemplateType, domainInfos: IDomainInfo[]): Promise<Template | undefined> => {
        if (tpl.isDefault) {
            await templateService.resetDefault(type, domainInfos)
        }
        const res = await _dao.memo('update', {
            id: tpl.key,
            type: getTypeCode(type),
            domain_id: '-1',
            content: JSON.stringify(Object.assign({}, tpl, {
                version: CURRENT_VERSION,
                dataExportParams: type === 'data_export' ? getDataExportParams(tpl, domainInfos) : undefined
            })),
            is_desc: 1,
            description: tpl.name,
            is_desc_uni: 1
        })

        if (res.code === '20002') {
            return new Promise((res, rej) => {
                confirm({
                    title: msg('templateSelector.replaceTitle'),
                    content: msg('templateSelector.replaceContent'),
                    onCancel() {
                        res(undefined)
                    },
                    onOk: async () => {
                        const existsTpl = (await templateService.list(type)).find(t => t.name === tpl.name)
                        if (existsTpl) {
                            const result = await templateService.update(Object.assign({}, tpl, { key: existsTpl.key }), type, domainInfos)
                            res(result)
                        } else {
                            console.error('update tpl failed, name:', tpl.name)
                            res(undefined)
                        }
                    },
                })
            })
        }

        return daoIsOk(res) ? tpl : undefined
    },
    delete: async (key: string, type: TemplateType) => {
        const res = await _dao.memo('delete', {
            id: key,
            type: getTypeCode(type)
        })
        return daoIsOk(res) as boolean
    },
    /* 将所有模板设置为非默认 */
    resetDefault: async (type: TemplateType, domainInfos: IDomainInfo[]) => {
        const allTpl = await templateService.list(type)
        const tplsToUpdate = allTpl.filter(t => t.isDefault)
        return Promise.all(tplsToUpdate.map(tpl =>
            templateService.update(Object.assign({}, tpl, { isDefault: false }), type, domainInfos)
        ))
    }
}

export const modelService = {
    getPointsByModel: async (domainId: string, modelId: string) => {
        const res = await _dao.getModelsById({
            domain_id: domainId,
            model_id: modelId,
            if_public: false
        })

        if (daoIsOk(res)) {
            return res.data
        }
        console.error('get point error, res not ok');
        return []
    }
}
