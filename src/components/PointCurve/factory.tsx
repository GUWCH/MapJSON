import moment, { Moment } from "moment"
import { DataRecord, Info, TimeRange } from "./type"
import { graphic, DatasetComponentOption } from "echarts"
import React from "react"
import { renderToString } from 'react-dom/server';
import { DECIMAL, POINT_TABLE } from "@/common/constants";
import { Config } from "./Configurator";
import { isZh } from "@/common/util-scada";
import _, { isNumber } from "lodash";
import { multiply, subtract } from "@/common/utils/number";
import { DATE_CUSTOM_FORMAT, DATE_FORMAT } from "@/common/const-scada";
import { momentToLogStr } from "@/common/utils/debug";

export const shouldInfoDisplayAsBlock = (info: Info) => {
    return [POINT_TABLE.YX, POINT_TABLE.EVENT, POINT_TABLE.STATUS].includes(info.originPointInfo.tableNo)
}

const getNameFromInfo = (info: Info) => {
    if (isZh) {
        return info.originPointInfo.conf?.showTitleCn || info.nameCn || ''
    }
    return info.originPointInfo.conf?.showTitleEn || info.nameEn || ''
}

export const getDecimalFromInfo = (info?: Info): number => {
    const convert = info?.originPointInfo.conf?.convert
    const decimalFromPoint = info?.originPointInfo.decimal
    let decimal = decimalFromPoint !== undefined ?
        (isNumber(decimalFromPoint) ? decimalFromPoint : parseInt(decimalFromPoint)) : DECIMAL.COMMON
    if (convert) {
        if ('decimal' in convert) {
            decimal = convert.decimal ?? decimal
        }
    }
    return decimal
}

const getConvertedValue = (origin: number | string, info?: Info) => {
    const convert = info?.originPointInfo.conf?.convert
    const decimal = getDecimalFromInfo(info)
    let v = isNumber(origin) ? origin : parseFloat(origin)
    let coefficient = 1
    if (convert) {
        if ('coefficient' in convert) {
            coefficient = convert.coefficient || 1
        }
    }
    v = multiply(v, coefficient, decimal)
    return v
}

const getUnitFromInfo = (info: Info) => {
    const convert = info.originPointInfo.conf?.convert
    return (convert && 'unit' in convert ? convert.unit : info.originPointInfo.unit) ?? ''
}

const getCommonAxioKey = (position: string = 'left', unit: string = '') => unit + '_' + position

function* _DefaultColorGenerator(colors: string[]) {
    const randomHslColor = () => "hsl(" + 360 * Math.random() + ',' +
        (75) + '%,' +
        (65) + '%)'

    for (const color of colors) {
        yield color
    }
    while (true) {
        yield randomHslColor()
    }
    return undefined
}

type TooltipCls = {
    container: string
    time: string
    data: string
    icon: string
    name: string
    value: string
}

type ColorMap = {
    yx: Record<string, Record<number, string | undefined> | undefined> // 最终遥信颜色来源
    other: Record<string, string | undefined>
}

class ColorFactory {
    constructor(map: ColorMap) {
        this.colorMap = _.cloneDeep(map)
    }
    colorMap: ColorMap
    defaultColorGenerator = new DefaultColorGenerator()

    getBlockColor(k: string, v?: number) {
        if (v === undefined) {
            return DefaultColorGenerator.EMTPY_COLOR
        }
        if (!this.colorMap.yx[k]) {
            this.colorMap.yx[k] = {}
        }
        const records = this.colorMap.yx[k]!

        if (!records[v]) {
            records[v] = this.defaultColorGenerator.getColor(true, v)
        }
        return records[v]!
    }

    getLineColor(k: string) {
        if (!this.colorMap.other[k]) {
            this.colorMap.other[k] = this.defaultColorGenerator.getColor()
        }

        return this.colorMap.other[k]!
    }
}

class DefaultColorGenerator {
    constructor() {
        const colors = [
            '#00DBFF',
            this.color_yx_0,
            '#8E85FF',
            '#FFB500',
            this.color_yx_1,
            '#BCBED1',
            '#B2E058',
            '#FF765F',
            '#00A1BC',
            '#22BC7D'
        ]
        this.generator = _DefaultColorGenerator(colors)
    }

    static EMTPY_COLOR = '#474747'

    private color_yx_0 = '#58F5C0'
    private color_yx_1 = '#F50A22'
    private generator: Generator<string, undefined>

