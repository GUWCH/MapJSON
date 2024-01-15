import { getDebugFillRect, getFillPoint, getFillRect, getFillWire } from "DrawLib/layouts/placeholder"
import { RowAndColLayoutBuilder, RowAndColLayoutItem } from "DrawLib/layouts/RowAndCollLayout"
import { DisconnectorOptions, DisconnectorState } from "DrawLib/shapes/disconnector"
import { DisconnectorWithEarthOptions, DisconnectorWithEarthState } from "DrawLib/shapes/disconnectorWithEarth"
import { EarthConnectorOptions, EarthConnectorState } from "DrawLib/shapes/earthConnector"
import { LoadSwitchOptions, LoadSwitchState } from "DrawLib/shapes/loadSwitch"
import { WindingTransformerOptions, WindingTransformerState, WindingTransformerType } from "DrawLib/shapes/winding"
import { withLabel } from "DrawLib/wrapper/additionalEleWrapper"
import { clickable } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { CONTROL_STATE, SWITCH_STATE } from "../constant"
import { CommonOptions, GroupElement, GroupProps, ILayoutEleContent, Point, ShapeEventHandler, SwitchColors } from "../model"
import { breaker, BreakerColors, BreakerOptions, BreakerState, disconnector, disconnectorWithEarth, earthConnector, loadSwitch, windingTransformer } from "../shapes"
import { calcEleActualRect, point, wire } from "../utils"

export enum GRAPH_ELE_MARK {
    HIGH_REMOTE = 'HIGH_REMOTE',
    HIGH_DISCONNECTOR = 'HIGH_DISCONNECTOR',
    HIGH_BREAKER = 'HIGH_BREAKER',
    HIGH_EARTH = 'HIGH_EARTH',
    RMU_LOAD1 = 'RMU_LOAD1',
    RMU_EARTH1 = 'RMU_EARTH1',
    RMU_LOAD2 = 'RMU_LOAD2',
    RMU_EARTH2 = 'RMU_EARTH2',
    LOW_REMOTE1 = 'LOW_REMOTE1',
    LOW_REMOTE2 = 'LOW_REMOTE2',
    LOW_BREAKER1 = 'LOW_BREAKER1',
    LOW_BREAKER2 = 'LOW_BREAKER2'
}

export enum GRAPH_TYPE {
    /* 类型1.直连接线、两卷变 */
    TYPE1,
    /* 类型2.直连接线、三卷变 */
    TYPE2,
    /* 类型3.环网、两卷变 */
    TYPE3,
    /* 类型4.环网、三卷变 */
    TYPE4,
    /* 类型5.直连、两卷变、两低压 */
    TYPE5
}

export const isThreeWinding = (type: GRAPH_TYPE) => [
    GRAPH_TYPE.TYPE2,
    GRAPH_TYPE.TYPE4,
    GRAPH_TYPE.TYPE5,
].includes(type)
export const isRMU = (type: GRAPH_TYPE) => [
    GRAPH_TYPE.TYPE3,
    GRAPH_TYPE.TYPE4
].includes(type)

export type ColorMap = Partial<{
    switch: SwitchColors
    wire: string
    breaker: BreakerColors
    winding: string
    earth: string
    bg: string
}>

export type BreakerProps = {
    name?: string,
    controlState?: {
        key: string
        state: CONTROL_STATE
    }
    switchState: {
        key: string
        state: SWITCH_STATE
    }
}

export type PadGraphOptions = {
    endWithArrow?: boolean // 电路以箭头结尾
    onClick?: ShapeEventHandler<'click'>
    colors?: ColorMap
    enableEleName?: boolean
    label?: {
        text: string
        font: number
        width: number
    }
}

