import { Version } from "./types";

export const CURRENT_VERSION: Version = '4.5.3.1'

export enum SamplingSizeEnum {
    one_minute = 'one_minute',
    five_minutes = 'five_minutes',
    ten_minutes = 'ten_minutes',
    ten_minutes_avg = 'ten_minutes_avg', //十分钟平均
    ten_minutes_stc = 'ten_minutes_stc', //十分钟统计
    fifteen_minutes = 'fifteen_minutes',
    thirty_menutes = 'thirty_menutes',
    one_hour = 'one_hour',
    one_day = 'one_day',
}

export enum AggregationEnum {
    device = 'device',
    model = 'model',
    fac = 'fac'
}

export enum ProtoKeys {
    points = 'points', // 数据导出用测点
    points_trend = 'points_trend', // 趋势分析用测点
    warn = 'warn',
    SOE = 'SOE',
}

export const protoNameMap = (isZh: boolean) => ({
    [ProtoKeys.points]: isZh ? '测点数据' : 'Point',
    [ProtoKeys.SOE]: isZh ? '风机SOE' : 'WTG SOE',
    [ProtoKeys.warn]: isZh ? '历史告警' : 'History Alarm'
})

export const samplingSizeNameMap = (isZh: boolean) => ({
    [SamplingSizeEnum.one_minute]: isZh ? '1分钟' : '1 minute',
    [SamplingSizeEnum.five_minutes]: isZh ? '5分钟' : '5 minute',
    [SamplingSizeEnum.ten_minutes]: isZh ? '10分钟' : '10 minute',
    [SamplingSizeEnum.ten_minutes_avg]: isZh ? '10分钟平均' : '10 minute average',
    [SamplingSizeEnum.ten_minutes_stc]: isZh ? '10分钟统计' : '10 minute statistics',
    [SamplingSizeEnum.fifteen_minutes]: isZh ? '15分钟' : '15 minute',
    [SamplingSizeEnum.thirty_menutes]: isZh ? '30分钟' : '30 minute',
    [SamplingSizeEnum.one_hour]: isZh ? '1小时' : '1 hour',
    [SamplingSizeEnum.one_day]: isZh ? '1天' : '1 day',
})

export const aggregationNameMap = (isZh: boolean) => ({
    [AggregationEnum.device]: isZh ? '风机' : 'WTG',
    [AggregationEnum.model]: isZh ? '型号' : 'Model',
    [AggregationEnum.fac]: isZh ? '场站' : 'Factory'
})