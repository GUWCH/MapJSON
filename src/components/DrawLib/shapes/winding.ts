import Konva from "konva"
import { Point, ShapeElement, ShapeProps } from "../model"
import { calcEleActualRect, point, wire } from "../utils"

export enum WindingTransformerType {
    /*
     * 三卷变双低压
     */
    THREE,
    /*
     * 两卷变单低压
     */
    TWO,
    /*
     * 两卷变双低压
     */
    TWO_TWO
}
export type WindingTransformerState = WindingTransformerType
export type WindingTransformerOptions = { color?: string }

type WindingProps = {
    start: Point
    type: 'triangle' | 'star'
    radius: number
    lineWidth: number
    color: string
}
const winding = (props: WindingProps) => {
    const { start: o, type, radius, lineWidth, color } = props

    const g = new Konva.Group()

    const commonCfg = {
        radius: radius,
        stroke: color,
        strokeWidth: lineWidth
    }
    const innerContent = type === 'triangle' ? new Konva.Line({
        points: [
            o.x, o.y - 0.4 * radius,
            o.x - 0.4 * radius, o.y + 0.3 * radius,
            o.x + 0.4 * radius, o.y + 0.3 * radius
        ],
        stroke: color,
        strokeWidth: lineWidth,
        closed: true
    }) : new Konva.Line({
        points: [
            o.x, o.y,
            o.x - 0.4 * radius, o.y - 0.375 * radius,
            o.x, o.y,
            o.x + 0.4 * radius, o.y - 0.375 * radius,
            o.x, o.y,
            o.x, o.y + 0.625 * radius],
        stroke: color,
        strokeWidth: lineWidth
    })

    g.add(new Konva.Circle({
        ...commonCfg,
        x: o.x,
        y: o.y
    }),
        // innerContent
    )
    return g
}

const windingTransformer = (props: ShapeProps<WindingTransformerState, WindingTransformerOptions>): ShapeElement => {
    const type = props.state
    const color = props.options.color || '#31C4F5'
    const wireWidth = props.options.wireWidth
    const wireColor = props.options.wireColor
    const originStart = props.start[0]

    const designRect = [WindingTransformerType.THREE, WindingTransformerType.TWO_TWO].includes(type) ? {
        width: 60,
        height: 57 + 6,
        windingHeight: 57
    } : {
        width: 32,
        height: 60 + 6,
        windingHeight: 60
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
        windingHeight: designRect.windingHeight * scale,
        lineWidth: 1.89 * scale,
        radius: 16 * scale,
    }

    const extendWireLength = Math.max((containerHeight - size.height) / 2, 0)

    const inP = point(
        originStart.x + (props.options.startType === 'origin' ? containerWidth / 2 : 0),
        originStart.y
    )
    const start = point(
        inP.x,
        inP.y + extendWireLength
    )
    const end: Point[] = []

    const g = new Konva.Group()
    const commonProps = {
        color: color,
        radius: size.radius,
        lineWidth: size.lineWidth
    }
    g.add(wire([inP, start], wireWidth, wireColor))

    if ([WindingTransformerType.THREE, WindingTransformerType.TWO_TWO].includes(type)) {
        end.push(
            point(start.x - 0.875 * size.radius, inP.y + containerHeight),
            point(start.x + 0.875 * size.radius, inP.y + containerHeight)
        )

        if (type === WindingTransformerType.THREE) {
            g.add(
                winding({
                    ...commonProps,
                    start: point(start.x, start.y + size.radius),
                    type: 'triangle',
                }),
                winding({
                    ...commonProps,
                    start: point(start.x - 0.875 * size.radius, start.y + size.windingHeight - size.radius),
                    type: 'star',
                }),
                winding({
                    ...commonProps,
                    start: point(start.x + 0.875 * size.radius, start.y + size.windingHeight - size.radius),
                    type: 'star',
                })
            )
            g.add(
                wire([
                    point(start.x - 0.875 * size.radius, start.y + size.windingHeight + size.lineWidth),
                    end[0],
                ], wireWidth, wireColor),
                wire([
                    point(start.x + 0.875 * size.radius, start.y + size.windingHeight + size.lineWidth),
                    end[1],
                ], wireWidth, wireColor)
            )
        } else {
            g.add(
                wire([
                    point(start.x, start.y + size.windingHeight),
                    point(start.x, start.y + size.height),
                ]),
                wire([
                    point(start.x - 0.875 * size.radius, start.y + size.height),
                    point(start.x + 0.875 * size.radius, start.y + size.height),
                ], wireWidth, wireColor),
            )

            g.add(
                winding({
                    start: point(start.x, start.y + size.radius),
                    type: 'triangle',
                    ...commonProps
                }),
                winding({
                    start: point(start.x, start.y + size.windingHeight - size.radius),
                    type: 'star',
                    ...commonProps
                })
            )
        }
    } else {
        end.push(point(start.x, inP.y + containerHeight))
        g.add(wire([
            point(start.x, start.y + size.windingHeight + size.lineWidth),
            end[0],
        ], wireWidth, wireColor))
        g.add(
            winding({
                start: point(start.x, start.y + size.radius),
                type: 'triangle',
                ...commonProps
            }),
            winding({
                start: point(start.x, start.y + size.windingHeight - size.radius),
                type: 'star',
                ...commonProps
            })
        )
    }

    return {
        origin: point(inP.x - actualEleWidth / 2, inP.y),
        start: [inP],
        end: end,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        ele: g
    }
}

export default windingTransformer