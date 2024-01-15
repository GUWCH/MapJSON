import { _dao } from "@/common/dao";
import { getTopologyAssetType, TopologyAssetType } from "@/common/utils";

export type TopologyAsset = ITopologyAsset & {
    assetType: TopologyAssetType
}

export const getTopologyStracture = async (alias: string): Promise<TopologyAsset[]> => {
    const data = await _dao.getTopologyStracture(alias) as ITopologyAsset[]
    const finalData = [] as TopologyAsset[]
    data.forEach(asset => {
        const tableNo = asset.table_no
        const type = asset.type
        const aType = getTopologyAssetType(tableNo, type)
        if (aType !== undefined) {
            finalData.push({
                ...asset,
                assetType: aType
            })
        }
    })
    return finalData
}
export const getDynData = (data: any): Promise<any> => _dao.getDynData(data)