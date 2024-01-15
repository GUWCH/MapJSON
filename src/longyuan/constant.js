import Intl, { msgTag } from '../common/lang';
import { NumberUtil } from '../common/utils';

export const msg = msgTag('longyuan');

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

export const DOMAIN = {
    WIND: 'wind',
    SOLAR: 'solar'
};

// 1:正常运行；2:设备待机；3:设备维护；4:设备故障；5：通讯中断
export const STATUS = {
    RUN: 1,
    STANDBY: 2,
    FAULT: 4,
    MAINTAIN: 3,
    NO_CONNECT: 5
};

export const POINT_FLAG = {
    _FLAG_: '_FLAG_',
    _STATUS_: '_STATUS_',
    _HIDE_: '_HIDE_',
    CURVE: 'curve',
    LEFT_TOTAL: 'total',
    LEFT_ONE: 'left_one',
    LEFT_ONE_POWER: 'left_one_power',
    LEFT_TWO: 'left_two',
    LEFT_TWO_POWER: 'left_two_power',
    MAP_TOP_WIND1: 'map_top_wind1',
    MAP_TOP_WIND2: 'map_top_wind2',
    MAP_TOP_SOLAR1: 'map_top_solar1',
    MAP_TOP_SOLAR2: 'map_top_solar2',
    MAP_BOTTOM_WIND: 'map_bottom_wind',
    MAP_BOTTOM_SOLAR: 'map_bottom_solar',

    FAC_STATUS: 'fac_status',
    FAC_POWER: 'fac_power',
    FAC_THEORY_POWER: 'fac_theory_power',
    FAC_DAY_POWER: 'fac_day_power',
    FAC_GRID2: 'fac_grid2',
    FAC_WIND_ANNUAL: 'fac_wind_annual',
    FAC_WIND_CAPACITY: 'fac_wind_capacity',
    FAC_WIND_COUNT: 'fac_wind_count',
    FAC_WIND_SPEED: 'fac_wind_speed',
    FAC_SOLAR_ANNUAL: 'fac_solar_annual',
    FAC_SOLAR_CAPACITY: 'fac_solar_capacity',
    FAC_SOLAR_COUNT: 'fac_solar_count',
    FAC_SOLAR_RADIAT:'fac_radiat'
};

export const POINTS_CENTER = [{
    [POINT_FLAG._FLAG_]: POINT_FLAG.LEFT_TOTAL,
    name: msg('totalPower'), // 当前总功率
    alias: 'Farm.Statistics.WGEN.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.LEFT_ONE,
    name: msg('averageWindSpeed'), // 当前平均风速
    alias: 'Farm.WindStatistics.WNAC.WindSpeed',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'm/s',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.LEFT_ONE_POWER,
    name: msg('windPower'), // 当前风电功率
    alias: 'Farm.WindStatistics.WGEN.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.LEFT_TWO,
    name: msg('averageIrradiation'), // 当前辐照强度
    alias: 'Farm.SolarStatistics.Statics.Radiation',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'W/m²',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.LEFT_TWO_POWER,
    name: msg('solarPower'), // 当前光伏功率
    alias: 'Farm.SolarStatistics.Statics.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.CURVE,
    name: msg('monthPowerGen'), // 当前总电量
    alias: 'Farm.Statistics.WWPP.APProduction',
    tableNo: 35,
    fieldNo: 28,
    decimal: 0,
    unit: '万kWh',
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_TOP_WIND1,
    name: msg('capacityWind'), // 风机容量
    alias: 'Farm.WindStatistics.Statics.CapacitySum',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    unit: msg('tenMWh'),
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_TOP_WIND2,
    name: msg('countWind'), // 接入风场
    alias: 'Farm.WindStatistics.Statics.FarmCount',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: msg('seat'),
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_TOP_SOLAR1,
    name: msg('capacitySolar'), // 光伏容量
    alias: 'Farm.SolarStatistics.Statics.CapacitySum',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    unit: msg('tenMWh'),
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_TOP_SOLAR2,
    name: msg('countSolar'), // 接入光伏
    alias: 'Farm.SolarStatistics.Statics.FarmCount',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: msg('seat'),
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_WIND,
    [POINT_FLAG._STATUS_]: STATUS.RUN,
    name: msg('windStatus.run'), // 风正常运行数
    alias: 'Farm.WindStatistics.Statics.GS1',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_WIND,
    [POINT_FLAG._STATUS_]: STATUS.STANDBY,
    name: msg('windStatus.standby'), // 风待机数
    alias: 'Farm.WindStatistics.Statics.GS2',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_WIND,
    [POINT_FLAG._STATUS_]: STATUS.FAULT,
    name: msg('windStatus.fault'), // 风故障数
    alias: 'Farm.WindStatistics.Statics.GS4',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_WIND,
    [POINT_FLAG._STATUS_]: STATUS.MAINTAIN,
    name: msg('windStatus.maintain'), // 风维护数
    alias: 'Farm.WindStatistics.Statics.GS3',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_WIND,
    [POINT_FLAG._STATUS_]: STATUS.NO_CONNECT,
    name: msg('windStatus.noConnect'), // 风无连接数
    alias: 'Farm.WindStatistics.Statics.GS5',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_SOLAR,
    [POINT_FLAG._STATUS_]: STATUS.RUN,
    name: msg('solarStatus.run'), // 光正常运行数
    alias: 'Farm.SolarStatistics.Statics.GS1',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_SOLAR,
    [POINT_FLAG._STATUS_]: STATUS.FAULT,
    name: msg('solarStatus.fault'), // 光故障数
    alias: 'Farm.SolarStatistics.Statics.GS4',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_SOLAR,
    [POINT_FLAG._STATUS_]: STATUS.MAINTAIN,
    name: msg('solarStatus.maintain'), // 光维护数
    alias: 'Farm.SolarStatistics.Statics.GS3',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.MAP_BOTTOM_SOLAR,
    [POINT_FLAG._STATUS_]: STATUS.NO_CONNECT,
    name: msg('solarStatus.noConnect'), // 光无连接数
    alias: 'Farm.SolarStatistics.Statics.GS5',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}];

