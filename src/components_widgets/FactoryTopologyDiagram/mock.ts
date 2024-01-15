import { TopologyAssetType } from "@/common/utils"

const getLine = (lineAlias: string, subNum: number) => [
    {
        display_name: 'mock馈线' + lineAlias,
        alias: lineAlias,
        parent_alias: factoryAlias,
        order_no: 0,
        group_no: 0,
        level: 1,
        table_no: 0,
        type: 1,
        sub_type: 0,
        domain_id: 'domain_id',
        model_id: 'model_id',
        assetType: TopologyAssetType.line
    },
    ...Array.from({ length: subNum }, (_, i) => ({
        display_name: 'mock箱变',
        alias: lineAlias + 'padAlias' + i,
        parent_alias: lineAlias,
        order_no: 0,
        group_no: 0,
        level: 1,
        table_no: 0,
        type: 2,
        sub_type: 0,
        domain_id: 'domain_id',
        model_id: 'model_id',
        assetType: TopologyAssetType.pad
    })),
    ...Array.from({ length: subNum }, (_, i) => ({
        display_name: 'moccccccccccccccccccccccccccccccccc',
        alias: lineAlias + 'subAlias' + i,
        parent_alias: lineAlias + 'padAlias' + i,
        order_no: 0,
        group_no: 0,
        level: 1,
        table_no: 0,
        type: 3,
        sub_type: 0,
        domain_id: 'domain_id',
        model_id: 'model_id',
        assetType: TopologyAssetType.sys
    }))
]

const factoryAlias = 'factory-alias'

export const mockAssets: (ITopologyAsset & {
    assetType: TopologyAssetType
})[] = [
        {
            display_name: 'mock场站',
            alias: factoryAlias,
            parent_alias: '',
            order_no: 0,
            group_no: 0,
            level: 1,
            table_no: 61,
            type: 1,
            sub_type: 0,
            domain_id: 'domain_id',
            model_id: 'model_id',
            assetType: TopologyAssetType.factory
        },
        ...getLine('lineAlias1', 4),
        ...getLine('lineAlias2', 5),
    ]