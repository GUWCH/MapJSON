import ScadaCfg from '@/common/const-scada';
import { msgTag } from "@/common/lang";

const msg = msgTag("solar");

// 测点常量
// 装机容量
export const SITE_CAPACITY_POINT = "Statics.CapacitySum";
// 全场功率
export const SITE_POWER_POINT = "Statics.GenActivePW";
// 当日等效利用小时数
export const SITE_DAYHOUR_POINT = "Statics.APProductionHour";
// 辐照强度
export const SITE_RADIATION_POINT = "Statics.Radiation";


// 箱变运行统计
export const PAD_RUN_POINT = "Statics.BTFS1";
// 箱变故障统计
export const PAD_FAULT_POINT = "Statics.BTFS2";

// 交流汇流箱运行统计
export const AC_CBX_RUN_POINT = "Statics.ACS1";
// 交流汇流箱故障统计
export const AC_CBX_FAULT_POINT = "Statics.ACS2";

// 逆变器正常发电统计
export const INV_NORMAL_POINT = "Statics.LS1";
// 逆变器性能过低统计
export const INV_LOW_POWER_POINT = "Statics.LS2";
// 逆变器限功率运行统计
export const INV_LITMIT_POWER_POINT = "Statics.LS3";
// 逆变器非故障停机统计
export const INV_NO_FAULT_STOP_POINT = "Statics.LS4";
// 逆变器故障停机统计
export const INV_FAULT_STOP_POINT = "Statics.LS5";
// 逆变器无连接统计
export const INV_NO_CONN_POINT = "Statics.LS6";

// 直流汇流箱运行统计
export const DC_CBX_RUN_POINT = "Statics.DCS1";
// 直流汇流箱故障统计
export const DC_CBX_FAULT_POINT = "Statics.DCS2";

// 场站别名
export const SITE_ALIAS = ScadaCfg.getCurNodeAlias();


// 点表
// 箱变
export const PAD_STATE = "BXTF.State"; //状态
export const PAD_INPUT_POWER = "BXTF.ActPowPhBr1" // 高压侧功率，即输出功率
export const PAD_OUTPUT_POWER = "BXTF.OUTPUT_POWER" // 低压侧P21功率
export const PAD_LOW1_POWER = "BXTF.ActPowPhBr2"; // 低压侧P21功率，
export const PAD_LOW2_POWER = "BXTF.ActPowPhBr22"; // 低压侧P212功率，输入功率为低压侧两功率相加之和。
export const PAD_TEMP = "BXTF.Temp" //机内温度

// 交流汇流箱
export const CBX_STATE = "CBBX.State" // 状态
export const CBX_REGENPOWER = "CBBX.GenReActivePW" // 无功功率
export const CBX_GENPOWER = "CBBX.GenActivePW" // 有功功率
export const CBX_TEMP = "CBBX.Temp" // 机内温度
// 集中式逆变器
export const CENTRAL_INV_STATE = "INVT.ListSts";//状态
export const CENTRAL_INV_HOUR = "INVT.APProductionHour";//等效利用小时数
export const CENTRAL_INV_TEMP = "INVT.TempAir";//机内温度
export const CENTRAL_INV_RATE = "INVT.InvtEffi";//转换效率
// 组串式逆变器
export const STRING_INV_STATE = "ListSts"; // 状态
export const STRING_INV_DISPERSE = "Disperse";//离散率*100
export const STRING_INV_HOUR = "APProductionHour"; //等效利用小时数
export const STRING_INV_TEMP = "TempAir"; //机内温度
export const STRING_INV_RATE = "InvtEffi"; // 转换效率*100
// 直流汇流箱
export const DCCBX_STATE = "State"; // 状态
export const DCCBX_DISPERSE = "Disperse"; // 离散率*100

export const PAD_POINT = [{
    name: '',    
    alias: PAD_STATE,
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0
}, {
    name: '',
    alias: PAD_INPUT_POWER,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: PAD_LOW1_POWER,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: PAD_LOW2_POWER,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: PAD_TEMP,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
}];

export const ACCBX_POINT = [{
    name: '',    
    alias: CBX_STATE,
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0
}, {
    name: '',
    alias: CBX_REGENPOWER,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: CBX_GENPOWER,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: CBX_TEMP,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
}];

export const INV_POINT = [{
    name: '',    
    alias: CENTRAL_INV_STATE,
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0
}, {
    name: '',
    alias: CENTRAL_INV_HOUR,
    unit: '',
    tableNo: 35,
    fieldNo: 29,
    decimal: 2
},{
    name: '',
    alias: CENTRAL_INV_TEMP,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: CENTRAL_INV_RATE,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
}];

export const STRING_INV_POINT = [{
    name: '',    
    alias: STRING_INV_STATE,
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0,
    isStringTopo: true
},{
    name: '',
    alias: STRING_INV_DISPERSE,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 4,
    isStringTopo: true
}, {
    name: '',
    alias: STRING_INV_HOUR,
    unit: '',
    tableNo: 35,
    fieldNo: 29,
    decimal: 2,
    isStringTopo: true
},{
    name: '',
    alias: STRING_INV_TEMP,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
},{
    name: '',
    alias: STRING_INV_RATE,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 2
}];

export const DCCBX_POINT = [{
    name: '',    
    alias: DCCBX_STATE,
    unit: '',
    tableNo: 61,
    fieldNo: 9,
    decimal: 0
},{
    name: '',
    alias: DCCBX_DISPERSE,
    unit: '',
    tableNo: 62,
    fieldNo: 9,
    decimal: 4
}];

export const SiteOverviewQuatas = [
    {
        key: SITE_CAPACITY_POINT,
        title: msg('capacity'),
        decimal: 2,
        icon: 'icon-fonttello-lightning',
        multiple: 1000,
        unit: 'Wp',
        thsound: true,
        tableNo: 62,
        fieldNo: 9
    }, {
        key: SITE_POWER_POINT,
        title: msg('activePower'),
        decimal: 2,
        icon: 'icon-fonttello-yibiao',
        multiple: 1000,
        unit: 'W',
        thsound: true,
        tableNo: 62,
        fieldNo: 9
    }, {
        key: SITE_DAYHOUR_POINT,
        title: msg('yieldToday'),
        decimal: 1,
        icon: 'icon-fonttello-Clock',
        multiple: 1,
        unit: 'h',
        thsound: false,
        tableNo: 35,
        fieldNo: 29
    }, {
        key: SITE_RADIATION_POINT,
        title: msg('irradiance'),
        decimal: 2,
        icon: 'icon-fonttello-sun',
        multiple: 1,
        unit: 'W/m²',
        thsound: true,
        tableNo: 62,
        fieldNo: 9
    }
];


// 电流未投运
export const ELECTRIC_DISABLED_VALUE = 4;


// 箱变颜色映射
export const PAD_STATE_CLASS_MAP = {
    0: "health", // 运行
    1: "health", // 夜间状态
    2: "unknown"  // 通讯中断
}

// 汇流箱颜色映射
export const CBX_STATE_CLASS_MAP = {
    0: "health", // 运行
    1: "health", // 夜间状态
    2: "unknown"  // 通讯中断
}

// 逆变器颜色映射
export const INV_STATE_CLASS_MAP = {
    1: "health", // 正常发电
    2: "warn", // 性能过低
    3: "health", // 限功率运行
    4: "health",  // 非故障停机
    5: "danger", // 故障停机
    6: 'unknown' // 无连接
}
