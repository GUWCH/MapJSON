import React, { useState, useMemo, useEffect } from 'react'
import styles from './UnionTooltip.module.scss'
import DeviceTooltip, { DeviceTooltipProps } from './DeviceTooltip'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import { isZh } from '@/common/lang'
import { Input } from 'Input'
import { AutoFitTable } from 'AntTable'
import { ColumnsType } from 'antd/lib/table'
import { Tooltip } from 'antd'

export type UnionTooltipProps = {
    type: 'union'
    typeIconCode: string
    name: string
    titleColor?: string
    edittable: boolean
    members: {
        key: string
        name: string
        status?: {
            iconCode?: string
            color?: string
            displayValue?: string
        }
        deviceTooltipProps: DeviceTooltipProps
    }[]
    /**
     * 难以解决闭包问题，所以选择这种传参方式
     */
    onRemove: (children: string[], removed: string[]) => void
    onClickName: (key: string) => void
}

const UnionTooltip: React.FC<UnionTooltipProps> = ({
    typeIconCode, name, edittable, titleColor = 'rgba(0, 167, 219, 0.50)', members,
    onRemove, onClickName
}) => {

    const [_name, _setName] = useState(name)
    const [records, setRecords] = useState(members)
    useEffect(() => {
        members !== records && setRecords(members)
    }, [members])

    const columns = useMemo(() => {
        const hasStatus = !!records.find(c => c.status)
        const cols: ColumnsType<ArrayElement<UnionTooltipProps['members']>> = [{
            dataIndex: 'name',
            title: <span className={styles.th}>{isZh ? '名称' : 'Name'}</span>,
            render(value, record, index) {
                const tooltipProps = records.find(c => c.key === record.key)
                if (tooltipProps) {
                    return <Tooltip overlayClassName={styles.tooltip} title={<DeviceTooltip {...tooltipProps.deviceTooltipProps} />}>
                        <div className={`${styles.col_name} ${edittable ? '' : styles.clickable}`}
                            onClick={() => !edittable && onClickName(record.key)}>
                            {value}
                        </div>
                    </Tooltip>
                }
                return value
            }
        }]

        if (hasStatus) {
            cols.push({
                key: 'value',
                title: <span className={styles.th}>{isZh ? '状态' : 'Status'}</span>,
                render(value, record, index) {
                    return <div className={styles.col_status}>
                        {record.status?.iconCode && <FontIcon type={iconsMap[record.status.iconCode]} style={{ color: record.status.color }} />}
                        <div>{record.status?.displayValue}</div>
                    </div>
                },
            })
        }

        if (edittable) {
            cols.push({
                key: 'op',
                width: 80,
                render(_, record, index) {
                    return <div className={styles.op} onClick={() => {
                        const newRecords = records.filter(r => r.key !== record.key)
                        const newRecordKeys = newRecords.map(r => r.key)
                        const removedKeys = members.filter(m => !newRecordKeys.includes(m.key)).map(o => o.key)
                        onRemove(newRecordKeys, removedKeys)
                        setRecords(newRecords)
                    }}>
                        {isZh ? '移出分组' : 'Move out'}
                    </div>
                },
            })
        }

        return cols
    }, [records])

    return <div className={styles.container}>
        <div className={styles.title} style={{
            backgroundImage: `linear-gradient(to right, ${titleColor}, transparent)`
        }}>
            <div>
                <FontIcon type={iconsMap[typeIconCode]} />
                <div className={styles.name} title={_name}>{_name}</div>
            </div>
            <div className={styles.count}>
                {isZh ? `共${records.length}个` : `Total ${records.length}`}
            </div>
        </div>
        <div className={styles.table}>
            <AutoFitTable rowKey={'key'} columns={columns} dataSource={records} pagination={false} size='small' />
        </div>
    </div>
}

export default UnionTooltip