import { POINT_FIELD, POINT_TABLE } from "@/common/constants";
import { daoIsOk, _dao } from "@/common/dao";
import { getTopologyAssetType, TopologyAssetType } from "@/common/utils";

export type TopologyAsset = ITopologyAsset & {
    assetType?: TopologyAssetType
}

export const getTopologyStracture = async (alias: string): Promise<TopologyAsset[]> => {
    const data = await _dao.getTopologyStracture(alias) as ITopologyAsset[]
    const finalData = [] as TopologyAsset[]
    data.forEach(asset => {
        const tableNo = asset.table_no
        const type = asset.type
        const aType = getTopologyAssetType(tableNo, type)
        finalData.push({
            ...asset,
            assetType: aType
        })
    })
    return finalData.sort((a, b) => a.order_no - b.order_no)
}
export const getDynData = (data: IDynData[]): Promise<IDyn[]> =>
    _dao.getDynData(data)
        .then(res => res.data)
        .catch(e => {
            console.error('get dyndata error', e)
            return []
        })

export const checkDevicePoint = (alias: string[]): Promise<{ [key: string]: boolean }> =>
    _dao.getAssetInfo(alias).then(res => {
        if (daoIsOk(res)) {
            const infoArr = res.data as IAssetInfo[]
            return infoArr.reduce((p, c) => {
                return {
                    ...p,
                    [c.alias]: c.is_exist
                }
            }, {})
        }
        return {}
    })

export const rename = (
    alias: string,
    tableNo: number | string,
    name: string
): Promise<void> => _dao.updatePoint([{
    alias,
    attribute: [{
        table_no: String(tableNo), //表的序号
        field_no: String(tableNo) === String(POINT_TABLE.YC) ? String(POINT_FIELD.WF_NAME_YC) : String(POINT_FIELD.WF_NAME_YX),
        field_name: "wf_name",//列的名字
        field_val: name//列的值
    }]
}])