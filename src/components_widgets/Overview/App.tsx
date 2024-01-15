import React, { useEffect, useState, useRef } from "react"
import PageCard  from '../../components_utils/Card'
import { Observer } from 'mobx-react';
import Intl, { msgTag } from '@/common/lang';
import { getAssetAlias } from '@/common/utils';
import { LegalData, _dao } from '@/common/dao';
import { getPointKey } from '@/common/constants';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import {TimerInterval} from '@/common/const-scada';
import DynData, {CommonDynLayout} from 'DynData';
import EllipsisToolTip from 'EnvEllipsisTooltip';
import SetModal from 'SetModal';
import { FontIcon, Icon2, IconType } from "Icon";
import {DropDown} from '@/components';
import {useMemoryStateCallback} from '@/common/util-memory';
import {groupByTableNo, getStyleValue, gradient} from '@/common/util-scada';
import {PointModel, DomainModel, ObjectModel} from '../../components_utils/models';
import {defaultCardProps} from '@/components_utils/Card/form';
import {
    DEFAULT_MEMORY_CFG,
    defaultPointProps, 
    getPointDropDown, 
    pointTypes, 
    getQuotaKey,
    SHOW_TYPES,
    WIDGET_SET,
    otherType
} from './constants';

import styles from './style.mscss';
import _ from "lodash";

const msg = msgTag('pagetpl');
const isZh = Intl.isZh;

type StyleType = 'icon' | 'droplet' | 'progressBar';

export interface OverviewItem {
    limitNum?: number,
    defaultStyle?: {
        icon: string,
        color: string
    },
    colNum?: number,
    type?: StyleType,
    numFont?: 'defaultFont' | 'dsDigitalFont', 
    model?: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel;
    },
    otherModelList? : {
        key: string,
        customAssetAlias: string,
        selectedDomain?: DomainModel,
        selectedObject?: ObjectModel,
    }[]
}

interface IOverviewInfoCfg extends CommonConfigure {
    overviewProps?: OverviewItem[]
}

interface otherModelItem {
    key: string,
    customAssetAlias: string,
    selectedDomain?: DomainModel | null,
    selectedObject?: ObjectModel | null,
}

interface InputCfgItem {
    type?: StyleType;
    numFont?: 'defaultFont' | 'dsDigitalFont';
    colNum?: number;
    limitNum?: number;

    /** defaultStyle代表外部传入时作为默认配置显示 */
    points?: (PointModel & {defaultStyle?: object})[];
    otherModelList?: otherModelItem[]
}

interface ExternalCfg extends CommonConfigure {
    cfg: InputCfgItem[]
}

type CfgItem = {
    type: StyleType,
    selected: PointModel[]
}

type MemoryTitle = {
    titleEnable?: boolean,
    titleTextEn?: string,
    titleTextCn?: string,
}

interface Cfg extends MemoryTitle {
    items?: CfgItem[]
};

const labelPoints = (curSetCfg, onAttriChange, isIcon: boolean) => {
    return (curSetCfg || []).map((point, index) => {
        let {
            edictNameCn, 
            edictNameEn, 
            icon,
            color, 
            convert,
            needConvert = true
        } = Object.assign({}, defaultPointProps, point);
        return {
            title: isZh ? point.name_cn : point.name_en,
            key: point.key,
            dropDownContent: <DropDown 
                key = {index}
                data = {{
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    color: color,
                    convert: convert,
                    icon: icon
                }}
                content = {getPointDropDown(needConvert, isIcon)}
                onChange = {(attri) => onAttriChange(point.key, attri)}
             />
        };
    })
}

