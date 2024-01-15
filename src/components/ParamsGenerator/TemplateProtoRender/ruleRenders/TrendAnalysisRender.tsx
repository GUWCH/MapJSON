import { default as AssetAndPointPicker } from "AssetAndPointPicker"
import { notify } from "Notify"
import { TextContext } from "ParamsGenerator/utils"
import React from "react"
import { TrendAnalysisRuleValues } from "../types"
import styles from './render.module.scss'

export const validateTrendAnalysisValues = (v: TrendAnalysisRuleValues, context: TextContext) => {
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
    const allPoints = Object.entries(v.pointGroups ?? {}).flatMap(entry => entry[1]) ?? []
    if (allPoints.length === 0) {
        alertEmpty(ruleNames.point)
        return false
    }

    return true
}

const TrendAnalysisRender = ({
    values, onValuesChange
}: {
    values?: TrendAnalysisRuleValues
    onValuesChange: (v: TrendAnalysisRuleValues) => void
}) => {

    return <div className={styles.container}>
        <div className={styles.assets_points}>
            <AssetAndPointPicker withAsset
                withPoint
                value={{
                    domainValues: {
                        domainId: values?.domainId,
                        modelId: values?.modelId,
                        deviceModel: values?.deviceModel
                    },
                    assets: values?.assets,
                    points: values?.pointGroups
                }} onValueChange={(v) => {
                    onValuesChange({
                        ...values,
                        domainId: v.domainValues?.domainId,
                        modelId: v.domainValues?.modelId,
                        deviceModel: v.domainValues?.deviceModel,
                        assets: v.assets,
                        pointGroups: v.points
                    })
                }} />
        </div>
    </div>
}

export default TrendAnalysisRender