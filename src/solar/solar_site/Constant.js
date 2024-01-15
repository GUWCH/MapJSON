import Intl, { msgTag } from '../../common/lang';
import { NumberUtil } from '../../common/utils';
import { COMMON_FLAG, DATE_TYPE } from '../CONSTANT';

const msg = msgTag('site');

export const TAG  = {
    RIGHT_BOTTOM: '_right_bottom_',
    DYNAMIC: '_dynamic_',
    STATISTICS: '_statistics_',
    IS_CAPACITY: '_capacity_',
    IS_POWER: '_power_',
    IS_GENERATE: '_generate_',
    IS_RADIATION: '_radiation_'
};

/**
 * alias, tableNo, fieldNo must be required in statistics property
 */
export const DEVICE_LIST = [{
    flag: COMMON_FLAG.INVERTER,
    name: msg('inverter'),
    statistics: [{
        alias: 'Statics.LS6',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    },{
        alias: 'Statics.LS5',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }],
    total: {
        alias: 'Statics.MachineCount',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }
}, {
    flag: COMMON_FLAG.AC_COMBINER,
    name: msg('ACBox'),
    statistics: [{
        alias: 'Statics.ACS2',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }],
    total: {
        alias: 'Statics.ACCount',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }
}, {
    flag: COMMON_FLAG.DC_COMBINER,
    name: msg('DCBox'),
    statistics: [{
        alias: 'Statics.DCS2',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }],
    total: {
        alias: 'Statics.DCCount',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }
}, {
    flag: COMMON_FLAG.PAD,
    name: msg('transformer'),
    statistics: [{
        alias: 'Statics.BTFS2',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }],
    total: {
        alias: 'Statics.BTFCount',
        tableNo: 62,
        fieldNo: 9,
        decimal: 0
    }
}];

/**
 * properties of alias, tableNo, fieldNo must be required
 */
export const POINTS = [{
    name: msg('capacity'),
    unit: 'MWp',
    alias: 'Statics.CapacitySum',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 0.001,
    [TAG.IS_CAPACITY]: true,
    [TAG.DYNAMIC]: true,
    [TAG.STATISTICS]: [DATE_TYPE.DAY]
}, {
    name: msg('temperature'),
    unit: '℃',
    alias: 'Statics.Temperature',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    coefficient: 1,
    [TAG.DYNAMIC]: true,
    [TAG.STATISTICS]: [DATE_TYPE.DAY]
}, {
    name: msg('genActivePW'),
    unit: 'MW',
    alias: 'Statics.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 0.001,
    [TAG.IS_POWER]: true,
    [TAG.DYNAMIC]: true,
    [DATE_TYPE.DAY]: {
        group: 1,
        type: 'line',
        color: '#00cdff',
        curveInterval: 300, //秒
        curveArithType: 'normal'
    }
}, {
    name: msg('production'),
    unit: 'MWh',
    alias: 'Statics.APProduction', // 发电量
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 0.001,
    [TAG.IS_GENERATE]: true,
    [TAG.STATISTICS]: [DATE_TYPE.DAY, DATE_TYPE.MONTH, DATE_TYPE.YEAR, DATE_TYPE.TOTAL],
    [DATE_TYPE.DAY]: {
        group: 0,
        type: 'bar',
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: '#00fffc' // 0% 处的颜色
            }, {
                offset: 1, color: '#00cdff' // 100% 处的颜色
            }]
        },
        curveArithType: 'subtract'
    },
    [DATE_TYPE.MONTH]: {
        group: 1,
        type: 'bar',
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: '#00fffc' // 0% 处的颜色
            }, {
                offset: 1, color: '#00cdff' // 100% 处的颜色
            }]
        },
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        group: 1,
        type: 'bar',
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: '#00fffc' // 0% 处的颜色
            }, {
                offset: 1, color: '#00cdff' // 100% 处的颜色
            }]
        },
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        group: 1,
        type: 'bar',
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: '#00fffc' // 0% 处的颜色
            }, {
                offset: 1, color: '#00cdff' // 100% 处的颜色
            }]
        },
        curveArithType: 'subtract'
    }
}, {
    name: msg('hour'),
    unit: 'h',
    alias: 'Statics.APProductionHour', // 等效利用小时
    tableNo: 35,
    fieldNo: 29,
    decimal: 1,
    coefficient: 1,
    [TAG.STATISTICS]: [DATE_TYPE.DAY],
    [TAG.DYNAMIC]: true,
}, {
    name: msg('hour'),
    unit: 'h',
    alias: 'Statics.APProductionHour', // 等效利用小时
    tableNo: 35,
    fieldNo: 28,
    decimal: 1,
    coefficient: 1,
    [TAG.STATISTICS]: [DATE_TYPE.MONTH, DATE_TYPE.YEAR, DATE_TYPE.TOTAL],
    [DATE_TYPE.MONTH]: {
        group: 0,
        type: 'line',
        color: '#00cdff',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        group: 0,
        type: 'line',
        color: '#00cdff',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        group: 0,
        type: 'line',
        color: '#00cdff',
        curveArithType: 'subtract'
    }
}, {
    name: msg('irradiation'),
    unit: 'Wh/㎡',
    alias: 'Statics.RadiationKWH', // 累计辐照
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_RADIATION]: true,
    [TAG.STATISTICS]: [DATE_TYPE.DAY, DATE_TYPE.MONTH, DATE_TYPE.YEAR, DATE_TYPE.TOTAL],
    [DATE_TYPE.DAY]: {
        group: 0,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.MONTH]: {
        group: 0,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        group: 0,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        group: 0,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    }
}, {
    name: msg('irradiance'),
    unit: 'W/㎡',
    alias: 'Statics.Radiation', // 辐照强度
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [DATE_TYPE.DAY]: {
        group: 1,
        type: 'line',
        color: '#e1ac32',
        curveInterval: 300, //秒
        curveArithType: 'normal'
    }
}, {
    name: msg('PR'),
    unit: '%',
    alias: 'Statics.IPR', // PR
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 100,
    [DATE_TYPE.MONTH]: {
        group: 1,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        group: 1,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        group: 1,
        type: 'line',
        color: '#e1ac32',
        curveArithType: 'subtract'
    }
}, {
    name: msg('revenue'),
    unit: msg('MCNY'),
    alias: 'Statics.Profit', // 收益
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 0.0001,
    coefficientEn: 0.001,
    [TAG.RIGHT_BOTTOM]: true,
    curveArithType: 'subtract'
}, {
    name: msg('CO2'),
    unit: msg('t'),
    alias: 'Statics.CO2Sum', // 减排
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 1,
    [TAG.RIGHT_BOTTOM]: true,
    curveArithType: 'subtract'
}];

/**
 * 获取场站统计点
 * @param {POINTS} point 
 * @param {String} nodeAlias 
 * @returns 
 */
export const getKey = (point, nodeAlias) => {
    let {tableNo, alias, fieldNo} = point;
    return `1:${tableNo}:${`${nodeAlias}.Farm.Statistics.${alias}`}:${fieldNo}`;
};

/**
 * 
 * @param {String|Number} val 
 * @param {Object} point @see DEVICE_LIST @see POINTS
 */
export const FixVal = (val, point) => {
    let { coefficient=1, coefficientEn, decimal=0 } = point;

    if(!Intl.isZh && typeof coefficientEn === 'number'){
        coefficient = coefficientEn;
    }

    if(coefficient === 1) return val;

    return NumberUtil.multiply(val, coefficient, decimal);
};
