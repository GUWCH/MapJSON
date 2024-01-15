import Konva from "konva"
import { DEFAULT_COLOR, HEALTH_STATE } from '../constant'
import { ShapeElement, ShapeProps } from "../model"
import { calcEleActualRect, label, point, wire } from '../utils'
import { clickable } from "DrawLib/wrapper/eventHandlerWrapper"

// 电池簇
export type RankState = {
    soc?: number,
    status: HEALTH_STATE
    name: string
    alias: string
}
export type RankOptions = {

}

const rank = (props: ShapeProps<RankState, RankOptions>): ShapeElement => {
    if (props.start.length <= 0) {
        throw new Error("No start point!");
    }

    const getFillColor = (s: HEALTH_STATE) => {
        switch (s) {
            case HEALTH_STATE.BROKEN: return DEFAULT_COLOR.UNSAFE
            case HEALTH_STATE.HEALTHY: return DEFAULT_COLOR.SAFE
            case HEALTH_STATE.WARNING: return DEFAULT_COLOR.WARNING
            default: return '#67828E'
        }
    }

    const { soc = 0, name } = props.state
    const wireWidth = props.options.wireWidth || 2

    const color = getFillColor(props.state.status)

    const strokeWidth: number = 1

    const constant = {
        bigRect: {
            width: 20,
            height: 34
        },
        smallRect: {
            width: 8,
            height: 3
        },
        socTextHeight: 8,
        socFontSize: 8,
        flashWidth: 8,
        flashHeight: 8,
        flashOffsetX: 1,
        innerMargin: 2,
        labelMarginTop: 5,
        labelFontsize: 14,
        labelWidth: 25,
        labelHight: 18
    }

    const eleRect = {
        width: constant.bigRect.width,
        height: constant.bigRect.height + constant.labelMarginTop + constant.labelHight
    }

    const {
        actualEleHeight,
        actualEleWidth,
        containerWidth,
        containerHeight,
        scaleX: scale
    } = calcEleActualRect(eleRect, props.rect, { ratioLimitType: 'infi-height' })
    const extendWireLength = Math.max(containerHeight - actualEleHeight, 0)

    const group = new Konva.Group()
    const size = {
        bigRect: {
            width: constant.bigRect.width * scale,
            height: constant.bigRect.height * scale
        },
        smallRect: {
            width: constant.smallRect.width * scale,
            height: constant.smallRect.height * scale
        },
        socTextHeight: constant.socTextHeight * scale,
        socFontSize: constant.socFontSize * scale,
        flashWidth: constant.flashWidth * scale,
        flashHeight: constant.flashHeight * scale,
        flashOffsetX: constant.flashOffsetX * scale,
        innerMargin: constant.innerMargin * scale,
        labelMarginTop: constant.labelMarginTop * scale,
        labelFontsize: constant.labelFontsize * scale,
        labelHight: constant.labelHight * scale,
        labelWidth: constant.labelWidth * scale
    }

    const start = props.start[0]
    const inPoint = props.options.startType === 'origin' ? point(start.x + containerWidth / 2, start.y) : start
    const origin = point(inPoint.x - size.bigRect.width / 2, inPoint.y)

    const x = inPoint.x
    const y = inPoint.y + extendWireLength
    const smallRect = new Konva.Rect({
        x: x - size.smallRect.width / 2,
        y: y,
        width: size.smallRect.width,
        height: size.smallRect.height,
        stroke: color,
        strokeWidth: strokeWidth
    })

    const bigRect = new Konva.Rect({
        x: x - size.bigRect.width / 2,
        y: y + size.smallRect.height,
        width: size.bigRect.width,
        height: size.bigRect.height,
        stroke: color,
        strokeWidth: strokeWidth
    })

    // 闪电图标
    const flash = new Konva.Line({
        points: [x - size.flashWidth / 2, y + size.smallRect.height + size.bigRect.height / 2,
        x - size.flashOffsetX, y + size.smallRect.height + size.bigRect.height / 2,
        x - size.flashOffsetX, y + size.smallRect.height + size.bigRect.height / 2 + size.flashHeight / 2,
        x + size.flashWidth / 2, y + size.smallRect.height + size.bigRect.height / 2 - size.flashOffsetX,
        x + size.flashOffsetX, y + size.smallRect.height + size.bigRect.height / 2 - size.flashOffsetX,
        x + size.flashOffsetX, y + size.smallRect.height + size.bigRect.height / 2 - size.flashHeight / 2,
        x - size.flashWidth / 2, y + size.smallRect.height + size.bigRect.height / 2
        ],
        fill: '#FFFFFF',
        closed: true
    })

    // soc
    const socCapacity = label(`${soc}%`, point(
        x - size.bigRect.width / 2,
        y + size.smallRect.height,
    ), size.socFontSize, size.bigRect.width + wireWidth, {
        height: size.bigRect.height,
        disableEcllipsis: true,
        verticalAlign: 'bottom'
    })

    const newh = size.bigRect.height - size.innerMargin * 2
    const h = newh - newh * soc / 100
    const x1 = x - size.bigRect.width / 2 + size.innerMargin
    const y1 = y + size.smallRect.height + size.innerMargin + h
    const socShow = new Konva.Rect({
        x: x1,
        y: y1,
        width: size.bigRect.width - size.innerMargin * 2,
        height: newh * soc / 100,
        fill: color,
        stroke: color,
        strokeWidth: strokeWidth
    })

    group.add(smallRect, bigRect, socShow, socCapacity, flash)

    if (name !== undefined) {
        group.add(label(
            `#${name}`,
            point(x - size.bigRect.width / 2, y + size.smallRect.height + size.bigRect.height + size.labelMarginTop),
            size.labelFontsize,
            size.labelWidth,
            {
                height: size.labelHight,
            }
        ))
    }

    if (extendWireLength > 0) {
        const extendLine = wire([inPoint, point(inPoint.x, inPoint.y + extendWireLength)], wireWidth, props.options.wireColor)
        group.add(extendLine)
    }

    return clickable({
        origin: origin,
        start: [inPoint],
        end: [],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }, {}, props.options);
}

export default rank