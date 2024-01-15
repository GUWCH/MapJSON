import { isValidNumber } from "@/common/utils/number";
import { DEFAULT_COLOR, RUN_STATE } from "DrawLib/constant";
import { RunStateColors, ShapeElement, ShapeProps } from "DrawLib/model";
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapRunStateToFillColor, point, wire } from "DrawLib/utils";
import { bindHover } from "DrawLib/wrapper/eventHandlerWrapper";
import Konva from "konva";

export type BarrowOptions = {
    colorMap?: { [key: string | number]: string }
}

export type BarrowState = {
    name?: string
    runState: RUN_STATE
}

const barrow = (props: ShapeProps<BarrowState, BarrowOptions>): ShapeElement<undefined> => {
    const designRect = {
        width: 64,
        height: 16
    }

    const wireWidth = props.options.wireWidth || 2
    const {
        scaleY: scale,
        actualEleHeight,
        actualEleWidth,
        containerHeight,
        containerWidth
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-width' })
    const size = {
        barrowWidth: designRect.width * scale,
        barrowHeight: actualEleHeight,
        nameMargin: 16 * scale,
        arrowWidth: 11 * scale,
        rectHeight: 10 * scale,
        rectWidth: 20 * scale,
        nameFont: 14 * scale
    }
    const color = props.options.colorMap?.[props.state.runState] ?? DEFAULT_COLOR.MISSING

    const start = props.start[0]
    const extendWireLength = Math.max((containerWidth - size.barrowWidth) / 2, 0)
    const inP = props.options.startType === 'origin' ? point(start.x, start.y + containerHeight / 2) : start
    const origin = point(inP.x, inP.y - containerHeight / 2)
    const barrowStart = point(inP.x + extendWireLength, inP.y)
    const barrowEnd = point(inP.x + extendWireLength + size.barrowWidth, inP.y)
    const outP = point(barrowEnd.x + extendWireLength, barrowEnd.y)

    const g = new Konva.Group()

    if (extendWireLength > 0) {
        g.add(wire([inP, barrowStart], wireWidth, props.options.wireColor))
        g.add(wire([barrowEnd, outP], wireWidth, props.options.wireColor))
    }

    const interactiveGroup = new Konva.Group()

    const commonLineCfg = {
        stroke: color,
        strokeWidth: wireWidth,
        hitStrokeWidth: 5 * wireWidth,
        perfectDrawEnabled: false,
    }
    const interactiveLine: Konva.Line[] = []
    interactiveLine.push(
        new Konva.Line({
            points: [
                barrowStart.x + size.arrowWidth, barrowStart.y - size.barrowHeight / 2,
                barrowStart.x, barrowStart.y,
                barrowStart.x + size.arrowWidth, barrowStart.y + size.barrowHeight / 2
            ],
            ...commonLineCfg
        }),
        new Konva.Line({
            points: [
                barrowStart.x + size.arrowWidth * 2, barrowStart.y - size.barrowHeight / 2,
                barrowStart.x + size.arrowWidth, barrowStart.y,
                barrowStart.x + size.arrowWidth * 2, barrowStart.y + size.barrowHeight / 2
            ],
            ...commonLineCfg
        }),
        new Konva.Line({
            points: [
                barrowEnd.x - size.arrowWidth, barrowStart.y - size.barrowHeight / 2,
                barrowEnd.x, barrowStart.y,
                barrowEnd.x - size.arrowWidth, barrowStart.y + size.barrowHeight / 2
            ],
            ...commonLineCfg
        }),
        new Konva.Line({
            points: [
                barrowEnd.x - size.arrowWidth * 2, barrowStart.y - size.barrowHeight / 2,
                barrowEnd.x - size.arrowWidth, barrowStart.y,
                barrowEnd.x - size.arrowWidth * 2, barrowStart.y + size.barrowHeight / 2
            ],
            ...commonLineCfg
        }),
        new Konva.Line({
            points: [
                barrowStart.x, barrowStart.y,
                barrowStart.x + size.arrowWidth * 2, barrowStart.y,
            ],
            ...commonLineCfg
        }),
        new Konva.Line({
            points: [
                barrowEnd.x, barrowEnd.y,
                barrowEnd.x - size.arrowWidth * 2, barrowEnd.y
            ],
            ...commonLineCfg
        })
    )

    const interactiveRect: Konva.Rect[] = []
    interactiveRect.push(new Konva.Rect({
        x: barrowStart.x + size.arrowWidth * 2,
        y: barrowStart.y - size.rectHeight / 2,
        width: size.rectWidth,
        height: size.rectHeight,
        perfectDrawEnabled: false,
        fill: color
    }))

    interactiveGroup.add(...interactiveLine, ...interactiveRect)

    bindHover(interactiveGroup, {
        movein: (key, evt) => {
            // interactiveGroup.opacity(0.8)
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: undefined
            })
        },
        moveout: (key, evt) => {
            // interactiveGroup.opacity(1)
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: undefined
            })
        }
    }, props.options)

    const nameText = new Konva.Text({
        x: inP.x + size.barrowWidth + size.nameMargin,
        y: inP.y - size.nameFont / 2,
        text: props.state.name ?? '',
        fontSize: size.nameFont,
        perfectDrawEnabled: false,
        fill: 'white'
    })

    const { key, stateConsumerRegister } = props.options
    key && stateConsumerRegister && stateConsumerRegister(key, ({ runState, name }: BarrowState) => {
        if (isValidNumber(runState)) {
            const newColor = props.options?.colorMap?.[runState] ?? DEFAULT_COLOR.MISSING
            nameText.text(name ?? '')
            interactiveLine.forEach(l => l.stroke(newColor))
            interactiveRect.forEach(r => r.fill(newColor))
        }
    })

    g.add(interactiveGroup, nameText)

    return {
        origin,
        start: [inP],
        end: [outP],
        ele: g,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        }
    }
}

export default barrow