const getOptions = (curNodePoints = [], otherModelList: otherModelItem[] = []) => {
    let chartOptions: any[] = [];
    let temp = groupByTableNo((curNodePoints || []).map((point) => {
        const {name_cn, name_en, table_no} = point;
        return {
            name: isZh ? name_cn : name_en,
            key : getQuotaKey(point),
            tableNo: table_no
        }
    }), pointTypes, otherType, false);

    const typeKeyList = [...pointTypes, otherType].map(t => t.typeKey);
    temp.map(t => {
        if(typeKeyList.indexOf(t.key) > -1){
            return t.pId = 'self';
        }
    })
    chartOptions = [...temp];
    if(chartOptions.length > 0){
        chartOptions.push({
            id: "self",
            key: "self",
            title: msg('OVERVIEW.self'),
            value: "self"
        });
    }
    
    let uniqueKeyList = [];

    otherModelList.map(item => {
        const {customAssetAlias, selectedDomain, selectedObject, key: categoryKey} = item;
        const {domain_id} = selectedDomain || {};
        const {model_id, model_name, model_name_cn, selectedPoint} = selectedObject || {}
        if(customAssetAlias && domain_id && model_id && selectedPoint && selectedPoint.length > 0){
            // const categoryKey = customAssetAlias + '-' + domain_id + '-' + model_id;

            if(uniqueKeyList.indexOf(categoryKey) === -1){
                uniqueKeyList.push(categoryKey);
                const typeKeyList = [...pointTypes, otherType].map(t => categoryKey + '-' + t.typeKey);
                const newPointTypes = [...pointTypes].map(t => {
                    return Object.assign({}, t, {typeKey: categoryKey + '-' + t.typeKey})
                });
                const newOtherType = Object.assign({}, otherType, {typeKey: categoryKey + '-' + otherType.typeKey});

                let temp = groupByTableNo(selectedPoint.map((point) => {
                    const {name_cn, name_en, key, table_no} = point;
                    return {
                        name: isZh ? name_cn : name_en,
                        key : categoryKey + '-' + getQuotaKey(point),
                        tableNo: table_no
                    }
                }), newPointTypes, newOtherType, false);

                temp.map(t => {
                    if(typeKeyList.indexOf(t.key) > -1){
                        return t.pId = categoryKey;
                    }
                })
                chartOptions = chartOptions.concat(temp);
                chartOptions.push({
                    id: categoryKey,
                    key: categoryKey,
                    title: isZh && model_name_cn ? model_name_cn : model_name,
                    value: categoryKey
                });
            }
        }
    })

    return chartOptions;
}

const getContent = (projectCfg, curSetCfg, onAttriChange, onChange, onOtherAttriChange) => {

    const {titleEnable, titleTextEn, titleTextCn, items = []} = curSetCfg;
    let contentArr = [{
        key: 'TitleSet',
        type: 'customize',
        customizeDom: <DropDown 
            size="large"
            className={styles.dropDown}
            data = {{titleEnable, titleTextEn, titleTextCn}}
            content = {WIDGET_SET}
            onChange = {(attri) => onOtherAttriChange(attri)}
        />
    }]

    return contentArr.concat((projectCfg || []).map(ele => {
        const {type, limitNum, points, otherModelList} = ele;
        const {selected = []} = items.find(c => c.type === type) || {}
        return {
            key: type,
            keyName: msg(`OVERVIEW.${type}`),
            nameShow: projectCfg.length > 1,
            type: 'points',
            itemProps: {
                limitNum: limitNum,    
                options: getOptions(points, otherModelList),
                selectedData: labelPoints(selected, (pointKey, attri) => onAttriChange(type, pointKey, attri), type==='icon'),
                onChange: (valList) => onChange(type, valList),
            }
        }
    }))
    
} 

const IconShow = ({assetAlias, dynValueMap, selected, colNum}) => {
    return <div className={styles.iconShowContent}>{
        (selected).map((point, ind) => {
            const {customAssetAlias} = point;
            const pointKey = getPointKey(point, getAssetAlias(assetAlias, customAssetAlias));
            const {edictNameCn, edictNameEn, name_cn, name_en, table_no, field_no, convert = {}} = point;
            const {color, icon, unit = '' } = getStyleValue(point, dynValueMap[pointKey]);
            const {colorFrom, colorTo} = gradient(color, 0.25);
            const name = isZh ? edictNameCn || name_cn : edictNameEn || name_en;

            return <div key = {ind} className={styles.contentItem} style = {{width: `${100 / colNum}%`, minWidth: `${100 / colNum}%`}}>
                {icon ? <div className={styles.itemIcon} style = {{background: color ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:''}}>
                    <FontIcon type={IconType[icon]}/> 
                </div> : color ? <div className={styles.itemColor} style = {{backgroundColor: color}}/> : null}
                <div className={styles.itemRight}>
                    <div className={styles.itemVal}>
                    <DynData
                        showName = {false} 
                        showUnit = {false}
                        wrapperCls = {styles.wrapperCls}
                        valueContainerCls = {styles.valueContainerCls}
                        point = {{
                            aliasKey: pointKey,
                            tableNo: table_no || '',
                            fieldNo: field_no || '',
                            nameCn: name_cn || '',
                            nameEn: name_en || '',
                            unit: unit,
                        }} 
                        transform = {{
                            nameCn: edictNameCn,
                            nameEn: edictNameEn,
                            convert: convert
                        }}
                        value = {dynValueMap[pointKey]}
                    />
                        <span className={styles.itemUnit}>{unit}</span>
                    </div>
                    <EllipsisToolTip>{name}</EllipsisToolTip>
                </div>
            </div>
        })
    }</div>
}

