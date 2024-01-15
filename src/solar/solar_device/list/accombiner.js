import {msgTag} from '../../../common/lang';
const msg = msgTag('solardevice');

export default [{
    name: msg('CBBX.State'),
    alias: 'CBBX.State',  
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    isStatus: true
}, {
    name: msg('CBBX.Cur1'),
    alias: 'CBBX.CurDCIn1',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur2'),
    alias: 'CBBX.CurDCIn2',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur3'),
    alias: 'CBBX.CurDCIn3',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur4'),
    alias: 'CBBX.CurDCIn4',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur5'),
    alias: 'CBBX.CurDCIn5',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur6'),
    alias: 'CBBX.CurDCIn6',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur7'),
    alias: 'CBBX.CurDCIn7',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Cur8'),
    alias: 'CBBX.CurDCIn8',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.Ia'),
    alias: 'CBBX.Ia',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Ib'),
    alias: 'CBBX.Ib',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Ic'),
    alias: 'CBBX.Ic',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Ua'),
    alias: 'CBBX.Ua',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Ub'),
    alias: 'CBBX.Ub',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Uc'),
    alias: 'CBBX.Uc',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Uab'),
    alias: 'CBBX.Uab',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Ubc'),
    alias: 'CBBX.Ubc',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Uca'),
    alias: 'CBBX.Uca',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.APProduction'),
    alias: 'CBBX.APProduction',  
    unit: 'kWh',
    tableNo: 35,
    fieldNo: 29
}, {
    name: msg('CBBX.RPProduction'),
    alias: 'CBBX.RPProduction',  
    unit: 'kVarh',
    tableNo: 35,
    fieldNo: 29,
    hidden: true
}, {
    name: msg('CBBX.APConsumed'),
    alias: 'CBBX.APConsumed',  
    unit: 'kWh',
    tableNo: 35,
    fieldNo: 29,
    hidden: true
}, {
    name: msg('CBBX.RPConsumed'),
    alias: 'CBBX.RPConsumed',  
    unit: 'kVarh',
    tableNo: 35,
    fieldNo: 29,
    hidden: true
}, {
    name: msg('CBBX.CosPhi'),
    alias: 'CBBX.CosPhi',  
    unit: '',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Temp'),
    alias: 'CBBX.Temp',  
    unit: '℃',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.Freq'),
    alias: 'CBBX.Freq',  
    unit: 'Hz',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.I0'),
    alias: 'CBBX.I0',  
    unit: 'A',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.U0'),
    alias: 'CBBX.U0',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9,
    hidden: true
}, {
    name: msg('CBBX.GenActivePW'),
    alias: 'CBBX.GenActivePW',  
    unit: 'kW',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.GenReActivePW'),
    alias: 'CBBX.GenReActivePW',  
    unit: 'kVar',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX.ActPowOut'),
    alias: 'CBBX.ActPowOut',  
    unit: 'kVA',
    tableNo: 62,
    fieldNo: 9
}]