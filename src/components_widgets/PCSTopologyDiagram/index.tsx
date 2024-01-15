import { EmptyList, daoIsOk, _dao } from '@/common/dao'
import { getPointKey } from '@/common/constants'
import Intl, { msgTag } from '@/common/lang'
import { TimerInterval } from '@/common/const-scada'
import { navTo, combineToFullAlias, aliasToDynDataKey } from '@/common/util-scada'
import { getTopologyAssetType, TopologyAssetType, NumberUtil, getAssetAlias } from '@/common/utils'
import { KonvaWrap } from '@/components'
import { HEALTH_STATE } from 'DrawLib/constant'
import { pcsGraph, PCSGraphOptions, PCSGraphState, PCS_GRAPH_TYPE, PCSGraphShapeType } from 'DrawLib/groups'
import padGraph, { GRAPH_TYPE, isThreeWinding, PadGraphOptions, PadGraphState } from 'DrawLib/groups/padGraph'
import { PCSGraphOutOptions } from 'DrawLib/groups/pcsGraph'
import { RowAndColLayoutBuilder, RowAndColLayoutItem } from 'DrawLib/layouts/RowAndCollLayout'
import { ILayoutEleContent, IRowAndColLayoutBuilder, IRowAndColLayoutItem, LinkPointProvider, LinkPointRegister, Point, ShapeElement } from 'DrawLib/model'
import combiner from 'DrawLib/shapes/combiner'
import pcs, { PCSOptions } from 'DrawLib/shapes/pcs'
import pcsConverterGroup, { PcsConverterGroupOptions, PcsConverterGroupStates } from 'DrawLib/shapes/pcsConverterGroup'
import rankGroup, { RankGroupState, RankOption } from 'DrawLib/shapes/rankGroup'
import toolTips from 'DrawLib/shapes/toolTips'
import { inform, point, wire } from 'DrawLib/utils'
import Konva from 'konva'
import { ActualStageInfo } from 'KonvaWrap'
import { default as lodash, default as _ } from 'lodash'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRecursiveTimeoutEffect } from 'ReactHooks'
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import { YC, YX } from '../common/constants/points'
import WidgetContext from '../common/context'
import { useWidgetContext } from '../common/hooks'
import { getPADDefaultAliasMap, PADPointAliasMap, PADPointAliasMapCfg, usePADDiagram } from '../PADWiringDiagram'
import { PCS_DIAGRAM_TYPE, usePcsGraphElement } from '../PCSWiringDiagram'
import { getDynData, getTopologyStracture, TopologyAsset } from './dao'
import { mockTopology1, mockTopology1_group, mockTopology2, mockTopology2_group, mockTopology3, mockTopology3_group } from './mock'
import { bindClick, clickable } from 'DrawLib/wrapper/eventHandlerWrapper'
import { getDebugFillRect, getFillRect } from 'DrawLib/layouts/placeholder'
import { convertSubTypeToGraphType } from '../PADWiringDiagram/utils'

export const isZh = Intl.isZh;
const i18n = (s:
    'pad' |
    'converter' |
    'battery' |
    'batteryCluster'
) => msgTag('ECSTopologyDiagram')(s)

const invYxMax = 3;
const padYxMax = 10;

export enum Domain {
    STORAGE = 'storage',
    SOLAR = 'solar'
}

type PosNode = TopologyTreeNode & {
    startX: number,
    startY: number,
    name: string,
    alias: string,
    No?: number, //叶子节点水平顺序
    children: PosNode[]
}

export type TopologyTreeNode = {
    assetType: TopologyAssetType
    alias: string
    name: string
}
type CommonNode = TopologyTreeNode & {
    children: CommonNode[]
}
export type PadNode<T extends ConverterNodeGroup | ConverterNode | CommonNode> = TopologyTreeNode & {
    subType: GRAPH_TYPE
    children: T[][]
}
export type ConverterNodeGroup = {
    converter: ConverterNode[]
    children: BatteryClusterNode[]
}
export type ConverterNode = TopologyTreeNode & {
    subType: number
    battery?: BatteryNode
    cluster?: BatteryClusterNode[]
}
const isConverterNodeGroup = (c: ConverterNodeGroup[][] | ConverterNode[][]): c is ConverterNodeGroup[][] => {
    return c[0] && 'converter' in (c[0][0] || {})
}
type BatteryNode = TopologyTreeNode
type BatteryClusterNode = TopologyTreeNode

export type TopologyHandler = (
    padArr: TopologyAsset[],
    converterArr: TopologyAsset[],
    batteryArr: TopologyAsset[],
    batteryClusterArr: TopologyAsset[]
) => void

export type SolarTopologyHandler = (
    padArr: TopologyAsset[], 
    inverterArr: TopologyAsset[], 
    strInverterArr: TopologyAsset[], 
    aCCombinerArr: TopologyAsset[], 
    dCCombinerArr: TopologyAsset[]
) => void

