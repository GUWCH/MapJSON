import { withLabel } from "DrawLib/wrapper/additionalEleWrapper"
import { bindClick, bindHover } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { SWITCH_STATE } from "../constant"
import { Point, ShapeElement, ShapeProps, SwitchColors } from "../model"
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapIDynToSwitchState, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils"

export type DisconnectorState = SWITCH_STATE
export type DisconnectorOptions = {
    colors?: DisconnectorColors
    hoverMark?: string
}
export type DisconnectorColors = {
    switch?: SwitchColors
    earth?: string
}

/* 隔离开关 */
const disconnector: (props: ShapeProps<DisconnectorState, DisconnectorOptions>) => ShapeElement = (props) => {
    const originStart = props.start[0]
    const state = props.state
    const colors = props.options.colors
    const wireWidth = props.options.wireWidth || 2
    const { key, stateConsumerRegister } = props.options

    const stateToColor = (state: SWITCH_STATE) => ({
        fill: mapSwitchStateToFillColor(state, colors?.switch),
        hoverFill: mapSwitchStateToHoverColor(state)
    })
    const _state = stateToColor(state)

    const designRect = {
        height: 54,
        width: 9,
    }

    const {
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth,
        scaleX: scale
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })


    const size = {
        height: designRect.height * scale,
        width: designRect.width * scale,
        switchMargin: 15 * scale,
        switchStartMarkWidth: 6 * scale,
        switchBarHeight: 24 * scale,
    }
    const extendWireLength = (containerHeight - size.height) / 2

    const commonCfg = {
        perfectDrawEnabled: false,
        hitStrokeWidth: wireWidth * 5,
        stroke: _state.fill,
        strokeWidth: wireWidth
    }

    const inP: Point = point(
        originStart.x + (props.options.startType === 'origin' ? containerWidth / 2 : 0),
        originStart.y
    )
    const start = point(inP.x, inP.y + extendWireLength)

    const g = new Konva.Group()
    const eleArr: Konva.Line[] = []
    eleArr.push(new Konva.Line({
        ...commonCfg,
        points: [
            start.x, start.y,
            start.x, start.y + size.switchMargin,
            start.x - size.switchStartMarkWidth / 2, start.y + size.switchMargin,
            start.x + size.switchStartMarkWidth / 2, start.y + size.switchMargin
        ]
    }))
    eleArr.push(new Konva.Line({
        ...commonCfg,
        points: [
            start.x, start.y + size.switchBarHeight + size.switchMargin,
            start.x, start.y + size.switchBarHeight + size.switchMargin * 2]
    }))

    const bar_separated = new Konva.Line({
        ...commonCfg,
        points: [
            start.x + size.width, start.y + size.switchMargin,
            start.x, start.y + size.switchBarHeight + size.switchMargin
        ]
    })
    const bar_connected = new Konva.Line({
        ...commonCfg,
        points: [
            start.x, start.y + size.switchMargin,
            start.x, start.y + size.switchBarHeight + size.switchMargin
        ]
    })

    const changeBarOpacity = (state: SWITCH_STATE) => {
        bar_connected.opacity(state === SWITCH_STATE.CONNECTED ? 1 : 0)
        bar_separated.opacity(state === SWITCH_STATE.CONNECTED ? 0 : 1)
    }

    changeBarOpacity(state)
    const hitGroup = new Konva.Group()
    hitGroup.add(...eleArr, bar_separated, bar_connected)

    key && stateConsumerRegister && stateConsumerRegister(key, (newState: IDyn | undefined) => {
        const state = mapIDynToSwitchState(newState)
        const { fill, hoverFill } = stateToColor(state)
        _state.fill = fill
        _state.hoverFill = hoverFill
        eleArr.forEach(l => l.stroke(fill))
        bar_connected.stroke(fill)
        bar_separated.stroke(fill)
        changeBarOpacity(state)
    })

    bindHover(hitGroup, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            eleArr.forEach(line => {
                line.stroke(_state.hoverFill)
            })
            bar_connected.stroke(_state.hoverFill)
            bar_separated.stroke(_state.hoverFill)
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            eleArr.forEach(line => {
                line.stroke(_state.fill)
            })
            bar_connected.stroke(_state.fill)
            bar_separated.stroke(_state.fill)
        }
    }, props.options)

    bindClick(hitGroup, {}, props.options)

    g.add(hitGroup)

    if (extendWireLength > 0) {
        g.add(
            wire([inP, start], wireWidth, props.options.wireColor),
            wire([
                point(start.x, start.y + size.height),
                point(start.x, start.y + size.height + extendWireLength)
            ])
        )
    }

    return withLabel({
        origin: point(inP.x - actualEleWidth / 2, inP.y),
        start: [inP],
        end: [point(inP.x, inP.y + containerHeight)],
        ele: g,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }, props.options)
}

export default disconnector