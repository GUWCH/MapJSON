import {msgTag} from '../../../common/lang';
const msg = msgTag('solardevice');

export default [{
    name: msg('CBBX1.State'),
    alias: 'CBBX.State',  
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    isStatus: true
}, {
    name: msg('CBBX1.Disperse'),
    alias: 'CBBX.Disperse',  
    unit: '%',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX1.TempAir'),
    alias: 'CBBX.TempAir',  
    unit: '℃',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX1.Vol'),
    alias: 'CBBX.Vol',  
    unit: 'V',
    tableNo: 62,
    fieldNo: 9
}, {
    name: msg('CBBX1.Power'),
    alias: 'CBBX.Power',  
    unit: 'kW',
    tableNo: 62,
    fieldNo: 9
}]