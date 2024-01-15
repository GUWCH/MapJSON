import { DEFAULT_COLOR, HEALTH_STATE } from "DrawLib/constant"
import { bindClick, clickable } from "DrawLib/wrapper/eventHandlerWrapper";
import Konva from "konva"
import { Point, KonvaElement, ShapeElement, ShapeProps } from "../model"
import { calcEleActualRect, label, point, wire } from '../utils'
import tooltip from "./toolTips";


export const getPCSColor = (s?: HEALTH_STATE) => {
    switch (s) {
        case HEALTH_STATE.HEALTHY: return DEFAULT_COLOR.SAFE
        case HEALTH_STATE.WARNING: return DEFAULT_COLOR.WARNING
        case HEALTH_STATE.BROKEN: return DEFAULT_COLOR.UNSAFE
        case HEALTH_STATE.MISSING: return DEFAULT_COLOR.MISSING
        default: return '#00A7DB'
    }
}
export type PCSOptions = {
    name?: string
    nameProps?: {
        font?: number
        width?: number
        position: 'left' | 'bottom'
    }
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

// 变流器(AC/DC) -- 以大矩形上中点为接入点, 下中点为接出点
const pcs = (props: ShapeProps<HEALTH_STATE | undefined, PCSOptions>): ShapeElement => {
    if (props.start.length <= 0) {
        throw new Error("No start point!");
    }

    const start = props.start[0]
    const { name, nameProps = { position: 'bottom' } } = props.options || {}

    const wireWidth = props.options.wireWidth || 2
    const strokeWidth = wireWidth

    const eleRect = {
        width: 72,
        height: name && nameProps?.position === 'bottom' ? 68 : 42
    }

    const {
        actualEleWidth,
        actualEleHeight,
        containerWidth,
        containerHeight,
        scaleX
    } = calcEleActualRect(eleRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        width: actualEleWidth,
        height: actualEleHeight,
        rectWidth: actualEleWidth,
        textFontSize: 16 * scaleX,
        textPadding: 4 * scaleX,
        labelHeight: 26 * scaleX + wireWidth * 2,
        labelTextFont: (nameProps?.font || 28) * scaleX,
        rectHeight: 42 * scaleX,
        namePaddingRight: 2 * scaleX
    }
    const extendWireLength = Math.max((size.height - size.rectHeight - (name && nameProps?.position === 'bottom' ? size.labelHeight : 0)) / 2, 0)

    let inP: Point
    let origin: Point
    if (props.options.startType === 'origin') {
        origin = start
        inP = {
            x: start.x + containerWidth / 2,
            y: start.y
        }
    } else {
        origin = {
            x: start.x - containerWidth / 2,
            y: start.y
        }
        inP = start
    }

    const g = new Konva.Group()
    if (extendWireLength > 0) {
        g.add(
            wire([inP, { x: inP.x, y: inP.y + extendWireLength }], wireWidth, props.options.wireColor),
            wire([
                point(inP.x, inP.y + size.height - extendWireLength),
                point(inP.x, inP.y + size.height)
            ], wireWidth, props.options.wireColor)
        )
    }
    const color = 'state' in props ? getPCSColor(props.state) : props.options.color || getPCSColor(undefined)
    const stroke = color

    const rectOrigin = {
        x: inP.x - size.rectWidth / 2,
        y: inP.y + extendWireLength
    }
    const rect = new Konva.Rect({
        x: rectOrigin.x,
        y: rectOrigin.y,
        width: size.rectWidth,
        height: size.rectHeight,
        stroke: stroke,
        strokeWidth: strokeWidth
    })

    const diagonalLine = new Konva.Line({
        points: [rectOrigin.x + size.rectWidth, rectOrigin.y, rectOrigin.x, rectOrigin.y + size.rectHeight],
        stroke: stroke,
        strokeWidth: strokeWidth,
    })

    const acText = new Konva.Text({
        x: rectOrigin.x,
        y: rectOrigin.y,
        text: 'AC',
        fontSize: size.textFontSize,
        fontFamily: 'Arial-Black, Arial',
        fontWeight: 900,
        fill: stroke,
        width: size.rectWidth / 2,
        padding: size.textPadding
    })

    const dcText = new Konva.Text({
        x: rectOrigin.x + size.rectWidth / 2,
        y: rectOrigin.y + size.rectHeight / 2,
        text: 'DC',
        fontSize: size.textFontSize,
        fontFamily: 'Arial-Black, Arial',
        fontWeight: 900,
        fill: stroke,
        width: size.rectWidth / 2,
        padding: size.textPadding,
        align: 'right'
    })

    g.add(
        rect,
        diagonalLine,
        acText,
        dcText,
    )

    if (name) {
        const nameWidth = nameProps?.width || size.rectWidth
        if (nameProps?.position === "bottom") {
            g.add(label(
                name,
                point(rectOrigin.x, rectOrigin.y + size.rectHeight),
                size.labelTextFont,
                nameWidth,
                { height: size.labelHeight }
            ))
        } else {
            g.add(label(
                name,
                point(rectOrigin.x - size.namePaddingRight - nameWidth, rectOrigin.y + size.rectHeight / 2 - size.labelTextFont / 2),
                size.labelTextFont,
                nameWidth,
            ))
        }
    }

    let toolTipGroup: KonvaElement | undefined = undefined;

    if (props.options.needTooltip && !toolTipGroup) {
        const { deviceName = '', valList = [] } = props.options.toolTipData || {};
        const { stageWidth = 0, stageHight = 0 } = props.options.toolTipData || {};
        toolTipGroup = tooltip(
            g,
            deviceName,
            // @ts-ignore
            valList,
            stageWidth,
            stageHight,
            undefined,
            start.x + size.width / 2 + 5,
            start.y + size.height + 5,
            size.width + 10,
            size.height + 5
        );
    }

    return clickable({
        origin: origin,
        start: [inP],
        end: [point(inP.x, inP.y + size.height)],
        ele: g,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight,
        },
        toolTipIns: toolTipGroup
    }, {}, props.options)
}

export default pcs