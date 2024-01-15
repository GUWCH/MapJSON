import React from 'react'
import CommonDynData from "DynData";
import styles from './DeviceTooltip.module.scss';
import { parseDynKey } from '@/common/utils/model';

export type NameTooltipInfo = {
    key: string,
    isStatus?: boolean,
    name: string,
    value: string
    rawValue?: string
    valueName: string
    unit?: string,
    color?: string,
    icon?: string,
    // 统计信息
    isStatics?: boolean,
    countKey?: string
    totalKey?: string
    countVal?: string,
    totalVal?: string,
    isBg?: boolean
};

export type DeviceTooltipProps = {
    type: 'device'
    title: string
    infos: NameTooltipInfo[]
}

const DeviceTooltip = ({ title, infos }: DeviceTooltipProps) => {
    return <div className={styles.tooltip}>
        <span className={styles.tooltipTitle}>{title}</span>
        {
            infos
                .filter(v => !v.isStatus && !v.isBg && !v.isStatics || v.totalVal && v.totalVal != '0')
                .map((d) => {
                    let { key, name, color, value, unit = '', isStatics, countVal, totalVal, countKey, totalKey } = d;
                    const countPointInfo = countKey ? parseDynKey(countKey) : undefined
                    const totalPointInfo = totalKey ? parseDynKey(totalKey) : undefined
                    const pointInfo = parseDynKey(key)
                    return <div key={key} className={styles.tooltipInfo}>
                        <div title={name}>{name}</div>
                        <span>
                            {isStatics ? <>
                                <CommonDynData
                                    showName={false}
                                    point={{
                                        tableNo: countPointInfo?.tableNo ?? '',
                                        fieldNo: countPointInfo?.fieldNo ?? '',
                                        nameCn: name,
                                        nameEn: name,
                                        aliasKey: countKey ?? '',
                                        unit: unit
                                    }}
                                    value={countVal}
                                    eventWrap={true}
                                />/<CommonDynData
                                    showName={false}
                                    point={{
                                        tableNo: totalPointInfo?.tableNo ?? '',
                                        fieldNo: totalPointInfo?.fieldNo ?? '',
                                        nameCn: name,
                                        nameEn: name,
                                        aliasKey: totalKey ?? '',
                                        unit: unit
                                    }}
                                    value={totalVal}
                                    eventWrap={true}
                                />
                            </>
                                : <CommonDynData
                                    showName={false}
                                    point={{
                                        tableNo: pointInfo.tableNo,
                                        fieldNo: pointInfo.fieldNo,
                                        nameCn: name,
                                        nameEn: name,
                                        aliasKey: key,
                                        unit: unit
                                    }}
                                    value={value}
                                    transform={{
                                        background: color
                                    }}
                                    eventWrap={true}
                                />}
                        </span>
                    </div>
                })
        }
    </div>
}

export default DeviceTooltip