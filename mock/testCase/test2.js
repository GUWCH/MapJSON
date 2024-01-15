import {msgTag} from '../../src/common/lang';
const msg = msgTag('solardevice');

export default {
    "functionData": {
        "card": {
            "titleRight": {
                "enable": true
            },
            "overview": {
                "type": "largeIcon"
            },
            "quota": {
                "enable": true
            },
            "statistics": {
                "enable": true
            },
            "flicker": {
                "enable": true
            },
            "divide": {
                "divideType": "feeder"
            }
        },
        "grid": {},
        "statistics": {}
    },
    "quotaData": [
        {
            "tableNo": "61",
            "fieldNo": "9",
            "unit": "",
            "alias": "BXTF.State",
            "nameEn": "State",
            "nameCn": "状态",
            "card": {
                "titleLeft": {
                    "valueListStyle": [
                        {
                            "value": "0",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "color":"raba(255,255,255,1)"
                        },{
                            "value": "1",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "color":"raba(255,255,255,1)"
                        },{
                            "value": "2",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "color":"raba(255,255,255,1)"
                        }
                    ]
                },
                "overview":{
                    "type": "largeIcon",
                    "valueListStyle": [
                        {
                            "value": "0",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color":"raba(255,255,255,1)"
                        },{
                            "value": "1",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color":"raba(255,255,255,1)"
                        },{
                            "value": "2",
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color":"raba(255,255,255,1)"
                        }
                    ],
                    "associated": {
                        "tableNo": "61",
                        "fieldNo": "9",
                        "unit": "",
                        "alias": "",
                        "nameEn": "State",
                        "nameCn": "型号",
                        "associatedValue": "0",
                        "color": "raba(255,255,255,1)" 
                    }
                },
                "quota":{
                    "order": 3,
                    "condition":[
                        {
                            "value": 0,
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color": "#ffffff"
                        },{
                            "value": 1,
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color": "#ffffff"
                        },{
                            "value": 2,
                            "nameEn": "Maintenance",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color": "#ffffff"
                        }
                    ]
                }
            },
            "grid": {
                "order": 4,
                "condition":[
                    {
                        "value": 0,
                        "nameEn": "Maintenance",
                        "nameCn": "有维护",
                        "icon": "GROUND",
                        "color": "#ffffff"
                    },{
                        "value": 1,
                        "nameEn": "Maintenance",
                        "nameCn": "有维护",
                        "icon": "GROUND",
                        "color": "#ffffff"
                    },{
                        "value": 2,
                        "nameEn": "Maintenance",
                        "nameCn": "有维护",
                        "icon": "GROUND",
                        "color": "#ffffff"
                    }
                ]
            },
            "statistics": {}
        },{
            "tableNo": "62",
            "fieldNo": "9",
            "unit": "",
            "alias": "",
            "nameCn": "通讯状态",
            "nameEn": "Ass state",
            "card": {
            },
            "grid": {},
            "statistics": {}
        },{
            "tableNo": "62",
            "fieldNo": "9",
            "unit": "A",
            "alias": "BXTF.IbBr1",
            "name": "高压侧Ib1",
            "card": {
                "overview":{
                    "type":"chart",
                    "chartStyle":{
                        "shape": "line",
                        "color": "raba(255,255,255,1)",
                        "timeRange": "today",
                        "timeGranularity": "5min"
                    },
                    "convert": {
                        "coefficient" : 10, 
                        "unit" : "W",
                        "decimal" : 2
                    }
                },
                "quota": {
                    "order": 2,
                    "icon": "GROUND",
                    "condition": [
                        {
                            "min": "0",
                            "max": "500",
                            "color": "raba(255,255,255,1)"
                        },
                        {
                            "min": "500",
                            "max": "700",
                            "color": "rgba(117,107,79,1)"
                        }
                    ],
                    "convert": {
                        "coefficient": "5",
                        "unit": "6"
                    }
                }
            },
            "grid": {},
            "statistics": {}
        },
        {
            "tableNo": "62",
            "fieldNo": "9",
            "unit": "A",
            "alias": "BXTF.IcBr1",
            "name": "高压侧Ic1",
            "card": {
                "quota": {
                    "order": 2,
                    "icon": "GROUND",
                    "condition": [
                        {
                            "min": "0",
                            "max": "500",
                            "color": "raba(255,255,255,1)"
                        },
                        {
                            "min": "500",
                            "max": "700",
                            "color": "rgba(117,107,79,1)"
                        }
                    ],
                    "convert": {
                        "coefficient": "5",
                        "unit": "6"
                    }
                }
            },
            "grid": {},
            "statistics": {}
        },{
            "tableNo": "61",
            "fieldNo": "9",
            "unit": "",
            "alias": "BXTF.LoadSwitchClose",
            "nameCn": "高压侧合位",
            "nameEn": "Load Switch Close",
            "card": {
                "quota": {
                    "order": 1,
                    "condition": [
                        {
                            "value": "2",
                            "nameEn": "有维护",
                            "nameCn": "有维护",
                            "icon": "GROUND",
                            "color": "rgba(121,27,27,1)"
                        }
                    ]
                }
            },
            "grid": {},
            "statistics": {}
        },
        {
            "tableNo": "61",
            "fieldNo": "9",
            "unit": "",
            "alias": "BXTF.LoadSwitchFault",
            "nameCn": "高压侧故障",
            "nameEn": "Load Switch Fault",
            "filter": {
                "valueListStyle": [
                    {
                        "value": 0,
                        "nameCn": "有故障2",
                        "dataSource": {
                            "alias": "1:62:BXTF.IaBr1:9",
                            "tableNo": "62",
                            "fieldNo": "9",
                            "unit": "A",
                            "nameCn": "高压侧Ia1",
                            "nameEn": "IaBr1"
                        },
                        "icon": "GROUND",
                        "color": "rgba(160,76,76,1)"
                    },
                    {
                        "value": 1,
                        "nameCn": "正常运行2",
                        "dataSource": {
                            "alias": null,
                            "tableNo": "",
                            "fieldNo": "",
                            "unit": "",
                            "name": ""
                        },
                        "icon": "ELETRIC",
                        "color": "rgba(59,115,89,1)"
                    },
                    {
                        "value": 2,
                        "nameCn": "有维护2"
                    },
                    {
                        "value": 3,
                        "nameCn": "无连接2"
                    }
                ]
            },
            "grid": {},
            "statistics": {}
        }
    ],
    "quotaList":[
        {
            // name: msg('BXT.freq'),
            nameCn: '通讯状态',
            nameEn: 'Ass State',
            alias: '',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            valueList : [{
                "value": '0',
                "nameCn": "有故障"

            },{
                "value": '1',
                "nameCn": "正常运行"
            },{
                "value": '2',
                "nameCn": "有维护"
            },{
                "value": '3',
                "nameCn": "无连接"
            }]
        },
        {
            name: msg('wtg_name'),
            alias: 'WTG.Name',  
            unit: '',
            tableNo: 0,
            fieldNo: 0,
            hidden: true
        },{
            name: msg('BXT.State'),
            alias: 'BXTF.State',
            key: '1:61:BXTF.State:9',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            valueList : [{
                "value": '0',
                "nameCn": "有故障"

            },{
                "value": '1',
                "nameCn": "正常运行"
            },{
                "value": '2',
                "nameCn": "有维护"
            },{
                "value": '3',
                "nameCn": "无连接"
            }]
        }, {
            name: msg('BXT.freq'),
            nameCn: msg('BXT.freq'),
            nameEn: 'freq',
            alias: 'BXTF.Freq',  
            unit: 'Hz',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.freq2'),
            alias: 'BXTF.Freq2',  
            nameCn: msg('BXT.freq2'),
            nameEn: 'freq2',
            unit: 'Hz',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.temp'),
            alias: 'BXTF.Temp',  
            unit: '℃',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.IaBr1'),
            nameCn: "高压侧Ia1",
            nameEn: "IaBr1",
            alias: 'BXTF.IaBr1',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IbBr1'),
            nameCn: msg('BXT.IbBr1'),
            nameEn: "IbBr1",
            alias: 'BXTF.IbBr1',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IcBr1'),
            alias: 'BXTF.IcBr1',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UaBr1'),
            alias: 'BXTF.UaBr1',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UbBr1'),
            alias: 'BXTF.UbBr1',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UcBr1'),
            alias: 'BXTF.UcBr1',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.ActPowPhBr1'),
            alias: 'BXTF.ActPowPhBr1',  
            unit: 'kW',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.ReActPowPhBr1'),
            alias: 'BXTF.ReActPowPhBr1',  
            unit: 'kVar',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.CosPhiBr1'),
            alias: 'BXTF.CosPhiBr1',  
            unit: '',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.IaBr21'),
            alias: 'BXTF.IaBr2',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IbBr21'),
            alias: 'BXTF.IbBr2',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IcBr21'),
            alias: 'BXTF.IcBr2',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UaBr21'),
            alias: 'BXTF.UaBr2',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UbBr21'),
            alias: 'BXTF.UbBr2',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UcBr21'),
            alias: 'BXTF.UcBr2',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.ActPowPhBr21'),
            alias: 'BXTF.ActPowPhBr2',  
            unit: 'kW',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.ReActPowPhBr21'),
            alias: 'BXTF.ReActPowPhBr2',  
            unit: 'kVar',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.CosPhiBr21'),
            alias: 'BXTF.CosPhiBr2',  
            unit: '',
            tableNo: 62,
            fieldNo: 9
        }, {
            name: msg('BXT.IaBr22'),
            alias: 'BXTF.IaBr22',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IbBr22'),
            alias: 'BXTF.IbBr22',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.IcBr22'),
            alias: 'BXTF.IcBr22',  
            unit: 'A',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UaBr22'),
            alias: 'BXTF.UaBr22',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UbBr22'),
            alias: 'BXTF.UbBr22',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.UcBr22'),
            alias: 'BXTF.UcBr22',  
            unit: 'V',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.ActPowPhBr22'),
            alias: 'BXTF.ActPowPhBr22',  
            unit: 'kW',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.ReActPowPhBr22'),
            alias: 'BXTF.ReActPowPhBr22',  
            unit: 'kVar',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.CosPhiBr22'),
            alias: 'BXTF.CosPhiBr22',  
            unit: '',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.freq22'),
            alias: 'BXTF.Freq22',  
            unit: 'Hz',
            tableNo: 62,
            fieldNo: 9,
            hidden: true
        }, {
            name: msg('BXT.LoadSwitchClose'),
            alias: 'BXTF.LoadSwitchClose',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            valueList : [{
                "value": 0,
                "nameCn": "有故障1"
            },{
                "value": 1,
                "nameCn": "正常运行1"
            },{
                "value": 2,
                "nameCn": "有维护1"
            },{
                "value": 3,
                "nameCn": "无连接1"
            }]
        }, {
            name: msg('BXT.LoadSwitchFault'),
            alias: 'BXTF.LoadSwitchFault',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            hidden: true,
            valueList : [{
                "value": 0,
                "nameCn": "有故障2"
            },{
                "value": 1,
                "nameCn": "正常运行2"
            },{
                "value": 2,
                "nameCn": "有维护2"
            },{
                "value": 3,
                "nameCn": "无连接2"
            }]
        }, {
            name: msg('BXT.OilTempHigh'),
            alias: 'BXTF.OilTempHigh',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            hidden: true,
            valueList : [{
                "value": 0,
                "nameCn": "有故障3"
            },{
                "value": 1,
                "nameCn": "正常运行3"
            },{
                "value": 2,
                "nameCn": "有维护3"
            },{
                "value": 3,
                "nameCn": "无连接3"
            }]
        }, {
            name: msg('BXT.OilLow'),
            alias: 'BXTF.OilLow',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            hidden: true,
            valueList : [{
                "value": 0,
                "nameCn": "有故障4"
            },{
                "value": 1,
                "nameCn": "正常运行4"
            },{
                "value": 2,
                "nameCn": "有维护4"
            },{
                "value": 3,
                "nameCn": "无连接4"
            }]
        }, {
            name: msg('BXT.OilPressure'),
            alias: 'BXTF.OilPressure',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            hidden: true,
            valueList : [{
                "value": 0,
                "nameCn": "有故障5"
            },{
                "value": 1,
                "nameCn": "正常运行5"
            },{
                "value": 2,
                "nameCn": "有维护5"
            },{
                "value": 3,
                "nameCn": "无连接5"
            }]
        }, {
            name: msg('BXT.LightGas'),
            alias: 'BXTF.LightGas',  
            unit: '',
            tableNo: 61,
            fieldNo: 9,
            hidden: true,
            valueList : [{
                "value": 0,
                "nameCn": "有故障6"
            },{
                "value": 1,
                "nameCn": "正常运行6"
            },{
                "value": 2,
                "nameCn": "有维护6"
            },{
                "value": 3,
                "nameCn": "无连接6"
            }]
    }],
    "quotaOptions": {
        "filter": {
            "universal": {
                "quotas": [
                    "1:61:BXTF.LoadSwitchFault:9"
                ],
                "dataSource": [
                    "1:62:BXTF.Freq:9",
                    "1:62:BXTF.Freq2:9",
                    "1:62:BXTF.Temp:9",
                    "1:62:BXTF.IaBr1:9"
                ]
            }
        },
        "card": {
            "titleLeft": {
                "enable": true,
                "quotas": [
                    "1:61:BXTF.State:9"
                ]
            },
            "overview": {
                "largeIcon": [
                    "1:61:BXTF.State:9"
                ],
                "chart": [
                    "1:62:BXTF.Freq:9",
                    "1:62:BXTF.Freq2:9",
                    "1:62:BXTF.Temp:9",
                    "1:62:BXTF.IaBr1:9",
                    "1:62:BXTF.IbBr1:9"
                ],
                "associated": ["1:61::9"],
            },
            "stateShow": {
                "enable": true,
                "quotas": [
                    "BXTF.State",
                    "BXTF.LoadSwitchFault"
                ],
                
            },
            "chartShow": {
                "enable": true,
                "quotas": [
                    "BXTF.freq",
                    "BXTF.freq2",
                    "BXTF.temp",
                    "BXTF.IaBr1"
                ]
            },
            "quota": {
                "enable": true,
                "quotas": [
                    
                        "1:62:BXTF.Freq:9",
                        "1:62:BXTF.Freq2:9",
                        "1:62:BXTF.IaBr1:9",
                        "1:62:BXTF.IbBr1:9",
                        "1:61:BXTF.State:9"
                    
                ]
            },
            "statisticsShow": {
                "enable": true,
                "quotas": [
                    "BXTF.ActPowPhBr1",
                    "BXTF.ReActPowPhBr1",
                    "BXTF.CosPhiBr1",
                    "BXTF.IaBr21",
                    "BXTF.IbBr21",
                    "BXTF.IcBr21",
                    "BXTF.UaBr21",
                    "BXTF.UbBr21",
                    "BXTF.UcBr21",
                    "BXTF.ActPowPhBr21",
                    "BXTF.ReActPowPhBr21"
                ]
            },
            "divideType": {
                "divideType": "farm"
            },
            "flickerShow": {
                "enable": true
            }
        },
        "grid": {
            "universal": {
                "quotas": [
                    "1:61:BXTF.LoadSwitchClose:9",
                    "1:62:BXTF.IbBr1:9",
                ]
            }
        },
        "statistics": {
            "universal": {
                "quotas": [
                    "BXTF.LoadSwitchClose",
                    "BXTF.IbBr1",
                    "BXTF.IcBr1",
                    "BXTF.UaBr1",
                    " BXTF.UbBr1",
                    "BXTF.UcBr1",
                    "BXTF.ActPowPhBr1",
                    "BXTF.ReActPowPhBr1",
                    "BXTF.CosPhiBr1",
                    "BXTF.IaBr21",
                    "BXTF.IbBr21",
                    "BXTF.IcBr21",
                    "BXTF.UaBr21",
                    "BXTF.UbBr21",
                    "BXTF.UcBr21",
                    "BXTF.ActPowPhBr21",
                    "BXTF.ReActPowPhBr21"
                ]
            }
        }
    },
}