export const POINTS_FAC = [{
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_WIND_SPEED,
    name: msg('grid.windSpeed'), // 平均风速
    alias: 'Farm.Statistics.WNAC.WindSpeed',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'm/s',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_POWER,
    name: msg('grid.power'), // 实时功率
    alias: 'Farm.Statistics.WGEN.GenActivePW',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_THEORY_POWER,
    [POINT_FLAG._HIDE_]: true,
    name: '理论功率', // 理论功率
    alias: 'Farm.Statistics.WNAC.TheoryPowerSUM',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_SOLAR_RADIAT,
    name: msg('grid.radiation'), // 辐照强度
    alias: 'Farm.Statistics.Statics.Radiation',
    tableNo: 62,
    fieldNo: 9,
    decimal: 1,
    unit: 'W/m²',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_DAY_POWER,
    name: msg('grid.dayPowerGen'), // 当日发电量
    alias: 'Farm.Statistics.WWPP.APProduction',
    tableNo: 35,
    fieldNo: 29,
    decimal: 1,
    unit: '万kWh',
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_GRID2,
    name: msg('grid.monthPowerGen'), // 当月发电量
    alias: 'Farm.Statistics.WWPP.APProduction',
    tableNo: 35,
    fieldNo: 30,
    decimal: 1,
    unit: '万kWh',
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_GRID2,
    name: msg('grid.yearPowerGen'), // 当年发电量
    alias: 'Farm.Statistics.WWPP.APProduction',
    tableNo: 35,
    fieldNo: 31,
    decimal: 1,
    unit: '万kWh',
    factor: 0.0001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_WIND_ANNUAL,
    name: msg('grid.annualCompleteRate'), // 风年累计完成率
    alias: 'Farm.Statistics.WNAC.ApproCompRate',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    fixDecimal: 0,
    unit: '%',
    factor: 100 // 原始数未100处理
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_SOLAR_ANNUAL,
    name: msg('grid.annualCompleteRate'), // 光年累计完成率
    alias: 'Farm.Statistics.Statics.ApproCompRate',
    tableNo: 62,
    fieldNo: 9,
    decimal: 3,
    fixDecimal: 0,
    unit: '%',
    factor: 100 // 原始数未100处理
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_STATUS,
    name: msg('farmStatus'),
    alias: 'Farm.Statistics.Statics.FarmSts',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_WIND_CAPACITY,
    name: msg('capacity'),
    alias: 'Farm.Statistics.WNAC.CapacitySum',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_WIND_COUNT,
    name: msg('wtgCount'),
    alias: 'Farm.Statistics.WNAC.MachineCount',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_SOLAR_CAPACITY,
    name: msg('capacity'),
    alias: 'Farm.Statistics.Statics.CapacitySum',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2,
    unit: 'MW',
    factor: 0.001
}, {
    [POINT_FLAG._FLAG_]: POINT_FLAG.FAC_SOLAR_COUNT,
    name: msg('invCount'),
    alias: 'Farm.Statistics.Statics.MachineCount',
    tableNo: 62,
    fieldNo: 9,
    decimal: 0,
    unit: '',
    factor: 1
}];

