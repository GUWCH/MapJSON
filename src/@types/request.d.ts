/**
 * is_desc为1时, 使用description作为关键字也就是唯一标识
 */
interface IMemory {
    id?: string | number;
    type?: string | number;
    is_desc?: string | number;
    description?: string;
    content?: string;
    username?: string;
};

/**
 * 动态字请求元素
 */
interface IDynData {
    id: string;
    key: string;
    decimal: string | number;
};

/** 4096 实时曲线, 4097 采样历史曲线, 4098 计划曲线, 4099 XY曲线 */
type THistoryCurveType = '4096' | '4097' | '4098' | '4099';

interface IHistoryCurveItem {
    /**@deprecated */
    id?: string;
    /** 1:tableNo:alias:feildNo */
    key: string;
    decimal: string | number;
    sub_type: THistoryCurveType;
    sub_type_x?: THistoryCurveType;
    /** normal 正常取采样数据, subtract 后一个减去前一个做差数据, 默认normal */
    arith_type?: 'normal' | 'subtract';
}

/** 历史曲线数据 */
interface IHistoryCurve {
    /**@deprecated */
    branch_para_list?: string;
    /**@deprecated */
    id?: string;
    /** 曲线类型 */
    curve_type: THistoryCurveType;
    /** 曲线列表 */
    curve: IHistoryCurveItem[];
    /** 0为秒，1为分钟，2为日，3为月，4为年（默认为0） */
    interval_type: 0 | 1 | 2 | 3 | 4;
    /** interval_type对应采样间隔值 */
    sample_cycle: number;
    /** start_time、end_time时间模式, 0为json格式, 1为标准时间字符串 */
    time_mode: '0' | '1';
    /** 开始时间 */
    start_time: string;
    /** 结束时间 */
    end_time: string;
};

interface IUpdatePointParam {
    alias: string
    attribute: {
        table_no: string //表的序号
        field_no: string //列的序号
        field_name: string //列的名字
        field_val: string //列的值
    }[]
}

interface IReqFileList {
    file_path: string;
}

interface IReqDownloadFile {
    fac_alias: string;
    file_list: string[];
    zip_file_name: string;
}

type AppName = 'SCADA' | 'EMS'


interface DataExport {
    domain_id: string // "101", //单个领域id。不能为空。
    condition_plain: string // "***" //数据导出的条件，给前端展示用。
    date_format: string // "yyyy-MM-dd",
    time_format: string // "HH:mm:ss",
    utc: string // "8",
}
interface IPointDataExport extends DataExport {
    condition: {
        model: string // "EN-110-2.0",
        type: string // "minute",
        type_name: string // "1分钟采样数据",
        wtgs: {
            alias: string // "SXGL.T1_L1.WTG013",
            name: string // "WH13",
            parent: string // 原接口使用的父节点，不知含义 "SXGLA"
            point?: { // 非风机使用该字段传测点
                alias: string // "SXGL.Farm.Met.Anemometry.Altitude"
                name: string // "海拔"
            }[]
        }[]
        fields: string // 风机专用 "occur_time,CosConL1,CurConL1,CurConL2,CurConL3,GridFreq,TemConvCoolOut,VolConL1,VolConL2,VolConL3,GenActivePW,GenReactivePW,GenSpd,TemGenDriEnd,TemGenNonDE,TemGenStaU,TemGenStaV,TemGenStaW,Torque,TorqueSetpoint,ReadWindSpeed,TemNacelle,TemNacelleCab,TemOut,WindDirection,WindSpeed,WindVaneDirection,Blade1Position,Blade1Setpoint,Blade2Position,Blade2Setpoint,Blade3Position,Blade3Setpoint,TemB1Mot,TemB2Mot,TemB3Mot,TemHub,GBoxOilPmpP,GearBoxDistri,PrePowerStoreTRBS,RotorSpd,TemGBoxOilE,TemGeaMSDE,TemGeaMSND,TemGeaOil,TemMainBearing,PcurveSts,Utiliz,VibrationL,VibrationLFil,VibrationV,VibrationVFil,NacellePosition,TotalTwist,APConsumed,APProduction,RPConsumed,RPProduction",
        fields_name: string // 风机专用 "时间,网侧L1相功率因数,网侧L1相电流,网侧L2相电流,网侧L3相电流,网侧频率,变频器冷却回路出口温度,网侧L1相电压,网侧L2相电压,网侧L3相电压,发电机有功功率,发电机无功功率,发电机转速,发电机驱动端轴承温度,发电机非驱动端轴承温度,发电机定子U相线圈温度,发电机定子V相线圈温度,发电机定子W相线圈温度,实际扭矩,设定扭矩,仪表盘风速,舱内温度,控制柜内温度,舱外温度,风向,风速,机舱风向夹角,1#桨叶片角度,1#桨设定角度,2#桨叶片角度,2#桨设定角度,3#桨叶片角度,3#桨设定角度,1#桨电机温度,2#桨电机温度,3#桨电机温度,轮毂内温度,齿轮箱油泵吸油口油压,齿轮箱分配器位置油压,偏航液压刹车系统蓄能罐压力,主轴转速,齿轮箱油路入口温度,齿轮箱中间轴驱动端轴承温度,齿轮箱中间轴非驱动端轴承温度,齿轮箱油池温度,主轴承外圈温度,功率曲线状态,可利用率,机舱侧向震动(未滤波),机舱轴向震动(已滤波),机舱侧向震动(未滤波),机舱轴向震动(已滤波),机舱位置,总扭缆角度,有功用电量总计,有功发电量总计,无功用电量总计,无功发电量总计"
    }[],
    starttime: string // "2023-05-30",
    endtime: string // "2023-05-31",
    dt_type: string // "wtg",

