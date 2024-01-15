import Intl, { msgTag } from '../../common/lang';
import {POINT_TABLE, POINT_FIELD, PROPS, DECIMAL} from '../../common/constants';

export const msg = msgTag('center');

export const CUS_FLAG = {
    FARM_COUNT: '__FARM_COUNT__',
    DAY_GENERATE: '__DAY_GENERATE__',
    CO2: '__CO2__',
    DAY_CO2: '__DAY_CO2__',
    PROFIT: '__PROFIT__',

    FARM_HOUR: '__FARM_HOUR__',
    FARM_POWER: '__FARM_POWER__',
    FARM_RADIAT: '__FARM_RADIAT__',
    FARM_CAPACITY: '__FARM_CAPACITY__',
    FARM_STATE: '__FARM_STATE__'
};

export const CENTER_POINTS = [{
    name: msg('Statics.CapacitySum'),
    alias: 'Statics.CapacitySum',
    unit: 'MWp',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: DECIMAL.COMMON,
    factor: 0.001,
    [PROPS.CAPACITY]: true
}, {
    name: msg('Statics.FarmCount'),
    alias: 'Statics.FarmCount',
    unit: '',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: 0,
    [CUS_FLAG.FARM_COUNT]: true
}, {
    name: msg('Statics.APProduction'),
    abbr: msg('siteProd'),
    alias: 'Statics.APProduction',
    unit: 'GWh',
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_TOTAL,
    decimal: DECIMAL.COMMON,
    factor: 0.000001,
    [PROPS.GENERATE]: true
}, {
    name: msg('Statics.Day_APProduction'),
    alias: 'Statics.APProduction',
    unit: 'MWh',
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_DAY,
    decimal: DECIMAL.COMMON,
    factor: 0.001,
    [CUS_FLAG.DAY_GENERATE]: true
}, {
    name: msg('Statics.GenActivePW'),
    alias: 'Statics.GenActivePW',
    unit: 'MW',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: DECIMAL.COMMON,
    factor: 0.001,
    [PROPS.POWER]: true
}, {
    name: msg('Statics.CO2Sum'),
    alias: 'Statics.CO2Sum',
    unit: msg('ton'),
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_TOTAL,
    decimal: DECIMAL.COMMON,
    [CUS_FLAG.CO2]: true
}, {
    name: msg('Statics.CO2Sum_Day'),
    alias: 'Statics.CO2Sum',
    unit: msg('ton'),
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_DAY,
    decimal: DECIMAL.COMMON,
    [CUS_FLAG.DAY_CO2]: true
}, {
    name: msg('Statics.Profit'),
    alias: 'Statics.Profit',
    unit: msg('CNY'),
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_DAY,
    decimal: DECIMAL.COMMON,
    factor: Intl.isZh ? 0.0001 : 0.001,
    [CUS_FLAG.PROFIT]: true
}];

export const SOLAR_POINTS = [{
    name: msg('solar.state'),
    alias: 'Statics.State',
    unit: '',
    tableNo: POINT_TABLE.YX,
    fieldNo: POINT_FIELD.VALUE,
    decimal: 0,
    [CUS_FLAG.FARM_STATE]: true
}, {
    name: msg('solar.APProductionHour'),
    alias: 'Statics.APProductionHour',
    unit: 'h',
    tableNo: POINT_TABLE.PROD,
    fieldNo: POINT_FIELD.PROD_DAY,
    decimal: DECIMAL.COMMON,
    [CUS_FLAG.FARM_HOUR]: true
}, {
    name: msg('solar.GenActivePW'),
    alias: 'Statics.GenActivePW',
    unit: 'MW',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: DECIMAL.COMMON,
    factor: 0.001,
    [CUS_FLAG.FARM_POWER]: true
}, {
    name: msg('solar.Radiation'),
    alias: 'Statics.Radiation',
    unit: 'W/㎡',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: DECIMAL.COMMON,
    [CUS_FLAG.FARM_RADIAT]: true
}, {
    name: msg('solar.CapacitySum'),
    alias: 'Statics.CapacitySum',
    unit: 'MWp',
    tableNo: POINT_TABLE.YC,
    fieldNo: POINT_FIELD.VALUE,
    decimal: DECIMAL.COMMON,
    factor: 0.001,
    [CUS_FLAG.FARM_CAPACITY]: true
}];
