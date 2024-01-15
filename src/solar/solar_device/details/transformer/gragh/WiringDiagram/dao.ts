import { BaseDAO, EmptyList, LegalData } from "@/common/dao";

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

class GraphDao extends BaseDAO {
    constructor() {
        super('scada.graph');
    }

    /**
     * 获取间隔子类型
     * @param alias SD1.Matrix001.BTF001
     */
    getBayTypeSub = (alias: string): Promise<string | undefined> =>
        this.fetchData('/scadaweb/get_infoByAlias', {}, JSON.stringify({
            alias_list: [{ alias: alias }],
            para_list: [{ para: 'bay_type_sub' }]
        })).then(res => res.json()).then(res => {
            if (!LegalData(res)) {
                throw new Error("ilegal response when fetching device type by alias:" + alias);
            }
            return res.data[0].bay_type_sub
        })

    getDevicePoint = (alias: string, deviceType: DEVICE_TYPE): Promise<string[]> =>
        this.fetchData('/scadaweb/get_device_point', {}, JSON.stringify({
            bay_alias: alias,
            device_type: deviceType,
            point_type: -1,
            meter_reading_type: -1
        })).then(res => res.json()).then(res => {
            if (EmptyList(res)) {
                return []
            }
            return (res.data[0]?.device?.[0]?.point || []).map(p => p.alias);
        }).catch(e => {
            console.error('fetch device point error', e)
            return []
        });

    getDynData = (data: {
        id?: string
        key: string
        decimal?: number
    }[]): Promise<DynData[]> =>
        this.fetchData('/scadaweb/get_dyndata', {},
            JSON.stringify({ data: data.map(d => ({ id: d.id || '', key: d.key, decimal: d.decimal || 0 })) }))
            .then(res => res.json())
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