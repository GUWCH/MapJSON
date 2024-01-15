import { POINT_TABLE, TPointType } from "@/common/constants";
import { msgTag } from "@/common/lang";
import { momentToLogStr } from "@/common/utils/debug";
import { Info, TimeRange } from "PointCurve/type";

export const i18n = msgTag('trendAnalysis')

export const getValueType = (t: typeof POINT_TABLE[TPointType] | 'event' | 'status') => {
    switch (String(t)) {
        case String(POINT_TABLE.YC): return 1;
        case String(POINT_TABLE.PROD): return 2;
        case String(POINT_TABLE.YX): return 3;
        case 'event': return 4;
        default: return 5
    }
}


/**
 * 总数据量 = 点数量 * 资产数量 * （总时长 / 数据间隔）
 * => 数据间隔 = 点数量 * 资产数量 * 总时长 / 总数据量
 */
export const getGranularity = (ranges: TimeRange[], infos: Info[]) => {
    const totalMinutes = ranges.reduce((pre, cur) => {
        const diffMinutes = cur.et.diff(cur.st, 'minutes', true)
        return pre + diffMinutes
    }, 0)

    const firstRange = ranges[0]
    if (!firstRange) {
        console.error('no range found!')
        return 1
    }
    const finalInfos = infos.filter(info => {
        return info.originPointInfo.tableNo !== POINT_TABLE.YX && info.relatedTimeKey === firstRange.key
    })
    if (finalInfos.length === 0 || totalMinutes === 0) return 1

    const totalDataNum = 1000
    const result = Math.ceil(finalInfos.length * totalMinutes / totalDataNum)
    console.debug('ranges', ranges.map(r => momentToLogStr(r.st) + '~' + momentToLogStr(r.et)))
    console.debug('totalMinutes,infos,finalInfos,result', totalMinutes, infos, finalInfos, result)
    return result
}