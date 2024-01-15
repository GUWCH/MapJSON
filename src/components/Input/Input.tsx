import React, { useEffect, useState } from 'react'
import { Input as OriginInput, InputProps as OriginInputProps } from 'antd'
import styles from './Input.module.scss'

export type InputProps = {
    showCount?: boolean
} & OriginInputProps

const Input: React.FC<InputProps> = ({
    className, maxLength, defaultValue, value, suffix, onChange, showCount, ...rest
}) => {
    const [count, setCount] = useState(defaultValue?.toString()?.length)
    useEffect(() => {
        if (value !== undefined) {
            setCount(value.toString().length)
        }
    }, [value])

    const valueProp = value === undefined ? {} : { value: value }

    return <OriginInput
        className={`${styles.input} ${showCount ? styles.withCount : ''} ${className ?? ''}`}
        value={value}
        defaultValue={value}
        onChange={e => {
            const v = e.currentTarget.value
            setCount(v?.length ?? 0)
            onChange && onChange(e)
        }}
        maxLength={maxLength}
        suffix={<>
            {showCount && <span className={styles.count}>
                {`${count ?? 0}${maxLength !== undefined ? ('/' + maxLength) : ''}`}
            </span>}
            {suffix}
        </>}
        {...valueProp}
        {...rest}
    />
}

export default Input