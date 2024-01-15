import React, { RefObject, useRef } from "react"
import styles from "./Graph.module.scss"
import Konva from "konva"
import KonvaWrap, { KonvaDrawFunc } from "../KonvaWrap"
import { breaker, BreakerColorMap, CONTROL_STATE, disconnector, disconnectorWithEarth, doubleWindingTransformer, earthConnector, ELEMENT_HEIGHT, GraphNode, loadSwitch, Point, point, SwitchStateColorMap, SWITCH_STATE, threeWindingTransformer, Wire, wire } from "./Shapes"
import { Group } from "konva/lib/Group"
import { Shape } from "konva/lib/Shape"

export enum GRAPH_TYPE {
    /* 类型1.直连接线、两卷变、高低压侧开关、无隔离开关、无地刀 */
    TYPE1,
    /* 类型2.直连接线、两卷变、高低压侧开关、高压侧隔离开关、无地刀 */
    TYPE2,
    /* 类型3.直连接线、两卷变、高低压侧开关、高压侧隔离开关、地刀 */
    TYPE3,
    /* 类型4.直连接线、三卷变、高低压侧开关、无隔离开关、无地刀 */
    TYPE4,
    /* 类型5.直连接线、三卷变、高低压侧开关、高压侧隔离开关、无地刀 */
    TYPE5,
    /* 类型6.直连接线、三卷变、高低压侧开关、高压侧隔离开关、地刀 */
    TYPE6,
    /* 类型7.环网接线、两卷变、高低压侧开关、无隔离开关、无地刀 */
    TYPE7,
    /* 类型8.环网接线、两卷变、高低压侧开关、无隔离开关、地刀 */
    TYPE8,
    /* 类型9.环网接线、两卷变、高低压侧开关、隔离开关、无地刀 */
    TYPE9,
    /* 类型10.环网接线、两卷变、高低压侧开关、隔离开关、地刀 */
    TYPE10,
    /* 类型11.环网接线、三卷变、高低压侧开关、无隔离开关、无地刀 */
    TYPE11,
    /* 类型12.环网接线、三卷变、高低压侧开关、无隔离开关、地刀 */
    TYPE12,
    /* 类型13.环网接线、三卷变、高低压侧开关、隔离开关、无地刀 */
    TYPE13,
    /* 类型14.环网接线、三卷变、高低压侧开关、隔离开关、地刀 */
    TYPE14,
}



export type DeviceGraphProps = {
    points: []
    type: GRAPH_TYPE
}

/**
 * @property {number} left 图形左上角距离图像组件左侧距离
 * @property {number} top 图形左上角距离图像组件上侧距离
 * @property {number} width 图形宽
 * @property {number} height 图形高
 */
export type CanvasEleRect = {
    left: number
    top: number
    width: number
    height: number
}

export interface CanvasPointEvent {
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    konvaEvt: Konva.KonvaEventObject<MouseEvent>
}
/**
 * @param key 开关key
 */
export type BreakerClickHandler = (breakerProps: BreakerProps, evt: GraphPointEvent) => void

class GraphPointEvent implements CanvasPointEvent {
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    konvaEvt: Konva.KonvaEventObject<MouseEvent>

    constructor(konvaEvt: Konva.KonvaEventObject<MouseEvent>) {
        const evt = konvaEvt.evt
        const shapeEle = konvaEvt.target
        const offsetX = - (evt.offsetX - shapeEle.x()) + shapeEle.width() + 2
        const offsetY = - (evt.offsetY - shapeEle.y())
        this.clientX = evt.clientX + offsetX
        this.clientY = evt.clientY + offsetY
        this.pageX = evt.pageX + offsetX
        this.pageY = evt.pageY + offsetY
        this.konvaEvt = konvaEvt
    }
}

type ColorMap = Partial<{
    switch: SwitchStateColorMap
    wire: string
    breaker: BreakerColorMap
    winding: string
    earth: string
    bg: string
}>

type DrawFunc = (parentOuts: Point[]) => GraphNode

export type BreakerProps = {
    key: string,
    controlState: CONTROL_STATE
    switchState: SWITCH_STATE
}

