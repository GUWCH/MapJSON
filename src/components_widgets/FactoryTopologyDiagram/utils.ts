import { POINT_TABLE } from "@/common/constants/point";
import { NumberUtil } from "@/common/utils";
import { RUN_STATE } from "DrawLib/constant";
import { FieldProps } from "DrawLib/shapes/domEles/FieldCard";
import { ICommonDynDataProps } from "DynData";
import msg from '@/common/lang'
const isZh = msg.isZh

export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export const convertRawValueToRunState = (raw?: string): RUN_STATE => {
    if (!raw) return RUN_STATE.MISSING

    const value = parseInt(raw);

    switch (value) {
        case 0: return RUN_STATE.RUNNING;
        case 1: return RUN_STATE.UNDER_MAINTENANCE;
        case 2: return RUN_STATE.FAULT;
        default: return RUN_STATE.MISSING
    }
}

export const dynAndPointToTips = (key: string, point: TPointWithCfg, dyn?: IDyn): {
    name: string
    value: string
    color?: string
    unit?: string
} => {
    const { convert, conditions, valueMap, showTitleCn, showTitleEn } = point.conf ?? {}
    let displayValue: string
    let color: string | undefined = undefined
    let unit = point.unit
    let name = (isZh ? point.nameCn : point.nameEn) || point.name
    if (dyn?.status_value === 0) {
        if (isZh && showTitleCn) {
            name = showTitleCn
        }
        if (!isZh && showTitleEn) {
            name = showTitleEn
        }

        if (point.tableNo == POINT_TABLE.YX) {
            const rawValue = dyn.raw_value ?? ''
            displayValue = dyn.display_value ?? ''
            color = valueMap?.[rawValue]?.color?.[0]
        } else {
            const rawValue = parseFloat(String(dyn.display_value ?? '').replace(/,/g, ''))
            let tempV = rawValue

            if (convert) {
                if ('coefficient' in convert) {
                    tempV = NumberUtil.multiply(tempV, convert.coefficient)
                    unit = convert.unit || unit
                }
                if ('decimal' in convert) {
                    NumberUtil.round(tempV, convert.decimal ?? 2)
                }
            }

            if (conditions) {
                const condition = conditions.find(c => rawValue < c.max && rawValue >= c.min)
                if (condition) {
                    color = condition.color
                }
            }

            displayValue = String(NumberUtil.addCommas(tempV))
        }
    } else {
        displayValue = ''
    }

    return {
        name: name,
        value: displayValue || '-',
        color: color,
        unit: unit
    }
}

export const dynAndPointToField = (key: string, point: TPointWithCfg, dyn?: IDyn): FieldProps => {
    const { convert, conditions, valueMap, showTitleCn, showTitleEn } = point.conf ?? {}

    const transform: ICommonDynDataProps['transform'] = {
        nameCn: showTitleCn,
        nameEn: showTitleEn,
        conditions: conditions,
        convert: {
            coefficient: convert && 'coefficient' in convert ? convert.coefficient : undefined,
            unit: convert && 'unit' in convert ? convert.unit : undefined,
            decimal: convert && 'decimal' in convert ? convert.decimal : undefined,
        },
        iconLeftValue: true,
        valueMap: Object.entries(valueMap ?? {}).reduce((p, c) => {
            const [key, styleConvert] = c
            return {
                ...p,
                [key]: {
                    // color: styleConvert.color?.[0],
                    background: styleConvert.color?.[0],
                }
            }
        }, {})
    }

    return {
        dynKey: key,
        valueColor: dyn?.line_color,
        valueBackground: dyn?.fill_color,
        value: dyn,
        unit: point.unit ?? '',
        nameCn: point.nameCn || point.name || '',
        nameEn: point.nameEn || point.name || '',
        tableNo: point.tableNo,
        fieldNo: point.fieldNo,
        transform
    }
}

export const getPointType = (p: TPoint): keyof typeof POINT_TABLE => {
    if (p.tableNo == POINT_TABLE.YX) {
        return 'YX'
    }
    if (p.tableNo == POINT_TABLE.YC) {
        return 'YC'
    }
    if (p.tableNo == POINT_TABLE.PROD) {
        return 'PROD'
    }
    if (p.tableNo == POINT_TABLE.FARM_STAT) {
        return 'FARM_STAT'
    }
    if (p.tableNo == POINT_TABLE.SOLAR_STAT) {
        return 'SOLAR_STAT'
    }
    return 'OTHER'
}

export const rawValueToRunState = (v: string | number | undefined): RUN_STATE => {
    if (v == 0) {
        return RUN_STATE.FAULT
    } else if (v == 1) {
        return RUN_STATE.RUNNING
    } else if (v == 2) {
        return RUN_STATE.UNDER_MAINTENANCE
    } else {
        return RUN_STATE.MISSING
    }
}