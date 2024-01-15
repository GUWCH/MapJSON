import { LegalData, EmptyList, _dao } from "@/common/dao";
import { PCS_GRAPH_TYPE } from "DrawLib/groups";

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
    getBayTypeSub = (alias: string[]): Promise<{ [key: string]: PCS_GRAPH_TYPE }> => {
        return _dao.getInfoByAlias(alias.join(','), Array.from(alias, () => 'bay_type_sub').join(','))
            .then(res => {
                if (!LegalData(res)) {
                    throw new Error("ilegal response when fetching device type by alias:" + alias);
                }
                return (res.data as { alias: string, bay_type_sub: string }[])
                    .reduce((p, c) => ({ ...p, [c.alias]: parseInt(c.bay_type_sub) }), {})
            })
    }

    getDynData = (data: {
        id?: string
        key: string
        decimal?: number
    }[]): Promise<DynData[]> =>
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