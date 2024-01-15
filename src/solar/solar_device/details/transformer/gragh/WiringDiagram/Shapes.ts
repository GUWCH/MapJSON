import Konva from "konva"
import { KonvaEventListener, Node } from "konva/lib/Node"
import { msgTag } from '@/common/lang';
const msg = msgTag("solartransformer");

const DEFAULT_COLOR = {
    WIRE: '#A1B2C2',
    SAFE: '#04C766',
    SAFE_HOVER: '#10EE7F',
    UNSAFE: '#FA465C',
    UNSAFE_HOVER: '#FF6A7C',
    MISSING: '#A1B2C2',
    WINDING: '#31C4F5',
    EARTH: '#FFFFFF',
    BREAKER_BTN: {
        TEXT: '#FFFFFF',
        ON: {
            FILL: 'rgba(30, 83, 102, 0.7)',
            STROKE: '#2D5F75'
        },
        OFF: {
            GRADIENT_START: '#3295AB',
            GRADIENT_END: '#124B5C'
        },
        MISSING: {
            FILL: '#3F6D85',
            STROKE: '#6A8CA3'
        }
    }
}


export enum ELEMENT_HEIGHT {
    BREAKER = 34,
    DISCONNECTOR = 54,
    DISCONNECTOR_WITH_EARTH = 56,
    EARTH_CONNECTOR = 0,
    LOAD_SWITCH = 49,
    TRANSFORMER = 59,
}

/**
 * 多入口、多出口按先从左到右再从上到下存入
 */
export type GraphNode = {
    in: Point
    out: Point[]
    ele: Konva.Shape | Konva.Group
}

export type Point = {
    x: number
    y: number
}
export const point = (x: number, y: number): Point => ({ x, y })

export enum SWITCH_STATE {
    OPEN = 0, CLOSE = 1, MISSING = -1
}

export type SwitchStateColorMap = Partial<{
    open: string, close: string, missing: string
}>
const mapSwitchStateToFillColor = (state: SWITCH_STATE, colorMap?: SwitchStateColorMap) => {
    switch (state) {
        case SWITCH_STATE.CLOSE: { return colorMap?.close || DEFAULT_COLOR.UNSAFE }
        case SWITCH_STATE.OPEN: { return colorMap?.open || DEFAULT_COLOR.SAFE }
        default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
    }
}
const mapSwitchStateToHoverColor = (
    state: SWITCH_STATE,
    colorMap?: SwitchStateColorMap) => {
    switch (state) {
        case SWITCH_STATE.CLOSE: { return colorMap?.close || DEFAULT_COLOR.UNSAFE_HOVER }
        case SWITCH_STATE.OPEN: { return colorMap?.open || DEFAULT_COLOR.SAFE_HOVER }
        default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
    }
}

