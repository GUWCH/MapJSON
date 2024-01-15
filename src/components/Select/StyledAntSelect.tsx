import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './StyledAntSelect.module.scss'
import { Select, SelectProps } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { msgTag } from '@/common/lang'

const i18n = msgTag('select')

const StyledAntSelect = <VT extends SelectValue = SelectValue>({
    containerCls, children, value, mode, ...rest
}: SelectProps<VT> & {
    containerCls?: string
}) => {

    const selectContent = mode === 'multiple' ?
        (Array.isArray(value) && value.length > 0 ? i18n('selected') + value.length : undefined) : undefined

    return <Select className={`${styles['select-default']} ${containerCls ?? ''}`}
        placeholder={i18n('placeholder')}
        tagRender={(v) => <></>}
        showArrow
        value={value}
        mode={mode}
        {...rest}
        data-content={selectContent}
    >
        {children}
    </Select>
}

export const SelectWithTitle = <VT extends SelectValue = SelectValue>({
    customCls, innerName, children, value, mode, options, showArrow, onChange, ...rest
}: Omit<SelectProps<VT>, 'className'> & {
    innerName: { // 选择框内部显示名称
        text: string
        required?: boolean
    }
    customCls?: {
        container?: string
        select?: string
        inner?: string
    }
}) => {

    const [_value, _setValue] = useState(value)
    useEffect(() => {
        _setValue(value)
    }, [value])

    const isMultiple = mode === 'multiple'

    const innerContent = isMultiple ?
        (Array.isArray(_value) && _value.length > 0 ? i18n('selected') + _value.length : undefined) :
        (() => {
            const op = options?.find(o => o.value === _value)
            return op?.label || op?.value
        })()

    const labelPrefix = innerName ? innerName.text + '：' : ''
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const containerEle = containerRef.current
        if (containerEle && labelPrefix) {
            const selectionEle = containerEle.getElementsByClassName('ant-select-selection-item')[0]
            if (selectionEle) {
                selectionEle.setAttribute('data-prefix', (innerName?.required ? '* ' : '') + labelPrefix)
            }
        }
    }, [innerName, _value])

    return <div ref={containerRef} className={`${styles['select-with-title']} ${customCls?.container ?? ''}`}>
        <Select
            className={`${styles.select} ${customCls?.select ?? ''}`}
            placeholder={''}
            tagRender={(v) => <></>}
            showArrow={showArrow}
            value={_value}
            onChange={(e, opt) => {
                _setValue(e)
                onChange && onChange(e, opt)
            }}
            mode={mode}
            options={options}
            {...rest}
        >
            {children}
        </Select>
        <div className={`${styles.inner} ${showArrow ? styles['with-arrow'] : ''} ${customCls?.inner ?? ''}`}>
            {labelPrefix && <span className={`${styles['inner-name']} ${innerName?.required ? styles.required : ''}`}>{labelPrefix}</span>}
            {innerContent && <span className={styles['inner-text']}>
                {innerContent}
            </span>}
            {!innerContent && <span className={styles['inner-placeholder']}>
                {i18n('placeholder')}
            </span>}
        </div>
    </div>
}

export default StyledAntSelect