class DrawFuncTreeNode {
    parent?: DrawFuncTreeNode
    draw: DrawFunc
    children: DrawFuncTreeNode[] = []
    outPoints: Point[] = []

    constructor(draw: DrawFunc, parent?: DrawFuncTreeNode) {
        this.draw = draw
        this.parent = parent
    }

    addChildren(...nodes: DrawFuncTreeNode[]) {
        this.children.push(...nodes)
        return this
    }

    addOutPoints(...outs: Point[]) {
        this.outPoints.push(...outs)
        return this
    }

    getMaxDepth() {
        if (this.children.length === 0) {
            return 1
        }

        const maxChildrenDepth = this.children.map(c => c.getMaxDepth()).reduce((p, c) => p > c ? p : c, 1)
        return maxChildrenDepth + 1
    }
}

type LayoutTree = {
    root: DrawFuncTreeNode
    rowNum: number
    heightSum: number
    colWidth: number
    endStyle?: 'arrow'
}

class GraphLayout {
    wireStroke: string | undefined // 生成的导线颜色
    paddingWireLength: number // 接线图上下边缘预留导线长度
    canvasHeight: number
    canvasWidth: number
    cols: LayoutTree[] = []
    colGap: number

    constructor(canvasHeight: number, canvasWidth: number,
        wireStroke?: string, paddingWireLength: number = 22, colGap = 5) {
        this.canvasHeight = canvasHeight
        this.canvasWidth = canvasWidth
        this.wireStroke = wireStroke
        this.paddingWireLength = paddingWireLength
        this.colGap = colGap
    }

    addCol(tree: Omit<LayoutTree, 'colWidth'> & { colWidth?: number }) {
        this.cols.push({
            root: tree.root,
            rowNum: tree.rowNum,
            heightSum: tree.heightSum,
            colWidth: tree.colWidth || 102,
            endStyle: tree.endStyle,
        })
        return this
    }

    drawCol(tree: LayoutTree, startP: Point, layer: Konva.Layer) {
        const elements: (Shape | Group)[] = []
        const firstOut = point(startP.x, startP.y + this.paddingWireLength)
        elements.push(wire([startP, firstOut]).ele)
        const interval = (this.canvasHeight - this.paddingWireLength * 2 - tree.heightSum) / (Math.max(tree.rowNum, 2) - 1)

        let currentTreeLayer: DrawFuncTreeNode[] = [tree.root]
        let nextTreeLayer: DrawFuncTreeNode[] = []

        while (currentTreeLayer.length > 0) {
            const currentNode = currentTreeLayer.pop()
            if (currentNode) {
                const node = currentNode.draw(currentNode.parent?.outPoints || [firstOut])
                elements.push(node.ele)
                if (currentNode.children.length > 0) {
                    node.out.forEach(o => {
                        const w = wire([o, point(o.x, o.y + interval)], this.wireStroke)
                        elements.push(w.ele)
                        if (currentNode.outPoints) {
                            currentNode.outPoints.push(w.end)
                        } else {
                            currentNode.outPoints = [w.end]
                        }
                    })
                    nextTreeLayer.push(...currentNode.children)
                } else {
                    node.out.forEach(o => {
                        let endHeight = 0
                        if (tree.endStyle === 'arrow') {
                            endHeight = 12
                            const y = this.canvasHeight
                            elements.push(new Konva.Line({
                                points: [o.x, y, o.x - 4, y - endHeight, o.x + 4, y - endHeight],
                                fill: '#FFBB00',
                                closed: true
                            }))
                        }
                        elements.push(wire([o, point(o.x, this.canvasHeight - endHeight)], this.wireStroke).ele)
                    })
                }
            }
            if (currentTreeLayer.length === 0) {
                currentTreeLayer = nextTreeLayer
                nextTreeLayer = []
            }
        }

        layer.add(...elements)
        return layer
    }

