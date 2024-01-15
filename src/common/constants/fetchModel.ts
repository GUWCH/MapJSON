// get_wtgtable req
export const TableListReq = {
    id: '',
    data_level: 'wtg', // device代表获取其它设备表里设备
    device_type: '', // data_level=device 有效
    filter_bay_type: '',// data_level=device 有效
    farm_type: '',// data_level=farm 有效
    root_nodes: '',
    paras: [],
    page_num: 1,
    row_count: 3000000,
    top_rows: [],
    order_by: 'WTG.Name',
    is_asc: 1,
    if_filter: false,
    filters: [],
    tree_grid: false,
    need_color: false
};

export const TableListAlias = 'WTG.Alias';
export const TableListName = 'WTG.Name';

// get_curve req
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

// get_curve real-time req
export const RealCurveReq = {
    branch_para_list: '',
    curve: [],
    curve_type: "4096",
    id: '',
    start_time: "{\"day\":{\"bflag\":\"1\",\"value\":\"0\"},\"hour\":{\"bflag\":\"1\",\"value\":\"0\"},\"minute\":{\"bflag\":\"1\",\"value\":\"-30\"},\"month\":{\"bflag\":\"1\",\"value\":\"0\"},\"second\":{\"bflag\":\"1\",\"value\":\"0\"},\"week\":{\"bdealweek\":\"0\",\"bflag\":\"1\",\"dayofweek\":\"0\",\"firstweekday\":\"1\",\"week\":\"0\"},\"year\":{\"bflag\":\"1\",\"value\":\"0\"}}\n",
    end_time: "{\"day\":{\"bflag\":\"1\",\"value\":\"0\"},\"hour\":{\"bflag\":\"1\",\"value\":\"0\"},\"minute\":{\"bflag\":\"1\",\"value\":\"0\"},\"month\":{\"bflag\":\"1\",\"value\":\"0\"},\"second\":{\"bflag\":\"1\",\"value\":\"0\"},\"week\":{\"bdealweek\":\"0\",\"bflag\":\"1\",\"dayofweek\":\"0\",\"firstweekday\":\"1\",\"week\":\"0\"},\"year\":{\"bflag\":\"1\",\"value\":\"0\"}}\n",
    interval_type: 0, // 0为秒，1为分钟，2为日，3为月，4为年（默认为0）
    sample_cycle: 10, // interval_type对应采样间隔值
    time_mode: '0' // start_time、end_time时间模式, 0为json格式, 1为标准时间字符串
}

// get_curve curve model
export const HistoryCurveModel = {
    id: '',
    key: '', // 1:tableNo:alias:feildNo
    decimal: 0,
    sub_type: '4097',
    sub_type_x: '4097',
    arith_type: 'normal' //normal | subtract做差处理
};

// get_curve real-time curve model
export const RealCurveModel = {
    id: '',
    key: '', // 1:tableNo:alias:feildNo
    decimal: 0,
    sub_type: '4096',
    sub_type_x: '4096',
    arith_type: 'normal' //normal | subtract做差处理
};

// user_preference 
export const MemoReq = {
    description:'',
    is_desc: '',
    type: '',
    username: ''
};