export type PadGraphState = {
    type: GRAPH_TYPE
    values: {
        breakerUpon?: BreakerProps
        breakerBelow?: BreakerProps | (BreakerProps | undefined)[]
        disconnState?: {
            key: string
            name?: string
            state: SWITCH_STATE
        }
        earthConnState?: {
            key: string
            name?: string
            state: SWITCH_STATE
        }
        rmu?: {
            loadSwitch?: {
                key: string,
                state: SWITCH_STATE
            },
            earth?: {
                key: string,
                state: SWITCH_STATE,
            }
        }[]
    }
}

const getBreakerContent = (props: BreakerProps, btnPosition: 'left' | 'right', opt?: {
    hoverMark: {
        breaker: GRAPH_ELE_MARK
        btn: GRAPH_ELE_MARK
    }
    enableName?: boolean
    breakerOptions?: CommonOptions
    labelProps: Omit<CommonOptions['label'], 'text'>
}):
    ILayoutEleContent<BreakerState, BreakerOptions> => ({
        key: props.switchState.key,
        stateProducer: () => ({
            breaker: {
                key: props.switchState.key,
                state: props.switchState.state
            },
            control: props.controlState ? {
                key: props.controlState.key,
                state: props.controlState.state
            } : undefined
        }),
        baseProps: {
            options: {
                ...opt?.breakerOptions,
                hoverMark: opt?.hoverMark,
                buttonPosition: btnPosition,
                label: opt?.enableName ? {
                    ...opt.labelProps,
                    text: props.name ?? '',
                } : undefined
            }
        },
        drawFunc: breaker
    })

const getDisconnContent = (key: string, state: DisconnectorState, opt?: {
    hoverMark: GRAPH_ELE_MARK
    name?: string,
    enableName?: boolean,
    commonOpt?: CommonOptions,
    labelProps: Omit<CommonOptions['label'], 'text'>
}):
    ILayoutEleContent<DisconnectorState, DisconnectorOptions> => ({
        key: key,
        stateProducer: () => state,
        baseProps: {
            options: {
                ...opt?.commonOpt,
                key,
                hoverMark: opt?.hoverMark,
                label: opt?.enableName ? {
                    ...opt.labelProps,
                    text: opt.name ?? '',
                    margin: 10
                } : undefined
            }
        },
        drawFunc: disconnector
    })

const getEarthContent = (key: string, state: EarthConnectorState, size: 'big' | 'small',
    opt?: {
        hoverMark: GRAPH_ELE_MARK,
        enableName?: boolean, name?: string, earthOptions?: CommonOptions
        labelProps: Omit<CommonOptions['label'], 'text'>
    }):
    ILayoutEleContent<EarthConnectorState, EarthConnectorOptions> => ({
        key: key,
        stateProducer: () => state,
        baseProps: {
            options: {
                ...opt?.earthOptions,
                size,
                key,
                hoverMark: opt?.hoverMark,
                label: opt?.enableName ? {
                    ...opt.labelProps,
                    text: opt.name ?? ''
                } : undefined
            }
        },
        drawFunc: earthConnector
    })

const getWindingContent = (key: string, state: WindingTransformerState, commonOpt?: CommonOptions):
    ILayoutEleContent<WindingTransformerState, WindingTransformerOptions> => ({
        key,
        stateProducer: () => state,
        baseProps: {
            options: {
                ...commonOpt
            }
        },
        drawFunc: windingTransformer
    })

const getDisconnWithEarthContent = (
    d: { key: string, state: SWITCH_STATE, name?: string },
    e: { key: string, state: SWITCH_STATE, name?: string },
    opt?: {
        hoverMark: {
            earth: GRAPH_ELE_MARK,
            disconn: GRAPH_ELE_MARK
        },
        options?: CommonOptions,
        enableName?: boolean,
        labelProps: Omit<CommonOptions['label'], 'text'>
    }
): ILayoutEleContent<DisconnectorWithEarthState, DisconnectorWithEarthOptions> => ({
    key: d.key,
    stateProducer: () => ({
        disconnector: d.state,
        earth: e.state
    }),
    baseProps: {
        options: {
            ...opt?.options,
            disconnectorKey: d.key,
            earthKey: e.key,
            hoverMark: opt?.hoverMark,
            disconnectorName: d.name,
            earthConnectorName: e.name,
            label: opt?.enableName ? { ...opt.labelProps, text: '' } : undefined
        }
    },
    drawFunc: disconnectorWithEarth
})

