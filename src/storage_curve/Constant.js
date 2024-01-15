import Intl, { msgTag } from '../common/lang';

export const msg = msgTag('battery');

export const POINT_ALIAS = {
    VolNode: 'RB.CelVolt',
    TempNode: 'RB.CelTmp',
    KeyPkNum: 'RB.PkNum'
};

export const SELECT = {
    curveType: {
        name: msg('volCurve'),
        options: [
            {
                value: 0,
                name: msg('volCurve') 
            },
            {
                value: 1,
                name: msg('tempCurve') 
            }
        ]
    },
    timeInterval: {
        name: msg('timeInterval'),
        options: [
            {
                value: '1s',
                name: msg('1s') 
            },
            {
                value: '1min',
                name: msg('1min') 
            },
            {
                value: '5min',
                name: msg('5min') 
            },
            {
                value: '10min',
                name: msg('10min') 
            }
        ]
    },
};

export const COLUMN = [ 
    {
        column_name: 'no',
		display_name: msg('no')
    },
    {
        column_name: 'name',
		display_name: msg('name')
    },
    {
        column_name: 'time',
		display_name: msg('time')
    },
    {
        column_name: 'value',
		display_name: msg('value')
    },
    {
        column_name: 'status',
		display_name: msg('status')
    }
];

export const FILE_TYPE = [{
    name: 'CSV',
    value: 'csv'
},{
    name: 'XLS',
    value: 'xls'
},{
    name: 'PDF',
    value: 'pdf'
}];

export const volLegend = [
    `#1${msg('vol')}`,
    `#2${msg('vol')}`,
    `#3${msg('vol')}`,
    `#4${msg('vol')}`,
    `#5${msg('vol')}`,
    `#6${msg('vol')}`,
    `#7${msg('vol')}`,
    `#8${msg('vol')}`,
    `#9${msg('vol')}`,
    `#10${msg('vol')}`,
    `#11${msg('vol')}`,
    `#12${msg('vol')}`
];

export const tempLegend = [
    `#1${msg('temp')}`,
    `#2${msg('temp')}`,
    `#3${msg('temp')}`,
    `#4${msg('temp')}`,
];

export const EchartColors = [
    '#2ec7c9',
    '#b6a2de',
    '#5ab1ef',
    '#ffb980',
    '#d87a80',
    '#e5cf0d',
    '#97b552',
    '#95706d',
    '#dc69aa',
    '#59678c',
    '#df0b0b',
    '#6b0ef1',
    '#f15d0e',
    '#0ef15a',
];

export const debugData = [{
    alias: "SXCN.ESS01.CESS",
    alt: "0",
    benchmark: "false",
    capacity: "0",
    controller_name: "",
    display_name: "濉溪储能储能1号子系统",
    fac_type: "-1",
    feeder_bay_id: "-1",
    feeder_id: "0",
    full_name: "濉溪储能储能 濉溪储能储能1号子系统",
    graph_file: "1",
    icon: "",
    id: "444000493",
    is_forecast: "false",
    lat: "0",
    level: "2",
    link_id: "430000513",
    lon: "0",
    mdm_id: "",
    model: "",
    model_id: 0,
    name: "濉溪储能储能1号子系统",
    node_type: "22",
    order_no: "2",
    pid: "444000492",
    time_zone: "8",
    batteryCluster: [{
        alias: "SXCN.ESS01.RBMS101",
        alt: "0",
        benchmark: "false",
        capacity: "0",
        controller_name: "",
        display_name: "濉溪储能储能1号子系统1号电池组1号电池簇",
        fac_type: "-1",
        feeder_bay_id: "-1",
        feeder_id: "0",
        full_name: "濉溪储能储能 濉溪储能储能1号子系统1号电池组1号电池簇",
        graph_file: "1",
        icon: "",
        id: "444000498",
        is_forecast: "false",
        lat: "0",
        level: "2",
        link_id: "430000518",
        lon: "0",
        mdm_id: "",
        model: "",
        model_id: 0,
        name: "濉溪储能储能1号子系统1号电池组1号电池簇",
        node_type: "25",
        order_no: "7",
        pid: "444000492",
        time_zone: "8"
    }]
},{
    alias: "SXCN.ESS02.CESS",
    alt: "0",
    benchmark: "false",
    capacity: "0",
    controller_name: "",
    display_name: "濉溪储能储能2号子系统",
    fac_type: "-1",
    feeder_bay_id: "-1",
    feeder_id: "0",
    full_name: "濉溪储能储能 濉溪储能储能2号子系统",
    graph_file: "1",
    icon: "",
    id: "444000493",
    is_forecast: "false",
    lat: "0",
    level: "2",
    link_id: "430000513",
    lon: "0",
    mdm_id: "",
    model: "",
    model_id: 0,
    name: "濉溪储能储能2号子系统",
    node_type: "22",
    order_no: "2",
    pid: "444000492",
    time_zone: "8",
    batteryCluster: [{
        alias: "SXCN.ESS02.RBMS101",
        alt: "0",
        benchmark: "false",
        capacity: "0",
        controller_name: "",
        display_name: "濉溪储能储能2号子系统1号电池组1号电池簇",
        fac_type: "-1",
        feeder_bay_id: "-1",
        feeder_id: "0",
        full_name: "濉溪储能储能 濉溪储能储能2号子系统1号电池组1号电池簇",
        graph_file: "1",
        icon: "",
        id: "444000498",
        is_forecast: "false",
        lat: "0",
        level: "2",
        link_id: "430000518",
        lon: "0",
        mdm_id: "",
        model: "",
        model_id: 0,
        name: "濉溪储能储能2号子系统1号电池组1号电池簇",
        node_type: "25",
        order_no: "7",
        pid: "444000492",
        time_zone: "8"
    }]
}];