const POINTS_MAP = {};
POINTS_CENTER.concat(POINTS_FAC).forEach(p => {
    const flag = p[POINT_FLAG._FLAG_];
    if(!POINTS_MAP[flag]){
        POINTS_MAP[flag] = Object.assign({}, p);
    }else{
        if(!Array.isArray(POINTS_MAP[flag])){
            POINTS_MAP[flag] = [POINTS_MAP[flag]];
        }
        POINTS_MAP[flag].push(Object.assign({}, p));
    }
});

export { POINTS_MAP };

export const HENAN_BOUNDARY_WGS84 = [
    ["110°21'34.8\"", "36°22'"],
    ["116°39'01.4\"", "31°23'"]
];

export const getWtgSvg = (fill='#ffffff') => {
    return `<svg preserveAspectRatio="none" width="72px" height="72px" viewBox="0 0 72 72" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0.50097656 0.50097656)">
      <path d="M0 0L70 0L70 70L0 70L0 0Z" fill="none" fill-rule="evenodd" stroke="none" />
      <path d="M35.9151 20.1083L35.9151 3.88789Q35.9151 3.69689 35.8964 3.50681Q35.8777 3.31673 35.8404 3.1294Q35.8031 2.94207 35.7477 2.75929Q35.6922 2.57652 35.6192 2.40006Q35.5461 2.2236 35.456 2.05515Q35.366 1.8867 35.2599 1.72789Q35.1538 1.56908 35.0326 1.42144Q34.9114 1.27379 34.7764 1.13874Q34.6413 1.00368 34.4937 0.88251Q34.346 0.761341 34.1872 0.655227Q34.0284 0.549114 33.86 0.459077Q33.6915 0.36904 33.515 0.295948Q33.3386 0.222855 33.1558 0.167411Q32.973 0.111967 32.7857 0.0747047Q32.5984 0.0374425 32.4083 0.0187212Q32.2182 0 32.0272 0L32.0252 0Q31.8342 0 31.6441 0.0187212Q31.4541 0.0374425 31.2667 0.0747047Q31.0794 0.111967 30.8966 0.167411Q30.7138 0.222855 30.5374 0.295948Q30.3609 0.36904 30.1925 0.459077Q30.024 0.549114 29.8652 0.655227Q29.7064 0.761341 29.5588 0.88251Q29.4111 1.00368 29.2761 1.13874Q29.141 1.27379 29.0198 1.42144Q28.8987 1.56908 28.7925 1.72789Q28.6864 1.8867 28.5964 2.05515Q28.5064 2.2236 28.4333 2.40006Q28.3602 2.57652 28.3047 2.75929Q28.2493 2.94207 28.212 3.1294Q28.1748 3.31673 28.156 3.50681Q28.1373 3.69689 28.1373 3.88789L28.1373 20.1083C23.606 21.7099 20.3595 26.0314 20.3595 31.1111C20.3595 31.8396 20.4263 32.5525 20.5541 33.2441L3.13789 43.2993Q2.80627 43.4908 2.51837 43.7432Q2.23047 43.9957 1.99736 44.2995Q1.76425 44.6033 1.59489 44.9467Q1.42553 45.2902 1.32642 45.66Q1.22731 46.0299 1.20227 46.412Q1.17722 46.7941 1.2272 47.1738Q1.27718 47.5534 1.40027 47.916Q1.52336 48.2786 1.71482 48.6102L1.71582 48.612Q1.81132 48.7774 1.92257 48.9326Q2.03383 49.0879 2.15976 49.2315Q2.2857 49.3751 2.4251 49.5057Q2.5645 49.6362 2.71603 49.7525Q2.86756 49.8688 3.02976 49.9696Q3.19196 50.0705 3.36326 50.155Q3.53456 50.2395 3.71332 50.3067Q3.89208 50.374 4.07657 50.4234Q4.26106 50.4729 4.44951 50.504Q4.63796 50.5351 4.82855 50.5476Q5.01914 50.5601 5.21004 50.5538Q5.40094 50.5476 5.5903 50.5227Q5.77967 50.4977 5.96568 50.4544Q6.15169 50.411 6.33255 50.3496Q6.51342 50.2882 6.68739 50.2094Q6.86136 50.1306 7.02678 50.035L24.4447 39.9788C25.5231 40.9017 26.7719 41.6313 28.1373 42.1139L28.1373 58.3333L20.3585 58.3333Q20.1675 58.3333 19.9775 58.3521Q19.7874 58.3708 19.6001 58.408Q19.4127 58.4453 19.2299 58.5007Q19.0472 58.5562 18.8707 58.6293Q18.6942 58.7024 18.5258 58.7924Q18.3574 58.8824 18.1985 58.9886Q18.0397 59.0947 17.8921 59.2158Q17.7444 59.337 17.6094 59.4721Q17.4743 59.6071 17.3532 59.7548Q17.232 59.9024 17.1259 60.0612Q17.0198 60.22 16.9297 60.3885Q16.8397 60.5569 16.7666 60.7334Q16.6935 60.9099 16.6381 61.0926Q16.5826 61.2754 16.5454 61.4627Q16.5081 61.6501 16.4894 61.8401Q16.4707 62.0302 16.4707 62.2212L16.4707 62.2232Q16.4707 62.4142 16.4894 62.6043Q16.5081 62.7944 16.5454 62.9817Q16.5826 63.169 16.6381 63.3518Q16.6935 63.5346 16.7666 63.711Q16.8397 63.8875 16.9297 64.056Q17.0198 64.2244 17.1259 64.3832Q17.232 64.542 17.3532 64.6897Q17.4743 64.8373 17.6094 64.9724Q17.7444 65.1074 17.8921 65.2286Q18.0397 65.3498 18.1985 65.4559Q18.3574 65.562 18.5258 65.652Q18.6942 65.7421 18.8707 65.8152Q19.0472 65.8882 19.2299 65.9437Q19.4127 65.9991 19.6001 66.0364Q19.7874 66.0737 19.9775 66.0924Q20.1675 66.1111 20.3585 66.1111L43.6939 66.1111Q43.8849 66.1111 44.075 66.0924Q44.265 66.0737 44.4524 66.0364Q44.6397 65.9991 44.8225 65.9437Q45.0052 65.8882 45.1817 65.8151Q45.3582 65.7421 45.5266 65.652Q45.6951 65.562 45.8539 65.4559Q46.0127 65.3498 46.1603 65.2286Q46.308 65.1074 46.443 64.9724Q46.5781 64.8373 46.6992 64.6897Q46.8204 64.542 46.9265 64.3832Q47.0326 64.2244 47.1227 64.056Q47.2127 63.8875 47.2858 63.711Q47.3589 63.5346 47.4144 63.3518Q47.4698 63.169 47.5071 62.9817Q47.5443 62.7944 47.563 62.6043Q47.5818 62.4142 47.5818 62.2232L47.5818 62.2212Q47.5818 62.0302 47.563 61.8401Q47.5443 61.6501 47.5071 61.4627Q47.4698 61.2754 47.4144 61.0926Q47.3589 60.9099 47.2858 60.7334Q47.2127 60.5569 47.1227 60.3885Q47.0326 60.22 46.9265 60.0612Q46.8204 59.9024 46.6992 59.7548Q46.5781 59.6071 46.443 59.4721Q46.308 59.337 46.1603 59.2158Q46.0127 59.0947 45.8539 58.9886Q45.6951 58.8824 45.5266 58.7924Q45.3582 58.7024 45.1817 58.6293Q45.0052 58.5562 44.8225 58.5007Q44.6397 58.4453 44.4524 58.408Q44.265 58.3708 44.075 58.3521Q43.8849 58.3333 43.6939 58.3333L35.9151 58.3333L35.9151 42.1139C37.2805 41.6313 38.5293 40.9017 39.6078 39.9788L57.0256 50.035Q57.1911 50.1306 57.365 50.2094Q57.539 50.2882 57.7199 50.3496Q57.9007 50.411 58.0867 50.4544Q58.2728 50.4977 58.4621 50.5227Q58.6515 50.5476 58.8424 50.5538Q59.0333 50.5601 59.2239 50.5476Q59.4145 50.5351 59.6029 50.504Q59.7914 50.4729 59.9758 50.4234Q60.1603 50.374 60.3391 50.3067Q60.5178 50.2395 60.6891 50.155Q60.8605 50.0705 61.0227 49.9696Q61.1849 49.8688 61.3364 49.7525Q61.4879 49.6362 61.6273 49.5057Q61.7667 49.3751 61.8927 49.2315Q62.0186 49.0879 62.1298 48.9326Q62.2411 48.7774 62.3366 48.612L62.3376 48.6102Q62.4331 48.4448 62.5119 48.2709Q62.5908 48.0969 62.6521 47.916Q62.7135 47.7352 62.7569 47.5491Q62.8003 47.3631 62.8252 47.1738Q62.8501 46.9844 62.8564 46.7935Q62.8626 46.6026 62.8501 46.412Q62.8377 46.2214 62.8065 46.033Q62.7754 45.8445 62.726 45.66Q62.6766 45.4756 62.6093 45.2968Q62.542 45.118 62.4575 44.9467Q62.373 44.7754 62.2722 44.6132Q62.1713 44.451 62.055 44.2995Q61.9388 44.148 61.8082 44.0086Q61.6776 43.8692 61.534 43.7432Q61.3904 43.6173 61.2352 43.506Q61.0799 43.3948 60.9145 43.2993L43.4983 33.2441C43.6261 32.5525 43.6929 31.8396 43.6929 31.1111C43.6929 26.0314 40.4464 21.7099 35.9151 20.1083ZM35.9151 31.1111C35.9151 28.9633 34.174 27.2222 32.0262 27.2222C29.8784 27.2222 28.1373 28.9633 28.1373 31.1111C28.1373 33.2589 29.8784 35 32.0262 35C34.174 35 35.9151 33.2589 35.9151 31.1111Z" transform="translate(2.973791 1.8393834)" fill="${fill}" fill-rule="evenodd" stroke="none" />
    </g>
  </svg>`;
};

