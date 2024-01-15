import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CONSTANTS, OptionFactory, getColorMap, shouldInfoDisplayAsBlock } from './factory'
import { DataRecord, Info, TimeRange } from './type'
import styles from './index.module.scss'
import _ from 'lodash'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import Configurator, { Config } from './Configurator'
import { msgTag } from '@/common/lang'
import moment from 'moment'
import AdaptiveEchartsWrap from 'EchartsWrap/AdaptiveEchartsWrap'
import { EChartsType } from 'echarts/core'
import { ECBasicOption } from 'echarts/types/dist/shared'
import { combinePointKey } from '@/common/utils/model'
const i18n = msgTag('PointCurve')

export const combineInfos = (points: TPointWithCfg[], assets: Asset[], timeRange?: TimeRange): Info[] => {
    return assets.flatMap(asset => {
        return points.map(p => {
            const pointKey = combinePointKey(p)

            return {
                key: asset.alias + pointKey + timeRange?.key ?? '',
                nameCn: `${asset.name} ${p.nameCn} ${timeRange?.name ?? ''}`,
                nameEn: `${asset.name} ${p.nameEn} ${timeRange?.name ?? ''}`,
                assetInfo: asset,
                originPointInfo: {
                    key: pointKey,
                    ...p
                }
            } as Info
        })
    })
}

type Asset = {
    name: string
    alias: string
}

export type PointCurveProps = {
    /* 容器classname */
    containerCls?: string
    /* echart容器id */
    id?: string
    records: DataRecord[]
    config: Config
    timeRanges: TimeRange[]
    originTimeRanges: TimeRange[] // 缩放前时间
    onConfigChange?: (cfg: Config) => void
    onDatazoom?: (ranges: TimeRange[]) => void
}

/**
 * @warn 自定义渲染系列在执行数据对比时会产生未知错误，故如果需要动态变化record，需重新挂载echarts组件
 *       此过程中可能导致控制台异步事件报错，无需处理
 */
