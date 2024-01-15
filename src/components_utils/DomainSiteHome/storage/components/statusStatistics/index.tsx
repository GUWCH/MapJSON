import React, { useState, useRef, useEffect } from "react";
import { Icon2, FontIcon, IconType } from 'Icon';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import {useMemoryStateCallback} from '@/common/util-memory';
import SetModal from 'SetModal';
import DynData from 'DynData';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import { LegalData, _dao } from '@/common/dao';
import {DropDown} from '@/components';
import {groupByTableNo, getStyleValue, gradient} from '@/common/util-scada';
import {CommonTimerInterval} from '@/common/const-scada';
import { getPointKey } from '@/common/constants';
import {msg, isZh, getQuotaKey, STORAGE_SITE} from '../../constants';
import {defaultPointProps, pointDropDown, pointTypes, KEY, LIMIT_NUM, defaultStyle} from './constants';
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

type Cfg = {
    selected: Array<QuotaItem>
} | null;

const labelPoints = (selectedPoints, onAttriChange) => {
    return (selectedPoints || []).map((point, index) => {
        let {
            edictNameCn, 
            edictNameEn, 
            icon,
            color, 
            convert
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
                content = {pointDropDown}
                onChange = {(attri) => onAttriChange(point.key, attri)}
             />
        };
    })
}

const getContent = (storageCfg, selectedPoints, onAttriChange, onChange) => {
    const points = (storageCfg[KEY] || []).map(ele => {
        return {...ele, key: getQuotaKey(ele)};
    })
    return [
        {
            key: KEY,
            keyName: msg(KEY),
            nameShow: false,
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
                }), pointTypes, false, true),
                selectedData: labelPoints(selectedPoints, onAttriChange),
                onChange: onChange,
            }
        }
    ]
} 

const StatusStatistics = ({storageCfg, assetAlias}) => {
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [dynValueMap, setDynValueMap] = useState({});
    const [cfg, setCfg] = useMemoryStateCallback<Cfg>(null, STORAGE_SITE, KEY);
    const [initDefaultSelect, setInitDefaultSelect] = useState([]);
    console.log('status statistics',storageCfg, assetAlias)

    useEffect(() => {
        if(cfg?.selected){
            setSelectedPoints(JSON.parse(JSON.stringify(cfg.selected)));
        }else{
            // 默认配置
            const defaultSelected = storageCfg[KEY].slice(0, LIMIT_NUM).map((ele, index) => {
                return Object.assign({}, ele, {key: getQuotaKey(ele)}, defaultStyle[index]);
            })
            setInitDefaultSelect(JSON.parse(JSON.stringify(defaultSelected)));
            setSelectedPoints(JSON.parse(JSON.stringify(defaultSelected)));
        }
        
    }, [cfg, storageCfg[KEY]])

    useRecursiveTimeoutEffect(
        () => {
            if((cfg?.selected && cfg?.selected.length === 0) 
            || (!cfg?.selected && initDefaultSelect.length === 0)){
                return;
            }

            return [
                () => {
                    const req = (cfg?.selected || initDefaultSelect).map(o => ({
                        id: "", 
                        decimal: 0, 
                        key: getPointKey(o, assetAlias)
                    }));

                    return _dao.getDynData(req);
                },
                (res) => {
                    const valueMap = {};
                    if (LegalData(res)) {
                        const data = res.data || [];
                        data.forEach(o => {
                            valueMap[o.key] = o;
                        });

                        setDynValueMap(valueMap);                    
                    }
                }
            ]
        },
        CommonTimerInterval,
        [cfg, initDefaultSelect]
    )

    const handleAttriChange = (pointKey, attri) => {
        let newData = selectedPoints.map(ele => ele);

        let point = newData.find(ele => ele.key === pointKey);
        if(point){
            Object.assign(point, attri);

            setSelectedPoints(newData);
        }
        
    }

    const handlePointsChange = (valList: Array<{key: string, title: string}>) => {
        let newData = selectedPoints.map(ele => ele);

        // add
        valList.map(val => {
            if(selectedPoints.map(point => point.key).indexOf(val.key) === -1){
                const rawPoint = (storageCfg[KEY] || [])
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

        setSelectedPoints(newData);
    }

    return <div className={styles.container}>
        <div className={styles.head}>
            <div className={styles.title}>{msg(KEY)}</div>
            <div className={styles.set} onClick = {() => {setIsConfiguring(!isConfiguring)}}>
                <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2> 
            </div>
        </div>
        <div className={styles.content}>
            {(cfg?.selected || initDefaultSelect).map((point, ind) => {
                const pointKey = getPointKey(point, assetAlias);
                const {edictNameCn, edictNameEn, name_cn, name_en, table_no, field_no, convert} = point;
                const {color, icon, unit = '', value} = getStyleValue(point, dynValueMap[pointKey]);
                const {colorFrom, colorTo} = gradient(color, 0.25);
                const name = isZh ? edictNameCn || name_cn : edictNameEn || name_en;

                return <div onClick={()=>location.href = `/page/index.html?id=c4C5HLqmah5gB_BXFYRkc&windos_app_name=OS&gFieldParm=${assetAlias}`} key = {ind} className={styles.contentItem} style = {{background: color ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:''}}>
                    {icon ? <span className={styles.itemIcon}><FontIcon type={IconType[icon]}/></span> : null}
                    <EllipsisToolTip>{name}</EllipsisToolTip>
                    <DynData 
                        showName = {false} 
                        showUnit = {false}
                        point = {{
                            aliasKey: pointKey,
                            tableNo: table_no || '',
                            fieldNo: field_no || '',
                            nameCn: name_cn || '',
                            nameEn: name_en || '',
                            unit: unit
                        }} 
                        value = {dynValueMap[pointKey]}
                        transform = {{
                            convert: Object.assign({}, {decimal: 0}, convert)
                        }}
                    />
                </div>
            })}
        </div>
        <SetModal 
            visible = {isConfiguring}
            title = {msg(`${KEY}Set`)}
            content = {getContent(storageCfg, selectedPoints, handleAttriChange, handlePointsChange)}
            memorySave = {() => {
                setCfg({selected: selectedPoints}, () => {});
                // setCfg(null, () => {})
            }}
            handleReset = {() => setSelectedPoints(JSON.parse(JSON.stringify(cfg?.selected || initDefaultSelect)))}
            afterClose= {() => {setIsConfiguring(false)}}
        />
    </div>;
}

export default StatusStatistics;