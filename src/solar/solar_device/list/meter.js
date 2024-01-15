import {msgTag} from '../../../common/lang';
const msg = msgTag('solardevice');

export default [{
    name: msg('EMT.State'),
    alias: 'EMT.State',  
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    isStatus: true
}, {
    name: msg('EMT.APProduction'),
    alias: 'EMT.APProduction',
    unit: 'kWh',
    tableNo: 35,
    fieldNo: 28
}, {
    name: msg('EMT.APConsumed'),
    alias: 'EMT.APConsumed',  
    unit: 'kWh',
    tableNo: 35,
    fieldNo: 28
}]