const getLoadSwitchContent = (key: string, state: LoadSwitchState, opt?: {
    commonOpt?: CommonOptions,
    labelProps: Omit<CommonOptions['label'], 'text'>
    hoverMark: GRAPH_ELE_MARK
}):
    ILayoutEleContent<LoadSwitchState, LoadSwitchOptions> => ({
        key,
        stateProducer: () => state,
        baseProps: {
            options: {
                key,
                ...opt?.commonOpt,
                hoverMark: opt?.hoverMark,
                label: { ...opt?.labelProps, text: '' }
            }
        },
        drawFunc: loadSwitch
    })

const getEndArrowContent = (key: string, arrowWidth: number): ILayoutEleContent<void, void> => ({
    key,
    drawFunc: (props) => {
        const origin = props.start[0]
        const { height = 0, width = 0 } = props.rect
        const inP = point(origin.x + width / 2, origin.y)
        const startX = inP.x - arrowWidth / 2
        const ele = new Konva.Line({
            points: [
                startX, origin.y,
                startX + arrowWidth, origin.y,
                startX + arrowWidth / 2, origin.y + height],
            fill: '#FFBB00',
            closed: true
        })
        return {
            origin,
            start: [inP],
            end: [point(inP.x, inP.y + height)],
            rect: {
                height, width
            },
            ele
        }
    }
})

const getWindingKey = () => 'winding' + Math.random().toFixed(5)
const getMainThreadKey = () => 'main' + Math.random().toFixed(5)
const getRMUThreadKey = () => 'rmu' + Math.random().toFixed(5)

