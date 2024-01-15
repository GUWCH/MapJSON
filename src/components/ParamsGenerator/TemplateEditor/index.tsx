import { DefaultButton, PrimaryButton } from 'Button'
import { Input } from 'Input'
import { StyledModal } from 'Modal'
import { notify } from 'Notify'
import { ComponentContext, convertMoment, parseMoment } from 'ParamsGenerator/utils'
import RadioGroup from 'Radio/RadioGroup'
import { Space } from 'antd'
import React, { useContext, useImperativeHandle, useMemo, useRef, useState } from 'react'
import TemplateProtoSelector from '../TemplateProtoSelector'
import { ProtoKeys } from '../constant'
import { protoService } from '../services'
import { Template } from '../types'
import styles from './index.module.scss'
import TemplateProtoRender, { validateProtoValues } from 'ParamsGenerator/TemplateProtoRender'
import { PointInfoRuleValues, ProtoValues, SOERuleValues, TrendAnalysisRuleValues, WarnRuleValues } from 'ParamsGenerator/TemplateProtoRender/types'
import { validatePointInfoRuleValues } from 'ParamsGenerator/TemplateProtoRender/ruleRenders/PointInfosRender'
import { msgTag } from '@/common/lang'
import { QuickRangeSelectEnum } from 'DatePicker'
import { validateSOERuleValues } from 'ParamsGenerator/TemplateProtoRender/ruleRenders/SOERender'
import { validateWarnRuleValues } from 'ParamsGenerator/TemplateProtoRender/ruleRenders/WarnRender'
import { validateTrendAnalysisValues } from 'ParamsGenerator/TemplateProtoRender/ruleRenders/TrendAnalysisRender'
import { SystemInfoContext } from 'SystemInfoProvider'

const commonI18n = msgTag('common')

type ProtoRefValue = {
    currentProto?: ProtoKeys
    values: ProtoValues
    validate: () => boolean
}
type ProtoContentProps = {
    originTpl?: Omit<Template, 'key'> & { key?: string }
    enabledProtoKeys?: ProtoKeys[]
}
const ProtoContent = React.forwardRef<ProtoRefValue, ProtoContentProps>(({
    originTpl, enabledProtoKeys
}, ref) => {
    const componentContext = useContext(ComponentContext)
    const { locale: { templateEditor: locale } } = componentContext
    const [currentProto, setProto] = useState<ProtoKeys | undefined>(() => {
        if (originTpl?.proto) {
            return originTpl.proto
        }
        const allProto = protoService.list()
        if (enabledProtoKeys && enabledProtoKeys.length === 1) {
            return allProto.find(p => p === enabledProtoKeys[0]) ?? allProto[0]
        }
        return allProto[0]
    })
    const [valuesMap, setValuesMap] = useState<
        Partial<Record<
            ProtoKeys,
            ProtoValues | undefined
        >>
    >((originTpl ? {
        [originTpl.proto]: originTpl.values
    } : {}))
    const systemInfos = useContext(SystemInfoContext)
    const values: ProtoValues = useMemo(() => {
        if (currentProto) {
            return valuesMap[currentProto] ?? {}
        }
        return {}
    }, [valuesMap, currentProto])

    const setValues = (values: ProtoValues) => {
        if (!currentProto) return
        setValuesMap(map => {
            const newMap = {
                ...map,
                [currentProto]: values
            }
            return newMap
        })
    }

    useImperativeHandle(ref, () => {
        return {
            values, currentProto, validate: () => {
                return !!currentProto && validateProtoValues(currentProto, values, componentContext.locale)
            }
        }
    }, [values])

    return <React.Fragment key={currentProto}>
        {(!enabledProtoKeys || enabledProtoKeys.length > 1) && <div>
            <div className={`${styles.name} ${styles.require}`}>
                {locale.selectProto}
            </div>
            <TemplateProtoSelector enabledProtoKeys={enabledProtoKeys} value={currentProto} onChange={p => p && setProto(p)} />
        </div>}
        {currentProto && <div>
            <TemplateProtoRender
                protoKey={currentProto}
                values={values}
                onValuesChange={(vArr) => setValues(vArr)}
            />
        </div>}
    </React.Fragment>
})

type BaseRefValue = BaseValues & {
    validate: () => boolean
}
type BaseValues = {
    name?: string
    isDefault?: boolean
    saveAsTpl?: boolean
}
type BaseProps = {
    originTpl?: Omit<Template, 'key'> & { key?: string }
}
const BaseContent = React.forwardRef<BaseRefValue, BaseProps>(({
    originTpl
}, ref) => {
    const { locale: { templateEditor: locale, ...otherLocale } } = useContext(ComponentContext)
    const [baseState, setBaseState] = useState<Omit<BaseRefValue, 'validate'>>({
        saveAsTpl: !!originTpl?.key,
        name: originTpl?.name,
        isDefault: originTpl?.isDefault,
    })

    useImperativeHandle(ref, () => {
        return {
            name: baseState.name,
            isDefault: baseState.isDefault,
            saveAsTpl: baseState.saveAsTpl,
            validate: () => {
                if (!baseState.name && baseState.saveAsTpl) {
                    notify(locale.fieldEmpty(otherLocale.common.name))
                    return false
                }
                return true
            }
        }
    }, [baseState])

    return <>
        {!originTpl?.key && <div>
            <div className={styles.name}>{locale.saveAsTpl}</div>
            <RadioGroup value={baseState.saveAsTpl} options={[{
                label: commonI18n('yes'),
                value: true
            }, {
                label: commonI18n('no'),
                value: false
            }]} onChange={v => {
                setBaseState(old => ({ ...old, saveAsTpl: v.target.value }))
            }} />
        </div>}
        {baseState.saveAsTpl && <>
            <div>
                <div className={`${styles.name} ${styles.require}`}>
                    {otherLocale.common.name}
                </div>
                <div>
                    <Input className={styles.tplName} showCount maxLength={64}
                        value={baseState.name}
                        onChange={e => {
                            const name = e.target.value
                            setBaseState(old => ({ ...old, name: name }))
                        }} />
                </div>
            </div>
            <div>
                <div className={styles.name}>{locale.saveAsDefault}</div>
                <RadioGroup value={!!baseState.isDefault} options={[{
                    label: commonI18n('yes'),
                    value: true
                }, {
                    label: commonI18n('no'),
                    value: false
                }]} onChange={v => {
                    setBaseState(old => ({ ...old, isDefault: v.target.value }))
                }} />
            </div>
        </>}
    </>
})

