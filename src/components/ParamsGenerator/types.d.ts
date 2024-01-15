import { Moment } from "moment"
import { SamplingSizeEnum, SamplingSubSizeEnum, AggregationEnum, ProtoKeys } from "./constant"
import { QuickRangeSelectEnum } from 'DatePicker';
import type { ProtoValues } from './TemplateProtoRender/types';

export type Version = '4.5.2.1' | '4.5.3.1'

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
    'samplingSize' | // 采样粒度      
    'dateRange' | // 时间范围，精确到天
    'timeRange' | // 时间范围，精确到秒
    'aggregation' | // 聚合方式
    'warnLevel' | // 告警等级
    'warnType' | // 告警类型
    'grouped' // 组合条件

export type StaticPoint = {
    alias: string
    nameCn: string
    nameEn: string
}

export type Template = {
    isDefault?: boolean
    proto: ProtoKeys
    values?: ProtoValues
    name: string
    key: string
    dataExportParams?: object // 数据导出定时导出所需参数
    version?: Version
}

export type TemplateDesc = {
    cn: { key: string, type: TemplateRuleType, name: string, value: string }[]
    en: { key: string, type: TemplateRuleType, name: string, value: string }[]
}