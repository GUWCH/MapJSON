import { useEffect, useState } from "react";
import { DECIMAL, POINT_FIELD, POINT_TABLE, TPointFieldKey, TPointFieldValue, TPointType, TPointTypes } from "../constants"
import { _dao, daoIsOk } from "../dao";
import { msgTag } from "../lang";
import _ from "lodash";
import { getPropertyIfExist } from "./object";
import { subtract } from "./number";

const commonI18n = msgTag('common')

const POINT_KEY_SEPARATOR = '_POINT_KEY_SEPARATOR_'
export const combinePointKey = (p: Pick<TPoint, 'alias' | 'fieldNo' | 'tableNo' | 'type' | 'ifStandard'> |
    (Pick<IModelPoint, 'alias' | 'field_no' | 'table_no' | 'type'> & { if_standard?: boolean })): string => {
    let fieldNo: string | number,
        tableNo: string | number,
        type: string;
    const alias = p.alias
    if ('tableNo' in p) {
        type = p.ifStandard ? '' : (p.type ?? '')
        tableNo = p.tableNo
        fieldNo = p.fieldNo
    } else {
        type = p.if_standard ? '' : (p.type ?? '')
        tableNo = p.table_no
        fieldNo = p.field_no
    }
    return `${tableNo}${POINT_KEY_SEPARATOR}${alias}${POINT_KEY_SEPARATOR}${fieldNo}${POINT_KEY_SEPARATOR}${type}`
}

export const parsePointKey = (key: string): TPointKeyObj => {
    const arr = key.split(POINT_KEY_SEPARATOR)
    if (arr.length < 3) {
        console.error('illegal point key', key)
        return {
            alias: '',
            tableNo: 0,
            fieldNo: 0,
        }
    }
    return {
        tableNo: parseInt(arr[0]),
        alias: arr[1],
        fieldNo: parseInt(arr[2]),
        type: arr[3]
    }
}

/**
 * 判断当前点是否满足型号限制
 */
export const ifPointMatchModel = (p: TPoint | IModelPoint, model: string = '') => {
    const type = p.type ?? ''
    if ('fieldNo' in p) {
        if (p.ifStandard) {
            return true
        }
    } else {
        if (p.if_standard) {
            return true
        }
    }
    return type.split(',').includes(model)
}

/**
 * 存在特殊场景：两个不同别名的测点使用了相同的名字，此时后端将两个测点组合在一起传递给了前端
 * 针对合并的测点拆分
 */
export const splitPointByAlias = (p: TPoint): TPoint[] => {
    const aliasArr = p.alias.split(',')
    return aliasArr.map(a => ({
        ...p,
        alias: a
    }))
}

export const convertModelPointToPoint = (mp: IModelPoint): TPoint => ({
    nameCn: mp.name_cn,
    nameEn: mp.name_en,
    name: '',
    alias: mp.alias,
    unit: mp.unit,
    type: mp.type,
    ifStandard: mp.if_standard,
    tableNo: mp.table_no,
    fieldNo: mp.field_no,
    // decimal: mp.decimal,
    // factor: string | number,
    // factorDecimal?: string | number,
    // factorUnit?: string
    buildInType: mp.built_in_type,
    constNameList: mp.const_name_list
})

export const combineToFullAlias = (assetAlias?: string, pointAlias?: string) => {
    if (!assetAlias || !pointAlias) {
        return assetAlias || pointAlias || ''
    }

    const farmSuffixAlias = '.Farm.Statistics';
    const splitStr = '.';
    const fixAssetAlias = (assetAlias.split(splitStr).length === 1 && pointAlias) ? assetAlias + farmSuffixAlias : assetAlias;
    const fixAlias = pointAlias.split(splitStr).slice(fixAssetAlias.split(splitStr).length - 5).join(splitStr);

    return `${fixAssetAlias}${fixAlias ? `.${fixAlias}` : ''}`
}

type DynKeyParams = {
    point: Pick<TPoint, 'alias' | 'fieldNo' | 'tableNo'> | Pick<IModelPoint, 'alias' | 'field_no' | 'table_no'>
    assetAlias: string
} | {
    fullAlias: string

    /**
     * pointType/tableNo 传入其一即可
     */
    pointType?: TPointType
    tableNo?: number

    /**
     * field/fieldKey 传入其一即可
     */
    field?: TPointFieldValue
    fieldKey?: TPointFieldKey
}

/**
 * 生成动态字请求所需key
 */
