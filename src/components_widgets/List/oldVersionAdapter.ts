/**
 * 历史数据适配
 * 4.5.3 172614 列表筛选逻辑重构兼容老数据，考虑在后续版本移除
 */
import { combinePointKey } from "@/common/utils/model"
import { Quota, ListConfig } from "./types"


/**
 * @deprecated
 */
export const convertQuotaToFilterGroup = (q: Quota): ArrayElement<NonNullable<ListConfig.FilterConfig['filterGroups']>> => {
    return {
        key: combinePointKey(q),
        name: '',
        nameCn: q.nameCn,
        nameEn: q.nameEn,
        tableNo: q.tableNo,
        fieldNo: q.fieldNo,
        alias: q.alias,
        constNameList: q.valueList ?? [],
        conf: getConfFromQuota(q)
    }
}

/**
 * @deprecated
 */
export const getFilterGroupFromOldData = (quotaMap: Record<string, Quota | undefined>): ListConfig.FilterConfig['filterGroups'] => {
    const key = Object.entries(quotaMap).find(([key, value]) => {
        return value?.filter?.universal && key !== 'null'
    })?.[0]
    const q = key ? quotaMap[key] : undefined
    if (!q) return []

    const group: ArrayElement<NonNullable<ListConfig.FilterConfig['filterGroups']>> = convertQuotaToFilterGroup(q)
    return [group]
}


/**
 * @deprecated
 */
export const getConfFromQuota = (q: Quota): TPointConfiguration | undefined => {
    const oldCfg = q.filter?.universal?.valueListStyle ?? []
    const conf: TPointConfiguration = {
        valueMap: q.valueList.reduce((p, c) => {
            const cfg = oldCfg.find(old => old.value === c.value)
            return {
                ...p,
                [c.value]: {
                    icon: cfg?.icon,
                    color: cfg ? [cfg.color] : [],
                    dataSource: cfg?.dataSource ? { ...cfg.dataSource } : undefined,
                    enable: true
                }
            }
        }, {} as NonNullable<TPointConfiguration['valueMap']>)
    }
    return conf
}