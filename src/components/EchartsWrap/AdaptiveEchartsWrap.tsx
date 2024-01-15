import React, { useEffect, useRef, useState } from 'react';

import * as echarts from 'echarts/core';
import { DatasetComponentOption } from 'echarts'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import {
    DataZoomComponent,
    TitleComponent,
    MarkLineComponent,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    GeoComponent,
    VisualMapComponent,
    VisualMapContinuousComponent,
    VisualMapPiecewiseComponent
} from 'echarts/components';
import {
    BarChart,
    LineChart,
    MapChart,
    ScatterChart,
    EffectScatterChart
} from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import _ from 'lodash';
import styles from './AdaptiveEchartsWrap.module.scss'


echarts.use([
    DataZoomComponent,
    TitleComponent,
    MarkLineComponent,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    GeoComponent,
    VisualMapComponent,
    VisualMapContinuousComponent,
    VisualMapPiecewiseComponent,
    LineChart,
    BarChart,
    MapChart,
    ScatterChart,
    EffectScatterChart,
    CanvasRenderer
]);

export type EchartsWrapProps = {
    id?: string
    dataset?: DatasetComponentOption[]
    getOption: (containerSize: { height: number, width: number }, ins: ECharts) => EChartsCoreOption
    onReady?: (ins: ECharts) => void
    notMerge?: boolean
    lazyUpdate?: boolean
    reRenderOnResize?: boolean
    updateDelay?: number
    containerCls?: string
}

const AdaptiveEchartsWrap = ({
    id, reRenderOnResize, notMerge, lazyUpdate, updateDelay, containerCls, dataset, getOption, onReady
}: EchartsWrapProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const echartsRef = useRef<ECharts>()
    const [echartInsReady, setEChartInsReady] = useState(false)

    useEffect(() => {
        const containerEle = containerRef.current
        if (containerEle) {
            echartsRef.current = echarts.init(containerEle)
            setEChartInsReady(true)
            return () => echartsRef.current?.dispose()
        }
    }, [id])

    useEffect(() => {
        const ins = echartsRef.current
        if (echartInsReady && ins && onReady) {
            onReady(ins)
        }
    }, [echartInsReady, onReady])

    useEffect(() => {
        const containerEle = containerRef.current
        const echartIns = echartsRef.current
        if (containerEle && echartIns && echartInsReady) {
            const { height: initialHeight, width: initialWidth } = containerEle.getBoundingClientRect()
            const initialOpt = getOption({ height: initialHeight, width: initialWidth }, echartIns)
            echartIns.clear()
            echartIns.resize()
            echartIns.setOption(initialOpt, notMerge, lazyUpdate)

            if (reRenderOnResize) {
                const resize = _.debounce((height: number, width: number) => {
                    const opt = getOption({ height, width }, echartIns)
                    echartIns.resize()
                    echartIns.setOption(opt, notMerge, lazyUpdate)
                }, updateDelay ?? 0)

                const ob = new ResizeObserver((entries) => {
                    const ele = entries[0]
                    const { height, width } = ele.contentRect
                    resize(height, width)
                })

                ob.observe(containerEle)
                return () => {
                    ob.disconnect()
                }
            }

        }
    }, [echartInsReady, getOption, reRenderOnResize, notMerge, lazyUpdate])

    useEffect(() => {
        const ins = echartsRef.current
        if (dataset !== undefined && echartInsReady && ins) {
            ins.setOption({
                dataset: dataset,
            }, {
                lazyUpdate, replaceMerge: ['dataset']
            })
        }
    }, [dataset, echartInsReady])

    return <div id={id} className={`${styles.container} ${containerCls ?? ''}`} ref={containerRef} />
}

export default AdaptiveEchartsWrap