    getColor(displayAsBlock?: boolean, value?: number) {
        if (displayAsBlock) {
            switch (value) {
                case 0: return this.color_yx_0
                case 1: return this.color_yx_1
                default: {
                    let c = this.generator.next()
                    while (c.value !== undefined && [this.color_yx_0, this.color_yx_1].includes(c.value)) {
                        c = this.generator.next()
                    }
                    return c.value
                }
            }
        }
        return this.generator.next().value
    }
}

export const CONSTANTS = {
    yxAxisKey: '_YX',
    otherGridIndex: 0,
    YXGridIndex: 1,
    gridGap: 35,
    toolboxHeight: 40,
    dataIndex: {
        time: 0,
        value: 1,
        infoKey: 2,
        name: 3,
        valueName: 4,
        startTime: 5,
        endTime: 6
    }
}

class SeriesManager {
    constructor(colorFactory: ColorFactory) {
        this.colorFactory = colorFactory
    }

    series: any[] = []
    legendData: any[] = []
    colorFactory: ColorFactory

    clear = () => {
        this.series = []
        this.legendData = []
    }

    addSerie = (
        info: Info,
        yAxisMap: Record<string, number | undefined>,
        xAxisInxMapByRangeKey: Record<string, number | undefined>,
        datasetIndexMap: Record<string, number>
    ) => {
        const displayAsBlock = shouldInfoDisplayAsBlock(info)
        const axisKey = displayAsBlock ?
            CONSTANTS.yxAxisKey :
            getCommonAxioKey(info.originPointInfo.conf?.axis?.position, getUnitFromInfo(info))
        const yAxisIndex = displayAsBlock ? yAxisMap[axisKey] :
            (info.originPointInfo.conf?.axis?.axisType === 'special' ? yAxisMap[info.key] : yAxisMap[axisKey])

        if (yAxisIndex === undefined) {
            console.warn('cannot find yAxis for info', info, axisKey, yAxisMap)
            return
        }

        if (displayAsBlock) {
            this.series.push({
                yAxisIndex: yAxisMap[axisKey] ?? 0,
                xAxisIndex: xAxisInxMapByRangeKey[info.relatedTimeKey] ?? 0,
                name: getNameFromInfo(info),
                type: 'custom',
                datasetIndex: datasetIndexMap[info.key],
                infoKey: info.key,
                animation: false,
                encode: { x: CONSTANTS.dataIndex.time, y: CONSTANTS.dataIndex.name },
                renderItem: (params, api) => {
                    const name = api.value(CONSTANTS.dataIndex.name)
                    const startTime = api.value(CONSTANTS.dataIndex.startTime)
                    const endTime = api.value(CONSTANTS.dataIndex.endTime)
                    const yxValue = api.value(CONSTANTS.dataIndex.value)
                    const infoKey = api.value(CONSTANTS.dataIndex.infoKey)

                    const start = api.coord([startTime, name]);
                    const end = api.coord([endTime, name]);
                    const height = 10;
                    const rectShape = graphic.clipRectByRect(
                        {
                            x: start[0],
                            y: start[1] - height / 2,
                            width: end[0] - start[0],
                            height: height
                        },
                        {
                            x: params.coordSys.x,
                            y: params.coordSys.y,
                            width: params.coordSys.width,
                            height: params.coordSys.height
                        }
                    );
                    const color = this.colorFactory.getBlockColor(infoKey, yxValue)
                    return (
                        rectShape && {
                            type: 'rect',
                            transition: ['shape'],
                            shape: rectShape,
                            style: {
                                fill: color || DefaultColorGenerator.EMTPY_COLOR
                            },
                        }
                    );
                }
            })
        } else {
            const color = this.colorFactory.getLineColor(info.key)
            this.series.push({
                yAxisIndex: (
                    info.originPointInfo.conf?.axis?.axisType === 'special' ?
                        yAxisMap[info.key] :
                        yAxisMap[axisKey]
                ) ?? 0,
                xAxisIndex: xAxisInxMapByRangeKey[info.relatedTimeKey] ?? 0,
                name: getNameFromInfo(info),
                type: 'line',
                datasetIndex: datasetIndexMap[info.key],
                infoKey: info.key,
                itemStyle: {
                    opacity: 0,
                    color
                },
                lineStyle: {
                    color
                },
                encode: { x: CONSTANTS.dataIndex.time, y: CONSTANTS.dataIndex.value }
            })
            this.legendData.push({
                name: getNameFromInfo(info),
                icon: 'rect',
                itemStyle: {
                    color: color,
                    opacity: 1
                },
                textStyle: {
                    color: '#537C94'
                }
            })
        }

    }
}


type OtherChartData = {
    time: string
    value: string | number
    infoKey: string
    name: string
}