    draw(stage: Konva.Stage) {
        if (this.cols.length === 0) return

        const colGapSum = this.cols.reduce((p, c, i) => p + c.colWidth + (i === 0 ? 0 : this.colGap), 0)
        const paddingLeft = (stage.width() - colGapSum) / 2

        const l = new Konva.Layer()


        let currentX = paddingLeft
        let preX: null | number = null
        for (let i = 0; i < this.cols.length; i++) {
            const col = this.cols[i];
            currentX += col.colWidth / 2
            if (preX !== null) {
                currentX += this.colGap + this.cols[i - 1].colWidth / 2
                l.add(wire([point(preX, 2), point(currentX, 2)], this.wireStroke).ele)
            }
            const currentP = point(currentX, 2)
            this.drawCol(col, currentP, l)
            preX = currentX
        }

        stage.add(l)
    }
}

export type MainThreadCommProps = {
    disconnState: SWITCH_STATE
    earthConnState: SWITCH_STATE
    breakerUpon: BreakerProps
    onBreakerClick: BreakerClickHandler
}
export type BreakerBelowTwoColProps = {
    left: BreakerProps
    right: BreakerProps
}

export type GraphType1Props = {
    breakerBelow: BreakerProps,
    colors?: Pick<ColorMap, 'wire' | 'winding' | 'breaker'>
} & Omit<MainThreadCommProps, 'disconnState' | 'earthConnState'>

export const DeviceGraphType1: React.FC<GraphType1Props> = (props) => {

    const { breakerUpon, breakerBelow, onBreakerClick, colors } = props

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker2)
        breaker1.addChildren(transformer)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER,
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType2Props = {
    breakerBelow: BreakerProps
    colors?: ColorMap
} & Omit<MainThreadCommProps, 'earthConnState'>

