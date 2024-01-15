import { getPointConfigurationI18nMap } from "../../i18n"
import type { PointGroup } from "./models"
import { notify } from 'Notify';
import { POINT_TABLE } from "@/common/constants/point";

const i18n = getPointConfigurationI18nMap()

export const convertRawPointToPoint = (p: IModelPoint): TPoint => {
    return {
        name: p.name_cn,
        nameCn: p.name_cn,
        nameEn: p.name_en,
        alias: p.alias,
        tableNo: p.table_no,
        fieldNo: p.field_no,
        constNameList: p.const_name_list,
        unit: p.unit
    }
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

export const group = (points: IModelPoint[]): PointGroup[] => {
    const ycGroup: PointGroup = { type: 'YC', name: i18n('yc'), points: [] }
    const yxGroup: PointGroup = { type: 'YX', name: i18n('yx'), points: [] }
    const dlGroup: PointGroup = { type: 'PROD', name: i18n('dl'), points: [] }
    const otherGroup: PointGroup = { type: 'OTHER', name: i18n('other'), points: [] }

    const resArr: PointGroup[] = [];

    points.forEach(point => {
        switch (String(point.table_no)) {
            case String(POINT_TABLE.YC): ycGroup.points.push(convertRawPointToPoint(point)); break
            case String(POINT_TABLE.YX): yxGroup.points.push(convertRawPointToPoint(point)); break
            case String(POINT_TABLE.PROD): dlGroup.points.push(convertRawPointToPoint(point)); break
            default: otherGroup.points.push(convertRawPointToPoint(point))
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
    if (otherGroup.points.length > 0) {
        resArr.push(otherGroup)
    }

    return resArr
}