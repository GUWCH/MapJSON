interface ScadaResponse<T> {
    code: string;
    data: T;
    message?: string;
    total?: string | number;
    page?: string | number;
    size?: string | number;
}

interface IDyn {
    id?: string;
    /**遥信原始值, 一般是整数 */
    raw_value?: string;
    /**显示值,遥信是描述,其它为量值或描述(如型号) */
    display_value: string;
    /**动态字关键key, 1:表号:别名(四遥五段,其它不定最多五段):域号 */
    key: string;
    /**状态描述 */
    status: string;
    /**状态数值,一般-1代表可能无此点,0正常,其它!0代表各种异常 */
    status_value: number;
    /**服务器返回时间, 可delete操作 */
    timestamp?: string;
    /**status_value其它!0时返回,代表文字颜色*/
    line_color?: string;
    /**status_value其它!0时返回,代表背景颜色*/
    fill_color?: string;
    /**打包状态字, 16位二进制解析 */
    type?: 'flag';
    /**状态字16个名称 */
    flag_name?: string[]
    /**设备或节点名称 */
    wf_name?: string
};

interface IAlarm {
    id: number;
    no: number;
    update_id: number;
    time: string;
    standard_time: string;
    fac_id: number;
    fac_type: number;
    farm_name: string;
    bay_id: number;
    wtg_alias: string;
    wtg_name: string;
    atype: number;
    atype_name: string;
    atype_icon: string;
    level: number;
    level_name: string;
    level_color: string;
    content: string;
    confirm: 0 | 1;
    confirm_name: string;
    show_flag: 0 | 1;
    show_in_window: 0 | 1;
    sound_name: string;
    sound_cnt: number;
    set_alias: string;
    duration: string;
    duration_str: string;
    is_ai_sound: 0 | 1;
    rtype: number;
    system_id: number;
    ied_ld: number;
    ld_id: number;
    dev_id: number;
    graph_name: string;
    domain_id: number;
    reset: number;
    value: number;
};

interface IPointSearch {
    point_name: string
    point_alias: string
    time_zone_info: string
    value_type: "1" | "2" | "3" // 测点类型：1：AI 遥测  2：PI 电量  3：DI 遥信
    field_no: string
    point_unit: string
    table_no: string
    /**打包状态字, 16位二进制解析 */
    type?: 'flag';
    /**状态字16个名称 */
    flag_name?: string[]
}

interface IDomainInfo {
    domain_id: string
    domain_name: string
    domain_name_cn: string
    model_id_vec: IModelInfo[]
}

interface IModelInfo {
    model_id: string
    model_name: string
    model_name_cn: string
    table_no: number
    type: number
    device_model_list: string[]
}

interface IModelPoint {
    name_cn: string
    name_en: string
    alias: string
    table_no: number
    field_no: number
    point_type: string
    type?: string
    built_in_type?: string
    model_level: number
    const_name_list?: YXConst[]
    unit?: string
    if_standard: boolean
}

/**
 * api get_wtgtable response
 */
interface IResListDevice {
    ['Farm.Name']: string;
    ['WTG.Alias']: string;
    ['WTG.Name']: string;
    feederAlias: string;
    feederName: string;
    phaseAlias: string;
    phaseName: string;
    isLeaf: 'true' | 'false';
    level: string;
    nodeId: string;
    order_no: string;
    parent: string;
    [key: string]: string;
};

interface ITree {
    display_name: string,
    name: string,
    full_name: string,
    alias: string,
    capacity: string,
    id: string,
    pid: string,
    link_id: string,
    mdm_id: string,
    node_type: string,
    fac_type: string,
    graph_file: string,
    icon: string,
    lat: string,
    lon: string,
    alt: string,
    model: string,
    model_id: string,
    order_no: string,
    benchmark: string,
    controller_name: string,
    feeder_bay_id: string,
    feeder_id: string,
    is_forecast: string,
    level: string,
    time_zone: string,
    web_url: string,
};

interface IDeviceModelValue {
    name: string;
    bay_value: string | number;
    model?: Array<string | number>
};
interface IDeviceModel {
    [key: String]: IDeviceModelValue
};

interface IToken {
    alias: string;
    bay_name?: string;
    icon_name: string;
    note?: string;
    token_id?: string;
    token_name?: string;
    func?: string;
    remark?: string;
    time?: string;
    user?: string;
}

interface ITopologyAsset {
    display_name: string
    alias: string
    parent_alias: string
    order_no: number
    group_no: number
    level: number
    table_no: number
    type: number
    sub_type: number
    domain_id: string;
    model_id: string;
}

interface IEMCSchedulePoint {
    ycAlias: string
    ycName: string
}

interface IAssetInfo {
    alias: string
    is_exist: boolean
}

interface ILightWord<D extends ILightWordYXData | ILightWordFacOrSysData> {
    alias: string
    name: string
    data: ILightWordDataGroup<D>[]
}

interface ILightWordDataGroup<D extends ILightWordYXData | ILightWordFacOrSysData> {
    group: string
    data: D[]
}

interface ILightWordYXData {
    alias: string
    bg: string
    color: string
    flash: number
    freq: number
    name: string
    no: number
    state: number
    val: number
    val_desc: string
    warnlevel: number
    warnleveldesc: string
}
interface ILightWordFacOrSysData {
    alias: string
    name: string
    node_no: number
    val: number
}

interface IWarnLevel {
    id: number
    name: string
    color: string
    value: number
}