export enum CONTROL_STATE {
    LOCAL = 0, REMOTE = 1, BROKEN = -1
}
export type BreakerColorMap = {
    fill: SwitchStateColorMap,
    hover: SwitchStateColorMap,
    button: Partial<{
        text: string
        on: {
            fill: string
            stroke: string
        },
        off: {
            gradientStart: string
            gradientEnd: string
        },
        missing: {
            fill: string
            stroke: string
        }
    }>
}
export const breaker = (
    start: Point,
    bState: SWITCH_STATE,
    cState: CONTROL_STATE,
    onClick: KonvaEventListener<Node, MouseEvent>,
    buttonPosition: 'left' | 'right',
    colors?: BreakerColorMap
): GraphNode => {
    const button = (o: Point, text: string, btnWidth: number, btnState: 'on' | 'off' | 'missing') => {
        const commonCfg = {
            id: 'test' + Math.random,
            name: 'testname',
            x: o.x,
            y: o.y,
            width: btnWidth,
            height: 16,
            cornerRadius: 2,
        }
        const g = new Konva.Group()

        switch (btnState) {
            case 'on': {
                g.add(
                    new Konva.Rect({
                        ...commonCfg,
                        width: commonCfg.width - 0.5,
                        height: commonCfg.height - 0.5,
                        fill: colors?.button?.on?.fill || DEFAULT_COLOR.BREAKER_BTN.ON.FILL,
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: 1,
                    }), new Konva.Line({ // 人造内阴影，Konva不支持内阴影
                        points: [o.x, o.y + 1, o.x, o.y + 15],
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: 0.5,
                        lineCap: 'round',
                        lineJoin: 'round',
                        shadowOffsetX: 1,
                        shadowColor: 'black',
                        shadowBlur: 4
                    }), new Konva.Line({
                        points: [o.x + 1, o.y, o.x + 31, o.y],
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: 0.5,
                        lineCap: 'round',
                        lineJoin: 'round',
                        shadowOffsetY: 1,
                        shadowColor: 'black',
                        shadowBlur: 4
                    })
                )
                break;
            }
            case 'off': {
                g.add(new Konva.Rect({
                    ...commonCfg,
                    fillLinearGradientStartPoint: { x: 0, y: 0 },
                    fillLinearGradientEndPoint: { x: 0, y: 16 },
                    fillLinearGradientColorStops: [
                        0, colors?.button?.off?.gradientStart || DEFAULT_COLOR.BREAKER_BTN.OFF.GRADIENT_START,
                        1, colors?.button?.off?.gradientEnd || DEFAULT_COLOR.BREAKER_BTN.OFF.GRADIENT_END
                    ]
                }))
                break;
            }
            default: {
                g.add(new Konva.Rect({
                    ...commonCfg,
                    fill: colors?.button?.missing?.fill || DEFAULT_COLOR.BREAKER_BTN.MISSING.FILL,
                    stroke: colors?.button?.missing?.stroke || DEFAULT_COLOR.BREAKER_BTN.MISSING.STROKE,
                    strokeWidth: 1
                }))
            }
        }

        const t = new Konva.Text({
            x: o.x,
            y: o.y + 4.5,
            width: btnWidth,
            fontSize: 8,
            fontFamily: 'PingFangSC-Medium, PingFang SC',
            text: text,
            align: 'center',
            fill: colors?.button?.text || DEFAULT_COLOR.BREAKER_BTN.TEXT
        })

        g.add(t)

        new Konva.Rect({
            x: o.x
        })
        return g
    }

    const group = new Konva.Group()

    let fill = mapSwitchStateToFillColor(bState, colors?.fill)
    let hoverFill = mapSwitchStateToHoverColor(bState, colors?.hover)
    const rect = new Konva.Rect({
        x: start.x - 7,
        y: start.y,
        width: 14,
        height: ELEMENT_HEIGHT.BREAKER,
        fill: fill,
        cornerRadius: 3,
    })

    rect.on("pointerenter", (ev) => {
        rect.fill(hoverFill)
        const bodyEle = document.getElementsByTagName("body")[0]
        bodyEle.style.cursor = "pointer"
    })
    rect.on("pointerleave", (ev) => {
        rect.fill(fill)
        const bodyEle = document.getElementsByTagName("body")[0]
        bodyEle.style.cursor = "default"
    })
    rect.on("click", onClick)

    const remoteText = msg('remote')
    const localText = msg('local')
    const btnWidth = remoteText.length > 2 || localText.length > 2 ? 48 : 32
    const buttonOriginX = start.x + (buttonPosition === 'left' ? -(btnWidth + 18) : 18)
    group.add(
        rect,
        button(point(buttonOriginX, start.y), remoteText, btnWidth, cState === CONTROL_STATE.REMOTE ? 'on' : (cState === CONTROL_STATE.LOCAL ? 'off' : 'missing')),
        button(point(buttonOriginX, start.y + 18), localText, btnWidth, cState === CONTROL_STATE.LOCAL ? 'on' : (cState === CONTROL_STATE.REMOTE ? 'off' : 'missing'))
    )

    return {
        in: start,
        out: [point(start.x, start.y + ELEMENT_HEIGHT.BREAKER)],
        ele: group,
    }
}

export type Wire = {
    start: Point
    end: Point
    ele: Konva.Line
}
export const wire = (points: Point[], stroke: string = DEFAULT_COLOR.WIRE): Wire => {
    if (points.length < 1) {
        throw new Error("a wire need at least one point to paint");
    }

    return {
        start: points[0],
        end: points[points.length - 1],
        ele: new Konva.Line({
            points: points.flatMap(p => [p.x, p.y]),
            stroke: stroke,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
        })
    }
}

