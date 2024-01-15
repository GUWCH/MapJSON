import { isZh, msgTag } from "@/common/lang";
import moment, { Moment } from "moment";
import React from "react";
import { StaticPoint, Template } from "./types";
import { TemplateProtoRenderI18n, templateProtoRenderI18nDefault } from "./TemplateProtoRender/i18n";
import { TemplateEditorI18n, templateEditorI18nDefault } from "./TemplateEditor/i18n";
import { TemplateSelectorI18n, templateSelectorI18nDefault } from './TemplateSelector/i18n'
import { getPropertyIfExist } from "@/common/utils/object";
import { BaseProtoValues, PointInfoRuleValues, SOERuleValues, WarnRuleValues } from "./TemplateProtoRender/types";
import { QuickRangeSelectEnum, getRangeFromQuick } from "DatePicker";
import { notify } from "Notify";
import { AggregationEnum, ProtoKeys, SamplingSizeEnum, aggregationNameMap, protoNameMap, samplingSizeNameMap } from "./constant";
import { MODEL_ID, POINT_TABLE, scadaVar } from "@/common/constants";
import { DateUtil, ModelUtil } from "@/common/utils";
import { DATE_CUSTOM_FORMAT } from "@/common/const-scada";
import { ifPointMatchModel, splitPointByAlias } from "@/common/utils/model";
import _ from "lodash";

export const convertMoment = (moment: Moment | null) => moment === null ? '' : moment.format()
export const parseMoment = (str?: string | null) => str ? moment(str) : null

const msgFnc = msgTag('paramsGenerator')

const commonI18nDefault = {
    name: msgFnc('common.name'),
    selectPlaceholder: msgFnc('common.selectPlaceholder'),
    saveSuc: msgFnc('common.saveSuc'),
    saveFail: msgFnc('common.saveFail'),
    removeSuc: msgFnc('common.removeSuc'),
    removeFail: msgFnc('common.removeFail'),
    tempQuery: msgFnc('common.tempQuery'),
}

export type TextContext = {
    common: {
        name: string
        selectPlaceholder: string
        saveSuc: string
        saveFail: string
        removeSuc: string
        removeFail: string
        tempQuery: string
    },
    templateSelector: TemplateSelectorI18n
    templateProtoRender: TemplateProtoRenderI18n
    templateEditor: TemplateEditorI18n
}
export const defaultLocaleContext = {
    common: commonI18nDefault,
    templateSelector: templateSelectorI18nDefault,
    templateProtoRender: templateProtoRenderI18nDefault,
    templateEditor: templateEditorI18nDefault
}

export type ComponentContextValue = {
    locale: TextContext,
    tplList: Template[]
    loadingTplList: boolean
    updateTplList: () => void
}

export const ComponentContext = React.createContext<ComponentContextValue>({
    locale: defaultLocaleContext,
    tplList: [],
    loadingTplList: false,
    updateTplList: () => { }
})


type PointsExportParams = {
    assets: {
        alias: string
        name: string
        model?: string
    }[],
    samplingSize: SamplingSizeEnum,
    aggregation: AggregationEnum
    points: (TPoint | StaticPoint)[]
    st: Moment
    et: Moment
    domain: {
        id: string
        name: string
    },
    model: {
        id: string
        name: string
    }
}
type SOEExportParams = {
    assets: {
        alias: string
        name: string
        model?: string
    }[],
    points: (TPoint | StaticPoint)[]
    st: Moment
    et: Moment
    aggregation: AggregationEnum
}

