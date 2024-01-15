import Konva from 'konva'
import { KonvaEventObject, Node } from 'konva/lib/Node';
import { ActualStageInfo, KonvaDrawFunc } from 'KonvaWrap'
import { StateConsumer } from 'KonvaWrap/StateCenter';
import { ReactElement } from 'react';
import { TooltipProps } from "antd";

/**
 * 图形相关模型定义 start
 */

export type POSITION = 'start' | 'center' | 'end'
export type Padding = {
    top?: number
    right?: number
    bottom?: number
    left?: number
}

export type Point = {
    x: number
    y: number
}

export type EleRect = {
    width?: number
    height?: number
}

export type DomEleCommonProps = {
    width: number,
    height: number,
    top: number,
    left: number
}

export type ShapeEventHandler<K extends keyof GlobalEventHandlersEventMap> =
    (key: string, e: KonvaEventObject<GlobalEventHandlersEventMap[K]>, opt?: any) => void
export type CommonOptions = {
    key?: string // 组件唯一标识
    wireColor?: string // 连接导线颜色
    wireWidth?: number // 连接导线宽，用于统一导线尺寸
    scale?: number // 该属性用于传入stage的实际缩放比例（XY等比缩放），用于组件反向缩放实现固定大小
    startType?: 'origin' | 'default' // 传入的起点类型，default: 传入图形接线点; origin: 传入矩形区域左上角
    contentPosition?: { // 图形容器内部缩放后位置的确定
        x?: POSITION
        y?: POSITION
    }
    eventHandlers?: Partial<{
        [K in keyof GlobalEventHandlersEventMap]: ShapeEventHandler<K>
    }>
    stateConsumerRegister?: (key: string, consumer: StateConsumer) => void
    domEleRegister?: <T extends DomEleCommonProps> (
        key: string,
        canvasProps: { rect: { width: number, height: number }, origin: Point },
        dom: React.ComponentType<T>
    ) => void
    label?: {
        text: string
        fontSize?: number
        position?: 'top' | 'right' | 'bottom' | 'left'
        positionProvider?: (ele: KonvaElement) => Point // 默认位置参数不满足条件传入该函数实现标签位置计算逻辑
        editable?: boolean
        width?: number
        margin?: number
    },
    data?: any; // 数据
    [k: string]: any;
}

type _ShapeProps = {
    rect: {
        height?: number
        width?: number
    }
    start: Point[]
}
export type ShapeProps<State, Options> = _ShapeProps & (
    State extends undefined ? {} : { state: State }
) & { options: CommonOptions & (Options extends undefined ? {} : Options) }

export type GroupProps<State, Options> = ShapeProps<State, Options>

export type KonvaElement = Konva.Shape | Konva.Group
export type ShapeElement<Options = undefined> = {
    origin: Point // 图形所占矩形空间左上角位置
    start: Point[]
    end: Point[]
    ele: KonvaElement
    rect: {// 图形内容实际占据范围
        width: number
        height: number
    }
    otherInfo?: Options
    toolTipIns?: KonvaElement | undefined
}

export type GroupElement<Options = undefined> = ShapeElement<Options>

export type ShapeDrawFunc<State, Options, OutOptions = undefined> = (props: ShapeProps<State, Options>) => ShapeElement<OutOptions>

export type SwitchColors = Partial<{
    open: string, close: string, missing: string
}>

export type RunStateColors = Partial<{
    running: string
    fault: string
    underMaintenance: string
}>

export type ColorMap = { [key: string | number]: string }

/**
 * 图形相关模型定义 end
 */


/**
 * 布局模型定义 start
 */
export type JustifyContent = 'space-between' | 'space-evenly' | 'flex-start' | 'flex-end' | 'center'
export interface ILayoutEleContent<State, Options, OutOptions = undefined> {
    key?: string
    baseProps?: Omit<ShapeProps<State, Options>, 'start' | 'rect' | 'state'>
    stateProducer?: () => State | undefined
    drawFunc: ShapeDrawFunc<State, Options, OutOptions>
}

type LinkPointRegister = (key: string, p: Point | Point[], type: 'start' | 'end') => void
type LinkPointProvider = (key?: string) => { start: Point[], end: Point[] } | undefined
export interface IRowAndColLayoutBuilder {
    build: (opt?: ActualStageInfo) => { start: Point[], end: Point[], ele: Konva.Group }
}

export interface IRowAndColLayoutItem {
    origin?: Point // 左上角位置
    padding?: Padding
    direction: 'row' | 'col'
    width?: number
    height?: number
    content?: IILayoutEleContent | IRowAndColLayoutItem[]
    constructGroup: (
        g: Konva.Group,
        opt?: ActualStageInfo,
        options?: {
            parentInfo?: { width?: number, height?: number, padding?: Padding },
            linkPointRegister?: LinkPointRegister
        }
    ) => void
}

/**
 * 布局模型定义 end
 */


/**
 * 自定义事件 start
 */
export type ElementInfo<T extends CusEventName> = {
    key?: string
    eleActualWidth: number
    eleActualHeight: number
    originOffsetX: number
    originOffsetY: number
    data: CusEventData<T>
    tooltipProps?: Partial<TooltipProps>
}
type _EventDataMap = {
    showFullText: string // 展示标签全文
    hideFullText: void // 隐藏标签全文
    showInput: string // 展示input交互框
    showCustomNode: any // 展示自定义tooltip内容
    hideCustomNode: any // 隐藏自定义tooltip内容
}
export type CusEventName = keyof _EventDataMap
export type CusEventData<T extends CusEventName> = _EventDataMap[T]
export type CusEvent<T extends CusEventName> = KonvaEventObject<any> & ElementInfo<T>
/**
 * 自定义事件 end
 */