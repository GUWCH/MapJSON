import { getPointConfigurationI18nMap } from "../../i18n"
import type { PointGroup } from "."
import type { Point, RawPoint } from "./models"
import { notify } from 'Notify';
import { POINT_TABLE } from "@/common/constants";

const i18n = getPointConfigurationI18nMap()

const genPointKey = (alias: string, tableNo: number, fieldNo: number) => `${alias}-${tableNo}-${fieldNo}`

const isFromConfig = (p: Point | RawPoint): p is RawPoint => {
    return 'table_no' in p
}

export const convertRawPointToPoint = (p: RawPoint): Point => {
    return {
        key: genPointKey(p.alias, p.table_no, p.field_no),
        name: {
            cn: p.name_cn,
            en: p.name_en
        },
        alias: p.alias,
        tableNo: p.table_no,
        fieldNo: p.field_no,
        type: p.table_no,
        const_name_list: p.const_name_list,
        unit: p.unit
    }
}

export const group = (points: (Point | RawPoint)[]): PointGroup[] => {
    const ycGroup: PointGroup = { type: POINT_TABLE.YC, name: i18n('yc'), points: [] }
    const yxGroup: PointGroup = { type: POINT_TABLE.YX, name: i18n('yx'), points: [] }
    const dlGroup: PointGroup = { type: POINT_TABLE.PROD, name: i18n('dl'), points: [] }
    const otherGroup: PointGroup = { type: POINT_TABLE.OTHER, name: i18n('other'), points: [] }

    const resArr: PointGroup[] = [];

    points.forEach(p => {
        const point = isFromConfig(p) ? convertRawPointToPoint(p) : p
        switch (String(point.tableNo)) {
            case String(POINT_TABLE.YC): ycGroup.points.push(point); break
            case String(POINT_TABLE.YX): yxGroup.points.push(point); break
            case String(POINT_TABLE.PROD): dlGroup.points.push(point); break
            default: otherGroup.points.push(point)
        }
    });
    if (ycGroup.points.length > 0) {
        resArr.push(ycGroup);
    }
    if (yxGroup.points.length > 0) {
        resArr.push(yxGroup);
    }
    if (dlGroup.points.length > 0) {
        resArr.push(dlGroup);
    }
    if(otherGroup.points.length > 0){
        resArr.push(otherGroup)
    }

    return resArr
}

export const isValidTemplateName = (templateName) => {
    if (!templateName) {
        notify(i18n("template_name_required"))
        return false
    }
    if (/^\s+|\s+$/g.test(templateName)) {
        notify(i18n("template_name_space"))
        return false
    }
    if (/[\'\"\<\>\&]+/g.test(templateName)) {
        notify(i18n("template_name_special"));
        return false
    }
    return true
}