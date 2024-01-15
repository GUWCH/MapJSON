import { ProtoKeys } from "ParamsGenerator/constant"
import styles from './index.module.scss'
import PointInfoRuleRender, { validatePointInfoRuleValues } from "./ruleRenders/PointInfosRender"
import SOERuleRender, { validateSOERuleValues } from "./ruleRenders/SOERender"
import WarnRuleRender, { validateWarnRuleValues } from "./ruleRenders/WarnRender"
import React, { useContext, useMemo, useState } from "react"
import { FontIcon } from "Icon"
import iconsMap from "Icon/iconsMap"
import { ComponentContext, TextContext, convertMoment, parseMoment } from "ParamsGenerator/utils"
import { BaseProtoValues, CompareSpan, PointInfoRuleValues, ProtoRuleValues, ProtoValues, SOERuleValues, TrendAnalysisRuleValues, WarnRuleValues } from "./types"
import _ from "lodash"
import StyledCollapse, { StyledCollapsePanel } from "Collapse"
import { confirm } from "Modal"
import TrendAnalysisRender, { validateTrendAnalysisValues } from "./ruleRenders/TrendAnalysisRender"
import { SystemInfoContext } from "SystemInfoProvider"
import DatePicker from "DatePicker"
import { Moment } from 'moment'
import { notify } from "Notify"
import { getPropertyIfExist } from "@/common/utils/object"
import { DatePickerProps } from "antd"
import { SelectWithTitle } from "Select/StyledAntSelect"
import TimeRangePicker from "./otherRenders/TimeRangePicker"
import CompareRangePicker from "./otherRenders/CompareRangePicker"
import StatisticsConfig from "./otherRenders/StatisticsConfig"

export type TemplateProtoRenderProps = {
    protoKey: ProtoKeys
    values?: ProtoValues
    onValuesChange: (v: ProtoValues) => void
}

const TemplateRuleRender: React.FC<{
    protoKey: ProtoKeys
    ruleValues?: ProtoRuleValues[]
    onChange: (v: ProtoRuleValues[]) => void
}> = ({ protoKey, ruleValues: _ruleValues, onChange }) => {
    const systemInfos = useContext(SystemInfoContext)
    const [activedKeys, setActivedKeys] = useState(['0'])

    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)
    const initialValue: ProtoRuleValues = {
        domainId: systemInfos?.domainInfos?.[0]?.domain_id,
        modelId: systemInfos?.domainInfos?.[0]?.model_id_vec?.[0]?.model_id
    }
    const ruleValues = _ruleValues && _ruleValues.length > 0 ? _ruleValues : [initialValue]

    const handleRuleRemove = (index: number) => {
        confirm({
            title: locale.removeConfirm.title,
            content: locale.removeConfirm.content,
            onOk() {
                const newArr: ProtoRuleValues[] = []
                ruleValues.forEach((r, i) => {
                    if (i === index) {
                        return
                    }
                    newArr.push(r)
                })
                onChange(newArr)
            },
        })
    }

    const handleRuleEdit = (index: number, value: ProtoRuleValues) => {
        onChange(Array.from(ruleValues, (v, i) => i === index ? value : v))
    }

    return <div className={styles.rules}>
        {ruleValues.length > 0 && <StyledCollapse activeKey={activedKeys} onChange={keys => setActivedKeys(Array.isArray(keys) ? keys : [keys])}>
            {ruleValues.map((v, i, arr) => {
                let ruleContent: React.ReactNode
                switch (protoKey) {
                    case ProtoKeys.points: {
                        ruleContent = <PointInfoRuleRender key={i}
                            values={v}
                            onValuesChange={(v) => {
                                handleRuleEdit(i, v)
                            }}
                        />
                        break;
                    }
                    case ProtoKeys.SOE: {
                        ruleContent = <SOERuleRender key={i}
                            values={v}
                            onValuesChange={(v) => {
                                handleRuleEdit(i, v)
                            }}
                        />
                        break;
                    }
                    case ProtoKeys.warn: {
                        ruleContent = <WarnRuleRender key={i}
                            values={v}
                            onValuesChange={(v) => {
                                handleRuleEdit(i, v)
                            }}
                        />
                        break;
                    }
                    case ProtoKeys.points_trend: {
                        ruleContent = <TrendAnalysisRender key={i}
                            values={v}
                            onValuesChange={(v) => {
                                handleRuleEdit(i, v)
                            }}
                        />
                        break;
                    }
                    default: ruleContent = <></>
                }

                return <StyledCollapsePanel key={String(i)} header={locale.ruleGroupTitle + (i + 1)}
                    extra={arr.length > 1 ? <div onClick={(e) => {
                        e.stopPropagation()
                        handleRuleRemove(i)
                    }}>
                        <FontIcon type={iconsMap.DELETE} />
                    </div> : undefined
                    }
                >
                    {ruleContent}
                </StyledCollapsePanel>
            })}
        </StyledCollapse>}
        <div className={styles.operation}>
            <div onClick={() => {
                setActivedKeys(activedKeys.concat(String(ruleValues.length)))
                onChange(ruleValues.concat(initialValue))
            }}>
                <FontIcon type={iconsMap.PLUS} />
                {locale.addRule}
            </div>
            {ruleValues.length > 1 && <div onClick={() => {
                confirm({
                    title: locale.removeConfirm.allTitle,
                    content: locale.removeConfirm.allContent,
                    onOk() {
                        onChange([])
                    },
                })
            }}>
                <FontIcon type={iconsMap.DELETE} />
                {locale.removeAllRule}
            </div>}
        </div>
    </div>
}