type YXChartData = {
    startTime: string
    endTime: string
    value: string | number
    infoKey: string
    name: string
    valueName: string
}
class DataManager {
    constructor(mappers: Mappers) {
        this.mappers = mappers
        Object.entries(this.mappers.infoMapByInfoKey).forEach(([key, info]) => {
            const l = this.dataset.push({
                sourceHeader: false,
                source: []
            })
            // todo 根据官方的例子，其实可以直接使用datasetKey做关联，但文档上没写
            this.datasetIndexMap[key] = l - 1
        })
    }
    private mappers: Mappers

    datasetIndexMap: Record<string, number> = {}
    dataset: DatasetComponentOption[] = []

    getSourceByInfoKey = (k: string) => {
        const inx = this.datasetIndexMap[k]
        if (inx !== undefined) {
            return this.dataset[inx].source as Array<any> ?? []
        }
        return []
    }

    private _clearData = () => {
        this.dataset = this.dataset.map(oldSet => {
            return {
                ...oldSet,
                source: []
            }
        })
    }

    setRecords = (records: DataRecord[]) => {
        this._clearData()
        const yxRecordMap: Record<string, DataRecord[]> = {}
        records.forEach((originR, i, arr) => {
            const info = this.mappers.infoMapByInfoKey[originR.infoKey]

            if (info === undefined) {
                console.warn('record donnot have matched info', originR)
                return
            }
            if (info.originPointInfo.conf?.isAccumulate) {
                const pre = arr[i - 1]
                if (!pre) return
                const curV = getConvertedValue(originR.value, info)
                const preV = getConvertedValue(pre.value, info)
                this.addData({
                    ...originR, name: getNameFromInfo(info),
                    value: subtract(curV, preV, getDecimalFromInfo(info))
                })
            } else if (!shouldInfoDisplayAsBlock(info)) {
                this.addData({ ...originR, name: getNameFromInfo(info), value: getConvertedValue(originR.value, info) })
            } else {
                const arr = yxRecordMap[originR.infoKey] ?? []
                yxRecordMap[originR.infoKey] = arr.concat(originR)
            }
        })
        Object.entries(yxRecordMap).forEach(([k, arr]) => {
            arr.forEach((r, i, arr) => {
                const info = this.mappers.infoMapByInfoKey[r.infoKey]
                const timeRange = this.mappers.rangeMapByInfoKey[r.infoKey]
                const nextR = arr[i + 1]

                if (!info) {
                    return
                }

                const valueConst = info.originPointInfo.constNameList?.find(i => i.value == r.value)
                const valueName = (isZh ? valueConst?.name : valueConst?.name_en) ?? ''

                const commonProps = {
                    name: getNameFromInfo(info),
                    valueName: valueName,
                    infoKey: r.infoKey,
                    startTime: moment(r.time).format('YYYY-MM-DD HH:mm:ss'),
                    value: r.value,
                }

                if (info.originPointInfo.tableNo === POINT_TABLE.EVENT) {
                    const et = r.endTime
                    if (!et) {
                        console.error('event record don\'t have end time')
                        return
                    }
                    this.addData({
                        ...commonProps,
                        endTime: moment(et).format('YYYY-MM-DD HH:mm:ss'),
                    })
                } else {
                    if (!nextR && timeRange) {
                        this.addData({
                            ...commonProps,
                            endTime: timeRange.et.format('YYYY-MM-DD HH:mm:ss'),
                        })
                        return
                    }

                    const nextDateTime = moment(nextR.time)
                    this.addData({
                        ...commonProps,
                        endTime: nextDateTime.format('YYYY-MM-DD HH:mm:ss'),
                    })
                }
            })
        })
    }

    private addData = (d: OtherChartData | YXChartData) => {
        const { infoKey, value, name } = d
        const currentSet = this.dataset[this.datasetIndexMap[infoKey]]
        const data: (string | number)[] = []
        data[CONSTANTS.dataIndex.time] = 'time' in d ? d.time : ''
        data[CONSTANTS.dataIndex.value] = value
        data[CONSTANTS.dataIndex.infoKey] = infoKey
        data[CONSTANTS.dataIndex.name] = name
        data[CONSTANTS.dataIndex.valueName] = 'valueName' in d ? d.valueName : ''
        data[CONSTANTS.dataIndex.startTime] = 'startTime' in d ? d.startTime : ''
        data[CONSTANTS.dataIndex.endTime] = 'endTime' in d ? d.endTime : '';
        (currentSet.source as Array<any>).push(data)
    }
}

