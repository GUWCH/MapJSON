import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import { FontIcon, Icon2, IconType } from 'Icon';
import { Checkbox, Input, Tabs, Select } from "antd";
import { CaretDownOutlined  } from "@ant-design/icons";
import { AutoSizer, List } from "react-virtualized";
import EnvLoading from "EnvLoading";
import { ConfigModal } from 'Modal';
import { PointSelect, StylePanel, StyleRow } from '@/components';
import { INPUT_I18N } from '@/components/InputI18n';
import DropDown, { DropDownComponentType } from 'DropDown';
import { useRecursiveTimeoutEffect } from "ReactHooks";
import CommonDynData from "DynData";
import { CommonTimerInterval } from "@/common/const-scada";
import { useMemoryStateCallback } from '@/common/util-memory';
import { getAssetAlias, isOtherDeviceType, DEVICE_TYPE, BAY_TYPE, NumberUtil } from '@/common/utils';
import { getPointKey, InputTextSize } from "@/common/constants";
import { msgTag, isZh } from '@/common/lang';
import { _dao, daoIsOk } from "@/common/dao";
import PageCard, { PageCardConfig } from '@/components_utils/Card';
import { ObjectModel, DomainModel, PointModel, uIdKey } from '@/components_utils/models';
import styles from './style.mscss';

export { default as RankListForm } from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值或空对象。
export interface IRankListDefaultOptions {
    
};

export const RankListDefaultOptions: IRankListDefaultOptions = {
    
};

export interface IRankListCfg extends PageCardConfig {
    customAssetAlias?: string;
    rankModels: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel[];
    };
    rankCount: number | string;
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const RankListDefaultCfg: IRankListCfg = {
    customAssetAlias: '',
    rankModels: {},
    rankCount: 5
};

type CacheAsset = {
    modelId: string;
    [INPUT_I18N.ZH_CN]?: string;
    [INPUT_I18N.EN_US]?: string;
    icon?: keyof typeof IconType;
    points?: TCachePoint[]
};

type RankListCache = {
    userTitle?: {
        enabled?: boolean;
        [INPUT_I18N.ZH_CN]?: string;
        [INPUT_I18N.EN_US]?: string;
    };
    typeMapList?: CacheAsset[]
};

const defaultCacheConfig: RankListCache = {
    userTitle: {
        enabled: true,
        [INPUT_I18N.ZH_CN]: '',
        [INPUT_I18N.EN_US]: '',
    },
    typeMapList: []
};

const i18n = msgTag('pagetpl');
const POINT_NAME_KEY = isZh ? 'nameCn' : 'nameEn';

