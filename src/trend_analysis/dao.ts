import scadaCfg from "@/common/const-scada"
import { _dao, daoIsOk } from "@/common/dao"
import { combineToFullAlias, getDynKey, parseDynKey, parsePointKey } from "@/common/utils/model"
import { DataRecord, Info, TimeRange } from "PointCurve/type"
import moment, { Moment } from "moment"
import { getValueType, i18n } from "./utils"
import { getDecimalFromInfo } from "PointCurve/factory"
import { POINT_FIELD, POINT_TABLE } from "@/common/constants"

const toMultipleOfFive = (n: number) => {
    if (n % 5 === 0) return n
    return n + (5 - n % 5)
}

export default {
    getPointsConst: async (alias: string | string[]): Promise<Record<string, { name: string, value: number }[] | undefined>> => {
        if (!alias || alias.length === 0) {
            return {}
        }
        const res = await _dao.getPointConst(alias)
        if (daoIsOk(res)) {
            return res.data.reduce((p, c) => {
                return {
                    ...p,
                    [c.alias]: c.list
                }
            }, {})
        } else {
            return {}
        }
    },
    getPointsName: async (alias: string[]): Promise<Record<string, string | undefined> | undefined> => {
        const res = await _dao.getInfoByAlias(alias.join(','), 'disp_name')
        if (daoIsOk(res)) {
            return (res.data as {
                alias: string
                disp_name: string
            }[]).reduce((p, c) => {
                return {
                    ...p,
                    [c.alias]: c.disp_name
                }
            }, {})
        } else {
            console.error('fetch points name error, res is not ok')
            return
        }
    },
    getPointsUnit: async (pArr: { fullAlias: string, tableNo: number }[]): Promise<Record<string, string | undefined> | undefined> => {
        const res = await _dao.getDynData(pArr.map(({ fullAlias, tableNo }) => {
            let fieldNo = 0
            if (tableNo === POINT_TABLE.YC) {
                fieldNo = 61
            } else if (tableNo === POINT_TABLE.PROD) {
                fieldNo = 35
            } else {
                console.error('cannot fetch point unit, point type not support')
            }
            return {
                id: '',
                key: getDynKey({ fullAlias, tableNo, field: fieldNo }),
                decimal: ''
            }
        }))

        if (daoIsOk(res)) {
            const result = res.data.reduce((p, c) => {
                const { alias } = parseDynKey(c.key)
                return {
                    ...p,
                    [alias]: c.display_value
                }
            }, {} as Record<string, string | undefined>)
            return result
        }

        console.error('fetch points unit error, res is not ok')
        return undefined
    },
    getDomainAndModels: async () => {
        const nodeAlias = scadaCfg.getCurNodeAlias() as string
        const validDomainsRes = await _dao.getDomainByObjectAlias({ object_alias: nodeAlias, all_domain: true })
        const allDomainsRes = await _dao.getObjects()

        if (daoIsOk(validDomainsRes) && daoIsOk(allDomainsRes)) {
            return allDomainsRes.data.filter(d => validDomainsRes.data.find(vd => vd.domain_id === d.domain_id))
        }
        console.error('get domain and model error, res not ok');
        return []
    },
    getRecords: async (infos: Info[], st: Moment, et: Moment, dataInterval: number): Promise<DataRecord[]> => {
        const arr = [...infos]
        const records: DataRecord[] = []
        const now = moment()
        while (arr.length > 0) {
            const resArr = await Promise.all(arr.splice(0, 5).map((info) => {
                const assetInfo = info.assetInfo
                const pointInfo = info.originPointInfo
                const isDL = info.originPointInfo.tableNo === POINT_TABLE.PROD
                const finalInterval = isDL ? toMultipleOfFive(dataInterval) : dataInterval
                return _dao.getPointHisData({
                    fullAlias: combineToFullAlias(assetInfo.alias, parsePointKey(pointInfo.key).alias),
                    fieldNo: info.originPointInfo.fieldNo,
                    interval: finalInterval,
                    st: pointInfo.conf?.isAccumulate ? st.clone().subtract(dataInterval, 'minute') : st,
                    et: et.isAfter(now) ? now : et,
                    valueType: getValueType(pointInfo.tableNo),
                    decimal: getDecimalFromInfo(info)
                }).then(res => {
                    if (!daoIsOk(res)) {
                        console.error('res not ok')
                        return []
                    }
                    return res.data.map(d => {
                        const commonProps = {
                            infoKey: info.key,
                            granularity: finalInterval
                        }

                        switch (pointInfo.tableNo) {
                            case POINT_TABLE.EVENT: return {
                                ...commonProps,
                                value: d.event_desc ?? '',
                                time: d.start_time ?? '',
                                endTime: d.end_time ?? ''
                            }
                            case POINT_TABLE.STATUS: return {
                                ...commonProps,
                                value: d.sc_desc ?? '',
                                time: d.start_time ?? ''
                            }
                            default: return {
                                ...commonProps,
                                time: d.data_time ?? '',
                                value: d.value ?? '',
                                status: d.status_desc,
                            }
                        }
                    })
                })
            }))
            records.push(...resArr.flat())
        }
        return records
    },
    export: async (
        infos: Info[],
        timeRanges: TimeRange[],
        dataInterval: number,
        save_type: string,
        dataUrl?: string) => {
        const node = await scadaCfg.getCurNodeName(undefined)
        const multiPoint: ArgumentsType<typeof _dao.exportHistoryData>[0]['multi_point'] = []
        infos.forEach(info => {
            const decimal = getDecimalFromInfo(info)
            const range = timeRanges.find(r => r.key === info.relatedTimeKey)
            const st = range?.st
            const et = range?.et
            const intervalNum = info.originPointInfo.tableNo === POINT_TABLE.PROD ?
                toMultipleOfFive(dataInterval) : dataInterval
            if (st && et) {
                const { alias } = parsePointKey(info.originPointInfo.key)
                const originPointInfo = info.originPointInfo
                multiPoint.push({
                    alias: combineToFullAlias(info.assetInfo.alias, alias) + ':' + originPointInfo.fieldNo, // "SXGL.Farm.Statistics.WWPP.APProduction:28"
                    decimal: String(decimal), // "2"
                    et: et.format('YYYY-MM-DD HH:mm:ss'), // "2023-06-27 13:55:00"
                    interval: String(intervalNum), // "5"
                    st: st.format('YYYY-MM-DD HH:mm:ss'), // "2023-06-27 00:00:00"
                    value_type: String(getValueType(originPointInfo.tableNo)) // "2"
                })
            }
        })

        const res = await _dao.exportHistoryData({
            chart: dataUrl,
            file_name: node.name + '_' + i18n('analysis'),
            save_type,
            multi_point: multiPoint
        })

        if (daoIsOk(res)) {
            return res.file_path
        }
    }
}