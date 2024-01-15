import Intl, { msgTag } from '@/common/lang';
export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const SLOT = '--';

export const DISPERSE = "disperse";
export const CURRENT = "current";

export const DEFAULT_CUR = 'Cur';

export const UNUSED_NO = 4;

export const FIELD_NAME = 'up_limit';

export const VALUE_FIELD = 'field_val';

// 10%
export const DEFAULT_DISPERSE = 10;

export const TYPE_LIST = [
    {
        label: msg('CURRENT.disperse'),
        value: 'disperse'
    },{
        label: msg('CURRENT.current'),
        value: 'current'
    }
]

export const actionWidth = 200;

export const pointSearchReq = {
    search_key: '',
    name_alias_flag: 1,    //按名称还是别名搜索，0名称 | 1别名
    ddyc_flag: 1,          // 测点类型， 0电度 | 1遥测 | 2遥信 | 其它(所有测点)
    node_name_list: '', 
    row_begin: 1,
    row_count: 50
}

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
}

export const disperseConfigReq = {
    alias: "",
    function: "func_yc_limit"
}

