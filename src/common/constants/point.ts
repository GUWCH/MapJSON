export const PROPS = {
    FLAG: '__FLAG__',
    SHOW: '__SHOW__',
    HIDDEN: '__HIDDEN__',
    FROZEN: '__FROZEN__',
    COLOR: '__COLOR__',
    STATICS: '__STATICS__',
    SIGMA: '__SIGMA__',
    AVERAGE: '__AVERAGE__',

    STATE: '__STATE__',
    CAPACITY: '__CAPACITY__',
    POWER: '__POWER__',
    GENERATE: '__GENERATE__',
    PR: '__PR__',
    RADIATION: '__RADIATION__',
    RADIA: '__RADIA__',
    HOUR: '__HOUR__'
};

export const VALUES = {
    SLOT: '--',
    UNKNOWN: 'unknown',
    NEGATIVE_ONE: -1
};

export const DECIMAL = {
    COMMON: 2
};

export const POINT_TABLE = {
    YX: 61,
    YC: 62,
    PROD: 35,
    OTHER: 'other',
    FARM_STAT: 'Farm.Statistics',
    SOLAR_STAT: 'Farm.SolarStatistics',
    STATUS: 'status',
    EVENT: 'event'
};
export type TPointType = keyof typeof POINT_TABLE
export type TPointTypes = typeof POINT_TABLE[TPointType][];

export const POINT_FIELD = {
    VALUE: 9,
    PROD_METER: 23,
    PROD_TOTAL: 28,
    PROD_DAY: 29,
    PROD_MONTH: 30,
    PROD_YEAR: 31,
    /** 遥测五防信号名 */
    WF_NAME_YC: 60,
    /** 遥信五防信号名 */
    WF_NAME_YX: 69
};
export type TPointFieldKey = keyof typeof POINT_FIELD
export type TPointFieldValue = (typeof POINT_FIELD)[TPointFieldKey]

/**
 * 是否有效数字
 * @param value 
 * @returns {boolean}
 */
const isValidNumber = (value?: number | string | null) => {
    return !(value === null || value === '' || value === undefined || isNaN(value as number));
}

/**
 * 
 * @param {TPoint} point 
 * @param {String} assetAlias 
 * @returns 
 * @deprecated 使用统一的封装 {@link ../utils/model.ts getDynKey}
 */
export const getPointKey = (point: TPoint & {table_no?: string | number, field_no?: string | number}, assetAlias) => {
    let {tableNo, alias, fieldNo, table_no, field_no} = point;
    // @ts-ignore
    tableNo = isValidNumber(tableNo) ? tableNo : isValidNumber(table_no) ? table_no : '';
    // @ts-ignore
    fieldNo = isValidNumber(fieldNo) ? fieldNo : isValidNumber(field_no) ? field_no : '';
    const farmSuffixAlias = '.Farm.Statistics';
    const splitStr = '.';
    const fixAssetAlias = (assetAlias.split(splitStr).length === 1 && alias) ? assetAlias + farmSuffixAlias : assetAlias;
    const fixAlias = alias.split(splitStr).slice(fixAssetAlias.split(splitStr).length - 5).join(splitStr);
    return `1:${tableNo}:${`${fixAssetAlias}${fixAlias ? `.${fixAlias}` : ''}`}:${fieldNo}`;
};