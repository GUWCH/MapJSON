export default {
    "overview": [
        {
            "alias": "",
            "name_cn": "场站容量",
            "name_en": "Farm Capacity",
            "table_no": 4,
            "field_no": 5,
            "type": "",
            "unit": "",
            "const_name_list": []
        },{
            "alias": "",
            "name_cn": "场站位置",
            "name_en": "Farm Location",
            "table_no": 4,
            "field_no": 5,
            "type": "",
            "unit": "",
            "const_name_list": []
        },{
            "alias": "Statics.StationState",
            "name_cn": "场站状态",
            "name_en": "Farm State",
            "table_no": 61,
            "field_no": 9,
            "type": "DI",
            "unit": "",
            "const_name_list": []
        },{
            "alias": "ESS.SOC",
            "name_cn": "全场SOC",
            "name_en": "Farm SOC",
            "table_no": 62,
            "field_no": 9,
            "type": "AI",
            "unit": "%",
            "const_name_list": []
        },{
            "alias": "ESS.PCSAP",
            "name_cn": "全场实时有功充放电功率",
            "name_en": "全场实时有功充放电功率",
            "table_no": 62,
            "field_no": 9,
            "type": "AI",
            "unit": "MW",
            "const_name_list": []
        },{
            "alias": "ESS.PCSRP",
            "name_cn": "全场实时无功充放电功率",
            "name_en": "全场实时无功充放电功率",
            "table_no": 62,
            "field_no": 9,
            "type": "AI",
            "unit": "MVar",
            "const_name_list": []
        }
    ],
    statistics: [
        {
            "alias": "Statics.Fault",
            "name_cn": "子系统故障状态统计",
            "name_en": "Fault Status Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Disconnect",
            "name_cn": "子系统通讯无连接统计",
            "name_en": "Communication No Connection Statistics",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Wait",
            "name_cn": "子系统待机统计",
            "name_en": "Wait",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Charge",
            "name_cn": "子系统充电统计",
            "name_en": "Charge",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Discharge",
            "name_cn": "子系统放电统计",
            "name_en": "Discharge",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
        {
            "alias": "Statics.Stop",
            "name_cn": "子系统停机统计",
            "name_en": "Stop",
            "table_no": 62,
            "field_no": 9,
            "type": "",
            "unit": "",
        },
    ],
    keyInfo: {
        title: {
            name: {
                "alias": "",
                "name_cn": "场站名称",
                "name_en": "Site Name",
                "table_no": 4,
                "field_no": 3,
                "type": "",
                "unit": "",
            },
            left: {
                "alias": "",
                "name_cn": "额定功率",
                "name_en": "fac_Capacity",
                "table_no": 4,
                "field_no": 4,
                "type": "",
                "unit": "kW",
                "convert": {
                    coefficient: 0.001,
                    unit: "MW",
                    decimal: 0
                }
            },
            right: {
                "alias": "",
                "name_cn": "额定容量",
                "name_en": "fac_Capacity",
                "table_no": 4,
                "field_no": 5,
                "type": "",
                "unit": "kWh",
                // "convert": {
                //     coefficient: 0.01,
                //     unit: "MWh",
                //     decimal: 0
                // }
            }

        },
        devices:[
            {
                key: 'subsystem',
                name_cn: '子系统',
                name_en: 'Subsystem',
                total: {
                    "alias": "Statics.ESSCount",
                    "name_cn": "子系统个数统计",
                    "name_en": "子系统个数统计",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                },
                count: {
                    "alias": "Statics.Fault",
                    "name_cn": "故障状态",
                    "name_en": "故障状态",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                    "color": "",
                    "color": "#DC4B17"
                }

            },
            {
                key: 'converter',
                name_cn: '变流器',
                name_en: 'Converter',
                total: {
                    "alias": "Statics.PCSCount",
                    "name_cn": "子系统待机统计",
                    "name_en": "Wait",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                },
                count: {
                    "alias": "Statics.PCSFault",
                    "name_cn": "故障状态",
                    "name_en": "Fault Status Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                    "color": "#DC4B17"
                }

            },
            {
                key: 'batterycluster',
                name_cn: '电池簇',
                name_en: 'Battery Cluster',
                total: {
                    "alias": "Statics.RACKCount",
                    "name_cn": "电池簇个数统计",
                    "name_en": "电池簇个数统计",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                },
                count: {
                    "alias": "Statics.RACKFault",
                    "name_cn": "故障状态",
                    "name_en": "故障状态",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                    "color": "#DC4B17"
                }

            },
            {
                key: 'transformer',
                name_cn: '箱变',
                name_en: 'Transformer',
                total: {
                    "alias": "Statics.TMMCount",
                    "name_cn": "箱变个数统计",
                    "name_en": "箱变个数统计",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                },
                count: {
                    "alias": "Statics.TMMFault",
                    "name_cn": "故障状态",
                    "name_en": "故障状态",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                    "color": "#DC4B17"
                }

            },
            {
                key: 'aircondition',
                name_cn: '空调',
                name_en: 'Air Condition',
                total: {
                    "alias": "Statics.ACCount",
                    "name_cn": "空调个数统计",
                    "name_en": "空调个数统计",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                },
                count: {
                    "alias": "Statics.ACFault",
                    "name_cn": "故障状态",
                    "name_en": "故障状态",
                    "table_no": 62,
                    "field_no": 9,
                    "type": "",
                    "unit": "",
                    "color": "#DC4B17"
                }
            }
        ]
    },
    geographical: {
        status:[{
            "alias": "EMS.State",
            "name_cn": "EMS状态",
            "name_en": "State",
            "table_no": 61,
            "field_no": 9,
            "const_name_list": [
                {
                    "name": "未连接",
                    "value": 1,
                    "name_en": "Disconnect"
                },
                {
                    "name": "正在启动",
                    "value": 2,
                    "name_en": "Starting"
                },
                {
                    "name": "已连接(运行)",
                    "value": 3,
                    "name_en": "Connected(Running)"
                },
                {
                    "name": "待命(低功耗)",
                    "value": 4,
                    "name_en": "Stand-by(Low-power consumption)"
                },
                {
                    "name": "SOC保护(低)",
                    "value": 5,
                    "name_en": "SOC Protection(Low)"
                },
                {
                    "name": "关机中",
                    "value": 6,
                    "name_en": "Turning Off"
                },
                {
                    "name": "故障",
                    "value": 99,
                    "name_en": "Fault"
                }
            ]
        }],
        quotas:[
            {
                "alias": "EMS.State",
                "name_cn": "EMS状态",
                "name_en": "State",
                "table_no": 61,
                "field_no": 9,
            },
            {
                "alias": "EMS.PCSAP",
                "name_cn": "系统实际有功功率（PCS）",
                "name_en": "PCSAP",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kw'
            },
            {
                "alias": "EMS.PCSRP",
                "name_cn": "系统实际无功功率（PCS）",
                "name_en": "PCSRP",
                "table_no": 62,
                "field_no": 9,
                "unit": 'kw'
            },
        ]
    },
    cess: {
        name_cn: '子系统状态',
        name_en: 'Cess State',
        alias: 'EMS.State',
        tableNo: '61',
        fieldNo: '9',
        unit: '',
        decimal: 0,
        valueMap: {
            0: {background: '', icon: ''},
            1: {background: '', icon: ''},
            2: {background: '', icon: ''},
            3: {background: '', icon: ''}
        }
    }
}