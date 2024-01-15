import { bindClick, clickable } from "DrawLib/wrapper/eventHandlerWrapper";
import Konva from "konva";
import { SWITCH_STATE } from "../constant";
import { ShapeElement, ShapeProps } from "../model";
import { calcEleActualRect, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from '../utils';

export type FuseState = SWITCH_STATE
export type FuseOptions = {
    color?: string
}


// 熔丝  -- 以竖线起点为起点， 竖线终点为出口点
const fuse = (props: ShapeProps<FuseState, FuseOptions>): ShapeElement => {
    if (props.start.length <= 0) {
        throw new Error("No start point!");
    }

    const stroke = mapSwitchStateToFillColor(props.state)
    const hoverStroke = mapSwitchStateToHoverColor(props.state)
    const originStart = props.start[0]
    const wireWidth = props.options.wireWidth || 2

    const constant = {
        width: 8,
        height: 19,
        topLinelength: 10,
        lineLength: 39,
        cornerRadius: 1
    }

    const eleRect = {
        width: constant.width,
        height: constant.lineLength
    }

    const {
        scaleX: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth
    } = calcEleActualRect(eleRect, props.rect, { ratioLimitType: 'infi-height' })
    const extendWireLength = containerHeight - actualEleHeight
    let start = { x: originStart.x, y: originStart.y + extendWireLength }

    const group = new Konva.Group()

    const size = {
        width: constant.width * scale,
        height: constant.height * scale,
        topLinelength: constant.topLinelength * scale,
        lineLength: constant.lineLength * scale,
        cornerRadius: constant.cornerRadius * scale
    }

    const rect = new Konva.Rect({
        x: start.x - size.width / 2,
        y: start.y + size.topLinelength,
        width: size.width,
        height: size.height,
        cornerRadius: size.cornerRadius,
        stroke: stroke,
        strokeWidth: wireWidth
    })

    const vline = new Konva.Line({
        points: [
            start.x, start.y,
            start.x, start.y + size.lineLength
        ],
        stroke: stroke,
        strokeWidth: wireWidth
    })

    group.add(rect, vline)

    bindClick(group, {}, props.options)

    if (extendWireLength > 0) {
        group.add(wire([originStart, start], props.options.wireWidth, props.options.wireColor))
    }

    return clickable({
        origin: point(originStart.x - actualEleWidth / 2, originStart.y),
        start: [originStart],
        end: [point(start.x, (start.y + size.lineLength))],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }, {
        movein: () => {
            rect.stroke(hoverStroke)
            vline.stroke(hoverStroke)
        },
        moveout: () => {
            rect.stroke(stroke)
            vline.stroke(stroke)
        }
    }, props.options)
}

export default fuse