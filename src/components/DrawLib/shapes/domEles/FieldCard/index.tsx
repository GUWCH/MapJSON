import { DomEleCommonProps } from "../../../model";
import CommonDynData, { ICommonDynDataProps } from '../../../../DynData'
import React from 'react'
import { domEleWrapper, eleContainer } from '../common'
import styles from './index.module.scss'

export type FieldCardProps = {
    title: string
    data: FieldProps[]
} & DomEleCommonProps

export type FieldProps = {
    dynKey: string
    valueColor?: string
    valueBackground?: string
    value?: IDyn
    unit: string
    nameCn: string
    nameEn: string
    tableNo: number | string
    fieldNo: number | string
    transform?: ICommonDynDataProps['transform']
}

const fieldCard = domEleWrapper(eleContainer(
    (props: FieldCardProps) => {
        return <div className={styles.container}>
            <div className={styles.title}>
                <div className={styles.bar} />
                <div className={styles.title__text} title={props.title}>
                    {props.title}
                </div>
            </div>
            <div className={styles.content}>
                {(props.data ?? []).map(d => {
                    return <CommonDynData
                        key={d.dynKey}
                        containerCls={styles.field}
                        nameContainerCls={styles['name-container']}
                        nameColon
                        valueContainerCls={styles['value-container']}
                        nameCls={styles.name}
                        valueCls={styles.value}
                        wrapperCls={styles.wrapper}
                        valueColor={d.valueColor}
                        valueBackground={d.valueBackground}
                        point={{
                            nameCn: d.nameCn,
                            nameEn: d.nameEn,
                            aliasKey: d.dynKey,
                            tableNo: d.tableNo,
                            fieldNo: d.fieldNo,
                            unit: d.unit
                        }}
                        transform={d.transform}
                        value={d.value}
                        tipTrigger={'hover'}
                    />
                })}
            </div>
        </div>
    }
))

export default fieldCard