const WaterDroplet = ({assetAlias, dynValueMap, selected, colNum, limitNum, numFont}) => {
    const [aspectRation, setAspectRation] = useState(1);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ob = new window.ResizeObserver(([ele]) => {
            const height = ele.contentRect.height;
            const width = ele.contentRect.width;
            
            setAspectRation((width / (colNum || 1)) / (height - 30));
        })
        ob.observe(ref.current as Element);
        return () => {
            ob.disconnect()
        }
    }, []);
    
    return <div className={styles.waterDropletContent} ref={ref}>{
        (selected).map((point, ind) => {
            const {customAssetAlias} = point;
            const pointKey = getPointKey(point, getAssetAlias(assetAlias, customAssetAlias));
            const {edictNameCn, edictNameEn, name_cn, name_en, table_no, field_no, convert = {}, unit} = point;
            const {color, value} = getStyleValue(point, dynValueMap[pointKey]);

            return <div 
                    key = {ind} 
                    className={styles.waterDropletItem} 
                    style = {{
                        width: `${100 / colNum}%`, 
                        minWidth: `${100 / colNum}%`,
                        height: `${100 / (Math.ceil(limitNum / colNum))}%`
                    }}
                >
                    <div className={styles.before}/>
                    <DynData
                        showName = {true} 
                        showUnit = {true}
                        layout = {CommonDynLayout.LAYOUT2}
                        wrapperStyle = {{width: '100%'}}
                        valueContainerCls = {`${styles.itemContent} ${aspectRation < 1 ? styles.narrow : ''}`}
                        valueContainerStyle = {{borderColor: color, boxShadow: `inset 0 0 5px 1px ${color}`}}
                        nameContainerCls = {styles.itemName}
                        valueCls = {`${styles.itemVal} ${styles[numFont]}`}
                        unitCls = {styles.itemUnit}
                        nameCls = {styles.name}
                        point = {{
                            aliasKey: pointKey,
                            tableNo: table_no || '',
                            fieldNo: field_no || '',
                            nameCn: edictNameCn || name_cn || '',
                            nameEn: edictNameEn || name_en || '',
                            unit: unit
                        }} 
                        transform = {{convert: convert}}
                        value = {dynValueMap[pointKey]}
                    />
                    <div className={styles.after}/>
            </div>
        })
    }</div>
}

const ProgressBar = ({assetAlias, dynValueMap, selected, colNum}) => {
    return <div className={styles.progressBarContent}>{
        (selected).map((point, ind) => {
            const {customAssetAlias} = point;
            const pointKey = getPointKey(point, getAssetAlias(assetAlias, customAssetAlias));
            const {edictNameCn, edictNameEn, name_cn, name_en, table_no, field_no, convert = {}, unit} = point;
            const {color, value} = getStyleValue(point, dynValueMap[pointKey]);
            const {colorFrom, colorTo} = gradient(color, 0.25);
            const valueStr = value.split(',').join('');
            const valueNum = Number(valueStr);
            const percentVal = /^[0-9]+.?[0-9]*/.test(valueStr) ? valueNum < 0 ? 0 : valueNum > 100 ? 100 : valueNum : 0;

            return <div key = {ind} className={styles.progressBarItem}>
                    <DynData
                        showName = {true} 
                        showUnit = {true}
                        layout = {CommonDynLayout.LAYOUT3}
                        valueContainerCls = {styles.itemContent}
                        valueContainerStyle = {{}}
                        nameContainerCls = {styles.itemName}
                        valueCls = {styles.itemVal}
                        unitCls = {styles.itemUnit}
                        point = {{
                            aliasKey: pointKey,
                            tableNo: table_no || '',
                            fieldNo: field_no || '',
                            nameCn: name_cn,
                            nameEn: name_en,
                            unit: unit
                        }} 
                        transform = {{
                            nameCn: edictNameCn,
                            nameEn: edictNameEn,
                            convert: convert
                        }}
                        value = {dynValueMap[pointKey]}
                    />
                    <div className={styles.progressBar}>
                        <div style={{width: `${percentVal}%`, background: color ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:''}}/>
                    </div>
            </div>
        })
    }</div>
}

