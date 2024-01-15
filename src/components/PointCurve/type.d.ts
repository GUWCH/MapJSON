import { TPointType } from "@/common/constants"
import { Moment } from 'moment'

export type Info = {
    key: string
    nameCn: string
    nameEn: string
    relatedTimeKey: string
    assetInfo: {
        alias: string
        name: string
    },
    originPointInfo: { // 原始测点信息
        key: string
    } & TPointWithCfg
}

export type TimeRange = {
    key: string
    name?: string
    st: Moment
    et: Moment
}

export type DataRecord = {
    infoKey: string
    /* 2012-03-01 12:22:33
     * @see https://echarts.apache.org/zh/option.html#series-line.data
     */
    time: string
    /**
     * 事件数据非变位数据，有明确结束时间
     */
    endTime?: string
    value: number | string
    status?: string
    granularity: number
}