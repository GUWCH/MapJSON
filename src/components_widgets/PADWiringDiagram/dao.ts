
import { daoIsOk, LegalData, EmptyList, _dao } from "@/common/dao";
import { NumberUtil } from "@/common/utils";
import { GRAPH_TYPE } from "DrawLib/groups/padGraph";
import { convertSubTypeToGraphType } from "./utils";

/**
 * 如需新增定义，看scada中dao.js注释说明
 */
export enum DEVICE_TYPE {
    PAD = 'pad' // 箱变
}

export type DynData = {
    display_value: string
    fill_color: string
    id: string
    key: string //"1:61:SD1.Matrix001.BTF001.BXTF.LoadSwitchClose:9"
    line_color: string
    raw_value: string //"0"
    status: string // "遥信无效"
    status_value: number // 非0即为无效值
    timestamp: string // "2022-05-10 15:28:49"
}

class GraphDao {

    /**
     * 获取间隔子类型
     * @param alias SD1.Matrix001.BTF001
     */
    getBayTypeSub = (alias: string): Promise<GRAPH_TYPE | undefined> =>
        _dao.getInfoByAlias(alias, 'bay_type_sub')
            .then(res => {
                if (!LegalData(res)) {
                    throw new Error("ilegal response when fetching device type by alias:" + alias);
                }
                const type = res.data[0].bay_type_sub
                if (!NumberUtil.isValidNumber(type)) {
                    return
                } else {
                    return convertSubTypeToGraphType(parseInt(type))
                }
            })

    getBayTypeSubs = (alias: string[]): Promise<{ [key: string]: GRAPH_TYPE | undefined }> =>
        _dao.getInfoByAlias(alias.join(','), 'bay_type_sub')
            .then(res => {
                if (!LegalData(res)) {
                    throw new Error("ilegal response when fetching device type by aliasArr:" + alias.join(','));
                }
                return res.data.reduce((p, c) => {
                    const type = c.bay_type_sub
                    const alias = c.alias

                    if (!NumberUtil.isValidNumber(type)) {
                        return p
                    }

                    return {
                        ...p,
                        [alias]: convertSubTypeToGraphType(parseInt(type))
                    }
                }, {} as { [key: string]: GRAPH_TYPE | undefined })
            })


    checkDevicePoint = (alias: string[]): Promise<{ [key: string]: boolean }> => {
        return _dao.getAssetInfo(alias).then(res => {
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
    }


    getDynData = (data: IDynData[]): Promise<DynData[]> =>
        _dao.getDynData(data.map(d => ({ id: d.id || '', key: d.key, decimal: d.decimal || 0 })))
            .then(res => {
                if (EmptyList(res)) {
                    return []
                }
                return res.data as DynData[]
            })
            .catch(e => {
                console.error('fetch dyn data error', e);
                return []
            })
}

export default new GraphDao()