class AxisManager {
    constructor({
        tooltipCls, infos, ranges, zoomBasedRange, axisGap, commonAxisCfg, hasOther, hasYX,
        otherGridHeight, yxGridHeight, legendHeight, sliderBarHeight, totalHeight, mappers
    }: {
        tooltipCls: TooltipCls
        infos: Info[]
        axisGap: number
        yxGridHeight: number
        otherGridHeight: number
        legendHeight: number
        sliderBarHeight: number
        totalHeight: number
        ranges: TimeRange[]
        zoomBasedRange: TimeRange
        commonAxisCfg?: Config['common']
        mappers: Mappers,
        hasYX: boolean
        hasOther: boolean
    }) {
        this.tooltipCls = tooltipCls
        this.infos = infos
        this.axisGap = axisGap
        this.yxGridHeight = yxGridHeight
        this.otherGridHeight = otherGridHeight
        this.legendHeight = legendHeight
        this.sliderBarHeight = sliderBarHeight
        this.commonAxisCfg = commonAxisCfg
        this.totalHeight = totalHeight
        this.ranges = ranges
        this.zoomBasedRange = zoomBasedRange
        this.mappers = mappers
        this.hasOther = hasOther
        this.hasYX = hasYX
    }

    private infos: Info[]
    private mappers: Mappers
    private tooltipCls: TooltipCls
    private ranges: TimeRange[]
    private zoomBasedRange: TimeRange
    totalHeight: number
    yxGridHeight: number
    otherGridHeight: number
    legendHeight: number
    sliderBarHeight: number
    axisGap: number
    hasYX: boolean = false
    hasOther: boolean = false
    commonAxisCfg?: Config['common'] = undefined

    private generateGrid = (leftAxisCount: number, rightAxisCount: number) => {
        const grid: any[] = [undefined, undefined]

        const leftOffset = Math.max(leftAxisCount, 1) * this.axisGap + 60
        const rightOffset = Math.max(rightAxisCount, 1) * this.axisGap + 60
        const commonProps = {
            left: leftOffset,
            right: rightOffset
        }

        const yxTooltipProps = {
            tooltip: {
                trigger: 'item',
                appendToBody: true,
                formatter: (params) => {
                    const yxData = params.data
                    const info: Info = yxData && this.mappers.infoMapByInfoKey[yxData[CONSTANTS.dataIndex.infoKey]]
                    const value = yxData[CONSTANTS.dataIndex.value]
                    const st = yxData[CONSTANTS.dataIndex.startTime]
                    const et = yxData[CONSTANTS.dataIndex.endTime]
                    const color = this.mappers.colorMapByInfoKey.getBlockColor(info.key, parseInt(value))

                    return renderToString(<div className={this.tooltipCls.container}>
                        <div className={this.tooltipCls.time}>{st} ~ {et}</div>
                        <div className={this.tooltipCls.data}>
                            {info ? <div>
                                <span className={this.tooltipCls.icon} style={{
                                    background: color
                                }} />
                                <span className={this.tooltipCls.name}>{yxData[CONSTANTS.dataIndex.name]}:</span>
                                <span className={this.tooltipCls.value}>{
                                    yxData[CONSTANTS.dataIndex.valueName] || value
                                }</span>
                            </div> : <></>}
                        </div>
                    </div>)
                },
                extraCssText: 'background: #083F4D;border: none;border-radius:8px;box-shadow: 2px 4px 25px 0px rgba(0,0,0,0.6);'
            },
            axisPointer: {
                type: 'line',
            },
        }

        if (this.hasYX && this.hasOther) {
            grid[CONSTANTS.otherGridIndex] = {
                ...commonProps,
                top: CONSTANTS.toolboxHeight + this.yxGridHeight + CONSTANTS.gridGap,
                height: this.otherGridHeight,

            }
            grid[CONSTANTS.YXGridIndex] = {
                ...commonProps,
                ...yxTooltipProps,
                height: this.yxGridHeight,
                top: CONSTANTS.toolboxHeight,
            }
        } else if (this.hasYX) {
            grid[CONSTANTS.YXGridIndex] = {
                ...commonProps,
                ...yxTooltipProps,
                top: CONSTANTS.toolboxHeight,
                height: this.yxGridHeight,
            }
        } else if (this.hasOther) {
            grid[CONSTANTS.otherGridIndex] = {
                ...commonProps,
                top: CONSTANTS.toolboxHeight,
                height: this.otherGridHeight
            }
        }

        return { grid, leftOffset, rightOffset }
    }

