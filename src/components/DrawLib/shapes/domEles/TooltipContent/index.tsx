import { isZh } from "@/common/util-scada"
import { FontIcon } from "Icon"
import iconsMap from "Icon/iconsMap"
import React, { useState } from "react"
import { Input } from 'antd'
import styles from './index.module.scss'

const i18nText = {
    cn: {
        nameTip: {
            nameNo: '名称编号:',
            pointAlias: '关联点别名:'
        }
    },
    en: {
        nameTip: {
            nameNo: 'Name:',
            pointAlias: 'Point Alias:'
        }
    }
}

export type NameTipProps = {
    disableName?: boolean
    name?: string
    alias?: string
    nameCls?: string
    valueCls?: string
    onRename?: (newName: string) => void
}

export const NameTipContent: React.FC<NameTipProps> = (props) => {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(props.name)

    const text = isZh ? i18nText.cn.nameTip : i18nText.en.nameTip

    const handleRename = () => {
        props.onRename && props.onRename(name ?? '')
        setEditing(false)
    }

    return <>
        {!props.disableName && <>
            <div className={props.nameCls}>{text.nameNo}</div>
            <div className={props.valueCls}>
                {editing ?
                    <Input size="small" style={{ flex: 1, width: '100px' }} allowClear value={name} autoFocus
                        maxLength={31}
                        onBlur={() => handleRename()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRename()
                            }
                        }}
                        onChange={(e) => setName(e.target.value)} /> :
                    <>
                        {props.name}&nbsp;
                        {props.onRename &&
                            <FontIcon type={iconsMap.EDITOR} style={{
                                display: 'flex',
                                alignItems: 'center',
                                color: '#6A8CA3',
                                cursor: 'pointer'
                            }} onClick={() => setEditing(true)} />
                        }
                    </>}
            </div>
        </>}
        {props.alias && <>
            <div className={props.nameCls}>{text.pointAlias}</div>
            <div className={props.valueCls}>{props.alias}</div>
        </>}
    </>
}

export type PointsTipProps = {
    nameCls?: string
    valueCls?: string
    unitCls?: string
    pointData: {
        name: string
        value: string
        color?: string
        unit?: string
    }[]
}

export const PointsTipContent: React.FC<PointsTipProps> = (props) => {
    return <>
        {props.pointData.flatMap((d, i) => [
            <div key={'name' + i} className={props.nameCls}>{(d.name + ':').replace(/((::)|(：:))$/, ':')}</div>,
            <div key={'value' + i} className={props.valueCls}>
                <div style={{ color: d.color }}>{d.value}</div>
                <div className={props.unitCls}>{d.unit}</div>
            </div>
        ])}
    </>
}

export type BarrowTipProps = Omit<NameTipProps, 'nameCls' | 'valueCls'> & Omit<PointsTipProps, 'nameCls' | 'valueCls'>
export const BarrowTip: React.FC<BarrowTipProps> = (props) => {
    return <div className={styles.fields_container}>
        <NameTipContent
            name={props.name}
            nameCls={styles.fields_name}
            valueCls={styles.fields_value}
            alias={props.alias}
            onRename={props.onRename}
        />
        <PointsTipContent
            nameCls={styles.fields_name}
            valueCls={styles.fields_value}
            unitCls={styles.fields_unit}
            pointData={props.pointData}
        />
    </div>
}

export type SubTipProps = Omit<NameTipProps, 'nameCls' | 'valueCls' | 'onRename'>
export const SubTip: React.FC<SubTipProps> = (props) => {
    return <div className={styles.fields_container}>
        <NameTipContent
            name={props.name}
            nameCls={styles.fields_name}
            valueCls={styles.fields_value}
            alias={props.alias}
        />
    </div>
}

export type PadTipProps = Omit<NameTipProps, 'nameCls' | 'valueCls'>
export const PadTip: React.FC<PadTipProps> = (props) => {
    return <div className={styles.fields_container}>
        <NameTipContent
            name={props.name}
            nameCls={styles.fields_name}
            valueCls={styles.fields_value}
            alias={props.alias}
            disableName={props.disableName}
            onRename={props.onRename}
        />
    </div>
}