const PointCurve = ({
    containerCls, id = 'defaultId', config, records, timeRanges, originTimeRanges, onConfigChange, onDatazoom
}: PointCurveProps) => {

    const containerRef = useRef<HTMLDivElement>(null!)
    const [showCfg, setShowCfg] = useState(false)
    const [containerSize, setContainerSize] = useState<{ height: number, width: number } | undefined>()
    const [echartHeight, setEchartHeight] = useState<{
        totalHeight: number,
        yxGridHeight: number,
        otherGridHeight: number,
        legendHeight: number,
        sliderBarHeight: number
    }>()

    useLayoutEffect(() => {
        const resize = _.debounce((size: typeof containerSize) => setContainerSize(size), 500)
        const ob = new ResizeObserver((entries) => {
            const ele = entries[0]
            if (ele) {
                const size = {
                    height: Math.floor(ele.contentRect.height),
                    width: Math.floor(ele.contentRect.width)
                }
                if (size.height > 0 && size.width > 0) {
                    resize(size)
                }
            }
        })
        ob.observe(containerRef.current)
        return () => {
            ob.disconnect()
        }
    }, [])

    const dataFromConfig = useMemo(() => {
        let yxNum = 0
        let otherNum = 0
        config.infos.forEach(info => {
            if (shouldInfoDisplayAsBlock(info)) {
                yxNum++
            } else {
                otherNum++
            }
        })
        const colorMap = getColorMap(config.infos)
        return { yxNum, otherNum, colorMap, infos: config.infos, commonCfg: config.common }
    }, [config])

    useLayoutEffect(() => {
        if (!containerSize) return
        const { yxNum, otherNum } = dataFromConfig
        const { height: containerHeight } = containerSize

        const yxGridHeight = yxNum * (22 + 4) + (yxNum - 1) * 10
        const minOtherGridHeight = 300
        const sliderBarHeight = 30
        const legendHeight = Math.ceil(otherNum / 3) * (20 + 20)
        const { toolboxHeight, gridGap } = CONSTANTS
        if (yxNum > 0 && otherNum > 0) {
            const calcHeight = toolboxHeight +
                yxGridHeight + gridGap +
                minOtherGridHeight + gridGap +
                sliderBarHeight + legendHeight

            const totalHeight = Math.max(containerHeight, calcHeight)
            setEchartHeight({
                totalHeight,
                yxGridHeight: yxGridHeight,
                otherGridHeight: totalHeight === containerHeight ?
                    containerHeight - calcHeight + minOtherGridHeight :
                    minOtherGridHeight,
                legendHeight, sliderBarHeight
            })
        } else if (yxNum > 0) {
            const totalHeight = Math.max(containerHeight, toolboxHeight + yxGridHeight + gridGap + sliderBarHeight)
            setEchartHeight({
                totalHeight,
                yxGridHeight: yxGridHeight,
                otherGridHeight: 0,
                legendHeight: 0,
                sliderBarHeight
            })
        } else if (otherNum > 0) {
            const calcHeight = toolboxHeight + minOtherGridHeight + gridGap + sliderBarHeight + legendHeight
            const totalHeight = Math.max(containerHeight, calcHeight)
            setEchartHeight({
                totalHeight,
                yxGridHeight: 0,
                otherGridHeight: totalHeight === containerHeight ?
                    containerHeight - calcHeight + minOtherGridHeight : minOtherGridHeight,
                legendHeight, sliderBarHeight
            })
        }
    }, [dataFromConfig, containerSize])

    const [datazoom, setDatazoom] = useState<{
        start: number
        end: number
        ranges: TimeRange[]
    } | undefined>()
    useEffect(() => {
        datazoom && onDatazoom && onDatazoom(datazoom.ranges)
    }, [datazoom])

    const factory = useMemo(() => echartHeight ? new OptionFactory({
        tooltipCls: {
            container: styles.container,
            time: styles.time,
            data: styles.data,
            icon: styles.icon,
            name: styles.name,
            value: styles.value,
        },
        datazoom: datazoom,
        originInfos: config.infos ?? [],
        colorMap: dataFromConfig.colorMap,
        records: records,
        height: echartHeight,
        ranges: timeRanges,
        zoomBasedRange: originTimeRanges[0],
        opt: {
            commonAxisCfg: dataFromConfig.commonCfg
        }
    }) : null, [JSON.stringify(echartHeight), records, datazoom?.start, datazoom?.end, timeRanges])

    const getOption = useCallback((containerSize: { height: number; width: number }, ins: EChartsType): ECBasicOption => {
        if (!factory) {
            return {}
        }

        const option = factory.generateOption()
        console.debug('option echartHeight containerHeight', option, echartHeight, containerSize)
        return option
    }, [factory])

    return <div className={`${styles.container} ${containerCls ?? ''}`} ref={containerRef}>
        {echartHeight && <div style={{
            position: 'relative',
            height: echartHeight.totalHeight,
            width: '100%',
            marginRight: '8px'
        }}>
            <AdaptiveEchartsWrap key={`${id}_${datazoom?.start ?? 0}_${datazoom?.end ?? 100}`} id={id}
                getOption={getOption} reRenderOnResize lazyUpdate notMerge
                onReady={ins => {
                    ins.on('datazoom', (evt) => {
                        const { start, end } = evt as { start: number, end: number }
                        const zoomRanges = originTimeRanges.map(({ st, et, key, name }) => {
                            const totalDuration = moment.duration(et.diff(st), 'second')
                            const zoomSt = st.clone().add(
                                moment.duration(Math.floor(totalDuration.asSeconds() / 1000 * start / 100), 'second')
                            )
                            const zoomEt = st.clone().add(
                                moment.duration(Math.ceil(totalDuration.asSeconds() / 1000 * end / 100), 'second')
                            )
                            return {
                                key, name,
                                st: zoomSt, et: zoomEt
                            }
                        })

                        if (onDatazoom) {
                            setDatazoom(oldZoom => {
                                const oldStart = oldZoom?.start ?? 0
                                const oldEnd = oldZoom?.end ?? 100
                                if (oldStart === start && oldEnd === end) {
                                    return oldZoom
                                }
                                return {
                                    start, end,
                                    ranges: zoomRanges
                                }
                            })
                        }
                    })
                }} />
            <div className={`${styles.config}`} onClick={() => setShowCfg(true)} data-title={i18n('config')}>
                <FontIcon type={iconsMap.CONFIG} />
            </div>
        </div>}
        {showCfg && <Configurator
            config={config}
            onSave={(cfg) => {
                onConfigChange && onConfigChange(cfg)
                setShowCfg(false)
            }}
            onCancel={() => setShowCfg(false)} />}
    </div>
}

export default PointCurve