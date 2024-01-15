import Notify from 'Notify';
import {scadaVar} from '../common/constants';

const ZINDEX = 3000;
export const notification = Notify({
    style:{
        top: 5,
        left: '50%',
        zIndex: ZINDEX
    }
});
export const notify = (message) => {
    notification.notice({
        content: message,
        duration: 3
    });
};

export const zoneRow = 6;
export const zoneCol = 6;

export const nameMax = 63;

export const dateTimeFormat = (scadaVar('g_field_date.time_format') || 'yyyy-MM-dd hh:mm:ss').toUpperCase();
export const timeFormat = 'HH:mm:ss';
export const dateFormat = (scadaVar('g_field_date.yyyy_MM_dd_format') || 'yyyy-MM-dd').toUpperCase();
export const calenderFormat = dateFormat;
export const stdDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

const NORMAL_NOISE_MODE = '0';
let Zone = {
    block_name: '',
    date_type: '',
    time_in: '',
    time_out: '',
    time_in_raw: '',
    time_out_raw: '',
    modes: [],
    wtg_alias_list: []
};
export const Mode = {
    noise_mode: NORMAL_NOISE_MODE,
    sector_in: '',
    sector_out: '',
    windspeed_in: '',
    windspeed_out: '',
};

export const getNoiseMode = () => {
    let temp = [];
    let matrix = zoneRow * zoneCol;
    for(let i = 0; i < matrix; i++){
        temp.push(Object.assign({}, Mode));
    }

    return Object.assign({}, Zone, {modes: temp});
};