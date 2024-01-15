import { withLabel } from "DrawLib/wrapper/additionalEleWrapper"
import { bindClick, bindHover } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { SWITCH_STATE } from "../constant"
import { ShapeElement, ShapeProps, SwitchColors } from "../model"
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapIDynToSwitchState, mapRawValueToSwitchState, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils"

export type LoadSwitchState = SWITCH_STATE
export type LoadSwitchOptions = { switch?: SwitchColors, hoverMark?: string }

/* 负荷开关 */
export const loadSwitch: (props: ShapeProps<LoadSwitchState, LoadSwitchOptions>) => ShapeElement = (props) => {
    const _state = {
        value: props.state
    }
    const { key, stateConsumerRegister } = props.options
    const originStart = props.start[0]
    const wireWidth = props.options.wireWidth || 2

    const designRect = {
        width: 22,
        height: 50
    }

    const {
        scaleX: scale,
        containerHeight,
        containerWidth,
        actualEleHeight,
        actualEleWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        width: designRect.width * scale,
        height: designRect.height * scale,
        switchStartOffsetY: 7 * scale,
        switchStartBarWidth: 12 * scale,
        switchStartCircleRadius: 3 * scale,
        switchBarWidth: 12 * scale,
        switchBarHeight: 30 * scale,
    }
    const extendWireLength = Math.max((containerHeight - size.height) / 2, 0)

    const inP = point(
        originStart.x + (props.options.startType === 'origin' ? containerWidth / 2 : 0),
        originStart.y
    )
    const start = point(inP.x, inP.y + extendWireLength / 2)

    const end = point(start.x, inP.y + containerHeight)
    const stroke = mapSwitchStateToFillColor(_state.value, props.options.switch)
    const hoverStroke = mapSwitchStateToHoverColor(_state.value)
    const commonCfg = {
        perfectDrawEnabled: false,
        stroke: stroke,
        strokeWidth: wireWidth,
        hitStrokeWidth: wireWidth * 5,
    }

    const g = new Konva.Group()

    if (extendWireLength > 0) {
        g.add(
            wire([inP, start]),
            wire([
                point(start.x, start.y + size.height),
                end
            ])
        )
    }

    const hitShapes: Konva.Shape[] = []
    hitShapes.push(
        new Konva.Line({
            ...commonCfg,
            points: [
                start.x, start.y,
                start.x, start.y + size.switchStartOffsetY,
                start.x - size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY,
                start.x + size.switchStartBarWidth / 2, start.y + size.switchStartOffsetY],
        }),
        new Konva.Circle({
            ...commonCfg,
            x: start.x,
            y: start.y + size.switchStartOffsetY + size.switchStartCircleRadius,
            radius: size.switchStartCircleRadius
        }),
        new Konva.Line({
            ...commonCfg,
            points: [
                start.x, start.y + size.switchStartOffsetY + size.switchBarHeight,
                start.x, start.y + size.height
            ]
        })
    )

    const barLine_separated = new Konva.Line({
        ...commonCfg,
        points: [
            start.x - size.switchBarWidth, start.y + size.switchStartOffsetY,
            start.x, start.y + size.switchStartOffsetY + size.switchBarHeight
        ]
    })
    const barLine_other = new Konva.Line({
        ...commonCfg,
        points: [
            start.x, start.y + size.switchStartOffsetY + size.switchStartCircleRadius * 2,
            start.x, start.y + size.height
        ]
    })
    hitShapes.push(barLine_separated, barLine_other)

    const onStateChange = (newState: SWITCH_STATE) => {
        _state.value = newState
        barLine_separated.visible(newState === SWITCH_STATE.SEPARATED)
        barLine_other.visible(newState !== SWITCH_STATE.SEPARATED)
        hitShapes.forEach(s => s.stroke(mapSwitchStateToFillColor(newState, props.options.switch)))
    }
    onStateChange(props.state)

    key && stateConsumerRegister && stateConsumerRegister(key, (dyn: IDyn | undefined) => {
        const state = mapIDynToSwitchState(dyn)
        onStateChange(state)
    })

    const hitGroup = new Konva.Group()
    hitGroup.add(...hitShapes)

    bindHover(hitGroup, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            hitShapes.forEach(s => s.stroke(mapSwitchStateToHoverColor(_state.value)))
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark
                }
            })
            hitShapes.forEach(s => s.stroke(mapSwitchStateToFillColor(_state.value, props.options.switch)))
        },
    }, props.options)
    bindClick(hitGroup, {}, props.options)

    g.add(hitGroup)

    return withLabel({
        origin: point(inP.x - size.switchBarWidth, inP.y),
        start: [inP],
        end: [end],
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        ele: g
    }, {
        ...props.options, label: {
            text: '',
            ...props.options.label,
            margin: 0
        }
    })
}

export default loadSwitch