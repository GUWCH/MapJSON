import { AssetSelectorWithReq } from 'AssetPicker/AssetSelector'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RangePicker, DatePicker } from '../DatePicker'
import { TemplateEditor, TemplateEditorProps } from './TemplateEditor'
import TemplateSelector from './TemplateSelector'
import { ProtoKeys } from './constant'
import styles from './index.module.scss'
import { templateService } from './services'
import { Template, TemplateType } from './types'
import { ComponentContext, TextContext, convertMoment, defaultLocaleContext, parseMoment } from './utils'
import { mergeDeep } from '@/common/utils/object'
import SystemInfoProvider, { SystemInfoContext } from 'SystemInfoProvider'
import TimeRangePicker from './TemplateProtoRender/otherRenders/TimeRangePicker'
import CompareRangePicker from './TemplateProtoRender/otherRenders/CompareRangePicker'
import { WarnProtoValues, WarnRuleValues } from './TemplateProtoRender/types'

export enum RuntimeChangeTrigger {
    TPL_SELECT, // 选择新模板
    CREATE_TPL, // 创建新模板
    CREATE_TEMP, // 创建临时参数
    RUNTIME_EDIT, // 修改运行时模板
}
export type ParamsGeneratorProps = {
    tplType?: TemplateType
    enabledProtoKeys?: ProtoKeys[]
    runtimeTpl?: Omit<Template, 'key'> & { key?: string }
    disableDefault?: boolean
    customTplValidator?: TemplateEditorProps['customTplValidator']
    onRuntimeTplChange: (tpl: Omit<Template, 'key'> | undefined, trigger: RuntimeChangeTrigger, originTpl?: Template) => void

    textContext?: RecursivePartial<TextContext>
    titleActionRender?: () => ReactNode
    actionRender?: () => ReactNode
}