const earth = (st: Point, stroke: string = DEFAULT_COLOR.EARTH): Konva.Group => {
    const g = new Konva.Group()
    const commonCfg = {
        stroke: stroke,
        strokeWidth: 2
    }
    g.add(
        new Konva.Line({ ...commonCfg, points: [st.x, st.y, st.x, st.y + 8] }),
        new Konva.Line({ ...commonCfg, points: [st.x - 6, st.y + 8, st.x + 6, st.y + 8] }),
        new Konva.Line({ ...commonCfg, points: [st.x - 4, st.y + 12, st.x + 4, st.y + 12] }),
        new Konva.Line({ ...commonCfg, points: [st.x - 2, st.y + 16, st.x + 2, st.y + 16] }),
    )
    return g
}

export type DisconnectorColorMap = {
    switch?: SwitchStateColorMap
    wire?: string
    earth?: string
}

/* 隔离开关 */
export const disconnector = (start: Point, state: SWITCH_STATE, colorMap?: DisconnectorColorMap): GraphNode => {
    const commonCfg = {
        stroke: mapSwitchStateToFillColor(state, colorMap?.switch),
        strokeWidth: 2
    }

    const g = new Konva.Group()
    g.add(
        new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y, start.x, start.y + 14, start.x - 3, start.y + 14, start.x + 3, start.y + 14]
        }),
        new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y + 34, start.x, start.y + ELEMENT_HEIGHT.DISCONNECTOR]
        })
    )

    if (state === SWITCH_STATE.OPEN) {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [start.x + 9, start.y + 14, start.x, start.y + 34]
        }))
    } else {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y + 14, start.x, start.y + 34]
        }))
    }
    return {
        in: start,
        out: [point(start.x, start.y + ELEMENT_HEIGHT.DISCONNECTOR)],
        ele: g,
    }
}

/* 带接地的隔离开关 */
export const disconnectorWithEarth = (start: Point, dState: SWITCH_STATE, eState: SWITCH_STATE, colorMap?: DisconnectorColorMap): GraphNode => {
    const g = new Konva.Group()

    g.add(
        wire([point(start.x + 27, start.y + 32), point(start.x + 27, start.y + 40)], colorMap?.wire).ele,
        earth(point(start.x + 27, start.y + 39), colorMap?.earth)
    )

    const switchCommonCfg = {
        stroke: mapSwitchStateToFillColor(dState),
        strokeWidth: 2
    }

    const earthCommonCfg = {
        stroke: mapSwitchStateToFillColor(eState),
        strokeWidth: 2
    }

    if (dState === SWITCH_STATE.CLOSE) {
        g.add(
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x, start.y, start.x, start.y + 56],
            }),
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x - 3, start.y + 18, start.x + 3, start.y + 18],
            }),
            new Konva.Line({
                ...earthCommonCfg,
                points: [start.x + 16, start.y + 24, start.x + 16, start.y + 32, start.x + 27, start.y + 32, start.x + 27, start.y + 40]
            })
        )
    } else if (eState === SWITCH_STATE.CLOSE) {
        g.add(
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x, start.y, start.x, start.y + 18],
            }),
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x - 3, start.y + 18, start.x + 3, start.y + 18],
            }),
            new Konva.Line({
                ...earthCommonCfg,
                points: [start.x + 16, start.y + 29, start.x + 16, start.y + 35],
            }),
            new Konva.Line({
                ...earthCommonCfg,
                points: [start.x, start.y + 56, start.x, start.y + 32, start.x + 27, start.y + 32, start.x + 27, start.y + 40]
            })
        )
    } else {
        g.add(
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x, start.y, start.x, start.y + 18],
            }),
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x - 3, start.y + 18, start.x + 3, start.y + 18],
            }),
            new Konva.Line({
                ...switchCommonCfg,
                points: [start.x + 11, start.y + 18, start.x, start.y + 40, start.x, start.y + ELEMENT_HEIGHT.DISCONNECTOR_WITH_EARTH],
            }),
            new Konva.Line({
                ...earthCommonCfg,
                points: [start.x + 16, start.y + 24, start.x + 16, start.y + 32, start.x + 27, start.y + 32, start.x + 27, start.y + 40]
            })
        )
    }

    return {
        in: start,
        out: [point(start.x, start.y + ELEMENT_HEIGHT.DISCONNECTOR_WITH_EARTH)],
        ele: g
    }
}
/* 接地开关 */
export const earthConnector = (start: Point, state: SWITCH_STATE, colorMap?: DisconnectorColorMap, paddingLeft: number = 20): GraphNode => {
    const commonCfg = {
        stroke: mapSwitchStateToFillColor(state, colorMap?.switch),
        strokeWidth: 2
    }
    const g = new Konva.Group()
    const eleHeight = ELEMENT_HEIGHT.EARTH_CONNECTOR
    const originPoint = point(start.x + paddingLeft, start.y + eleHeight)
    g.add(
        wire([point(start.x, start.y), point(start.x, start.y + eleHeight)], colorMap?.wire).ele,
        wire([point(start.x, originPoint.y), originPoint], colorMap?.wire).ele,
        new Konva.Line({
            ...commonCfg,
            points: [originPoint.x, originPoint.y, originPoint.x, originPoint.y + 14, originPoint.x - 3, originPoint.y + 14, originPoint.x + 3, originPoint.y + 14]
        }),
        new Konva.Line({
            ...commonCfg,
            points: [originPoint.x, originPoint.y + 34, originPoint.x, originPoint.y + 54]
        }),
        earth(point(originPoint.x, originPoint.y + 54), colorMap?.earth)
    )

    if (state === SWITCH_STATE.OPEN) {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [originPoint.x + 9, originPoint.y + 14, originPoint.x, originPoint.y + 34]
        }))
    } else {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [originPoint.x, originPoint.y + 14, originPoint.x, originPoint.y + 34]
        }))
    }
    return {
        in: start,
        out: [point(start.x, start.y + eleHeight)],
        ele: g
    }
}

