import { CURRENT_VERSION, ProtoKeys } from "ParamsGenerator/constant"
import { StaticPoint, Template } from "ParamsGenerator/types"
import * as _452 from './type4_5_2_1'
import _ from "lodash"
import { QuickRangeSelectEnum } from "DatePicker"
import { getPointTypeNameByTableNo } from "@/common/utils/model"
import { ProtoRuleValues } from "ParamsGenerator/TemplateProtoRender/types"

const convert452ToNewest = (tpl: _452.Template): Template => {
    const timeValues = (tpl.values['time_range'] || tpl.values['time_range_time']) as _452.RuleValue<'time_range'>
    const domainValue = tpl.values['domain'] as _452.RuleValue<'domain'>
    const modelValue = tpl.values['model'] as _452.RuleValue<'model'>
    const pointValue = tpl.values['point'] as _452.RuleValue<'point'>
    const points: TPoint[] = []
    const staticPoints: StaticPoint[] = []
    pointValue?.forEach(p => {
        if ('tableNo' in p) {
            points.push(p)
        } else {
            staticPoints.push(p)
        }
    })

    const assetValue = tpl.values['asset'] as _452.RuleValue<'asset'>
    const samplingSizeValue = tpl.values['sampling_size'] as _452.RuleValue<'sampling_size'>
    const aggregationValue = tpl.values['aggregation'] as _452.RuleValue<'aggregation'>
    const warnLevelValue = tpl.values['warn_level'] as _452.RuleValue<'warn_level'>
    const warnTypeValue = tpl.values['warn_type'] as _452.RuleValue<'warn_type'>
    return {
        key: tpl.key,
        isDefault: tpl.isDefault,
        name: tpl.name,
        proto: tpl.proto.key as ProtoKeys,
        values: {
            timeRange: timeValues ? {
                quickValue: timeValues.quickValue as QuickRangeSelectEnum | undefined,
                dateValue: timeValues.dateValue
            } : undefined,
            ruleValues: [{
                domainId: domainValue?.domain_id,
                modelId: modelValue?.model_id,
                pointGroups: points?.reduce((p, c) => {
                    const t = getPointTypeNameByTableNo(c.tableNo)
                    return {
                        ...p,
                        [t]: p
                    }
                }, {}),
                assets: assetValue?.map(a => ({
                    key: a.alias,
                    name: a.name,
                    model: a.model,
                    facAlias: a.facAlias
                })),
                samplingSize: samplingSizeValue,
                aggregation: aggregationValue,
                warnType: warnTypeValue,
                warnLevel: warnLevelValue
            } as ProtoRuleValues]
        },
        version: CURRENT_VERSION
    }
}

export const toNewestVersionTemplate = (tpl: any): Template => {
    if (!tpl.version || tpl.version === _452.Version452) {
        return convert452ToNewest(tpl as _452.Template)
    }

    return tpl as Template
}