export const ParamsGenerator = ({
    tplType = 'data_export', enabledProtoKeys, runtimeTpl, disableDefault,
    customTplValidator, onRuntimeTplChange,
    actionRender, titleActionRender
}: ParamsGeneratorProps) => {
    const { tplList: list, updateTplList } = useContext(ComponentContext)
    const ctx = useContext(SystemInfoContext)
    const [editorParams, setEditorParams] = useState<Pick<TemplateEditorProps, 'footerMode' | 'template'> | undefined>()
    const [originTpl, setOriginTpl] = useState<Template | undefined>()

    const { modelIds, firstRule, showAsset } = useMemo(() => {
        const firstRule = runtimeTpl?.values?.ruleValues?.[0]
        const showAsset = runtimeTpl?.values?.ruleValues &&
            runtimeTpl.values.ruleValues.length === 1 &&
            firstRule?.deviceModel &&
            (runtimeTpl?.proto !== ProtoKeys.warn || (firstRule as WarnRuleValues).warnType?.visible)
        return {
            modelIds: firstRule?.modelId ? [firstRule.modelId] : [],
            firstRule: firstRule,
            showAsset
        }
    }, [runtimeTpl])

    // 仅有一个条件时渲染
    const assetPickerEle = showAsset && firstRule ? <div key={runtimeTpl?.key ?? ''} className={styles.assetPicker}>
        <AssetSelectorWithReq modelIds={modelIds}
            quickSwitch
            selectedKeys={firstRule?.assets?.map(a => a.key)}
            deviceModel={firstRule?.deviceModel}
            multiple
            onChange={assets => {
                if (runtimeTpl) {
                    onRuntimeTplChange({
                        ...runtimeTpl,
                        values: {
                            ...runtimeTpl?.values,
                            ruleValues: [{
                                ...runtimeTpl.values?.ruleValues?.[0],
                                assets: assets
                            }]
                        }
                    }, RuntimeChangeTrigger.RUNTIME_EDIT, originTpl)
                }
            }}
        />
    </div> : undefined

    const timePickerEle = runtimeTpl?.values && 'timeRange' in runtimeTpl.values ? <TimeRangePicker
        hideTitle
        showTime={[ProtoKeys.points_trend, ProtoKeys.warn].includes(runtimeTpl.proto)}
        quickValue={runtimeTpl.values.timeRange?.quickValue}
        dateValue={[
            parseMoment(runtimeTpl.values.timeRange?.dateValue?.[0] ?? null),
            parseMoment(runtimeTpl.values.timeRange?.dateValue?.[1] ?? null),
        ]}
        onChange={(dates, quick) => {
            if (runtimeTpl) {
                const st = convertMoment(dates?.[0] ?? null)
                const et = convertMoment(dates?.[1] ?? null)
                onRuntimeTplChange({
                    ...runtimeTpl,
                    values: {
                        ...runtimeTpl.values,
                        timeRange: {
                            dateValue: [st, et] as [string | null, string | null],
                            quickValue: quick
                        }
                    }
                }, RuntimeChangeTrigger.RUNTIME_EDIT, originTpl)
            }
        }} /> : <></>

    const comparePickerEle = runtimeTpl?.values && 'compareRange' in runtimeTpl.values ? <CompareRangePicker
        hideTitle
        span={runtimeTpl.values.compareRange?.span}
        customRangeValue={runtimeTpl.values.compareRange?.customRangeValue ? {
            quickValue: runtimeTpl.values.compareRange?.customRangeValue.quickValue,
            dateValue: [
                parseMoment(runtimeTpl.values.compareRange?.customRangeValue.dateValue?.[0]),
                parseMoment(runtimeTpl.values.compareRange?.customRangeValue.dateValue?.[1])
            ]
        } : undefined}
        value={{
            base: {
                quick: runtimeTpl.values.compareRange?.value?.base?.quick,
                date: parseMoment(runtimeTpl.values.compareRange?.value?.base?.date)
            },
            compare: {
                quick: runtimeTpl.values.compareRange?.value?.compare?.quick,
                date: parseMoment(runtimeTpl.values.compareRange?.value?.compare?.date)
            }
        }}
        onChange={(span, value, customValue) => {
            if (runtimeTpl) {
                onRuntimeTplChange({
                    ...runtimeTpl,
                    values: {
                        ...runtimeTpl.values,
                        compareRange: {
                            span, customRangeValue: customValue ? {
                                quickValue: customValue?.quickValue,
                                dateValue: customValue.dateValue?.map(d => convertMoment(d)) as [string | null, string | null]
                            } : undefined,
                            value: value ? {
                                base: {
                                    quick: value.base?.quick,
                                    date: convertMoment(value.base?.date ?? null)
                                },
                                compare: {
                                    quick: value.compare?.quick,
                                    date: convertMoment(value.compare?.date ?? null)
                                }
                            } : undefined
                        }
                    }
                }, RuntimeChangeTrigger.RUNTIME_EDIT, originTpl)
            }
        }}
    /> : <></>

    useEffect(() => {
        if (!runtimeTpl && !disableDefault) {
            const defaultTpl = list.find(t => t.isDefault)
            if (defaultTpl) {
                handleTplSelect(defaultTpl)
            }
        }
    }, [list, disableDefault, runtimeTpl])

    const handleTplSelect = (tpl?: Template) => {
        setOriginTpl(tpl)
        onRuntimeTplChange(tpl, RuntimeChangeTrigger.TPL_SELECT, tpl)
    }

    return <div className={styles.container}>
        <div className={styles.title}>
            <TemplateSelector
                type={tplType ?? 'data_export'}
                currentTplKey={runtimeTpl?.key}
                onSelect={handleTplSelect}
                onEdit={(tpl) => setEditorParams({
                    footerMode: 'from-list', template: tpl
                })}
                onCreate={() => setEditorParams({
                    footerMode: 'from-list'
                })}
            />
            <div>{titleActionRender && titleActionRender()}</div>
        </div>
        {runtimeTpl && <div className={styles.bar}>
            <div className={`${styles.bar__context}`}>
                <div className={styles.bar__context__content}>
                    {assetPickerEle}
                    {timePickerEle}
                    {comparePickerEle}
                </div>
                <div className={styles.bar__context__action}>
                    {actionRender && actionRender()}
                </div>
            </div>
            <div className={styles.expand} onClick={() => setEditorParams({
                footerMode: 'from-bar', template: runtimeTpl
            })}>
                <FontIcon type={iconsMap.DIRECT_DOWN} />
            </div>
        </div>}
        {editorParams && <TemplateEditor
            footerMode={editorParams.footerMode}
            template={editorParams.template}
            enabledProtoKeys={enabledProtoKeys}
            customTplValidator={customTplValidator}
            onClose={() => setEditorParams(undefined)}
            onCreate={(tpl, saveToList) => {
                if (saveToList) {
                    templateService.add(tpl, tplType, ctx?.domainInfos ?? []).then(key => {
                        updateTplList()
                        if (key) {
                            const tplWithKey = { ...tpl, key }
                            setOriginTpl(tplWithKey)
                            setEditorParams(undefined)
                            onRuntimeTplChange(tplWithKey, RuntimeChangeTrigger.CREATE_TPL, tplWithKey)
                        }
                    })
                } else {
                    setOriginTpl(undefined)
                    setEditorParams(undefined)
                    onRuntimeTplChange(tpl, RuntimeChangeTrigger.CREATE_TEMP)
                }
            }}
            onUpdate={(tpl) => {
                templateService.update(tpl, tplType, ctx?.domainInfos ?? []).then((res) => {
                    if (res) {
                        updateTplList()
                        setOriginTpl(res)
                        onRuntimeTplChange(res, RuntimeChangeTrigger.RUNTIME_EDIT, res)
                        setEditorParams(undefined)
                    }
                })
            }}
        />}
    </div>
}

const ParamsGeneratorWrapper = ({ textContext, tplType = 'data_export', ...rest }: Omit<ParamsGeneratorProps, 'contextData'>) => {
    const [tplList, setTplList] = useState<Template[]>([])
    const [loadingList, setLoadingList] = useState(false)
    const fetchList = useCallback(() => {
        setLoadingList(true)
        templateService.list(tplType).then(res => {
            setTplList(res)
        }).finally(() => setLoadingList(false))
    }, [tplType])
    useEffect(() => {
        fetchList()
    }, [fetchList])

    return <SystemInfoProvider withDomainInfo>
        <ComponentContext.Provider value={{
            locale: mergeDeep({ ...defaultLocaleContext }, textContext),
            tplList, updateTplList: fetchList, loadingTplList: loadingList
        }}>
            <ParamsGenerator {...rest} tplType={tplType} />
        </ComponentContext.Provider>
    </SystemInfoProvider>
}

export default ParamsGeneratorWrapper