export const getInvtSvg = (fill='#ffffff') => {
    return `<svg preserveAspectRatio="none" width="104px" height="100px" viewBox="0 0 104 100" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB" id="filter_1">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dx="0" dy="0" />
          <feGaussianBlur stdDeviation="6" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.09803922 0 0 0 0 0.39607844 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect0_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect0_dropShadow" result="shape" />
        </filter>
      </defs>
      <path d="M56.0368 0C57.5499 0 58.8679 1.03826 59.2309 2.5161L67.9024 37.8238C68.4149 39.9107 66.845 41.9279 64.7082 41.9279L37.2885 41.9279L37.2885 57.375L51.5476 57.375C53.2133 57.375 54.5898 58.6203 54.8077 60.2359L54.8377 60.6851C54.8377 62.5132 53.3647 63.9952 51.5476 63.9952L51.5476 63.9952L16.4525 63.9952C14.6354 63.9952 13.1623 62.5132 13.1623 60.6851C13.1623 58.857 14.6354 57.375 16.4525 57.375L16.4525 57.375L30.7082 57.375L30.7082 41.9279L3.29182 41.9279C1.14787 41.9279 -0.423349 39.898 0.101927 37.8068L8.97069 2.49911C9.33982 1.02955 10.654 0 12.1606 0L56.0368 0ZM7.51686 35.3077L30.7082 35.3033L30.7082 24.274L12.0656 24.274C11.4599 24.274 10.8924 24.1094 10.405 23.8221L7.51686 35.3077ZM57.6766 23.7725C57.1714 24.0903 56.5742 24.274 55.9345 24.274L55.9345 24.274L37.2885 24.274L37.2885 35.3033L60.5062 35.3077L57.6766 23.7725ZM53.4606 6.62019L37.2885 6.61578L37.2885 17.6538L55.9345 17.6538C56.0161 17.6538 56.0971 17.6568 56.1772 17.6627L53.4606 6.62019ZM30.7082 6.61578L14.7227 6.62019L11.9455 17.6627L12.0656 17.6538L30.7082 17.6538L30.7082 6.61578Z" transform="translate(18 18)" id="Combined-Shape" fill="${fill}" stroke="none" filter="url(#filter_1)" />
    </svg>`;
};

/**
 * 
 * @param {POINTS} point 
 * @param {String} nodeAlias 
 * @returns 
 */
export const getKey = (point, nodeAlias) => {
    let {tableNo, alias, fieldNo} = point;
    return `1:${tableNo}:${`${nodeAlias}.${alias}`}:${fieldNo}`;
};

/**
 * 
 * @param {String|Number} val 
 * @param {Object} point @see POINTS_CENTER @see POINTS_FAC
 */
export const FixVal = (val, point, defaultVal=0) => {
    if(typeof val === 'undefined' || val === null || val === '') return defaultVal;

    let { factor=1, decimal=0, fixDecimal } = point;

    val = NumberUtil.removeCommas(val);

    if(factor === 1) return val;

    return NumberUtil.multiply(val, factor, typeof fixDecimal === 'number' ? fixDecimal : decimal);
};