export const getDynKey = (params: DynKeyParams) => {
    if ('point' in params) {
        const { point, assetAlias } = params
        const fullAlias = combineToFullAlias(assetAlias, point.alias)
        const tableNo = 'tableNo' in point ? point.tableNo : point.table_no
        const fieldNo = 'fieldNo' in point ? point.fieldNo : point.field_no
        return `1:${tableNo}:${fullAlias}:${fieldNo}`
    } else {
        const { fullAlias, pointType, tableNo: pointTableNo, field, fieldKey } = params
        const tableNo = pointType ? POINT_TABLE[pointType] : pointTableNo
        const fieldNo = fieldKey ? POINT_FIELD[fieldKey] : field
        if (tableNo === undefined || fieldNo === undefined) {
            console.error('tableNo and fieldNo should be provided but not, actual:', tableNo, fieldNo)
        }
        return `1:${tableNo}:${fullAlias}:${fieldNo}`
    }
}

export const parseDynKey = (dynKey: string): { alias: string, tableNo: string, fieldNo: string } => {
    const arr = dynKey.split(':')
    return {
        alias: arr[2] ?? '',
        tableNo: arr[1] ?? '',
        fieldNo: arr[3] ?? ''
    }
}


/**
 * 模型私有点
 * @param domainId 
 * @param modelId 
 */
export const usePrivatePoints = (domainId?: string, modelId?: string) => {
    const [points, setPoints] = useState<TPoint[]>([])

    useEffect(() => {
        if (domainId && modelId) {
            _dao.getModelsById({
                domain_id: domainId,
                model_id: modelId,
                if_public: false
            }).then(res => {
                if (daoIsOk(res)) {
                    setPoints(res.data.filter(p => !p.if_standard).map(convertModelPointToPoint))
                } else {
                    console.error('fetch private points failed')
                }
            })
        }
    }, [domainId, modelId])

    return points
}

export const getPointTypeNameByType = (t: TPointType) => {
    switch (t) {
        case "YX": return getPointTypeNameByTableNo(POINT_TABLE.YX)
        case "YC": return getPointTypeNameByTableNo(POINT_TABLE.YC)
        case "PROD": return getPointTypeNameByTableNo(POINT_TABLE.PROD)
        case "FARM_STAT": return getPointTypeNameByTableNo(POINT_TABLE.FARM_STAT)
        case "SOLAR_STAT": return getPointTypeNameByTableNo(POINT_TABLE.SOLAR_STAT)
        default: return getPointTypeNameByTableNo(POINT_TABLE.OTHER)
    }
}

export const getPointTypeNameByTableNo = (n: number | string) => {
    switch (n) {
        case POINT_TABLE.YC: return commonI18n('yc')
        case POINT_TABLE.YX: return commonI18n('yx')
        case POINT_TABLE.PROD: return commonI18n('dl')
        default: return commonI18n('other')
    }
}

export const getDecimalFromPoint = (p?: Pick<TPointWithCfg, 'conf' | 'decimal' | 'unit'>) => {
    const convert = p?.conf?.convert ?? {}
    let pDecimal = _.toNumber(p?.decimal)
    if (Number.isNaN(pDecimal)) {
        pDecimal = DECIMAL.COMMON
    }

    const decimal = (getPropertyIfExist(convert, 'decimal') as number | undefined) ?? pDecimal
    return decimal
}

const _convertDigitalPointValue = (
    v: string | number | undefined,
    p?: Pick<TPointWithCfg, 'conf' | 'decimal' | 'unit'>
) => {
    if (v === undefined) return undefined
    let digitalV = _.toNumber(v)

    if (Number.isNaN(digitalV)) return undefined

    const convert = p?.conf?.convert ?? {}

    const coe = getPropertyIfExist(convert, 'coefficient') as number | undefined
    if (coe !== undefined) {
        digitalV *= coe
    }

    const decimal = getDecimalFromPoint(p)
    digitalV = _.round(digitalV, decimal)

    return digitalV.toFixed(decimal)
}

export const convertDigitalPointValue = (
    v: string | number | undefined,
    p?: Pick<TPointWithCfg, 'conf' | 'decimal' | 'unit'>,
    preV?: string | number
): string | undefined => {
    const currentValue = _convertDigitalPointValue(v, p)
    if (p?.conf?.isAccumulate) {
        const preValue = _convertDigitalPointValue(preV, p)
        if (preValue === undefined || currentValue === undefined) return undefined
        return subtract(parseFloat(currentValue), parseFloat(preValue), getDecimalFromPoint(p))
    } else {
        return currentValue
    }
}