type DynOverviewProps = {
    isConfiguring: boolean;
    defaultTitleCfg: Cfg;
    projectCfg: InputCfgItem[];
    assetAlias: string;
    id?: string;
    pageId?: string;
    afterClose?: () => void;
    onMemoryTitleChange: Function;
}
const DynOverview = ({isConfiguring, defaultTitleCfg, projectCfg, assetAlias, id, pageId, afterClose, onMemoryTitleChange}: DynOverviewProps) => {
    const [curSetCfg, setCurSetCfg] = useState<Cfg>({});
    const [dynValueMap, setDynValueMap] = useState({});
    const [validAsset, setValidAsset] = useState<string[] | null>(null);

    // 获取有效的资产
    useEffect(() => {
        let otherAssetAlias: string[] = projectCfg.reduce((res: string[], item) => {
            return res.concat(item.otherModelList?.filter(otherAsset => !!otherAsset.customAssetAlias).map(otherAsset => otherAsset.customAssetAlias)??[]);
        }, []);

        (async () => {
            let newAssetList: string[] = [];

            if(otherAssetAlias.length > 0){
                const res = await _dao.getAssetInfo(otherAssetAlias.map(oaa => getAssetAlias(assetAlias, oaa)));
                if(LegalData(res)){
                    let data = res.data;
                    newAssetList = otherAssetAlias.filter(oaa => {
                        const {is_exist} = data.find(d => d.alias === getAssetAlias(assetAlias, oaa)) || {};
                        return is_exist;
                    })
                }
            }
            
            setValidAsset(newAssetList);
        })();
         
    }, []);

    // 外部传入的配置中获取默认选中配置
    const defaultSelected = projectCfg.map(typeItem => {
        const {type, limitNum, colNum, points = [], otherModelList} = typeItem;
        const defaultPoints = points.filter(ele => ele.defaultStyle).map(ele => {
            return Object.assign({}, ele, {key: getQuotaKey(ele)}, ele.defaultStyle)
        })

        return {
            type: type,
            selected: [...defaultPoints].slice(0, limitNum ?? SHOW_TYPES[type].limitNum ?? 0)
        }
    })

    const [cacheCfg, setCacheCfg, initialized] = useMemoryStateCallback<Cfg>(
        JSON.parse(JSON.stringify({
            ...defaultTitleCfg,
            items: defaultSelected
        })), pageId, id);

    const [mergeCfg, setMergeCfg] = useState(JSON.parse(JSON.stringify({
        ...defaultTitleCfg,
        items: defaultSelected
    })))

    useEffect(() => {
        if(initialized){
            let categoryKeyMap = {};
            let categoryKeyList: any[] = [];
            let customAssetAliasMap ={};
            projectCfg.map(t => {
                (t.otherModelList || []).map(l => {
                    const {customAssetAlias = '', selectedDomain, selectedObject, key} = l;
                    if(selectedDomain && selectedObject){
                        const oldCategoryKey = customAssetAlias + '-' + selectedDomain.domain_id + '-' + selectedObject.model_id;
                        categoryKeyList.push(oldCategoryKey, key);
                        categoryKeyMap[oldCategoryKey] = key;
                    }

                    customAssetAliasMap[key] = customAssetAlias;
                })
            })

            let newCacheCfg = JSON.parse(JSON.stringify(cacheCfg));

            // 老的储能场站配置转换
            if('selected' in newCacheCfg){
                newCacheCfg = {items: [{type: projectCfg[0]?.type??'icon', selected: newCacheCfg.selected}]};
            }

            (newCacheCfg.items || []).map(item => {
                let {selected = []} = item;
                item.selected = JSON.parse(JSON.stringify(selected)).map(s => {
                    let oldCategoryKey = s.key.replace("-" + getQuotaKey(s), '');
                    // 兼容以前的根据资产存储的模式
                    if(categoryKeyMap[oldCategoryKey]){
                        s.categoryKey = categoryKeyMap[oldCategoryKey];
                        s.key = s.key.replace(oldCategoryKey, s.categoryKey)
                    }
                    return s;
                }).filter(p => { //过滤掉组态中不存在的其他模型
                    if(p.categoryKey && categoryKeyList.indexOf(p.categoryKey) === -1){
                        return false;
                    }else {
                        return true;
                    }
                }).map(p => {  //用户配置动态根据uid找到组态中对应的资产
                    if(p.customAssetAlias && p.categoryKey){
                        p.customAssetAlias = customAssetAliasMap[p.categoryKey];
                    }
                    return p;
                })
            })
            setCurSetCfg(JSON.parse(JSON.stringify(newCacheCfg)));
            setMergeCfg(JSON.parse(JSON.stringify(newCacheCfg)));
        }
    }, [initialized])

    useEffect(() => {
        const {titleEnable, titleTextCn, titleTextEn} = Object.assign({}, cacheCfg || {});
        onMemoryTitleChange({titleEnable, titleTextCn, titleTextEn})
    }, [cacheCfg])

    useRecursiveTimeoutEffect(
        () => {
            let req: {
                id: string,
                decimal: number,
                key: string
            }[] = [];

            (mergeCfg?.items || []).forEach(item => {
                (item.selected || []).map(o => {
                    const {customAssetAlias} = o;
                    req.push({
                        id: "", 
                        decimal: 3, 
                        key: getPointKey(o, getAssetAlias(assetAlias, customAssetAlias))
                    })
                })
            })
            
            if(req.length === 0){
                return;
            }

            return [
                () => {
                    return _dao.getDynData(req);
                },
                (res) => {
                    const valueMap = {};
                    if (LegalData(res)) {
                        const data = res.data || [];
                        data.forEach(o => {
                            valueMap[o.key] = o;
                        });                   
                    }

                    if(!_.isEqual(valueMap, dynValueMap)){
                        setDynValueMap(valueMap); 
                    }
                }
            ]
        },
        TimerInterval,
        [mergeCfg]
    )

    const handleAttriChange = (type, pointKey, attri) => {
        let newData = (curSetCfg?.items || []).map(ele => ele);

        let point = newData.find(item => item.type === type)?.selected?.find(ele => ele.key === pointKey);
        if(point){
            Object.assign(point, attri);
            handleOtherAttriChange({items: newData})
        }
    }

    const handlePointsChange = (type, valList: Array<{key: string, title: string}>) => {
        let rawSelected = (curSetCfg?.items || []).find(ele => ele.type === type)?.selected || [];
        let newData = (curSetCfg?.items || []).map(ele => ele);
        let typeItem = newData.find(ele => ele.type === type);
        let selected = typeItem?.selected || [];

        if(!typeItem){
            newData.push({
                type: type,
                selected: []
            })
            typeItem = newData.find(ele => ele.type === type);
            selected = newData.find(ele => ele.type === type)?.selected || [];
        }

        // add
        valList.map(val => {
            if(rawSelected.map(point => point.key).indexOf(val.key) === -1){
                const typeItem = (projectCfg || []).find(ele => ele.type === type);
                let allRawPoints = (typeItem?.points || [])
                .map(ele => {
                    return {...ele, key: getQuotaKey(ele)};
                }).concat(...((typeItem?.otherModelList || [])
                .map(l => {
                    const {customAssetAlias, selectedDomain, selectedObject, key: categoryKey} = l;

                    return (selectedObject?.selectedPoint || []).map(ele => {
                        return {
                            customAssetAlias, 
                            ...ele, 
                            key: categoryKey + '-' + getQuotaKey(ele),
                            categoryKey
                        };
                    })
                })))

                const rawPoint = allRawPoints.find(option => option.key === val.key);

                selected.push(Object.assign({}, rawPoint, {
                    key: val.key,
                    name: val.title,
                    ...defaultPointProps
                }))
            }
        })

        // delete
        selected = selected.filter(point => {
            return valList.map(ele => ele.key).indexOf(point.key) > -1
        })

        const valKeys = valList.map(val => val.key)

        // reorder
        selected.sort((a,b)=>{
            return valKeys.indexOf(a.key) - valKeys.indexOf(b.key);
        });

        typeItem['selected'] = selected;

        handleOtherAttriChange({items: newData});
    }

    const handleOtherAttriChange = (attri) => {
        let newCfg = JSON.parse(JSON.stringify(curSetCfg));

        Object.assign(newCfg, attri);
        setCurSetCfg(newCfg);
    }

    if(!validAsset) return null;

    return <div className={styles.container}>
        <div className={styles.content}>
            {
                (mergeCfg?.items || []).map((typeItem, i) => {
                    const {type, selected} = typeItem;
                    const {colNum, limitNum, numFont} = projectCfg.find(c => c.type === type) || {};
                    const selectedValidAsset = selected.filter(s => !s.customAssetAlias || validAsset.indexOf(s.customAssetAlias) > -1);

                    switch(type){
                        case 'icon':
                            return <IconShow 
                                key={i}
                                selected = {selectedValidAsset}  
                                assetAlias = {assetAlias} 
                                dynValueMap = {dynValueMap}
                                colNum = {colNum || SHOW_TYPES.icon.defaulColNum}
                            />
                        case 'droplet':
                            return <WaterDroplet
                                key={i}
                                selected = {selectedValidAsset}  
                                assetAlias = {assetAlias} 
                                dynValueMap = {dynValueMap}
                                colNum = {colNum || SHOW_TYPES.droplet.defaulColNum}
                                limitNum = {limitNum}
                                numFont = {numFont}
                            />

                        case 'progressBar':
                            return <ProgressBar
                                key={i}
                                selected = {selectedValidAsset}  
                                assetAlias = {assetAlias} 
                                dynValueMap = {dynValueMap}
                                colNum = {colNum || SHOW_TYPES.progressBar.defaulColNum}
                            />
                    }
                })
            }
        </div>
        <SetModal 
            visible = {isConfiguring}
            title = {msg('OVERVIEW.set')}
            content = {getContent(
                projectCfg, 
                curSetCfg, 
                handleAttriChange, 
                handlePointsChange, 
                handleOtherAttriChange
            )}
            memorySave = {() => {
                setCacheCfg(curSetCfg, () => {});
                setMergeCfg(JSON.parse(JSON.stringify(curSetCfg)));
            }}
            handleReset = {() => setCurSetCfg(JSON.parse(JSON.stringify(mergeCfg)))}
            afterClose= {afterClose}
        />
    </div>;
}

