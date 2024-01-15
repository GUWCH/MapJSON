import { isZh } from "@/common/util-scada"
import AssetAndPointPicker from "AssetAndPointPicker"
import { ComponentContext, TextContext } from "ParamsGenerator/utils"
import { SelectWithTitle } from "Select/StyledAntSelect"
import React, { useContext } from "react"
import { WarnRuleValues } from "../types"
import styles from './render.module.scss'
import { SystemInfoContext } from "SystemInfoProvider"
import { notify } from "Notify"

export const validateWarnRuleValues = (v: WarnRuleValues, context: TextContext) => {
    const alertEmpty = (name: string) => {
        notify(context.templateEditor.fieldEmpty(name))
    }

    const ruleNames = context.templateProtoRender.ruleName
    if (!v.warnLevel || v.warnLevel.length === 0) {
        alertEmpty(ruleNames.warnLevel)
        return false
    }

    if (!v.warnType) {
        alertEmpty(ruleNames.warnType)
        return false
    }

    const warnType = v.warnType
    if (warnType.visible === 'device' || warnType.visible === 'point') {
        if (!v.domainId) {
            alertEmpty(ruleNames.domain)
            return false
        }
        if (!v.modelId) {
            alertEmpty(ruleNames.model)
            return false
        }
        if (!v.assets || v.assets.length === 0) {
            alertEmpty(ruleNames.asset)
            return false
        }
    }
    if (warnType.visible === 'point') {
        const allPoints = Object.entries(v.pointGroups ?? {}).flatMap(entry => entry[1]) ?? []
        if (allPoints.length === 0) {
            alertEmpty(ruleNames.point)
            return false
        }
    }

    return true
}

const WarnRuleRender = ({ values, onValuesChange }: {
    values: WarnRuleValues
    onValuesChange: (v: WarnRuleValues) => void
}) => {
    const sysInfo = useContext(SystemInfoContext)
    const warnLevels = sysInfo?.warnLevels ?? []
    const warnTypes = sysInfo?.hisWarnTypes ?? []

    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)

    return <div className={styles.container}>
        <div className={styles.other}>
            <SelectWithTitle innerName={{ text: locale.ruleName.warnLevel }}
                mode='multiple'
                options={warnLevels.map(l => ({ label: l.name, value: l.id }))}
                value={values.warnLevel?.map(l => l.id)} onChange={v => {
                    onValuesChange({
                        ...values,
                        warnLevel: warnLevels.filter(l => v.includes(l.id))
                    })
                }} />
            <SelectWithTitle innerName={{ text: locale.ruleName.warnType }}
                options={warnTypes.filter(t => t.visible && t.visible !== 'point').map(t => ({ label: t.table_name, value: t.table_id }))}
                value={values.warnType?.table_id} onChange={v => {
                    onValuesChange({
                        ...values,
                        warnType: warnTypes.find(t => v === t.table_id)
                    })
                }} />
        </div>
        {values.warnType?.visible && <div className={styles.assets_points}>
            <AssetAndPointPicker
                withAsset
                withPoint={values.warnType.visible === 'point'}
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
        </div>}
    </div>
}

export default WarnRuleRender