type WarnExportParams = {
    st: Moment
    et: Moment
    types: IHisWarnType[]
    levels: IWarnLevel[]
    domain?: {
        id: string
        name: string
    },
    assets: {
        facAlias?: string
        alias: string
        name: string
    }[],
}
export const getDataExportParams = (tpl: Omit<Template, 'key'>, domainInfos: IDomainInfo[]) => {
    const i18n = msgTag('dataExport')
    const i18n_param = msgTag('paramsGenerator')

    const timeRangeFromTpl = getPropertyIfExist(tpl.values, 'timeRange') as BaseProtoValues['timeRange'] | undefined
    const dynamicDate = timeRangeFromTpl?.quickValue
    const dateFromDyn = dynamicDate ? getRangeFromQuick(dynamicDate as QuickRangeSelectEnum) : undefined
    const dateFromValue = (timeRangeFromTpl?.dateValue ?? [null, null]).map(v => parseMoment(v))
    const dateValue = dateFromDyn ?? dateFromValue
    const st = dateValue?.[0]
    const et = dateValue?.[1]
    if (!st) {
        notify(i18n('validteError.st'))
        return
    }
    if (!et) {
        notify(i18n('validteError.et'))
        return
    }
    if (!tpl.values || tpl.values.ruleValues?.length === 0) {
        console.error('tpl has no rule')
        return
    }

    let dataExportParams: {
        dataReqList?: IPointDataExport[]
        warnReqList?: IWarnDataExport[]
    } = {}
    const timeFormat = 'YYYY-MM-DD'
    const getTimeParams = () => {
        const gFieldDate = scadaVar('g_field_date')
        return {
            dateFormat: gFieldDate?.yyyy_MM_dd_format,
            timeFormat: gFieldDate?.hh_mm_ss_format,
            utc: gFieldDate?.time_zone?.toString(),
            datetime: DateUtil.getStdFromDate(gFieldDate?.time),
        }
    }
    const mapSamplingSizeToParam = (size: SamplingSizeEnum) => {
        if (size === SamplingSizeEnum.one_minute) {
            return {
                type: 'minute',
                typeName: i18n('samplingSize.one_min')
            }
        } else if (size === SamplingSizeEnum.ten_minutes_stc) {
            return {
                type: 'ten_minutes',
                typeName: i18n('samplingSize.ten_min_st')
            }
        } else if (size === SamplingSizeEnum.ten_minutes_avg) {
            return {
                type: 'ten_avg_val',
                typeName: i18n('samplingSize.ten_min_avg')
            }
        } else if (size === SamplingSizeEnum.ten_minutes) {
            return {
                type: 'ten_minute',
                typeName: i18n('samplingSize.ten_min')
            }
        } else if (size === SamplingSizeEnum.fifteen_minutes) {
            return {
                type: 'fifteen_minute',
                typeName: i18n('samplingSize.fifteen_min')
            }
        } else if (size === SamplingSizeEnum.five_minutes) {
            return {
                type: 'five_minute',
                typeName: i18n('samplingSize.five_min')
            }
        } else if (size === SamplingSizeEnum.thirty_menutes) {
            return {
                type: 'thirty_minute',
                typeName: i18n('samplingSize.thirty_min')
            }
        } else if (size === SamplingSizeEnum.one_hour) {
            return {
                type: 'hour',
                typeName: i18n('samplingSize.one_hour')
            }
        } else if (size === SamplingSizeEnum.one_day) {
            return {
                type: 'day',
                typeName: i18n('samplingSize.one_day')
            }
        }

        return {
            type: '',
            typeName: ''
        }
    }
    const combineSOEExportInfo = ({
        assets, points, st, et, aggregation
    }: Omit<SOEExportParams, ''>) => {
        const info: {
            type: string
            conditions: IExportConditionDTO[]
        } = {
            type: protoNameMap(isZh)[ProtoKeys.SOE],
            conditions: []
        }
        const aggregationMap = aggregationNameMap(isZh)
        info.conditions.push(
            {
                name: i18n_param('templateEditor.selectProto') + ':',
                value: protoNameMap(isZh)[ProtoKeys.SOE]
            },
            {
                name: i18n_param('templateProtoRender.ruleName.point') + ':',
                value: points.map(p => (isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.time') + ':',
                showInAbstract: true,
                value: st.format(DATE_CUSTOM_FORMAT.DATE) + ' ~ ' + et.format(DATE_CUSTOM_FORMAT.DATE)
            },
            {
                name: i18n_param('templateProtoRender.ruleName.asset') + ':',
                value: assets.map(d => d.name).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.aggregation') + ':',
                value: aggregationMap[aggregation]
            }
        )
        return info
    }
    const combinePointsExportInfo = ({
        assets, samplingSize, points, st, et, domain, model, aggregation
    }: PointsExportParams) => {
        const info: {
            type: string
            conditions: IExportConditionDTO[]
        } = {
            type: model.name,
            conditions: []
        }
        const samplingSizeMap = samplingSizeNameMap(isZh)
        const aggregationMap = aggregationNameMap(isZh)
        info.conditions.push(
            {
                name: i18n_param('templateEditor.selectProto') + ':',
                value: protoNameMap(isZh)[ProtoKeys.points]
            },
            {
                name: i18n_param('templateProtoRender.ruleName.domain') + ':',
                value: domain.name
            },
            {
                name: i18n_param('templateProtoRender.ruleName.model') + ':',
                value: model.name
            },
            {
                name: i18n_param('templateProtoRender.ruleName.point') + ':',
                value: points.map(p => (isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.time') + ':',
                showInAbstract: true,
                value: st.format(DATE_CUSTOM_FORMAT.DATE) + ' ~ ' + et.format(DATE_CUSTOM_FORMAT.DATE)
            },
            {
                name: i18n_param('templateProtoRender.ruleName.asset') + ':',
                value: assets.map(d => d.name).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.samplingSize') + ':',
                value: samplingSizeMap[samplingSize]
            },
        )
        model.id === MODEL_ID.WTG && info.conditions.push({
            name: i18n_param('templateProtoRender.ruleName.aggregation') + ':',
            value: aggregationMap[aggregation]
        })
        return info
    }

    const combineWarnExportInfo = ({
        assets, st, et, types, levels
    }: Omit<WarnExportParams, 'domain'>) => {
        const info: {
            type: string
            conditions: IExportConditionDTO[]
        } = {
            type: protoNameMap(isZh)[ProtoKeys.warn],
            conditions: []
        }
        info.conditions.push(
            {
                name: i18n_param('templateEditor.selectProto') + ':',
                value: protoNameMap(isZh)[ProtoKeys.warn]
            },
            {
                name: i18n_param('templateProtoRender.ruleName.warnLevel') + ':',
                value: levels.map(l => l.name).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.warnType') + ':',
                value: types.map(t => t.table_name).join(',')
            },
            {
                name: i18n_param('templateProtoRender.ruleName.time') + ':',
                showInAbstract: true,
                value: st.format(DATE_CUSTOM_FORMAT.DATE) + ' ~ ' + et.format(DATE_CUSTOM_FORMAT.DATE)
            },
            {
                name: i18n_param('templateProtoRender.ruleName.asset') + ':',
                value: assets.map(d => d.name).join(',')
            },
        )
        return info
    }

    if (tpl.proto === ProtoKeys.points) {
        const params: PointsExportParams[] = []
        for (const v of tpl.values.ruleValues as PointInfoRuleValues[]) {
            if (!v.assets || v.assets.length === 0) {
                notify(i18n('validteError.asset'))
                return
            }
            const domain = domainInfos.find(d => d.domain_id === v.domainId)!
            const model = domain.model_id_vec.find(m => m.model_id === v.modelId)!

            params.push({
                assets: v.assets?.map(a => ({
                    name: a.name,
                    alias: a.key,
                    model: a.model
                })) ?? [],
                samplingSize: v.samplingSize!,
                aggregation: v.aggregation!,
                points: v.staticPoints && v.staticPoints.length > 0 ? v.staticPoints :
                    Object.entries(v.pointGroups ?? {}).flatMap(([k, v]) => v),
                st: st,
                et: et,
                domain: {
                    id: domain.domain_id,
                    name: isZh ? domain.domain_name_cn : domain.domain_name
                },
                model: {
                    id: model.model_id,
                    name: isZh ? model.model_name_cn : model.model_name
                }
            })
        }

        dataExportParams.dataReqList = params.map(param => {
            const { model, samplingSize, points, assets, st, et, aggregation } = param
            const isWTG = model.id === MODEL_ID.WTG
            const timeParams = getTimeParams()

            const _typeInfo = mapSamplingSizeToParam(samplingSize)

            const getTypeInfo = (isYX?: boolean) => {
                return isYX ? {
                    type: 'DI',
                    typeName: i18n('DItitle')
                } : _typeInfo
            }

            const commonProps = {
                starttime: st.format(timeFormat),
                endtime: et.format(timeFormat),
                domain_id: '-1',
                condition_plain: encodeURIComponent(JSON.stringify(combinePointsExportInfo(param))),
                date_format: timeParams.dateFormat,
                time_format: timeParams.timeFormat,
                utc: timeParams.utc,
                datetime: timeParams.datetime,
            }

            const yxPoints: TPoint[] = []
            const normalPoints: (TPoint | StaticPoint)[] = []
            points.forEach(p => {
                if ('tableNo' in p && p.tableNo === POINT_TABLE.YX) {
                    yxPoints.push(p)
                } else {
                    normalPoints.push(p)
                }
            })

            if (isWTG) {

                const constructConditions = (pointArr: (TPoint | StaticPoint)[], isYX?: boolean) => {
                    const { type, typeName } = getTypeInfo(isYX)
                    if (pointArr.length === 0) {
                        return []
                    }

                    const conditionGroups: Record<string, {
                        model: string
                        type: string
                        type_name: string
                        fields: string
                        fields_name: string
                        wtgs: {
                            alias: string
                            name: string
                            parent: string
                        }[]
                    }> = {}

                    assets.forEach(wtg => {
                        const g = conditionGroups[wtg.model ?? '']
                        const point = pointArr.filter(p => {
                            if ('tableNo' in p) {
                                return ifPointMatchModel(p, wtg.model)
                            }
                            return true
                        }).flatMap(p => {
                            if ('tableNo' in p) {
                                return splitPointByAlias(p).map(p => ({
                                    alias: p.alias + (samplingSize === SamplingSizeEnum.ten_minutes_avg ? '_AVG' : ''),
                                    name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                        ('unit' in p && p.unit ? `(${p.unit})` : '')
                                }))
                            }
                            return {
                                alias: p.alias,
                                name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                    ('unit' in p && p.unit ? `(${p.unit})` : '')
                            }
                        })
                        const w = {
                            alias: wtg.alias,
                            name: wtg.name,
                            point,
                            parent: wtg.alias.split('.')[0]
                        }
                        if (g) {
                            g.wtgs.push(w)
                        } else {
                            conditionGroups[wtg.model ?? ''] = {
                                model: wtg.model ?? '',
                                type: type,
                                type_name: typeName,
                                fields: '',
                                fields_name: '',
                                wtgs: [w]
                            }
                        }
                    })

                    return Object.entries(conditionGroups).map(v => v[1])
                }

                let aggType: IPointDataExport['agg_type']
                switch (aggregation) {
                    case AggregationEnum.fac: aggType = 'fac'; break;
                    case AggregationEnum.model: aggType = 'wtg_model'; break;
                    default: aggType = 'wtg'
                }

                return {
                    ...commonProps,
                    condition: constructConditions(normalPoints).concat(constructConditions(yxPoints, true)),
                    dt_type: 'wtg_new',
                    agg_type: aggType
                }
            } else {

                const constructConditions = (pointArr: (TPoint | StaticPoint)[], isYX?: boolean) => {
                    const { type, typeName } = getTypeInfo(isYX)
                    if (pointArr.length === 0) {
                        return []
                    }

                    return assets.map(a => {
                        const point = pointArr.filter(p => {
                            if ('tableNo' in p) {
                                return ifPointMatchModel(p, a.model)
                            }
                            return true
                        }).flatMap(p => {
                            if ('tableNo' in p) {
                                return splitPointByAlias(p).map(p => ({
                                    alias: ModelUtil.combineToFullAlias(a.alias, p.alias),
                                    name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                        ('unit' in p && p.unit ? `(${p.unit})` : '')
                                }))
                            }
                            return {
                                alias: ModelUtil.combineToFullAlias(a.alias, p.alias),
                                name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                    ('unit' in p && p.unit ? `(${p.unit})` : '')
                            }
                        })

                        return {
                            fields: '',
                            fields_name: '',
                            model: model.id,
                            type, type_name: typeName,
                            wtgs: [{
                                alias: a.alias,
                                name: a.name,
                                point,
                                parent: a.name
                            }]
                        }
                    })
                }

                return {
                    ...commonProps,
                    condition: constructConditions(normalPoints).concat(constructConditions(yxPoints, true)),
                    dt_type: model.id,
                    agg_type: 'pack'
                }
            }
        })
    }
    if (tpl.proto === ProtoKeys.SOE) {
        const params: SOEExportParams[] = []
        for (const v of tpl.values.ruleValues as SOERuleValues[]) {
            if (!v.assets || v.assets.length === 0) {
                notify(i18n('validteError.asset'))
                return
            }
            params.push({
                assets: v.assets.map(a => ({
                    alias: a.key,
                    name: a.name,
                    model: a.model
                })),
                points: v.staticPoints ?? [],
                st: st,
                et: et,
                aggregation: v.aggregation!
            })
        }

        dataExportParams.dataReqList = params.map(param => {
            const { points, assets, st, et, aggregation } = param
            const timeParams = getTimeParams()
            const commonProps = {
                starttime: st.format(timeFormat),
                endtime: et.format(timeFormat),
                domain_id: '-1',
                condition_plain: encodeURIComponent(JSON.stringify(combineSOEExportInfo(param))),
                date_format: timeParams.dateFormat,
                time_format: timeParams.timeFormat,
                utc: timeParams.utc,
                datetime: timeParams.datetime,
            }

            const yxPoints: TPoint[] = []
            const normalPoints: (TPoint | StaticPoint)[] = []
            points.forEach(p => {
                if ('tableNo' in p && p.tableNo === POINT_TABLE.YX) {
                    yxPoints.push(p)
                } else {
                    normalPoints.push(p)
                }
            })

            const constructConditions = (pointArr: (TPoint | StaticPoint)[], isYX?: boolean) => {
                if (pointArr.length === 0) {
                    return []
                }

                const conditionGroups: Record<string, {
                    model: string
                    type: string
                    type_name: string
                    fields: string
                    fields_name: string
                    wtgs: {
                        alias: string
                        name: string
                        parent: string
                    }[]
                }> = {}

                assets.forEach(wtg => {
                    const g = conditionGroups[wtg.model ?? '']
                    const point = points.filter(p => {
                        if ('tableNo' in p) {
                            return ifPointMatchModel(p, wtg.model)
                        }
                        return true
                    }).flatMap(p => {
                        if ('tableNo' in p) {
                            return splitPointByAlias(p).map(p => ({
                                alias: p.alias,
                                name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                    ('unit' in p && p.unit ? `(${p.unit})` : '')
                            }))
                        }
                        return {
                            alias: p.alias,
                            name: ((isZh ? p.nameCn : p.nameEn) || ('name' in p ? p.name : '')) +
                                ('unit' in p && p.unit ? `(${p.unit})` : '')
                        }
                    })
                    const w = {
                        alias: wtg.alias,
                        name: wtg.name,
                        parent: '',
                        point
                    }
                    if (g) {
                        g.wtgs.push(w)
                    } else {
                        conditionGroups[wtg.model ?? ''] = {
                            model: wtg.model ?? '',
                            type: isYX ? 'DI' : 'sc_event',
                            type_name: isYX ? i18n('DItitle') : 'SOE',
                            fields: '',
                            fields_name: '',
                            wtgs: [w]
                        }
                    }
                })

                return Object.entries(conditionGroups).map(v => v[1])
            }


            return {
                ...commonProps,
                condition: constructConditions(normalPoints).concat(constructConditions(yxPoints, true)),
                dt_type: 'wtg_new',
                agg_type: aggregation === AggregationEnum.device ? 'wtg' : 'wtg_model',
            }
        })
    }
    if (tpl.proto === ProtoKeys.warn) {
        const params: WarnExportParams[] = []
        for (const v of tpl.values.ruleValues as WarnRuleValues[]) {
            const domain = domainInfos.find(d => d.domain_id === v.domainId)

            params.push({
                levels: v.warnLevel ?? [],
                types: v.warnType ? [v.warnType] : [],
                assets: v.assets?.map(a => ({
                    name: a.name,
                    alias: a.key,
                    facAlias: a.facAlias
                })) ?? [],
                st: st,
                et: et,
                domain: domain ? {
                    id: domain.domain_id,
                    name: isZh ? domain.domain_name_cn : domain.domain_name
                } : undefined
            })
        }
        dataExportParams.warnReqList = params.map(param => {
            const { st, et, types, levels, assets = [], domain } = param

            const timeParams = getTimeParams()
            const assetsGroup = _.groupBy(assets, a => a.facAlias ?? '')

            const stMoment = st.clone().startOf('day')
            const etMoment = et.clone().endOf('day')

            return {
                start_time: stMoment.format('YYYY-MM-DD HH:mm:ss'),
                end_time: etMoment.format('YYYY-MM-DD HH:mm:ss'),
                // start_time: st.format(timeFormat),
                // end_time: et.format(timeFormat),
                alarm_level: levels.map(l => ({
                    alarm_level_id: String(l.id),
                    alarm_level_name: l.name
                })),
                alarm_type: types.map(t => ({
                    alarm_type_id: String(t.table_id),
                    alarm_type_name: t.table_name
                })),
                obj_list: _.map(assetsGroup, (assets, facAlias) => {
                    let finalFacAlias = ''
                    if (facAlias) {
                        finalFacAlias = facAlias
                    } else {
                        finalFacAlias = assets[0]?.alias?.split('.')?.[0] ?? ''
                    }

                    return {
                        fac_alias: finalFacAlias,
                        is_all: true,
                        wtg_list: assets,
                    }
                }),
                domain_id: '-1',
                time_format: timeParams.timeFormat,
                date_format: timeParams.dateFormat,
                date_time: timeParams.datetime,
                utc: timeParams.utc,
                condition_plain: encodeURIComponent(JSON.stringify(combineWarnExportInfo(param)))
            }
        })
    }

    return dataExportParams
}