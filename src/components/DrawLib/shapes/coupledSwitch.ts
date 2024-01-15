import { clickable } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { DEFAULT_COLOR, SWITCH_STATE } from "../constant"
import { ShapeElement, ShapeProps } from "../model"
import { calcEleActualRect, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from '../utils'

export type CoupledSwitchState = SWITCH_STATE
export type CoupledSwitchOptions = {
}


// 联动开关 --以横线中点作为起点, 出口点有两个
const coupledSwitch = (props: ShapeProps<CoupledSwitchState, CoupledSwitchOptions>): ShapeElement => {
    const originStart = props.start[0]
    const stateToColor = (state: SWITCH_STATE) => ({
        stroke: mapSwitchStateToFillColor(state),
        hoverStroke: mapSwitchStateToHoverColor(state)
    })

    const _state = stateToColor(props.state)
    const { key, stateConsumerRegister } = props.options

    const designRect = {
        width: 72,
        height: 43
    }

    const {
        scaleX: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })
    const extendWireLength = containerHeight - actualEleHeight
    const start = { x: originStart.x, y: originStart.y + extendWireLength }

    const group = new Konva.Group()

    const size = {
        topLineLength: designRect.width * scale,
        eleHeight: designRect.height * scale,
        lineHight: 6 * scale,
        shortLineLength: 12 * scale,
        cirleStartHeight: 10 * scale,
        cirleRadius: 3 * scale,
        switchHalfHeight: 33 * scale,
        switchBottomHeight: 43 * scale,
        dashLineHeight: 24 * scale,
        switchOffsetX: 2 * scale
    }

    const topLine = new Konva.Shape({
        sceneFunc: function (context, shape) {
            context.beginPath();
            context.moveTo(start.x - size.topLineLength / 2, start.y);
            context.lineTo(start.x + size.topLineLength / 2, start.y);
            context.moveTo(start.x - size.topLineLength / 4, start.y);
            context.lineTo(start.x - size.topLineLength / 4, start.y + size.lineHight);
            context.moveTo(start.x + size.topLineLength / 4, start.y);
            context.lineTo(start.x + size.topLineLength / 4, start.y + size.lineHight);

            context.fillStrokeShape(shape);
        },
        stroke: DEFAULT_COLOR.WIRE,
        strokeWidth: 2
    })

    const hoverShapes: Konva.Shape[] = []

    const leftCircle = new Konva.Circle({
        x: start.x - size.topLineLength / 4,
        y: start.y + size.cirleStartHeight + size.cirleRadius,
        radius: size.cirleRadius,
        stroke: _state.stroke,
        strokeWidth: 2
    })
    const leftShorttLine = wire([
        point(start.x - size.topLineLength / 4 - size.shortLineLength / 2, start.y + size.cirleStartHeight),
        point(start.x - size.topLineLength / 4 + size.shortLineLength / 2, start.y + size.cirleStartHeight)
    ], props.options.wireWidth, _state.stroke)

    const rightShortLine = wire([
        point(start.x + size.topLineLength / 4 - size.shortLineLength / 2, start.y + size.cirleStartHeight),
        point(start.x + size.topLineLength / 4 + size.shortLineLength / 2, start.y + size.cirleStartHeight)
    ], props.options.wireWidth, _state.stroke)
    const rightCircle = new Konva.Circle({
        x: start.x + size.topLineLength / 4,
        y: start.y + size.cirleStartHeight + size.cirleRadius,
        radius: size.cirleRadius,
        stroke: _state.stroke,
        strokeWidth: 2
    })

    const switchLine_connected = [
        wire([
            point(start.x - size.topLineLength / 4, start.y + size.cirleStartHeight + size.cirleRadius * 2),
            point(start.x - size.topLineLength / 4, start.y + size.switchBottomHeight)
        ], props.options.wireWidth, _state.stroke),
        wire([
            point(start.x + size.topLineLength / 4, start.y + size.cirleStartHeight + size.cirleRadius * 2),
            point(start.x + size.topLineLength / 4, start.y + size.switchBottomHeight)
        ], props.options.wireWidth, _state.stroke),
        wire([
            point(start.x - size.topLineLength / 4 + size.switchOffsetX, start.y + size.dashLineHeight),
            point(start.x + size.topLineLength / 4 - size.switchOffsetX, start.y + size.dashLineHeight)
        ], props.options.wireWidth, _state.stroke)
    ]
    const switchLine_separated_missing = [
        wire([
            point(start.x - size.topLineLength / 4 - size.topLineLength / 8, start.y + size.cirleStartHeight + size.cirleRadius),
            point(start.x - size.topLineLength / 4, start.y + size.switchHalfHeight), point(start.x - size.topLineLength / 4, start.y + size.switchBottomHeight)
        ], props.options.wireWidth, _state.stroke),
        wire([
            point(start.x + size.topLineLength / 4 - size.topLineLength / 8, start.y + size.cirleStartHeight + size.cirleRadius),
            point(start.x + size.topLineLength / 4, start.y + size.switchHalfHeight), point(start.x + size.topLineLength / 4, start.y + size.switchBottomHeight)
        ], props.options.wireWidth, _state.stroke),
        wire([
            point(start.x - size.topLineLength / 4 - size.switchOffsetX * 2, start.y + size.dashLineHeight),
            point(start.x + size.topLineLength / 4 - size.switchOffsetX * 2, start.y + size.dashLineHeight)
        ], props.options.wireWidth, _state.stroke)
    ]

    const changeSwitchLineOpacity = (state: SWITCH_STATE) => {
        switchLine_separated_missing.forEach(l => l.opacity(state === SWITCH_STATE.CONNECTED ? 0 : 1))
        switchLine_connected.forEach(l => l.opacity(state === SWITCH_STATE.CONNECTED ? 1 : 0))
    }

    hoverShapes.push(leftCircle, rightCircle, leftShorttLine, rightShortLine, ...switchLine_separated_missing, ...switchLine_connected)
    key && stateConsumerRegister && stateConsumerRegister(key, (newState) => {
        const { stroke, hoverStroke } = stateToColor(newState)
        _state.stroke = stroke
        _state.hoverStroke = hoverStroke
        hoverShapes.forEach(s => s.stroke(_state.stroke))
        changeSwitchLineOpacity(newState)
    })
    
    changeSwitchLineOpacity(props.state)
    group.add(topLine, leftCircle, rightCircle, leftShorttLine, rightShortLine, ...switchLine_separated_missing, ...switchLine_connected)

    if (extendWireLength > 0) {
        const startWire = wire([
            originStart, start
        ], props.options.wireWidth, props.options.wireColor)
        group.add(startWire)
    }

    return clickable({
        origin: point(originStart.x - actualEleWidth / 2, originStart.y),
        start: [originStart],
        end: [
            point((start.x - size.topLineLength / 4), (start.y + size.eleHeight)),
            point((start.x + size.topLineLength / 4), (start.y + size.eleHeight))
        ],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }, {
        movein: () => hoverShapes.forEach(s => s.stroke(_state.hoverStroke)),
        moveout: () => hoverShapes.forEach(s => s.stroke(_state.stroke)),
    }, props.options)
}

export default coupledSwitch