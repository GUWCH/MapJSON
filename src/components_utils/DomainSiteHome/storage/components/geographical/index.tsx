import React, { useState, useEffect } from "react";
import _ from "lodash";
import {useMemoryStateCallback} from '@/common/util-memory';
import {groupByTableNo, getStyleValue, gradient} from '@/common/util-scada';
import scadaCfg, {CommonTimerInterval} from '@/common/const-scada';
import { LegalData, _dao } from '@/common/dao';
import {getPointKey} from '@/common/constants';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import { DropDown, confirm } from '@/components';
import { Icon2, FontIcon, IconType } from 'Icon';
import SetModal from 'SetModal';
import DragDrop, {Config} from './dragDrop';
import {msg, isZh, getQuotaKey, COMMON_DECIMAL, STORAGE_SITE, isDev} from '../../constants';
import {
    defaultPointProps, 
    getPointDropDown, 
    yxItemDropDown, 
    pointTypes, 
    otherType, 
    KEY, 
    LIMIT_NUM, 
    NODE_TYPE, 
} from './constants';
import styles from './style.mscss';

export interface QuotaItem {
    alias: string;
    name_cn: string;
    name_en: string,
    table_no: string | number,
    field_no: string | number,
    unit?: string;
    const_name_list?: []
}

type GeographicalCfg = {
    selected: {
        quotas: Array<QuotaItem>;
        status: QuotaItem;
    } | null;
} | null;

const labelPoints = (selectedItems, onAttriChange, isYx = false) => {
    return (selectedItems || []).map((item, index) => {
        let {
            edictNameCn, 
            edictNameEn, 
            icon,
            color, 
            convert,
            ycCondition,
            yxCondition
        } = Object.assign({}, defaultPointProps, item);
        return {
            title: isZh ? item.name_cn : item.name_en,
            key: item.key,
            dragabled: isYx ? false : true,
            dropDownContent: <DropDown 
                key = {index}
                data = {isYx ? {color: color}:{
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    color: color,
                    convert: convert,
                    icon: icon,
                    ycCondition: ycCondition,
                    yxCondition: yxCondition
                }}
                content = {isYx ? yxItemDropDown : getPointDropDown(item)}
                onChange = {(attri) => onAttriChange(item.key, attri)}
             />
        };
    })
}

const getContent = (storageCfg, curCfg, onAttriChange, onChange, onStatusAttriChange, onStatusChange) => {
    const {quotas = [], status = null} = curCfg || {};
    const constList = (status?.const_name_list || []).map(ele => {
        const {value, name, name_en, ...rest} = ele;

        return {
           key: String(value),
           name_cn: name,
           name_en: name_en,
           ...rest
        }
    })
    const points = (storageCfg[KEY]?.quotas || []).map(ele => {
        return {...ele, key: getQuotaKey(ele)};
    })

    const statusPoints = (storageCfg[KEY]?.status || []).map(ele => {
        return {
            value: getQuotaKey(ele),
            name: isZh ? ele.name_cn : ele.name_en
        };
    })

    return [
        {
            key: 'status',
            keyName: msg('status'),
            nameShow: true,
            type: 'yxSelect',
            describe: msg('describe'),
            selectProps: {
                incluedNo: true,
                options: statusPoints,
                value: status?.key || '',
                onChange: onStatusChange
            },
            itemProps: {  
                needDelete: false,
                needSelect: false, 
                options: [],
                selectedData: labelPoints(constList, onStatusAttriChange, true),
            }
        },
        {
            key: 'quota',
            keyName: msg('quota'),
            nameShow: true,
            type: 'points',
            itemProps: {
                limitNum: LIMIT_NUM,    
                options: groupByTableNo(points.map((point) => {
                    const {name_cn, name_en, key, table_no} = point;
                    return {
                        name: isZh ? name_cn : name_en,
                        key : key,
                        tableNo: table_no
                    }
                }), pointTypes, otherType, false),
                selectedData: labelPoints(quotas, onAttriChange),
                onChange: onChange,
            }
        }
    ]
} 

