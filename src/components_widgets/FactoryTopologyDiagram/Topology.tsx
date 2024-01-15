import { TimerInterval } from '@/common/const-scada'
import { DOMAIN_ENUM, getPointKey as getPointDynKey } from '@/common/constants'
import msg from '@/common/lang'
import { combineToFullAlias, parseDynKey, PointEvt } from '@/common/util-scada'
import { TopologyAssetType } from '@/common/utils'
import { Button, Tabs } from 'antd'
import { RUN_STATE } from 'DrawLib/constant'
import padGraph, { GRAPH_ELE_MARK, GRAPH_TYPE as PAD_GRAPH_TYPE, isRMU, PadGraphOptions, PadGraphState } from 'DrawLib/groups/padGraph'
import { getFillRect } from 'DrawLib/layouts/placeholder'
import { RowAndColLayoutBuilder, RowAndColLayoutItem } from 'DrawLib/layouts/RowAndCollLayout'
import { ColorMap, ElementInfo, ILayoutEleContent, Point, ShapeElement } from 'DrawLib/model'
import barrow, { BarrowState } from 'DrawLib/shapes/barrow'
import fieldCard, { FieldProps } from 'DrawLib/shapes/domEles/FieldCard'
import { BarrowTip, PadTip, SubTip } from 'DrawLib/shapes/domEles/TooltipContent'
import subSys, { SubSysOptions, SubSysState, SubSysType } from 'DrawLib/shapes/subSys'
import { point, wire } from 'DrawLib/utils'
import Konva from "konva"
import KonvaWrap, { KonvaDrawFunc } from 'KonvaWrap'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecursiveTimeoutEffect } from 'ReactHooks'
import { useWidgetContext } from '../common/hooks'
import { getPADDefaultAliasMap, PADPointAliasMap, usePADDiagrams } from '../PADWiringDiagram'
import { convertSubTypeToGraphType } from '../PADWiringDiagram/utils'
import { FactoryTopologyCfg } from './Configurator'
import { checkDevicePoint, getDynData, getTopologyStracture, rename, TopologyAsset } from './dao'
import styles from './Topology.module.scss'
import { dynAndPointToField, dynAndPointToTips, rawValueToRunState } from './utils'
import { combinePointKey } from '@/common/utils/model'
const isZh = msg.isZh

const i18n = isZh ? {
    stopPlay: '停止滚动',
    autoPlay: '自动滚动',
} : {
    stopPlay: 'Stop Auto Change',
    autoPlay: 'Auto Change',
}

const getSubTypeByDomain = (domain: DOMAIN_ENUM) => {
    switch (domain) {
        case DOMAIN_ENUM.SOLAR: return SubSysType.matric
        case DOMAIN_ENUM.STORAGE: return SubSysType.sys
        default: return SubSysType.turbine
    }
}

const getFieldDTO = (alias: string, title: string, fields: TPointWithCfg[]): {
    info: {
        title: string
        pMap: { [key: string]: TPointWithCfg }
    },
    req: IDynData[]
} => {
    const req: IDynData[] = []
    const pointMap: { [key: string]: TPointWithCfg } = {}
    fields.forEach(f => {
        const key = getPointDynKey(f, alias);
        const convert = f.conf?.convert
        let decimal = 2
        if (convert && 'decimal' in convert) {
            decimal = convert.decimal
        }
        req.push({
            id: '',
            key,
            decimal
        })
        pointMap[key] = f
    })
    return {
        info: {
            title,
            pMap: pointMap
        }, req
    }
}

const getRMUArrowEle = (inP: Point, arrowWidth: number, arrowHeight: number) => {
    const startX = inP.x - arrowWidth / 2
    return new Konva.Line({
        points: [
            startX, inP.y,
            startX + arrowWidth, inP.y,
            startX + arrowWidth / 2, inP.y + arrowHeight],
        fill: '#FFBB00',
        closed: true
    })
}

const getColorMapFromCfg = (valueMap: TPointConfiguration['valueMap']): ColorMap => {
    let map: ColorMap = {}
    if (valueMap) {
        map = Object.entries(valueMap).reduce((p, c) => {
            const [rawValue, convert] = c
            return {
                ...p,
                [rawValue]: convert.color?.[0]
            }
        }, {} as ColorMap)
    }
    return map
}

const getAssetFieldCardKey = (alias: string) => 'fields_' + alias

type BarrowProps = {
    alias: string
    name: string
    runStatusPoint?: TPointWithCfg,
    fields: TPointWithCfg[]
}
type PadProps = {
    name: string
    alias: string
    type: PAD_GRAPH_TYPE
    fields: TPointWithCfg[]
}
type SubProps = {
    name: string
    alias: string
    type: SubSysType
    runStatusPoint?: TPointWithCfg,
    fields: TPointWithCfg[]
}
type DiagramProps = {
    isRMU: boolean // 是否为环网图
    domain: DOMAIN_ENUM
    line: {
        alias: string
        barrow?: BarrowProps[]
        sys: {
            pad?: PadProps,
            sub?: SubProps
        }[]
    }
    padAliasMap: PADPointAliasMap
}

type DynReqParams = {
    fieldReq: IDynData[]
    fieldMap: { [key: string]: { title: string, pMap: { [key: string]: TPointWithCfg } } }
    barrowFieldMap: { [key: string]: { title: string, pMap: { [key: string]: TPointWithCfg } } }
    barrowRunStateReq: IDynData[]
    subRunStateReqMap: { [key: string]: IDynData }
    padAlias: string[]
}