export const DeviceGraphType2: React.FC<GraphType2Props> = (props) => {
    const { colors } = props
    const { breakerUpon, breakerBelow, disconnState, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const d = new DrawFuncTreeNode((outs) => disconnector(outs[0], disconnState))
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker), d)
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker2)
        breaker1.addChildren(transformer)
        d.addChildren(breaker1)
        layout.addCol({
            root: d,
            rowNum: d.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.DISCONNECTOR + ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER,
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType3Props = {
    breakerBelow: BreakerProps
    colors?: ColorMap
} & MainThreadCommProps
export const DeviceGraphType3: React.FC<GraphType3Props> = (props) => {
    const { colors } = props
    const { breakerUpon, breakerBelow, disconnState, earthConnState, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const d = new DrawFuncTreeNode((outs) => disconnector(outs[0], disconnState))
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker), d)
        const earth = new DrawFuncTreeNode(outs => earthConnector(outs[0], earthConnState, colors, 30), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), earth)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker2)
        earth.addChildren(transformer)
        breaker1.addChildren(earth)
        d.addChildren(breaker1)
        layout.addCol({
            root: d,
            rowNum: d.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.DISCONNECTOR + ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.EARTH_CONNECTOR,
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType4Props = {
    breakerBelow: BreakerBelowTwoColProps,
    colors?: Pick<ColorMap, 'wire' | 'winding' | 'breaker'>
} & Omit<MainThreadCommProps, 'disconnState' | 'earthConnState'>

export const DeviceGraphType4: React.FC<GraphType4Props> = (props) => {

    const { breakerUpon, breakerBelow, onBreakerClick, colors } = props

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire)
        transformer.addChildren(breaker2)
        transformer.addChildren(breaker3)
        breaker1.addChildren(transformer)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType5Props = {
    breakerBelow: BreakerBelowTwoColProps,
    colors?: ColorMap
} & Omit<MainThreadCommProps, 'earthConnState'>

export const DeviceGraphType5: React.FC<GraphType5Props> = (props) => {
    const { colors } = props
    const { breakerUpon, breakerBelow, disconnState, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const d = new DrawFuncTreeNode((outs) => disconnector(outs[0], disconnState))
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker), d)
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker2)
        transformer.addChildren(breaker3)
        breaker1.addChildren(transformer)
        d.addChildren(breaker1)
        layout.addCol({
            root: d,
            rowNum: d.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.DISCONNECTOR + ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType6Props = {
    breakerBelow: BreakerBelowTwoColProps
    colors?: ColorMap
} & MainThreadCommProps
export const DeviceGraphType6: React.FC<GraphType6Props> = (props) => {
    const { colors } = props
    const { breakerUpon, breakerBelow, disconnState, earthConnState, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const d = new DrawFuncTreeNode((outs) => disconnector(outs[0], disconnState))
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker), d)
        const earth = new DrawFuncTreeNode(outs => earthConnector(outs[0], earthConnState, colors, 50), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), earth)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker2)
        transformer.addChildren(breaker3)
        earth.addChildren(transformer)
        breaker1.addChildren(earth)
        d.addChildren(breaker1)
        layout.addCol({
            root: d,
            rowNum: d.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.DISCONNECTOR + ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.EARTH_CONNECTOR
        })

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

type RingMainUnitBranchProps = {
    earthConnState: SWITCH_STATE
    loadSwitchState: SWITCH_STATE
}
type RingMainUnitBranchColorMap = Pick<ColorMap, 'switch' | 'earth' | 'wire'>

const genRingMainUnitBranchTree = (props: RingMainUnitBranchProps, colorMap?: RingMainUnitBranchColorMap): LayoutTree => {
    const l = new DrawFuncTreeNode(outs => loadSwitch(outs[0], props.loadSwitchState, colorMap?.switch))
    const e = new DrawFuncTreeNode(outs => earthConnector(outs[0], props.earthConnState, colorMap), l)
    l.addChildren(e)
    return {
        root: l,
        rowNum: l.getMaxDepth(),
        heightSum: ELEMENT_HEIGHT.LOAD_SWITCH + 150,
        endStyle: 'arrow',
        colWidth: 46
    }
}

export type RMUThreadCommonProps = {
    middle: RingMainUnitBranchProps
    right: RingMainUnitBranchProps
    onBreakerClick: BreakerClickHandler
}

export type GraphType7Props = {
    left: Omit<MainThreadCommProps, 'disconnState' | 'earthConnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType7: React.FC<GraphType7Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], left.breakerUpon.switchState, left.breakerUpon.controlState, (e) => {
            onBreakerClick(left.breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], left.breakerBelow.switchState, left.breakerBelow.controlState, (e) => {
            onBreakerClick(left.breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker2)
        breaker1.addChildren(transformer)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER,
        })
        layout.addCol(genRingMainUnitBranchTree(middle, colors as RingMainUnitBranchColorMap))
        layout.addCol(genRingMainUnitBranchTree(right, colors as RingMainUnitBranchColorMap))
        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType8Props = {
    left: Omit<MainThreadCommProps, 'disconnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType8: React.FC<GraphType8Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, earthConnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const earth = new DrawFuncTreeNode(outs => earthConnector(outs[0], earthConnState, colors, 30), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), earth)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker2)
        earth.addChildren(transformer)
        breaker1.addChildren(earth)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.EARTH_CONNECTOR,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType9Props = {
    left: Omit<MainThreadCommProps, 'earthConnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType9: React.FC<GraphType9Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, disconnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const d = new DrawFuncTreeNode(outs => disconnector(outs[0], disconnState, colors), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), d)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker2)
        d.addChildren(transformer)
        breaker1.addChildren(d)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.DISCONNECTOR,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}
export type GraphType10Props = {
    left: Omit<MainThreadCommProps, 'onBreakerClick'> & {
        breakerBelow: BreakerProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType10: React.FC<GraphType10Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, disconnState, earthConnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const d = new DrawFuncTreeNode(outs => disconnectorWithEarth(outs[0], disconnState, earthConnState, colors), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => doubleWindingTransformer(outs[0], colors?.wire), d)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.switchState, breakerBelow.controlState, (e) => {
            onBreakerClick(breakerBelow, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker2)
        d.addChildren(transformer)
        breaker1.addChildren(d)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.DISCONNECTOR_WITH_EARTH,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}
export type GraphType11Props = {
    left: Omit<MainThreadCommProps, 'disconnState' | 'earthConnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerBelowTwoColProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType11: React.FC<GraphType11Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], left.breakerUpon.switchState, left.breakerUpon.controlState, (e) => {
            onBreakerClick(left.breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), breaker1)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], left.breakerBelow.left.switchState, left.breakerBelow.left.controlState, (e) => {
            onBreakerClick(left.breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], left.breakerBelow.right.switchState, left.breakerBelow.right.controlState, (e) => {
            onBreakerClick(left.breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(s.height(), s.width(), colors?.wire, 22)
        transformer.addChildren(breaker3)
        transformer.addChildren(breaker2)
        breaker1.addChildren(transformer)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER,
        })
        layout.addCol(genRingMainUnitBranchTree(middle, colors as RingMainUnitBranchColorMap))
        layout.addCol(genRingMainUnitBranchTree(right, colors as RingMainUnitBranchColorMap))
        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType12Props = {
    left: Omit<MainThreadCommProps, 'disconnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerBelowTwoColProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType12: React.FC<GraphType12Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, earthConnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const earth = new DrawFuncTreeNode(outs => earthConnector(outs[0], earthConnState, colors, 50), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), earth)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker3)
        transformer.addChildren(breaker2)
        earth.addChildren(transformer)
        breaker1.addChildren(earth)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.EARTH_CONNECTOR,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}

export type GraphType13Props = {
    left: Omit<MainThreadCommProps, 'earthConnState' | 'onBreakerClick'> & {
        breakerBelow: BreakerBelowTwoColProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType13: React.FC<GraphType13Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, disconnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const d = new DrawFuncTreeNode(outs => disconnector(outs[0], disconnState, colors), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), d)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker3)
        transformer.addChildren(breaker2)
        d.addChildren(transformer)
        breaker1.addChildren(d)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.DISCONNECTOR,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}
export type GraphType14Props = {
    left: Omit<MainThreadCommProps, 'onBreakerClick'> & {
        breakerBelow: BreakerBelowTwoColProps
    }
    colors?: ColorMap
} & RMUThreadCommonProps
export const DeviceGraphType14: React.FC<GraphType14Props> = (props) => {
    const { colors } = props
    const { left, middle, right, onBreakerClick } = props
    const { breakerUpon, breakerBelow, disconnState, earthConnState } = left

    const draw: KonvaDrawFunc = (s) => {
        const breaker1 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerUpon.switchState, breakerUpon.controlState, (e) => {
            onBreakerClick(breakerUpon, new GraphPointEvent(e))
        }, 'left', colors?.breaker))
        const d = new DrawFuncTreeNode(outs => disconnectorWithEarth(outs[0], disconnState, earthConnState, colors), breaker1)
        const transformer = new DrawFuncTreeNode((outs) => threeWindingTransformer(outs[0], colors?.wire), d)
        const breaker2 = new DrawFuncTreeNode((outs) => breaker(outs[0], breakerBelow.left.switchState, breakerBelow.left.controlState, (e) => {
            onBreakerClick(breakerBelow.left, new GraphPointEvent(e))
        }, 'left', colors?.breaker), transformer)
        const breaker3 = new DrawFuncTreeNode((outs) => breaker(outs[1], breakerBelow.right.switchState, breakerBelow.right.controlState, (e) => {
            onBreakerClick(breakerBelow.right, new GraphPointEvent(e))
        }, 'right', colors?.breaker), transformer)

        const layout = new GraphLayout(
            s.height(), s.width(), colors?.wire, 22
        )
        transformer.addChildren(breaker3)
        transformer.addChildren(breaker2)
        d.addChildren(transformer)
        breaker1.addChildren(d)
        layout.addCol({
            root: breaker1,
            rowNum: breaker1.getMaxDepth(),
            heightSum: ELEMENT_HEIGHT.BREAKER * 2 + ELEMENT_HEIGHT.TRANSFORMER + ELEMENT_HEIGHT.DISCONNECTOR_WITH_EARTH,
        })
        layout.addCol(genRingMainUnitBranchTree(middle))
        layout.addCol(genRingMainUnitBranchTree(right))

        layout.draw(s)
    }

    return <KonvaWrap draw={draw} />
}