export const validateProtoValues = (protoKey: ProtoKeys, values: ProtoValues, locale: TextContext) => {
    if (values.ruleValues?.length === 0) {
        notify(locale.templateProtoRender.emptyRules)
        return false
    }

    if ([
        ProtoKeys.points,
        ProtoKeys.SOE,
        ProtoKeys.warn,
    ].includes(protoKey)) {
        const timeRange = getPropertyIfExist(values, 'timeRange') as BaseProtoValues['timeRange']
        if (!timeRange?.dateValue && !timeRange?.quickValue) {
            notify(locale.templateEditor.fieldEmpty(locale.templateProtoRender.ruleName.time))
            return false
        }
    }

    if ([ProtoKeys.points_trend].includes(protoKey)) {
        const compareRange = getPropertyIfExist(values, 'compareRange') as BaseProtoValues['compareRange']
        if (
            !compareRange?.customRangeValue?.quickValue && !compareRange?.customRangeValue?.dateValue
            && !compareRange?.value?.base?.quick && !compareRange?.value?.base?.date
            && !compareRange?.value?.compare?.date && (!compareRange?.value?.compare?.quick || compareRange?.value?.compare?.quick.length === 0)
        ) {
            notify(locale.templateEditor.fieldEmpty(locale.templateProtoRender.ruleName.time))
            return false
        }
    }

    for (const ruleV of values.ruleValues ?? []) {
        switch (protoKey) {
            case ProtoKeys.points: {
                if (!validatePointInfoRuleValues(ruleV as PointInfoRuleValues, locale)) {
                    return false
                }
                break
            }
            case ProtoKeys.SOE: {
                if (!validateSOERuleValues(ruleV as SOERuleValues, locale)) {
                    return false
                }
                break
            }
            case ProtoKeys.warn: {
                if (!validateWarnRuleValues(ruleV as WarnRuleValues, locale)) {
                    return false
                }
                break
            }
            case ProtoKeys.points_trend: {
                if (!validateTrendAnalysisValues(ruleV as TrendAnalysisRuleValues, locale)) {
                    return false
                }
                break
            }
        }
    }
    return true
}

const TemplateProtoRender: React.FC<TemplateProtoRenderProps> = ({
    protoKey, values, onValuesChange
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)
    const timeRangeValue = useMemo(() => {
        if (values && 'timeRange' in values) {
            return {
                ...values.timeRange,
                dateValue: (values.timeRange?.dateValue ?? [null, null]).map(d => parseMoment(d)) as [Moment | null, Moment | null]
            }
        }
    }, [values])
    const compareRangeValue = useMemo(() => {
        if (values && 'compareRange' in values) {
            const compareRange = values.compareRange
            return {
                ...compareRange,
                customRangeValue: compareRange?.customRangeValue ? {
                    dateValue: (compareRange?.customRangeValue?.dateValue ?? [null, null])
                        .map(d => parseMoment(d)) as [Moment | null, Moment | null],
                    quickValue: compareRange?.customRangeValue?.quickValue
                } : undefined,
                value: compareRange?.value ? {
                    base: {
                        quick: compareRange.value.base?.quick,
                        date: parseMoment(compareRange.value.base?.date ?? null)
                    },
                    compare: {
                        quick: compareRange.value.compare?.quick,
                        date: parseMoment(compareRange.value.compare?.date ?? null)
                    }
                } : undefined
            }
        }
    }, [values])

    return <>
        <div className={`${styles.name} ${styles.require}`}>
            {locale.rules}
        </div>
        <TemplateRuleRender protoKey={protoKey} ruleValues={values?.ruleValues} onChange={v => {
            onValuesChange({ ...values, ruleValues: v })
        }} />
        {[ProtoKeys.points, ProtoKeys.SOE, ProtoKeys.warn].includes(protoKey) && <TimeRangePicker
            showTime={protoKey === ProtoKeys.warn}
            quickValue={timeRangeValue?.quickValue}
            dateValue={timeRangeValue?.dateValue}
            onChange={(date, quick) => {
                const st = convertMoment(date?.[0] ?? null)
                const et = convertMoment(date?.[1] ?? null)
                onValuesChange({
                    ...values,
                    timeRange: {
                        dateValue: [st, et] as [string | null, string | null],
                        quickValue: quick
                    }
                })
            }}
        />}
        {[ProtoKeys.points_trend].includes(protoKey) && <CompareRangePicker
            span={compareRangeValue?.span}
            customRangeValue={compareRangeValue?.customRangeValue}
            value={compareRangeValue?.value}
            onChange={(span, value, customValue) => {
                onValuesChange({
                    ...values,
                    compareRange: {
                        span, customRangeValue: customValue ? {
                            quickValue: customValue.quickValue,
                            dateValue: customValue.dateValue?.map(d => convertMoment(d)) as [string | null, string | null],
                        } : undefined,
                        value: value ? {
                            base: {
                                quick: value?.base?.quick,
                                date: convertMoment(value?.base?.date ?? null)
                            },
                            compare: {
                                quick: value.compare?.quick,
                                date: convertMoment(value.compare?.date ?? null)
                            }
                        } : undefined
                    }
                })
            }}
        />}
        {[ProtoKeys.points_trend].includes(protoKey) && <StatisticsConfig
            displayColumns={(values && 'statisticsCols' in values ? values.statisticsCols : undefined) ?? []}
            onChange={cols => {
                onValuesChange({
                    ...values,
                    statisticsCols: cols
                })
            }}
        />}
    </>
}

export default TemplateProtoRender