    private generateXAxis = () => {
        const xAxis: any[] = []
        const xAxisInxMapByRangeKey: Record<string, number | undefined> = {}

        const formatArr = DATE_FORMAT.DATE_TIME.split(' ')
        const formatter = formatArr[0].replace('yyyy', '{yyyy}').replace('MM', '{MM}').replace('dd', '{dd}')
            + '\n' + formatArr[1].replace('HH', '{HH}').replace('hh', '{hh}').replace('mm', '{mm}').replace('ss', '{ss}')

        let alreadyHasYXAxis = false
        let alreadyHasOtherAxis = false
        this.ranges.forEach((v, i) => {
            const commonProps = {
                type: 'time',
                position: 'bottom',
                min: v.st?.toDate()?.getTime() - 1000, // 扩宽边界以展示完全的数据
                max: v.et?.toDate()?.getTime() + 1000,
                axisLabel: {
                    formatter: formatter,
                    hideOverlap: true
                },
            }
            const info = this.mappers.infoMapByRangeKey[v.key]?.[0]
            if (info) {
                if (shouldInfoDisplayAsBlock(info)) {
                    xAxisInxMapByRangeKey[v.key] = xAxis.push({
                        ...commonProps,
                        show: !alreadyHasYXAxis && !this.hasOther,
                        gridIndex: CONSTANTS.YXGridIndex,
                    }) - 1
                    alreadyHasYXAxis = true
                } else {
                    xAxisInxMapByRangeKey[v.key] = xAxis.push({
                        ...commonProps,
                        show: !alreadyHasOtherAxis,
                        gridIndex: CONSTANTS.otherGridIndex,
                    }) - 1
                    alreadyHasOtherAxis = true
                }
            }
        })

        // 需保证zoom轴为最后一个，否则影响zoom bar绑定轴
        xAxis.push({
            show: false,
            type: 'time',
            min: this.zoomBasedRange.st.toDate().getTime() - 1000, // 扩宽边界以展示完全的数据
            max: this.zoomBasedRange.et.toDate()?.getTime() + 1000,
            gridIndex: this.hasOther ? CONSTANTS.otherGridIndex : CONSTANTS.YXGridIndex,
            axisLabel: {
                formatter: formatter,
                hideOverlap: true
            },
        })

        return { xAxis, xAxisInxMapByRangeKey }
    }

    private generateYAxisAndOtherInfo = () => {
        let leftAxisCount = 0
        let rightAxisCount = 0
        const yAxis: any[] = []

        /**
         * 遥信值使用的y轴key为 {@link yxAxisKey}
         * 公用y轴key为 {@link getCommonAxioKey}
         * 独立y轴key为 info.alias
         */
        const yAxisMap: Record<string, number> = {}

        this.infos.forEach(info => {
            if (shouldInfoDisplayAsBlock(info)) {
                if (yAxisMap[CONSTANTS.yxAxisKey] === undefined) {
                    const index = yAxis.push({
                        position: 'left',
                        splitLine: {
                            show: false
                        },
                        type: 'category',
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            inside: true,
                            color: '#6A8CA3',
                            lineHeight: 25,
                            verticalAlign: 'bottom'
                        },
                        gridIndex: CONSTANTS.YXGridIndex,
                        data: []
                    }) - 1
                    yAxisMap[CONSTANTS.yxAxisKey] = index
                }
                yAxis[yAxisMap[CONSTANTS.yxAxisKey]].data.push(getNameFromInfo(info))
                return
            }

            const position = info.originPointInfo.conf?.axis?.position ?? 'left'
            const isStandaloneAxis = info.originPointInfo.conf?.axis?.axisType === 'special'
            const unit = getUnitFromInfo(info)
            const commonAxisKey = getCommonAxioKey(position, unit)
            if (
                (isStandaloneAxis && yAxisMap[info.key] !== undefined) ||
                (!isStandaloneAxis && yAxisMap[commonAxisKey] !== undefined)
            ) {
                const commonAxisInx = yAxisMap[commonAxisKey]
                const axis = commonAxisInx !== undefined ? yAxis[commonAxisInx] : undefined

                if (axis && axis.axisLine) {
                    delete axis.axisLine.lineStyle
                }
                return
            }

            const color = this.mappers.colorMapByInfoKey.getLineColor(info.key)
            const max = isStandaloneAxis ?
                info.originPointInfo.conf?.axis?.max :
                this.commonAxisCfg?.[position as 'left' | 'right']?.max
            const min = isStandaloneAxis ?
                info.originPointInfo.conf?.axis?.min :
                this.commonAxisCfg?.[position as 'left' | 'right']?.min
            const newAxis = {
                name: unit,
                max, min,
                position: position,
                type: 'value' as 'value',
                offset: position === 'left' ?
                    leftAxisCount++ * this.axisGap :
                    rightAxisCount++ * this.axisGap,
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: true,
                    onZero: false,
                    lineStyle: Object.assign({}, color ? { color } : {})
                },
                gridIndex: CONSTANTS.otherGridIndex
            }
            const index = yAxis.push(newAxis) - 1
            yAxisMap[isStandaloneAxis ? info.key : commonAxisKey] = index
        })

        return {
            yAxis, yAxisMap, leftAxisCount, rightAxisCount
        }
    }

    getAxisAndGrid = () => {
        const { yAxis, yAxisMap, leftAxisCount, rightAxisCount } = this.generateYAxisAndOtherInfo()
        const { xAxis, xAxisInxMapByRangeKey } = this.generateXAxis()
        const { grid, leftOffset, rightOffset } = this.generateGrid(leftAxisCount, rightAxisCount)
        return {
            grid, leftOffset, rightOffset, xAxis, xAxisInxMapByRangeKey, yAxis, yAxisMap
        }
    }
}

