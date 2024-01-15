import { AggregationEnum, SamplingSizeEnum } from "ParamsGenerator/constant"
import { StaticPoint } from "ParamsGenerator/types"
import { TPointType } from "@/common/constants"
import { TAsset } from "AssetPicker/type"
import { QuickRangeSelectEnum, QuickSelectEnum } from "DatePicker"
export type CompareSpan = 'day' | 'week' | 'month' | 'year' | 'custom'
export type BaseProtoValues = {
    timeRange?: {
        quickValue?: QuickRangeSelectEnum // QuickRangeSelectEnum
        dateValue?: [string | null, string | null]
    }
    compareRange?: {
        span: CompareSpan
        customRangeValue?: {
            quickValue?: QuickRangeSelectEnum
            dateValue?: [string | null, string | null]
        }
        value?: {
            base?: {
                quick?: QuickSelectEnum
                date?: string | null
            }
            compare?: {
                quick?: QuickSelectEnum[]
                date?: string | null
            }
        }
    }
}

export type PointInfoRuleValues = {
    domainId?: string
    modelId?: string
    deviceModel?: string
    assets?: TAsset[]
    samplingSize?: SamplingSizeEnum
    aggregation?: AggregationEnum
    staticPoints?: StaticPoint[]
    pointGroups?: {
        [key in TPointType]?: TPoint[] // key: tableNo, value: pointKey
    }
}
export type PointInfoProtoValues = {
    ruleValues?: PointInfoRuleValues[]
} & Pick<BaseProtoValues, 'timeRange'>

export type SOERuleValues = {
    domainId?: string
    modelId?: string
    deviceModel?: string
    assets?: TAsset[]
    aggregation?: AggregationEnum
    staticPoints?: StaticPoint[]
}

export type SOEProtoValues = {
    ruleValues?: SOERuleValues[]
} & Pick<BaseProtoValues, 'timeRange'>

export type WarnRuleValues = {
    warnLevel?: IWarnLevel[]
    warnType?: IHisWarnType
    domainId?: string
    modelId?: string
    deviceModel?: string
    assets?: TAsset[]
    pointGroups?: {
        [key in TPointType]?: TPoint[] // key: tableNo, value: pointKey
    }
}

export type WarnProtoValues = {
    ruleValues?: WarnRuleValues[]
} & Pick<BaseProtoValues, 'timeRange'>

export type TrendAnalysisRuleValues = {
    domainId?: string
    modelId?: string
    deviceModel?: string
    assets?: TAsset[]
    pointGroups?: {
        [key in TPointType]?: TPoint[] // key: tableNo, value: pointKey
    }
}

export type TrendAnalysisProtoValues = {
    ruleValues?: TrendAnalysisRuleValues[]
    statisticsCols?: string[]
} & Pick<BaseProtoValues, 'compareRange'>

export type ProtoRuleValues = PointInfoRuleValues | SOERuleValues | WarnRuleValues | TrendAnalysisRuleValues
export type ProtoValues = PointInfoProtoValues | SOEProtoValues | WarnProtoValues | TrendAnalysisProtoValues