const padGraph = (props: GroupProps<PadGraphState, PadGraphOptions>): GroupElement => {
    const { type, values: stateValues } = props.state
    const onClick = props.options.onClick
    const isRMUType = isRMU(type)

    const designRect = {
        width: isRMUType ? 250 : 130, height: 272
    }
    const {
        scaleX: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        width: actualEleWidth,
        height: actualEleHeight,
        paddingTB: 20 * scale, // 接线图上下边缘预留导线长度
        mainColWidth: 130 * scale,
        RMUColWidth: 60 * scale,
        arrow: {
            width: 8,
            height: 12
        },
        breaker: {
            width: (48 + 18 + 14) * scale,
            height: 34 * scale
        },
        winding: {
            three: {
                width: 60 * scale,
                height: (57 + 6) * scale
            },
            two: {
                width: 32 * scale,
                height: (60 + 6) * scale
            },
            outInterval: 16 * 0.875 * scale
        },
        disconnector: {
            height: 54 * scale,
            width: 9 * scale,
        },
        earthConnector: {
            width: 60 * scale,
            height: 10 * scale,
        },
        loadSwitch: {
            width: 20 * scale,
            height: 40 * scale
        },
        disconnectorWithEarth: {
            width: 34 * scale,
            height: 56 * scale
        },
    }
    const commonLabelProps = {
        fontSize: 12 * scale,
        position: 'right' as 'right' | 'top' | 'bottom',
        editable: true,
        width: 60 * scale,
        margin: 1
    }

    const start = props.start[0]
    const origin = props.options.startType === 'origin' ? start : point(start.x - containerWidth / 2, start.y)
    const isThreeType = isThreeWinding(type)
    const commonOpt: typeof props.options = {
        wireWidth: props.options.wireWidth,
        wireColor: props.options.wireColor,
        scale: props.options.scale,
        stateConsumerRegister: props.options.stateConsumerRegister,
        eventHandlers: {
            click: onClick
        },
    }

    const layoutRoot = new RowAndColLayoutItem('row', {
        height: containerHeight,
        width: containerWidth,
        justifyContent: 'space-evenly',
        origin: origin
    })

    const mainThread = new RowAndColLayoutItem('col', {
        width: size.mainColWidth,
        justifyContent: 'space-between'
    })
    layoutRoot.addContent(mainThread)

    const mainThreadStartKey = getMainThreadKey()
    mainThread.addContent(new RowAndColLayoutItem('col', {
        height: 1
    }).addContent(getFillWire(mainThreadStartKey, 'col')))
    const mainThreadEndKeys: string[] = []
    const rmuStartKeys: string[] = []
    const rmuEndKeys: string[] = []

    const breakerUponContent = stateValues.breakerUpon ? new RowAndColLayoutItem('row', {
        height: size.breaker.height
    }).addContent(
        getBreakerContent(stateValues.breakerUpon, 'left', {
            breakerOptions: commonOpt, enableName: props.options.enableEleName, labelProps: commonLabelProps, hoverMark: {
                btn: GRAPH_ELE_MARK.HIGH_REMOTE,
                breaker: GRAPH_ELE_MARK.HIGH_BREAKER
            }
        })
    ) : undefined

    const disconnectorContent = stateValues.disconnState ? new RowAndColLayoutItem('row', {
        height: size.disconnector.height
    }).addContent(getDisconnContent(
        stateValues.disconnState.key,
        stateValues.disconnState.state,
        {
            name: stateValues.disconnState.name,
            commonOpt,
            enableName: props.options.enableEleName,
            labelProps: commonLabelProps,
            hoverMark: GRAPH_ELE_MARK.HIGH_DISCONNECTOR
        }
    )) : undefined

    const earthConnectorContent = stateValues.earthConnState ? new RowAndColLayoutItem('row', {
        height: size.earthConnector.height
    }).addContent(getEarthContent(
        stateValues.earthConnState.key,
        stateValues.earthConnState.state,
        'big',
        {
            name: stateValues.earthConnState.name,
            earthOptions: commonOpt,
            enableName: props.options.enableEleName,
            labelProps: commonLabelProps,
            hoverMark: GRAPH_ELE_MARK.HIGH_EARTH
        }
    )) : undefined

    const disconnectorWithEarthContent = stateValues.disconnState && stateValues.earthConnState ? new RowAndColLayoutItem('row', {
        height: size.disconnectorWithEarth.height
    }).addContent(getDisconnWithEarthContent(
        { key: stateValues.disconnState.key, state: stateValues.disconnState.state, name: stateValues.disconnState.name },
        { key: stateValues.earthConnState.key, state: stateValues.earthConnState.state, name: stateValues.earthConnState.name },
        {
            options: commonOpt,
            enableName: props.options.enableEleName,
            labelProps: commonLabelProps,
            hoverMark: {
                earth: GRAPH_ELE_MARK.HIGH_EARTH,
                disconn: GRAPH_ELE_MARK.HIGH_DISCONNECTOR
            }
        }
    )) : undefined

    const windingKey = getWindingKey()
    const getWindingType = (gType: GRAPH_TYPE) => {
        switch (gType) {
            case GRAPH_TYPE.TYPE1:
            case GRAPH_TYPE.TYPE3: return WindingTransformerType.TWO
            case GRAPH_TYPE.TYPE2:
            case GRAPH_TYPE.TYPE4: return WindingTransformerType.THREE
            case GRAPH_TYPE.TYPE5: return WindingTransformerType.TWO_TWO
            default: return WindingTransformerType.TWO
        }
    }
    const windingContent = new RowAndColLayoutItem('row', {
        height: isThreeType ? size.winding.three.height : size.winding.two.height,
    }).addContent(getWindingContent(windingKey, getWindingType(type), commonOpt))

    const breakerBelowContent = new RowAndColLayoutItem('row', {
        height: size.breaker.height + size.paddingTB,
        justifyContent: 'center'
    })
    if (Array.isArray(stateValues.breakerBelow)) {
        const breakerLeft = stateValues.breakerBelow[0]
        const mainThreadEndKeyLeft = getMainThreadKey()
        breakerBelowContent.addContent(new RowAndColLayoutItem('col', {
            width: size.breaker.width,
            justifyContent: 'center'
        })
            .addContent(new RowAndColLayoutItem('row', { height: 0 }).addContent(getFillRect()))
            .addContent(new RowAndColLayoutItem('row', { height: size.breaker.height })
                .addContent(
                    breakerLeft ? getBreakerContent(breakerLeft, 'left', {
                        breakerOptions: { ...commonOpt, contentPosition: { x: 'end' } },
                        enableName: false,
                        labelProps: commonLabelProps,
                        hoverMark: {
                            breaker: GRAPH_ELE_MARK.LOW_BREAKER1,
                            btn: GRAPH_ELE_MARK.LOW_REMOTE1
                        }
                    }) : getFillRect()
                ))
            .addContent(new RowAndColLayoutItem('row', { height: size.paddingTB })
                .addContent(
                    // getDebugFillRect()
                    getFillWire(mainThreadEndKeyLeft, 'col', size.breaker.width - size.winding.outInterval / 2)
                ))
        )

        // 两个断路器间占位
        breakerBelowContent.addContent(new RowAndColLayoutItem('col', {
            width: size.winding.outInterval
        }).addContent(
            getFillRect()
        ))

        const mainThreadEndKeyRight = getMainThreadKey()
        const breakerRight = stateValues.breakerBelow[1]
        breakerBelowContent.addContent(new RowAndColLayoutItem('col', {
            width: size.breaker.width,
            justifyContent: 'space-between'
        })
            .addContent(new RowAndColLayoutItem('row', { height: 0 }).addContent(getFillRect()))
            .addContent(new RowAndColLayoutItem('row', { height: size.breaker.height })
                .addContent(
                    breakerRight ? getBreakerContent(breakerRight, 'right', {
                        breakerOptions: { ...commonOpt, contentPosition: { x: 'start' } },
                        enableName: false,
                        labelProps: commonLabelProps,
                        hoverMark: {
                            breaker: GRAPH_ELE_MARK.LOW_BREAKER2,
                            btn: GRAPH_ELE_MARK.LOW_REMOTE2
                        }
                    }) : getFillRect()
                ))
            .addContent(new RowAndColLayoutItem('row', { height: size.paddingTB })
                .addContent(
                    getFillWire(mainThreadEndKeyRight, 'col', size.winding.outInterval / 2)
                ))
        )

        mainThreadEndKeys.push(mainThreadEndKeyLeft, mainThreadEndKeyRight)
    } else {
        const mainThreadEndKey = getMainThreadKey()
        breakerBelowContent.addContent(new RowAndColLayoutItem('col', {
            width: size.breaker.width,
            justifyContent: 'center'
        })
            .addContent(new RowAndColLayoutItem('row', { height: 0 }).addContent(getFillRect()))
            .addContent(new RowAndColLayoutItem('row', { height: size.breaker.height })
                .addContent(
                    stateValues.breakerBelow ?
                        getBreakerContent(stateValues.breakerBelow, 'left', {
                            breakerOptions: { ...commonOpt, contentPosition: { x: 'center' } },
                            enableName: false,
                            labelProps: commonLabelProps,
                            hoverMark: {
                                breaker: GRAPH_ELE_MARK.LOW_BREAKER1,
                                btn: GRAPH_ELE_MARK.LOW_REMOTE1
                            }
                        }) : getFillRect()
                ))
            .addContent(new RowAndColLayoutItem('row', { height: size.paddingTB })
                .addContent(
                    getFillWire(mainThreadEndKey, 'col', 'center')
                ))
        )
        mainThreadEndKeys.push(mainThreadEndKey)
    }

    // 主要用于判断主线上隔离开关和接地的关系
    if (isRMU(type)) {
        breakerUponContent && mainThread.addContent(breakerUponContent)
        !disconnectorWithEarthContent && disconnectorContent && mainThread.addContent(disconnectorContent)
        !disconnectorWithEarthContent && earthConnectorContent && mainThread.addContent(earthConnectorContent)
        disconnectorWithEarthContent && mainThread.addContent(disconnectorWithEarthContent)
        mainThread.addContent(windingContent)
        mainThread.addContent(breakerBelowContent)
    } else {
        disconnectorContent && mainThread.addContent(disconnectorContent)
        breakerUponContent && mainThread.addContent(breakerUponContent)
        earthConnectorContent && mainThread.addContent(earthConnectorContent)
        mainThread.addContent(windingContent)
        mainThread.addContent(breakerBelowContent)
    }

    if (isRMUType && stateValues.rmu) {
        stateValues.rmu.forEach((r, i) => {
            if (!r) return
            const startKey = getRMUThreadKey()
            rmuStartKeys.push(startKey)
            const rmuCol = new RowAndColLayoutItem('col', {
                width: size.RMUColWidth,
                justifyContent: 'space-between'
            })
            layoutRoot.addContent(rmuCol)
            rmuCol.addContent(
                new RowAndColLayoutItem('row', { height: 0 })
                    .addContent(getFillPoint(startKey))
            )

            rmuCol.addContent(new RowAndColLayoutItem('row', {
                height: size.loadSwitch.height
            }).addContent(
                r.loadSwitch ?
                    getLoadSwitchContent(r.loadSwitch.key, r.loadSwitch.state, {
                        commonOpt,
                        labelProps: commonLabelProps,
                        hoverMark: i === 0 ? GRAPH_ELE_MARK.RMU_LOAD1 : GRAPH_ELE_MARK.RMU_LOAD2
                    }) :
                    getFillRect()
            ))

            rmuCol.addContent(new RowAndColLayoutItem('row', {
                height: size.earthConnector.height
            }).addContent(
                r.earth ?
                    getEarthContent(r.earth.key, r.earth.state, 'small', {
                        enableName: true,
                        earthOptions: commonOpt,
                        labelProps: commonLabelProps,
                        hoverMark: i === 0 ? GRAPH_ELE_MARK.RMU_EARTH1 : GRAPH_ELE_MARK.RMU_EARTH2
                    }) :
                    getFillRect()
            ))

            const endKey = getRMUThreadKey()
            rmuEndKeys.push(endKey)
            rmuCol.addContent(new RowAndColLayoutItem('row', { height: props.options.endWithArrow ? size.arrow.height : 0 }).addContent(
                props.options.endWithArrow ?
                    getEndArrowContent(endKey, size.arrow.width) :
                    getFillWire(endKey, 'col', 'center', props.options.wireWidth, props.options.wireColor)
            ))
        })
    }

    const builder = new RowAndColLayoutBuilder(
        layoutRoot,
        (g, p) => {
            const graphStarts: Point[] = []
            const graphEnds: Point[] = []

            const breakerUponSwitchKey = stateValues.breakerUpon?.switchState.key
            const disconnKey = stateValues.disconnState?.key
            const mainEarthKey = stateValues.earthConnState?.key
            const breakerBelowSwitchKey = Array.isArray(stateValues.breakerBelow) ? undefined : stateValues.breakerBelow?.switchState.key
            const breakerBelowLeftSwitchKey = Array.isArray(stateValues.breakerBelow) ? stateValues.breakerBelow[0]?.switchState.key : undefined
            const breakerBelowRightSwitchKey = Array.isArray(stateValues.breakerBelow) ? stateValues.breakerBelow[1]?.switchState.key : undefined

            const mainStart = p(mainThreadStartKey)
            const breakerUpon = p(breakerUponSwitchKey)
            const disconn = p(disconnKey)
            const mainEarth = p(mainEarthKey)
            const winding = p(windingKey)
            const breakerBelow = p(breakerBelowSwitchKey)
            const breakerBelowLeft = p(breakerBelowLeftSwitchKey)
            const breakerBelowRight = p(breakerBelowRightSwitchKey)
            const mainEnds = mainThreadEndKeys.map(k => p(k)).filter(e => e) as { start: Point[], end: Point[] }[]

            if (!mainStart) return

            let mainThreadLineEles = (isRMUType ? [
                breakerUpon, disconn, mainEarth, winding
            ] : [
                disconn, breakerUpon, mainEarth, winding
            ]).filter(e => e) as { start: Point[], end: Point[] }[]
            let preEnds = mainStart.end
            mainThreadLineEles.forEach(el => {
                g.add(wire([
                    preEnds[0], el.start[0]
                ]))
                preEnds = el.end
            })

            if (isThreeType) {
                if (breakerBelowLeft) {
                    g.add(wire([
                        preEnds[0], breakerBelowLeft.start[0]
                    ]))
                    g.add(wire([
                        breakerBelowLeft.end[0], mainEnds[0].start[0]
                    ]))
                } else {
                    g.add(wire([
                        preEnds[0], mainEnds[0].start[0]
                    ]))
                }

                if (breakerBelowRight) {
                    g.add(wire([
                        preEnds[1], breakerBelowRight.start[0]
                    ]))
                    g.add(wire([
                        breakerBelowRight.end[0], mainEnds[1].start[0]
                    ]))
                } else {
                    g.add(wire([
                        preEnds[1], mainEnds[1].start[0]
                    ]))
                }

                graphEnds.push(mainEnds[0].end[0])
                graphEnds.push(mainEnds[1].end[0])
            } else {
                if (breakerBelow) {
                    g.add(wire([
                        preEnds[0], breakerBelow.start[0]
                    ]))
                    g.add(wire([
                        breakerBelow.end[0], mainEnds[0].start[0]
                    ]))
                } else {
                    g.add(wire([
                        preEnds[0], mainEnds[0].start[0]
                    ], props.options.wireWidth, props.options.wireColor))
                }
                graphEnds.push(mainEnds[0].end[0])
            }

            const rmuValues = stateValues.rmu
            const rmuStarts = rmuStartKeys.map(k => p(k)).filter(e => e) as { start: Point[], end: Point[] }[]

            const rmuEnds = rmuEndKeys.map(k => p(k)).filter(e => e) as { start: Point[], end: Point[] }[]
            if (rmuValues && rmuValues.length > 0 && rmuStarts.length > 0) { // 环网
                g.add(wire([
                    mainStart.start[0], ...rmuStarts.map(s => s.start[0])
                ]))
                rmuValues.forEach((r, i) => {
                    const rmuStart = rmuStarts[i]
                    const rmuEnd = rmuEnds[i]
                    const loadSwitch = p(r.loadSwitch?.key)

                    const earth = p(r.earth?.key)

                    const rmuThreadLineEles = [loadSwitch, earth, rmuEnd].filter(e => e) as { start: Point[], end: Point[] }[]

                    let preEnds = rmuStart.end
                    rmuThreadLineEles.forEach(el => {
                        g.add(wire([
                            preEnds[0], el.start[0]
                        ]))
                        preEnds = el.end
                    })
                })


                rmuEnds[0]?.end?.[0] && graphEnds.push(rmuEnds[0]?.end?.[0])
                rmuEnds[1]?.end?.[0] && graphEnds.push(rmuEnds[1]?.end?.[0])
            } else { // 非环网
                graphStarts.push(...mainStart.start)
                graphEnds.push(...mainEnds.map(e => e.end[0]))
            }

            return {
                start: graphStarts,
                end: graphEnds
            }
        })
    const { start: graphStarts, end: graphEnds, ele } = builder.build()

    return clickable(withLabel({
        origin: origin,
        start: graphStarts,
        end: graphEnds,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        ele
    }, props.options), {}, props.options);
}

export default padGraph