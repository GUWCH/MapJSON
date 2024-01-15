import { AggregationEnum, SamplingSizeEnum } from "ParamsGenerator/constant"

export const Version452 = '4.5.2'
export type SamplingSizeType = 'wtg_export' | 'normal_export' | 'trend_analysis'

export type StaticPointType =
    'SOE' | // SOE
    'WTG_TEN_AVG' | // 风机十分钟平均
    'WTG_TEN_STC' // 风机十分钟统计
export type TemplateType = 'data_export' | 'trend_analysis'
export type TemplateRuleType =
    'domain' | // 领域
    'model' | // 模型
    'point' | // 测点或静态模型值
    'asset' | // 资产
    'sampling_size' | // 采样粒度      
    'time_range' | // 时间范围，精确到天
    'time_range_time' | // 时间范围，精确到秒
    'aggregation' | // 聚合方式

    'warn_level' | // 告警等级
    'warn_type' // 告警类型

export type StaticPoint = {
    alias: string
    nameCn: string
    nameEn: string
}

export type RuleValue<T extends TemplateRuleType> = _RuleValueMap[T] | undefined
type _RuleValueMap = {
    ['domain']: Omit<IDomainInfo, 'model_id_vec'>
    ['model']: IModelInfo
    ['point']: (TPoint | StaticPoint)[]
    ['asset']: {
        name: string
        alias: string
        facAlias?: string
        model?: string
    }[]
    ['sampling_size']: SamplingSizeEnum
    ['time_range']: {
        quickValue?: string // QuickRangeSelectEnum
        dateValue: [string | null, string | null]
    }
    ['time_range_time']: {
        quickValue?: string // QuickRangeSelectEnum
        dateValue: [string | null, string | null]
    }
    ['aggregation']: AggregationEnum

    ['warn_level']: IWarnLevel[]
    ['warn_type']: IWarnType[]
}

export type TemplateRule = {
    key: string
    type: TemplateRuleType
    required?: boolean
    hide?: boolean
}

export type TemplateProto = {
    key: string
    rules: TemplateRule[]
}

export type Template = {
    isDefault?: boolean
    proto: TemplateProto
    domainId: string
    values: Record<TemplateRuleType, RuleValue<any> | undefined>
    name: string
    key: string
}

export type TemplateDesc = {
    cn: { key: string, type: TemplateRuleType, name: string, value: string }[]
    en: { key: string, type: TemplateRuleType, name: string, value: string }[]
}

export type TextContext = {
    tplName: string
    yes: string
    no: string
    saveSuc: string
    saveFail: string
    removeSuc: string
    removeFail: string

    generatorTitle: string
    editorTitle: string
    proto: string
    cancel: string
    saveAs: string
    save: string
    add: string
    saveAsDefault: string
    saveAsTpl: string
    ruleGroup: string
    baseGroup: string
    selected: string
    fieldEmpty: (field: string) => string

    noTpl: string
    edit: string
    delete: string
    selectPlaceholder: string
    title: string
    defaultAdd: string
    deleteTitle: string
    replaceTitle: string
    replaceContent: string
    updateDefaultFail: string
    deleteContent: (name: string) => string
}