import { DATE_CUSTOM_FORMAT } from '@/common/const-scada'
import { _dao, daoIsOk } from '@/common/dao'
import { msgTag } from '@/common/lang'
import { DefaultButton } from 'Button'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import { confirm } from 'Modal'
import { notify } from 'Notify'
import { useRecursiveTimeoutEffect } from 'ReactHooks'
import { Button, Checkbox, Table, Tooltip } from 'antd'
import { ColumnType } from 'antd/lib/table'
import _, { isNumber } from 'lodash'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import styles from './DataExportTable.module.scss'
import dao from './dao'

const i18n = msgTag('dataExport')

const DataConditions: React.FC<{ data: IExportConditionDTO[] }> = ({
    data
}) => {
    const [expand, setExpand] = useState(false)

    return <div className={styles.conditions}>
        <FontIcon type={expand ? iconsMap.COLLAPSE : iconsMap.EXPAND} onClick={() => setExpand(v => !v)} />
        <div className={`${styles.content} ${expand ? '' : styles.content_unexpand}`}>
            {data.filter(d => expand || d.showInAbstract).map(d => {
                return <React.Fragment key={d.name}>
                    <span className={styles.row}>
                        <span className={styles.name}>{d.name}</span>
                        <span>{d.value || i18n('empty')}</span>
                    </span>
                    <br />
                </React.Fragment>
            })}
        </div>
    </div>
}

type TRecord = {
    id: string
    conditions: IExportConditionDTO[]
    st: string
    et: string
    type: string
    status: 'downloaded' | 'success' | 'fail' | 'in-progress'
    fileUrls: string[]
    timezoneOffset: number
}

export type DataExportTableProps = {
    outerRefreshTrigger?: number
    containerCls?: string
}