/**储能 */
const Diagram = React.memo(({ tree, padPointAliasMap }: {
    tree: PadNode<ConverterNode> | PadNode<ConverterNodeGroup>,
    padPointAliasMap: PADPointAliasMap,
}) => {
    const widgetContext = useWidgetContext()

    const [dynData, setDynData] = useState<{ [key: string]: number }>({})

    const { isGroup, converterAliasArr, batteryAliasArr, batteryAliasMap, batteryClusterAliasArr } = useMemo(() => {
        const cs = tree.children
        const converterAliasArr: string[] = []
        const batteryAliasArr: string[] = []
        const batteryAliasMap: { [key: string]: string } = {}
        const batteryClusterAliasArr: string[] = []
        const isGroup = isConverterNodeGroup(cs)
        if (!isGroup) {
            cs.flatMap(g => g).forEach(converter => {
                converterAliasArr.push(converter.alias)
                const battery = converter.battery
                const batteryCluster = converter.cluster
                if (battery) {
                    batteryAliasArr.push(battery.alias)
                    batteryAliasMap[converter.alias] = battery.alias
                }
                if (batteryCluster) {
                    batteryClusterAliasArr.push(...batteryCluster.map(b => b.alias))
                }
            })
        } else {
            cs.flatMap(g => g).forEach(group => {
                converterAliasArr.push(...group.converter.map(c => c.alias))
                batteryClusterAliasArr.push(...group.children.map(b => b.alias))
            })
        }
        return { isGroup, converterAliasArr, batteryAliasArr, batteryAliasMap, batteryClusterAliasArr }
    }, [tree])

    const { stateProducer: padStateProducer } = usePADDiagram(tree.alias, widgetContext.isDemo, padPointAliasMap)
    const { pcsStateProducer, simplePCSStateProducer } = usePcsGraphElement(converterAliasArr, widgetContext.isDemo, {
        isDynPCS: true,
        batteryAliasMap,
    })

    useRecursiveTimeoutEffect(() => [
        () => {
            if (widgetContext.isDemo) {
                return []
            }

            const cs = tree.children
            const batteryClusterNodes: TopologyTreeNode[] = []
            const converterNodes: TopologyTreeNode[] = []
            if (isConverterNodeGroup(cs)) {
                batteryClusterNodes.push(...cs.flatMap(groups => groups.flatMap(group => group.children)))
                converterNodes.push(...cs.flatMap(groups => groups.flatMap(group => group.converter)))
            } else {
                batteryClusterNodes.push(...cs.flatMap(converters => converters.flatMap(c => c.cluster || [])))
            }

            const reqParams: { key: string, decimal: number }[] = [
                ...batteryClusterNodes.flatMap(b => [
                    {
                        id: '',
                        key: aliasToDynDataKey(combineToFullAlias(b.alias, YC.RankSoC), 'YC'),
                        decimal: 0
                    },
                    {
                        id: '',
                        key: aliasToDynDataKey(combineToFullAlias(b.alias, YX.RankHealthStatus), 'YX'),
                        decimal: 0
                    },
                ]),
                ...converterNodes.map(c => ({
                    id: '',
                    key: aliasToDynDataKey(combineToFullAlias(c.alias, YX.PCSHealthStatus), 'YX'),
                    decimal: 0
                }))
            ]

            return getDynData(reqParams).then(res => {
                if (EmptyList(res)) {
                    return []
                }
                return res.data
            })
        },
        (res: {
            display_value: string,
            raw_value: string,
            fill_color: string,
            key: string,
            line_color: string,
            status_value: number,
            timestamp: string
        }[]) => {
            const data = res.reduce((p, c) => {
                if (c.status_value === 0) {
                    if (NumberUtil.isValidNumber(c.raw_value)) {
                        return {
                            ...p,
                            [c.key]: parseInt(c.raw_value)
                        }
                    }
                    if (NumberUtil.isValidNumber(c.display_value)) {
                        return {
                            ...p,
                            [c.key]: parseFloat(c.display_value)
                        }
                    }
                }
                return p
            }, {})
            if (!lodash.isEqual(dynData, data)) {
                setDynData(data)
            }
        },
    ], TimerInterval as number, [tree, dynData, widgetContext.isDemo])

    return <KonvaWrap width={537} height={568} draw={(s: Konva.Stage, opt: ActualStageInfo) => {
        const l = new Konva.Layer()
        s.add(l)
        const padNode = tree
        const converterNodes = padNode.children

        const isThree = isThreeWinding(padNode.subType) && converterNodes[1] && converterNodes[1].length > 0 // 三卷场景
        const commonSize = {
            padWidth: 260,
            padMarginBottom: 10,
            otherAreaMarginRight: 20,
            converterGroupMinInterval: 16,
            converterMarginBottom: isGroup ? 30 : 10,
            rankMaxWidth: 20,

            width: 537,
            height: 568,
            converterAndClusterLayerInterval: 30,
            layerTitleWidth: 84,
            mainGraphWidth: 537 - 64 - 10 - 20,
            graghAreaPaddingRight: 20,
            layerTitleFontSize: 14
        }
        const size = isThree ? {
            ...commonSize,
            layerHeight: {
                pad: 159,
                others: 387,
            },
        } : {
            ...commonSize,
            layerHeight: {
                pad: 230,
                others: 316
            },
        }

        const PAD_KEY = 'pad'
        const CONVERTER_KEY_FUNC = (groupNo: number, index: number, converterGroupNo?: number) =>
            `converter_${groupNo}_${index}_${converterGroupNo}`
        const CLUSTER_KEY_FUNC = (groupNo: number, index: number, converterGroupNo?: number) =>
            `battery_cluster_${groupNo}_${index}_${converterGroupNo}`

        const getNameLabelContent = (text: string, position: 'top' | 'bottom' | 'center' = 'center'): ILayoutEleContent<undefined, undefined> => {
            return {
                drawFunc: (props) => {
                    const { width = 0, height = 0 } = props.rect
                    const start = props.start[0]
                    let originY: number
                    switch (position) {
                        case 'top': originY = start.y; break;
                        case 'bottom': originY = start.y + height - size.layerTitleFontSize - 2; break;
                        default: originY = start.y + height / 2 - size.layerTitleFontSize / 2
                    }
                    const origin = point(start.x, originY)
                    const ele = new Konva.Text({
                        x: origin.x,
                        y: origin.y,
                        width: width,
                        fontSize: size.layerTitleFontSize,
                        text: text,
                        fill: '#fff',
                        wrap: 'word'
                    })
                    return {
                        origin: props.start[0],
                        rect: { width, height },
                        start: [],
                        end: [],
                        ele
                    }
                }
            }
        }

        const padContext: ILayoutEleContent<PadGraphState, PadGraphOptions> = {
            key: PAD_KEY,
            stateProducer: padStateProducer,
            baseProps: {
                options: {
                    key: PAD_KEY,
                    endWithArrow: true,
                    label: { text: '#1', font: 14, width: 30, position:'left' }
                }
            },
            drawFunc: (props) => {
                props = props || {};
                props.options = props.options || {};
                props.options.eventHandlers = {
                    ...(props.options.eventHandlers || {}), 
                    click: () => {
                        navTo(padNode.alias)
                    }
                };
                return padGraph(props);
            }
        }

        /**单变流器含电池组 */
        const getConverterContent = (alias: string, groupNo: number, index: number, type: PCS_GRAPH_TYPE, converterGroupNo?: number): ILayoutEleContent<PCSGraphState, PCSGraphOptions, PCSGraphOutOptions> => ({
            key: CONVERTER_KEY_FUNC(groupNo, index, converterGroupNo),
            stateProducer: () => pcsStateProducer(alias),
            baseProps: {
                options: { type, withTopBreaker: true, pcsLabel: '#' + (index + 1), rankLabel: '#' + (index + 1) , data: {
                    pcs: alias,
                    battery: batteryAliasMap[alias]
                }}
            },
            drawFunc: (props) => {
                props = props || {};
                props.options = props.options || {};
                props.options.eventHandlers = {
                    ...(props.options.eventHandlers || {}), 
                    click: (key, e, opt) => {
                        if(opt.shapeType === PCSGraphShapeType.PCS){
                            navTo(opt.data.pcs)
                        }else if(opt.shapeType === PCSGraphShapeType.BATTERY_GROUP){
                            navTo(opt.data.battery)
                        }
                    }
                };
                return pcsGraph(props);
            }
        })

        /**单变流器 */
        const getSimpleConverterContent = (alias: string, groupNo: number, index: number, converterGroupNo?: number): ILayoutEleContent<HEALTH_STATE, PCSOptions> => ({
            key: CONVERTER_KEY_FUNC(groupNo, index, converterGroupNo),
            stateProducer: () => simplePCSStateProducer(alias),
            baseProps: {
                options: {
                    name: '#' + (index + 1),
                    nameProps: {
                        position: 'left',
                        width: 25,
                        font: 14
                    }
                }
            },
            drawFunc: (props) => {
                props = props || {};
                props.options = props.options || {};
                props.options.eventHandlers = {
                    ...(props.options.eventHandlers || {}), 
                    click: () => {
                        navTo(alias)
                    }
                };
                return pcs(props);
            }
        })

        /**变流器组 */
        const getConverterGroupContent = (
            converters: ConverterNode[],
            converterWidth: number,
            groupNo: number,
            index: number
        ): ILayoutEleContent<PcsConverterGroupStates, PcsConverterGroupOptions> => ({
            key: CONVERTER_KEY_FUNC(groupNo, index),
            baseProps: {
                options: {
                    converterWidth
                }
            },
            stateProducer: () => ({
                converters: converters.map(c => {
                    const status = dynData[aliasToDynDataKey(combineToFullAlias(c.alias, YX.PCSHealthStatus), 'YX')]
                    return {
                        ...c,
                        status: status === undefined ? HEALTH_STATE.MISSING : status
                    }
                })
            }),
            drawFunc: (props) => {
                props = props || {};
                props.options = props.options || {};
                props.options.eventHandlers = {
                    ...(props.options.eventHandlers || {}), 
                    click: (key, e, opt) => {
                        navTo(opt.data.alias)
                    }
                };
                return pcsConverterGroup(props);
            }
        })

        /**电池簇 */
        const getClusterContent = (nodes: BatteryClusterNode[], groupNo: number, index: number, options?: RankOption): ILayoutEleContent<RankGroupState, RankOption> => ({
            key: CLUSTER_KEY_FUNC(groupNo, index),
            stateProducer: () => {
                const ranks = nodes.map((n, i) => {
                    const status = dynData[aliasToDynDataKey(combineToFullAlias(n.alias, YX.RankHealthStatus), 'YX')]
                    return {
                        ...n,
                        name: (i + 1) + '',
                        status: status === undefined ? HEALTH_STATE.MISSING : status,
                        soc: dynData[aliasToDynDataKey(combineToFullAlias(n.alias, YC.RankSoC), 'YC')],
                    }
                })
                return { ranks }
            },
            baseProps: options ? {
                options: options
            } : undefined,
            drawFunc: (props) => {
                props = props || {};
                props.options = props.options || {};
                props.options.eventHandlers = {
                    ...(props.options.eventHandlers || {}), 
                    click: (key, e, opt) => {
                        navTo(opt.data.alias)
                    }
                };
                return rankGroup(props);
            }
        })


        /**
         * 初始化布局
         */
        const root = new RowAndColLayoutItem('col', {
            width: size.width,
            height: size.height,
            justifyContent: 'space-between',
            origin: point(0, 1),
        })

        // 箱变层
        const padLayerRow = new RowAndColLayoutItem('row', { height: size.layerHeight.pad, justifyContent: 'space-between' })
        root.addContent(padLayerRow)

        padLayerRow.addContent(
            new RowAndColLayoutItem('col', { width: size.layerTitleWidth }).addContent(getNameLabelContent(i18n('pad')))
        ).addContent(
            new RowAndColLayoutItem('row', { width: size.mainGraphWidth, padding: { right: size.graghAreaPaddingRight } })
                .addContent(new RowAndColLayoutItem('col', { width: size.padWidth })
                    .addContent(padContext)
                )
        )

        // 变流器层
        const converterAreaHeightRatio = isGroup ? 0.5 : 0.8
        const converterMaxWidth = isGroup ? 24 : 72
        const converterAndClusterLayerCount = isThree ? 2 : 1
        const converterAndClusterLayerHeight = isThree ?
            (size.layerHeight.others - size.converterAndClusterLayerInterval) / 2 :
            size.layerHeight.others
        const converterHeight = converterAreaHeightRatio * converterAndClusterLayerHeight
        const clusterHeight = converterAndClusterLayerHeight - converterHeight - size.converterMarginBottom

        let converterWidth: number,
            singleRankWidth: number,
            converterAreaInterval: number,
            rankInterval: number = 3
        
        
        if (isConverterNodeGroup(converterNodes)) {
            converterAreaInterval = 4
            const { converter, rank } = converterNodes.reduce((p, groups) => {
                const singleGroupWidth = (size.mainGraphWidth - (groups.length - 1) * size.converterGroupMinInterval) / groups.length
                const min = groups.reduce((p, group) => {
                    const converterWidth = (singleGroupWidth - converterAreaInterval * (group.converter.length - 1)) / group.converter.length
                    const rankWidth = (singleGroupWidth - rankInterval * (group.children.length - 1)) / group.children.length
                    return {
                        converter: Math.min(p.converter, converterWidth),
                        rank: Math.min(p.rank, rankWidth)
                    }
                }, {
                    converter: converterMaxWidth,
                    rank: size.rankMaxWidth
                })
                return {
                    converter: Math.min(p.converter, min.converter),
                    rank: Math.min(p.rank, min.rank)
                }
            }, {
                converter: converterMaxWidth,
                rank: size.rankMaxWidth
            })
            converterWidth = Math.max(converter, 1)
            singleRankWidth = Math.max(rank)
        } else {
            const converterWithLabelInterval = 60
            converterAreaInterval = 15

            converterWidth = Math.max(converterNodes.reduce((p, converters) => {
                const singleConverterWidth = (size.mainGraphWidth - (converters.length - 1) * converterWithLabelInterval) / converters.length
                return Math.min(p, singleConverterWidth)
            }, converterMaxWidth), 1)

            singleRankWidth = Math.max(converterNodes.reduce((p, converters) => {
                return Math.min(p, converters.reduce((p, converter) => {
                    const cluster = converter.cluster || []
                    const singleGroupWidth = (size.mainGraphWidth - (converters.length - 1) * converterAreaInterval) / converters.length
                    const bWidth = (singleGroupWidth - (cluster.length - 1) * rankInterval) / cluster.length
                    return Math.min(p, bWidth)
                }, size.rankMaxWidth))
            }, size.rankMaxWidth), 1)
        }

        for (let i = 0; i < converterAndClusterLayerCount; i++) {
            const groupNo = i
            let hasBattery = false
            const cbLayer = new RowAndColLayoutItem('row', { height: converterAndClusterLayerHeight, justifyContent: 'space-between', padding: { right: size.graghAreaPaddingRight, bottom: 4 } })
            root.addContent(cbLayer)

            if (!isConverterNodeGroup(converterNodes)) {
                hasBattery = converterNodes[i]?.find(c => c.subType < 2) !== undefined
            }

            const titleCol = new RowAndColLayoutItem('col', { width: size.layerTitleWidth, justifyContent: 'space-evenly' })
            cbLayer.addContent(titleCol)

            /**
             * bad practice
             * 手动计算pcs图元缩放比例以确定两个标题间距
             */
            const batteryHeightRatio = 0.4
            const converterScale = converterWidth / 72
            const titleInterval = isThree ? 60 * converterScale : 120 * converterScale
            const converterTitleHeight = (converterHeight - titleInterval) * (1 - batteryHeightRatio)
            const battaryTitleHeight = (converterHeight - titleInterval) * batteryHeightRatio
            if (hasBattery) {
                titleCol.addContent(
                    new RowAndColLayoutItem('col', { height: converterHeight, justifyContent: 'center' })
                        .addContent(new RowAndColLayoutItem('row', { height: converterTitleHeight }).addContent(
                            getNameLabelContent(i18n('converter'), 'bottom')
                        ))
                        .addContent(new RowAndColLayoutItem('row', { height: titleInterval }).addContent(
                            getFillRect()
                        ))
                        .addContent(new RowAndColLayoutItem('row', { height: battaryTitleHeight }).addContent(
                            getNameLabelContent(i18n('battery'), 'top')
                        ))
                )
            } else {
                titleCol.addContent(
                    new RowAndColLayoutItem('col', { height: converterHeight, justifyContent: 'center' })
                        .addContent(getNameLabelContent(i18n('converter')))
                )
            }

            titleCol.addContent(
                new RowAndColLayoutItem('col', { height: clusterHeight, justifyContent: 'flex-start' })
                    .addContent(
                        new RowAndColLayoutItem('row', { height: size.layerTitleFontSize }).addContent(
                            getNameLabelContent(i18n('batteryCluster'))
                        )
                    )
            )
            const mainCol = new RowAndColLayoutItem('row', {
                width: size.mainGraphWidth,
                justifyContent: 'space-evenly',
            })
            cbLayer.addContent(mainCol)

            if (!isConverterNodeGroup(converterNodes)) {// 单变流器
                const layerNodes = converterNodes[i] || []

                layerNodes.forEach((node, i, array) => {
                    const type = node.subType
                    const isSimple = type === PCS_DIAGRAM_TYPE.TYPE3
                    const converterAndClusterCol = new RowAndColLayoutItem('col', {
                        width: (size.mainGraphWidth - (array.length - 1) * converterAreaInterval) / array.length,
                        justifyContent: 'space-between',
                    })
                    mainCol.addContent(converterAndClusterCol)
                    const converterRow = new RowAndColLayoutItem('row', { height: converterHeight })
                        .addContent(new RowAndColLayoutItem('col', { width: converterWidth, justifyContent: 'space-between' })
                        .addContent(
                            isSimple ?
                                getSimpleConverterContent(node.alias, groupNo, i) :
                                getConverterContent(node.alias, groupNo, i, node.subType)
                        ))

                    const clusterContent = node.cluster ? getClusterContent(
                        node.cluster, groupNo, i,
                        { rankWidth: singleRankWidth, rankInterval: rankInterval }
                    ) : undefined
                    const clusterRow = new RowAndColLayoutItem('row', { height: clusterHeight }).addContent(
                        clusterContent
                    )
                    converterAndClusterCol.addContent(converterRow).addContent(clusterRow)

                })
            } else { // 变流器组
                const layerGroups = converterNodes[i] || []
                layerGroups.forEach((cGroup, i, array) => {
                    const groupWidth = (size.mainGraphWidth - (array.length - 1) * converterAreaInterval) / array.length
                    const converterAndClusterCol = new RowAndColLayoutItem('col', { width: groupWidth, justifyContent: 'space-between' })
                        .addContent(new RowAndColLayoutItem('row', { height: converterHeight }).addContent(
                            getConverterGroupContent(cGroup.converter, converterWidth, groupNo, i)
                        ))
                        .addContent(new RowAndColLayoutItem('row', { height: clusterHeight }).addContent(
                            getClusterContent(
                                cGroup.children, groupNo, i,
                                { rankWidth: singleRankWidth, rankInterval: rankInterval }
                            )
                        ))
                    mainCol.addContent(converterAndClusterCol)
                })
            }
        }

        const builder = new RowAndColLayoutBuilder(
            root,
            (g, provider) => {
                const { end: padEnds } = provider(PAD_KEY) || {}
                if (padEnds === undefined) {
                    return
                }
                padEnds.forEach((end, groupNo, ends) => {
                    if (groupNo > 1) { // 忽略环网的出口
                        return
                    }

                    const converters = converterNodes[groupNo] || []
                    const groupConverterStarts: Point[] = []
                    converters.forEach((c, i) => {
                        const converterKey = CONVERTER_KEY_FUNC(groupNo, i)
                        const { start: converterStarts = [], end: converterEnds = [] } = provider(converterKey) || {}
                        const converterStart = converterStarts[0]
                        const cgIn = converterStart && isGroup && point(converterStart.x, converterStart.y - size.padMarginBottom / 2)
                        converterStart && groupConverterStarts.push(cgIn || converterStart)
                        const converterEnd = converterEnds[0]

                        const clusterKey = CLUSTER_KEY_FUNC(groupNo, i)
                        const { start: clusterStarts = [] } = provider(clusterKey) || {}
                        const clusterStart = clusterStarts[0]

                        converterStart && cgIn && g.add(wire([converterStart, cgIn]))
                        converterEnd && clusterStart && g.add(wire([converterEnd, clusterStart]))
                    })

                    if (
                        isThreeWinding(padNode.subType) &&
                        converterNodes[0] && converterNodes[0].length === 1 &&
                        (!converterNodes[1] || converterNodes[1].length === 0)
                    ) {
                        //三卷接单变流器特殊处理
                        if (groupNo === 0) {
                            const outs = ends.slice(0, 2)
                            g.add(wire(outs))
                            const endsCentral = point((outs[0].x + outs[1].x) / 2, end.y)
                            g.add(wire([
                                endsCentral,
                                point(endsCentral.x, groupConverterStarts[0].y),
                                groupConverterStarts[0]
                            ]))
                        }
                    } else if (groupConverterStarts.length > 0) {
                        g.add(wire(groupConverterStarts))
                        if (groupNo === 0) {
                            g.add(wire([
                                end,
                                point(end.x, groupConverterStarts[0].y),
                                groupConverterStarts[0]
                            ]))
                        } else {
                            g.add(wire([
                                end,
                                point(end.x, end.y + size.padMarginBottom),
                                point(commonSize.width - commonSize.graghAreaPaddingRight / 2, end.y + size.padMarginBottom),
                                point(
                                    commonSize.width - commonSize.graghAreaPaddingRight / 2,
                                    groupConverterStarts[0].y
                                ),
                                groupConverterStarts[0]
                            ]))
                        }
                    }
                })
            })

        l.add(builder.build(opt).ele)
    }} />
}, (props, nextProps) => {
    if (!lodash.isEqual(props, nextProps)) return false;
    return true;
});

