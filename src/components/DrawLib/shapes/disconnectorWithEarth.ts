import { bindClick, bindHover } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { SWITCH_STATE } from "../constant"
import { ShapeElement, ShapeProps, SwitchColors } from "../model"
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapIDynToSwitchState, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils"
import earth, { EarthOptions } from "./earth"
import label from "./label"

export type DisconnectorWithEarthState = {
    disconnector: SWITCH_STATE,
    earth: SWITCH_STATE
}
export type DisconnectorWithEarthOptions = {
    switch?: SwitchColors,
    earthKey?: string,
    disconnectorKey?: string
    disconnectorName?: string
    earthConnectorName?: string
    hoverMark?: {
        earth: string
        disconn: string
    }
} & EarthOptions
const disconnectorWithEarth = (props: ShapeProps<DisconnectorWithEarthState, DisconnectorWithEarthOptions>): ShapeElement => {
    const { disconnector: dState, earth: eState } = props.state
    const originStart = props.start[0]
    const wireWidth = props.options.wireWidth || 2
    const designRect = {
        width: 34,
        height: 56
    }
    const { earthKey: eKey, disconnectorKey: dKey, stateConsumerRegister } = props.options
    const {
        scaleX: scale,
        containerHeight,
        containerWidth,
        actualEleHeight,
        actualEleWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        width: actualEleWidth,
        height: actualEleHeight,
        switchStartOffsetY: 18 * scale,
        switchStartBarWidth: 6 * scale,
        switchBarHeight: 22 * scale,
        switchBarWidth: 16 * scale,
        switchBarEndToSwitchEnd: 16 * scale,
        earthOriginOffsetX: 16 * scale,
        earthOriginOffsetY: 32 * scale,
        earthOffsetX: 27 * scale,
        earthOffsetY: 40 * scale,
        labelMargin: 2 * scale,
        labelWidth: 90 * scale
    }
    const extendWireLength = Math.max((containerHeight - size.height) / 2, 0)

    const inP = point(
        originStart.x + (props.options.startType === 'origin' ? containerWidth / 2 : 0),
        originStart.y
    )
    const start = point(inP.x, inP.y + extendWireLength)
    const eleArr: (Konva.Group | Konva.Shape)[] = []
    eleArr.push(wire([
        point(start.x + size.earthOffsetX, start.y + size.earthOriginOffsetY),
        point(start.x + size.earthOffsetX, start.y + size.earthOffsetY)
    ], wireWidth, props.options.wireColor))
    eleArr.push(
        earth({
            start: [point(start.x + size.earthOffsetX, start.y + size.earthOffsetY)],
            state: undefined,
            rect: {
                height: size.height - size.earthOffsetY
            },
            options: props.options
        }).ele
    )

    const stateToColor = (dState: SWITCH_STATE, eState: SWITCH_STATE) => ({
        dStroke: mapSwitchStateToFillColor(dState, props.options.switch),
        dHoverStroke: mapSwitchStateToHoverColor(dState),
        eStroke: mapSwitchStateToFillColor(eState, props.options.switch),
        eHoverStroke: mapSwitchStateToHoverColor(eState)
    })

    const _state = {
        ...stateToColor(dState, eState),
        eState, dState
    }

    const sStroke = _state.dStroke
    const switchCommonCfg = {
        perfectDrawEnabled: false,
        stroke: sStroke,
        hitStrokeWidth: wireWidth * 5,
        strokeWidth: wireWidth
    }

    const eStroke = _state.eStroke
    const earthCommonCfg = {
        perfectDrawEnabled: false,
        stroke: eStroke,
        hitStrokeWidth: wireWidth * 5,
        strokeWidth: wireWidth
    }

    const disconnectorLines: Konva.Line[] = []
    const earthLines: Konva.Line[] = []
    const line_d_connected: Konva.Line[] = []
    const line_e_connected: Konva.Line[] = []
    const line_other: Konva.Line[] = []

    // dState === SWITCH_STATE.CONNECTED) 
    const d_c_line1 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x, start.y,
            start.x, start.y + size.height],
    })
    const d_c_line2 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x - size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
            start.x + size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY],
    })
    const d_c_line3 = new Konva.Line({
        ...earthCommonCfg,
        points: [
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY - size.switchStartBarWidth / 2,
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOffsetY]
    })
    disconnectorLines.push(
        d_c_line1, d_c_line2
    )
    earthLines.push(d_c_line3)
    line_d_connected.push(
        d_c_line1, d_c_line2, d_c_line3
    )

    // eState === SWITCH_STATE.CONNECTED
    const e_c_line1 = new Konva.Line({
        ...switchCommonCfg,
        points: [start.x, start.y, start.x, start.y + size.switchStartOffsetY],
    })
    const e_c_line2 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x - size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
            start.x + size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY],
    })

    disconnectorLines.push(e_c_line1, e_c_line2)

    const e_c_line3 = new Konva.Line({
        ...earthCommonCfg,
        points: [
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY - size.switchStartBarWidth / 2,
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY + size.switchStartBarWidth / 2],
    })
    const e_c_line4 = new Konva.Line({
        ...earthCommonCfg,
        points: [
            start.x, start.y + size.height,
            start.x, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOffsetY]
    })
    earthLines.push(e_c_line3, e_c_line4)
    line_e_connected.push(e_c_line1, e_c_line2, e_c_line3, e_c_line4)

    // other
    const o_line1 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x, start.y,
            start.x, start.y + size.switchStartOffsetY
        ],
    })
    const o_line2 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x - size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
            start.x + size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY
        ],
    })
    const o_line3 = new Konva.Line({
        ...switchCommonCfg,
        points: [
            start.x + size.switchBarWidth / 2, start.y + size.switchStartOffsetY,
            start.x, start.y + size.switchStartOffsetY + size.switchBarHeight,
            start.x, start.y + size.height],
    })
    disconnectorLines.push(o_line1, o_line2, o_line3)
    const o_line4 = new Konva.Line({
        ...earthCommonCfg,
        points: [
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY - size.switchStartBarWidth,
            start.x + size.earthOriginOffsetX, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOriginOffsetY,
            start.x + size.earthOffsetX, start.y + size.earthOffsetY
        ]
    })
    earthLines.push(o_line4)
    line_other.push(o_line1, o_line2, o_line3, o_line4)

    const onStateChange = (dState: SWITCH_STATE, eState: SWITCH_STATE) => {
        const { dStroke, dHoverStroke, eStroke, eHoverStroke } = stateToColor(dState, eState)
        _state.dStroke = dStroke
        _state.dHoverStroke = dHoverStroke
        _state.dState = dState
        _state.eStroke = eStroke
        _state.eHoverStroke = eHoverStroke
        _state.eState = eState

        line_d_connected.forEach(l => l.visible(dState === SWITCH_STATE.CONNECTED))
        line_e_connected.forEach(l => l.visible(eState === SWITCH_STATE.CONNECTED))
        line_other.forEach(l => l.visible(eState !== SWITCH_STATE.CONNECTED && dState !== SWITCH_STATE.CONNECTED))
        earthLines.forEach(l => l.stroke(eStroke))
        disconnectorLines.forEach(l => l.stroke(dStroke))
    }
    onStateChange(_state.dState, _state.eState)

    eKey && stateConsumerRegister && stateConsumerRegister(eKey, (newState: IDyn | undefined) => {
        const state = mapIDynToSwitchState(newState)
        const newEState = state
        const newDState = _state.dState
        onStateChange(newDState, newEState)
    })
    dKey && stateConsumerRegister && stateConsumerRegister(dKey, (newState: IDyn | undefined) => {
        const state = mapIDynToSwitchState(newState)
        const newEState = _state.eState
        const newDState = state
        onStateChange(newDState, newEState)
    })

    const disconnectorHitGroup = new Konva.Group()
    disconnectorHitGroup.add(...disconnectorLines)
    const earthHitGroup = new Konva.Group()
    earthHitGroup.add(...earthLines)
    eleArr.push(disconnectorHitGroup, earthHitGroup)

    bindHover(disconnectorHitGroup, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.disconn
                }
            })
            disconnectorLines.forEach(l => l.stroke(_state.dHoverStroke))
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.disconn
                }
            })
            disconnectorLines.forEach(l => l.stroke(_state.dStroke))
        },
    }, {
        key: dKey,
        eventHandlers: props.options?.eventHandlers
    })

    bindClick(disconnectorHitGroup, {}, {
        key: dKey,
        eventHandlers: {
            click: props.options?.eventHandlers?.click,
        }
    })


    bindHover(earthHitGroup, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.earth
                }
            })
            earthLines.forEach(l => l.stroke(_state.eHoverStroke))
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.earth
                }
            })
            earthLines.forEach(l => l.stroke(_state.eStroke))
        },
    }, {
        key: eKey,
        eventHandlers: props.options?.eventHandlers
    })

    bindClick(earthHitGroup, {}, {
        key: eKey,
        eventHandlers: {
            click: props.options?.eventHandlers?.click,
        }
    })

    const g = new Konva.Group()

    if (extendWireLength > 0) {
        eleArr.unshift(wire([
            inP,
            start
        ]))
        eleArr.push(wire([
            point(start.x, start.y + size.height),
            point(start.x, start.y + size.height + extendWireLength)
        ]))
    }

    if (props.options.label) {
        const eLabel = label({
            state: props.options.earthConnectorName ?? '',
            start: [point(start.x + size.labelMargin, start.y + size.earthOriginOffsetY + size.earthOffsetY)],
            rect: { width: size.labelWidth },
            options: {
                key: eKey,
                fontSize: props.options.label.fontSize,
                editable: props.options.label.editable,
                stateConsumerRegister
            }
        }).ele
        g.add(eLabel)
    }

    if (props.options.label) {
        const dLabel = label({
            state: props.options.disconnectorName ?? '',
            start: [point(start.x + size.labelMargin, start.y)],
            rect: { width: size.labelWidth },
            options: {
                key: dKey,
                fontSize: props.options.label.fontSize,
                editable: props.options.label.editable,
                stateConsumerRegister
            }
        }).ele
        g.add(dLabel)
    }

    g.add(...eleArr)
    return {
        origin: point(inP.x - actualEleWidth / 2, inP.y),
        start: [inP],
        end: [point(inP.x, inP.y + containerHeight)],
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        ele: g
    }
}

export default disconnectorWithEarth