interface IWarnType {
    id: number
    name_en: string
    name_zh: string
    value: string
    /**
     * 标识告警类型是否和设备、资产有关
     */
    visible?: 'point' | 'device'
}

type IHisWarnType = ArrayElement<IResWarnOption[1]['table_data']>

interface IUserPreference {
    id: string
    username: string
    type: string
    content: string
    is_desc: string
    description: string
    domain_id?: string
}

interface IDataExportRecord {
    id: string
    username: string
    type: "8"
    content: string
    // is_desc: "1", 不知道干什么用的字段，暂时不用
    description: string
    domain_id: string
    condition_plain?: string
}

interface IDataExportRecordContent {
    // condition: [
    //     {
    //         "data_type": "1分钟采样数据",
    //         "fields": "时间,网侧L1相功率因数,网侧L1相电流,网侧L2相电流,网侧L3相电流,网侧频率,变频器冷却回路出口温度,网侧L1相电压,网侧L2相电压,网侧L3相电压,发电机有功功率,发电机无功功率,发电机转速,发电机驱动端轴承温度,发电机非驱动端轴承温度,发电机定子U相线圈温度,发电机定子V相线圈温度,发电机定子W相线圈温度,实际扭矩,设定扭矩,仪表盘风速,舱内温度,控制柜内温度,舱外温度,风向,风速,机舱风向夹角,1#桨叶片角度,1#桨设定角度,2#桨叶片角度,2#桨设定角度,3#桨叶片角度,3#桨设定角度,1#桨电机温度,2#桨电机温度,3#桨电机温度,轮毂内温度,齿轮箱油泵吸油口油压,齿轮箱分配器位置油压,偏航液压刹车系统蓄能罐压力,主轴转速,齿轮箱油路入口温度,齿轮箱中间轴驱动端轴承温度,齿轮箱中间轴非驱动端轴承温度,齿轮箱油池温度,主轴承外圈温度,功率曲线状态,可利用率,机舱侧向震动(未滤波),机舱轴向震动(已滤波),机舱侧向震动(未滤波),机舱轴向震动(已滤波),机舱位置,总扭缆角度,有功用电量总计,有功发电量总计,无功用电量总计,无功发电量总计",
    //         "model": "En-93-1.5",
    //         "wtgs": "WH25"
    //     }
    // ],
    // date_range: "2023-05-08 - 2023-05-29",
    datetime: string // 导出开始时间
    datetime_end: string // 导出结束时间
    // dt_type: "wtg",
    errmsg: string // "WH25 没有数据。",
    file_url: {
        node_ip: string
        file_name: string[]
    }[],
    utc: string // 时间偏移量
}

interface IDataExportRecordDTO {
    id: string
    domain_id: string
    conditions: IExportConditionDTO[]
    content?: IDataExportRecordContent
}

interface IAssetNode {
    name: string
    alias: string
    model_id: string
    model?: string
    parent_alias?: string
}
interface IAssetGroup {
    group_name: string
    group_alias: string
    devices: IAssetNode[]
}

interface IPointHisData {
    data_time?: string
    start_time?: string
    end_time?: string
    value?: string
    status_desc: string
    event_id?: string
    event_desc?: string
    sc?: string
    sc_desc?: string
    level?: string
}
interface IPointHisRes {
    code: number
    name: string
    alias: string
    value_type: number
    count: number
    if_over: boolean
    data: IPointHisData[]
}

/** 历史告警数据 */
interface IResWarn {
    col_content: string;
    col_host: string;
    col_no: string;
    col_object: string;
    col_operator: string;
    col_region: string;
    col_time: string;
    time_utc: string;
    warn_level: string;
}

/** 告警选项 */
interface IResWarnOption {
    0: {
        level_data: {
            level_id: string;
            level_name: string;
        }[]
    };
    1: {
        table_data: {
            table_id: string;
            table_name: string;
            /**
             * 标识告警类型是否和设备、资产有关
             */
            visible?: 'point' | 'device'
            option_data: {
                option_id: string;
                option_name: string;
                check?: any
            }[]
        }[]
    }
}

/**储能可利用率报表response */
interface IResStorageAvailability {
    datatime: string;
    facName: string;
    subSysNo: string;
    tba: string | number;
}

/**储能设备停机报表response */
interface IResStorageDowntime {
    cessAlias: string;
    cessAlias2: string;
    startTime: string;
    endTime: string;
    cessName: string;
    cessValue: string | number;
    pcsValue: string | number;
    tmmValue: string | number;
    rbValue: string | number;
    ecoReason: string;
    ecoId: string | number;
    operator: string;
    operateTime: string;
    remark: string;
}

/**储能设备停机报表ECO response */
interface IResStorageECO {
    code: string | number;
    codeDesc: string;
}

/** 数据集颗粒度 */
interface IResDataSetDilution {
    code: string;
    period: {
        name_en: string;
        name_cn: string;
        val: string;
    }[];
    message?: string;
}

interface IPointConst {
    alias: string
    list: {
        name: string
        value: number
        // valid: boolean
        // color: string
    }[]
}

interface IReportTemplateTreeNode {
    name: string
    path: string
    type: 'file' | 'dir'
    tableId: string
    id: number
    parent_id: number
}

interface IReportData {
    tableInfo: {
        tableId: string
        isTemplate: boolean
        reportType: string
        date: string
        nodeName: string
        path: string
    }
    tableData: object
}