type SolarDiagramItem = {
    name: string;
    color: string;
    isSelfColor?: boolean;
    isSelfColorLink?: boolean;
    value: string;
};

/**
 * 光伏
 */
const SolarDiagram = React.memo(({ tree, padPointAliasMap, isDemo, yxValMap, depth }: {
    tree: PadNode<CommonNode>,
    padPointAliasMap: PADPointAliasMap,
    isDemo: boolean,
    yxValMap: { [alias: string]: SolarDiagramItem[] },
    depth: number
}) => {

    const padNode = tree;

    const { elementProducer: padEleProducer } = usePADDiagram(padNode.alias, isDemo, padPointAliasMap)

    const canvasSize = {
        width: 557,
        height: 583
    }

    return <KonvaWrap {...canvasSize} draw={(s: Konva.Stage) => {
        const l = new Konva.Layer();
        const toolTipL = new Konva.Layer();

        const size = {
            wireWidth: 2,
            padHeight: 510 - 110 * ((depth < 2 ? 2 : depth) - 1),
            padWidth: canvasSize.width - 180 * 2, //保证指标可以完整展示
            padExtend: 57,  // 防止接地箭头与下方水平线交叉
            marginBottom: 40,
            marginTop: 40,  // 通用连接上层的bottom
            // 第二层
            ac: {
                width: 28,
                height: 26
            },
            inverter: {
                width: 35,
                height: 21
            },
            // 底层
            lastFloorItemMaxWidth: 28,
            lastFloorItemsMargin: 10,
            /** 底层左边距, 父层宽度较大,而底层较小时getstart就不精确了, 导致父层位置溢出 */
            lastFloorMargin: 18
        }

        // 确定箱变的原始位置
        let rawPad = padEleProducer(
            point(0, 0),
            { height: size.padHeight, width: size.padWidth},
            { endWithArrow: true, startType: 'origin' }
        )

        if (!rawPad) {
            l.destroyChildren()
            l.destroy()
            toolTipL.destroy()
            toolTipL.destroyChildren()
            return
        }

        const padEndWithExtend = rawPad!.end[0].y + size.padExtend;

        // 底层设备宽度
        let lastFloorItemWidth = 0;

        // 计算最底层总数
        let totalCount = 0;
        let copyTree = JSON.parse(JSON.stringify(tree));
        let locTree = { ...copyTree, ...{ children: [] } };
        locTree.children = copyTree.children.map((groupChild) => {
            return {
                startX: 0,
                startY: padEndWithExtend + size.marginBottom,
                children: groupChild.map(child => {
                    if (child.children.length === 0) {  //假定下面挂了一个设备来占位
                        totalCount = totalCount + 1;
                    }
                    return {
                        ...child,
                        startX: 0,
                        startY: padEndWithExtend + size.marginBottom,
                        No: totalCount - 1,
                        children: child.children.map((leaf) => {
                            totalCount = totalCount + 1;
                            const middleFloorHeight = child.assetType === TopologyAssetType.inverter ? size.inverter.height : size.ac.height
                            return {
                                ...leaf,
                                startX: 0,
                                startY: padEndWithExtend + size.marginBottom + size.marginTop
                                    + middleFloorHeight + size.marginBottom + size.wireWidth, //第二层高度（包括上面连接到水平线的竖线）,
                                No: totalCount - 1
                            }
                        })
                    }
                })
            }
        })

        lastFloorItemWidth = Math.min((s.width() - 2 * size.lastFloorMargin - (totalCount - 1) * size.lastFloorItemsMargin) / totalCount, size.lastFloorItemMaxWidth)
        const lastFloorMargin = Math.max(size.lastFloorMargin, (s.width() - lastFloorItemWidth * totalCount - size.lastFloorItemsMargin * (totalCount - 1)) / 2)

        // 递归计算位置
        const getStart = (node: PosNode) => {
            if (!node) {
                return 0
            }

            let childrenNum = node.children?.length || 0;

            if (childrenNum === 0) {
                node.startX = lastFloorMargin + (lastFloorItemWidth + size.lastFloorItemsMargin) * (node.No ?? 0) + lastFloorItemWidth / 2
                return node.startX;
            }
            if (childrenNum === 1) {
                node.startX = getStart(node.children[0]);
                return node.startX;
            }

            if (childrenNum > 1) {
                node.children.forEach(child => {
                    getStart(child);
                })

                node.startX = (node.children[0].startX + node.children[childrenNum - 1].startX) / 2;
                return node.startX;
            }

            return 0;
        }

        getStart(locTree);

        const getPadDeviation = (pad: ShapeElement) => {
            let middleX = 0;
            let middleEndX = 0;
            let sum = 0;
            let endSum = 0;
            let len = locTree.children.length;

            if (!len) {
                return 0;
            }

            locTree.children.forEach(child => {
                sum += child.startX;
            })
            middleX = sum / len;

            pad.end.forEach((child, i) => {
                if (i < len) {
                    endSum += child.x;
                }
            })

            middleEndX = endSum / len;

            const padStartX = middleX - middleEndX;

            return padStartX;
        }

        const padStartX = getPadDeviation(rawPad);

        const pad = padEleProducer(
            point(padStartX, 0),
            { height: size.padHeight, width: size.padWidth},
            {
                endWithArrow: true,
                startType: 'origin',
            }
        );

        if (pad) {
            let padClickEle = clickable(pad, {}, {
                key: padNode.alias,
                eventHandlers: {
                    click: () => navTo(padNode.alias)
                }
            }).ele;
            l.add(padClickEle);
            toolTipL.add(toolTips(
                pad.ele,
                tree.name,
                [],
                s.width(),
                s.height(),
                undefined,
                padStartX + pad.rect.width / 2,
                0 + pad.rect.height / 2,
            ) as Konva.Group);

            let informIns = inform({
                shapeEle: pad,
                shapeRawH: size.padHeight,
                shapeRawW: size.padWidth,
                stageWidth: s.width(),
                stageHight: s.height(),
                needTitle: false,
                title: '',
                valList: (yxValMap[padNode.alias] || []).slice(0, padYxMax),
                position: 'left'
            });

            l.add(informIns.informGroup);
            informIns.textToolTipsArr.map(tip => {
                toolTipL.add(tip);
            }) 
        }

        const drawTree = (node: PosNode, floorNo, isFirstInverter = false) => {
            if(floorNo > 1){
                const wireIns = wire([{ x: node.startX, y: node.startY }, { x: node.startX, y: node.startY + size.marginTop }])
                l.add(wireIns);
            }

            let ins: ShapeElement | null = null;
            const valList = yxValMap[node.alias] || [];
            const selfColorVal = valList.filter(v => v.isSelfColor)[0] || {};
            const selfColorLinkVal = valList.filter(v => v.isSelfColorLink)[0] || {};

            const commonOptions = {
                needTooltip: true,
                toolTipData: {
                    deviceName: node.name,
                    stageWidth: s.width(),
                    stageHight: s.height(),
                    // 双测点控制图形颜色时优先使用isSelfColorLink的颜色, 配置里配置了非正常时的颜色即可
                    valList: selfColorLinkVal.color 
                        ? [{name: selfColorLinkVal.value, color: selfColorLinkVal.color}]
                        : selfColorVal ? [{name: selfColorVal.value, color: selfColorVal.color}] : []
                },
                // 双测点控制图形颜色时优先使用isSelfColorLink的颜色, 配置里配置了非正常时的颜色即可
                color: selfColorLinkVal.color || selfColorVal.color,
                key: node.alias,
                eventHandlers: {
                    click: () => navTo(node.alias)
                }
            };

            switch (node.assetType) {
                case TopologyAssetType.inverter:
                    ins = pcs({
                        start: [{ x: node.startX, y: node.startY + size.marginTop }],
                        rect: floorNo < depth ? size.inverter : {
                            width: lastFloorItemWidth
                        },
                        options: commonOptions
                    });

                    if(floorNo !== depth){
                        let pcsInformIns = inform({
                            shapeEle: ins,
                            shapeRawH: size.inverter.height,
                            shapeRawW: size.inverter.width,
                            stageWidth: s.width(),
                            stageHight: s.height(),
                            needTitle: false,
                            title: '',
                            valList: valList.slice(0, invYxMax),
                            position: isFirstInverter ? 'left' : 'right'
                        });
                        l.add(pcsInformIns.informGroup);
                        pcsInformIns.textToolTipsArr.map(tip => {
                            toolTipL.add(tip);
                        }) 
                    }
                    break;

                case TopologyAssetType.strInverter:
                    ins = pcs({
                        start: [{ x: node.startX, y: node.startY + size.marginTop }],
                        rect: floorNo < depth ? size.inverter : {
                            width: lastFloorItemWidth
                        },
                        options: commonOptions
                    });
                    break;

                case TopologyAssetType.acCombiner:
                    ins = combiner({
                        start: [{ x: node.startX, y: node.startY + size.marginTop }],
                        rect: size.ac,
                        options: {
                            isAc: true,
                            ...commonOptions
                        },

                    })
                    break;

                case TopologyAssetType.dcCombiner:
                    ins = combiner({
                        start: [{ x: node.startX, y: node.startY + size.marginTop }],
                        rect: floorNo < depth ? {} : {
                            width: lastFloorItemWidth
                        },
                        options: {
                            isAc: false,
                            ...commonOptions
                        }
                    })
                    break;
            }

            if (ins) {
                l.add(ins.ele);
                ins.toolTipIns && toolTipL.add(ins.toolTipIns);
            }

            if (ins && node.children && node.children.length > 0) {
                l.add(wire([ins?.end[0], { x: ins?.end[0].x, y: ins?.end[0].y + size.marginBottom }]))
            }

            if (node.children && node.children.length > 1) {
                const len = node.children.length;
                l.add(wire([
                    { x: node.children[0].startX, y: node.children[0].startY },
                    { x: node.children[len - 1].startX, y: node.children[len - 1].startY }]))
            }

            node.children.forEach((child, index) => {
                drawTree(child, floorNo + 1, isFirstInverter)
            })
        }

        locTree.children.forEach((
            child: PosNode,
            index: number
        ) => {
            if (pad?.end && index < pad?.end.length) {
                // 箱变下面连接线
                l.add(wire([
                    pad.end[index],
                    { x: pad.end[index].x, y: pad.end[index].y + size.padExtend },
                    { x: child.startX, y: pad.end[index].y + size.padExtend },
                    { x: child.startX, y: child.startY }
                ]))
                drawTree(child, 1, index === 0)
            }
        })

        rawPad.ele.destroy();

        s.add(l);
        s.add(toolTipL);
    }} />

}, (props, nextProps) => {
    if (!lodash.isEqual(props, nextProps)) return false;
    return true;
})

