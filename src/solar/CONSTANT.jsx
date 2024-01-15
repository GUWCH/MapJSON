import Intl from '../common/lang';
import ScadaCfg from '../common/const-scada';
import moment from 'moment';

// 通用数值位数
export const COMMON_DECIMAL = 2;

// 无效值符
export const SLOT = '--';

// 实时告警最大数量
export const ALARM_MAX = 100;
export const ALARM_LEVEL = {
    INFO: 1,
    WARN: 2,
    FAULT: 3
};
export const ALARM_LEVEL_STR = `${ALARM_LEVEL.WARN},${ALARM_LEVEL.FAULT}`;

export const HistoryCurveReq = {
    branch_para_list: '',
    curve: [],
    curve_type: "4097",
    id: '',
    start_time: '',
    end_time: '',
    interval_type: 1, // 0为秒，1为分钟，2为日，3为月，4为年（默认为0）
    sample_cycle: 1, // interval_type对应采样间隔值
    time_mode: '1' // start_time、end_time时间模式, 0为json格式, 1为标准时间字符串
};

export const HistoryCurveModel = {
    id: '',
    key: '', // 1:tableNo:alias:feildNo
    decimal: 0,
    sub_type: '4097',
    sub_type_x: '4097',
    arith_type: 'normal' //normal | subtract做差处理
};

export const COMMON_FLAG= {
    PAD: 'PAD',
    INVERTER: 'INVERTER',
    DC_COMBINER: 'DC_COMBINER',
    AC_COMBINER: 'AC_COMBINER',
    ENERGY_METER: 'ENERGY_METER',
    METER: 'METER',
    GRID_METER: 'GRID_METER',
    OTHER_METER: 'OTHER_METER',
    WEATHER_STATION: 'WEATHER_STATION'
};

/**
 * 场站Model里间隔类型值
 */
export const FAC_BAY_TYPE = {
    _nameKey: 'name',
    _valueKey: 'bay_value',
    PAD: 8,
    INVERTER: 7,
    DC_COMBINER: 10,
    AC_COMBINER: 15,
    ENERGY_METER: 11,
    GRID_METER: 12,
    OTHER_METER: 13,
    WEATHER_STATION: 9
};

/**
 * 列表控件间隔类型参数值
 */
export const LIST_BAY_TYPE = {
    WTG: 'wtg',
    PAD: 'pad',
    INVERTER: 'inverter',
    DC_COMBINER: 'combiner',
    AC_COMBINER: '15',
    ENERGY_METER: '11',
    GRID_METER: '12',
    OTHER_METER: '13',
    WEATHER_STATION: 'metstat'
};

/**
 * 列表控件接口设备类型参数值
 */
export const LIST_DEVICE_TYPE = {
    INVERTER: '432_6',
    DC_COMBINER: '432_8'
};

export const CONST_TYPE = {
    INVERTER_STATUS: {
        cn: '逆变器列表状态',
        en: 'Inverter List State'
    }[Intl.isZh ? 'cn' : 'en'],
    SOLAR_DEVICE_STATUS: {
        cn: '光伏设备状态',
        en: 'Solar Device State'
    }[Intl.isZh ? 'cn' : 'en']
};

export const STATUS_CONST_TYPE_NAME = {
    PAD: CONST_TYPE.SOLAR_DEVICE_STATUS,
    INVERTER: CONST_TYPE.INVERTER_STATUS,
    DC_COMBINER: CONST_TYPE.SOLAR_DEVICE_STATUS,
    AC_COMBINER: CONST_TYPE.SOLAR_DEVICE_STATUS,
    METER: CONST_TYPE.SOLAR_DEVICE_STATUS,
    WEATHER_STATION: CONST_TYPE.SOLAR_DEVICE_STATUS,

    DEFAULT: CONST_TYPE.SOLAR_DEVICE_STATUS
};

/**
 * 导航树里间隔类型值
 */