    datetime: string // "2023-05-31 11:16:39",
    /**
     * wtg  按风机聚合
     * wtg_model  按型号聚合
     * fac  按场站聚合
     * pack  合并文件夹 不志
     */
    agg_type: 'wtg' | 'wtg_model' | 'fac' | 'pack' // "wtg",
}

interface IWarnDataExport extends DataExport {
    start_time: string // "2023-05-30 00:00:00",
    end_time: string // "2023-05-31 13:44:17",
    alarm_level: {
        alarm_level_id: string
        alarm_level_name: string
    }[],
    alarm_type: {
        alarm_type_id: string
        alarm_type_name: string
    }[],
    obj_list: {
        fac_alias: string
        wtg_list: {
            alias: string
            name: string
        }[],
        is_all: boolean
    }[],
    date_time: string
}

interface IExportConditionDTO {
    name: string
    value: string
    showInAbstract?: boolean // 为false时仅在详情中展示
}

/** 历史告警request */
interface IReqWarn {
    begin_time: string;
    end_time: string;
    checked_list: string;
    level_id: string;
    type_data: string;
    order_by?: string;
    is_asc?: 0 | 1;
    row_begin?: number;
    row_count?: number;
    query_again?: '0' | '1'
}

/**储能可利用率报表request */
interface IReqStorageAvailability {
    startTime: string;
    endTime: string;
    classType: string;
    timeGroupType: string;
    limit?: {
        page: number | string;
        size: number | string;
    };
    orders?: {
        orderField: string;
        order: 'desc' | 'asc'
    }[];
    exportType?: 'csv' | 'xls' | 'pdf';
    dateFormat?: string;
    lanType?: 'cn' | 'en';
}

/**储能设备停机报表request */
interface IReqStorageDowntime {
    startTime: string;
    endTime: string;
    cessAlias: string[];
    limit?: {
        page: number | string;
        size: number | string;
    };
    orders?: {
        orderField: string;
        order: 'desc' | 'asc'
    }[];
    exportType?: 'csv' | 'xls' | 'pdf';
    dateFormat?: string;
    lanType?: 'cn' | 'en'
}

/** 数据集颗粒度 */
interface IReqDataSetDilution {
    define_point: string;
}

/**get wtgtable */
interface IReqWtgTable {
    data_level: string;
    device_type: string;
    filter_bay_type?: string;
    root_nodes: string;
    paras: {
        type: string;
        field: number | string;
        decimal: number | string;
        table_no: number | string;
    }[];
    farm_type: number | string;
    page_num: number | string;
    row_count: number | string;
    top_rows?: string[];
    order_by?: string;
    is_asc: 0 | 1 | true | false;
    filters: {
        col_name: string;
        filter_str: string;
    }[];
    tree_grid: boolean;
    need_color: 'true' | 'false';
}