export const getColorMap = (infos: Info[]): ColorMap => {
    const colorMap: ColorMap = {
        yx: {},
        other: {}
    }
    infos.forEach(info => {
        if (shouldInfoDisplayAsBlock(info)) {
            const map: Record<number, string | undefined> = {}
            info.originPointInfo.constNameList?.forEach(item => {
                const colorInCfg = info.originPointInfo.conf?.valueMap?.[item.value]?.color?.[0]
                map[item.value] = colorInCfg
            })
            colorMap.yx[info.key] = map
        } else {
            const colorInCfg = info.originPointInfo.conf?.lineChartColor
            colorMap.other[info.key] = colorInCfg
        }
    })
    return colorMap
}

type Mappers = {
    colorMapByInfoKey: ColorFactory
    infoMapByInfoKey: Record<string, Info | undefined>
    infoMapByRangeKey: Record<string, Info[] | undefined>
    rangeMapByInfoKey: Record<string, (TimeRange & { originKey: string }) | undefined>
    rangeMapByRangeKey: Record<string, (TimeRange & { originKey: string }) | undefined>
}
export class OptionFactory {
    constructor({ originInfos, colorMap, records, datazoom, tooltipCls, height, zoomBasedRange, ranges, opt }: {
        originInfos: Info[]
        colorMap: ColorMap
        records: DataRecord[]
        datazoom?: {
            start: number
            end: number
        }
        height: {
            totalHeight: number,
            yxGridHeight: number,
            otherGridHeight: number,
            legendHeight: number,
            sliderBarHeight: number
        }
        tooltipCls: TooltipCls
        zoomBasedRange: TimeRange
        ranges: TimeRange[]
        opt?: {
            commonAxisCfg?: Config['common']
            axisGap?: number
        }
    }) {
        this.datazoom = datazoom
        this.mappers = {
            colorMapByInfoKey: new ColorFactory(colorMap),
            infoMapByInfoKey: {},
            infoMapByRangeKey: {},
            rangeMapByInfoKey: {},
            rangeMapByRangeKey: {}
        }

        const rangeKeyPostFix = {
            yx: '_YX',
            other: '_Other'
        }
        const allRanges: (TimeRange & { originKey: string })[] = []
        ranges.forEach(r => {
            const yxRange = {
                ...r,
                originKey: r.key,
                key: r.key + rangeKeyPostFix.yx
            }
            const otherRange = {
                ...r,
                originKey: r.key,
                key: r.key + rangeKeyPostFix.other
            }
            this.mappers.rangeMapByRangeKey[r.key + rangeKeyPostFix.yx] = yxRange
            this.mappers.rangeMapByRangeKey[r.key + rangeKeyPostFix.other] = otherRange
            allRanges.push(yxRange, otherRange)
        })
        let hasOther = false
        let hasYX = false
        let convertedInfos: Info[] = []
        originInfos.forEach(originInfo => {
            const relatedTimeKey = shouldInfoDisplayAsBlock(originInfo) ?
                originInfo.relatedTimeKey + rangeKeyPostFix.yx :
                originInfo.relatedTimeKey + rangeKeyPostFix.other
            const info = {
                ...originInfo,
                relatedTimeKey
            }
            convertedInfos.push(info)
            this.mappers.infoMapByInfoKey[info.key] = info
            this.mappers.infoMapByRangeKey[info.relatedTimeKey] = (this.mappers.infoMapByRangeKey[info.relatedTimeKey] ?? []).concat(info)
            this.mappers.rangeMapByInfoKey[info.key] = this.mappers.rangeMapByRangeKey[info.relatedTimeKey]
            if (shouldInfoDisplayAsBlock(info)) {
                hasYX = true
            } else {
                hasOther = true
            }
        })
        this.infos = convertedInfos

        this.axisManager = new AxisManager({
            tooltipCls,
            infos: this.infos,
            hasOther, hasYX,
            yxGridHeight: height.yxGridHeight,
            otherGridHeight: height.otherGridHeight,
            legendHeight: height.legendHeight,
            sliderBarHeight: height.sliderBarHeight,
            totalHeight: height.totalHeight,
            axisGap: opt?.axisGap ?? 60,
            commonAxisCfg: opt?.commonAxisCfg,
            mappers: this.mappers,
            zoomBasedRange: zoomBasedRange,
            ranges: allRanges
        })
        this.dataManager = new DataManager(this.mappers)
        this.dataManager.setRecords(records)
        this.seriesManager = new SeriesManager(this.mappers.colorMapByInfoKey)
        this.tooltipCls = tooltipCls
    }