export const RankList: WidgetElement<IRankListCfg> = (widgetProps) =>{
    const {editable = true, id, isDemo, configure, assetAlias, pageId, scale} = widgetProps;
    const { customAssetAlias, title, title_en, rankCount, rankModels } = configure;
    const finalAssetAlias = getAssetAlias(assetAlias, customAssetAlias);
    // 组态时不需要执行
    const [cacheConfig, setCacheConfig] = useMemoryStateCallback<RankListCache>(defaultCacheConfig, pageId, id, !isDemo);
    const [mounted, setMounted] = useState<boolean>(!!isDemo);
    const [ownedObjids, setOwnedObjids] = useState<string[]>([]);

    if(!isDemo){
        useEffect(() => {    
            (async () => {
                if(finalAssetAlias){
                    const res = await _dao.getObjectByNodeAlias(finalAssetAlias);
                    if(daoIsOk(res)){
                        setOwnedObjids(res.data.map(d => d.model_id));
                    }
                    setMounted(true);
                }
            })();
        }, [finalAssetAlias]);
    }

    const onOK = useCallback((newCache: RankListCache) => {
        setCacheConfig(newCache);
    }, [setCacheConfig]);

    const useTitle = cacheConfig.userTitle || {};
    const useTitleEnable = useTitle.enabled;

    const filterRankModels = isDemo
    ? rankModels 
    : useMemo(() => {
        if(isDemo) return rankModels;

        const temp = JSON.parse(JSON.stringify(rankModels));
        if(temp.selectedObject){
            temp.selectedObject = temp.selectedObject.filter(o => ownedObjids.indexOf(o.model_id) > -1);
        }
        return temp;
    }, [rankModels, ownedObjids]);

    const filterCacheConfig = isDemo 
    ? {
        typeMapList: rankModels.selectedObject?.map(o => {
            return {
                modelId: o.model_id,
                points: o.selectedPoint?.map(p => {
                    return {
                        key: p[uIdKey]
                    }
                })
            }
        })
    }
    : useMemo(() => {
        const temp = JSON.parse(JSON.stringify(cacheConfig));
        if(temp.typeMapList){
            temp.typeMapList = temp.typeMapList.filter(o => ownedObjids.indexOf(o.modelId) > -1);
        }
        return temp;
    }, [cacheConfig, ownedObjids]);

    if(!isDemo && !mounted) return null;

    return <>
        <PageCard 
            {...configure}
            title={useTitleEnable ? useTitle[INPUT_I18N.ZH_CN] || title : undefined}
            title_en={useTitleEnable ? useTitle[INPUT_I18N.EN_US] || title_en : undefined}
            extra={
                editable && 
                <RankListSet 
                    rankModels={filterRankModels}
                    cache={filterCacheConfig}
                    onOK={onOK}
                />
            }
        >
            <RenderCore 
                isDemo={isDemo} 
                nodeAlias={finalAssetAlias} 
                rankCount={rankCount} 
                rankModels={filterRankModels} 
                cacheObjects={filterCacheConfig.typeMapList}
            />
        </PageCard>
    </>
}

