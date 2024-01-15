import { DEFAULT_COLOR, HEALTH_STATE } from "DrawLib/constant"
import { bindClick, clickable } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { ShapeElement, ShapeProps } from "../model"
import { calcEleActualRect, fireCustomEvent, point, wire } from '../utils'

const getColorFromState = (s?: HEALTH_STATE) => {
    switch (s) {
        case HEALTH_STATE.HEALTHY: return DEFAULT_COLOR.SAFE
        case HEALTH_STATE.WARNING: return DEFAULT_COLOR.WARNING
        case HEALTH_STATE.BROKEN: return DEFAULT_COLOR.UNSAFE
        case HEALTH_STATE.MISSING: return DEFAULT_COLOR.MISSING
        default: return '#FFFFFF'
    }
}
export type BankOptions = {
    color?: string,
}

// 电池组(特殊处理，不加导线延长线)
const bank = (props: ShapeProps<(HEALTH_STATE | undefined), BankOptions>): ShapeElement => {
    const stroke = getColorFromState('state' in props ? props.state : undefined)
    const [originLeft, originRight] = props.start

    const designRect = {
        width: 72,
        height: 48
    }

    const {
        scaleX: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })
    const size = {
        width: designRect.width * scale,
        height: designRect.height * scale,
        bigRect: {
            width: 72 * scale,
            height: 42 * scale,
            cornerRadius: 3 * scale
        },
        smallRect: {
            width: 12 * scale,
            height: 6 * scale,
            cornerRadius: 1 * scale
        },
        strokeWidth: props.options.wireWidth || 2,
        electrodeIcon: 8 * scale
    }

    const extendWireLength = actualEleHeight - size.height
    const left = point(originLeft.x, originLeft.y + extendWireLength)
    const right = point(originRight.x, originRight.y + extendWireLength)

    const middlePoint = point((left.x + right.x) / 2, left.y)

    const group = new Konva.Group()
    const stateEleArr: Konva.Shape[] = []
    if (extendWireLength > 0) {
        group.add(
            wire([originLeft, left], props.options.wireWidth, props.options.wireColor),
            wire([originRight, right], props.options.wireWidth, props.options.wireColor),
        )
    }

    const bigRect = new Konva.Rect({
        x: middlePoint.x - size.bigRect.width / 2,
        y: left.y + size.smallRect.height,
        width: size.bigRect.width,
        height: size.bigRect.height,
        cornerRadius: size.bigRect.cornerRadius,
        stroke: stroke,
        strokeWidth: size.strokeWidth
    })

    bindClick(bigRect, {}, props.options)

    const commCfg = {
        width: size.smallRect.width,
        height: size.smallRect.height,
        cornerRadius: size.smallRect.cornerRadius,
        stroke: stroke,
        strokeWidth: size.strokeWidth
    }
    const leftSmallRect = new Konva.Rect({
        ...commCfg,
        x: left.x - size.smallRect.width / 2,
        y: left.y,
    })
    const rightSmallRect = new Konva.Rect({
        ...commCfg,
        x: right.x - size.smallRect.width / 2,
        y: right.y
    })

    const positiveIcon = [
        new Konva.Line({
            points: [
                left.x - size.electrodeIcon / 2, left.y + size.smallRect.height + size.bigRect.height / 2,
                left.x + size.electrodeIcon / 2, left.y + size.smallRect.height + size.bigRect.height / 2
            ],
            stroke: stroke,
            strokeWidth: size.strokeWidth
        }),
        new Konva.Line({
            points: [
                left.x, left.y + size.smallRect.height + size.bigRect.height / 2 - size.electrodeIcon / 2,
                left.x, left.y + size.smallRect.height + size.bigRect.height / 2 + size.electrodeIcon / 2
            ],
            stroke: stroke,
            strokeWidth: size.strokeWidth
        })
    ]

    const negativeIcon = new Konva.Line({
        points: [
            right.x - size.electrodeIcon / 2, left.y + size.smallRect.height + size.bigRect.height / 2,
            right.x + size.electrodeIcon / 2, left.y + size.smallRect.height + size.bigRect.height / 2
        ],
        stroke: stroke,
        strokeWidth: size.strokeWidth
    })

    stateEleArr.push(bigRect, leftSmallRect, rightSmallRect, ...positiveIcon, negativeIcon)
    group.add(bigRect, leftSmallRect, rightSmallRect, ...positiveIcon, negativeIcon)

    const { stateConsumerRegister, key } = props.options
    if (stateConsumerRegister && key) {
        stateConsumerRegister(key, (newState: HEALTH_STATE | undefined) => {
            stateEleArr.forEach(el => {
                el.stroke(getColorFromState(newState))
            })
        })
    }

    return clickable({
        origin: point((originLeft.x + originRight.x) / 2 - containerWidth / 2, originLeft.y),
        start: [originLeft, originRight],
        end: [point((originLeft.x + originRight.x) / 2, originLeft.y + containerHeight + size.strokeWidth / 2)],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }, {}, props.options);
}

export default bank