/**
 * 解析动态字请求参数
 */
const useDynReqParams = (line: DiagramProps['line'], isDemo: boolean) => {
    const [dynParams, setDynParams] = useState<DynReqParams>({
        fieldReq: [],
        fieldMap: {},
        barrowFieldMap: {},
        barrowRunStateReq: [],
        subRunStateReqMap: {},
        padAlias: []
    })

    useEffect(() => {
        if (isDemo) {
            return
        }

        const params: typeof dynParams = {
            fieldReq: [],
            fieldMap: {},
            barrowFieldMap: {},
            barrowRunStateReq: [],
            subRunStateReqMap: {},
            padAlias: []
        }

        line.barrow?.forEach(b => {
            const barrowStatusPoint = b?.runStatusPoint
            if (barrowStatusPoint) {
                const dynKey = getPointDynKey(barrowStatusPoint, b.alias);
                const { req, info } = getFieldDTO(b.alias, b.name, b.fields)

                params.barrowRunStateReq.push({
                    id: '',
                    key: dynKey,
                    decimal: 0
                })
                params.fieldReq.push(...req)
                params.barrowFieldMap[barrowStatusPoint.alias] = info
            }
        })

        line.sys.forEach((s) => {
            if (s.pad) {
                const { req, info } = getFieldDTO(s.pad.alias, s.pad.name, s.pad.fields)
                params.fieldReq.push(...req)
                params.fieldMap[s.pad.alias] = info
                params.padAlias.push(s.pad.alias)
            }
            if (s.sub) {
                const { req, info } = getFieldDTO(s.sub.alias, s.sub.name, s.sub.fields)
                params.fieldReq.push(...req)
                params.fieldMap[s.sub.alias] = info

                const subStatusPoint = s.sub.runStatusPoint
                if (subStatusPoint?.alias) {
                    params.subRunStateReqMap[s.sub.alias] = {
                        id: '',
                        key: getPointDynKey(subStatusPoint, s.sub.alias),
                        decimal: 0
                    }
                }
            }
        })
        setDynParams(params)
    }, [line, isDemo])

    return dynParams
}

/**
 * 定时请求动态字数据
 */
const useDataMapSchedule = (dynParams: DynReqParams, domain: DOMAIN_ENUM, updater: (d: { [key: string]: any }) => void) => {
    const [refreshDataTrigger, setRefreshTrigger] = useState(0)
    const dynReqTimeRef = useRef(Date.now())

    useRecursiveTimeoutEffect(() =>
        [
            async () => {
                const timestamp = Date.now()
                dynReqTimeRef.current = timestamp
                const {
                    barrowRunStateReq,
                    subRunStateReqMap,
                    fieldReq,
                } = dynParams

                const dynReqArr = [...barrowRunStateReq, ...Object.entries(subRunStateReqMap).map(([k, v]) => v), ...fieldReq]
                if (dynReqArr.length > 0 && timestamp === dynReqTimeRef.current) {
                    const data = await getDynData(dynReqArr) ?? []
                    const map: { [key: string]: IDyn } = {}
                    data.forEach(d => {
                        map[d.key] = d
                    })
                    return {
                        dynMap: map,
                        timestamp
                    }
                }
                return {
                    dynMap: {},
                    timestamp
                }
            },
            ({
                dynMap: rawDynDataMap,
                timestamp
            }: {
                dynMap: { [key: string]: IDyn },
                timestamp: number
            }) => {
                const dataMap: { [key: string]: any } = {}
                const {
                    barrowRunStateReq,
                    subRunStateReqMap,
                    barrowFieldMap,
                    fieldMap
                } = dynParams
                barrowRunStateReq.forEach(r => {
                    const dyn = rawDynDataMap[r.key] as IDyn | undefined
                    const value = dyn?.raw_value

                    const state: BarrowState = {
                        name: dyn?.wf_name,
                        runState: dyn && dyn.status_value === 0 ? rawValueToRunState(value) : RUN_STATE.MISSING
                    }
                    dataMap[r.key] = state
                })

                Object.entries(subRunStateReqMap).forEach(([k, v]) => {
                    const dyn = rawDynDataMap[v.key] as IDyn | undefined
                    const value = dyn?.raw_value

                    dataMap[k] = (old: SubSysState) => {
                        return {
                            ...old,
                            name: old.name || dyn?.wf_name,
                            state: dyn && dyn.status_value === 0 ? value : RUN_STATE.MISSING
                        }
                    }
                })

                Object.entries(fieldMap).forEach(([alias, info]) => {
                    const data: FieldProps[] = []
                    Object.entries(info.pMap).forEach(([dynKey, pointWithConf]) => {
                        const dynD = rawDynDataMap[dynKey]
                        data.push(dynAndPointToField(dynKey, pointWithConf, dynD))
                    })
                    dataMap[getAssetFieldCardKey(alias)] = {
                        title: info.title,
                        data: data
                    }
                })

                Object.entries(barrowFieldMap).forEach(([relaPointAlias, info]) => {
                    const data: {
                        name: string
                        value: string
                        color?: string
                        unit?: string
                    }[] = []
                    Object.entries(info.pMap).forEach(([dynKey, pointWithConf]) => {
                        const dynD = rawDynDataMap[dynKey]
                        data.push(dynAndPointToTips(dynKey, pointWithConf, dynD))
                    })

                    dataMap[relaPointAlias] = {
                        title: info.title,
                        data: data
                    }
                })

                if (dynReqTimeRef.current === timestamp) {
                    updater((old: { [key: string]: any }) => {
                        return Object.assign({}, old, dataMap)
                    })
                }
            }
        ], TimerInterval as number, [dynParams, refreshDataTrigger]
    )

    const refresh = () => setRefreshTrigger(v => v + 1)

    return refresh
}