export function Overview(props: Omit<WidgetProps, 'configure'> & {
    isExternal?: boolean,         // 外部调用, 外部调用传入的和组态里配置数据结构不一样, 分开处理
    externalCfg?: ExternalCfg,    // 外部传入配置
    configure?: IOverviewInfoCfg, // 组件内部传入配置
}) {
    const {editable = true, id, pageId, assetAlias = '', configure, scale, isDemo, isExternal = false, externalCfg} = props;
    const {
        customAssetAlias = '', title, title_en, ...cardProps
    } = Object.assign({}, defaultCardProps, isExternal ? externalCfg : configure);

    let commonCfg: InputCfgItem[] = [];
    
    if(isExternal){
        commonCfg = externalCfg?.cfg || [];
    }else if(configure){
        const {overviewProps} = configure;
        if(overviewProps){
            overviewProps.forEach(o => {
                const {limitNum, type, colNum, numFont = 'defaultFont', model, otherModelList = []} = o;
                commonCfg.push({
                    numFont,
                    limitNum,
                    colNum,
                    type,
                    points: (model?.selectedObject?.selectedPoint ?? []) as PointModel[],
                    otherModelList: otherModelList
                })
            })
        }
    }

    const finalAssetAlias = getAssetAlias(assetAlias, customAssetAlias);

    const [isConfiguring, setIsConfiguring] = useState(false);
    const defaultTitleCfg = {...DEFAULT_MEMORY_CFG}
    const [memoryTitle, setMemoryTitle] = useState<MemoryTitle>(defaultTitleCfg);
    // todo 用户配置和组态配置合并
    if(!isExternal){
    }

    return <Observer>{() => {
        return <PageCard 
            {...cardProps}
            title={memoryTitle.titleEnable ? memoryTitle.titleTextCn || title : ''} 
            title_en={memoryTitle.titleEnable ? memoryTitle.titleTextEn || title_en : ''}
            extra = {
                <div 
                    className={styles.set} 
                    style = {!editable ? {visibility: 'hidden'} : {}} 
                    onClick = {() => {setIsConfiguring(!isConfiguring)}}
                >
                    <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2> 
                </div>
            }
        >
            {!isDemo && <DynOverview 
                isConfiguring = {isConfiguring}
                defaultTitleCfg = {defaultTitleCfg}
                projectCfg = {JSON.parse(JSON.stringify(commonCfg))} 
                assetAlias = {finalAssetAlias} 
                id = {id}
                pageId = {pageId}
                afterClose = {() => {setIsConfiguring(false)}}
                onMemoryTitleChange = {(titleObj) => {(!_.isEqual(titleObj, memoryTitle)) && setMemoryTitle(titleObj)}}
            />}
        </PageCard>
    }}</Observer>
}