const RenderCore = (props: Partial<IRankListCfg> & {
    isDemo?: boolean;
    nodeAlias: string;
    cacheObjects?: CacheAsset[];
}) => {
    const { isDemo, nodeAlias, rankCount, rankModels, cacheObjects } = props;

    const objects = useMemo(() => {
        const models = rankModels?.selectedObject??[];
        return models;
    }, [rankModels]);
    const objectMap: {[k: string]: ObjectModel} = useMemo(() => {
        return objects.reduce((a, b) => {
            a[b.model_id] = b;
            return a;
        }, {});
    }, [objects]);
    const validCacheObjects = useMemo(() => {
        return (cacheObjects || []).filter(obj => !!objectMap[obj.modelId]);
    }, [cacheObjects, objectMap]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [objectId, setObjectId] = useState<string>(validCacheObjects[0]?.modelId);
    const [operateMap, setOperateMap] = useState<{[k: string]: {pointKey: string; desc: {[k: string]: boolean}}}>({});
    const [rankData, setRankData] = useState<IResListDevice[]>([]);
    const [maxAbsVal, setMaxAbsVal] = useState<number>();
    const mainContainer = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<{width: number; height: number;}>({width: 0, height: 0});

    if(isDemo){
        useEffect(() => {
            // mock data
            /*
            if(rankData.length === 0){                
                const pointKey = (validCacheObjects.find(obj => obj.modelId === objectId)?.points??[])[0]?.key;
                setOperateMap(o => {
                    o[objectId] = {pointKey, desc: {}};
                    return JSON.parse(JSON.stringify(o));
                });
    
                if(pointKey){
                    const dataKey = pointKey.split('__[###]__').slice(1).join(':');
                    const mockData = Array.from(Array(rankCount)).map((d, ind) => ({
                        ["WTG.Alias"]: 'demo' + (ind + 1),
                        ["WTG.Name"]: 'demo' + (ind + 1),
    
                        ['Farm.Name']: 'demo',
                        feederAlias: '',
                        feederName: '',
                        phaseAlias: '',
                        phaseName: '',
                        [dataKey]: String(parseInt(String(Math.random() * 1000)))
                    }));
                    setRankData(mockData);
                } 
               
            }
            */
        }, [rankCount, objectId, validCacheObjects, rankData, setRankData, setOperateMap]);
    }

    useEffect(() => {
        if (mainContainer.current) {
            const observeElement = mainContainer.current;
            const resizeOb = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                setContainerSize({width: entry.contentRect.width, height: entry.contentRect.height});
            });

            observeElement && resizeOb.observe(observeElement);
            return () => {
                resizeOb.disconnect();
            }
        }
    }, []);

    const parsePointKey = useCallback((pKey?: string): [string, string[]] => {
        const pointParams = pKey?.split('__[###]__') || [];
        return [`${pointParams[1]}:${pointParams[2]}`, pointParams];
    }, []);

    const curPointKey = operateMap[objectId]?.pointKey;
    const curDesc = (operateMap[objectId]?.desc??{})[curPointKey];

    useEffect(() => {
        // 配置改变后当前如果存在保留,否则置空
        let obj = validCacheObjects.find(o => o.modelId === objectId);
        if(!obj){
            setOperateMap({});
            setObjectId(validCacheObjects[0]?.modelId);
        }else{
            setOperateMap(ope => {
                let point = obj?.points?.find(p => p.key === curPointKey);
                if(!point){
                    return {};
                }else{
                    return {[objectId]: {pointKey: curPointKey, desc: {[curPointKey]: point.attrs?.sort === 'desc'}}}
                }
            });
        }
    }, [validCacheObjects]);

    useEffect(() => {
        if(!objectId)return;
        
        const prevPointKey = operateMap[objectId]?.pointKey;
        if(!prevPointKey){
            const point = (validCacheObjects.find(obj => obj.modelId === objectId)?.points??[])[0];
            if(point){
                setOperateMap(operateMap => {
                    const temp = {...operateMap};
                    temp[objectId] = temp[objectId] || {};
                    temp[objectId].pointKey = point?.key;
                    temp[objectId].desc = temp[objectId].desc || {};
                    temp[objectId].desc[point?.key] = point.attrs?.sort === 'desc';
                    return temp;
                });
            }
        }
    }, [objectId, operateMap]);

    useRecursiveTimeoutEffect(() => {
        setRankData([]);
        setMaxAbsVal(undefined);

		if(isDemo || !objectId || !curPointKey || !nodeAlias) return;

        const curObj = objects.find(o => o.model_id === objectId);
        
        if(!curObj) return;

        setIsLoading(true);
        const [dataKey, pointParams] = parsePointKey(curPointKey);
        const isFarm = String(curObj.table_no) === '4';
        const deviceType = `${curObj.table_no}_${curObj.type}`;

        const req = {
            data_level: isFarm ? 'farm' : isOtherDeviceType(deviceType) ? 'device' : String(curObj.type),
            device_type: isOtherDeviceType(deviceType) ? deviceType : '',
            filter_bay_type: deviceType === DEVICE_TYPE.INVERTER 
                ? BAY_TYPE.INVERTER_STR
                : (deviceType === DEVICE_TYPE.DC_COMBINER ? BAY_TYPE.AC_COMBINER_STR: ''),
            root_nodes: nodeAlias,
            paras: [{
                type: pointParams[1],
                field: Number(pointParams[2] || ''),
                decimal: 3,
                table_no: Number(pointParams[0])
            }],
            farm_type: isFarm ? curObj.type : '',
            page_num: 1,
            row_count: rankCount,
            order_by: dataKey,
            is_asc: Number(!curDesc),
            tree_grid: false,
            need_color: 'true'
        }

		return [()=>{
			return _dao.getDeviceList(req);
		}, (res: ScadaResponse<IResListDevice[]>)=>{
			if(daoIsOk(res)){
                // debug
                /* res.data = res.data.map((d,ind) => {
                    d[dataKey] = ind === 0 ? '0' : ind%2===1 ? '-'+ d[dataKey]: d[dataKey];
                    return d;
                }).sort((a,b) => Number(NumberUtil.removeCommas(a[dataKey])) < NumberUtil.removeCommas(b[dataKey]) ? 1 : -1); */
                
                const numArr = res.data
                .map(d => {
                    const valRemoveColor = (d[dataKey] || '').split('::')[0];
                    const val = NumberUtil.removeCommas(valRemoveColor);
                    return NumberUtil.isValidNumber(val) ? Number(val) : val;
                })
                .filter(d => NumberUtil.isValidNumber(d))
                .map(d => Math.abs(d as number));
                if(numArr.length > 0){
                    setMaxAbsVal(NumberUtil.numberArrMax(numArr));
                }
                setRankData(res.data);
			}
            setIsLoading(false);
		}]
	}, isDemo ? -1 : CommonTimerInterval as number, [objectId, curPointKey, curDesc, nodeAlias, rankCount, objects, isDemo]);

    const changeTab = (objId) => {
        if(objectId !== objId){
            setObjectId(objId);
        }        
    };

    const changePoint = (pointKey) => {
        const point = (validCacheObjects.find(obj => obj.modelId === objectId)?.points??[]).find(p => p.key === pointKey);
        if(point){
            setOperateMap(operateMap => {
                const temp = {...operateMap};
                temp[objectId] = {...(temp[objectId] || {}), pointKey: pointKey};
                temp[objectId].desc = temp[objectId].desc || {};
                if(!temp[objectId].desc.hasOwnProperty(pointKey)){
                    temp[objectId].desc[pointKey] = point.attrs?.sort === 'desc';
                }
                return temp;
            });
        }        
    };

    const changeOrder = () => {
        if(curPointKey){
            setOperateMap(operateMap => {
                const temp = {...operateMap};
                temp[objectId] = temp[objectId] || {};
                temp[objectId].desc = temp[objectId].desc || {};
                temp[objectId].desc[curPointKey] = !curDesc;
                return temp;
            });
        }
    };

    const curCacheObj = validCacheObjects.find(obj => obj.modelId === objectId);
    const { selectedPoint=[] } = objectMap[objectId] || {};
    const [dataKey, pointParams] = parsePointKey(curPointKey);
    const curPoint = selectedPoint.find(p => p[uIdKey] === curPointKey);
    const attrs = (curCacheObj?.points??[]).find(p => p.key === curPointKey)?.attrs;
    const rowHeight = Number(styles.rowHeight || 62);

    const rowRender = (d: IResListDevice, ind: number, style?: React.CSSProperties) => {
        if(!curPoint) return null;

        const texts = (d[dataKey]??'').split('::');
        const val = texts[0];
        const fillColor = texts[1] || '';
        const lineColor = texts[2] || '';

        const removeCommaVal = NumberUtil.removeCommas(val);
        const progressStyle = {width: '0%'};
        let isNegative = false;

        if(NumberUtil.isValidNumber(removeCommaVal)){
            const valNumber = Number(removeCommaVal);
            if(typeof maxAbsVal === 'number'){
                progressStyle.width = ((maxAbsVal === 0 ? 1 : Math.abs(valNumber) / maxAbsVal) * 100) + '%';
            }
            if(valNumber < 0){
                isNegative = true;
            }
        }

        return <div className={styles.rankRow} key={d["WTG.Alias"]} style={style}>
            <div>
                <span>
                    <span className={`${styles.no}${ind < 3 ? ` ${styles.top}` : ''}`}>{`No.${ind + 1}`}</span>
                    {curCacheObj?.icon && <FontIcon type={IconType[curCacheObj?.icon]} />}
                    <span className={styles.rankName} title={d["WTG.Name"]}>
                        {d["WTG.Name"]}
                    </span>
                </span>
                <span>
                    <CommonDynData 
                        point={{
                            aliasKey: getPointKey(curPoint, d["WTG.Alias"]),
                            tableNo: curPoint.table_no || '',
                            fieldNo: curPoint.field_no || '',
                            nameCn: curPoint.name_cn || '',
                            nameEn: curPoint.name_en || '',
                            unit: curPoint.unit || '',
                        }}
                        value={val}
                        valueBackground={fillColor}
                        valueColor={lineColor}
                        transform={attrs}
                        showName={false}
                        valueCls={styles.value}
                        unitCls={styles.unit}
                    />
                </span>
            </div>
            <div className={`${styles.progress}`}>
                <div style={progressStyle} className={`${isNegative ? styles.negative : ''}`}></div>
            </div>
        </div>
    }

    return <div className={styles.wrap}>
        {
            validCacheObjects.length > 1 && <Tabs
                className={styles.tab}
                tabBarGutter={10}
                activeKey={objectId}
                onTabClick={changeTab}
            >
                {
                    validCacheObjects.map(cacheObj => {
                        const obj = objectMap[cacheObj.modelId];
                        const name = cacheObj[isZh ? INPUT_I18N.ZH_CN : INPUT_I18N.EN_US];
                        const rawName = obj[isZh ? 'model_name_cn' : 'model_name'];
                        const icon = cacheObj.icon;
                        return <Tabs.TabPane
                            tab={<span className={styles.tabHeader}>
                                {icon && <FontIcon type={IconType[icon]} style={{marginRight: 5}}/>}
                                {name || rawName}
                            </span>}
                            key={cacheObj.modelId}
                        >
                        </Tabs.TabPane>
                    })
                }
            </Tabs>
        }
        <div className={styles.mainTop}>
            <Select
                showSearch={false}
                onChange={changePoint}
                value={curPointKey}
                options={curCacheObj?.points?.filter(p => !!selectedPoint.find((s: PointModel) => s[uIdKey] === p.key)).map(p => {
                    const pModel: PointModel = selectedPoint.find((s: PointModel) => s[uIdKey] === p.key);
                    const pTitle = p.attrs?.[POINT_NAME_KEY];
                    const pRawTitle = pModel[isZh ? 'name_cn' : 'name_en'];
                    return {
                        label: pTitle || pRawTitle,
                        value: p.key
                    }
                })}
                bordered={false}
                suffixIcon={<CaretDownOutlined style={{
                    fill: 'red'
                }}/>}
                className={styles.mainTopSelect}
                dropdownMatchSelectWidth={true}
            />
            <FontIcon 
                type={curDesc ? IconType.DESCENDING : IconType.ASCENDING} 
                onClick={changeOrder}
                style={{cursor: 'pointer'}}
            />
        </div>
        <div className={styles.main} ref={mainContainer}>
            {
                rankData.length > 100 ?<List
                    overscanRowCount={5}
                    rowCount={rankData.length}
                    rowHeight={rowHeight}
                    rowRenderer={({index, style}) => {                            
                        return rowRender(rankData[index], index, style);
                    }}
                    width={containerSize.width}
                    height={containerSize.height}
                /> : rankData.map((d, ind) => {
                    return rowRender(d, ind);
                })
            }
        </div>
        <EnvLoading isLoading={isLoading}/>
    </div>
}