    private mappers: Mappers
    private axisManager: AxisManager
    private dataManager: DataManager
    private seriesManager: SeriesManager
    private infos: Info[]
    private tooltipCls: {
        container: string
        time: string
        data: string
        icon: string
        name: string
        value: string
    }
    private datazoom?: {
        start: number
        end: number
    }

    getTooltipOptions = () => {
        const yxSeriesGroupByOriginRangeKey = _.groupBy(this.seriesManager.series.filter(s => {
            const k = s.infoKey
            const info = this.mappers.infoMapByInfoKey[k]
            return info && shouldInfoDisplayAsBlock(info)
        }), (serie) => {
            const infoKey = serie.infoKey
            const range = this.mappers.rangeMapByInfoKey[infoKey]
            return range?.originKey ?? ''
        })

        return {
            tooltip: {
                appendToBody: true,
                trigger: 'axis',
                axisPointer: {
                    axis: 'x',
                },
                formatter: (params) => {
                    const series = Array.isArray(params) ? params : [params]

                    const seriesGroupOriginRangeKey = _.groupBy(series, (serie) => {
                        const infoKey = serie.data[CONSTANTS.dataIndex.infoKey]
                        const range = this.mappers.rangeMapByInfoKey[infoKey]
                        return range?.originKey ?? ''
                    })

                    const content = Object.entries(seriesGroupOriginRangeKey).map(([originRangeKey, otherSeries]) => {
                        const time = otherSeries[0]?.data[CONSTANTS.dataIndex.time] ?? ''
                        const mTime = time ? moment(time) : undefined
                        const yxSeries = yxSeriesGroupByOriginRangeKey[originRangeKey] ?? []
                        return <>
                            <div className={this.tooltipCls.time}>{
                                mTime?.format(DATE_CUSTOM_FORMAT.DATE_TIME)
                            }</div>
                            <div className={this.tooltipCls.data}>
                                {otherSeries.map(s => {
                                    const info = this.mappers.infoMapByInfoKey[s.data[CONSTANTS.dataIndex.infoKey]]
                                    if (!info) return <></>
                                    const value = s.data[CONSTANTS.dataIndex.value]
                                    return <div>
                                        <span className={this.tooltipCls.icon} style={{
                                            background: s.color,
                                            borderRadius: '100%'
                                        }} />
                                        <span className={this.tooltipCls.name}>{s.data[CONSTANTS.dataIndex.name]}:</span>
                                        <span className={this.tooltipCls.value}>{
                                            (value + (getUnitFromInfo(info) ?? ''))
                                        }</span>
                                    </div>
                                })}
                                {yxSeries.map(s => {
                                    const source = this.dataManager.getSourceByInfoKey(s.infoKey)
                                    const yxData = source.find(d => {
                                        const st = moment(d[CONSTANTS.dataIndex.startTime])
                                        const et = moment(d[CONSTANTS.dataIndex.endTime])
                                        return mTime && st.isSameOrBefore(mTime, 'minute') && et.isAfter(mTime)
                                    })
                                    const info = yxData && this.mappers.infoMapByInfoKey[yxData[CONSTANTS.dataIndex.infoKey]]
                                    if (!info) return <></>

                                    const value = yxData[CONSTANTS.dataIndex.value]
                                    return <div>
                                        <span className={this.tooltipCls.icon} style={{
                                            background: this.mappers.colorMapByInfoKey.getBlockColor(info.key, value)
                                        }} />
                                        <span className={this.tooltipCls.name}>{yxData[CONSTANTS.dataIndex.name]}:</span>
                                        <span className={this.tooltipCls.value}>{
                                            yxData[CONSTANTS.dataIndex.valueName] || value
                                        }</span>
                                    </div>
                                })}
                            </div>
                        </>
                    })


                    return renderToString(<div className={this.tooltipCls.container}>
                        {content}
                    </div>)
                },
                extraCssText: 'background: #083F4D;border: none;border-radius:8px;box-shadow: 2px 4px 25px 0px rgba(0,0,0,0.6);'
            },
            axisPointer: {
                type: 'line',
                link: [{
                    xAxisIndex: 'all'
                }],
            },
        }
    }

