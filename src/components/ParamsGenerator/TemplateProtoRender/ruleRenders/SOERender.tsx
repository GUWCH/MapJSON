import { ProtoKeys } from "ParamsGenerator/constant"
import { StaticPoint } from "ParamsGenerator/types"
import { ComponentContext, TextContext } from "ParamsGenerator/utils"
import { SelectWithTitle } from "Select/StyledAntSelect"
import React, { useContext } from "react"
import { SOERuleValues } from "../types"
import { useAggregationSelectOpts, useStaticPoints } from "../util"
import styles from './render.module.scss'
import { notify } from "Notify"
import AssetAndPointPicker from "AssetAndPointPicker"

export const validateSOERuleValues = (v: SOERuleValues, context: TextContext) => {
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
    if (!v.aggregation) {
        alertEmpty(ruleNames.aggregation)
        return false
    }
    if (!v.staticPoints || v.staticPoints.length === 0) {
        alertEmpty(ruleNames.point)
        return false
    }

    return true
}

const SOERuleRender = ({
    values, onValuesChange
}: {
    values?: SOERuleValues
    onValuesChange: (v: SOERuleValues) => void
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)

    const aggregationOpts = useAggregationSelectOpts(ProtoKeys.SOE)
    const { sPoints, opts: staticPointsOpts } = useStaticPoints(ProtoKeys.SOE)

    return <div className={styles.container}>
        <div className={styles.other}>
            <SelectWithTitle innerName={{ text: locale.ruleName.aggregation }}
                options={aggregationOpts}
                value={values?.aggregation} onChange={v => onValuesChange({
                    ...values,
                    aggregation: v
                })}
            />
            <SelectWithTitle mode='multiple' innerName={{ text: locale.ruleName.staticPoint }}
                options={staticPointsOpts}
                value={values?.staticPoints?.map(p => p.alias)} onChange={v => onValuesChange({
                    ...values,
                    staticPoints: v.map(alias => sPoints.find(p => p.alias === alias)).filter(p => p) as StaticPoint[]
                })}
            />
        </div>
        <div className={styles.assets_points}>
            <AssetAndPointPicker
                withAsset forceMultiAsset={true}
                value={{
                    domainValues: {
                        domainId: values?.domainId,
                        modelId: values?.modelId,
                        deviceModel: values?.deviceModel
                    },
                    assets: values?.assets,
                }} onValueChange={(v) => {
                    onValuesChange({
                        ...values,
                        domainId: v.domainValues?.domainId,
                        modelId: v.domainValues?.modelId,
                        deviceModel: v.domainValues?.deviceModel,
                        assets: v.assets,
                    })
                }} />
        </div>
    </div>
}

export default SOERuleRender