const Geographical = ({storageCfg, assetAlias}) => {
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [subSystems, setSubSystems] = useState([]);
    const [dynValueMap, setDynValueMap] = useState({});

    const [posCacheConfig, setPosCacheConfig] 
        = useMemoryStateCallback<Config>(null, assetAlias, KEY);
    const [cfg, setCfg] = useMemoryStateCallback<GeographicalCfg>(null, STORAGE_SITE, KEY);
    const [initDefaultSelect, setInitDefaultSelect] = useState({}); 

    const [curCfg, setCurCfg] = useState(cfg?.selected);  //当前指标配置
    const [curPosCfg, setCurPosCfg] = useState(posCacheConfig)  // 当前地理位置配置

    useEffect(() => {
        const fetchTree = async () => {
            let tree  = await scadaCfg.getTree();
            if(tree){
                const arr = tree.getNodesByParam('node_type', NODE_TYPE);
                const curFacSubSystems = arr.filter(a => {
                    let {alias = ''} = a;
                    return alias && assetAlias && alias.split('.')[0] === assetAlias;
                })
                setSubSystems(curFacSubSystems);
            }
        }

        if(isDev){
            // mock数据
            let temp = [];
            for(let i=0; i<33; i++){
                if(i<9){
                    temp.push({alias: `SXCN.ESS0${i+1}.CESS`})
                }else{
                    temp.push({alias: `SXCN.ESS${i+1}.CESS`})
                }
            }
            setSubSystems(temp);
        }else{
            fetchTree();
        }
    }, [])
    
    useEffect(() => {
        setCurPosCfg(posCacheConfig);
    }, [posCacheConfig])

    useEffect(() => {
        let newCfgSelect = JSON.parse(JSON.stringify(cfg?.selected || null));
        if(!cfg?.selected){
            // 默认测点
            newCfgSelect = {};
            const {status = [], quotas = []} = storageCfg[KEY];
            if(status.length > 0){
                newCfgSelect.status = status[0] ? Object.assign({}, status[0], {key: getQuotaKey(status[0])}) : null;
                newCfgSelect.quotas = quotas.slice(0, LIMIT_NUM).map(q => {
                    return Object.assign({}, q, {key: getQuotaKey(q)});
                });
            }

            setInitDefaultSelect(newCfgSelect);
        }

        if(!_.isEqual(newCfgSelect, curCfg)){
            setCurCfg(newCfgSelect);
        }
    }, [cfg, storageCfg[KEY]])

    useRecursiveTimeoutEffect(
        () => { 
            if(subSystems.length === 0){
                return;
            }

            let selected = cfg?.selected || initDefaultSelect;
    
            let points = (selected?.quotas || [])?.concat(selected?.status ? [selected.status] : []);

            return [
                () => {
                    let req = [];
                    subSystems.map((subSystem) => {
                        let {alias = ''} = subSystem;
                        points.map(o => {
                            req.push({
                                id: "", 
                                decimal: COMMON_DECIMAL, 
                                key: getPointKey(o, alias)
                            })
                        });
                    })
                    return _dao.getDynData(req);
                },
                (res) => {
                    let valueMap = {};
                    let subSystemValueMap = {};
                    if (LegalData(res)) {
                        const data = res.data || [];
                        data.forEach(o => {
                            valueMap[o.key] = o;
                        });

                        subSystems.map(system => {
                            let {alias} = system;
                            subSystemValueMap[alias] = [];

                            if(selected?.status){
                                let pointKey = getPointKey(selected.status, alias);
                                let {name_cn, name_en} = selected.status;

                                let pointVal = {
                                    key: pointKey,
                                    isStatus: true,
                                    name: isZh ? name_cn : name_en,
                                    ...getStyleValue(selected.status, valueMap[pointKey])
                                }

                                subSystemValueMap[alias].push(pointVal);
                            }

                            selected.quotas && selected.quotas.map(quota => {
                                let pointKey = getPointKey(quota, alias);
                                let {name_cn, name_en, edictNameCn, edictNameEn} = quota;

                                let pointVal = {
                                    key: pointKey,
                                    isStatus: false,
                                    name: isZh ? edictNameCn || name_cn : edictNameEn || name_en,
                                    ...getStyleValue(quota, valueMap[pointKey])
                                }

                                subSystemValueMap[alias].push(pointVal);
                            })
                        })

                        setDynValueMap(subSystemValueMap);                    
                    }
                }
            ];
        },
        CommonTimerInterval,
        [cfg, subSystems, initDefaultSelect]
    )

    const handleStatusAttriChange = (itemKey, attri) => {
        let newList = (curCfg?.status?.const_name_list || []).map(ele => ele);

        let item = newList.find(ele => String(ele.value) === itemKey);
        if(item){
            Object.assign(item, attri);

            setCurCfg(Object.assign({}, curCfg, {
                status: Object.assign({}, curCfg.status, {const_name_list: newList})
            }));
        }
    }

    const handleStatusChange = (value) => {
        let target = storageCfg[KEY].status.find(ele => {
            return getQuotaKey(ele) === value;
        })

        if(target){
            target.key = value;
        }

        setCurCfg(Object.assign({}, curCfg, {status: target ? target : null}))
    }

    const handleAttriChange = (pointKey, attri) => {
        let newData = (curCfg.quotas || []).map(ele => ele);

        let point = newData.find(ele => ele.key === pointKey);
        if(point){
            Object.assign(point, attri);

            setCurCfg(Object.assign({}, curCfg, {quotas:newData}));
        }
    }

    const handlePointsChange = (valList: Array<{key: string, title: string}>) => {
        let newData = (curCfg.quotas || []).map(ele => ele);

        // add
        valList.map(val => {
            if((curCfg.quotas || []).map(point => point.key).indexOf(val.key) === -1){
                const rawPoint = (storageCfg[KEY]?.quotas || [])
                .map(ele => {
                    return {...ele, key: getQuotaKey(ele)};
                })
                .find(option => option.key === val.key);

                newData.push(Object.assign({}, rawPoint, {
                    key: val.key,
                    name: val.title,
                    ...defaultPointProps
                }))
            }
        })

        // delete
        newData = newData.filter(point => {
            return valList.map(ele => ele.key).indexOf(point.key) > -1
        })

        const valKeys = valList.map(val => val.key)

        // reorder
        newData.sort((a,b)=>{
            return valKeys.indexOf(a.key) - valKeys.indexOf(b.key);
        });

        setCurCfg(Object.assign({}, curCfg, {quotas:newData}));
    }

    return <div className={styles.container}>
        <div className={styles.head}>
            <div className={styles.title}>{msg(KEY)}</div>
            {isEdit ? <div className={styles.onEditor}>
                <button onClick={() => {
                    confirm({
                        title: msg('resetTitle'),
                        content: msg('resetContent'),
                        okText: msg('ok'),
                        cancelText: msg('cancel'),
                        onOk: () => {
                            setCurPosCfg(null)
                        }
                    });
                    
                }}>{msg('reset')}</button>
                <button onClick = {() => {
                    setIsEdit(false);
                    setPosCacheConfig(curPosCfg, () => {});
                }}>{msg('save')}</button>
                <button onClick = {() => {
                    confirm({
                        title: msg('exitTitle'),
                        content: msg('exitContent'),
                        okText: msg('ok'),
                        cancelText: msg('cancel'),
                        onOk: () => {
                            setCurPosCfg(posCacheConfig);
                            setIsEdit(false);
                        }
                    });
                }}>{msg('exit')}</button>
            </div> 
            : 
            <>
                <div className={styles.editor} onClick = {() => {setIsEdit(true)}}>
                    <FontIcon type={IconType.EDITOR}></FontIcon>
                </div>
                <div className={styles.set} onClick = {() => {setIsConfiguring(!isConfiguring)}}>
                    <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2> 
                </div>
            </>}
        </div>
        <div className={styles.content}>
            <DragDrop 
                isEdict = {isEdit}
                isZh={isZh}
                data = {subSystems}
                valData = {dynValueMap}
                config = {curPosCfg}
                onDragEnd = {(d) => {setCurPosCfg(d)}}
            />
        </div>
        <SetModal 
            visible = {isConfiguring}
            title = {msg(`${KEY}Set`)}
            content = {getContent(storageCfg, curCfg, handleAttriChange, handlePointsChange, handleStatusAttriChange, handleStatusChange)}
            memorySave = {() => {
                setCfg({selected: JSON.parse(JSON.stringify(curCfg))}, () => {});
                // setCfg(null, () => {});
            }}
            handleReset = {() => setCurCfg(JSON.parse(JSON.stringify(cfg?.selected || initDefaultSelect)))}
            afterClose= {() => {setIsConfiguring(false)}}
        />
    </div>;
}

export default React.memo(Geographical, (props, nextProps) => {
    if(!_.isEqual(props, nextProps))return false;
    return true;
});