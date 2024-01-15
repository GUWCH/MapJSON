import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { DEFAULT_COLOR, SWITCH_STATE, getFontSize, RUN_STATE, CONTROL_STATE } from "./constant";
import { EleRect, ILayoutEleContent, IRowAndColLayoutItem, KonvaElement, Point, SwitchColors, ShapeElement, CusEvent, CusEventName, CusEventData, RunStateColors } from "./model";
import toolTips from 'DrawLib/shapes/toolTips';

export const point = (x: number, y: number): Point => ({ x, y })

export const wire = (points: Point[], width?: number, color?: string) => {
    if (points.length < 1) {
        console.error("a wire need at least one point to paint");
    }
    return new Konva.Line({
        perfectDrawEnabled: false,
        points: points.flatMap(p => [p.x, p.y]),
        stroke: color || DEFAULT_COLOR.WIRE,
        strokeWidth: width || 2,
        lineCap: 'round',
        lineJoin: 'round',
    })
}

let _labelCache: { [key: string]: Konva.Label | Konva.Tag | Konva.Layer | Konva.Text } = {}
export const clearLabelCache = () => {
    Object.entries(_labelCache).forEach(en => {
        en[1].destroy()
    })
    _labelCache = {}
}

/**
 * @deprecated 逐步废弃，改用{@see ./shapes/label}
 */
export const label = (text: string, origin: Point, fontSize: number, width: number, options?: {
    height?: number,
    disableEcllipsis?: boolean,
    verticalAlign?: 'top' | 'middle' | 'bottom'
}) => {
    const id = Math.random().toFixed(8).slice(2)
    const tooltipId = id + 'tooltip'
    const tagId = id + 'tag'
    const layerId = id + 'layer'
    const tipTextId = id + 'tipText'
    const t = new Konva.Text({
        text,
        x: origin.x,
        y: origin.y,
        fill: 'white',
        fontSize,
        fontFamily: 'Arial-Black, Arial',
        width,
        height: options?.height,
        align: 'center',
        verticalAlign: options?.verticalAlign || 'middle',
        wrap: 'none',
        ellipsis: !options?.disableEcllipsis
    })

    const tooltip = new Konva.Label({
        id: tooltipId,
        x: origin.x + width / 2,
        y: origin.y,
    });
    _labelCache[tooltipId] = tooltip

    const tag = new Konva.Tag({
        id: tagId,
        fill: '#124B5C',
        pointerDirection: 'down',
        pointerWidth: 12,
        pointerHeight: 6,
        lineJoin: 'round',
        cornerRadius: 2,
        shadowColor: 'black',
        shadowBlur: 12,
        shadowOffsetY: 2,
        shadowOpacity: 0.4,
    })
    tooltip.add(tag);
    _labelCache[tagId] = tag

    const tooltipText = new Konva.Text({
        text: text,
        fontFamily: 'Arial-Black, Arial',
        fontSize: 16,
        padding: 7,
        fill: 'white',
    })
    _labelCache[tipTextId] = tooltipText
    tooltip.add(tooltipText);
    const l = new Konva.Layer()
    l.add(tooltip)
    _labelCache[layerId] = l

    t.on('pointerenter', function (evt) {
        const stage = evt.target.getStage()
        const l = _labelCache[layerId] as Konva.Layer
        const tooltip = _labelCache[tooltipId] as Konva.Label
        const tag = _labelCache[tagId] as Konva.Tag
        const tipText = _labelCache[tipTextId] as Konva.Text
        if (stage && tooltip && l && tag && tipText) {
            const scaleX = stage.scaleX()
            const maxX = stage.width() / scaleX
            if (maxX < tooltip.x() + tooltip.width() / 2) {
                tooltip.removeChildren()
                tag.pointerDirection('right')
                tag.pointerWidth(6)
                tag.pointerHeight(12)
                tooltip.x(origin.x)
                tooltip.y(origin.y + (options?.height || fontSize) / 2)
                tooltip.add(tag)
                tooltip.add(tipText)
            }
            scaleX && tooltip.scale({ x: 1 / scaleX, y: 1 / scaleX })
            stage.add(l)
        }
    });
    t.on('mouseout', function (evt) {
        const l = _labelCache[layerId]
        if (l) {
            l.remove()
        }
    });

    return t
}

