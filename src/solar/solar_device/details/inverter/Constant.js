import { msgTag } from '../../../../common/lang';
import { NumberUtil } from '../../../../common/utils';
import { DATE_TYPE } from '../../../CONSTANT';
import { getTheme } from '../../../../common/theme';

const msg = msgTag('solarinverter');
const theme = getTheme();

export const TAG = {
    IS_STATUS: '_IS_STATUS_',
    IS_START: '_IS_START_',
    IS_STOP: '_IS_STOP_',
    IS_TEXT1: '_IS_TEXT1_',
    IS_TEXT2: '_IS_TEXT2_',
    IS_TEXT3: '_IS_TEXT3_',
    IS_DISPERSE: '_IS_DISPERSE_',
    IS_FRAM_STAT: '_IS_FRAM_STAT_'
};

/**
 * properties of alias, tableNo, fieldNo must be required
 */
 export const POINTS = [{
    name: msg('start'),
    unit: '',
    alias: 'INVT.DI_Start',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0,
    coefficient: 1,
    [TAG.IS_START]: true
}, {
    name: msg('stop'),
    unit: '',
    alias: 'INVT.DI_Stop',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0,
    coefficient: 1,
    [TAG.IS_STOP]: true
}, {
    name: '状态',
    unit: '',
    alias: 'INVT.ListSts',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0,
    coefficient: 1,
    [TAG.IS_STATUS]: true
}, {
    name: msg('deviation'),
    unit: '%',
    alias: 'INVT.Disperse',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    coefficient: 100,
    [TAG.IS_DISPERSE]: true
}, {
    name: msg('model'), // 型号
    unit: '',
    alias: 'INVT',
    tableNo: 432,
    fieldNo: 15,
    decimal: 0,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('capacity'),
    unit: 'kW',
    alias: 'INVT',
    tableNo: 432,
    fieldNo: 22,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('internalTemp'),
    unit: '℃',
    alias: 'INVT.TempAir',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('efficiency'),
    unit: '%',
    alias: 'INVT.InvtEffi',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 100,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('gridFreq'),
    unit: 'Hz',
    alias: 'INVT.Freq',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('powerFactor'),
    unit: '',
    alias: 'INVT.CosPhi',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('inputPower'),
    unit: 'kW',
    alias: 'INVT.PVPowIn',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT1]: true
}, {
    name: msg('dcATotal'),
    unit: 'A',
    alias: 'INVT.CurDCTotal',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('dcVTotal'),
    unit: 'V',
    alias: 'INVT.VolDCTotal',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('activePower'),
    unit: 'kW',
    alias: 'INVT.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('reactivePower'),
    unit: 'kVar',
    alias: 'INVT.GenReActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('productionTotal'),
    unit: 'kWh',
    alias: 'INVT.APProduction',
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true,
    [DATE_TYPE.DAY]: {
        type: 'bar',
        color: theme.chartBarColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.WEEK]: {
        type: 'bar',
        color: theme.chartBarColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.MONTH]: {
        type: 'bar',
        color: theme.chartBarColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        type: 'bar',
        color: theme.chartBarColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        type: 'bar',
        color: theme.chartBarColor,
        curveArithType: 'subtract'
    }
}, {
    name: msg('productionToday'),
    unit: 'kWh',
    alias: 'INVT.APProduction',
    tableNo: 35,
    fieldNo: 29,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('fullCapabilityToday'),
    unit: 'h',
    alias: 'INVT.GenHourDaily',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    coefficient: 1,
    [TAG.IS_TEXT2]: true
}, {
    name: msg('Ua'),
    unit: 'V',
    alias: 'INVT.VolL1',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('Ub'),
    unit: 'V',
    alias: 'INVT.VolL2',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('Uc'),
    unit: 'V',
    alias: 'INVT.VolL3',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('Ia'),
    unit: 'A',
    alias: 'INVT.CurPh1',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('Ib'),
    unit: 'A',
    alias: 'INVT.CurPh2',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('Ic'),
    unit: 'A',
    alias: 'INVT.CurPh3',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('irradiation'), // 辐照是气象站采集,使用全场统计辐照
    unit: 'Wh/㎡',
    alias: 'Statics.RadiationKWH',
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 1,
    [TAG.IS_FRAM_STAT]: true,
    [DATE_TYPE.DAY]: {
        type: 'line',
        color: theme.chartLineColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.WEEK]: {
        type: 'line',
        color: theme.chartLineColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.MONTH]: {
        type: 'line',
        color: theme.chartLineColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        type: 'line',
        color: theme.chartLineColor,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        type: 'line',
        color: theme.chartLineColor,
        curveArithType: 'subtract'
    }
},{
    name: msg('PR'),
    unit: '%',
    alias: 'INVT.IPR',
    tableNo: 35,
    fieldNo: 29,
    decimal: 2,
    coefficient: 100,
    [TAG.IS_TEXT3]: true
}, {
    name: msg('PR'),
    unit: '%',
    alias: 'INVT.IPR',
    tableNo: 35,
    fieldNo: 28,
    decimal: 2,
    coefficient: 100,
    [DATE_TYPE.WEEK]: {
        type: 'line',
        color: theme.chartLineColor1,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.MONTH]: {
        type: 'line',
        color: theme.chartLineColor1,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.YEAR]: {
        type: 'line',
        color: theme.chartLineColor1,
        curveArithType: 'subtract'
    },
    [DATE_TYPE.TOTAL]: {
        type: 'line',
        color: theme.chartLineColor1,
        curveArithType: 'subtract'
    }
}];

/**
 * @param {POINTS} point 
 * @param {String} nodeAlias 
 * @returns 
 */
 export const getKey = (point, nodeAlias) => {
    let {tableNo, alias, fieldNo} = point;
    const isFarmStat = point[TAG.IS_FRAM_STAT];
    const splitStr = '.';

    // 使用场站统计点
    if(isFarmStat){
        nodeAlias = `${nodeAlias.split(splitStr)[0]}.Farm.Statistics`
    }

    if(!alias){
        alias = '';
    }else if(alias.split(splitStr).length === 1 && nodeAlias.split(splitStr).length === 4){

        // 组串时不需要一段别名
        alias = '';
    }else{
        alias = alias.split(splitStr).slice(nodeAlias.split(splitStr).length - 5).join(splitStr);
    }
    
    return `1:${tableNo}:${`${nodeAlias}${alias ? `.${alias}` : ''}`}:${fieldNo}`;
};

/**
 * 
 * @param {String|Number} val 
 * @param {Object} point @see POINTS
 */
 export const FixVal = (val, point) => {
    let { coefficient=1, decimal=0 } = point;
    if(coefficient === 1) return val;
    return NumberUtil.multiply(val, coefficient, decimal);
};