export type TemplateEditorProps = {
    footerMode?: 'from-list' | 'from-bar'
    template?: Omit<Template, 'key'> & { key?: string }
    enabledProtoKeys?: ProtoKeys[]
    customTplValidator?: (proto: ProtoKeys, protoValues: ProtoValues, baseValues: BaseValues) => boolean
    onClose: () => void
    onCreate: (template: Omit<Template, 'key'>, saveToList?: boolean) => void
    onUpdate: (template: Template) => void
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    footerMode, template, enabledProtoKeys, customTplValidator, onClose, onCreate, onUpdate
}) => {
    const { locale: { templateEditor: locale, ...otherLocale } } = useContext(ComponentContext)
    const protoContentRef = useRef<ProtoRefValue | null>(null)
    const baseContentRef = useRef<BaseRefValue | null>(null)

    const renderBtns = () => {
        if (footerMode === 'from-list') {
            if (template) {
                return <>
                    <DefaultButton onClick={onClose}>{commonI18n('cancel')}</DefaultButton>
                    <PrimaryButton onClick={() => handleSave('create')}>{locale.saveAs}</PrimaryButton>
                    <PrimaryButton onClick={() => handleSave('update')}>{locale.save}</PrimaryButton>
                </>
            } else {
                return <>
                    <DefaultButton onClick={() => onClose()}>{commonI18n('cancel')}</DefaultButton>
                    <PrimaryButton onClick={() => handleSave('create')}>{locale.add}</PrimaryButton>
                </>
            }
        } else {
            if (template && template.key) {
                if (template.values !== protoContentRef.current?.values) {
                    return <>
                        <DefaultButton onClick={onClose}>{commonI18n('cancel')}</DefaultButton>
                        <PrimaryButton onClick={() => handleSave('create')}>{locale.saveAs}</PrimaryButton>
                        <PrimaryButton onClick={() => handleSave('update')}>{locale.save}</PrimaryButton>
                    </>
                } else {
                    return <>
                        <PrimaryButton onClick={() => handleSave('create-temp')}>{locale.add}</PrimaryButton>
                    </>
                }
            } else {
                return <>
                    <DefaultButton onClick={() => onClose()}>{commonI18n('cancel')}</DefaultButton>
                    <PrimaryButton onClick={() => handleSave('create')}>{locale.add}</PrimaryButton>
                </>
            }
        }
    }

    const validate = (vs: { baseValue: BaseRefValue | null, protoValue: ProtoRefValue | null }): vs is { baseValue: BaseRefValue, protoValue: ProtoRefValue } => {
        const protoContentValue = protoContentRef.current
        const baseContentValue = baseContentRef.current
        if (!protoContentValue || !baseContentValue) {
            return false
        }
        const { currentProto, values, validate: validateProto } = protoContentValue
        const { validate: validateBase } = baseContentValue
        if (
            !currentProto ||
            !validateProto() || !validateBase() ||
            (customTplValidator && !customTplValidator(currentProto, values, baseContentValue))
        ) {
            return false
        }
        return true
    }

    const handleSave = (mode: 'create' | 'create-temp' | 'update') => {
        const vs = { baseValue: baseContentRef.current, protoValue: protoContentRef.current }
        if (!validate(vs)) {
            return
        }
        const { currentProto, values } = vs.protoValue
        const { name, isDefault, saveAsTpl } = vs.baseValue
        const newTplWithoutKey = {
            name: name ?? '',
            isDefault: isDefault,
            proto: currentProto!,
            values: values,
        }

        if (mode === 'create' || mode === 'create-temp') {
            onCreate(newTplWithoutKey, mode === 'create' && saveAsTpl)
        } else {
            if (!template?.key) {
                console.error('template not exists')
                return
            }
            onUpdate(Object.assign({ key: template.key }, newTplWithoutKey))
        }
    }

    return <StyledModal visible
        customClassName={styles.modal}
        style={{
            minWidth: '1100px',
            maxWidth: '1200px'
        }}
        width={'90vw'}
        maskClosable={false}
        onCancel={onClose}
        title={template ? locale.editorTitle : locale.generatorTitle}
        footer={<Space className={styles.footer}>
            {renderBtns()}
        </Space>}
    >
        <ProtoContent
            ref={protoContentRef}
            originTpl={template}
            enabledProtoKeys={enabledProtoKeys}
        />
        <BaseContent ref={baseContentRef} originTpl={template} />
    </StyledModal>
}