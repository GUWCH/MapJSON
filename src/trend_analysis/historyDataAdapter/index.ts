import { Config } from "PointCurve/Configurator"

export const CURRENT_VERSION = '4.5.3'

export type MemoContent = {
    data: Record<string, Config>
    version: string
}

export const convertToNewestVersionMemo = (content: any): MemoContent => {
    const version = 'version' in content ? content.version : '4.5.2'
    if (version === '4.5.2') {
        const memoContent = content as Version452.MemoContent
        return {
            data: Object.fromEntries(Object.entries(memoContent).map(([k, v]) => {
                const newV: Config = {
                    infos: v.infos.map(oldInfo => {
                        return {
                            key: oldInfo.alias,
                            nameCn: oldInfo.nameCn,
                            nameEn: oldInfo.nameEn,
                            assetInfo: oldInfo.assetInfo,
                            relatedTimeKey: '',
                            originPointInfo: {
                                ...oldInfo,
                                ...oldInfo.originPointInfo,
                                conf: oldInfo.conf
                            }
                        }
                    }),
                    common: v.common
                }
                return [k, newV]
            })),
            version: CURRENT_VERSION
        }
    }

    return content as MemoContent
}

namespace Version452 {
    export type MemoContent = Record<string, Config>

    export type Config = {
        infos: Info[]
        common?: {
            left?: {
                max?: number
                min?: number
            }
            right?: {
                max?: number
                min?: number
            }
        }
    }

    export type Info = TPointWithCfg & {
        assetInfo: {
            alias: string
            name: string
        },
        originPointInfo: { // 原始测点信息
            key: string
            nameCn: string
            nameEn: string
        }
    }

    export type DataRecord = {
        alias: string
        /* 2012-03-01 12:22:33
         * @see https://echarts.apache.org/zh/option.html#series-line.data
         */
        time: string
        value: number | string
        status?: string
    }
}