    generateOption() {
        const { yAxis, yAxisMap, xAxis, xAxisInxMapByRangeKey, grid, leftOffset, rightOffset } = this.axisManager.getAxisAndGrid()
        const { otherGridHeight, yxGridHeight, legendHeight, sliderBarHeight } = this.axisManager
        this.seriesManager.clear()
        this.infos.forEach(info => {
            this.seriesManager.addSerie(info, yAxisMap, xAxisInxMapByRangeKey, this.dataManager.datasetIndexMap)
        })

        return {
            ...this.getTooltipOptions(),
            animation: false,
            dataset: this.dataManager.dataset,
            toolbox: {
                show: true,
                top: 0,
                right: 40,
                itemSize: CONSTANTS.toolboxHeight - 20,
            },
            dataZoom: [{
                start: this.datazoom?.start,
                end: this.datazoom?.end,
                show: true,
                type: 'slider',
                xAxisIndex: [xAxis.length - 1],
                realtime: false,
                height: sliderBarHeight,
                top: CONSTANTS.toolboxHeight
                    + (yxGridHeight > 0 ? (yxGridHeight + CONSTANTS.gridGap) : 0)
                    + (otherGridHeight > 0 ? (otherGridHeight + CONSTANTS.gridGap) : 0),
                brushSelect: false,
                handleSize: "100%",
                handleIcon: 'image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjguMDAwMDAwMDAwMDAwMDA0IiBoZWlnaHQ9IjI4LjAwMDAwMDAwMDAwMDAwNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxnIGlkPSLotovlir/liIbmnpAt5aKe5Yqg5Ly457yp5p2hLTIwMjMwODA0IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICA8ZyBpZD0i5Ly457yp5p2h6aKc6Imy6K+05piOIj4KICAgIDxsaW5lIHgxPSIxMy45NzQzNiIgeTE9IjAiIHgyPSIxMy45NzQzNiIgeTI9IjI4IiBpZD0i6Lev5b6E5aSH5Lu9IiBzdHJva2U9IiMwMENDRkYiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS03IiBmaWxsPSIjMDBDQ0ZGIiB4PSI4Ljk3NDM2IiB5PSI3IiB3aWR0aD0iMTAiIGhlaWdodD0iMTQiLz4KICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtNyIgZmlsbD0iIzFGM0I0QiIgeD0iMTEuNDc0MzYiIHk9IjExIiB3aWR0aD0iNSIgaGVpZ2h0PSIxIi8+CiAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTflpIfku70iIGZpbGw9IiMxRjNCNEIiIHg9IjExLjQ3NDM2IiB5PSIxNiIgd2lkdGg9IjUiIGhlaWdodD0iMSIvPgogICA8L2c+CiAgPC9nPgogPC9nPgo8L3N2Zz4=',
                dataBackground: {
                    areaStyle: {
                        opacity: 0
                    },
                    lineStyle: {
                        opacity: 0
                    }
                },
                showDataShadow: false,
                fillerColor: "#005166",
                borderColor: '#4d6166',
                labelFormatter: (v) => {
                    const m = moment(v)
                    const formatArr = DATE_CUSTOM_FORMAT.DATE_TIME.split(' ')
                    return m.format(formatArr[0]) + '\n' + m.format(formatArr[1])
                }
            }],
            legend: {
                left: leftOffset,
                right: rightOffset,
                top: CONSTANTS.toolboxHeight
                    + (yxGridHeight > 0 ? yxGridHeight + CONSTANTS.gridGap : 0)
                    + (otherGridHeight > 0 ? otherGridHeight + CONSTANTS.gridGap : 0)
                    + sliderBarHeight,
                data: this.seriesManager.legendData
            },
            xAxis: xAxis,
            yAxis: yAxis,
            grid: grid,
            series: this.seriesManager.series,
        };
    }

    generateDataset(records: DataRecord[]) {
        this.dataManager.setRecords(records)
        return this.dataManager.dataset
    }
}