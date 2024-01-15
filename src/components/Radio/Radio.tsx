import React from 'react'
import styles from './Radio.module.scss'
import { Radio as OriginRadio, RadioProps as OriginRadioProps } from 'antd'

export type RadioProps = {} & OriginRadioProps

const Radio: React.FC<RadioProps> = ({
    children,
    ...rest
}) => {

    return <OriginRadio {...rest} className={styles.container}>
        {children}
    </OriginRadio>
}

export default Radio