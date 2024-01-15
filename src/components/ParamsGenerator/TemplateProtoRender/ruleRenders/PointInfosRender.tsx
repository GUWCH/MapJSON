import { MODEL_ID, POINT_TABLE, TPointType } from "@/common/constants"
import { default as AssetAndPointPicker } from "AssetAndPointPicker"
import { ProtoKeys, SamplingSizeEnum } from "ParamsGenerator/constant"
import { ComponentContext, TextContext } from "ParamsGenerator/utils"
import { SelectWithTitle } from "Select/StyledAntSelect"
import React, { useContext, useMemo } from "react"
import { PointInfoRuleValues } from "../types"
import { useAggregationSelectOpts, useSamplingSizeSelectOpts, useStaticPoints } from "../util"
import styles from './render.module.scss'
import { StaticPoint } from "ParamsGenerator/types"
import { notify } from "Notify"

export const validatePointInfoRuleValues = (v: PointInfoRuleValues, context: TextContext) => {
    const alertEmpty = (name: string) => {
        notify(context.templateEditor.fieldEmpty(name))
    }

    const ruleNames = context.templateProtoRender.ruleName
    if (!v.domainId) {
        alertEmpty(ruleNames.domain)
        return false
    }
    if (!v.modelId) {
        alertEmpty(ruleNames.model)
        return false
    }
    if (v.modelId === MODEL_ID.WTG && !v.aggregation) {
        alertEmpty(ruleNames.aggregation)
        return false
    }

    const allPoints = Object.entries(v.pointGroups ?? {}).flatMap(entry => entry[1]) ?? []
    const staticPoints = v.staticPoints ?? []
    if (allPoints.length === 0 && staticPoints.length === 0) {
        alertEmpty(ruleNames.point)
        return false
    }

    if (!v.samplingSize && allPoints.find(p => p.tableNo !== POINT_TABLE.YX)) {
        alertEmpty(ruleNames.samplingSize)
        return false
    }
    return true
}

const PointInfoRuleRender = ({
    values, onValuesChange
}: {
    values?: PointInfoRuleValues
    onValuesChange: (v: PointInfoRuleValues) => void
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)

    const samplingSizeOpts = useSamplingSizeSelectOpts(ProtoKeys.points, values?.modelId)
    const aggregationOpts = useAggregationSelectOpts(ProtoKeys.points)
    const { sPoints, opts: staticPointsOpts } = useStaticPoints(ProtoKeys.points)

    const pointTypes = useMemo(() => {
        const types: TPointType[] = ['YC', 'PROD', 'YX']
        return types
    }, [])
    const onlyHaveYX = !!values?.pointGroups?.YX?.length && 
        !pointTypes.find(t => t !== 'YX' && values?.pointGroups?.[t]?.length)

    return <div className={styles.container}>
        <div className={styles.assets_points}>
            <AssetAndPointPicker withAsset pointTypes={pointTypes}
                withPoint={values?.samplingSize !== SamplingSizeEnum.ten_minutes_stc}
                value={{
                    domainValues: {
                        domainId: values?.domainId,
                        modelId: values?.modelId,
                        deviceModel: values?.deviceModel
                    },
                    assets: values?.assets,
                    points: values?.pointGroups
                }} onValueChange={(v) => {
                    const preModelId = values?.modelId
                    const curModelId = v.domainValues?.modelId
                    const shouldClearAggregation = preModelId !== curModelId
                    const shouldClearStaticPoint = preModelId !== curModelId &&
                        (preModelId === MODEL_ID.WTG || curModelId === MODEL_ID.WTG)
                    const shouldClearSamplingSize = preModelId !== curModelId &&
                        (preModelId === MODEL_ID.WTG || curModelId === MODEL_ID.WTG)

                    onValuesChange({
                        ...values,
                        samplingSize: shouldClearSamplingSize ? undefined : values?.samplingSize,
                        aggregation: shouldClearAggregation ? undefined : values?.aggregation,
                        staticPoints: shouldClearStaticPoint ? undefined : values?.staticPoints,
                        domainId: v.domainValues?.domainId,
                        modelId: v.domainValues?.modelId,
                        deviceModel: v.domainValues?.deviceModel,
                        assets: v.assets,
                        pointGroups: v.points
                    })
                }} />
        </div>
        <div className={styles.other}>
            <SelectWithTitle innerName={{ text: locale.ruleName.samplingSize, required: true }}
                disabled={onlyHaveYX}
                options={samplingSizeOpts}
                value={values?.samplingSize} onChange={v => {
                    const needClear = v === SamplingSizeEnum.ten_minutes_stc ||
                        values?.samplingSize === SamplingSizeEnum.ten_minutes_stc
                    onValuesChange({
                        ...values,
                        samplingSize: v,
                        pointGroups: needClear ? {} : values?.pointGroups,
                        staticPoints: needClear ? [] : values?.staticPoints
                    })
                }} />
            {values?.modelId === MODEL_ID.WTG &&
                <SelectWithTitle innerName={{ text: locale.ruleName.aggregation, required: true }}
                    options={aggregationOpts}
                    value={values.aggregation} onChange={v => onValuesChange({
                        ...values,
                        aggregation: v
                    })}
                />}
            {values?.samplingSize === SamplingSizeEnum.ten_minutes_stc &&
                <SelectWithTitle mode='multiple' innerName={{ text: locale.ruleName.staticPoint }}
                    options={staticPointsOpts}
                    value={values.staticPoints?.map(p => p.alias)} onChange={v => onValuesChange({
                        ...values,
                        staticPoints: v.map(alias => sPoints.find(p => p.alias === alias)).filter(p => p) as StaticPoint[]
                    })}
                />}
        </div>
    </div>
}

export default PointInfoRuleRender