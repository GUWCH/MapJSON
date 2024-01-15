import React, { useState } from "react";
import { Tooltip } from "antd";
import PageCard from '@/components_utils/Card';
import { msgTag, isZh } from '@/common/lang';
import { getAssetAlias } from '@/common/utils';
import { LegalData, _dao } from '@/common/dao';
import { getPointKey, VALUES } from '@/common/constants';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import {CommonTimerInterval} from '@/common/const-scada';
import DynData from 'DynData';
import styles from './style.mscss';

const msg = msgTag('pagetpl');

const COMMON_KEYS = {
    TITLE: 'title',
    NAME: 'name',
    LEFT: 'left',
    RIGHT: 'right',
    DEVICES: 'devices',
    TOTAL: 'total',
    COUNT: 'count',
}

interface IStatisticsInfoCfg {
    customAssetAlias?: string;
    statisticsProps?: {}
}

interface ExternalCfg {
    title: {
        [key in ("name" | 'left' | 'right')]?: {
            alias: string,
            name_cn: string,
            name_en: string,
            table_no: number | string,
            field_no: number | string,
            unit?: string,
            convert?: {
                coefficient: number,
                unit: string,
                decimal?: number
            }
        }
    },
    devices:{
        [key in ("count" | 'total')]?: {
            alias: string,
            name_cn: string,
            name_en: string
            table_no: number,
            field_no: number,
            color?: string,
            statusDescCn?: string,
            statusDescEn?: string
        }
    }[]
}

