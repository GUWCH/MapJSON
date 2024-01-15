export default {
    "overview": [
        {
            "alias": "Statics.FarmSts",
            "name_cn": "状态",
            "name_en": "Farm Status",
            "table_no": 61,
            "field_no": 9,
            "unit": "",
            "needConvert": false,
            "const_name_list": [
                {
                    "name": "待机",
                    "value": 0,
                    "name_en": "Standby"
                },
                {
                    "name": "放电",
                    "value": 1,
                    "name_en": "Discharge"
                },
                {
                    "name": "充电",
                    "value": 2,
                    "name_en": "Charge"
                },
                {
                    "name": "停机",
                    "value": 3,
                    "name_en": "Stop"
                }
            ],
            "defaultStyle":{
                color: 'rgba(0,219,255,0.7)',
                icon: 'GRID'
            }
        },{
            "alias": "ESS.SOC",
            "name_cn": "SOC",
            "name_en": "Total SOC",
            "table_no": 62,
            "field_no": 9,
            "unit": "%",
            "needConvert": true,
            "defaultStyle":{
                color: 'rgba(88,245,192,0.7)',
                icon: 'ELETRICITY'
            }
        },{
            "alias": "ESS.SOH",
            "name_cn": "SOH",
            "name_en": "Total SOH",
            "table_no": 62,
            "field_no": 9,
            "unit": "%",
            "needConvert": true,
            "defaultStyle":{
                color: 'rgba(142,133,255,0.7)',
                icon: 'HEALTH_CIRCLE'
            }
        },
        {
            "alias": "ESS.PCSAP",
            "name_cn": "实时有功充放电功率",
            "name_en": "Total Acitve Power Output-PCS",
            "table_no": 62,
            "field_no": 9,
            "unit": "kW",
            "needConvert": true,
            "defaultStyle":{
                color: 'rgba(255,181,0,0.7)',
                icon: 'ELETRICITY_DOWN'
            }
        },{
            "alias": "ESS.PCSRP",
            "name_cn": "实时无功充放电功率",
            "name_en": "Total Reacitve Power Output-PCS",
            "table_no": 62,
            "field_no": 9,
            "unit": "kVar",
            "needConvert": true,
            "defaultStyle":{
                color: 'rgba(245,10,34,0.7)',
                icon: 'CAPACITY'
            }
        },{
            "alias": "ESS.SoCP",
            "name_cn": "实时最大可充电有功功率",
            "name_en": "Total Max Available Charge Active Power",
            "table_no": 62,
            "field_no": 9,
            "unit": "kW",
            "needConvert": true,
            "defaultStyle":{
                color: 'rgba(188,190,209,0.7)',
                icon: 'HEALTH_LINE'
            }
        },{
            "alias": "ESS.SoDP",
            "name_cn": "实时最大可放电有功功率",
            "name_en": "Total Max Available Discharge Active Power",
            "table_no": 62,
            "field_no": 9,
            "unit": "kW",
            "needConvert": true
        },{
            "alias": "ESS.SoCE",
            "name_cn": "实时最大可充电电量",
            "name_en": "Total Max Available Charge Energy",
            "table_no": 62,
            "field_no": 9,
            "unit": "kWh",
            "needConvert": true
        },{
            "alias": "ESS.SoDE",
            "name_cn": "实时最大可放电电量",
            "name_en": "Total Max Available Discharge Energy",
            "table_no": 62,
            "field_no": 9,
            "unit": "kWh",
            "needConvert": true
        }
    ],
    "statistics": [
        {
            "alias": "Statics.Fault",
            "name_cn": "子系统故障状态统计",
            "name_en": "SubSystem Fault Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Disconnect",
            "name_cn": "子系统通讯无连接统计",
            "name_en": "SubSystem Disconnection Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Wait",
            "name_cn": "子系统待机统计",
            "name_en": "SubSystem Wait Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Charge",
            "name_cn": "子系统充电统计",
            "name_en": "SubSystem Charge Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Discharge",
            "name_cn": "子系统放电统计",
            "name_en": "SubSystem Discharge Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Stop",
            "name_cn": "子系统停机统计",
            "name_en": "SubSystem Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
    ],
    "keyInfo": {
        "title": {
            "name": {
                "alias": "",
                "name_cn": "场站名称",
                "name_en": "Site Name",
                "table_no": 4,
                "field_no": 3,
            },
            "left": {
                "alias": "Statics.PowerSum",
                "name_cn": "额定功率",
                "name_en": "Total Rated Power",
                "table_no": 62,
                "field_no": 9,
                "unit": "KW",
                "convert": {
                    "coefficient": 0.001,
                    "unit": 'MW',
                    "decimal": 0
                }
            },
            "right": {
                "alias": "Statics.CapacitySum",
                "name_cn": "额定容量",
                "name_en": "Total Rated Capacity",
                "table_no": 62,
                "field_no": 9,
                "unit": "KWh",
                "convert": {
                    "coefficient": 0.001,
                    "unit": 'MWh',
                    "decimal": 0
                }
            }
        },
        "devices":[
            {
                "key": 'subsystem',
                "name_cn": '子系统',
                "name_en": 'SubSystem',
                "total": {
                    "alias": "Statics.ESSCount",
                    "name_cn": "全场子系统个数统计",
                    "name_en": "SubSystem Count ",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.Fault",
                    "name_cn": "子系统故障状态统计",
                    "name_en": "SubSystem Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            },
            {
                "key": 'batteryArray',
                "name_cn": '电池组',
                "name_en": 'Battery Array',
                "total": {
                    "alias": "Statics.BANKCount",
                    "name_cn": "全场电池组个数统计",
                    "name_en": "Battery Array Count ",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.BANKFault",
                    "name_cn": "电池组故障状态统计",
                    "name_en": "Battery Array Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            },
            {
                "key": 'batteryCluster',
                "name_cn": '电池簇',
                "name_en": 'Battery Cluster',
                "total": {
                    "alias": "Statics.RACKCount",
                    "name_cn": "全场电池簇个数统计",
                    "name_en": "Battery Cluster Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.RACKFault",
                    "name_cn": "电池簇故障状态统计",
                    "name_en": "Battery Cluster Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            },
            {
                "key": 'airConditioner',
                "name_cn": '空调',
                "name_en": 'Air Conditioner',
                "total": {
                    "alias": "Statics.ACCount",
                    "name_cn": "全场空调个数统计",
                    "name_en": "Air Conditioner Count ",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.ACFault",
                    "name_cn": "空调故障状态统计",
                    "name_en": "Air Conditioner Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            },
            {
                "key": 'PMCD',
                "name_cn": '测控装置',
                "name_en": 'PMCD',
                "total": {
                    "alias": "Statics.TMMCount",
                    "name_cn": "全场测控装置个数统计",
                    "name_en": "PMCD Count ",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.TMMFault",
                    "name_cn": "测控装置故障状态统计",
                    "name_en": "PMCD Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            },
            {
                "key": 'converter',
                "name_cn": '变流器',
                "name_en": 'Converter',
                "total": {
                    "alias": "Statics.PCSCount",
                    "name_cn": "全场变流器个数统计",
                    "name_en": "Converter Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.PCSFault",
                    "name_cn": "变流器故障状态统计",
                    "name_en": "Converter Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '故障状态',
                    "statusDescEn": 'Fault'
                }
            }
        ]
    },
    "curve": {
        "day":[{
                "alias": "ESS.APProductionKWH",
                "name_cn": "累计放电电量",
                "name_en": "Total Discharge Energy",
                "table_no": 35,
                "field_no": 28,
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    color: 'rgba(0,219,255,1)',
                    axisProps: {
                        position: 'left' 
                    }
                }
            },
            {
                "alias": "ESS.APConsumedKWH",
                "name_cn": "累计充电电量",
                "name_en": "Total Charging Energy",
                "table_no": 35,
                "field_no": 28,
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    color: 'rgba(255,181,0,1)',
                    axisProps: {
                        position: 'right' 
                    }
                }
            },
            {
                "alias": "ESS.SOC",
                "name_cn": "SOC",
                "name_en": "Total SOC",
                "table_no": 62,
                "field_no": 9,
                "unit": "%",
                "needConvert": true
            },{
                "alias": "ESS.SOH",
                "name_cn": "SOH",
                "name_en": "Total SOH",
                "table_no": 62,
                "field_no": 9,
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "ESS.PCSAP",
                "name_cn": "实时有功充放电功率",
                "name_en": "Total Acitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.PCSRP",
                "name_cn": "实时无功充放电功率",
                "name_en": "Total Reacitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": "kVar",
                "needConvert": true
            },{
                "alias": "ESS.SoCP",
                "name_cn": "实时最大可充电有功功率",
                "name_en": "Total Max Available Charge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.SoDP",
                "name_cn": "实时最大可放电有功功率",
                "name_en": "Total Max Available Discharge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.SoCE",
                "name_cn": "实时最大可充电电量",
                "name_en": "Total Max Available Charge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": "kWh",
                "needConvert": true
            },{
                "alias": "ESS.SoDE",
                "name_cn": "实时最大可放电电量",
                "name_en": "Total Max Available Discharge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": "kWh",
                "needConvert": true
            }
        ],
        "customize": [{
                "alias": "ESS.APProductionKWH",
                "name_cn": "累计放电电量",
                "name_en": "Total Discharge Energy",
                "table_no": 35,
                "field_no": 28,
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    color: 'rgba(0,219,255,1)',
                    axisProps: {
                        position: 'left' 
                    }
                }
            },
            {
                "alias": "ESS.APConsumedKWH",
                "name_cn": "累计充电电量",
                "name_en": "Total Charging Energy",
                "table_no": 35,
                "field_no": 28,
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    color: 'rgba(255,181,0,1)',
                    axisProps: {
                        position: 'right' 
                    }
                }
            },
            {
                "alias": "ESS.SOC",
                "name_cn": "SOC",
                "name_en": "Total SOC",
                "table_no": 62,
                "field_no": 9,
                "unit": "%",
                "needConvert": true
            },{
                "alias": "ESS.SOH",
                "name_cn": "SOH",
                "name_en": "Total SOH",
                "table_no": 62,
                "field_no": 9,
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "ESS.PCSAP",
                "name_cn": "实时有功充放电功率",
                "name_en": "Total Acitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.PCSRP",
                "name_cn": "实时无功充放电功率",
                "name_en": "Total Reacitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": "kVar",
                "needConvert": true
            },{
                "alias": "ESS.SoCP",
                "name_cn": "实时最大可充电有功功率",
                "name_en": "Total Max Available Charge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.SoDP",
                "name_cn": "实时最大可放电有功功率",
                "name_en": "Total Max Available Discharge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": "kW",
                "needConvert": true
            },{
                "alias": "ESS.SoCE",
                "name_cn": "实时最大可充电电量",
                "name_en": "Total Max Available Charge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": "kWh",
                "needConvert": true
            },{
                "alias": "ESS.SoDE",
                "name_cn": "实时最大可放电电量",
                "name_en": "Total Max Available Discharge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": "kWh",
                "needConvert": true
            }
        ]
    },
    "geographical": {
        "status":[{
            "alias": "EMS.OperateSts",   
            "name_cn": "标准运行状态",
            "name_en": "Standard Operate Status",
            "table_no": 61,
            "field_no": 9,
            "const_name_list": [
                {
                    "name": "故障停机",
                    "value": 0,
                    "name_en": "Fault Stop",
                    "color": "rgba(245, 10, 34, 0.7)"
                },
                {
                    "name": "用户停机",
                    "value": 1,
                    "name_en": "User Stop",
                    "color": "rgba(255, 181, 0, 0.7)"
                },
                {
                    "name": "维护检修",
                    "value": 2,
                    "name_en": "Maintenance Repair",
                    "color": "rgba(255, 181, 0, 0.7)"
                },
                {
                    "name": "放电运行",
                    "value": 3,
                    "name_en": "Discharge Running",
                    "color": "rgba(88, 245, 192, 0.7)"
                },
                {
                    "name": "充电运行",
                    "value": 4,
                    "name_en": "Charge Running",
                    "color": "rgba(0, 219, 255, 0.7)"
                },
                {
                    "name": "设备待命",
                    "value": 5,
                    "name_en": "Standby",
                    "color": "rgba(88, 245, 192, 0.7)"
                }
            ]
        }],
        "quotas":[
            {
                "alias": "EMS.OperateSts",
                "name_cn": "标准运行状态",
                "name_en": "Standard Operate Status",
                "table_no": 61,
                "field_no": 9,
                "yxCondition": [
                    {
                        "name": "故障停机",
                        "value": '0',
                        "name_en": "Fault Stop",
                        "color": "rgba(245, 10, 34, 0.7)"
                    },
                    {
                        "name": "用户停机",
                        "value": '1',
                        "name_en": "User Stop",
                        "color": "rgba(255, 181, 0, 0.7)"
                    },
                    {
                        "name": "维护检修",
                        "value": '2',
                        "name_en": "Maintenance Repair",
                        "color": "rgba(255, 181, 0, 0.7)"
                    },
                    {
                        "name": "放电运行",
                        "value": '3',
                        "name_en": "Discharge Running",
                        "color": "rgba(88, 245, 192, 0.7)"
                    },
                    {
                        "name": "充电运行",
                        "value": '4',
                        "name_en": "Charge Running",
                        "color": "rgba(0, 219, 255, 0.7)"
                    },
                    {
                        "name": "设备待命",
                        "value": '5',
                        "name_en": "Standby",
                        "color": "rgba(88, 245, 192, 0.7)"
                    }
                ],
                "const_name_list": [
                    {
                        "name": "故障停机",
                        "value": 0,
                        "name_en": "Fault Stop"
                    },
                    {
                        "name": "用户停机",
                        "value": 1,
                        "name_en": "User Stop"
                    },
                    {
                        "name": "维护检修",
                        "value": 2,
                        "name_en": "Maintenance Repair"
                    },
                    {
                        "name": "放电运行",
                        "value": 3,
                        "name_en": "Discharge Running"
                    },
                    {
                        "name": "充电运行",
                        "value": 4,
                        "name_en": "Charge Running"
                    },
                    {
                        "name": "设备待命",
                        "value": 5,
                        "name_en": "Standby"
                    }
                ]
            },
            {
                "alias": "EMS.PCSAP",
                "name_cn": "系统实际有功功率（PCS）",
                "name_en": "Acitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kW'
            },
            {
                "alias": "EMS.PCSRP",
                "name_cn": "系统实际无功功率（PCS）",
                "name_en": "Reacitve Power Output-PCS",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kVar'
            },
            {
                "alias": "EMS.SOC",
                "name_cn": "系统SOC",
                "name_en": "SOC",
                "table_no": 62,
                "field_no": 9,
                "unit": '%'
            },
            {
                "alias": "EMS.SoCP",
                "name_cn": "系统实时最大可充电有功功率",
                "name_en": "Max Available Charge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kW'
            },
            {
                "alias": "EMS.SoDP",
                "name_cn": "系统实时最大可放电有功功率",
                "name_en": "Max Available Discharge Active Power",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kW'
            },
            {
                "alias": "EMS.SoRCP",
                "name_cn": "系统实时最大可用容性无功",
                "name_en": "Max Available Capacitive Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kVar'
            },
            {
                "alias": "EMS.SoRPP",
                "name_cn": "系统实时最大可用感性无功",
                "name_en": "Max Available Inductive Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kVar'
            },
            {
                "alias": "EMS.SoCE",
                "name_cn": "系统实时最大可充电电量",
                "name_en": "Max Available Charge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kWh'
            },
            {
                "alias": "EMS.SoDE",
                "name_cn": "系统实时最大可放电电量",
                "name_en": "Max Available Discharge Energy",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kWh'
            },
            {
                "alias": "EMS.SOH",
                "name_cn": "系统SOH",
                "name_en": "SOH",
                "table_no": 62,
                "field_no": 9,
                "unit": '%'
            },
        ]
    },
    cess: {
        name_cn: '标准运行状态',
        name_en: 'Standard Operate Status',
        alias: 'EMS.OperateSts',
        tableNo: '61',
        fieldNo: '9',
        unit: '',
        decimal: 0,
        valueMap: {
            0: {background: 'rgba(245, 10, 34, 0.7)', icon: ''},
            1: {background: 'rgba(255, 181, 0, 0.7)', icon: ''},
            2: {background: 'rgba(255, 181, 0, 0.7)', icon: ''},
            3: {background: 'rgba(88, 245, 192, 0.7)', icon: ''},
            4: {background: 'rgba(0, 219, 255, 0.7)', icon: ''},
            5: {background: 'rgba(88, 245, 192, 0.7)', icon: ''}
        }
    }
}