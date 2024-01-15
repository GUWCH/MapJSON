import { DEFAULT_COLOR, HEALTH_STATE } from "DrawLib/constant"
import Konva from "konva"
import { bindClick, clickable } from "DrawLib/wrapper/eventHandlerWrapper";
import { KonvaElement, ShapeElement, ShapeProps } from "../model"
import { calcProportionalScale, point, wire } from '../utils'
import tooltip from "./toolTips";

export const getColor = (s?: HEALTH_STATE) => {
    switch (s) {
        case HEALTH_STATE.HEALTHY: return DEFAULT_COLOR.SAFE
        case HEALTH_STATE.WARNING: return DEFAULT_COLOR.WARNING
        case HEALTH_STATE.BROKEN: return DEFAULT_COLOR.UNSAFE
        case HEALTH_STATE.MISSING: return DEFAULT_COLOR.MISSING
        default: return '#00A7DB'
    }
}
export type CombinerOptions = {
    isAc?: boolean
    needTooltip?: boolean
    toolTipData?: {
        deviceName?: string,
        stageWidth?: number,
        stageHight?: number,
        valList?: {
            color?: string,
            name?: string
        }[]
    },
    color?: string
}

// 汇流箱(AC/DC) -- 以大矩形上中点为起点, 下中点为出口点
const combiner = (props: ShapeProps<HEALTH_STATE | undefined, CombinerOptions>): ShapeElement => {
    if (props.start.length <= 0) {
        throw new Error("No originStart point!");
    }

    const color = 'state' in props ? getColor(props.state) : props.options.color || getColor(undefined)
    const originStart = props.start[0]
    const wireWidth = props.options.wireWidth || 2

    const constant = {
        width: 28,
        height: 26,
        rectHeight: 22,
        textFontSize: 12,
        textPadding: 4,
        suffixMargin: 5,
        suffixItemMargin: 6,
    }

    const stroke = color
    const strokeWidth = 2

    const eleRect = {
        width: constant.width,
        height: constant.height
    }

    let { scale, actualContainerRect, actualEleRect } = calcProportionalScale(eleRect, props.rect)

    const size = {
        width: constant.width * scale,
        height: constant.height * scale,
        textFontSize: constant.textFontSize * scale,
        textPadding: constant.textPadding * scale,
        rectHeight: constant.rectHeight * scale,
        suffixHeight: (constant.height - constant.rectHeight) * scale,
        suffixMargin: constant.suffixMargin * scale,
        suffixItemMargin: constant.suffixItemMargin * scale,

    }

    const rect = new Konva.Rect({
        x: originStart.x - size.width / 2,
        y: originStart.y,
        width: size.width,
        height: size.rectHeight,
        stroke: stroke,
        strokeWidth: strokeWidth,
    })

    const acOrDcText = new Konva.Text({
        x: originStart.x - size.width / 2,
        y: originStart.y,
        text: props.options.isAc ? 'AC' : 'DC',
        fontSize: size.textFontSize,
        fontFamily: 'Arial-Black, Arial',
        fontWeight: 600,
        fill: stroke,
        width: size.width,
        height: size.rectHeight,
        align: 'center',
        verticalAlign: 'middle'
    })

    const suffixPattern = Array.from({length: 4}).map((_, index)=>{
        let x = originStart.x - size.width / 2 + size.suffixMargin + index * size.suffixItemMargin
        return wire([{x: x, y: originStart.y + size.rectHeight}, {x: x, y: originStart.y + size.height}], wireWidth, stroke)
    })

    const group = new Konva.Group();

    group.add(
        rect,
        acOrDcText,
        ...suffixPattern
    )

    let toolTipGroup: KonvaElement | undefined  = undefined;

    if(props.options.needTooltip && !toolTipGroup){
        const {deviceName = '', valList = []} = props.options.toolTipData || {};
        const {stageWidth = 0, stageHight = 0} = props.options.toolTipData || {};
        toolTipGroup = tooltip(
            group, 
            deviceName, 
            valList, 
            stageWidth, 
            stageHight,
            undefined,
            originStart.x + size.width / 2 + 5,
            originStart.y + size.height + 5,
            size.width + 10,
            size.height + 6
        );
    }

    return clickable({
        origin: { x: originStart.x - actualContainerRect.width / 2, y: originStart.y },
        start: [originStart],
        end: [point(originStart.x, (originStart.y + size.height + wireWidth / 2))],
        ele: group,
        rect: actualContainerRect,
        toolTipIns: toolTipGroup
    }, {}, props.options);
}

export default combiner