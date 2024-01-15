import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ValueTable.module.scss'
import AntTable, { AutoFitTable } from 'AntTable'
import { msgTag } from '@/common/lang'
import { Button, TableColumnProps } from 'antd'
import { isZh } from '@/common/util-scada'
import scadaCfg from '@/common/const-scada'
import { _dao, daoIsOk } from '@/common/dao'
import { getDynKey, parsePointKey } from '@/common/utils/model'
import { PrimaryButton } from 'Button'
import { Asset } from '../type'
import { POINT_TABLE } from '@/common/constants'
import SettingModal from './SettingModal'

const i18n = msgTag('ValueDistributor')

export type ValueTableProps = {
    containerCls?: string
    modelId?: string
    points: TPoint[]
}

const ValueTable: React.FC<ValueTableProps> = ({
    containerCls, modelId, points
}) => {
    const [assets, setAssets] = useState<Asset[]>([])
    useEffect(() => {
        const currentNodeAlias = scadaCfg.getCurNodeAlias()
        if (modelId) {
            _dao.getDeviceTreeByObjectAlias(currentNodeAlias, [modelId], 'FAC')
                .then(res => {
                    if (daoIsOk(res)) {
                        setAssets(res.data.flatMap(g => g.devices))
                    } else {
                        console.error('fetch asset error')
                    }
                })
        }
    }, [modelId])

    const [datasource, setDatasource] = useState<(Asset & {
        [key: string]: string
    })[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const rawValueSuffix = '_raw'

    useEffect(() => {
        if (assets.length > 0 && points.length > 0) {
            const dynData: IDynData[] = []
            const infoCache: Record<string, {
                assetAlias: string,
                pointKey: string
            } | undefined> = {}

            assets.forEach(a => {
                points.forEach(p => {
                    if (!p.ifStandard && p.type && !p.type.includes(a.model ?? '')) {
                        console.warn('point type do not match asset model', p.type, a.model)
                        return
                    }
                    const dynKey = getDynKey({
                        point: p,
                        assetAlias: a.alias
                    })

                    infoCache[dynKey] = {
                        assetAlias: a.alias,
                        pointKey: p.key
                    }

                    dynData.push({
                        id: "",
                        key: dynKey,
                        decimal: p.decimal ?? ''
                    })
                })
            })
            _dao.getDynData(dynData).then(res => {
                const dynMap = daoIsOk(res) ? res.data.reduce((p, c) => {
                    const dynKey = c.key
                    const info = infoCache[dynKey]
                    if (!info) {
                        return p
                    }
                    const { assetAlias, pointKey } = info
                    const { tableNo } = parsePointKey(pointKey)
                    const preArr = [...(p[assetAlias] ?? [])]
                    preArr.push({
                        pointKey,
                        value: c.status_value === 0 ? c.display_value : '',
                        rawValue: c.status_value === 0 ? (tableNo === POINT_TABLE.YX ? c.raw_value ?? '' : c.display_value) : ''
                    })

                    return {
                        ...p,
                        [assetAlias]: preArr
                    }
                }, {} as Record<string, { pointKey: string, value: string, rawValue: string }[] | undefined>) : {}

                setDatasource(assets.map(a => {
                    const record: Record<string, string> & Asset = { ...a }

                    dynMap[a.alias]?.forEach(d => {
                        record[d.pointKey] = d.value
                        record[d.pointKey + rawValueSuffix] = d.rawValue
                    })
                    return record
                }))
            })
        }
    }, [assets, points, refreshTrigger])

    const cols = useMemo(() => {
        const cols: TableColumnProps<ArrayElement<typeof datasource>>[] = [{
            dataIndex: 'name',
            title: i18n('cols.device'),
            fixed: true,
            width: 150
        },
        ...points.map(p => ({
            dataIndex: p.key,
            title: isZh ? p.nameCn : p.nameEn,
            width: 150,
            render(v) { return v ? v : '-' }
        })), {
            key: 'operation',
            title: i18n('cols.operation'),
            fixed: 'right',
            width: 80,
            render(_, record) {
                return <Button type='link' size='small' onClick={() => {
                    setEditting([record])
                }}>{i18n('setting')}</Button>
            },
        }]
        return cols
    }, [points])

    const [editting, setEditting] = useState<typeof datasource | undefined>()
    const [selectedRows, setSelected] = useState<typeof datasource | undefined>()

    return <div className={`${styles.container} ${containerCls}`}>
        <div className={styles.table}>
            <AutoFitTable
                rowKey={'alias'}
                bordered
                columns={cols}
                dataSource={datasource}
                pagination={false}
                scroll={{ x: 'max-content' }}
                rowSelection={{
                    columnWidth: 32,
                    fixed: true,
                    onChange: (keys, rows) => {
                        setSelected(rows)
                    }
                }} />
        </div>
        <div className={styles.btnArea}>
            <PrimaryButton className={styles.btn} onClick={() => setEditting(selectedRows)}>{i18n('batchSetting')}</PrimaryButton>
        </div>
        {editting && <SettingModal
            assets={editting}
            points={points}
            originPointValueMap={
                editting.length === 1 ?
                    Object.entries(editting[0]).reduce((p, c) => {
                        const [k, v] = c
                        if (k.endsWith(rawValueSuffix)) {
                            const pointKey = k.slice(0, k.indexOf(rawValueSuffix))
                            return {
                                ...p,
                                [pointKey]: v
                            }
                        } else {
                            return p
                        }
                    }, {} as Record<string, string | undefined>) :
                    undefined
            }
            onClose={() => {
                setEditting(undefined)
                setRefreshTrigger(t => t + 1)
            }}
        />}
    </div>
}

export default ValueTable