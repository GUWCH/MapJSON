import React from "react";
import { combinePointKey } from "@/common/utils/model";
import { useIntl, FormattedMessage } from "react-intl";

export const listIntl = (key) => {
    const intl = useIntl();
    return intl.formatMessage({id: `form.list.${key}`})
}

const listEleIntl = (key) => {
    return <FormattedMessage id = {`form.list.${key}`} />
}

export const functionList = [
    {
        fnKey: 'fn_filter',
        fnName: listEleIntl('fn_filter')
    },{
        fnKey: 'fn_label',
        fnName: listEleIntl('fn_label')
    },{
        fnKey: 'fn_info',
        fnName: listEleIntl('fn_info')
    },{
        fnKey: 'fn_overview',
        fnName: listEleIntl('fn_overview')
    },{
        fnKey: 'fn_quota',
        fnName: listEleIntl('fn_quota')
    },{
        fnKey: 'fn_grid',
        fnName: listEleIntl('fn_grid')
    },{
        fnKey: 'fn_statusstatics',
        fnName: listEleIntl('fn_statusstatics')
    },{
        fnKey: 'fn_overview_assoc',
        fnName: listEleIntl('fn_overview_assoc')
    }
]

export const typeList = [
    {
        value: 'farm',
        name: listEleIntl('farm')
    },{
        value: 'device',
        name: listEleIntl('device')
    }
]

/**
 * @deprecated
 * use {@link combinePointKey}
 */
export const getPointKey = (ele) => {
    let {table_no = '', alias = '', field_no = ''} = ele;
    return table_no + ":" + alias + ":" + field_no;
}