const DataExportTable: React.FC<DataExportTableProps> = ({
    containerCls, outerRefreshTrigger
}) => {
    const [selectedKeys, setSelected] = useState<string[]>([])
    const [data, setData] = useState<TRecord[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(outerRefreshTrigger ?? 0)
    const tableAreaRef = useRef<HTMLDivElement>(null)
    const [tableScroll, setTableScroll] = useState<number>()

    useEffect(() => {
        if (outerRefreshTrigger !== undefined) {
            setRefreshTrigger(old => old + 1)
        }
    }, [outerRefreshTrigger])

    useEffect(() => {
        const tableAreaEle = tableAreaRef.current
        let timestamp: number = 0
        const ob = new ResizeObserver((entries) => {
            const currentTime = Date.now()
            timestamp = currentTime

            const tableArea = entries[0]
            const header = tableArea.target.getElementsByClassName('ant-table-header')[0]
            const { height: containerHeight } = tableArea.contentRect
            const { height: headerHeight } = header.getBoundingClientRect()
            const tableScroll = containerHeight - headerHeight
            window.setTimeout(() => {
                if (currentTime === timestamp) {
                    setTableScroll(tableScroll)
                }
            }, 500)
        })

        if (tableAreaEle) {
            ob.observe(tableAreaEle)
        }

        return () => {
            ob.disconnect()
            window.clearTimeout(timestamp)
        }
    }, [])


    useRecursiveTimeoutEffect(() => [
        () => {
            return dao.list().then(list => {
                const newData = list.map(d => {
                    const fileUrls = (d.content?.file_url || [])
                        .map(f => {
                            if (f.file_name && f.file_name.length > 0 && f.node_ip && window.WS?.resource) {
                                const name = f.file_name
                                const ip = f.node_ip
                                return window.WS.resource(name) + encodeURI('&forward_ip=' + ip);
                            }
                            return undefined
                        })
                        .filter(f => f) as string[]
                    const offset = d.content?.utc
                    return {
                        id: d.id,
                        conditions: d.conditions,
                        st: d.content?.datetime ?? '',
                        et: d.content?.datetime_end ?? '',
                        type: d.type,
                        fileUrls: fileUrls,
                        status: d.status,
                        timezoneOffset: parseInt(isNumber(offset) ? offset : '8')
                    }
                })
                setData(newData)
            })
        }
    ], 1000 * 60, [refreshTrigger])

    useEffect(() => {
        const count = _.countBy(data, d => d.status === 'success' && d.fileUrls && d.fileUrls.length > 0)
        const undownloaded = count['true']
        const ele = document.getElementById('data_export_number_new')
        if (ele) {
            const eleStyle = ele.style
            eleStyle.display = undownloaded > 0 ? "block" : "none"
            ele.innerHTML = String(undownloaded)
        }
    }, [data])

    const cols: ColumnType<TRecord>[] = [
        {
            dataIndex: 'conditions',
            title: i18n('cols.conditions'),
            render: (value: IExportConditionDTO[]) => {
                return <DataConditions data={value} />
            }
        },
        {
            dataIndex: 'st',
            title: i18n('cols.st'),
            width: 200,
            render(value, record, index) {
                const offset = record.timezoneOffset
                return value ? `${moment(value).format(DATE_CUSTOM_FORMAT.DATE)}(UTC${offset >= 0 ? '+' : '-'}${Math.abs(offset)})` : ''
            },
        },
        {
            dataIndex: 'et',
            title: i18n('cols.et'),
            width: 200,
            render(value, record, index) {
                const offset = record.timezoneOffset
                return value ? `${moment(value).format(DATE_CUSTOM_FORMAT.DATE)}(UTC${offset >= 0 ? '+' : '-'}${Math.abs(offset)})` : ''
            },
        },
        {
            dataIndex: 'type',
            title: i18n('cols.type'),
            width: 150
        },
        {
            key: 'op',
            width: 150,
            render: (_, record) => {
                return <>
                    {record.status === 'fail' && <span>{i18n('exportFail')}</span>}
                    {record.status === 'in-progress' && <span>{i18n('exporting')}</span>}
                    {['downloaded', 'success'].includes(record.status) && <Button type='link' size='small'
                        style={{ opacity: record.status === 'downloaded' ? 0.5 : 1 }}
                        disabled={record.fileUrls && record.fileUrls.length > 0 ? undefined : true}
                        onClick={() => handleDownload(record.id, record.fileUrls)}>{i18n('download')}</Button>}
                    {record.status !== 'in-progress' && <Button type='link' size='small' onClick={() => handleDelete(record.id)}>{i18n('delete')}</Button>}
                </>
            }
        },
    ]

    const handleDelete = (...ids: string[]) => {
        if (ids.length > 0) {
            confirm({
                title: i18n('deleteModal.title'),
                content: i18n('deleteModal.content'),
                onOk: () => {
                    _dao.memo('delete', {
                        id: ids.join(','),
                        type: "8"
                    }).then((res) => {
                        if (!daoIsOk(res)) {
                            notify(i18n('deleteFail'))
                        } else {
                            notify(i18n('deleteSuc'))
                        }
                        setRefreshTrigger(refreshTrigger + 1)
                    })
                },
            })
        }
    }

    const handleDownload = async (recordId: string, urls: string[]) => {
        await dao.updateRecordStatus(recordId)
        setRefreshTrigger(t => t + 1)
        urls.forEach(url => {
            const aDom = document.createElement('a')
            aDom.target = '_blank'
            aDom.download = 'name'
            aDom.href = url
            aDom.click()
        })
    }

    const disableBatchbtn = selectedKeys.length === 0
    const batchDeleteBtn = <DefaultButton disabled={disableBatchbtn}
        style={disableBatchbtn ? { pointerEvents: 'none' } : undefined}
        onClick={() => handleDelete(...selectedKeys)}>
        {i18n('batchDelete')}
    </DefaultButton>

    return <div className={`${styles.container} ${containerCls ?? ''}`} >
        <div className={styles.bar}>
            <span>{i18n('title')}</span>
            {
                disableBatchbtn ? <Tooltip title={i18n('batchDeleteTips')} >
                    <div style={{ cursor: 'not-allowed' }}>
                        {batchDeleteBtn}
                    </div>
                </Tooltip> : batchDeleteBtn
            }
        </div>
        <div className={styles.table} ref={tableAreaRef}>
            <Table rowKey={'id'} rowSelection={{
                columnWidth: 100,
                columnTitle: <div className={styles.check}>
                    <Checkbox
                        indeterminate={selectedKeys.length > 0 && selectedKeys.length < data.length}
                        checked={selectedKeys.length === data.length && data.length > 0}
                        onChange={e => {
                            const checked = e.target.checked
                            setSelected(checked ? data.filter(d => d.status !== 'in-progress').map(d => d.id) : [])
                        }}
                    />
                </div>,
                renderCell: (value, record, index, originNode) => {
                    return <div className={styles.check}>
                        <Checkbox disabled={record.status === 'in-progress'} checked={selectedKeys.includes(record.id)} onChange={e => {
                            const checked = e.target.checked
                            setSelected(old => checked ? old.concat(record.id) : old.filter(r => r !== record.id))
                        }} />
                        <span>{index + 1}</span>
                    </div>
                },
            }} dataSource={data} columns={cols} scroll={{ y: tableScroll + 'px' }} pagination={false} />
        </div>
    </div>
}


export default DataExportTable