const useDiagramSize = (line: DiagramProps['line'], isRMU: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState<{
        colNum: number, rowNum: number, sizeParam: {
            rowLineOffsetY: number,
            canvasWidth: number,
            canvasHeight: number,
            rowMarginTop: number,
            rowMarginR: number,
            rowMarginL: number,
            colGap: number,
            rmuArrow: {
                height: number,
                width: number
            },
            barrow: {
                marginLeft: number,
                height: number,
                width: number
            },
            sysCard: {
                height: number,
                width: number,
                paddingRight: number
            },
            pointsInfo: {
                width: number,
                marginTop: number,
                height: {
                    pad: number,
                    sub: number
                }
            },
            pad: {
                height: number,
                width: number,
                paddingRight: number
            },
            sub: {
                width: number
                height: number
            }
        }
    }>()

    useEffect(() => {
        if (line && containerRef.current) {
            let timestamp = 0
            const ob = new ResizeObserver(([entry]) => {
                const currentTimeStamp = Date.now()
                timestamp = currentTimeStamp
                const { width: containerWidth, height: containerHeight } = entry.contentRect
                const canvasWidth = 1206
                const rowGap = 20
                const transformScale = canvasWidth / containerWidth
                /*
                    designRowGap / actualRowGap = transformScale
                    designRowHeight / actualRowHeight = transformScale
                    2 * actualRowHeight + 3 * actualRowGap = containerHeight
                =>  designRowHeight = (containerHeight * transformScale - 3 * designRowGap)/2
                => 
                */
                const rowHeight = Math.floor((containerHeight * transformScale - 3 * rowGap) / 2)

                const SIZE_CONST = (() => {
                    const barrow = {
                        marginLeft: 20,
                        nameMargin: 16,
                        width: 64,
                        height: 16
                    }

                    const sysCard = {
                        height: rowHeight,
                        paddingRight: isRMU ? 10 : 0,
                        minWidth: isRMU ? 400 : 280 // 非坐标宽度，调试出来的值
                    }

                    const pointsInfo = {
                        marginTop: sysCard.height * 0.03,
                        marginRight: 10,
                        height: {
                            pad: sysCard.height * 0.59,
                            sub: sysCard.height * 0.35
                        }
                    }

                    const pad = {
                        height: sysCard.height * 0.9 + (isRMU ? 0 : pointsInfo.marginTop),
                        paddingRight: isRMU ? 20 : 0
                    }
                    const sub = {
                        height: sysCard.height - pad.height - (isRMU ? pointsInfo.marginTop : 0)
                    }

                    const rmuArrow = {
                        width: sub.height * 8 / 25,
                        height: sub.height * 2 / 5
                    }

                    return {
                        rowMarginTop: 20,
                        rowMarginR: 20,
                        rowMarginL: 10,
                        colGap: 25,
                        rowLineOffsetY: 19,
                        rmuArrow, barrow, sysCard, pointsInfo, pad, sub
                    }
                })()

                const sysNum = line.sys.length

                // 计算行列数
                const { colNum, rowNum } = (() => {
                    /*
                            designEleWidth/actualEleWidth = canvasWidth/containerWidth
                        =>  actualEleWidth = designEleWidth * containerWidth / canvasWidth

                            actualEleWidth >= minWidth
                        =>  designEleWidth * containerWidth / canvasWidth >= minWidth
                        =>  designEleWidth >= minWidth * canvasWidth / containerWidth
                        =>  minDesignEleWidth = minWidth * canvasWidth / containerWidth

                            colNum * colWidth + (colNum - 1) * colGap + rowMarginLR = containerWidth
                        =>  colNum * (colWidth + colGap) - colGap + rowMarginLR = containerWidth
                        =>  colNum = (containerWidth + colGap - rowMarginLR) / (colWidth + colGap)
                    */
                    const maxColNum = Math.floor(
                        (canvasWidth + SIZE_CONST.colGap - SIZE_CONST.rowMarginL - SIZE_CONST.rowMarginR) /
                        (SIZE_CONST.sysCard.minWidth * canvasWidth / containerWidth + SIZE_CONST.colGap)
                    )

                    const rowNum = Math.ceil(sysNum / maxColNum)

                    return {
                        colNum: maxColNum,
                        rowNum: Math.max(rowNum, 1)
                    }
                })()

                const canvasHeight = rowNum * SIZE_CONST.sysCard.height + (rowNum + 1) * SIZE_CONST.rowMarginTop

                const sysCardWidth = (canvasWidth - (colNum - 1) * SIZE_CONST.colGap - SIZE_CONST.rowMarginL - SIZE_CONST.rowMarginR) / colNum

                window.setTimeout(() => {
                    if (timestamp === currentTimeStamp) {
                        const padWidth = (isRMU ? 0.6 : 0.4) * sysCardWidth
                        const subWidth = (isRMU ? 0.45 : 1) * padWidth
                        setSize({
                            colNum, rowNum, sizeParam: {
                                rowLineOffsetY: SIZE_CONST.rowLineOffsetY,
                                colGap: SIZE_CONST.colGap,
                                canvasHeight, canvasWidth,
                                rowMarginTop: SIZE_CONST.rowMarginTop,
                                rowMarginR: SIZE_CONST.rowMarginR,
                                rowMarginL: SIZE_CONST.rowMarginL,
                                rmuArrow: {
                                    height: SIZE_CONST.rmuArrow.height,
                                    width: SIZE_CONST.rmuArrow.width
                                },
                                barrow: {
                                    marginLeft: SIZE_CONST.barrow.marginLeft,
                                    width: SIZE_CONST.barrow.width,
                                    height: SIZE_CONST.barrow.height
                                },
                                sysCard: {
                                    height: SIZE_CONST.sysCard.height,
                                    width: sysCardWidth,
                                    paddingRight: SIZE_CONST.sysCard.paddingRight
                                },
                                pointsInfo: {
                                    marginTop: SIZE_CONST.pointsInfo.marginTop,
                                    width: sysCardWidth - SIZE_CONST.pointsInfo.marginRight - padWidth,
                                    height: {
                                        pad: SIZE_CONST.pointsInfo.height.pad,
                                        sub: SIZE_CONST.pointsInfo.height.sub
                                    }
                                },
                                pad: {
                                    height: SIZE_CONST.pad.height,
                                    width: padWidth,
                                    paddingRight: SIZE_CONST.pad.paddingRight
                                },
                                sub: {
                                    height: SIZE_CONST.sub.height,
                                    width: subWidth
                                }
                            }
                        })
                    }
                }, 1000)
            })
            ob.observe(containerRef.current)
            return () => ob.disconnect()
        }
    }, [line, isRMU])
    return { size, containerRef }
}

