/* eslint-disable */
export const AREALINE_TYPE = {
    GREEN: 'green',
    TURQUOISE: 'turquoise',
    BLUE: 'blue',
    PURPLE: 'purple',
    RED: 'red'
}

export const PointConfig = {
    "title": "鄂尔多斯零碳产业园风光储荷<br/>智慧协同监控中心",
    "leftTop": {
        "moduleTitle": "右侧上方模块",
        "type": "text",
        "title": "",
        "points": [{
            "name": "今日风电发电量",
            "name_en": "今日风电发电量",
            "table": "35",
            "field": "29",
            "key": "Farm.Statistics.WWPP.APProduction",
            "unit": "MWh",
            "factor": 0.001,
            "decimal": 2
        },{
            "name": "今日光伏发电量",
            "name_en": "今日光伏发电量",
            "table": "35",
            "field": "29",
            "key": "Farm.Statistics.Statics.APProduction",
            "unit": "MWh",
            "factor": 0.001,
            "decimal": 2
        },{
            "name": "今日储能放电量",
            "name_en": "今日储能放电量",
            "table": "35",
            "field": "29",
            "key": "Farm.Statistics.ESS.APProductionKWH",
            "unit": "MWh",
            "factor": 0.001,
            "decimal": 2
        },{
            "name": "今日储能充电量",
            "name_en": "今日储能充电量",
            "table": "35",
            "field": "29",
            "key": "Farm.Statistics.ESS.APConsumedKWH",
            "unit": "MWh",
            "factor": 0.001,
            "decimal": 2
        },{
            "name": "今日负荷用电量",
            "name_en": "今日负荷用电量",
            "table": "35",
            "field": "29",
            "key": "Farm.Statistics.Load.APConsumedKWH",
            "unit": "MWh",
            "factor": 0.001,
            "decimal": 2
        }]
    },
    "leftCenter": {
        "moduleTitle": "右侧中部模块",
        "type": "arealine",
        "title": "实时有功功率",
        "points": [{
            "name": "总发电有功",
            "name_en": "总发电有功",
            "table": "62",
            "field": "9",
            "key": "Farm.ECC.DEFINE.genSumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#00FF00",
            "isCurve": true,
            "curveType": AREALINE_TYPE.GREEN,
            "isSubtract": false
        },{
            "name": "风电有功",
            "name_en": "风电有功",
            "table": "62",
            "field": "9",
            "key": "Farm.WindEMS.DEFINE.sumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#56E6ED",
            "isCurve": true,
            "curveType": AREALINE_TYPE.TURQUOISE,
            "isSubtract": false
        },{
            "name": "光伏有功",
            "name_en": "光伏有功",
            "table": "62",
            "field": "9",
            "key": "Farm.SolarEMS.DEFINE.sumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#0E43FF",
            "isCurve": true,
            "curveType": AREALINE_TYPE.BLUE,
            "isSubtract": false
        },{
            "name": "储能有功",
            "name_en": "储能有功",
            "table": "62",
            "field": "9",
            "key": "Farm.StorageEMS.DEFINE.sumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#8C7DF2",
            "isCurve": true,
            "curveType": AREALINE_TYPE.PURPLE,
            "isSubtract": false
        }]
    },
    "leftBottom": {
        "moduleTitle": "右侧下方模块",
        "type": "arealine",
        "title": "",
        "yAxisName": "MWh",
        "points": [{
            "name": "并网点有功",
            "name_en": "并网点有功",
            "table": "62",
            "field": "9",
            "key": "Farm.ECC.PCC.opt_pccP",
            "unit": "MW",
            "factor": -0.001,
            "decimal": 1,
            "color": "#56E6ED",
            "isCurve": true,
            "curveType": AREALINE_TYPE.TURQUOISE,
            "isSubtract": false,
            "inverse": false
        },{
            "name": "总发电有功",
            "name_en": "总发电有功",
            "table": "62",
            "field": "9",
            "key": "Farm.ECC.DEFINE.genSumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#00FF00",
            "isCurve": true,
            "curveType": AREALINE_TYPE.GREEN,
            "isSubtract": false
        },{
            "name": "总负荷有功",
            "name_en": "总负荷有功",
            "table": "62",
            "field": "9",
            "key": "Farm.LoadEMS.DEFINE.sumP",
            "unit": "MW",
            "factor": 0.001,
            "decimal": 1,
            "color": "#FF4500",
            "isCurve": true,
            "curveType": AREALINE_TYPE.RED,
            "isSubtract": false
        }]
    },
    "cards": {
        "sub": {
            "moduleTitle": "升压站模块",
            "type": "card",
            "showKey": "showSub",
            "yAxisName": "MW",
            "points": [{
                "name": "系统电压",
                "name_en": "系统电压",
                "table": "62",
                "field": "9",
                "key": "Farm.ECC.PCC.Uab",
                "unit": "kV",
                "factor": 1,
                "decimal": 1
            },{
                "name": "目标有功",
                "name_en": "目标有功",
                "table": "62",
                "field": "9",
                "key": "Farm.ECC.DEFINE.spPower",
                "unit": "MW",
                "factor": -0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.GREEN,
                "isText": false
            },{
                "name": "实际有功",
                "name_en": "实际有功",
                "table": "62",
                "field": "9",
                "key": "Farm.ECC.PCC.opt_pccP",
                "unit": "MW",
                "factor": -0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.TURQUOISE
            },{
                "name": "实际无功",
                "name_en": "实际无功",
                "table": "62",
                "field": "9",
                "key": "Farm.ECC.PCC.opt_pccQ",
                "unit": "Mvar",
                "factor": -0.001,
                "decimal": 1
            }]
        },
        "wtg": {
            "moduleTitle": "风电模块",
            "type": "card",
            "showKey": "showWtg",
            "yAxisName": "MW",
            "quotas": [{
                "name": "容量",
                "name_en": "容量",
                "table": "62",
                "field": "9",
                "key": "Farm.WindEMS.DEFINE.rated_kW",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 3
            }],
            "points": [{
                "name": "可用有功",
                "name_en": "可用有功",
                "table": "62",
                "field": "9",
                "key": "Farm.WindEMS.DEFINE.theoryPowerValid",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.PURPLE
            },{
                "name": "目标有功",
                "name_en": "目标有功",
                "table": "62",
                "field": "9",
                "key": "Farm.WindEMS.DEFINE.spPower",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.GREEN,
                "isText": false
            },{
                "name": "实际有功",
                "name_en": "实际有功",
                "table": "62",
                "field": "9",
                "key": "Farm.WindEMS.DEFINE.sumP",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.TURQUOISE
            },{
                "name": "实际无功",
                "name_en": "实际无功",
                "table": "62",
                "field": "9",
                "key": "Farm.WindEMS.DEFINE.sumQ",
                "unit": "Mvar",
                "factor": 0.001,
                "decimal": 1
            }]
        },
        "ess": {
            "moduleTitle": "储能模块",
            "type": "card",
            "showKey": "showEss",
            "yAxisName": "MW",
            "quotas": [{
                "name": "额定容量",
                "name_en": "额定容量",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.rated_kW",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 3
            },{
                "name": "额定电量",
                "name_en": "额定电量",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.rated_kWh",
                "unit": "MWh",
                "factor": 0.001,
                "decimal": 3
            }],
            "points": [{
                "name": "SOC",
                "name_en": "SOC",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.SOC",
                "unit": "%",
                "factor": 1,
                "decimal": 1
            },{
                "name": "目标有功",
                "name_en": "目标有功",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.STORE_Pset",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.GREEN,
                "isText": false
            },{
                "name": "实际有功",
                "name_en": "实际有功",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.sumP",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.TURQUOISE
            },{
                "name": "实际无功",
                "name_en": "实际无功",
                "table": "62",
                "field": "9",
                "key": "Farm.StorageEMS.DEFINE.sumQ",
                "unit": "Mvar",
                "factor": 0.001,
                "decimal": 1
            }]
        },        
        "solar": {
            "moduleTitle": "光伏模块",
            "type": "card",
            "showKey": "showSolar",
            "yAxisName": "MW",
            "quotas": [{
                "name": "光伏容量",
                "name_en": "光伏容量",
                "table": "62",
                "field": "9",
                "key": "Farm.SolarEMS.DEFINE.rated_kW",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 3
            }],
            "points": [{
                "name": "可用有功",
                "name_en": "可用有功",
                "table": "62",
                "field": "9",
                "key": "Farm.SolarEMS.DEFINE.theoryPowerValid",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.PURPLE
            },{
                "name": "目标有功",
                "name_en": "目标有功",
                "table": "62",
                "field": "9",
                "key": "Farm.SolarEMS.DEFINE.spPower",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.GREEN,
                "isText": false
            },{
                "name": "实际有功",
                "name_en": "实际有功",
                "table": "62",
                "field": "9",
                "key": "Farm.SolarEMS.DEFINE.sumP",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.TURQUOISE
            },{
                "name": "实际无功",
                "name_en": "实际无功",
                "table": "62",
                "field": "9",
                "key": "Farm.SolarEMS.DEFINE.sumQ",
                "unit": "Mvar",
                "factor": 0.001,
                "decimal": 1
            }]
        },
        "loader": {
            "moduleTitle": "负荷模块",
            "type": "card",
            "showKey": "showLoader",
            "yAxisName": "MW",
            "points": [{
                "name": "实际有功",
                "name_en": "实际有功",
                "table": "62",
                "field": "9",
                "key": "Farm.LoadEMS.DEFINE.sumP",
                "unit": "MW",
                "factor": 0.001,
                "decimal": 1,
                "isCurve": true,
                "curveType": AREALINE_TYPE.TURQUOISE
            },{
                "name": "实际无功",
                "name_en": "实际无功",
                "table": "62",
                "field": "9",
                "key": "Farm.LoadEMS.DEFINE.sumQ",
                "unit": "Mvar",
                "factor": 0.001,
                "decimal": 1
            }]
        }
    },
    "status": {
        "moduleTitle": "潮流状态",
        "type": "status",
        "title": "",
        "points": [{
            "name": "储能判断测点",
            "table": "62",
            "field": "9",
            "key": "Farm.StorageEMS.DEFINE.sumP",
            "storage": true
        },{
            "name": "风电判断测点",
            "table": "62",
            "field": "9",
            "key": "Farm.WindEMS.DEFINE.sumP",
            "generation": true
        },{
            "name": "光伏判断测点",
            "table": "62",
            "field": "9",
            "key": "Farm.SolarEMS.DEFINE.sumP",
            "solar": true
        },{
            "name": "升压站判断测点",
            "table": "62",
            "field": "9",
            "key": "Farm.ECC.PCC.opt_pccP",
            "factor": -1,// 判断前取反
            "sub": true
        },{
            "name": "负荷判断测点",
            "table": "62",
            "field": "9",
            "key": "Farm.LoadEMS.DEFINE.sumP",
            "loader": true
        }]
    }
}

/* eslint-enable */