export const isRowAndColLayoutItem = (item: IRowAndColLayoutItem | ILayoutEleContent<any, any>): item is IRowAndColLayoutItem => {
    return 'direction' in item
}

export const mapRunStateToFillColor = (state: RUN_STATE, colorMap?: RunStateColors) => {
    switch (state) {
        case RUN_STATE.RUNNING: return colorMap?.running ?? DEFAULT_COLOR.SAFE
        case RUN_STATE.FAULT: return colorMap?.fault ?? DEFAULT_COLOR.UNSAFE
        case RUN_STATE.UNDER_MAINTENANCE: return colorMap?.underMaintenance ?? DEFAULT_COLOR.WARNING
        default: return DEFAULT_COLOR.MISSING
    }
}

export const mapSwitchStateToFillColor = (state: SWITCH_STATE, colorMap?: SwitchColors) => {
    const needRevert = (window.get_web_cfg?.('invert_switch_color') as string ?? '').toLowerCase() === 'true'
    if (needRevert) {
        switch (state) {
            case SWITCH_STATE.CONNECTED: { return colorMap?.close || DEFAULT_COLOR.SAFE }
            case SWITCH_STATE.SEPARATED: { return colorMap?.open || DEFAULT_COLOR.UNSAFE }
            default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
        }
    }
    switch (state) {
        case SWITCH_STATE.CONNECTED: { return colorMap?.close || DEFAULT_COLOR.UNSAFE }
        case SWITCH_STATE.SEPARATED: { return colorMap?.open || DEFAULT_COLOR.SAFE }
        default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
    }
}
export const mapSwitchStateToHoverColor = (
    state: SWITCH_STATE,
    colorMap?: SwitchColors
) => {
    const needRevert = (window.get_web_cfg?.('invert_switch_color') as string ?? '').toLowerCase() === 'true'
    if (needRevert) {
        switch (state) {
            case SWITCH_STATE.CONNECTED: { return colorMap?.close || DEFAULT_COLOR.SAFE_HOVER }
            case SWITCH_STATE.SEPARATED: { return colorMap?.open || DEFAULT_COLOR.UNSAFE_HOVER }
            default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
        }
    }
    switch (state) {
        case SWITCH_STATE.CONNECTED: { return colorMap?.close || DEFAULT_COLOR.UNSAFE_HOVER }
        case SWITCH_STATE.SEPARATED: { return colorMap?.open || DEFAULT_COLOR.SAFE_HOVER }
        default: { return colorMap?.missing || DEFAULT_COLOR.MISSING }
    }
}

/**
 * @deprecated 逐步弃用，后续改用{@link calcEleActualRect}
 */
export const calcProportionalScale = (eleRect: { width: number, height: number }, containerRect: { width?: number, height?: number }) => {
    const designAspectRatio = eleRect.width / eleRect.height
    const containerWidth = containerRect.width || (containerRect.height ? containerRect.height * designAspectRatio : eleRect.width)
    const containerHeight = containerRect.height || (containerRect.width ? containerRect.width / designAspectRatio : eleRect.height)

    const eleAspectRatio = eleRect.width / eleRect.height
    const containerAspectRatio = containerWidth / containerHeight
    const scale = eleAspectRatio < containerAspectRatio ? (containerHeight / eleRect.height) : (containerWidth / eleRect.width)
    return {
        actualEleRect: {
            width: eleRect.width * scale,
            height: eleRect.height * scale
        },
        actualContainerRect: {
            width: containerWidth,
            height: containerHeight
        },
        scale: scale
    }
}