const Diagram = ({
    line, isRMU, padAliasMap, domain
}: DiagramProps) => {
    const navigate = useNavigate();
    const { isDemo, pageSign } = useWidgetContext()
    const padAlias = useMemo(() => line.sys.map(s => s.pad?.alias).filter(a => a) as string[], [line])
    const { data: padData, infoMap: padInfoMap, getStateProducer } = usePADDiagrams(padAlias, isDemo, padAliasMap)
    const [topologyDataMap, setTopologyDataMap] = useState<{ [key: string]: any }>({})

    const dataMap = useMemo(() => Object.assign({}, topologyDataMap, padData), [topologyDataMap, padData])
    const barrowArr = line.barrow ?? []
    const subSysArr = line.sys.map(s => s.sub).filter(o => o) as SubProps[]

    const dynParams = useDynReqParams(line, isDemo)
    const refresh = useDataMapSchedule(dynParams, domain, setTopologyDataMap)
    const { size, containerRef } = useDiagramSize(line, isRMU)

    const draw = useCallback<KonvaDrawFunc>((stage, actOpt, options) => {
        const { stateConsumerRegister, domEleRegister } = options
        const l = new Konva.Layer()
        stage.add(l)

        if (!size) return
        const { colNum, rowNum, sizeParam } = size

        const root = new RowAndColLayoutItem('col', {
            origin: point(0, 0),
            height: sizeParam.canvasHeight,
            width: sizeParam.canvasWidth,
            justifyContent: 'space-evenly',
            padding: {
                left: sizeParam.rowMarginL,
                right: sizeParam.rowMarginR
            }
        })

        const getFieldCardContent = (key: string): ILayoutEleContent<undefined, undefined> => ({
            key,
            baseProps: {
                options: {
                    stateConsumerRegister,
                    domEleRegister
                }
            },
            drawFunc: fieldCard
        })

        const getPadContent = (alias: string): ILayoutEleContent<PadGraphState, PadGraphOptions> => ({
            key: alias,
            stateProducer: getStateProducer(alias),
            baseProps: {
                options: {
                    enableEleName: true,
                    stateConsumerRegister,
                    onClick: (key, e) => {
                        PointEvt.popMenu(key, e.evt)
                    },
                }
            },
            drawFunc: padGraph
        })

        const getSubContent = (alias: string, initState: SubSysState, colorMap?: ColorMap): ILayoutEleContent<SubSysState, SubSysOptions> => ({
            key: alias,
            stateProducer: () => initState,
            baseProps: {
                options: {
                    colorMap,
                    stateConsumerRegister,
                    eventHandlers: {
                        click: (key) => {
                            let routePath;
                            switch (domain) {
                                case DOMAIN_ENUM.SOLAR:
                                    routePath = 'topo_solar';
                                    break;
                                case DOMAIN_ENUM.STORAGE:
                                    routePath = 'topo_storage';
                                    break;
                                case DOMAIN_ENUM.WIND:
                                    break;
                                default:
                                    break;
                            }
                            if (routePath) {
                                navigate(`/${routePath}/${alias}`, {
                                    // 列表处定位tab使用
                                    state: {
                                        page: pageSign,
                                        lineAlias: line.alias
                                    }
                                });
                            }
                        }
                    }
                }
            },
            drawFunc: subSys
        })

        const getBarrowEle = (alias: string, origin: Point, p?: TPointWithCfg) => {
            const runStatusKey = p ?
                getPointDynKey(p, alias) : undefined

            const barrowColorMap = getColorMapFromCfg(p?.conf?.valueMap)
            return barrow({
                start: [origin],
                rect: {
                    width: sizeParam.barrow.width,
                    height: sizeParam.barrow.height
                },
                state: { runState: RUN_STATE.MISSING },
                options: {
                    colorMap: barrowColorMap,
                    key: runStatusKey,
                    stateConsumerRegister,
                }
            })
        }

        const getLineRow = () => new RowAndColLayoutItem('row', {
            height: sizeParam.sysCard.height,
            justifyContent: 'space-between',
            name: 'line-row'
        })
        let currentRow = getLineRow()
        root.addContent(currentRow)

        const cardLackNum = (colNum * rowNum) - line.sys.length
        const sysArr: ({
            pad?: PadProps,
            sub?: SubProps
        } | undefined)[] = cardLackNum === 0 ?
                line.sys :
                [...line.sys, ...Array.from({ length: cardLackNum }, (_, i) => undefined)]

        let currentRowIndex = 0
        sysArr.forEach((sys, i) => {
            if (Math.floor(i / colNum) > currentRowIndex) {
                currentRowIndex++
                currentRow = getLineRow()
                root.addContent(currentRow)
            }

            const card = new RowAndColLayoutItem('row', { width: sizeParam.sysCard.width, justifyContent: 'space-between', name: 'card' })
            currentRow.addContent(card)

            if (!sys) {
                card.addContent(getFillRect())
                return
            }

            const infoCol = new RowAndColLayoutItem('col', { width: sizeParam.pointsInfo.width, justifyContent: 'space-between', name: 'info-col' })
            card.addContent(infoCol)

            const padAndSubCol = new RowAndColLayoutItem('col', {
                width: sizeParam.pad.width,
                padding: { right: sizeParam.pad.paddingRight },
                name: 'pad-and-sub',
            })
            card.addContent(padAndSubCol)

            if (isRMU) {
                padAndSubCol.addContent(
                    new RowAndColLayoutItem('row', { height: sizeParam.pointsInfo.marginTop, name: 'padding-rect' })
                        .addContent(
                            getFillRect()
                        )
                )
            }

            infoCol.addContent(
                new RowAndColLayoutItem('row', { height: sizeParam.pointsInfo.marginTop, name: 'padding-rect' }).addContent(
                    getFillRect()
                )
            )

            const padInfo = new RowAndColLayoutItem('row', { height: sizeParam.pointsInfo.height.pad, name: 'pad-info' })
            infoCol.addContent(padInfo)
            const padContentRow = new RowAndColLayoutItem('row', { height: sizeParam.pad.height, name: 'pad-diagram' })
            padAndSubCol.addContent(padContentRow)

            if (sys.pad) {
                padInfo.addContent(getFieldCardContent(getAssetFieldCardKey(sys.pad.alias)))
                padContentRow.addContent(getPadContent(sys.pad.alias))
            } else {
                padInfo.addContent(getFillRect())
                padContentRow.addContent(getFillRect())
            }

            const subInfo = new RowAndColLayoutItem('row', { height: sizeParam.pointsInfo.height.sub, name: 'sub-info' })
            infoCol.addContent(subInfo)
            const subCol = new RowAndColLayoutItem('col', {
                width: sizeParam.sub.width,
                name: 'sub'
            })
            const subRow = new RowAndColLayoutItem('row', {
                height: sizeParam.sub.height,
                justifyContent: isRMU ? 'flex-start' : 'center',
                name: 'sub-row'
            }).addContent(subCol)
            padAndSubCol.addContent(subRow)

            if (sys.sub) {
                subInfo.addContent(getFieldCardContent(getAssetFieldCardKey(sys.sub.alias)))

                subCol.addContent(
                    getSubContent(
                        sys.sub.alias,
                        {
                            name: sys.sub.name,
                            state: RUN_STATE.MISSING,
                            type: sys.sub.type,
                        },
                        getColorMapFromCfg(sys.sub.runStatusPoint?.conf?.valueMap)
                    )
                )
            } else {
                subInfo.addContent(getFillRect())
                subCol.addContent(getFillRect())
            }
        })

        const builder = new RowAndColLayoutBuilder(root, (g, provider) => {
            const lineWire = (ps: Point[]) => wire(ps, undefined, '#083F4D')

            const rowStartAndEndArr = Array.from({ length: rowNum }, (_, i) => {
                const start = point(
                    sizeParam.rowMarginL,
                    sizeParam.rowLineOffsetY + i * (sizeParam.sysCard.height + sizeParam.rowMarginTop)
                )
                const end = point(
                    sizeParam.canvasWidth - sizeParam.rowMarginR / 3,
                    start.y
                )

                return {
                    start,
                    end
                }
            })

            const b = line.barrow?.[0]
            let barrowEle: ShapeElement | undefined = undefined
            if (b) {
                const firstRowStart = rowStartAndEndArr[0].start
                const origin = point(firstRowStart.x + sizeParam.barrow.marginLeft, firstRowStart.y)
                barrowEle = getBarrowEle(b.alias, origin, b.runStatusPoint)
            }

            const rmuRowEndRecord: Point[] = []
            for (let rowIndex = 0; rowIndex < rowNum; rowIndex++) {
                const isEvenRow = rowIndex % 2 === 0 ? true : false
                const { start: currentRowStart, end: currentRowEnd } = rowStartAndEndArr[rowIndex]

                let barrowEnd = currentRowStart
                // 连接手车
                if (rowIndex === 0) {
                    g.add(lineWire([
                        point(0, currentRowStart.y),
                        currentRowStart,
                    ]))

                    if (barrowEle) {
                        g.add(lineWire([
                            currentRowStart,
                            barrowEle.start[0]
                        ]))
                        barrowEnd = barrowEle.end[0]
                    }
                }

                if (rowIndex > 0) {
                    const { start: preRowStart, end: preRowEnd } = rowStartAndEndArr[rowIndex - 1]
                    if (isEvenRow) {
                        g.add(lineWire([
                            preRowStart,
                            point(preRowStart.x - sizeParam.colGap / 4, preRowStart.y),
                            point(currentRowStart.x - sizeParam.colGap / 4, currentRowStart.y),
                            currentRowStart
                        ]))
                    } else if (!isRMU) { // 环网右侧接线特殊，后续进行处理
                        g.add(lineWire([preRowEnd, currentRowEnd]))
                    }
                }

                if (isRMU) {
                    for (let colIndex = 0; colIndex < colNum; colIndex++) {
                        // 卡片在当前馈线的序号
                        const cardIndex = colIndex + rowIndex * colNum
                        const sys = line.sys[cardIndex]

                        const gap = sizeParam.colGap / 3
                        const getInPX = (index: number) =>
                            currentRowStart.x + (index + 1) * sizeParam.sysCard.width +
                            index * sizeParam.colGap + gap
                        const preOutX = colIndex === 0 ? barrowEnd.x : (getInPX(colIndex - 1) + gap)
                        const inPX = getInPX(colIndex)
                        const outPX = inPX + gap
                        if (sys?.pad) {
                            g.add(lineWire([
                                point(preOutX, currentRowStart.y),
                                point(inPX, currentRowStart.y),
                            ]))
                            const { end: padEnds } = provider(sys.pad.alias) ?? {}
                            if (padEnds && padEnds.length >= 3) {
                                const padEnd1 = padEnds[padEnds.length - 2]
                                const padEnd2 = padEnds[padEnds.length - 1]
                                const sysCardBottomY = (rowIndex + 1) * (sizeParam.sysCard.height + sizeParam.rowMarginTop)

                                g.add(lineWire([
                                    point(inPX, currentRowStart.y),
                                    point(inPX, sysCardBottomY - sizeParam.colGap / 3),
                                    point(padEnd2.x, sysCardBottomY - sizeParam.colGap / 3),
                                    padEnd2
                                ]))
                                if (colIndex === colNum - 1 || cardIndex === line.sys.length - 1) {
                                    const rmuOut = point(outPX, sysCardBottomY)
                                    g.add(lineWire([
                                        padEnd1,
                                        point(padEnd1.x, sysCardBottomY),
                                        rmuOut,
                                    ]))
                                    rmuRowEndRecord.push(rmuOut)
                                    if (!isEvenRow && rowIndex > 0) {
                                        g.add(lineWire([
                                            rmuRowEndRecord[rowIndex - 1],
                                            point(rmuRowEndRecord[rowIndex - 1].x, rmuOut.y),
                                            rmuOut
                                        ]))
                                    }
                                } else {
                                    g.add(lineWire([
                                        point(outPX, currentRowStart.y),
                                        point(outPX, sysCardBottomY),
                                        point(padEnd1.x, sysCardBottomY),
                                        padEnd1
                                    ]))
                                }

                                g.add(getRMUArrowEle(padEnd1, sizeParam.rmuArrow.width, sizeParam.rmuArrow.height))
                                g.add(getRMUArrowEle(padEnd2, sizeParam.rmuArrow.width, sizeParam.rmuArrow.height))
                            }
                        }
                    }
                } else {
                    g.add(lineWire([rowIndex === 0 ? barrowEnd : currentRowStart, currentRowEnd]))
                }

                // 延长最后一行至边缘
                if (rowIndex === rowNum - 1) {
                    if (isRMU) {
                        const end = rmuRowEndRecord[rowIndex]

                        if (isEvenRow && end) {
                            g.add(lineWire([
                                end,
                                point(end.x, end.y + 15),
                                point(0, end.y + 15),
                            ]))
                        } else {
                            g.add(lineWire([
                                currentRowStart,
                                point(0, currentRowStart.y)
                            ]))
                        }

                        const endBarrow = line.barrow?.[1]
                        let barrowOrigin: Point | undefined = undefined
                        let barrowEle: ShapeElement | undefined = undefined
                        if (end && endBarrow) {
                            barrowOrigin = point(sizeParam.barrow.marginLeft, (isEvenRow ? end.y + 15 : currentRowStart.y))
                            barrowEle = getBarrowEle(endBarrow.alias, barrowOrigin, endBarrow.runStatusPoint)
                            g.add(barrowEle.ele)
                        }
                    } else {
                        if (isEvenRow) {
                            g.add(lineWire([
                                currentRowEnd,
                                point(sizeParam.canvasWidth, currentRowEnd.y)
                            ]))
                        } else {
                            g.add(lineWire([
                                currentRowStart,
                                point(0, currentRowEnd.y)
                            ]))
                        }
                    }
                }
            }

            barrowEle && g.add(barrowEle.ele)
        })

        l.add(builder.build(actOpt).ele)

    }, [line, padInfoMap, size])

    const cusTooltipNodeProvider = (evt: ElementInfo<'showCustomNode'>) => {
        const compKey = evt.key
        if (!compKey) {
            return
        }

        const barrow = barrowArr.find(b => {
            if (b.runStatusPoint) {
                const p = b.runStatusPoint
                const bKey = getPointDynKey(p, b.alias)
                return bKey === compKey
            }
            return false
        })

        if (barrow) {
            const p = barrow.runStatusPoint
            const data = p ? (dataMap[p.alias]?.data ?? []) : []
            return <BarrowTip
                name={barrow.name}
                alias={p!.alias}
                onRename={(n) => {
                    if (p) {
                        rename(p.alias, p.tableNo, n)
                            .then(() => {
                                refresh()
                            })
                            .catch(e => {
                                console.error('rename point error', e);
                            })
                    }
                }}
                pointData={data}
            />
        }

        const sub = subSysArr.find(sub => compKey === sub.alias)
        if (sub) {
            const relaPoint = sub.runStatusPoint
            return <SubTip
                name={sub.name}
                alias={relaPoint?.alias ? combineToFullAlias(sub.alias, relaPoint?.alias) : undefined}
            />
        }

        const padDynData = dataMap[compKey] as IDyn | undefined
        const evtData = evt.data as { hoverMark?: GRAPH_ELE_MARK } | undefined
        const { alias, tableNo, fieldNo } = parseDynKey(compKey)
        const enableNameArr: GRAPH_ELE_MARK[] = [
            GRAPH_ELE_MARK.HIGH_BREAKER,
            GRAPH_ELE_MARK.HIGH_DISCONNECTOR,
            GRAPH_ELE_MARK.HIGH_EARTH,
            GRAPH_ELE_MARK.RMU_LOAD1,
            GRAPH_ELE_MARK.RMU_EARTH1,
            GRAPH_ELE_MARK.RMU_LOAD2,
            GRAPH_ELE_MARK.RMU_EARTH2,
        ]

        return <PadTip
            disableName={!evtData?.hoverMark || !enableNameArr.includes(evtData.hoverMark)}
            name={padDynData?.wf_name}
            alias={alias}
            onRename={(n) => {
                if (alias && tableNo && fieldNo) {
                    rename(alias, tableNo, n)
                        .then(() => {
                            refresh()
                        })
                        .catch(e => {
                            console.error('rename point error', e);
                        })
                }
            }}
        />
    }

    const aspectRatio = ((size?.sizeParam.canvasWidth ?? 1) / (size?.sizeParam.canvasHeight ?? 1)).toFixed(4)
    return <div className={`${styles.diagram} ${(size?.rowNum ?? 0) <= 2 ? styles.transparent_scroll : ''}`} ref={containerRef}>
        <div className={styles.content} style={{ aspectRatio: aspectRatio }} >
            <KonvaWrap
                disableResize={true}
                height={size?.sizeParam.canvasHeight ?? 1}
                width={size?.sizeParam.canvasWidth ?? 1}
                stateMap={dataMap}
                readyToDraw={line && size !== undefined}
                reDrawOnVisibleChange={false}
                draw={draw}
                cusTooltipNodeProvider={cusTooltipNodeProvider}
            />
        </div>
    </div>
}

