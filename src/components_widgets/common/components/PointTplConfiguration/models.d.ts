import { POINT_TABLE } from "@/common/constants"

export type Domain = {
    id: string
    name: string
    models: Model[]
}

export type Model = {
    id: string
    name: string
}

export type YXConst = {
    name: string
    name_en: string
    value: number
}

export type RawPoint = {
    name_cn: string
    name_en: string
    alias: string
    table_no: number
    field_no: number
    point_type: string
    model_level: number
    const_name_list?: YXConst[]
    unit?: string
    if_standard: boolean
}

export type Point = {
    key: string // alias-fieldNo-tableNo
    name: {
        cn?: string
        en?: string
    }
    alias?: string
    fieldNo: number
    tableNo: number
    type: typeof POINT_TABLE[keyof typeof POINT_TABLE]
    const_name_list?: YXConst[]
    unit?: string
}

export type PointWithConf = Point & { conf: PointConfiguration }

export type PointsTemplate = {
    id: string
    name: string
    name_en: string
    points: PointWithConf[]
}

export type TPointTypes = typeof POINT_TABLE[keyof typeof POINT_TABLE][];

/**
 * number 数值
 * progress 进度条
 * progress_step 分块进度条
 */
export type DisplayStyle = 'number' | 'progress' | 'progress_step'

/**
 * Condition 范围含头不含位
 */
export type ColorCondition = {
    min: number
    max: number
    color: string
}

/**
 * 系数转换
 */
export type CoeConvert = {
    coefficient: number
    unit: string
}
/**
 * 精度转换
 */
export type AccConvert = {
    decimal: number
}

/**
 * 用于遥信光字牌的条件设置
 */

export type LightPlateCondition = {
    value: string | number  // 遥信状态值
    background: string        // 背景填充色
    isTop: '0' | '1'     // 是否置顶
}

export type PointConfiguration = {
    showTitleEn?: string | null
    showTitleCn?: string | null
    displayStyle?: DisplayStyle
    conditions?: ColorCondition[] | null
    convert?: CoeConvert | AccConvert | (AccConvert & CoeConvert) | null
    valueMap?: {[key: string | number]: LightPlateCondition} | null
}