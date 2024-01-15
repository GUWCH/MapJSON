import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import { Select } from 'antd'
import { protoService } from '../services'
import { isZh } from '@/common/util-scada'
import { ProtoKeys, protoNameMap } from 'ParamsGenerator/constant'

export type TemplateProtoSelectorProps = {
    value?: ProtoKeys
    enabledProtoKeys?: ProtoKeys[]
    onChange: (proto?: ProtoKeys) => void
}

const TemplateProtoSelector: React.FC<TemplateProtoSelectorProps> = ({
    enabledProtoKeys,
    value, onChange
}) => {
    const [protos, setProtos] = useState<ProtoKeys[]>([])

    useEffect(() => {
        const arr = protoService.list().filter(t => {
            const enabled = enabledProtoKeys ?? [ProtoKeys.points, ProtoKeys.SOE, ProtoKeys.warn]
            return enabled.includes(t)
        })
        setProtos(arr)
    }, [enabledProtoKeys])

    return <Select className={styles.select}
        defaultValue={ProtoKeys.points}
        value={value} onChange={k => onChange(protos.find(p => p === k))}>
        {protos.map(p => <Select.Option key={p} value={p}>
            {protoNameMap(isZh)[p]}
        </Select.Option>)}
    </Select>
}

export default TemplateProtoSelector