const Info = ({cfg, assetAlias,pageId}) => {

    const [dynValueMap, setDynValueMap] = useState({});

    useRecursiveTimeoutEffect(
        () => {
            if(Object.keys(cfg[COMMON_KEYS.TITLE])?.length === 0 && cfg[COMMON_KEYS.DEVICES]?.length === 0){
                return;
            } 
                
            let req = Object.keys(cfg[COMMON_KEYS.TITLE]).map(key => ({
                id: key, 
                decimal: 3, 
                key: getPointKey(cfg[COMMON_KEYS.TITLE][key], assetAlias)
            }));
    
            (cfg[COMMON_KEYS.DEVICES] || []).map((device) => {
                device[COMMON_KEYS.TOTAL] && req.push({
                    id: `${device.key}_${COMMON_KEYS.TOTAL}`, 
                    decimal: 0, 
                    key: getPointKey( device[COMMON_KEYS.TOTAL], assetAlias)
                })
    
                device[COMMON_KEYS.COUNT] && req.push({
                    id: `${device.key}_${COMMON_KEYS.COUNT}`, 
                    decimal: 0, 
                    key: getPointKey(device[COMMON_KEYS.COUNT], assetAlias)
                })
            })

            return [
                () => {
                    return _dao.getDynData(req)
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
        [cfg]
    )

    const namePoint = cfg[COMMON_KEYS.TITLE][COMMON_KEYS.NAME];
    const leftPoint = cfg[COMMON_KEYS.TITLE][COMMON_KEYS.LEFT];
    const rightPoint = cfg[COMMON_KEYS.TITLE][COMMON_KEYS.RIGHT];

    return <div className={styles.container}>
        <div className={styles.location}>
            <span className={styles.siteName}>
                <DynData 
                    showName = {false} 
                    point = {{
                        aliasKey: getPointKey(namePoint,assetAlias),
                        tableNo: namePoint.table_no || '',
                        fieldNo: namePoint.field_no || '',
                        nameCn: namePoint.name_cn || '',
                        nameEn: namePoint.name_en || '',
                    }} 
                    value = {dynValueMap[getPointKey(namePoint, assetAlias)]}
                />&nbsp;
                {leftPoint || rightPoint ? <div>(
                    {leftPoint && <DynData 
                        showName = {false} 
                        point = {{
                            aliasKey: getPointKey(leftPoint, assetAlias),
                            tableNo: leftPoint.table_no || '',
                            fieldNo: leftPoint.field_no || '',
                            nameCn: leftPoint.name_cn || '',
                            nameEn: leftPoint.name_en || '',
                            unit: leftPoint.unit || '',
                        }} 
                        value = {dynValueMap[getPointKey(leftPoint, assetAlias)]} 
                        transform = {{convert: leftPoint.convert || {}}}
                    />}
                    {leftPoint && rightPoint && <div>&nbsp;/&nbsp;</div>}
                    {rightPoint && <DynData 
                        showName = {false} 
                        point = {{
                            aliasKey: getPointKey(rightPoint, assetAlias),
                            tableNo: rightPoint.table_no || '',
                            fieldNo: rightPoint.field_no || '',
                            nameCn: rightPoint.name_cn || '',
                            nameEn: rightPoint.name_en || '',
                            unit: rightPoint.unit || '',
                        }} 
                        value = {dynValueMap[getPointKey(rightPoint, assetAlias)]} 
                        transform = {{convert: rightPoint.convert || {}}}
                    />}
                )</div> : null}
            </span>
        </div>
        <div className={styles.devices}>
            <div className={styles.line}/>
            {(cfg[COMMON_KEYS.DEVICES] || []).map((ele, index) => {
                const {name_cn, name_en, total, count} = ele;
                const {color, statusDescCn, statusDescEn} = count || {};
                const totalNum = total ? dynValueMap[getPointKey(total, assetAlias)]?.display_value : '';
                const countNum = count ? dynValueMap[getPointKey(count, assetAlias)]?.display_value : '';

                return !totalNum || totalNum == '0' ? null 
                : 
                <Tooltip key={index} 
                    title={()=><div>
                        <span>${total && count ?
                        msg('STATISTICS_INFO.deviceTip', totalNum, isZh ? name_cn : name_en, (countNum === undefined || countNum === '') ? VALUES.SLOT : countNum, isZh ? statusDescCn : statusDescEn)
                        :
                        total ? msg('STATISTICS_INFO.deviceTotalTip', totalNum, isZh ? name_cn : name_en)
                        : ''}</span>
                        <p style={{cursor:'pointer'}} onClick={()=>location.href = pageId.indexOf('solar')!=-1?`/solar/list.html?windos_app_name=OS&gFieldParm=${assetAlias}`:`/page/index.html?id=c4C5HLqmah5gB_BXFYRkc&windos_app_name=OS&gFieldParm=${ assetAlias}`}>查看详情</p></div>
                    }
                >
                    <span key={index} className={styles.deviceItem}>
                        <span className={styles.itemName}>{isZh ? name_cn : name_en}</span>
                        ({count && <span style={{color: color}}>
                            <DynData 
                                showName = {false} 
                                point = {{
                                    aliasKey: getPointKey(count, assetAlias),
                                    tableNo: count.table_no || '',
                                    fieldNo: count.field_no || '',
                                    nameCn: count.name_cn || '',
                                    nameEn: count.name_en || '',
                                }} 
                                value = {dynValueMap[getPointKey(count, assetAlias)]} 
                                transform = {{convert: count.convert || {decimal: 0}}}
                            />
                        </span>}
                        {count && total && <span>/</span>}
                        {total && <span>
                        <DynData 
                            showName = {false} 
                            point = {{
                                aliasKey: getPointKey(total, assetAlias),
                                tableNo: total.table_no || '',
                                fieldNo: total.field_no || '',
                                nameCn: total.name_cn || '',
                                nameEn: total.name_en || '',
                            }} 
                            value = {dynValueMap[getPointKey(total, assetAlias)]} 
                            transform = {{convert: total.convert || {decimal: 0}}}
                        />
                        </span>})
                    </span>
                </Tooltip>
            })}
        </div>
    </div>
}

export function StatisticsInfo(props: Omit<WidgetProps, 'configure'> & {
    configure?: IStatisticsInfoCfg, 
    isExternal?: Boolean,
    externalCfg?: ExternalCfg,
    pageId
}) {
    const { assetAlias = '', configure, scale, isDemo, isExternal = false, externalCfg ,pageId} = props;
    const { customAssetAlias, statisticsProps = {}} = configure || {};
    let standardProps = {};
    const finalAssetAlias = getAssetAlias(assetAlias, customAssetAlias);

    // todo 用户配置和组态配置合并
    if(!isExternal){
        let title = statisticsProps[COMMON_KEYS.TITLE];
        standardProps[COMMON_KEYS.TITLE] = {
            name: title?.name?.selectedObject?.selectedPoint || null,
            left: title?.left?.selectedObject?.selectedPoint || null,
            right: title?.right?.selectedObject?.selectedPoint || null,
        };

        standardProps[COMMON_KEYS.DEVICES] = (standardProps[COMMON_KEYS.DEVICES] || []).map(d => {
            let {count, total, ...rest} = d;
            return {
                ...rest,
                count: count?.selectedObject?.selectedPoint || null,
                total: total?.selectedObject?.selectedPoint || null,
            }
        });
    }

    return <PageCard>
        {!isDemo && <Info cfg = {isExternal ? externalCfg : standardProps} assetAlias = {finalAssetAlias} pageId={pageId} />}
    </PageCard>
}