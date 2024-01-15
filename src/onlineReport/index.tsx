import '@/common/css/app.scss'
import { _dao, daoIsOk } from '@/common/dao'
import { msgTag } from '@/common/lang'
import { DefaultButton, PrimaryButton } from 'Button'
import { DatePicker } from 'DatePicker'
import EnvLoading from 'EnvLoading'
import { notify } from 'Notify'
import TreeSelect from 'Tree/TreeSelect'
import { Node } from 'Tree/treeObj'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import { Moment } from 'moment'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import ReactDOM from 'react-dom'
import LuckysheetWrapper from './LuckysheetWrapper'
import styles from './index.module.scss'
import luckysheetConfig from './luckysheetConfig'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import dao from './dao'


const i18n = msgTag('onlineReport')

const LUCKYSHEET_CONTAINER_ID = 'luckysheet'
const DATE_FORMAT = 'yyyy-MM-DD HH:mm:ss'

const App = () => {
    const [tplKey, setTplKey] = useState<string | undefined>()
    const [currentDate, setCurrentDate] = useState<Moment | undefined>()
    const [currentFilePath, setCurrentFilePath] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [tplInfoMapById, setTplMap] = useState<Record<string, IReportTemplateTreeNode | undefined>>()
    const [treeNodes, setTreeNodes] = useState<Node[]>([])
    const [edittable, setEdittable] = useState(false)
    const [reportData, setReportData] = useState<any>()
    const iframeEleRef = useRef<HTMLIFrameElement | null>(null)

    useEffect(() => {
        const iframeWindow = iframeEleRef.current?.contentWindow
        if (reportData && iframeWindow) {
            // @ts-ignore
            iframeWindow.disableEdit = !edittable
            const options = {
                container: LUCKYSHEET_CONTAINER_ID,
                ...luckysheetConfig,
                allowEdit: edittable,
                showtoolbar: edittable,
                data: reportData
            }
            console.debug('options', options)
            iframeWindow.luckysheet.create(options)

        }
    }, [reportData, edittable])

    useEffect(() => {
        dao.getReportTemplates().then(data => {
            const map: typeof tplInfoMapById = {}
            const nodes: typeof treeNodes = []

            data.forEach(n => {
                map[String(n.id)] = n

                nodes.push({
                    key: String(n.id),
                    name: n.name,
                    parentKey: n.parent_id ? String(n.parent_id) : undefined
                })
            })

            setTplMap(map)
            setTreeNodes(nodes)
        })
    }, [])

    const handleGenerate = (force?: boolean) => {
        if (!tplKey || !currentDate) {
            console.error('validate failed,', tplKey, currentDate);
            return
        }
        const info = tplInfoMapById?.[tplKey]

        setLoading(true)

        _dao.loadReport(Object.assign({
            tableId: info?.tableId ?? '',
            date: currentDate.format(DATE_FORMAT),
        }, force ? { force: true } : {})).then(res => {
            if (daoIsOk(res)) {
                setCurrentFilePath(res.data.tableInfo.path)
                setReportData(res.data.tableData)
            } else {
                console.error('load report error');
            }
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleSave = async () => {
        const data = iframeEleRef.current?.contentWindow?.luckysheet?.getAllSheets() ?? []
        data.forEach(d => delete d.data)

        return _dao.saveReport({
            tableInfo: {
                tableId: tplInfoMapById?.[tplKey ?? '']?.tableId ?? '',
                date: currentDate?.format(DATE_FORMAT) ?? ''
            },
            tableData: data
        })
    }

    const handleExport = async () => {
        currentFilePath && _dao.downloadResource('reportsave/' + currentFilePath)
    }

    const disableOp = !currentDate || !tplKey
    return <ConfigProvider locale={zhCN}>
        <div className={styles.page}>
            <EnvLoading isLoading={loading} />
            <div className={styles.bar}>
                <TreeSelect treeProps={useMemo(() => ({
                    nodes: treeNodes,
                    selectedKeys: tplKey ? [tplKey] : [],
                    customCls: { tree: styles.tree },
                    onChange: (n) => setTplKey(n[0]?.key)
                }), [treeNodes, tplKey])}
                    customCls={styles.select}
                    selectValue={tplKey ? tplInfoMapById?.[tplKey]?.name : undefined}
                />
                <DatePicker showTime onChange={(date) => {
                    setCurrentDate(date || undefined)
                }} />
                <PrimaryButton icon={<FontIcon type={iconsMap.SEARCH} />} disabled={disableOp} onClick={() => handleGenerate()}>{i18n('generate')}</PrimaryButton>
                <PrimaryButton icon={<FontIcon type={iconsMap.RESET} />} disabled={disableOp} onClick={() => handleGenerate(true)}>{i18n('reGenerate')}</PrimaryButton>
                {!edittable && reportData && <PrimaryButton icon={<FontIcon type={iconsMap.EDITOR} />} disabled={disableOp} onClick={() => setEdittable(true)}>{i18n('edit')}</PrimaryButton>}
                {edittable && reportData && <PrimaryButton icon={<FontIcon type={iconsMap.CHECK} />} disabled={disableOp} onClick={() => {
                    handleSave().then(res => {
                        if (daoIsOk(res)) {
                            notify(i18n('saveSuc'))
                        } else {
                            notify(i18n('saveFail'))
                        }
                    })
                }}>{i18n('save')}</PrimaryButton>}
                <div>
                    <div>
                        <DefaultButton disabled={disableOp} icon={<FontIcon type={iconsMap.EXPORT} style={{width: 14}}/>} onClick={() => handleExport()}>{i18n('export')}</DefaultButton>
                    </div>
                </div>
            </div>
            <LuckysheetWrapper ref={iframeEleRef} />
        </div>
    </ConfigProvider>
}

if (process.env.NODE_ENV === 'development') {
    import('./dev.css')
    ReactDOM.render(<App />, document.getElementById('center'))
} else {
    ReactDOM.render(<App />, document.getElementById('container'))
}