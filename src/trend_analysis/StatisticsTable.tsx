import { AutoFitTable } from 'AntTable'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './StatisticsTable.module.scss'
import { DataRecord, Info, TimeRange } from 'PointCurve/type'
import _ from 'lodash'
import { TableProps } from 'antd'
import { i18n } from './utils'
import { isZh } from '@/common/util-scada'
import { DATE_CUSTOM_FORMAT } from '@/common/const-scada'
import { POINT_TABLE } from '@/common/constants'
import { msgTag } from '@/common/lang'
import { getPropertyIfExist } from '@/common/utils/object'
import { convertDigitalPointValue, getDecimalFromPoint } from '@/common/utils/model'
import moment from 'moment'
const paramsI18n = msgTag('paramsGenerator')

type TableRecord = {
    key: string
    name: string
    rangeStr: string
    max?: string
    maxOccurTime?: string
    min?: string
    minOccurTime?: string
    avg?: string
    granularity?: number
}
export type StatisticsTableProps = {
    timeRanges: TimeRange[]
    infos: Info[]
    records: DataRecord[]
    rangeFormater: 'day' | 'time'
    displayCols?: string[]
}
const StatisticsTable: React.FC<StatisticsTableProps> = ({
    timeRanges, infos, records, rangeFormater, displayCols
}) => {
    const [tableRecords, setTableRecords] = useState<TableRecord[]>([])

    const cols = useMemo<TableProps<TableRecord>['columns']>(() => {
        if (!displayCols || displayCols.length === 0) {
            return []
        }

        const cols: TableProps<TableRecord>['columns'] = [{
            dataIndex: 'name',
            title: i18n('table.name'),
            width: 200,
            fixed: 'left',
        }, {
            dataIndex: 'rangeStr',
            title: i18n('table.range'),
            width: 350
        }]

        displayCols.forEach(c => {
            switch (c) {
                case 'max': cols.push({
                    dataIndex: 'max',
                    title: paramsI18n('templateProtoRender.statisticsEnum.max'),
                    width: 150
                }); break;
                case 'maxOccur': cols.push({
                    dataIndex: 'maxOccurTime',
                    title: paramsI18n('templateProtoRender.statisticsEnum.maxOccur'),
                    width: 200
                }); break;
                case 'min': cols.push({
                    dataIndex: 'min',
                    title: paramsI18n('templateProtoRender.statisticsEnum.min'),
                    width: 150
                }); break;
                case 'minOccur': cols.push({
                    dataIndex: 'minOccurTime',
                    title: paramsI18n('templateProtoRender.statisticsEnum.minOccur'),
                    width: 200
                }); break;
                case 'avg': cols.push({
                    dataIndex: 'avg',
                    title: paramsI18n('templateProtoRender.statisticsEnum.avg'),
                    width: 150
                }); break;
                case 'granularity': cols.push({
                    dataIndex: 'granularity',
                    title: paramsI18n('templateProtoRender.statisticsEnum.granularity'),
                    width: 150,
                    render(value: number | undefined) {
                        if (value === undefined) return ''
                        return value + 'min'
                    },
                }); break;
            }
        })

        return cols
    }, [displayCols])

    useEffect(() => {
        const recordsGroupByInfo = _.groupBy(records, r => r.infoKey)
        const otherInfos = infos.filter(info => info.originPointInfo.tableNo !== POINT_TABLE.YX)
        const newRecords = otherInfos.map(info => {
            const allRecords = recordsGroupByInfo[info.key] ?? []
            const range = timeRanges.find(t => t.key === info.relatedTimeKey)
            const st = range?.st.format(rangeFormater === 'day' ? DATE_CUSTOM_FORMAT.DATE : DATE_CUSTOM_FORMAT.DATE_TIME)
            const et = range?.et.format(rangeFormater === 'day' ? DATE_CUSTOM_FORMAT.DATE : DATE_CUSTOM_FORMAT.DATE_TIME)

            const convertedRecords = allRecords.map((r, index, arr) => {
                const pre = arr[index - 1]
                const { value, ...rest } = r
                return {
                    ...rest,
                    value: convertDigitalPointValue(value, info.originPointInfo, pre?.value)
                }
            }).filter(r => r.value !== undefined)

            const maxR = _.maxBy(convertedRecords, r => _.toNumber(r.value))
            const minR = _.minBy(convertedRecords, r => _.toNumber(r.value))
            const avg = _.meanBy(convertedRecords, r => _.toNumber(r.value))


            const decimal = getDecimalFromPoint(info.originPointInfo)
            const convert = info.originPointInfo.conf?.convert
            const unit = (convert ? getPropertyIfExist(convert, 'unit') : undefined) ?? info.originPointInfo.unit
            return {
                key: info.key,
                name: (isZh ? info.nameCn : info.nameEn) + (unit ? `(${unit})` : ''),
                rangeStr: st + ' ~ ' + et,
                max: maxR?.value,
                maxOccurTime: maxR?.time ? moment(maxR.time).format(DATE_CUSTOM_FORMAT.DATE_TIME) : '',
                min: minR?.value,
                minOccurTime: minR?.time ? moment(minR.time).format(DATE_CUSTOM_FORMAT.DATE_TIME) : '',
                avg: avg === undefined ? undefined : _.round(avg, decimal).toFixed(decimal),
                granularity: allRecords[0]?.granularity
            }
        })
        setTableRecords(newRecords)
    }, [records])

    return <div className={styles.container}>
        <AutoFitTable columns={cols ?? []} dataSource={tableRecords} pagination={false} />
    </div>
}

export default StatisticsTable