type RankListSetProps = Pick<IRankListCfg, 'rankModels'> & {cache: RankListCache, onOK?: Function};
const RankListSet = (props: RankListSetProps) => {
    const [showSet, setShowSet] = useState(false);
    const [newCache, setNewCache] = useState<RankListCache>({});

    useEffect(() => {
        setNewCache(JSON.parse(JSON.stringify(props.cache)));
    }, [props.cache]);

    const objects = props.rankModels?.selectedObject??[];
    const { userTitle={}, typeMapList=[] } = newCache;

    return <>
        <Icon2 type={IconType.CONFIG} onClick = {() => setShowSet(true)}></Icon2>
        {
            showSet && 
            <ConfigModal
                visible={showSet}
                bodyStyle={{
                    height: window.innerHeight - 400
                }}
                title={i18n('COMMON.TXT_CONFIG')}
                onReset={()=>{
                    setNewCache(JSON.parse(JSON.stringify(props.cache)));
                }}
                onCancel={() => {
                    setShowSet(false);
                    setNewCache(JSON.parse(JSON.stringify(props.cache)));
                }}
                onOk={() => {
                    typeof props.onOK === 'function' && props.onOK(newCache);
                    setShowSet(false);
                }}
            >                
                <div className={styles.setPanel}>
                    <StylePanel>
                        <StyleRow>
                            <span>{i18n('RANK.showTitle')}</span>
                            <Checkbox 
                                checked = {userTitle.enabled}
                                onChange = {(e) => {
                                    setNewCache((old) => {
                                        return Object.assign({}, old, {userTitle: Object.assign({}, userTitle, {enabled: e.target.checked})});
                                    });
                                }}
                            />
                        </StyleRow>
                        <StyleRow>
                            <span>{i18n('RANK.title')}</span>
                            <Input
                                size="small"
                                value={userTitle[isZh ? INPUT_I18N.ZH_CN : INPUT_I18N.EN_US]}
                                onChange = {(e) => {
                                    const titleKey = isZh ? INPUT_I18N.ZH_CN : INPUT_I18N.EN_US;
                                    const newTitle = e.target.value;
                                    setNewCache((old) => {
                                        return Object.assign({}, old, {userTitle: Object.assign({}, userTitle, {[titleKey]: newTitle})});
                                    });
                                }}
                                maxLength={InputTextSize.Simple}
                                style={{width: '50%'}}
                            />
                        </StyleRow>
                    </StylePanel>

                    <StylePanel>
                        <StyleRow>
                            <span>{i18n('RANK.showFigure')}</span>
                        </StyleRow>
                        <PointSelect 
                            limitNum={-1} 
                            selectedData = {typeMapList.filter(t => {
                                const modelId = t.modelId;
                                const typeData = objects.find(o => o.model_id === modelId) as ObjectModel;

                                return !!typeData;
                            }).map(t => {
                                const modelId = t.modelId;
                                const typeData = objects.find(o => o.model_id === modelId) as ObjectModel;

                                return {
                                    title: (isZh ? typeData.model_name_cn : typeData.model_name) || '',
                                    key: modelId,
                                    dropDownContent: <DropDown 
                                        data={t}
                                        content = {[{
                                            name: i18n('COMMON.SHOW_NAME'),
                                            members: [{
                                                component: DropDownComponentType.INPUT,
                                                key: isZh ? INPUT_I18N.ZH_CN : INPUT_I18N.EN_US,
                                                maxLength: InputTextSize.Simple
                                            }]
                                        }, {
                                            name: i18n('COMMON.ICON'),
                                            members: [{
                                                component: DropDownComponentType.ICON,
                                                key: 'icon',
                                            }]
                                        }, {
                                            members: [{
                                                component: DropDownComponentType.CUSTOM,
                                                key: 'points',
                                                customRender: <RenderPoint 
                                                    key={'points'}
                                                    modelPoint={typeData.selectedPoint as PointModel[]} 
                                                    cachePoint={t.points as TCachePoint[]}
                                                    onChange={(selPointList) => {
                                                        setNewCache((old) => {
                                                            const oldTypeMapList = old.typeMapList || [];
                                                            const oldTypeDataIndex = oldTypeMapList.findIndex(t => t.modelId === modelId);

                                                            const oldPoints = oldTypeMapList[oldTypeDataIndex].points;
                                                            const oldPointsMap = {};
                                                            oldPoints?.map(p => {
                                                                oldPointsMap[p.key] = p;
                                                            });
                                                            oldTypeMapList[oldTypeDataIndex].points = selPointList.map(p => {
                                                                return Object.assign({}, oldPointsMap[p.key], {key: p.key});
                                                            });

                                                            return Object.assign({}, old, {typeMapList: oldTypeMapList});
                                                        });
                                                    }}
                                                    onChangeAttr={(newAttr, point) => {
                                                        setNewCache((old) => {
                                                            const oldTypeMapList = old.typeMapList || [];
                                                            point.attrs = Object.assign({}, point.attrs, newAttr);

                                                            return Object.assign({}, old, {typeMapList: oldTypeMapList});
                                                        });
                                                    }}
                                                />
                                            }]
                                        }]}
                                        onChange = {(obj) => {
                                            setNewCache((old) => {
                                                const oldTypeMapList = old.typeMapList || [];
                                                const oldTypeDataIndex = oldTypeMapList.findIndex(t => t.modelId === modelId);
                                                oldTypeMapList[oldTypeDataIndex] = Object.assign({}, oldTypeMapList[oldTypeDataIndex], obj);
                                                return Object.assign({}, old, {typeMapList: oldTypeMapList});
                                            });
                                        }}
                                    />
                                }
                            })} 
                            options = {objects.map(o => {
                                const modelId = o.model_id;
                                return {
                                    id: modelId,
                                    key: modelId,
                                    title: (isZh ? o.model_name_cn : o.model_name) || '',
                                    value: modelId,
                                    needLabelShow: true
                                }
                            })} 
                            onChange = {(args: {key: string}[]) => {
                                setNewCache((old) => {
                                    const typeMap = {};
                                    (old.typeMapList || []).map(type => {
                                        typeMap[type.modelId] = type;
                                    });
                                    return Object.assign({}, old, {typeMapList: args.map((o) => {
                                        return Object.assign({}, {modelId: o.key}, typeMap[o.key]);
                                    })});
                                });
                            }}
                            needDelete = {true}
                            needSelect = {true}
                            selectStyle={{width: '100%'}}
                            treeProps = {{
                                treeDefaultExpandAll: true,
                            }}
                            dropDownStyle = {{width: "100%", minWidth: 0}}
                        />
                    </StylePanel>
                </div>
            </ConfigModal>
        }
    </>
}