export const TREE_BAY_TYPE = {
    PAD: 'BAY_PADMOUNT',
    INVERTER: 'BAY_INVERTER',
    AC_COMBINER: 'BAY_COMBINER_AC',
    ENERGY_METER: 'BAY_ENERGYMETER',
    GRID_METER: 'BAY_GRIDMETER',
    OTHER_METER: 'BAY_OTHERMETER',
    WEATHER_STATION: 'BAY_METSTATION'
};

export const DATE_MOMENT_FORMAT = {
    DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
    DATE: 'YYYY-MM-DD',
    YEAR: 'YYYY',
    MONTH: 'MM',
    DAY: 'DD',
    TIME: 'HH:mm:ss',
    HOUR: 'HH',
    MINUTE: 'mm',
    SECOND: 'ss',
    YEAR_MONTH: 'YYYY-MM',
    HOUR_MINUTE: 'HH:mm',
    TIME_ZERO: '00:00:00',
    ZERO: '00',
    MINUTE_ZERO: ':00',
    SECOND_ZERO: ':00'
};

/**
 * convert scada custom date format to moment format
 * used to show custom format date
 */
export const DATE_CUSTOM_FORMAT = {
    DATE_TIME: ScadaCfg.getDateTimeFmt().replace(/yyyy/gi, 'YYYY').replace(/dd/gi, 'DD').replace(/ss/gi, 'ss') || DATE_MOMENT_FORMAT.DATE_TIME,
    DATE: ScadaCfg.getDateFmt().replace(/yyyy/gi, 'YYYY').replace(/dd/gi, 'DD') || DATE_MOMENT_FORMAT.DATE,
    YEAR_MONTH: ScadaCfg.getYearMonthFmt().replace(/yyyy/gi, 'YYYY') || DATE_MOMENT_FORMAT.YEAR_MONTH,
    YEAR_WEEK: (ScadaCfg.getYearMonthFmt().replace(/yyyy/gi, 'YYYY') || DATE_MOMENT_FORMAT.YEAR_MONTH).replace('MM', 'Wo')
};

export const DATE_TYPE = {
    DAY: 'date',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    TOTAL: 'total'
};

/**
 * 
 * @param {String} dateType @see DATE_TYPE
 * @returns {String}
 */
export const getMomentDateFormat = (dateType) => {

    switch(dateType){
        case DATE_TYPE.DAY:
            return DATE_CUSTOM_FORMAT.DATE;
        case DATE_TYPE.WEEK:
            return DATE_CUSTOM_FORMAT.YEAR_WEEK;
        case DATE_TYPE.MONTH:
            return DATE_CUSTOM_FORMAT.YEAR_MONTH;
        case DATE_TYPE.YEAR:
            return DATE_MOMENT_FORMAT.YEAR;
    }

    return '';
};

/**
 * 
 * @param {String} dateType @see DATE_TYPE
 * @param {Object} momentDate @see moment
 * @returns 
 */
export const getRangeChangedMomentDate = (dateType, momentDate) => {
    let dateRange = [];

    switch(dateType){
        case DATE_TYPE.DAY:
            const day = momentDate.format(DATE_MOMENT_FORMAT.DATE);
            const nextDay = momentDate.add(1, 'days').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${day} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextDay} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.WEEK:
            const firstDayOfWeek = momentDate.isoWeekday(1).format(DATE_MOMENT_FORMAT.DATE);
            const lastDayOfWeek = moment(firstDayOfWeek).add(7, 'days').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${firstDayOfWeek} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${lastDayOfWeek} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.MONTH:
            const month = momentDate.date(1).format(DATE_MOMENT_FORMAT.DATE);
            const nextMonth = momentDate.date(1).add(1, 'months').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${month} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextMonth} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.YEAR:
            const year = momentDate.month(0).date(1).format(DATE_MOMENT_FORMAT.DATE);
            const nextYear = momentDate.month(0).date(1).add(1, 'years').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${year} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextYear} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.TOTAL:
            dateRange = [
                '2010-01-01 00:00:00',
                `${moment().add(1, 'years').format(DATE_MOMENT_FORMAT.DATE)} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
    }

    return dateRange;
};