import { TopologyAssetType } from "@/common/utils"
import { PCS_GRAPH_TYPE } from "DrawLib/groups"
import { GRAPH_TYPE } from "DrawLib/groups/padGraph"
import { PadNode, ConverterNode, ConverterNodeGroup } from "."
import { PCS_DIAGRAM_TYPE } from "../PCSWiringDiagram"

// 三卷单pcs
export const mockTopology1: PadNode<ConverterNode> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE4,
    children: [
        Array.from({ length: 1 }, (_: any, i) => ({
            assetType: TopologyAssetType.converter,
            alias: 'converter.alias.PCS' + i,
            name: 'mock变流器' + i,
            subType: PCS_DIAGRAM_TYPE.TYPE1,
            battery: {
                assetType: TopologyAssetType.battery,
                alias: 'batteryAlias',
                name: 'mock电池组',
            },
            cluster: Array.from({ length: 18 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        }))
    ]
}

//两卷
export const mockTopology2: PadNode<ConverterNode> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE1,
    children: [
        Array.from({ length: 5 }, (_: any, i) => ({
            assetType: TopologyAssetType.converter,
            alias: 'converter.alias.PCS' + i,
            name: 'mock变流器' + i,
            subType: PCS_GRAPH_TYPE.TYPE1,
            battery: {
                assetType: TopologyAssetType.battery,
                alias: 'batteryAlias',
                name: 'mock电池组',
            },
            cluster: Array.from({ length: 2 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        })),
    ]
}

//三卷多pcs
export const mockTopology3: PadNode<ConverterNode> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE4,
    children: [
        Array.from({ length: 5 }, (_: any, i) => ({
            assetType: TopologyAssetType.converter,
            alias: 'converter.alias.PCS' + i,
            name: 'mock变流器' + i,
            subType: PCS_DIAGRAM_TYPE.TYPE3,
            battery: {
                assetType: TopologyAssetType.battery,
                alias: 'batteryAlias',
                name: 'mock电池组',
            },
            cluster: Array.from({ length: 10 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        })),
        Array.from({ length: 1 }, (_: any, i) => ({
            assetType: TopologyAssetType.converter,
            alias: 'converter.alias.PCS' + i,
            name: 'mock变流器' + i,
            subType: PCS_GRAPH_TYPE.TYPE1,
            battery: {
                assetType: TopologyAssetType.battery,
                alias: 'batteryAlias',
                name: 'mock电池组',
            },
            cluster: Array.from({ length: 8 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        }))
    ]
}

//三卷单pcs组
export const mockTopology1_group: PadNode<ConverterNodeGroup> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE4,
    children: [
        Array.from({ length: 1 }, (_: any, i) => ({
            converter: Array.from({ length: 48 }, (_: any, j) => ({
                subType: PCS_GRAPH_TYPE.TYPE1,
                assetType: TopologyAssetType.converter,
                alias: 'converterAlias' + i,
                name: 'mock变流器' + i,
            }))
            ,
            children: Array.from({ length: 50 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        })),
    ]
}
//两卷
export const mockTopology2_group: PadNode<ConverterNodeGroup> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE1,
    children: [
        Array.from({ length: 2 }, (_: any, i) => ({
            converter: Array.from({ length: 8 }, (_: any, j) => ({
                subType: PCS_GRAPH_TYPE.TYPE1,
                assetType: TopologyAssetType.converter,
                alias: 'converterAlias' + i,
                name: 'mock变流器' + i,
            }))
            ,
            children: Array.from({ length: 2 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        }))
    ]
}

//三卷多pcs组
export const mockTopology3_group: PadNode<ConverterNodeGroup> = {
    assetType: TopologyAssetType.pad,
    alias: 'mockPadAlias',
    name: 'mock箱变',
    subType: GRAPH_TYPE.TYPE4,
    children: [
        Array.from({ length: 2 }, (_: any, i) => ({
            converter: Array.from({ length: 5 }, (_: any, j) => ({
                subType: PCS_GRAPH_TYPE.TYPE1,
                assetType: TopologyAssetType.converter,
                alias: 'converterAlias' + i,
                name: 'mock变流器' + i,
            }))
            ,
            children: Array.from({ length: 30 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        })),
        Array.from({ length: 5 }, (_: any, i) => ({
            converter: Array.from({ length: 5 }, (_: any, j) => ({
                subType: PCS_GRAPH_TYPE.TYPE1,
                assetType: TopologyAssetType.converter,
                alias: 'converterAlias' + i,
                name: 'mock变流器' + i,
            }))
            ,
            children: Array.from({ length: 30 }, (_: any, j) => ({
                assetType: TopologyAssetType.batteryCluster,
                alias: 'batteryClusterAlias' + j,
                name: 'mock电池簇' + j,
            }))
        })),
    ]
}