export type FactoryTopologyProps = {
    alias: string,
    defaultLineAlias?: string,
    domain: DOMAIN_ENUM,
    padAliasMap?: PADPointAliasMap
    config?: FactoryTopologyCfg
}

const FactoryTopologyDiagram = ({ alias, defaultLineAlias, domain, padAliasMap = getPADDefaultAliasMap(false), config }: FactoryTopologyProps) => {
    const [lineData, setLineData] = useState<{ isRMU: boolean[], lines: (DiagramProps['line'] & { name: string })[] }>({ isRMU: [], lines: [] })
    const [topologyAssets, setAssets] = useState<TopologyAsset[]>([])
    const { isDemo } = useWidgetContext()

    useEffect(() => {
        if (isDemo) return
        if (alias) {
            getTopologyStracture(alias)
                .then(assetArr => {
                    setAssets(assetArr)
                })
        }
    }, [alias, isDemo])

    useEffect(() => {
        if (topologyAssets.length > 0) {
            const isRMUArr: boolean[] = []
            const lineArr: TopologyAsset[] = []
            const padGroups: { [key: string]: TopologyAsset[] } = {} // key: parent_alias
            const subMap: { [key: string]: TopologyAsset } = {} // key: parent_alias

            const {
                lineAssetArr,
                assetParentAliasMap,
            } = topologyAssets.reduce((p, c) => {
                const lineAssetArr = Array.from(p.lineAssetArr)
                const assetParentAliasMap = { ...p.assetParentAliasMap }
                switch (c.assetType) {
                    case TopologyAssetType.line: lineAssetArr.push(c); break;
                    case TopologyAssetType.pad:
                    case TopologyAssetType.turbine:
                    case TopologyAssetType.matric:
                    case TopologyAssetType.sys: {
                        const children = assetParentAliasMap[c.parent_alias]
                        if (children) {
                            children.push(c)
                        } else {
                            assetParentAliasMap[c.parent_alias] = [c];
                        }
                        break;
                    }
                }

                return { lineAssetArr, assetParentAliasMap }
            }, {
                lineAssetArr: [] as TopologyAsset[],
                assetParentAliasMap: {} as { [key: string]: TopologyAsset[] },
            })
            lineAssetArr.forEach(l => {
                let containRMUPad = false
                lineArr.push(l)
                const children = assetParentAliasMap[l.alias]
                if (children) {
                    children.forEach(c => {
                        let padAsset: TopologyAsset | undefined = undefined
                        let subAsset: TopologyAsset | undefined = undefined
                        if (c.assetType === TopologyAssetType.pad) {
                            padAsset = c
                            subAsset = assetParentAliasMap[c.alias]?.[0] as TopologyAsset | undefined
                        } else {
                            subAsset = c
                            padAsset = assetParentAliasMap[c.alias]?.[0] as TopologyAsset | undefined
                        }

                        const arr = padGroups[l.alias] ?? []
                        containRMUPad = containRMUPad || (!!padAsset && isRMU(convertSubTypeToGraphType(padAsset.sub_type)))
                        padAsset && arr.push(padAsset)
                        padGroups[l.alias] = arr
                        if (padAsset && subAsset) {
                            subMap[padAsset.alias] = subAsset
                        }
                    })
                }
                isRMUArr.push(containRMUPad)
            })

            const updateNewLines = async () => {
                const allPossibleBarrowAlias = lineArr.flatMap(l => {
                    const p1Alias = config?.barrow?.[0]?.relatePoint?.alias
                    const p2Alias = config?.barrow?.[1]?.relatePoint?.alias
                    const arr: string[] = []

                    if (p1Alias) {
                        arr.push(
                            l.alias + '.DL1',
                            l.alias + '.DL01',
                            l.alias + '.DL001',
                        )
                    }
                    if (p2Alias) {
                        arr.push(
                            l.alias + '.DL2',
                            l.alias + '.DL02',
                            l.alias + '.DL002',
                        )
                    }
                    return arr
                })

                const checkRes = allPossibleBarrowAlias.length > 0 ? await checkDevicePoint(allPossibleBarrowAlias) : {}
                const allBarrowAlias = allPossibleBarrowAlias.filter(a => checkRes[a])

                const newLines = lineArr.map((l) => {
                    const pads = padGroups[l.alias] ?? []
                    const barrowArr: DiagramProps['line']['barrow'] = []

                    const barrowAliasArr = allBarrowAlias.filter(a => a.includes(l.alias))
                    barrowAliasArr.forEach((bAlias, i) => {
                        const relatePoint = config?.barrow?.[i]?.relatePoint
                        const fields = config?.barrow?.[i]?.fields
                        if (config?.barrow?.[i]?.relatePoint) {
                            barrowArr.push({
                                alias: bAlias,
                                name: '',
                                runStatusPoint: relatePoint,
                                fields: fields?.map(f => ({ ...f, key: combinePointKey(f) })) ?? []
                            })
                        }
                    })

                    return {
                        name: l.display_name || l.alias,
                        alias: l.alias,
                        barrow: barrowArr,
                        sys: pads.map(pad => {
                            const sub = subMap[pad.alias]
                            return {
                                pad: {
                                    name: pad.display_name,
                                    alias: pad.alias,
                                    type: pad.type,
                                    fields: config?.pad.map(f => ({ ...f, key: combinePointKey(f) })) || []
                                },
                                sub: sub ? {
                                    type: getSubTypeByDomain(domain),
                                    name: sub.display_name,
                                    alias: sub.alias,
                                    fields: config?.sub.fields.map(f => ({ ...f, key: combinePointKey(f) })) || [],
                                    runStatusPoint: config?.sub.relatePoint
                                } : undefined
                            }
                        })
                    }
                })

                setLineData({ isRMU: isRMUArr, lines: newLines })
            }

            updateNewLines()
        }
    }, [topologyAssets, config, domain])

    const [currentTabIndex, setCurrentTab] = useState(0)
    const [autoplay, setAutoPlay] = useState(false)

    useEffect(() => {
        if (defaultLineAlias && lineData.lines.length > 0) {
            setCurrentTab(Math.max(lineData.lines.findIndex(l => l.alias === defaultLineAlias), 0))
        }
    }, [lineData.lines, defaultLineAlias])

    useEffect(() => {
        let timmerId: number | undefined = undefined
        const auto = () => {
            timmerId = window.setTimeout(() => {
                setCurrentTab(cur => {
                    if (cur + 1 === lineData.lines.length) {
                        return 0
                    }
                    return cur + 1
                })
                auto()
            }, 5000)
        }

        if (autoplay && !isDemo) {
            auto()
        } else {
            window.clearTimeout(timmerId)
        }
        return () => {
            window.clearTimeout(timmerId)
        }
    }, [autoplay, isDemo])

    return <div className={styles.container}>
        <Tabs onChange={(k) => setCurrentTab(parseInt(k))}
            activeKey={currentTabIndex + ''}
            tabBarExtraContent={
                <Button ghost onClick={() => setAutoPlay(a => !a)}>
                    {autoplay ? i18n.stopPlay : i18n.autoPlay}
                </Button>}
        >
            {lineData.lines.map((l, i) => <Tabs.TabPane key={i} tab={l.name} />)}
        </Tabs>
        {lineData.lines.length > 0 && <Diagram
            key={currentTabIndex}
            domain={domain}
            isRMU={lineData.isRMU[currentTabIndex]}
            line={lineData.lines[currentTabIndex]}
            padAliasMap={padAliasMap}
        />}
    </div>
}

export default FactoryTopologyDiagram