export const calcEleActualRect = (
    eleDesignRect: Required<EleRect>,
    containerRect: EleRect,
    options: {
        ratioLimitType?: 'equal' | 'infi-width' | 'infi-height' | 'stretch' // 宽高比限制类型 等比/可大于设计比（宽无限延申）/可小于设计比（高无限延申）/ 图形拉伸填满容器
    } = {}
) => {
    const { ratioLimitType } = options
    const designRatio = eleDesignRect.width / eleDesignRect.height
    const containerWidth = containerRect.width || (containerRect.height ? containerRect.height * designRatio : eleDesignRect.width)
    const containerHeight = containerRect.height || (containerRect.width ? containerRect.width / designRatio : eleDesignRect.height)
    const containerRatio = containerWidth / containerHeight

    let actualRatio = designRatio
    switch (ratioLimitType) {
        case 'infi-width': {
            actualRatio = Math.max(containerRatio, designRatio)
            break;
        }
        case 'infi-height': {
            actualRatio = Math.min(containerRatio, designRatio)
            break;
        }
        case 'stretch': {
            actualRatio = containerRatio
        }
    }
    let actualEleW: number
    let actualEleH: number

    /*
     * ew: 元素宽 eh: 元素高 cw: 容器宽 ch: 容器高
     * 已知: ew <= cw  eh <= ch, eh=ch 或 ew=cw
     * 
     * 当 ew/eh >= cw/ch  =>  ew*ch >= eh*cw
     * 若 eh=ch  =>  ew >= cw 与已知矛盾，得 ew=cw
     * 
     * 当 ew/eh < cw/ch  =>  ew*ch < eh*cw
     * 若 ew=cw  =>  ch < eh 与已知矛盾，得 eh=ch
     */
    if (actualRatio >= containerRatio) {
        actualEleW = containerWidth
        actualEleH = actualEleW / actualRatio
    } else {
        actualEleH = containerHeight
        actualEleW = actualEleH * actualRatio
    }

    return {
        actualEleWidth: actualEleW,
        actualEleHeight: actualEleH,
        actualRatio,
        designRatio,
        containerWidth,
        containerHeight,
        scaleX: actualEleW / eleDesignRect.width,
        scaleY: actualEleH / eleDesignRect.height
    }
}

export const groupScale = (group: Konva.Group, start: Point, scale: number) => {
    group.scaleX(scale)
    group.scaleY(scale)

    const offsetX = start.x * scale - start.x
    const offsetY = start.y * scale - start.y

    group.x(-offsetX)
    group.y(-offsetY)

    return { offsetX, offsetY }
}

export const getTextWidth = (text: string, fontProp: string) => {
    var tag = document.createElement('div')
    tag.style.whiteSpace = 'nowrap'
    tag.style.font = fontProp
    tag.innerHTML = text

    document.body.appendChild(tag)
    var result = tag.scrollWidth
    document.body.removeChild(tag)
    return result;
}