/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */

export type TopoQuota = {
    key: string,
    tableNo: number,
    type: number,
    quotas: {
        isSelfColor?: boolean,
        isSelfColorLink?: boolean,
        alias: string,
        name_cn: string,
        name_en: string,
        table_no: number,
        field_no: number,
        point_type: string,
        valueMap: {
            [key: number]: {
                color: string
            }
        }
    }[]
}
export type IPCSTopologyDiagramFormCfg = {
    domain?: Domain
    customAssetAlias?: string
    onTopologyLoad?: TopologyHandler
    onSolarTopologyLoad?: SolarTopologyHandler
    topoQuotas?: TopoQuota[]
} & Pick<PADPointAliasMapCfg, 'padPointMap'> & PageCardConfig

export const PCSTopologyDiagramDefaultCfg: IPCSTopologyDiagramFormCfg = {
};

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type IPCSTopologyDiagramOptions = IPCSTopologyDiagramFormCfg

export const PCSTopologyDiagramDefaultOptions: IPCSTopologyDiagramOptions = PCSTopologyDiagramDefaultCfg

export type PCSTopologyDiagramProps = {}

/**
 * 含光伏、储能
 * @param param0 
 * @returns 
 */
const PCSTopology: React.FC<{
    domain: Domain
    alias: string
    padPointAliasMap: PADPointAliasMap
    onTopologyLoad?: TopologyHandler,
    onSolarTopologyLoad?: SolarTopologyHandler,
    topoQuotas?: TopoQuota[]
}> = ({ domain, alias, padPointAliasMap, onTopologyLoad, onSolarTopologyLoad, topoQuotas }) => {

    const { isDemo } = useWidgetContext()
    const [topology, setTopology] = useState<{
        tree: PadNode<ConverterNode> | PadNode<ConverterNodeGroup> | PadNode<CommonNode>
    }>()
    const [yxValMap, setYxValMap] = useState<{
        [alias: string]: SolarDiagramItem[]
    }>({})

    const [devices, setDevices] = useState<TopologyAsset[]>([]);
    const depth = useRef<number>(0); // 拓扑树深度

    useLayoutEffect(() => {
        if (isDemo) {
            setTopology({ tree: mockTopology2 })
        } else {
            getTopologyStracture(alias).then(res => {

                let pad: TopologyAsset[] = []
                // 储能
                let converter: TopologyAsset[] = []
                let battery: TopologyAsset[] = []
                let batteryCluster: TopologyAsset[] = []
                // 光伏
                let inverter: TopologyAsset[] = []
                let strInverter: TopologyAsset[] = []
                let acCombine: TopologyAsset[] = []
                let dcCombine: TopologyAsset[] = []
                const assetChildrenMap: { [key: string]: TopologyAsset[] } = {}

                // debug
                /* res.forEach(d => {
                    switch(d.alias){
                        case 'SD1.Matrix001.INV001':
                            d.group_no = 0;
                            break;
                        case 'SD1.Matrix001.INV002':
                            d.group_no = 1;
                            break;
                        case 'SD1.Matrix001.INV001.CBBX001':
                            d.display_name = '光伏1_2#方正1逆变器1光伏1_1#方阵直流汇流箱直流汇流箱直流汇流箱直流汇流箱直流汇流箱直流汇流箱02';
                            break;
                    }
                });
                const two = res.slice(3, 5);
                Array.from(Array(7)).map(n => res = res.concat(two));
                res = res.concat(res.slice(5, 9)); */

                res.forEach(asset => {
                    if (asset.parent_alias) {
                        if (!assetChildrenMap[asset.parent_alias]) {
                            assetChildrenMap[asset.parent_alias] = []
                        }
                        assetChildrenMap[asset.parent_alias].push(asset)
                    }
                    switch (asset.assetType) {
                        case TopologyAssetType.pad: { pad.push(asset); break; }
                        // 光伏
                        case TopologyAssetType.inverter: { inverter.push(asset); break; }
                        case TopologyAssetType.strInverter: { strInverter.push(asset); break; }
                        case TopologyAssetType.acCombiner: { acCombine.push(asset); break; }
                        case TopologyAssetType.dcCombiner: { dcCombine.push(asset); break; }
                        // 储能
                        case TopologyAssetType.converter: { converter.push(asset); break; }
                        case TopologyAssetType.battery: { battery.push(asset); break; }
                        default: { batteryCluster.push(asset) }
                    }
                })

                domain === Domain.STORAGE ? 
                    onTopologyLoad && onTopologyLoad(pad, converter, battery, batteryCluster)
                    :
                    onSolarTopologyLoad && onSolarTopologyLoad(pad, inverter, strInverter, acCombine, dcCombine)

                if (!_.isEqual(devices, [...pad, ...inverter, ...strInverter, ...acCombine, ...dcCombine])) {
                    setDevices([...pad, ...inverter, ...strInverter, ...acCombine, ...dcCombine])
                }

                if (pad.length === 0) {
                    console.error('no pad found in topology');
                    return
                } else {
                    depth.current = 1;  // 计算拓扑树深度
                }

                if (domain === Domain.STORAGE) {
                    if (converter[0] && converter[0].alias.split(',').length === 1) {
                        const getConverter = (groupNo: number): ConverterNode[] => {
                            const sorted = converter.filter(c => c.group_no === groupNo)
                                .sort((a, b) => a.order_no - b.order_no)
                            return sorted.map(c => {
                                const batteryOrCluster = assetChildrenMap[c.alias] ?? []
                                const battery = batteryOrCluster[0]?.assetType === TopologyAssetType.battery ? batteryOrCluster[0] : undefined
                                const clusterArr = battery ? assetChildrenMap[battery.alias] : batteryOrCluster
                                return {
                                    assetType: c.assetType,
                                    alias: c.alias,
                                    name: c.display_name,
                                    subType: c.sub_type,
                                    battery: battery ? {
                                        assetType: battery.assetType,
                                        alias: battery.alias,
                                        name: battery.display_name
                                    } : undefined,
                                    cluster: clusterArr ? clusterArr.map(c => ({
                                        assetType: c.assetType,
                                        alias: c.alias,
                                        name: c.display_name,
                                    })) : undefined
                                }
                            })
                        }

                        const root: PadNode<ConverterNode> = {
                            assetType: TopologyAssetType.pad,
                            alias: pad[0].alias,
                            name: pad[0].display_name,
                            subType: convertSubTypeToGraphType(pad[0].sub_type),
                            children: [
                                getConverter(0), getConverter(1)
                            ]
                        }
                        setTopology({
                            tree: root,
                        })
                    } else {
                        const getConverterGroup = (groupNo: number): ConverterNodeGroup[] =>
                            converter.filter(cg => cg.group_no === groupNo)
                                .map(cg => {
                                    const converterAlias = cg.alias.split(',')
                                    const converterNames = cg.display_name.split(',')
                                    const converterNodes = converterAlias.map((a, i) => ({
                                        assetType: TopologyAssetType.converter,
                                        alias: a,
                                        name: converterNames[i],
                                        subType: 2,
                                    }))
                                    const children = (assetChildrenMap[cg.alias] || []).map(b => ({
                                        assetType: b.assetType,
                                        alias: b.alias,
                                        name: b.display_name
                                    }))
                                    return {
                                        converter: converterNodes,
                                        children: children
                                    }
                                })

                        const root: PadNode<ConverterNodeGroup> = {
                            assetType: TopologyAssetType.pad,
                            alias: pad[0].alias,
                            name: pad[0].display_name,
                            subType: convertSubTypeToGraphType(pad[0].sub_type),
                            children: [
                                getConverterGroup(0), getConverterGroup(1)
                            ]
                        }
                        setTopology({
                            tree: root
                        })
                    }
                } else if (domain === Domain.SOLAR) {

                    // 判定集中式或组串式
                    const children = assetChildrenMap[pad[0].alias] || []
                    let padChildren = [children.filter(child => child.group_no === 0), children.filter(child => child.group_no === 1)];

                    const getTree = (node: TopologyAsset, assetChildrenMap: { [key: string]: TopologyAsset[] }, floor: number) => {
                        floor += 1;
                        depth.current = Math.max(depth.current, floor);
                        return {
                            assetType: node.assetType,
                            alias: node.alias,
                            name: node.display_name,
                            children: (assetChildrenMap[node.alias] || []).map(child => {
                                return getTree(child, assetChildrenMap, floor);
                            })
                        }
                    }

                    let floor = 1;
                    const root: PadNode<CommonNode> = {
                        assetType: TopologyAssetType.pad,
                        alias: pad[0].alias,
                        name: pad[0].display_name,
                        subType: convertSubTypeToGraphType(pad[0].sub_type),
                        children: padChildren.filter(groupChild => groupChild.length > 0).map((groupChild) => {
                            return groupChild.map(child => {
                                return getTree(child, assetChildrenMap, floor);
                            }
                            )
                        })
                    }

                    setTopology({
                        tree: root,
                    })
                }
            }).catch(e => {
                console.error(e)
            })
        }
    }, [isDemo, alias])

    useRecursiveTimeoutEffect(() => {
        let req: any[] = [];
        devices.map(d => {
            const { assetType, alias } = d;
            topoQuotas?.map((t) => {
                const { key, tableNo, type, quotas } = t;
                if (getTopologyAssetType(tableNo, type) === assetType) {
                    quotas.map(q => {
                        req.push({
                            id: alias,
                            key: getPointKey(q, alias),
                            decimal: 0
                        });
                    })
                }
            })
        })

        if (req.length === 0) return;
        return [() => {
            return _dao.getDynData(req);
        }, (res) => {
            if (daoIsOk(res)) {
                let dynMap = {};
                res.data.map(d => {

                    devices.map(device => {
                        const { assetType, alias } = device;
                        topoQuotas?.map((t) => {
                            const { key, tableNo, type, quotas } = t;
                            if (getTopologyAssetType(tableNo, type) === assetType) {
                                quotas.map(q => {
                                    const { name_cn, name_en, valueMap, isSelfColor, isSelfColorLink } = q;
                                    if (getPointKey(q, alias) === d.key) {
                                        if (dynMap[d.id]) {
                                            dynMap[d.id].push({
                                                name: isZh ? name_cn : name_en,
                                                color: valueMap[Number(d.raw_value)]?.color || '',
                                                isSelfColor: isSelfColor,
                                                isSelfColorLink: isSelfColorLink,
                                                value: d.display_value
                                            })
                                        } else {
                                            dynMap[d.id] = [{
                                                name: isZh ? name_cn : name_en,
                                                color: valueMap[Number(d.raw_value)]?.color || '',
                                                isSelfColor: isSelfColor,
                                                isSelfColorLink: isSelfColorLink,
                                                value: d.display_value
                                            }]
                                        }
                                    }
                                })
                            }
                        })
                    })
                })
                setYxValMap(dynMap);
            }
        }]
    }, TimerInterval as number, [topoQuotas, topology, isDemo, devices]);
    
    return <>
        {topology && (domain === Domain.STORAGE ?
            <Diagram
                {...topology as { tree: PadNode<ConverterNode> | PadNode<ConverterNodeGroup> }}
                padPointAliasMap={padPointAliasMap}
            />
            :
            <SolarDiagram
                {...topology as { tree: PadNode<CommonNode> }}
                padPointAliasMap={padPointAliasMap}
                isDemo={isDemo}
                yxValMap={yxValMap}
                depth={depth.current}
            />)}
    </>
}

/**
 * 含光伏、储能
 * @param props 
 * @returns 
 */
const PCSTopologyDiagramWidget: WidgetElement<IPCSTopologyDiagramFormCfg> = (props) => {
    const alias = !!props.isDemo ? 'demo' : getAssetAlias(props.assetAlias, props.configure.customAssetAlias)
    if (!alias) {
        console.error('empty asset alias');
        return <div></div>
    }

    const { domain = Domain.STORAGE } = props.configure

    return <WidgetContext.Provider value={{ componentId: props.id!, isDemo: !!props.isDemo }}>
        <PageCard {...props.configure}>
            <PCSTopology alias={alias}
                domain={domain}
                padPointAliasMap={props.configure.padPointMap || getPADDefaultAliasMap(domain === Domain.STORAGE)}
                onTopologyLoad={props.configure.onTopologyLoad}
                onSolarTopologyLoad={props.configure.onSolarTopologyLoad}
                topoQuotas={props.configure.topoQuotas}
            />
        </PageCard>
    </WidgetContext.Provider>
}

export { default as PCSTopologyDiagramForm } from './form'
export { PCSTopologyDiagramWidget as PCSTopologyDiagram }

