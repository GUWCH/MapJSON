export default {
    "overview": [
        {
            type: 'icon',
            limitNum: 6,
            colNum: 3,
            points: [
                {
                    "alias": "Statics.State",
                    "name_cn": "场站状态",
                    "name_en": "Farm Status",
                    "table_no": 61,
                    "field_no": 9,
                    "point_type": "DI",
                    "unit": "",
                    "needConvert": false,
                    "const_name_list": [
                        {
                            "name": "待机",
                            "value": 0,
                            "name_en": "Wait"
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
                            "name": "停运",
                            "value": 3,
                            "name_en": "Down"
                        },
                        {
                            "name": "通讯中断",
                            "value": 4,
                            "name_en": "No Connection"
                        }
                    ],
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(0,219,255,1)",
                        "icon": 'GRID'
                    }
                },
                {
                    "alias": "Statics.CapacitySum",
                    "name_cn": "额定容量",
                    "name_en": "Total Rated Capacity",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kWh",
                    "needConvert": true,
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(88,245,192,1)",
                        "icon": 'ELETRICITY'
                    }
                },
                {
                    "alias": "Statics.Disconnect",
                    "name_cn": "子系统通讯无连接统计",
                    "name_en": "Subsystem Disconnection Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true,
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(142,133,255,1)",
                        "icon": 'HEALTH_CIRCLE',
                        "convert": {
                            "decimal": 0
                        }
                    }
                },
                {
                    "alias": "Statics.StationSafeDay",
                    "name_cn": "安全运行天数统计",
                    "name_en": "Station Safe Day",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "day",
                    "needConvert": true,
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(255,181,0,1)",
                        "icon": 'ELETRICITY_DOWN',
                        "convert": {
                            "decimal": 0
                        }
                    }
                },
                {
                    "alias": "Statics.FMXKCount",
                    "name_cn": "全场显控主机个数统计",
                    "name_en": "Fire Master Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true,
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(245,10,34,1)",
                        "icon": 'CAPACITY',
                        "convert": {
                            "decimal": 0
                        }
                    }
                },
                {
                    "alias": "Statics.YZJCount",
                    "name_cn": "全场抑制主机个数统计",
                    "name_en": "Fire Slave Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true,
                    "isDefault": true,    
                    "defaultStyle":{
                        "color": "rgba(188,190,209,1)",
                        "icon": 'HEALTH_LINE',
                        "convert": {
                            "decimal": 0
                        }
                    }
                },
                {
                    "alias": "",
                    "name_cn": "场站名称",
                    "name_en": "Farm Name",
                    "table_no": 4,
                    "field_no": 3,
                    "point_type": "",
                    "unit": "",
                    "needConvert": false
                },
                {
                    "alias": "Statics.PowerSum",
                    "name_cn": "额定功率",
                    "name_en": "Total Rated Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Fault",
                    "name_cn": "子系统故障状态统计",
                    "name_en": "Subsystem Fault Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Wait",
                    "name_cn": "子系统待机统计",
                    "name_en": "Subsystem  Wait Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Discharge",
                    "name_cn": "子系统放电统计",
                    "name_en": "Subsystem  Discharge Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Charge",
                    "name_cn": "子系统充电统计",
                    "name_en": "Subsystem  Charge Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Stop",
                    "name_cn": "子系统停机统计",
                    "name_en": "Subsystem  Stop Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ESSCount",
                    "name_cn": "全场子系统个数统计",
                    "name_en": "Subsystem  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.BANKCount",
                    "name_cn": "全场电池组个数统计",
                    "name_en": "Battery Array  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RACKCount",
                    "name_cn": "全场电池簇个数统计",
                    "name_en": "Battery Cluster  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ACCount",
                    "name_cn": "全场空调个数统计",
                    "name_en": "Air Conditioner  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.TMMCount",
                    "name_cn": "全场箱变个数统计",
                    "name_en": "Transformer  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.PCSCount",
                    "name_cn": "全场变流器个数统计",
                    "name_en": "Converter  Count ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SOC",
                    "name_cn": "SOC",
                    "name_en": "Total SOC",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "ESS.PCSAP",
                    "name_cn": "实时有功充放电功率",
                    "name_en": "Total Acitve Power Output-PCS",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "ESS.PCSRP",
                    "name_cn": "实时无功充放电功率",
                    "name_en": "Total Reacitve Power Output- PCS",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kVar",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SoCP",
                    "name_cn": "实时最大可充电有功功率",
                    "name_en": "Total Max Available Charge Active Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SoDP",
                    "name_cn": "实时最大可放电有功功率",
                    "name_en": "Total Max Available Discharge Active Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SoCE",
                    "name_cn": "实时最大可充电电量",
                    "name_en": "Total Max Available Charge Energy",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SoDE",
                    "name_cn": "实时最大可放电电量",
                    "name_en": "Total Max Available Discharge Energy",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "ESS.SOH",
                    "name_cn": "SOH",
                    "name_en": "Total SOH",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "ESS.APProductionKWH",
                    "name_cn": "累计放电电量_日",
                    "name_en": "Daily Discharge Energy",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "ESS.APConsumedKWH",
                    "name_cn": "累计充电电量_日",
                    "name_en": "Daily Charging Energy",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "ESS.APProductionKWH",
                    "name_cn": "累计放电电量_自定义",
                    "name_en": "Total Discharge Energy",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "ESS.APConsumedKWH",
                    "name_cn": "累计充电电量_自定义",
                    "name_en": "Total Charging Energy",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.FMXKRunCount",
                    "name_cn": "全场显控主机正常统计",
                    "name_en": "Fire Master Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.FMXKFaultCount",
                    "name_cn": "全场显控主机故障统计",
                    "name_en": "Fire Master Fault Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.FMXKAlarmCount",
                    "name_cn": "全场显控主机告警统计",
                    "name_en": "Fire Master  Alarm Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.YZJRunCount",
                    "name_cn": "全场抑制主机正常个数统计",
                    "name_en": "Fire Slave Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.YZJFaultCount",
                    "name_cn": "全场抑制主机故障个数统计",
                    "name_en": "Fire Slave Fault Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.YZJRelayFaultCount",
                    "name_cn": "全场抑制主机中继故障个数统计",
                    "name_en": "Fire Slave Relay Fault Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.YZJRelayAlarmCount",
                    "name_cn": "全场抑制主机中继报警个数统计",
                    "name_en": "Fire Slave Relay Alarm Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.YZJRelaySprayCount",
                    "name_cn": "全场抑制主机中继喷洒个数统计",
                    "name_en": "Fire Slave Relay Spray Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.TCQCount",
                    "name_cn": "全场探测模块个数统计",
                    "name_en": "Fire Sensor Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.TCQRunCount",
                    "name_cn": "全场探测模块正常个数统计",
                    "name_en": "Fire Sensor Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                }
            ]
        }
    ],
    "keyInfo": {
        "title": {
            "name": {
                "alias": "",
                "name_cn": "场站名称",
                "name_en": "Farm Name",
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
                }
            },
            {
                "key": 'fireMaster',
                "name_cn": '显控主机',
                "name_en": 'Fire Master',
                "total": {
                    "alias": "Statics.FMXKCount",
                    "name_cn": "全场显控主机个数统计",
                    "name_en": "Fire Master Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.FMXKRunCount",
                    "name_cn": "全场显控主机正常统计",
                    "name_en": "Fire Master Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Run'
                }
            },
            {
                "key": 'fireSlave',
                "name_cn": '抑制主机',
                "name_en": 'Fire Slave',
                "total": {
                    "alias": "Statics.YZJCount",
                    "name_cn": "全场抑制主机个数统计",
                    "name_en": "Fire Slave Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.YZJRunCount",
                    "name_cn": "全场抑制主机正常个数统计",
                    "name_en": "Fire Slave Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Run'
                }
            },
            {
                "key": 'fireSensor',
                "name_cn": '探测器',
                "name_en": 'Fire Sensor',
                "total": {
                    "alias": "Statics.TCQCount",
                    "name_cn": "全场探测模块个数统计",
                    "name_en": "Fire Sensor Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.TCQRunCount",
                    "name_cn": "全场探测模块正常个数统计",
                    "name_en": "Fire Sensor Run Count",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Run'
                }
            }
        ]
    },
    "alarm": {
        "title": "告警",
        "title_en": "Alarm",
        "alarmTypes": [
            {
                "id": 108000001,
                "value": "0",
                "name_zh": "遥信变位",
                "name_en": "Signal Change"
            },
            {
                "id": 108000002,
                "value": "1",
                "name_zh": "遥信SOE",
                "name_en": "SOE"
            },
            {
                "id": 108000003,
                "value": "2",
                "name_zh": "遥测越限",
                "name_en": "Over Limit"
            },
            {
                "id": 108000004,
                "value": "3",
                "name_zh": "工况信息",
                "name_en": "Work Information"
            },
            {
                "id": 108000005,
                "value": "4",
                "name_zh": "人工操作",
                "name_en": "Manual Operation"
            },
            {
                "id": 108000006,
                "value": "5",
                "name_zh": "遥控遥调",
                "name_en": "Remote Control"
            },
            {
                "id": 108000007,
                "value": "6",
                "name_zh": "保护事件",
                "name_en": "Relay Event"
            },
            {
                "id": 108000008,
                "value": "7",
                "name_zh": "系统信息",
                "name_en": "System Information"
            },
            {
                "id": 108000009,
                "value": "8",
                "name_zh": "事件信息",
                "name_en": "Status Code"
            },
            {
                "id": 108000010,
                "value": "9",
                "name_zh": "服务请求",
                "name_en": "Service Request"
            },
            {
                "id": 108000011,
                "value": "10",
                "name_zh": "CMS告警",
                "name_en": "CMS Alarm"
            },
            {
                "id": 108000012,
                "value": "11",
                "name_zh": "Turbox告警",
                "name_en": "Turbox Alarm"
            },
            {
                "id": 108000013,
                "value": "12",
                "name_zh": "MC告警",
                "name_en": "MC Alarm"
            },
            {
                "id": 108000014,
                "value": "13",
                "name_zh": "通讯状态",
                "name_en": "Connection Status"
            },
            {
                "id": 108000015,
                "value": "14",
                "name_zh": "FC告警",
                "name_en": "FC Alarm"
            },
            {
                "id": 108000016,
                "value": "15",
                "name_zh": "EMS告警",
                "name_en": "EMS Alarm"
            },
            {
                "id": 108000017,
                "value": "16",
                "name_zh": "资源监控",
                "name_en": "Resource Monitor"
            },
            {
                "id": 108000018,
                "value": "17",
                "name_zh": "智能监控助手",
                "name_en": "IMA Check"
            }
        ],
        "alarmLevels": [
            {
                "label": "提示信息",
                "value": "1"
            },
            {
                "label": "告警信息",
                "value": "2"
            },
            {
                "label": "故障",
                "value": "3"
            }
        ],
        "maxRecords": 100,
        "historySc": 0,
        "pageSize": 20,
    },
    "geographical": {
        "status":[{
            "alias": "EMS.UnionSts",   
            "name_cn": "子系统标准工作状态",
            "name_en": "Standard Working Status",
            "table_no": 61,
            "field_no": 9,
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
            ]
        }],
        "quotas":[
            {
                "alias": "EMS.UnionSts",
                "name_cn": "子系统标准工作状态",
                "name_en": "Standard Working Status",
                "table_no": 61,
                "field_no": 9,
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
                ]
            },
            {
                "alias": "EMS.SOC",
                "name_cn": "子系统SOC",
                "name_en": "SOC",
                "table_no": 62,
                "field_no": 9,
                "unit": '%'
            },
            {
                "alias": "EMS.PCSAP",
                "name_cn": "子系统实际有功功率（PCS）",
                "name_en": "Subsystem Acitve Power Output- PCS",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "EMS.PCSRP",
                "name_cn": "子系统实际无功功率（PCS）",
                "name_en": "Subsystem Reacitve Power Output- PCS",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "EMS.SoCP",
                "name_cn": "子系统实时最大可充电有功功率",
                "name_en": "Subsystem Max Available Charge Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "EMS.SoDP",
                "name_cn": "子系统实时最大可放电有功功率",
                "name_en": "Subsystem Max Available Discharge Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "EMS.SoRCP",
                "name_cn": "子系统实时最大可用容性无功",
                "name_en": "Subsystem Max Available Capacitive Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "EMS.SoRPP",
                "name_cn": "子系统实时最大可用感性无功",
                "name_en": "Subsystem Max Available Inductive Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "EMS.SoCE",
                "name_cn": "子系统实时最大可充电电量",
                "name_en": "Subsystem Max Available Charge Energy",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "EMS.SoDE",
                "name_cn": "子系统实时最大可放电电量",
                "name_en": "Subsystem Max Available Discharge Energy",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "EMS.SOH",
                "name_cn": "子系统SOH",
                "name_en": "Subsystem SOH",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "%",
                "needConvert": true
            }
        ]
    },
    "alert":{
        "level": {
            "alias": 'FMXK.FireMLevel',
            "table_no": 61,
            "field_no": 9,
        },
        "lightState": {
            "alias": 'FMXK.LightAlarmState',
            "table_no": 61,
            "field_no": 9,
        },
        "suffix": '显控主机',
        "suffix_en": 'Fire Master '
    }
}