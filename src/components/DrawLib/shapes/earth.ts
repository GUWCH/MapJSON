import Konva from "konva"
import { ShapeElement, ShapeProps } from "../model"
import { calcProportionalScale, point } from "../utils"

const DEFAULT_COLOR = '#F0F0F0'
export type EarthOptions = {
    earthColor?: string
}
const earth: (props: ShapeProps<void, EarthOptions>) => ShapeElement = (props) => {
    const wireWidth = props.options.wireWidth || 2
    const st = props.start[0]

    const designRect = { width: 12, height: 16 }
    const { scale } = calcProportionalScale(designRect, props.rect)
    const size = {
        width: designRect.width * scale,
        height: designRect.height * scale,
        indentation: 2 * scale,
        interval: 2 * scale
    }

    const g = new Konva.Group()
    const commonCfg = {
        perfectDrawEnabled: false,
        stroke: props.options.earthColor || DEFAULT_COLOR,
        strokeWidth: wireWidth,
        hitWidth: wireWidth * 4
    }

    g.add(
        new Konva.Line({
            ...commonCfg, points: [
                st.x, st.y,
                st.x, st.y + size.height - size.interval * 2 - wireWidth * 2]
        }),
        new Konva.Line({
            ...commonCfg, points: [
                st.x - (size.width / 2), st.y + size.height - size.interval * 2 - wireWidth * 2,
                st.x + (size.width / 2), st.y + size.height - size.interval * 2 - wireWidth * 2,
            ]
        }),
        new Konva.Line({
            ...commonCfg, points: [
                st.x - (size.width / 2 - size.indentation), st.y + size.height - size.interval * 1 - wireWidth * 1,
                st.x + (size.width / 2 - size.indentation), st.y + size.height - size.interval * 1 - wireWidth * 1,
            ]
        }),
        new Konva.Line({
            ...commonCfg, points: [
                st.x - (size.width / 2 - size.indentation * 2), st.y + size.height,
                st.x + (size.width / 2 - size.indentation * 2), st.y + size.height,
            ]
        }),
    )

    return {
        origin: point(st.x - size.width / 2, st.y),
        start: [st],
        end: [],
        ele: g,
        rect: {
            width: size.width,
            height: size.height
        }
    }
}

export default earth