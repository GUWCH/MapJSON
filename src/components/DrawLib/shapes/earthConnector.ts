import { withLabel } from "DrawLib/wrapper/additionalEleWrapper"
import { bindClick, bindHover } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { SWITCH_STATE } from "../constant"
import { ShapeElement, ShapeProps, SwitchColors } from "../model"
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapIDynToSwitchState, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils"
import earth, { EarthOptions } from "./earth"

export type EarthConnectorState = SWITCH_STATE
export type EarthConnectorOptions = {
    size?: 'big' | 'small'
    switch?: SwitchColors
    hoverMark?: string
} & EarthOptions
/* 接地开关 */
const earthConnector: (props: ShapeProps<EarthConnectorState, EarthConnectorOptions>) => ShapeElement = (props) => {
    const wireWidth = props.options.wireWidth || 2
    const originStart = props.start[0]
    const isBig = props.options.size === 'big'

    const designRect = {
        width: isBig ? 40 : 20,
        height: 10
    }

    const {
        scaleX: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })
    const extendWireLength = Math.max((containerHeight - actualEleHeight) / 2, 0)
    const size = {
        endOffsetY: actualEleHeight,
        width: actualEleWidth,
        switchStartOffsetY: 14 * scale,
        switchStartBarWidth: 6 * scale,
        switchBarWidth: 8 * scale,
        switchBarHeight: 20 * scale,
        earthOffsetX: (isBig ? 40 : 20) * scale,
        earthOffsetY: 54 * scale,
        earthWidth: 12 * scale,
        earthHeight: 16 * scale,
    }

    const stateToColor = (state: EarthConnectorState) => {
        return {
            stroke: mapSwitchStateToFillColor(state, props.options.switch),
            hoverStroke: mapSwitchStateToHoverColor(state)
        }
    }
    const _state = stateToColor(props.state)

    const commonCfg = {
        perfectDrawEnabled: false,
        stroke: _state.stroke,
        strokeWidth: wireWidth,
        hitStrokeWidth: wireWidth * 5
    }
    const g = new Konva.Group()

    const inP = point(
        originStart.x + (props.options.startType === 'origin' ? containerWidth / 2 : 0),
        originStart.y
    )

    const start = point(inP.x, inP.y + extendWireLength)

    const end = point(start.x, start.y + size.endOffsetY)
    if (extendWireLength > 0) {
        g.add(
            wire([inP, start], wireWidth, props.options.wireColor)
        )
        g.add(wire([end, point(end.x, end.y + extendWireLength)], wireWidth, props.options.wireColor))
    }
    const earthLines: Konva.Line[] = []
    const barLine_close = new Konva.Line({
        ...commonCfg,
        visible: props.state !== SWITCH_STATE.SEPARATED,
        points: [
            start.x + size.earthOffsetX,
            start.y + size.switchStartOffsetY,
            start.x + size.earthOffsetX, start.y + size.switchStartOffsetY + size.switchBarHeight]
    })
    const barLine_sep = new Konva.Line({
        ...commonCfg,
        visible: props.state === SWITCH_STATE.SEPARATED,
        points: [
            start.x + size.earthOffsetX + size.switchBarWidth,
            start.y + size.switchStartOffsetY,
            start.x + size.earthOffsetX, start.y + size.switchStartOffsetY + size.switchBarHeight]
    })

    earthLines.push(
        new Konva.Line({
            ...commonCfg,
            points: [
                start.x + size.earthOffsetX, start.y,
                start.x + size.earthOffsetX, start.y + size.switchStartOffsetY,
                start.x + size.earthOffsetX - size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
                start.x + size.earthOffsetX + size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
            ]
        }),
        new Konva.Line({
            ...commonCfg,
            points: [
                start.x + size.earthOffsetX, start.y + size.switchStartOffsetY + size.switchBarHeight,
                start.x + size.earthOffsetX, start.y + size.earthOffsetY]
        }),
        barLine_sep,
        barLine_close)
    const earthHitGroup = new Konva.Group()
    earthHitGroup.add(...earthLines)

    if (props.options.key && props.options.stateConsumerRegister) {
        props.options.stateConsumerRegister(props.options.key, (newState: IDyn | undefined) => {
            const state = mapIDynToSwitchState(newState)
            const { stroke, hoverStroke } = stateToColor(state)
            _state.stroke = stroke
            _state.hoverStroke = hoverStroke
            earthLines.forEach(l => l.stroke(stroke))
            if (state === SWITCH_STATE.SEPARATED) {
                barLine_close.visible(false)
                barLine_sep.visible(true)
            } else {
                barLine_close.visible(true)
                barLine_sep.visible(false)
            }
        })
    }

    bindHover(earthHitGroup, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            earthLines.forEach(l => l.stroke(_state.hoverStroke))
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            earthLines.forEach(l => l.stroke(_state.stroke))
        }
    }, props.options)

    bindClick(earthHitGroup, {}, props.options)

    g.add(
        wire([start, point(start.x + size.earthOffsetX, start.y)], wireWidth, props.options.wireColor),
        wire([start, end], wireWidth, props.options.wireColor),
        earth({
            start: [point(start.x + size.earthOffsetX, start.y + size.earthOffsetY)],
            state: undefined,
            rect: {
                width: size.earthWidth,
                height: size.earthHeight
            },
            options: props.options
        }).ele,
        earthHitGroup
    )

    return withLabel({
        origin: point(inP.x - actualEleWidth / 2, inP.y),
        start: [inP],
        end: [end],
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        ele: g
    }, {
        stateConsumerRegister: props.options.stateConsumerRegister,
        key: props.options.key,
        label: props.options.label ? {
            ...props.options.label,
            position: 'top',
        } : undefined,
    })
}

export default earthConnector