import React from 'react'
import styles from './RadioGroup.module.scss'
import { Radio as OriginRadio, RadioGroupProps as OriginRadioGroupProps } from 'antd'
import Radio from './Radio'


export type RadioGroupProps = {
    containerCls?: string
    optionCls?: string
} & OriginRadioGroupProps

const RadioGroup: React.FC<RadioGroupProps> = ({
    containerCls,
    optionCls,
    options,
    children,
    ...rest
}) => {
    return <OriginRadio.Group className={containerCls} {...rest}>
        {options ? options.map(o => {
            const label = typeof o === 'string' ? o : o.label
            const value = typeof o === 'string' ? o : o.value

            return <Radio key={String(value)} className={optionCls} value={value}>
                {label}
            </Radio>
        }) : children}
    </OriginRadio.Group>
}

export default RadioGroup