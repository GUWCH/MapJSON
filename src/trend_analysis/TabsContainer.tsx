import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import styles from './TabsContainer.module.scss'
import Tabs, { TabPane } from 'Tabs'
import { DataRecord, Info, TimeRange } from 'PointCurve/type'
import { isZh } from '@/common/util-scada'
import PointCurve from 'PointCurve'
import dao from './dao'
import DataTable from './DataTable'
import { getGranularity, i18n } from './utils'
import EnvLoading from 'EnvLoading'
import { Config } from 'PointCurve/Configurator'
import Memory, { getMemoryDesc, getPageMemoryReq } from '@/common/util-memory'
import Empty from 'Empty'
import { CURRENT_VERSION, convertToNewestVersionMemo } from './historyDataAdapter'
import StatisticsTable, { StatisticsTableProps } from './StatisticsTable'
import { logTime, momentToLogStr } from '@/common/utils/debug'

export type TabsContainerProps = {
    templateId?: string
    curveId: string
    originRanges: TimeRange[]
    zoomedRanges: TimeRange[]
    allInfos?: Info[]
    tplInfos?: Info[]
    showStatistic?: boolean
    statisticRangeFmt: StatisticsTableProps['rangeFormater']
    statisticCols: StatisticsTableProps['displayCols']
    onDatazoom: (zoomed: TimeRange[]) => void
}

const TabsContainer = React.forwardRef<{ infos: Info[] }, TabsContainerProps>(({
    templateId, curveId, originRanges, zoomedRanges, allInfos, tplInfos, showStatistic, statisticRangeFmt, statisticCols, onDatazoom
}, ref) => {
    const [config, setConfig] = useState<Config>({ infos: [] })
    const infos = config?.infos
    const memo = useMemo(() => new Memory(Object.assign({}, getPageMemoryReq(), {
        description: getMemoryDesc('', 'trend_analysis')
    })), [])
    const [memoConfigMap, setMemoConfigMap] = useState<Record<string, Config | undefined>>({})
    const [loadingMemo, setLoadingMemo] = useState(true)
    const saveConfigToMemo = (newCfg: Config) => {
        if (templateId) {
            memo.save({
                data: {
                    ...memoConfigMap,
                    [templateId]: {
                        infos: newCfg.infos.filter(info => tplInfos?.find(tInfo => tInfo.key === info.key)),
                        common: newCfg.common,
                    }
                },
                version: CURRENT_VERSION
            })
        }
    }
    useEffect(() => {
        setLoadingMemo(true)
        memo.init().then(v => {
            const { isOk, content } = v
            if (!isOk) {
                console.warn('load memo error')
                return
            }

            let contentObj: Record<string, Config> = {}
            try {
                contentObj = convertToNewestVersionMemo(JSON.parse(content)).data
            } catch (e) {
                console.warn('parse memo content error, content:', content, e)
            }
            setMemoConfigMap(contentObj)
        }).finally(() => setLoadingMemo(false))
    }, [])

    useEffect(() => {
        if (loadingMemo) return

        if (templateId) {
            const memoConfig = memoConfigMap[templateId]
            const memoInfoMap = memoConfig?.infos.reduce((p, c) => ({ ...p, [c.key]: c }), {})
            setConfig({
                infos: (allInfos ?? []).map(info => memoInfoMap?.[info.key] ?? info),
                common: memoConfig?.common
            })
        } else {
            setConfig({ infos: allInfos ?? [] })
        }
    }, [allInfos, templateId, memoConfigMap, loadingMemo])

    useImperativeHandle(ref, () => ({ infos: infos ?? [] }), [infos])

    const curveTabKey = 'curve'
    const [currentTabKey, setTabKey] = useState<string>(curveTabKey)
    const [records, setRecords] = useState<DataRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const recordMapByInfoKey = useMemo(() => records.reduce((p, c) => {
        const arr = p[c.infoKey] ?? []
        return {
            ...p,
            [c.infoKey]: [...arr, c]
        }
    }, {} as Record<string, DataRecord[]>), [records])

    useEffect(() => {
        if (infos && infos.length > 0) {
            setIsLoading(true)
            const dataInterval = getGranularity(zoomedRanges, infos)
            Promise.all(zoomedRanges.map(r => {
                const currentInfos = infos.filter(i => i.relatedTimeKey === r.key)
                return dao.getRecords(currentInfos, r.st, r.et, dataInterval)
            }))
                .then(arr => setRecords(arr.flat()))
                .finally(() => setIsLoading(false))
        }
    }, [config, zoomedRanges])

    return <>
        <div className={styles.tab}>
            <Tabs activeKey={currentTabKey} onChange={k => setTabKey(k)}>
                <TabPane key={curveTabKey} tab={i18n('curve')} />
                {infos && infos.map(info => {
                    return <TabPane key={info.key} tab={(isZh ? info.nameCn : info.nameEn) ?? ''} />
                })}
            </Tabs>
            <div className={styles.content}>
                <EnvLoading isLoading={isLoading} />
                <PointCurve
                    id={curveId}
                    containerCls={currentTabKey === curveTabKey && records.length > 0 ? '' : styles.hidden}
                    records={records}
                    timeRanges={zoomedRanges}
                    originTimeRanges={originRanges}
                    config={config}
                    onConfigChange={newConfig => {
                        saveConfigToMemo(newConfig)
                        setConfig(newConfig)
                    }}
                    onDatazoom={onDatazoom}
                />
                {currentTabKey === curveTabKey && records.length === 0 && <Empty />}
                {currentTabKey && currentTabKey !== curveTabKey && <DataTable records={recordMapByInfoKey[currentTabKey] ?? []} />}
            </div>
        </div>
        {showStatistic && <div className={styles.statistics}>
            <div className={styles.title}>{i18n('statistics')}</div>
            <StatisticsTable rangeFormater={statisticRangeFmt} displayCols={statisticCols} infos={infos} records={records} timeRanges={zoomedRanges} />
        </div>}
    </>
})

export default TabsContainer