/* 负荷开关 */
export const loadSwitch = (start: Point, state: SWITCH_STATE, colorMap?: SwitchStateColorMap): GraphNode => {

    const commonCfg = {
        stroke: mapSwitchStateToFillColor(state, colorMap),
        strokeWidth: 2
    }

    const g = new Konva.Group()
    g.add(
        new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y, start.x, start.y + 7, start.x - 6, start.y + 7, start.x + 6, start.y + 7],
        }),
        new Konva.Circle({
            ...commonCfg,
            x: start.x,
            y: start.y + 10,
            radius: 3
        }),
        new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y + 29, start.x, start.y + ELEMENT_HEIGHT.LOAD_SWITCH]
        })
    )

    if (state === SWITCH_STATE.OPEN) {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [start.x - 9, start.y + 9, start.x, start.y + 29]
        }))
    } else {
        g.add(new Konva.Line({
            ...commonCfg,
            points: [start.x, start.y + 13, start.x, start.y + 29]
        }))
    }

    return {
        in: start,
        out: [point(start.x, start.y + ELEMENT_HEIGHT.LOAD_SWITCH)],
        ele: g
    }
}

const winding = (o: Point, type: 'triangle' | 'star', stroke: string = DEFAULT_COLOR.WINDING): Konva.Group => {
    const g = new Konva.Group()
    const color = stroke
    const lineWidth = 1.89
    const radius = 16
    const commonCfg = {
        radius: radius,
        stroke: color,
        strokeWidth: lineWidth
    }
    g.add(new Konva.Circle({
        ...commonCfg,
        x: o.x,
        y: o.y
    }), type === 'triangle' ? new Konva.Line({
        points: [o.x, o.y - 6.5, o.x - 6.5, o.y + 5.5, o.x + 6.5, o.y + 5.5],
        stroke: color,
        strokeWidth: lineWidth,
        closed: true
    }) : new Konva.Line({
        points: [o.x, o.y, o.x - 6.5, o.y - 6, o.x, o.y, o.x + 6.5, o.y - 6, o.x, o.y, o.x, o.y + 10],
        stroke: color,
        strokeWidth: lineWidth
    }))

    return g
}

export const threeWindingTransformer = (start: Point, stroke?: string): GraphNode => {
    const g = new Konva.Group()
    g.add(
        winding(point(start.x, start.y + 16), 'triangle', stroke),
        winding(point(start.x - 14, start.y + 41), 'star', stroke),
        winding(point(start.x + 14, start.y + 41), 'star', stroke)
    )

    return {
        in: start,
        out: [point(start.x - 14, start.y + 59), point(start.x + 14, start.y + ELEMENT_HEIGHT.TRANSFORMER)],
        ele: g
    }
}
export const doubleWindingTransformer = (start: Point, stroke?: string): GraphNode => {
    const g = new Konva.Group()
    g.add(
        winding(point(start.x, start.y + 16), 'triangle', stroke),
        winding(point(start.x, start.y + 42), 'star', stroke)
    )
    return {
        in: start,
        out: [point(start.x, start.y + ELEMENT_HEIGHT.TRANSFORMER)],
        ele: g
    }
}