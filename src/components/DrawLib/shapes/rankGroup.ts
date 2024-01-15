import { KonvaElement, Point, ShapeElement, ShapeProps, CommonOptions } from "DrawLib/model";
import { calcEleActualRect, point, wire } from "DrawLib/utils";
import Konva from "konva";
import rank, { RankState } from "./rank";

export type RankGroupState = {
    ranks: RankState[]
}
export type RankOption = {
    rankWidth?: number
    rankInterval?: number
    state?: RankState
} & Pick<CommonOptions, 'eventHandlers'>

const rankGroup = (props: ShapeProps<RankGroupState, RankOption>): ShapeElement => {
    const start = props.start[0]
    const ranks = props.state.ranks

    const designSize = {
        rankWidth: 20,
        rankHeight: 34,
        rankMarginTop: 6,
        rankLabelHeight: 10
    }
    
    // 对单个电池簇等比缩放
    const { actualEleWidth, actualEleHeight, scaleX: scale } = calcEleActualRect(
        { width: designSize.rankWidth, height: designSize.rankHeight + designSize.rankMarginTop + designSize.rankLabelHeight },
        { height: props.rect.height, width: props.options.rankWidth },
        { ratioLimitType: 'equal' }
    )
    const size = {
        height: props.rect.height || 42,
        rankInterval: props.options.rankInterval || 6 * scale,
        rankWidth: actualEleWidth,
        rankHeight: actualEleHeight,
        rankMarginTop: 6 * scale
    }
    
    const totalWidth = ranks.length * size.rankWidth + (ranks.length - 1) * size.rankInterval
    const containerWidth = props.rect.width || totalWidth
    const inPoint = props.options.startType === 'origin' ? point(start.x + containerWidth / 2, start.y) : start
    const origin = props.options.startType === 'origin' ?
        point(inPoint.x - totalWidth / 2, inPoint.y) : point(start.x - totalWidth / 2, start.y)
    const batteryStarts: Point[] = []
    const batteryEles: KonvaElement[] = []

    ranks.forEach((r, i) => {
        const bStartTop = point(inPoint.x - totalWidth / 2 + (i + 1 / 2) * size.rankWidth + i * size.rankInterval, inPoint.y)
        const bStart = point(bStartTop.x, bStartTop.y + size.rankMarginTop)
        batteryStarts.push(bStartTop)
        batteryEles.push(
            new Konva.Group().add(
                wire([bStartTop, bStart], props.options.wireWidth, props.options.wireColor),
                rank({
                    start: [bStart],
                    state: r,
                    rect: {
                        width: size.rankWidth,
                        height: actualEleHeight
                    },
                    options: {
                        ...props.options,
                        startType: 'default',
                        data: r
                    },
                }).ele
            )
        )
    })

    const g = new Konva.Group()
    g.add(
        wire(batteryStarts, props.options.wireWidth, props.options.wireColor),
        ...batteryEles
    )
    return {
        start: [inPoint],
        end: [],
        origin: origin,
        rect: {
            height: size.height,
            width: totalWidth
        },
        ele: g
    }
}

export default rankGroup