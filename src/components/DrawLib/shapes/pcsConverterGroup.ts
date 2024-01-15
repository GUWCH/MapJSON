import { HEALTH_STATE } from "DrawLib/constant";
import { ShapeElement, ShapeProps } from "DrawLib/model";
import { point, wire } from "DrawLib/utils";
import Konva from "konva";
import pcs from "./pcs";

export type PcsConverterGroupStates = {
    converters: { alias: string, status?: HEALTH_STATE, name?: string }[]
}
export type PcsConverterGroupOptions = {
    color?: string
    converterWidth?: number
    converterInterval?: number
}

const pcsConverterGroup = (props: ShapeProps<PcsConverterGroupStates, PcsConverterGroupOptions>): ShapeElement => {
    const converters = props.state.converters
    const { converterWidth = 24, converterInterval = 4, wireWidth, wireColor } = props.options
    const height = props.rect.height || 65
    const totalWidth = converterWidth * converters.length + converterInterval * (converters.length - 1)

    const containerWidth = props.rect.width || totalWidth
    const start = props.start[0]
    const { inPoint, origin } = props.options.startType === 'origin' ?
        {
            inPoint: point(start.x + containerWidth / 2, start.y),
            origin: start
        } : {
            inPoint: start,
            origin: point(start.x - totalWidth / 2, start.y)
        }

    const firstX = inPoint.x - totalWidth / 2 + converterWidth / 2
    const lastX = inPoint.x + totalWidth / 2 - converterWidth / 2
    const g = new Konva.Group()
    g.add(
        wire([point(firstX, inPoint.y), point(lastX, inPoint.y)], wireWidth, wireColor),
        wire([point(firstX, inPoint.y + height), point(lastX, inPoint.y + height)], wireWidth, wireColor)
    )
    converters.forEach((c, i) => {
        const pcsStart = point(firstX + i * (converterWidth + converterInterval), inPoint.y)
        g.add(pcs({
            start: [pcsStart],
            rect: {
                width: converterWidth,
                height: height
            },
            options: { ...props.options, name: '#' + (i + 1), startType: 'default', data: c },
            state: c.status
        }).ele)
    })

    return {
        origin: origin,
        start: [inPoint],
        end: [point(inPoint.x, inPoint.y + height)],
        rect: {
            width: totalWidth,
            height: height
        },
        ele: g
    }
}

export default pcsConverterGroup