const RenderPoint = (props: {
    modelPoint: PointModel[];
    cachePoint: TCachePoint[];
    onChange: (data: {key: string}[]) => void;
    onChangeAttr: (attr: any, oldAttr: any) => void;
}) => {
    const { modelPoint=[], cachePoint=[], onChange, onChangeAttr } = props;

    return <PointSelect 
        limitNum={-1} 
        selectedData = {cachePoint.filter(o => {
            const id = o.key;
            const curPoint = modelPoint.find(p => p[uIdKey] === id);

            return !!curPoint;
        }).map(o => {
            const id = o.key;
            const curPoint = modelPoint.find(p => p[uIdKey] === id);

            return {
                title: (isZh ? curPoint?.name_cn : curPoint?.name_en) || '',
                key: id,
                dropDownContent: <DropDown 
                    key={id}
                    data={o.attrs || {}}
                    content = {[{
                        name: i18n('COMMON.SHOW_NAME'),
                        members: [{
                            component: DropDownComponentType.INPUT,
                            key: POINT_NAME_KEY,
                            maxLength: InputTextSize.Simple
                        }]
                    }, {
                        name: i18n('RANK.sort'),
                        members: [{
                            component: DropDownComponentType.SELECT,
                            defaultFirstOption: true,
                            key: 'sort',
                            options: [{
                                name: i18n('RANK.asc'),
                                value: 'asc'
                            },{
                                name: i18n('RANK.desc'),
                                value: 'desc'
                            }]
                        }]
                    }, {
                        members: [{
                            component: DropDownComponentType.CONDITION,
                            key: 'convert',
                            type: 'convert',
                        }]
                    }]}
                    onChange = {(args) => {
                        onChangeAttr(args, o);
                    }}
                />
            }
        })} 
        options = {modelPoint.map(o => {
            const id = o[uIdKey] as string;
            return {
                id: id,
                key: id,
                title: (isZh ? o.name_cn : o.name_en) || '',
                value: id,
                needLabelShow: true
            }
        })} 
        onChange = {(args: {key: string}[]) => {
            onChange(args);
        }}
        needDelete = {true}
        needSelect = {true}
        selectStyle={{width: '100%'}}
        treeProps = {{
            treeDefaultExpandAll: true,
        }}
        dropDownStyle = {{width: "100%", minWidth: 0}}
    />
}