export const inform = ({
    shapeEle,
    shapeRawH,
    shapeRawW,
    stageWidth,
    stageHight,
    needTitle,
    title = '',
    width,
    valList = [],
    position
}: {
    shapeEle: ShapeElement,
    shapeRawH?: number,
    shapeRawW?: number,
    stageWidth: number,
    stageHight: number,
    width?: number,
    needTitle?: boolean,
    title?: string,
    valList: {
        name: string,
        color: string,
    }[],
    position?: 'right' | 'left'
}) => {

    const informHeight = 12 + (needTitle ? 26 : 0) + valList.length * 24;
    const informWidth = width ?? 100;

    const informGroup = new Konva.Group({
        width: informWidth,
        height: informHeight
    });

    let textToolTipsPropsArr: any[][] = [];

    let bg = new Konva.Rect({
        width: informWidth,
        height: informHeight,
        fill: '#01333D',
        cornerRadius: 4,
    });

    informGroup.add(bg);

    if (needTitle) {
        let titleEle = new Konva.Text({
            x: 12,
            y: 10,
            text: title,
            fill: '#fff',
            fontSize: getFontSize(informGroup.width() - 12, title, 12),
        })

        informGroup.add(titleEle);
    }

    valList.map((l, index) => {
        let { name, color } = l;

        let itemGroup = new Konva.Group({
            x: 0,
            y: 12 + (needTitle ? 26 : 0) + index * 24,
        });

        let signalObj = new Konva.Rect({
            x: 12,
            width: 6,
            height: 6,
            cornerRadius: 6,
            fill: color || '#fff',
        })

        let nameObj = new Konva.Text({
            x: 24,
            width: informGroup.width() - 24,
            height: 24,
            text: name,
            fill: '#fff',
            fontSize: 12,
            wrap: "none",
            ellipsis: true
        });

        textToolTipsPropsArr.push([
            itemGroup,
            name,
            [],
            stageWidth,
            stageHight,
            undefined,
        ])

        itemGroup.add(signalObj);
        itemGroup.add(nameObj);

        informGroup.add(itemGroup);
    })

    if (position === 'right') {

        let informX = shapeEle.origin.x + (shapeRawW ?? shapeEle.rect.width) + 10;
        let informY = shapeEle.origin.y + (shapeRawH ?? shapeEle.rect.height) / 2 - informHeight / 2;

        if (informX + informWidth > stageWidth) {
            informX = shapeEle.origin.x - 10 - informWidth;
        }

        informGroup.position({
            x: informX,
            y: informY
        })

    } else {
        let informX = shapeEle.origin.x - 10 - informWidth;
        let informY = shapeEle.origin.y + (shapeRawH ?? shapeEle.rect.height) / 2 - informHeight / 2;

        if (informX < 0) {
            informX = shapeEle.origin.x + (shapeRawW ?? shapeEle.rect.width) + 10;
        }

        informGroup.position({
            x: informX,
            y: informY
        })
    }

    const textToolTipsArr = textToolTipsPropsArr.map((tip, index) => {
        tip.push(
            informGroup.x() + informWidth + 4,
            informGroup.y() + 24 * index + 8,
            informWidth + 4,
            24
        );
        //@ts-ignore
        return toolTips(...tip);
    })

    return { informGroup, textToolTipsArr };
}

export const fireCustomEvent = <N extends CusEventName>(name: N, evt: CusEvent<N>) => {
    const stage = evt.target.getStage()
    if (stage) {
        stage.fire(name, evt)
    }
}

export const calcCusEventProps = (ev: KonvaEventObject<any>, key?: string) => {
    const stage = ev.target.getStage()
    if (!stage) {
        return
    }
    const { x: scaleX = 1, y: scaleY = 1 } = stage.scale() || {}
    const ele = ev.target
    let height: number
    let width: number
    let offsetX: number
    let offsetY: number
    if (ele instanceof Konva.Line) {
        height = 0
        width = 0
        offsetX = 0
        offsetY = 0
    } else {
        /**
         * @link https://konvajs.org/api/Konva.Node.html
         */
        const pos = ele.getAbsolutePosition(ele.getStage()??undefined);

        height = ele.height() * scaleY
        width = ele.width() * scaleX
        offsetX = ev.evt.offsetX - pos.x * scaleX
        offsetY = ev.evt.offsetY - pos.y * scaleY
    }

    return {
        ...ev,
        key: key,
        eleActualHeight: height,
        eleActualWidth: width,
        originOffsetX: offsetX,
        originOffsetY: offsetY,
    }
}

export const mapRawValueToSwitchState = (v?: number | string): SWITCH_STATE => {
    if (v == 0) {
        return SWITCH_STATE.SEPARATED
    } else if (v == 1) {
        return SWITCH_STATE.CONNECTED
    }

    return SWITCH_STATE.MISSING
}

export const mapRawValueToControlState = (v?: number | string): CONTROL_STATE => {
    if (v == 0) {
        return CONTROL_STATE.LOCAL
    } else if (v == 1) {
        return CONTROL_STATE.REMOTE
    }
    return CONTROL_STATE.BROKEN
}

export const mapIDynToSwitchState = (v?: IDyn): SWITCH_STATE => {
    if(v?.status_value === 0){
        return mapRawValueToSwitchState(v.raw_value)
    }
    return SWITCH_STATE.MISSING
}

export const mapIDynToControlState = (v?: IDyn): CONTROL_STATE => {
    if (v?.status_value === 0) {
        return mapRawValueToControlState(v.raw_value)
    }
    return CONTROL_STATE.BROKEN
}