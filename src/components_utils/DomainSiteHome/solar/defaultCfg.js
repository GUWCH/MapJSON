export default {
    "overview": [
        {
            "alias": "",
            "name_cn": "场站容量",
            "name_en": "Farm Capacity",
            "table_no": 4,
            "field_no": 38,
            "point_type": "Column",
            "unit": "kW",
            "needConvert": true,
        },
        {
            "alias": "",
            "name_cn": "场站名称",
            "name_en": "Farm Name",
            "table_no": 4,
            "field_no": 3,
            "point_type": "Column",
            "unit": "",
            "needConvert": false
        },
        {
            "alias": "",
            "name_cn": "场站别名",
            "name_en": "Farm Alias",
            "table_no": 4,
            "field_no": 4,
            "point_type": "Column",
            "unit": "",
            "needConvert": false
        },
        {
            "alias": "",
            "name_cn": "安全运行天数",
            "name_en": "Safe Operation Days",
            "table_no": 4,
            "field_no": 10,
            "point_type": "Column",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "",
            "name_cn": "日出时间",
            "name_en": "Sunrise Time",
            "table_no": 4,
            "field_no": 34,
            "point_type": "Column",
            "unit": "",
            "needConvert": false
        },
        {
            "alias": "",
            "name_cn": "日落时间",
            "name_en": "Sunset Time",
            "table_no": 4,
            "field_no": 35,
            "point_type": "Column",
            "unit": "",
            "needConvert": false
        },
        {
            "alias": "",
            "name_cn": "空气密度",
            "name_en": "Air Density",
            "table_no": 4,
            "field_no": 33,
            "point_type": "Column",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "",
            "name_cn": "场站类型",
            "name_en": "Farm Type",
            "table_no": 4,
            "field_no": 5,
            "point_type": "Column",
            "unit": "",
            "needConvert": false
        },
        {
            "alias": "",
            "name_cn": "场站位置",
            "name_en": "Farm Location",
            "table_no": 4,
            "field_no": 49,
            "point_type": "Column",
            "unit": "",
            "needConvert": false,
            "isDefault": true,    
            "defaultStyle":{
                "color": "rgba(0,219,255,1)",
                "icon": 'POSITION_CIRCLE'
            }
        },
        {
            "alias": "Statics.PlanHoursYear",
            "name_cn": "当年计划等效利用时数",
            "name_en": "Plan Full Hours",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.APProCompRate",
            "name_cn": "完成计划比例_累计值",
            "name_en": "Produciton Complete Rate _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.APProCompRate",
            "name_cn": "完成计划比例_当日值",
            "name_en": "Produciton Complete Rate_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.APProCompRate",
            "name_cn": "完成计划比例_当月值",
            "name_en": "Produciton Complete Rate_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.APProCompRate",
            "name_cn": "完成计划比例_当年值",
            "name_en": "Produciton Complete Rate_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.DaylightHour",
            "name_cn": "场站日照时数",
            "name_en": "Farm Daylight Hour",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.TheoryPowerSUM",
            "name_cn": "全场统计总理论功率",
            "name_en": "Total Theoretical Power",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kW",
            "needConvert": true
        },
        {
            "alias": "Statics.TheoryPower",
            "name_cn": "全场单机理论功率",
            "name_en": "Theoretical Power",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kW",
            "needConvert": true
        },
        {
            "alias": "Statics.CapacitySum",
            "name_cn": "电站容量",
            "name_en": "Farm Capacity",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kW",
            "needConvert": true
        },
        {
            "alias": "Statics.MachineCount",
            "name_cn": "逆变器台数",
            "name_en": "Inverter Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true,
            "isDefault": true,    
            "defaultStyle":{
                "color": "rgba(142,133,255,1)",
                "icon": 'SOLAR_SO',
                "convert": {
                    "decimal": 0
                }
            }
        },
        {
            "alias": "Statics.Temperature",
            "name_cn": "场站温度",
            "name_en": "Temperature",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "℃",
            "needConvert": true,
            "isDefault": true, 
            "defaultStyle": {
                "edictNameCn": "温度",
                "color": "rgba(88,245,192,1)",
                "icon": 'TEMPERATURE',
                "convert": {
                    "decimal": 1,
                }
            }
        },
        {
            "alias": "Statics.Radiation",
            "name_cn": "场站辐照",
            "name_en": "Radiation",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "W/㎡",
            "needConvert": true,
            "isDefault": true, 
            "defaultStyle": {
                "edictNameCn": "辐照",
                "color": 'rgba(255,181,0,1)',
                "icon": 'SUNNY'
            }
        },
        {
            "alias": "Statics.GHIRadiation",
            "name_cn": "场站水平辐照",
            "name_en": "GHI Radiation",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "W/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.POARadiation",
            "name_cn": "场站倾角辐照",
            "name_en": "POA Radiation",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "W/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.GenActivePW",
            "name_cn": "全场有功功率",
            "name_en": "Active Power",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kW",
            "needConvert": true,
            "isDefault": true, 
            "defaultStyle": {
                "edictNameCn": "有功功率",
                "color": "rgba(88,245,192,1)",
                "icon": 'SOLARfARM',
                "convert": {
                    "coefficient": 0.001,
                    "unit": "MW"
                }
            }
        },
        {
            "alias": "Statics.GenReactivePW",
            "name_cn": "全场无功功率",
            "name_en": "Reactive Power",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kVar",
            "needConvert": true
        },
        {
            "alias": "Statics.WindSpeed",
            "name_cn": "场站风速",
            "name_en": "Wind Speed",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "m/s",
            "needConvert": true
        },
        {
            "alias": "Statics.WindDirection",
            "name_cn": "场站风向",
            "name_en": "Wind Direction ",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "°",
            "needConvert": true
        },
        {
            "alias": "Statics.Humidity",
            "name_cn": "场站湿度",
            "name_en": "Humidity ",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS1",
            "name_cn": "逆变器正常发电统计",
            "name_en": "Inverter Full Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS2",
            "name_cn": "逆变器性能过低统计",
            "name_en": "Inverter Partial Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS3",
            "name_cn": "逆变器限功率运行统计",
            "name_en": "Inverter Service S.P.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS4",
            "name_cn": "逆变器非故障停机统计",
            "name_en": "Inverter Non-fault Stop",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS5",
            "name_cn": "逆变器故障停机统计",
            "name_en": "Inverter Fault Stop",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.LS6",
            "name_cn": "逆变器无连接统计",
            "name_en": "Inverter No Connection",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS1",
            "name_cn": "集中式逆变器正常发电统计",
            "name_en": "Central Inverter Full Capa. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS2",
            "name_cn": "集中式逆变器性能偏低统计",
            "name_en": "Central Inverter Partial Capa. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS3",
            "name_cn": "集中式逆变器限功率统计",
            "name_en": "Central Inverter Service S.P. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS4",
            "name_cn": "集中式逆变器非故障停机统计",
            "name_en": "Central Inverter Non-fault Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS5",
            "name_cn": "集中式逆变器故障停机统计",
            "name_en": "Central Inverter Fault Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.CLS6",
            "name_cn": "集中式逆变器无连接统计",
            "name_en": "Central Inverter No Connection Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS1",
            "name_cn": "组串式逆变器正常发电统计",
            "name_en": "Spring Inverter Full Capa. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS2",
            "name_cn": "组串式逆变器性能偏低统计",
            "name_en": "Spring Inverter Partial Capa. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS3",
            "name_cn": "组串式逆变器限功率统计",
            "name_en": "Spring Inverter Service S.P. Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS4",
            "name_cn": "组串式逆变器非故障停机统计",
            "name_en": "Spring Inverter Non-fault Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS5",
            "name_cn": "组串式逆变器故障停机统计",
            "name_en": "Spring Inverter Fault Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.SLS6",
            "name_cn": "组串式逆变器无连接统计",
            "name_en": "Spring Inverter No Connection Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.BTFS1",
            "name_cn": "箱变运行统计",
            "name_en": "BTF Full Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.BTFS2",
            "name_cn": "箱变通讯故障统计",
            "name_en": "BTF InfoNA",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.BTFS3",
            "name_cn": "箱变夜间状态统计",
            "name_en": "BTF On Night",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.ACS1",
            "name_cn": "交流汇流箱运行统计",
            "name_en": "ACB Full Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.ACS2",
            "name_cn": "交流汇流箱通讯故障统计",
            "name_en": "ACB InfoNA",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.ACS3",
            "name_cn": "交流汇流箱夜间状态统计",
            "name_en": "ACB On Night",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.DCS1",
            "name_cn": "直流汇流箱运行统计",
            "name_en": "DCB Full Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.DCS2",
            "name_cn": "直流汇流箱通讯故障统计",
            "name_en": "DCB InfoNA",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.DCS3",
            "name_cn": "直流汇流箱夜间状态统计",
            "name_en": "DCB On Night",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.WTS1",
            "name_cn": "气象站运行统计",
            "name_en": "WTS Full Capa.",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.WTS2",
            "name_cn": "气象站通讯中断统计",
            "name_en": "WTS InfoNA",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.WTS3",
            "name_cn": "气象站夜间状态统计",
            "name_en": "WTS On Night",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.APProPlan",
            "name_cn": "计划发电量_累计值",
            "name_en": "Plan Production _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APProPlan",
            "name_cn": "计划发电量_当日值",
            "name_en": "Plan Production_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APProPlan",
            "name_cn": "计划发电量_当月值",
            "name_en": "Plan Production_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APProPlan",
            "name_cn": "计划发电量_当年值",
            "name_en": "Plan Production_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "DEFINE.planPower",
            "name_cn": "有功功率计划值",
            "name_en": "Plan AP",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "kW",
            "needConvert": true
        },
        {
            "alias": "Statics.CentralMachineCount",
            "name_cn": "集中式逆变器数量",
            "name_en": "Central Machine Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.StringMachineCount",
            "name_cn": "组串式逆变器数量",
            "name_en": "String Machine Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.BTFCount",
            "name_cn": "箱变数量",
            "name_en": "BTF Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.ACCount",
            "name_cn": "交流汇流箱数量",
            "name_en": "ACB Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.DCCount",
            "name_cn": "直流汇流箱数量",
            "name_en": "DCB Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.WTCount",
            "name_cn": "气象站数量",
            "name_en": "WTS Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.GS1",
            "name_cn": "设备正常运行统计",
            "name_en": "Running Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.GS2",
            "name_cn": "设备夜间待机统计 ",
            "name_en": "On Night Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.GS3",
            "name_cn": "设备维护统计",
            "name_en": "Maintenance Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.GS4",
            "name_cn": "设备故障统计  ",
            "name_en": "Fault Stop Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.GS5",
            "name_cn": "设备无连接统计 ",
            "name_en": "No Connection Statistics",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.MatrixCount",
            "name_cn": "方阵数量统计",
            "name_en": "Array Number Count",
            "table_no": 62,
            "field_no": 9,
            "point_type": "AI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.APProduction",
            "name_cn": "全场累计有功发电量_累计值",
            "name_en": "Active Power Production _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true,
        },
        {
            "alias": "Statics.APProduction",
            "name_cn": "全场累计有功发电量_当日值",
            "name_en": "Active Power Production_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true,
            "isDefault": true, 
            "defaultStyle": {
                "edictNameCn": "当日发电量",
                "color": "rgba(142,133,255,1)",
                "icon": 'BUILDING_S',
                "convert": {
                    "coefficient": 0.001,
                    "unit": "MWh"
                }
            }
        },
        {
            "alias": "Statics.APProduction",
            "name_cn": "全场累计有功发电量_当月值",
            "name_en": "Active Power Production_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APProduction",
            "name_cn": "全场累计有功发电量_当年值",
            "name_en": "Active Power Production_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPProduction",
            "name_cn": "全场累计无功发电量_累计值",
            "name_en": "Reactive Power Production _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPProduction",
            "name_cn": "全场累计无功发电量_当日值",
            "name_en": "Reactive Power Production_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPProduction",
            "name_cn": "全场累计无功发电量_当月值",
            "name_en": "Reactive Power Production_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPProduction",
            "name_cn": "全场累计无功发电量_当年值",
            "name_en": "Reactive Power Production_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPConsumed",
            "name_cn": "全场累计无功用电量_累计值",
            "name_en": "Reactive Power Consumed _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPConsumed",
            "name_cn": "全场累计无功用电量_当日值",
            "name_en": "Reactive Power Consumed_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPConsumed",
            "name_cn": "全场累计无功用电量_当月值",
            "name_en": "Reactive Power Consumed_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.RPConsumed",
            "name_cn": "全场累计无功用电量_当年值",
            "name_en": "Reactive Power Consumed_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kVarh",
            "needConvert": true
        },
        {
            "alias": "Statics.APConsumed",
            "name_cn": "全场累计有功用电量_累计值",
            "name_en": "Active Power Consumed _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APConsumed",
            "name_cn": "全场累计有功用电量_当日值",
            "name_en": "Active Power Consumed_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APConsumed",
            "name_cn": "全场累计有功用电量_当月值",
            "name_en": "Active Power Consumed_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APConsumed",
            "name_cn": "全场累计有功用电量_当年值",
            "name_en": "Active Power Consumed_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.APProductionHour",
            "name_cn": "等效利用小时数_累计值",
            "name_en": "Full Hours _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.APProductionHour",
            "name_cn": "等效利用小时数_当日值",
            "name_en": "Full Hours_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.APProductionHour",
            "name_cn": "等效利用小时数_当月值",
            "name_en": "Full Hours_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.APProductionHour",
            "name_cn": "等效利用小时数_当年值",
            "name_en": "Full Hours_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "h",
            "needConvert": true
        },
        {
            "alias": "Statics.RadiationKWH",
            "name_cn": "全场累计辐射_累计值",
            "name_en": "Total Irradiance _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.RadiationKWH",
            "name_cn": "全场累计辐射_当日值",
            "name_en": "Total Irradiance_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.RadiationKWH",
            "name_cn": "全场累计辐射_当月值",
            "name_en": "Total Irradiance_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.RadiationKWH",
            "name_cn": "全场累计辐射_当年值",
            "name_en": "Total Irradiance_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.GHIRadiationKWH",
            "name_cn": "全场累计水平辐射_累计值",
            "name_en": "Total GHI _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.GHIRadiationKWH",
            "name_cn": "全场累计水平辐射_当日值",
            "name_en": "Total GHI_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.GHIRadiationKWH",
            "name_cn": "全场累计水平辐射_当月值",
            "name_en": "Total GHI_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.GHIRadiationKWH",
            "name_cn": "全场累计水平辐射_当年值",
            "name_en": "Total GHI_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.POARadiationKWH",
            "name_cn": "全场累计倾角辐射_累计值",
            "name_en": "Total POA _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.POARadiationKWH",
            "name_cn": "全场累计倾角辐射_当日值",
            "name_en": "Total POA_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.POARadiationKWH",
            "name_cn": "全场累计倾角辐射_当月值",
            "name_en": "Total POA_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.POARadiationKWH",
            "name_cn": "全场累计倾角辐射_当年值",
            "name_en": "Total POA_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "Wh/㎡",
            "needConvert": true
        },
        {
            "alias": "Statics.CO2Sum",
            "name_cn": "全场总CO2减排_累计值",
            "name_en": "CO2 Reduction _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "t",
            "needConvert": true
        },
        {
            "alias": "Statics.CO2Sum",
            "name_cn": "全场总CO2减排_当日值",
            "name_en": "CO2 Reduction_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "t",
            "needConvert": true
        },
        {
            "alias": "Statics.CO2Sum",
            "name_cn": "全场总CO2减排_当月值",
            "name_en": "CO2 Reduction_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "t",
            "needConvert": true
        },
        {
            "alias": "Statics.CO2Sum",
            "name_cn": "全场总CO2减排_当年值",
            "name_en": "CO2 Reduction_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "t",
            "needConvert": true
        },
        {
            "alias": "Statics.IPR",
            "name_cn": "全场PR值_累计值",
            "name_en": "PR _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.IPR",
            "name_cn": "全场PR值_当日值",
            "name_en": "PR_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.IPR",
            "name_cn": "全场PR值_当月值",
            "name_en": "PR_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.IPR",
            "name_cn": "全场PR值_当年值",
            "name_en": "PR_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.RatedPR",
            "name_cn": "全场理论PR值_累计值",
            "name_en": "Rated PR _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.RatedPR",
            "name_cn": "全场理论PR值_当日值",
            "name_en": "Rated PR_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.RatedPR",
            "name_cn": "全场理论PR值_当月值",
            "name_en": "Rated PR_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.RatedPR",
            "name_cn": "全场理论PR值_当年值",
            "name_en": "Rated PR_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "",
            "needConvert": true
        },
        {
            "alias": "Statics.Profit",
            "name_cn": "场站总收益_累计值",
            "name_en": "Farm Profit _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "CNY",
            "needConvert": true
        },
        {
            "alias": "Statics.Profit",
            "name_cn": "场站总收益_当日值",
            "name_en": "Farm Profit_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "CNY",
            "needConvert": true
        },
        {
            "alias": "Statics.Profit",
            "name_cn": "场站总收益_当月值",
            "name_en": "Farm Profit_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "CNY",
            "needConvert": true
        },
        {
            "alias": "Statics.Profit",
            "name_cn": "场站总收益_当年值",
            "name_en": "Farm Profit_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "CNY",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProduction",
            "name_cn": "上网电量_累计值",
            "name_en": "Grid Production _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProduction",
            "name_cn": "上网电量_当日值",
            "name_en": "Grid Production_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProduction",
            "name_cn": "上网电量_当月值",
            "name_en": "Grid Production_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProduction",
            "name_cn": "上网电量_当年值",
            "name_en": "Grid Production_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProCompRate",
            "name_cn": "上网电量完成比例_累计值",
            "name_en": "Grid Production Complete Rate _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProCompRate",
            "name_cn": "上网电量完成比例_当日值",
            "name_en": "Grid Production Complete Rate_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProCompRate",
            "name_cn": "上网电量完成比例_当月值",
            "name_en": "Grid Production Complete Rate_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProCompRate",
            "name_cn": "上网电量完成比例_当年值",
            "name_en": "Grid Production Complete Rate_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProPlan",
            "name_cn": "计划上网电量_累计值",
            "name_en": "Plan Grid Production _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProPlan",
            "name_cn": "计划上网电量_当日值",
            "name_en": "Plan Grid Production_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProPlan",
            "name_cn": "计划上网电量_当月值",
            "name_en": "Plan Grid Production_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridProPlan",
            "name_cn": "计划上网电量_当年值",
            "name_en": "Plan Grid Production_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConsumed",
            "name_cn": "购网电量_累计值",
            "name_en": "Grid Consumed _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConsumed",
            "name_cn": "购网电量_当日值",
            "name_en": "Grid Consumed_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConsumed",
            "name_cn": "购网电量_当月值",
            "name_en": "Grid Consumed_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConsumed",
            "name_cn": "购网电量_当年值",
            "name_en": "Grid Consumed_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConCompRate",
            "name_cn": "购网电量完成比例_累计值",
            "name_en": "Grid Consumed Complete Rate _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConCompRate",
            "name_cn": "购网电量完成比例_当日值",
            "name_en": "Grid Consumed Complete Rate_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConCompRate",
            "name_cn": "购网电量完成比例_当月值",
            "name_en": "Grid Consumed Complete Rate_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConCompRate",
            "name_cn": "购网电量完成比例_当年值",
            "name_en": "Grid Consumed Complete Rate_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "%",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConPlan",
            "name_cn": "计划购网电量_累计值",
            "name_en": "Plan Grid Consumed _Total",
            "table_no": 35,
            "field_no": 28,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConPlan",
            "name_cn": "计划购网电量_当日值",
            "name_en": "Plan Grid Consumed_CurDay",
            "table_no": 35,
            "field_no": 29,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConPlan",
            "name_cn": "计划购网电量_当月值",
            "name_en": "Plan Grid Consumed_CurMonth",
            "table_no": 35,
            "field_no": 30,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.GridConPlan",
            "name_cn": "计划购网电量_当年值",
            "name_en": "Plan Grid Consumed_CurYear",
            "table_no": 35,
            "field_no": 31,
            "point_type": "PI",
            "unit": "kWh",
            "needConvert": true
        },
        {
            "alias": "Statics.State",
            "name_cn": "场站状态",
            "name_en": "Farm State",
            "table_no": 61,
            "field_no": 9,
            "point_type": "DI",
            "unit": "",
            "needConvert": false,
            "const_name_list": [
                {
                    "name": "发电",
                    "value": 0,
                    "name_en": "Run"
                },
                {
                    "name": "待机",
                    "value": 1,
                    "name_en": "Wait"
                },
                {
                    "name": "通讯中断",
                    "value": 2,
                    "name_en": "Farm General Status"
                },
                {
                    "name": "停运",
                    "value": 3,
                    "name_en": "Down"
                }
            ]
        },
        {
            "alias": "Statics.FarmSts",
            "name_cn": "光伏场站状态",
            "name_en": "Farm Overview Status",
            "table_no": 61,
            "field_no": 9,
            "point_type": "DI",
            "unit": "",
            "needConvert": false,
            "const_name_list": [
                {
                    "name": "正常运行",
                    "value": 1,
                    "name_en": "Run"
                },
                {
                    "name": "设备待机",
                    "value": 2,
                    "name_en": "Wait"
                },
                {
                    "name": "设备维护",
                    "value": 3,
                    "name_en": "Maintain"
                },
                {
                    "name": "设备故障",
                    "value": 4,
                    "name_en": "Fault"
                },
                {
                    "name": "通讯中断",
                    "value": 5,
                    "name_en": "No Connection"
                }
            ]
        },
        {
            "alias": "DEFINE.APLimitSts",
            "name_cn": "场站限功率状态",
            "name_en": "Farm Limit State",
            "table_no": 61,
            "field_no": 9,
            "point_type": "DI",
            "unit": "",
            "needConvert": false,
            "const_name_list": [
                {
                    "name": "自由发电",
                    "value": 0,
                    "name_en": "Power Generation"
                },
                {
                    "name": "限功率",
                    "value": 1,
                    "name_en": "Power Limit"
                }
            ]
        }
    ],
    "curve": {
        "day":[
            {
                "alias": "Statics.DaylightHour",
                "name_cn": "场站日照时数",
                "name_en": "Farm Daylight Hour",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPowerSUM",
                "name_cn": "全场统计总理论功率",
                "name_en": "Total Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPower",
                "name_cn": "全场单机理论功率",
                "name_en": "Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.CapacitySum",
                "name_cn": "电站容量",
                "name_en": "Farm Capacity",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.MachineCount",
                "name_cn": "逆变器台数",
                "name_en": "Inverter Count",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Radiation",
                "name_cn": "场站辐照",
                "name_en": "Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "edictNameCn": "辐照强度",
                    "color": "#FFB500"
                }
            },
            {
                "alias": "Statics.GHIRadiation",
                "name_cn": "场站水平辐照",
                "name_en": "GHI Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiation",
                "name_cn": "场站倾角辐照",
                "name_en": "POA Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GenActivePW",
                "name_cn": "全场有功功率",
                "name_en": "Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "edictNameCn": "有功功率",
                    "color": "#00DBFF"
                }
            },
            {
                "alias": "Statics.GenReactivePW",
                "name_cn": "全场无功功率",
                "name_en": "Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "Statics.Temperature",
                "name_cn": "场站温度",
                "name_en": "Temperature",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "℃",
                "needConvert": true
            },
            {
                "alias": "Statics.WindSpeed",
                "name_cn": "场站风速",
                "name_en": "Wind Speed",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "m/s",
                "needConvert": true
            },
            {
                "alias": "Statics.WindDirection",
                "name_cn": "场站风向",
                "name_en": "Wind Direction ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "°",
                "needConvert": true
            },
            {
                "alias": "Statics.Humidity",
                "name_cn": "场站湿度",
                "name_en": "Humidity ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_累计值",
                "name_en": "Active Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当日值",
                "name_en": "Active Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当月值",
                "name_en": "Active Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当年值",
                "name_en": "Active Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_累计值",
                "name_en": "Reactive Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当日值",
                "name_en": "Reactive Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当月值",
                "name_en": "Reactive Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当年值",
                "name_en": "Reactive Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_累计值",
                "name_en": "Reactive Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当日值",
                "name_en": "Reactive Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当月值",
                "name_en": "Reactive Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当年值",
                "name_en": "Reactive Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_累计值",
                "name_en": "Active Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当日值",
                "name_en": "Active Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当月值",
                "name_en": "Active Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当年值",
                "name_en": "Active Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_累计值",
                "name_en": "Full Hours _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当日值",
                "name_en": "Full Hours_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当月值",
                "name_en": "Full Hours_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当年值",
                "name_en": "Full Hours_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_累计值",
                "name_en": "Total Irradiance _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当日值",
                "name_en": "Total Irradiance_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当月值",
                "name_en": "Total Irradiance_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当年值",
                "name_en": "Total Irradiance_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_累计值",
                "name_en": "Total GHI _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当日值",
                "name_en": "Total GHI_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当月值",
                "name_en": "Total GHI_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当年值",
                "name_en": "Total GHI_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_累计值",
                "name_en": "Total POA _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当日值",
                "name_en": "Total POA_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当月值",
                "name_en": "Total POA_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当年值",
                "name_en": "Total POA_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_累计值",
                "name_en": "CO2 Reduction _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当日值",
                "name_en": "CO2 Reduction_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当月值",
                "name_en": "CO2 Reduction_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当年值",
                "name_en": "CO2 Reduction_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_累计值",
                "name_en": "PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当日值",
                "name_en": "PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当月值",
                "name_en": "PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当年值",
                "name_en": "PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_累计值",
                "name_en": "Rated PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当日值",
                "name_en": "Rated PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当月值",
                "name_en": "Rated PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当年值",
                "name_en": "Rated PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_累计值",
                "name_en": "Farm Profit _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当日值",
                "name_en": "Farm Profit_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当月值",
                "name_en": "Farm Profit_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当年值",
                "name_en": "Farm Profit_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_累计值",
                "name_en": "Grid Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当日值",
                "name_en": "Grid Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当月值",
                "name_en": "Grid Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当年值",
                "name_en": "Grid Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_累计值",
                "name_en": "Grid Production Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当日值",
                "name_en": "Grid Production Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当月值",
                "name_en": "Grid Production Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当年值",
                "name_en": "Grid Production Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_累计值",
                "name_en": "Grid Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当日值",
                "name_en": "Grid Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当月值",
                "name_en": "Grid Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当年值",
                "name_en": "Grid Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_累计值",
                "name_en": "Grid Consumed Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当日值",
                "name_en": "Grid Consumed Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当月值",
                "name_en": "Grid Consumed Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当年值",
                "name_en": "Grid Consumed Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            ],
        "month":[
            {
                "alias": "Statics.DaylightHour",
                "name_cn": "场站日照时数",
                "name_en": "Farm Daylight Hour",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPowerSUM",
                "name_cn": "全场统计总理论功率",
                "name_en": "Total Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPower",
                "name_cn": "全场单机理论功率",
                "name_en": "Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.CapacitySum",
                "name_cn": "电站容量",
                "name_en": "Farm Capacity",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.MachineCount",
                "name_cn": "逆变器台数",
                "name_en": "Inverter Count",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Radiation",
                "name_cn": "场站辐照",
                "name_en": "Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiation",
                "name_cn": "场站水平辐照",
                "name_en": "GHI Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiation",
                "name_cn": "场站倾角辐照",
                "name_en": "POA Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GenActivePW",
                "name_cn": "全场有功功率",
                "name_en": "Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.GenReactivePW",
                "name_cn": "全场无功功率",
                "name_en": "Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "Statics.Temperature",
                "name_cn": "场站温度",
                "name_en": "Temperature",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "℃",
                "needConvert": true
            },
            {
                "alias": "Statics.WindSpeed",
                "name_cn": "场站风速",
                "name_en": "Wind Speed",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "m/s",
                "needConvert": true
            },
            {
                "alias": "Statics.WindDirection",
                "name_cn": "场站风向",
                "name_en": "Wind Direction ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "°",
                "needConvert": true
            },
            {
                "alias": "Statics.Humidity",
                "name_cn": "场站湿度",
                "name_en": "Humidity ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_累计值",
                "name_en": "Active Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "chartType": "bar",
                    "edictNameCn": "发电量",
                    "color": "#00DBFF"
                }
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当日值",
                "name_en": "Active Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当月值",
                "name_en": "Active Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当年值",
                "name_en": "Active Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_累计值",
                "name_en": "Reactive Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当日值",
                "name_en": "Reactive Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当月值",
                "name_en": "Reactive Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当年值",
                "name_en": "Reactive Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_累计值",
                "name_en": "Reactive Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当日值",
                "name_en": "Reactive Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当月值",
                "name_en": "Reactive Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当年值",
                "name_en": "Reactive Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_累计值",
                "name_en": "Active Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当日值",
                "name_en": "Active Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当月值",
                "name_en": "Active Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当年值",
                "name_en": "Active Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_累计值",
                "name_en": "Full Hours _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当日值",
                "name_en": "Full Hours_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当月值",
                "name_en": "Full Hours_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当年值",
                "name_en": "Full Hours_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_累计值",
                "name_en": "Total Irradiance _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当日值",
                "name_en": "Total Irradiance_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当月值",
                "name_en": "Total Irradiance_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当年值",
                "name_en": "Total Irradiance_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_累计值",
                "name_en": "Total GHI _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当日值",
                "name_en": "Total GHI_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当月值",
                "name_en": "Total GHI_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当年值",
                "name_en": "Total GHI_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_累计值",
                "name_en": "Total POA _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当日值",
                "name_en": "Total POA_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当月值",
                "name_en": "Total POA_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当年值",
                "name_en": "Total POA_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_累计值",
                "name_en": "CO2 Reduction _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当日值",
                "name_en": "CO2 Reduction_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当月值",
                "name_en": "CO2 Reduction_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当年值",
                "name_en": "CO2 Reduction_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_累计值",
                "name_en": "PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "edictNameCn": "PR",
                    "color": "#FFB500"
                }
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当日值",
                "name_en": "PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当月值",
                "name_en": "PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当年值",
                "name_en": "PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_累计值",
                "name_en": "Rated PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当日值",
                "name_en": "Rated PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当月值",
                "name_en": "Rated PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当年值",
                "name_en": "Rated PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_累计值",
                "name_en": "Farm Profit _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当日值",
                "name_en": "Farm Profit_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当月值",
                "name_en": "Farm Profit_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当年值",
                "name_en": "Farm Profit_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_累计值",
                "name_en": "Grid Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当日值",
                "name_en": "Grid Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当月值",
                "name_en": "Grid Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当年值",
                "name_en": "Grid Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_累计值",
                "name_en": "Grid Production Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当日值",
                "name_en": "Grid Production Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当月值",
                "name_en": "Grid Production Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当年值",
                "name_en": "Grid Production Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_累计值",
                "name_en": "Grid Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当日值",
                "name_en": "Grid Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当月值",
                "name_en": "Grid Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当年值",
                "name_en": "Grid Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_累计值",
                "name_en": "Grid Consumed Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当日值",
                "name_en": "Grid Consumed Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当月值",
                "name_en": "Grid Consumed Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当年值",
                "name_en": "Grid Consumed Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            ],
        "year":[
            {
                "alias": "Statics.PlanHoursYear",
                "name_cn": "当年计划等效利用时数",
                "name_en": "Plan Full Hours",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "h",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.APProCompRate",
                "name_cn": "完成计划比例_累计值",
                "name_en": "Produciton Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.APProCompRate",
                "name_cn": "完成计划比例_当日值",
                "name_en": "Produciton Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.APProCompRate",
                "name_cn": "完成计划比例_当月值",
                "name_en": "Produciton Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.APProCompRate",
                "name_cn": "完成计划比例_当年值",
                "name_en": "Produciton Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.DaylightHour",
                "name_cn": "场站日照时数",
                "name_en": "Farm Daylight Hour",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPowerSUM",
                "name_cn": "全场统计总理论功率",
                "name_en": "Total Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPower",
                "name_cn": "全场单机理论功率",
                "name_en": "Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.CapacitySum",
                "name_cn": "电站容量",
                "name_en": "Farm Capacity",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.MachineCount",
                "name_cn": "逆变器台数",
                "name_en": "Inverter Count",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Radiation",
                "name_cn": "场站辐照",
                "name_en": "Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiation",
                "name_cn": "场站水平辐照",
                "name_en": "GHI Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiation",
                "name_cn": "场站倾角辐照",
                "name_en": "POA Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GenActivePW",
                "name_cn": "全场有功功率",
                "name_en": "Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.GenReactivePW",
                "name_cn": "全场无功功率",
                "name_en": "Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "Statics.Temperature",
                "name_cn": "场站温度",
                "name_en": "Temperature",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "℃",
                "needConvert": true
            },
            {
                "alias": "Statics.WindSpeed",
                "name_cn": "场站风速",
                "name_en": "Wind Speed",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "m/s",
                "needConvert": true
            },
            {
                "alias": "Statics.WindDirection",
                "name_cn": "场站风向",
                "name_en": "Wind Direction ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "°",
                "needConvert": true
            },
            {
                "alias": "Statics.Humidity",
                "name_cn": "场站湿度",
                "name_en": "Humidity ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_累计值",
                "name_en": "Active Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "chartType": "bar",
                    "edictNameCn": "发电量",
                    "color": "#00DBFF"
                }
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当日值",
                "name_en": "Active Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当月值",
                "name_en": "Active Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当年值",
                "name_en": "Active Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_累计值",
                "name_en": "Reactive Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当日值",
                "name_en": "Reactive Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当月值",
                "name_en": "Reactive Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当年值",
                "name_en": "Reactive Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_累计值",
                "name_en": "Reactive Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当日值",
                "name_en": "Reactive Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当月值",
                "name_en": "Reactive Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当年值",
                "name_en": "Reactive Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_累计值",
                "name_en": "Active Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当日值",
                "name_en": "Active Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当月值",
                "name_en": "Active Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当年值",
                "name_en": "Active Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_累计值",
                "name_en": "Full Hours _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当日值",
                "name_en": "Full Hours_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当月值",
                "name_en": "Full Hours_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当年值",
                "name_en": "Full Hours_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_累计值",
                "name_en": "Total Irradiance _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当日值",
                "name_en": "Total Irradiance_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当月值",
                "name_en": "Total Irradiance_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当年值",
                "name_en": "Total Irradiance_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_累计值",
                "name_en": "Total GHI _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当日值",
                "name_en": "Total GHI_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当月值",
                "name_en": "Total GHI_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当年值",
                "name_en": "Total GHI_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_累计值",
                "name_en": "Total POA _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当日值",
                "name_en": "Total POA_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当月值",
                "name_en": "Total POA_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当年值",
                "name_en": "Total POA_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_累计值",
                "name_en": "CO2 Reduction _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当日值",
                "name_en": "CO2 Reduction_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当月值",
                "name_en": "CO2 Reduction_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当年值",
                "name_en": "CO2 Reduction_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_累计值",
                "name_en": "PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "edictNameCn": "PR",
                    "color": "#FFB500"
                }
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当日值",
                "name_en": "PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当月值",
                "name_en": "PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当年值",
                "name_en": "PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_累计值",
                "name_en": "Rated PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当日值",
                "name_en": "Rated PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当月值",
                "name_en": "Rated PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当年值",
                "name_en": "Rated PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_累计值",
                "name_en": "Farm Profit _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当日值",
                "name_en": "Farm Profit_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当月值",
                "name_en": "Farm Profit_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当年值",
                "name_en": "Farm Profit_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_累计值",
                "name_en": "Grid Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当日值",
                "name_en": "Grid Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当月值",
                "name_en": "Grid Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当年值",
                "name_en": "Grid Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_累计值",
                "name_en": "Grid Production Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当日值",
                "name_en": "Grid Production Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当月值",
                "name_en": "Grid Production Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当年值",
                "name_en": "Grid Production Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProPlan",
                "name_cn": "计划上网电量_累计值",
                "name_en": "Plan Grid Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridProPlan",
                "name_cn": "计划上网电量_当日值",
                "name_en": "Plan Grid Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridProPlan",
                "name_cn": "计划上网电量_当月值",
                "name_en": "Plan Grid Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridProPlan",
                "name_cn": "计划上网电量_当年值",
                "name_en": "Plan Grid Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_累计值",
                "name_en": "Grid Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当日值",
                "name_en": "Grid Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当月值",
                "name_en": "Grid Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当年值",
                "name_en": "Grid Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_累计值",
                "name_en": "Grid Consumed Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当日值",
                "name_en": "Grid Consumed Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当月值",
                "name_en": "Grid Consumed Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当年值",
                "name_en": "Grid Consumed Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConPlan",
                "name_cn": "计划购网电量_累计值",
                "name_en": "Plan Grid Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridConPlan",
                "name_cn": "计划购网电量_当日值",
                "name_en": "Plan Grid Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridConPlan",
                "name_cn": "计划购网电量_当月值",
                "name_en": "Plan Grid Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            },
            {
                "alias": "Statics.GridConPlan",
                "name_cn": "计划购网电量_当年值",
                "name_en": "Plan Grid Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isPlan": true
            }
            ],
        "total":[
            {
                "alias": "Statics.DaylightHour",
                "name_cn": "场站日照时数",
                "name_en": "Farm Daylight Hour",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPowerSUM",
                "name_cn": "全场统计总理论功率",
                "name_en": "Total Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.TheoryPower",
                "name_cn": "全场单机理论功率",
                "name_en": "Theoretical Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.CapacitySum",
                "name_cn": "电站容量",
                "name_en": "Farm Capacity",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.MachineCount",
                "name_cn": "逆变器台数",
                "name_en": "Inverter Count",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Radiation",
                "name_cn": "场站辐照",
                "name_en": "Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiation",
                "name_cn": "场站水平辐照",
                "name_en": "GHI Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiation",
                "name_cn": "场站倾角辐照",
                "name_en": "POA Radiation",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "W/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GenActivePW",
                "name_cn": "全场有功功率",
                "name_en": "Active Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kW",
                "needConvert": true
            },
            {
                "alias": "Statics.GenReactivePW",
                "name_cn": "全场无功功率",
                "name_en": "Reactive Power",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "kVar",
                "needConvert": true
            },
            {
                "alias": "Statics.Temperature",
                "name_cn": "场站温度",
                "name_en": "Temperature",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "℃",
                "needConvert": true
            },
            {
                "alias": "Statics.WindSpeed",
                "name_cn": "场站风速",
                "name_en": "Wind Speed",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "m/s",
                "needConvert": true
            },
            {
                "alias": "Statics.WindDirection",
                "name_cn": "场站风向",
                "name_en": "Wind Direction ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "°",
                "needConvert": true
            },
            {
                "alias": "Statics.Humidity",
                "name_cn": "场站湿度",
                "name_en": "Humidity ",
                "table_no": 62,
                "field_no": 9,
                "point_type": "AI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_累计值",
                "name_en": "Active Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "chartType": "bar",
                    "edictNameCn": "发电量",
                    "color": "#00DBFF"
                }
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当日值",
                "name_en": "Active Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当月值",
                "name_en": "Active Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProduction",
                "name_cn": "全场累计有功发电量_当年值",
                "name_en": "Active Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_累计值",
                "name_en": "Reactive Power Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当日值",
                "name_en": "Reactive Power Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当月值",
                "name_en": "Reactive Power Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPProduction",
                "name_cn": "全场累计无功发电量_当年值",
                "name_en": "Reactive Power Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_累计值",
                "name_en": "Reactive Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当日值",
                "name_en": "Reactive Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当月值",
                "name_en": "Reactive Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.RPConsumed",
                "name_cn": "全场累计无功用电量_当年值",
                "name_en": "Reactive Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kVarh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_累计值",
                "name_en": "Active Power Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当日值",
                "name_en": "Active Power Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当月值",
                "name_en": "Active Power Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APConsumed",
                "name_cn": "全场累计有功用电量_当年值",
                "name_en": "Active Power Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_累计值",
                "name_en": "Full Hours _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当日值",
                "name_en": "Full Hours_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当月值",
                "name_en": "Full Hours_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.APProductionHour",
                "name_cn": "等效利用小时数_当年值",
                "name_en": "Full Hours_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "h",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_累计值",
                "name_en": "Total Irradiance _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当日值",
                "name_en": "Total Irradiance_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当月值",
                "name_en": "Total Irradiance_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.RadiationKWH",
                "name_cn": "全场累计辐射_当年值",
                "name_en": "Total Irradiance_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_累计值",
                "name_en": "Total GHI _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当日值",
                "name_en": "Total GHI_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当月值",
                "name_en": "Total GHI_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.GHIRadiationKWH",
                "name_cn": "全场累计水平辐射_当年值",
                "name_en": "Total GHI_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_累计值",
                "name_en": "Total POA _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当日值",
                "name_en": "Total POA_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当月值",
                "name_en": "Total POA_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.POARadiationKWH",
                "name_cn": "全场累计倾角辐射_当年值",
                "name_en": "Total POA_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "Wh/㎡",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_累计值",
                "name_en": "CO2 Reduction _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当日值",
                "name_en": "CO2 Reduction_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当月值",
                "name_en": "CO2 Reduction_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.CO2Sum",
                "name_cn": "全场总CO2减排_当年值",
                "name_en": "CO2 Reduction_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "t",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_累计值",
                "name_en": "PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true,
                "isDefault": true,
                "defaultStyle": {
                    "subtract": 'subtract',
                    "edictNameCn": "PR",
                    "color": "#FFB500"
                }
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当日值",
                "name_en": "PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当月值",
                "name_en": "PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.IPR",
                "name_cn": "全场PR值_当年值",
                "name_en": "PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_累计值",
                "name_en": "Rated PR _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当日值",
                "name_en": "Rated PR_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当月值",
                "name_en": "Rated PR_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.RatedPR",
                "name_cn": "全场理论PR值_当年值",
                "name_en": "Rated PR_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_累计值",
                "name_en": "Farm Profit _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当日值",
                "name_en": "Farm Profit_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当月值",
                "name_en": "Farm Profit_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.Profit",
                "name_cn": "场站总收益_当年值",
                "name_en": "Farm Profit_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "CNY",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_累计值",
                "name_en": "Grid Production _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当日值",
                "name_en": "Grid Production_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当月值",
                "name_en": "Grid Production_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProduction",
                "name_cn": "上网电量_当年值",
                "name_en": "Grid Production_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_累计值",
                "name_en": "Grid Production Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当日值",
                "name_en": "Grid Production Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当月值",
                "name_en": "Grid Production Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridProCompRate",
                "name_cn": "上网电量完成比例_当年值",
                "name_en": "Grid Production Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_累计值",
                "name_en": "Grid Consumed _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当日值",
                "name_en": "Grid Consumed_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当月值",
                "name_en": "Grid Consumed_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConsumed",
                "name_cn": "购网电量_当年值",
                "name_en": "Grid Consumed_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "kWh",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_累计值",
                "name_en": "Grid Consumed Complete Rate _Total",
                "table_no": 35,
                "field_no": 28,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当日值",
                "name_en": "Grid Consumed Complete Rate_CurDay",
                "table_no": 35,
                "field_no": 29,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当月值",
                "name_en": "Grid Consumed Complete Rate_CurMonth",
                "table_no": 35,
                "field_no": 30,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            },
            {
                "alias": "Statics.GridConCompRate",
                "name_cn": "购网电量完成比例_当年值",
                "name_en": "Grid Consumed Complete Rate_CurYear",
                "table_no": 35,
                "field_no": 31,
                "point_type": "PI",
                "unit": "%",
                "needConvert": true
            }
            ]
    },
    "waterDroplet": [
        {
            type: 'droplet',
            limitNum: 3,
            colNum: 3,
            points: [
                {
                    "alias": "Statics.PlanHoursYear",
                    "name_cn": "当年计划等效利用时数",
                    "name_en": "Plan Full Hours",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProCompRate",
                    "name_cn": "完成计划比例_累计值",
                    "name_en": "Produciton Complete Rate _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProCompRate",
                    "name_cn": "完成计划比例_当日值",
                    "name_en": "Produciton Complete Rate_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProCompRate",
                    "name_cn": "完成计划比例_当月值",
                    "name_en": "Produciton Complete Rate_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProCompRate",
                    "name_cn": "完成计划比例_当年值",
                    "name_en": "Produciton Complete Rate_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.DaylightHour",
                    "name_cn": "场站日照时数",
                    "name_en": "Farm Daylight Hour",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.TheoryPowerSUM",
                    "name_cn": "全场统计总理论功率",
                    "name_en": "Total Theoretical Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "Statics.TheoryPower",
                    "name_cn": "全场单机理论功率",
                    "name_en": "Theoretical Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CapacitySum",
                    "name_cn": "电站容量",
                    "name_en": "Farm Capacity",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "Statics.MachineCount",
                    "name_cn": "逆变器台数",
                    "name_en": "Inverter Count",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Radiation",
                    "name_cn": "场站辐照",
                    "name_en": "Radiation",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "W/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GHIRadiation",
                    "name_cn": "场站水平辐照",
                    "name_en": "GHI Radiation",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "W/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.POARadiation",
                    "name_cn": "场站倾角辐照",
                    "name_en": "POA Radiation",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "W/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GenActivePW",
                    "name_cn": "全场有功功率",
                    "name_en": "Active Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GenReactivePW",
                    "name_cn": "全场无功功率",
                    "name_en": "Reactive Power",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kVar",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Temperature",
                    "name_cn": "场站温度",
                    "name_en": "Temperature",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "℃",
                    "needConvert": true
                },
                {
                    "alias": "Statics.WindSpeed",
                    "name_cn": "场站风速",
                    "name_en": "Wind Speed",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "m/s",
                    "needConvert": true
                },
                {
                    "alias": "Statics.WindDirection",
                    "name_cn": "场站风向",
                    "name_en": "Wind Direction ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "°",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Humidity",
                    "name_cn": "场站湿度",
                    "name_en": "Humidity ",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProPlan",
                    "name_cn": "计划发电量_累计值",
                    "name_en": "Plan Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProPlan",
                    "name_cn": "计划发电量_当日值",
                    "name_en": "Plan Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true,
                },
                {
                    "alias": "Statics.APProPlan",
                    "name_cn": "计划发电量_当月值",
                    "name_en": "Plan Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProPlan",
                    "name_cn": "计划发电量_当年值",
                    "name_en": "Plan Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "全场累计有功发电量_累计值",
                    "name_en": "Active Power Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true,
                    "defaultStyle": {
                        "edictNameCn": "累计发电量",
                        "color": "rgba(0,219,255,1)",
                        "convert": {
                            "coefficient": 0.001,
                            "unit": "MWh"
                        }
                    }
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "全场累计有功发电量_当日值",
                    "name_en": "Active Power Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "全场累计有功发电量_当月值",
                    "name_en": "Active Power Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "全场累计有功发电量_当年值",
                    "name_en": "Active Power Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "全场累计无功发电量_累计值",
                    "name_en": "Reactive Power Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "全场累计无功发电量_当日值",
                    "name_en": "Reactive Power Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "全场累计无功发电量_当月值",
                    "name_en": "Reactive Power Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "全场累计无功发电量_当年值",
                    "name_en": "Reactive Power Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "全场累计无功用电量_累计值",
                    "name_en": "Reactive Power Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "全场累计无功用电量_当日值",
                    "name_en": "Reactive Power Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "全场累计无功用电量_当月值",
                    "name_en": "Reactive Power Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "全场累计无功用电量_当年值",
                    "name_en": "Reactive Power Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "全场累计有功用电量_累计值",
                    "name_en": "Active Power Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "全场累计有功用电量_当日值",
                    "name_en": "Active Power Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "全场累计有功用电量_当月值",
                    "name_en": "Active Power Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "全场累计有功用电量_当年值",
                    "name_en": "Active Power Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_累计值",
                    "name_en": "Full Hours _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当日值",
                    "name_en": "Full Hours_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当月值",
                    "name_en": "Full Hours_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当年值",
                    "name_en": "Full Hours_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RadiationKWH",
                    "name_cn": "全场累计辐射_累计值",
                    "name_en": "Total Irradiance _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RadiationKWH",
                    "name_cn": "全场累计辐射_当日值",
                    "name_en": "Total Irradiance_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RadiationKWH",
                    "name_cn": "全场累计辐射_当月值",
                    "name_en": "Total Irradiance_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RadiationKWH",
                    "name_cn": "全场累计辐射_当年值",
                    "name_en": "Total Irradiance_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GHIRadiationKWH",
                    "name_cn": "全场累计水平辐射_累计值",
                    "name_en": "Total GHI _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GHIRadiationKWH",
                    "name_cn": "全场累计水平辐射_当日值",
                    "name_en": "Total GHI_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GHIRadiationKWH",
                    "name_cn": "全场累计水平辐射_当月值",
                    "name_en": "Total GHI_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GHIRadiationKWH",
                    "name_cn": "全场累计水平辐射_当年值",
                    "name_en": "Total GHI_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.POARadiationKWH",
                    "name_cn": "全场累计倾角辐射_累计值",
                    "name_en": "Total POA _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.POARadiationKWH",
                    "name_cn": "全场累计倾角辐射_当日值",
                    "name_en": "Total POA_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.POARadiationKWH",
                    "name_cn": "全场累计倾角辐射_当月值",
                    "name_en": "Total POA_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.POARadiationKWH",
                    "name_cn": "全场累计倾角辐射_当年值",
                    "name_en": "Total POA_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "Wh/㎡",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "全场总CO2减排_累计值",
                    "name_en": "CO2 Reduction _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "t",
                    "needConvert": true,
                    "isDefault": true,
                    "defaultStyle": {
                        "edictNameCn": "累计CO2减排",
                        "color": "rgba(88,245,192,1)",
                    }
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "全场总CO2减排_当日值",
                    "name_en": "CO2 Reduction_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "t",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "全场总CO2减排_当月值",
                    "name_en": "CO2 Reduction_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "t",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "全场总CO2减排_当年值",
                    "name_en": "CO2 Reduction_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "t",
                    "needConvert": true
                },
                {
                    "alias": "Statics.IPR",
                    "name_cn": "全场PR值_累计值",
                    "name_en": "PR _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.IPR",
                    "name_cn": "全场PR值_当日值",
                    "name_en": "PR_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true,
                    "isDefault": true,
                    "defaultStyle": {
                        "edictNameCn": "全场PR",
                        "color": "rgba(255,181,0,1)",
                        "convert": {
                            "coefficient": 100,
                            "unit": "%"
                        }
                    }
                },
                {
                    "alias": "Statics.IPR",
                    "name_cn": "全场PR值_当月值",
                    "name_en": "PR_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.IPR",
                    "name_cn": "全场PR值_当年值",
                    "name_en": "PR_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RatedPR",
                    "name_cn": "全场理论PR值_累计值",
                    "name_en": "Rated PR _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RatedPR",
                    "name_cn": "全场理论PR值_当日值",
                    "name_en": "Rated PR_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RatedPR",
                    "name_cn": "全场理论PR值_当月值",
                    "name_en": "Rated PR_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RatedPR",
                    "name_cn": "全场理论PR值_当年值",
                    "name_en": "Rated PR_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "场站总收益_累计值",
                    "name_en": "Farm Profit _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "CNY",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "场站总收益_当日值",
                    "name_en": "Farm Profit_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "CNY",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "场站总收益_当月值",
                    "name_en": "Farm Profit_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "CNY",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "场站总收益_当年值",
                    "name_en": "Farm Profit_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "CNY",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProduction",
                    "name_cn": "上网电量_累计值",
                    "name_en": "Grid Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProduction",
                    "name_cn": "上网电量_当日值",
                    "name_en": "Grid Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProduction",
                    "name_cn": "上网电量_当月值",
                    "name_en": "Grid Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProduction",
                    "name_cn": "上网电量_当年值",
                    "name_en": "Grid Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProCompRate",
                    "name_cn": "上网电量完成比例_累计值",
                    "name_en": "Grid Production Complete Rate _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProCompRate",
                    "name_cn": "上网电量完成比例_当日值",
                    "name_en": "Grid Production Complete Rate_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProCompRate",
                    "name_cn": "上网电量完成比例_当月值",
                    "name_en": "Grid Production Complete Rate_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProCompRate",
                    "name_cn": "上网电量完成比例_当年值",
                    "name_en": "Grid Production Complete Rate_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProPlan",
                    "name_cn": "计划上网电量_累计值",
                    "name_en": "Plan Grid Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProPlan",
                    "name_cn": "计划上网电量_当日值",
                    "name_en": "Plan Grid Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProPlan",
                    "name_cn": "计划上网电量_当月值",
                    "name_en": "Plan Grid Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridProPlan",
                    "name_cn": "计划上网电量_当年值",
                    "name_en": "Plan Grid Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConsumed",
                    "name_cn": "购网电量_累计值",
                    "name_en": "Grid Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConsumed",
                    "name_cn": "购网电量_当日值",
                    "name_en": "Grid Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConsumed",
                    "name_cn": "购网电量_当月值",
                    "name_en": "Grid Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConsumed",
                    "name_cn": "购网电量_当年值",
                    "name_en": "Grid Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConCompRate",
                    "name_cn": "购网电量完成比例_累计值",
                    "name_en": "Grid Consumed Complete Rate _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConCompRate",
                    "name_cn": "购网电量完成比例_当日值",
                    "name_en": "Grid Consumed Complete Rate_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConCompRate",
                    "name_cn": "购网电量完成比例_当月值",
                    "name_en": "Grid Consumed Complete Rate_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConCompRate",
                    "name_cn": "购网电量完成比例_当年值",
                    "name_en": "Grid Consumed Complete Rate_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "%",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConPlan",
                    "name_cn": "计划购网电量_累计值",
                    "name_en": "Plan Grid Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConPlan",
                    "name_cn": "计划购网电量_当日值",
                    "name_en": "Plan Grid Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConPlan",
                    "name_cn": "计划购网电量_当月值",
                    "name_en": "Plan Grid Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GridConPlan",
                    "name_cn": "计划购网电量_当年值",
                    "name_en": "Plan Grid Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
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
            "right": {
                "alias": "",
                "name_cn": "场站容量",
                "name_en": "Farm Capacity",
                "table_no": 4,
                "field_no": 38,
                "unit": "KW",
                "convert": {
                    "unit": "MW",
                    "coefficient": 0.001
                }
            }
        },
        "devices":[
            {
                "key": 'array',
                "name_cn": '方阵',
                "name_en": 'Array',
                "total": {
                    "alias": "Statics.MatrixCount",
                    "name_cn": "方阵数量统计",
                    "name_en": "MatrixCount",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.MatrixS1",
                    "name_cn": "方阵运行统计",
                    "name_en": "Matrix Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'pad',
                "name_cn": '箱变',
                "name_en": 'MV Transformer',
                "total": {
                    "alias": "Statics.BTFCount",
                    "name_cn": "箱变台数",
                    "name_en": "BTF Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.BTFS1",
                    "name_cn": "箱变运行统计",
                    "name_en": "BTF Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'centralInverter',
                "name_cn": '集中式逆变器',
                "name_en": 'Central Inverter',
                "total": {
                    "alias": "Statics.CentralMachineCount",
                    "name_cn": "集中式逆变器总台数",
                    "name_en": "Central Machine Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.CLS1",
                    "name_cn": "集中式逆变器正常发电统计",
                    "name_en": "Central Inverter Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'centralInverter',
                "name_cn": '组串式逆变器',
                "name_en": 'String Inverter',
                "total": {
                    "alias": "Statics.StringMachineCount",
                    "name_cn": "组串式逆变器总台数",
                    "name_en": "String Machine Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.SLS1",
                    "name_cn": "组串式逆变器正常发电统计",
                    "name_en": "String Inverter Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'acCombiner',
                "name_cn": '交流汇流箱',
                "name_en": 'AC Combiner Box',
                "total": {
                    "alias": "Statics.ACCount",
                    "name_cn": "交流汇流箱台数",
                    "name_en": "ACB Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.ACS1",
                    "name_cn": "交流汇流箱运行统计",
                    "name_en": "ACB Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'dcCombiner',
                "name_cn": '直流汇流箱',
                "name_en": 'DC Combiner Box',
                "total": {
                    "alias": "Statics.DCCount",
                    "name_cn": "直流汇流箱台数",
                    "name_en": "DCB Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.DCS1",
                    "name_cn": "直流汇流箱运行统计",
                    "name_en": "DCB Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            },
            {
                "key": 'weatherStation',
                "name_cn": '气象站',
                "name_en": 'Weather Station',
                "total": {
                    "alias": "Statics.WTCount",
                    "name_cn": "气象站台数",
                    "name_en": "WTS Count",
                    "table_no": 62,
                    "field_no": 9,
                },
                "count": {
                    "alias": "Statics.WTS1",
                    "name_cn": "气象站运行统计",
                    "name_en": "WTS Full Capa. Statistics",
                    "table_no": 62,
                    "field_no": 9,
                    "color": "#DC4B17",
                    "statusDescCn": '正常运行',
                    "statusDescEn": 'Operation'
                }
            }
        ]
    },
    "geographical": [
        { 
            "type": 'matrix',
            "icon": 'TRANSFORM_BOX',
            "quotaNum": 5,
            "name_cn": "方阵",
            "name_en": "Array",
            "prefixName": 'Matrix',
            "jumpable": true,
            "needStatus": true,
            "needQuotas": true,
            "needBg": true,
            "needName": true,
            "needStatics": true,
            "status":[{
                "alias": "Statics.MatrixSts",
                "name_cn": "方阵运行状态",
                "name_en": "Array Run State",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                "unit": "",
                "isDefault": true,
                "const_name_list": [
                    {
                        "name": "正常运行",
                        "value": 0,
                        "name_en": "Running",
                        "color": "#58F5C0",
                        "icon": "SUNNY"
                    },
                    {
                        "name": "有异常",
                        "value": 1,
                        "name_en": "Abnormal",
                        "color": "#FFB500",
                        "icon": "MOON"
                    }
                ]
            }],
            "bg":[{
                "alias": "Statics.ConnectionSts",
                "name_cn": "方阵通讯状态",
                "name_en": "Array Connection State",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                "unit": "",
                "isDefault": true,
                "const_name_list": [
                    {
                        "name": "通讯正常",
                        "value": 0,
                        "name_en": "Connection Well",
                        //"color": "#58F5C0", 作为背景色正常时不显示
                    },
                    {
                        "name": "通讯中断",
                        "value": 1,
                        "name_en": "Connection Down",
                        "color": "#BCBED1"
                    }
                ]
            }],
            "quotas":[
                {
                    "alias": "Statics.MatrixSts",
                    "name_cn": "方阵运行状态",
                    "name_en": "Array Run State",
                    "table_no": 61,
                    "field_no": 9,
                    "point_type": "DI",
                    "unit": "",
                    "needConvert": false,
                    "isDefault": true,
                    "defaultStyle": {
                        "yxCondition": [
                            {
                                "name": "正常运行",
                                "value": "0",
                                "name_en": "Running",
                                "color": "#58F5C0"
                            },
                            {
                                "name": "有异常",
                                "value": "1",
                                "name_en": "Abnormal",
                                "color": "#FFB500"
                            }
                        ]
                    },
                    "const_name_list": [
                        {
                            "name": "正常运行",
                            "value": 0,
                            "name_en": "Running"
                        },
                        {
                            "name": "有异常",
                            "value": 1,
                            "name_en": "Abnormal"
                        }
                    ]
                },{
                    "alias": "Statics.ConnectionSts",
                    "name_cn": "方阵通讯状态",
                    "name_en": "Array Connection State",
                    "table_no": 61,
                    "field_no": 9,
                    "point_type": "DI",
                    "unit": "",
                    "needConvert": false,
                    "isDefault": true,
                    "defaultStyle": {
                        "yxCondition": [
                            {
                                "name": "通讯正常",
                                "value": "0",
                                "name_en": "Connection Well",
                                "color": "#58F5C0"
                            },
                            {
                                "name": "通讯中断",
                                "value": "1",
                                "name_en": "Connection Down",
                                "color": "#BCBED1"
                            }
                        ]
                    },
                    "const_name_list": [
                        {
                            "name": "通讯正常",
                            "value": 0,
                            "name_en": "Connection Well"
                        },
                        {
                            "name": "通讯中断",
                            "value": 1,
                            "name_en": "Connection Down"
                        }
                    ]
                },
                {
                    "alias": "Statics.CapacitySum",
                    "name_cn": "方阵容量",
                    "name_en": "Array CapacitySum",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true,
                    "isDefault": true,
                    "defaultStyle": {
                        "convert": {
                            "coefficient": "0.001",
                            "unit": "MW"
                        }
                    }
                },
                {
                    "alias": "Statics.MachineCount",
                    "name_cn": "逆变器台数",
                    "name_en": "Array MachineCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GenActivePW",
                    "name_cn": "方阵有功功率",
                    "name_en": "Array GenActivePW",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kW",
                    "needConvert": true,
                    "isDefault": true,
                    "defaultStyle": {
                        "convert": {
                            "coefficient": "0.001",
                            "unit": "MW"
                        }
                    }
                },
                {
                    "alias": "Statics.GenReactivePW",
                    "name_cn": "方阵无功功率",
                    "name_en": "Array GenReactivePW",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "kVar",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS1",
                    "name_cn": "逆变器正常发电统计",
                    "name_en": "Array LS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS2",
                    "name_cn": "逆变器性能过低统计",
                    "name_en": "Array LS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS3",
                    "name_cn": "逆变器限功率运行统计",
                    "name_en": "Array LS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS4",
                    "name_cn": "逆变器非故障停机统计",
                    "name_en": "Array LS4",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS5",
                    "name_cn": "逆变器故障停机统计",
                    "name_en": "Array LS5",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.LS6",
                    "name_cn": "逆变器无连接统计",
                    "name_en": "Array LS6",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS1",
                    "name_cn": "集中式逆变器正常发电统计",
                    "name_en": "Array CLS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS2",
                    "name_cn": "集中式逆变器性能偏低统计",
                    "name_en": "Array CLS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS3",
                    "name_cn": "集中式逆变器限功率统计",
                    "name_en": "Array CLS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS4",
                    "name_cn": "集中式逆变器非故障停机统计",
                    "name_en": "Array CLS4",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS5",
                    "name_cn": "集中式逆变器故障停机统计",
                    "name_en": "Array CLS5",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CLS6",
                    "name_cn": "集中式逆变器无连接统计",
                    "name_en": "Array CLS6",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS1",
                    "name_cn": "组串式逆变器正常发电统计",
                    "name_en": "Array SLS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS2",
                    "name_cn": "组串式逆变器性能偏低统计",
                    "name_en": "Array SLS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS3",
                    "name_cn": "组串式逆变器限功率统计",
                    "name_en": "Array SLS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS4",
                    "name_cn": "组串式逆变器非故障停机统计",
                    "name_en": "Array SLS4",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS5",
                    "name_cn": "组串式逆变器故障停机统计",
                    "name_en": "Array SLS5",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.SLS6",
                    "name_cn": "组串式逆变器无连接统计",
                    "name_en": "Array SLS6",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.BTFS1",
                    "name_cn": "箱变运行统计",
                    "name_en": "Array BTFS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.BTFS2",
                    "name_cn": "箱变通讯故障统计",
                    "name_en": "Array BTFS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.BTFS3",
                    "name_cn": "箱变夜间状态统计",
                    "name_en": "Array BTFS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ACS1",
                    "name_cn": "交流汇流箱运行统计",
                    "name_en": "Array ACS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ACS2",
                    "name_cn": "交流汇流箱通讯故障统计",
                    "name_en": "Array ACS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ACS3",
                    "name_cn": "交流汇流箱夜间状态统计",
                    "name_en": "Array ACS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.DCS1",
                    "name_cn": "直流汇流箱运行统计",
                    "name_en": "Array DCS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.DCS2",
                    "name_cn": "直流汇流箱通讯故障统计",
                    "name_en": "Array DCS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.DCS3",
                    "name_cn": "直流汇流箱夜间状态统计",
                    "name_en": "Array DCS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CentralMachineCount",
                    "name_cn": "集中式逆变器总台数",
                    "name_en": "Array CentralMachineCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.StringMachineCount",
                    "name_cn": "组串式逆变器总台数",
                    "name_en": "Array StringMachineCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.BTFCount",
                    "name_cn": "箱变台数",
                    "name_en": "Array BTFCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.ACCount",
                    "name_cn": "交流汇流箱台数",
                    "name_en": "Array ACCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.DCCount",
                    "name_cn": "直流汇流箱台数",
                    "name_en": "Array DCCount",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GS1",
                    "name_cn": "设备正常运行统计",
                    "name_en": "Array GS1",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GS2",
                    "name_cn": "设备夜间待机统计 ",
                    "name_en": "Array GS2",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GS3",
                    "name_cn": "设备维护统计",
                    "name_en": "Array GS3",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GS4",
                    "name_cn": "设备故障统计  ",
                    "name_en": "Array GS4",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.GS5",
                    "name_cn": "设备无连接统计 ",
                    "name_en": "Array GS5",
                    "table_no": 62,
                    "field_no": 9,
                    "point_type": "AI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "方阵累计有功发电量_累计值",
                    "name_en": "Array Active Power Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "方阵累计有功发电量_当日值",
                    "name_en": "Array Active Power Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true,
                    "isDefault": true,
                    "defaultStyle": {
                        "edictNameCn": "当日发电量",
                        "convert": {
                            "coefficient": "0.001",
                            "unit": "MWh"
                        }
                    }
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "方阵累计有功发电量_当月值",
                    "name_en": "Array Active Power Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProduction",
                    "name_cn": "方阵累计有功发电量_当年值",
                    "name_en": "Array Active Power Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "方阵累计无功发电量_累计值",
                    "name_en": "Array Reactive Power Production _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "方阵累计无功发电量_当日值",
                    "name_en": "Array Reactive Power Production_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "方阵累计无功发电量_当月值",
                    "name_en": "Array Reactive Power Production_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPProduction",
                    "name_cn": "方阵累计无功发电量_当年值",
                    "name_en": "Array Reactive Power Production_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "方阵累计无功用电量_累计值",
                    "name_en": "Array Reactive Power Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "方阵累计无功用电量_当日值",
                    "name_en": "Array Reactive Power Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "方阵累计无功用电量_当月值",
                    "name_en": "Array Reactive Power Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.RPConsumed",
                    "name_cn": "方阵累计无功用电量_当年值",
                    "name_en": "Array Reactive Power Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kVarh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "方阵累计有功用电量_累计值",
                    "name_en": "Array Active Power Consumed _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "方阵累计有功用电量_当日值",
                    "name_en": "Array Active Power Consumed_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "方阵累计有功用电量_当月值",
                    "name_en": "Array Active Power Consumed_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APConsumed",
                    "name_cn": "方阵累计有功用电量_当年值",
                    "name_en": "Array Active Power Consumed_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "kWh",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_累计值",
                    "name_en": "Array Full Hours _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当日值",
                    "name_en": "Array Full Hours_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当月值",
                    "name_en": "Array Full Hours_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.APProductionHour",
                    "name_cn": "等效利用小时数_当年值",
                    "name_en": "Array Full Hours_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "h",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "方阵总CO2减排_累计值",
                    "name_en": "Array CO2 Reduction _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "方阵总CO2减排_当日值",
                    "name_en": "Array CO2 Reduction_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "方阵总CO2减排_当月值",
                    "name_en": "Array CO2 Reduction_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.CO2Sum",
                    "name_cn": "方阵总CO2减排_当年值",
                    "name_en": "Array CO2 Reduction_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "方阵收益_累计值",
                    "name_en": "Array Profit _Total",
                    "table_no": 35,
                    "field_no": 28,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "方阵收益_当日值",
                    "name_en": "Array Profit_CurDay",
                    "table_no": 35,
                    "field_no": 29,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "方阵收益_当月值",
                    "name_en": "Array Profit_CurMonth",
                    "table_no": 35,
                    "field_no": 30,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                },
                {
                    "alias": "Statics.Profit",
                    "name_cn": "方阵收益_当年值",
                    "name_en": "Array Profit_CurYear",
                    "table_no": 35,
                    "field_no": 31,
                    "point_type": "PI",
                    "unit": "",
                    "needConvert": true
                }
            ]
        },{ 
            "type": 'wts',
            "name_cn": "气象站",
            "name_en": "WTS",
            "icon": 'METEOROLOGICAL',
            "prefixName": 'WTS',
            "jumpable": true,
            "jumpToTpl": true,
            "needStatus": true,
            "needQuotas": false,
            "needName": true,
            "status":[{
                "alias": "WTST.State",
                "name_cn": "气象站状态",
                "name_en": "WTS State",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                "unit": "",
                "isDefault": true,
                "const_name_list": [
                    {
                        "name": "运行",
                        "value": 0,
                        "name_en": "Running",
                        "color": "rgba(88,245,192,1)",
                        "icon": "SUNNY"
                    },
                    {
                        "name": "夜间状态",
                        "value": 1,
                        "name_en": "Night",
                        "color": "rgba(142,133,255,1)",
                        "icon": "MOON"
                    },
                    {
                        "name": "通讯中断",
                        "value": 2,
                        "name_en": "InfoNA",
                        "color": "rgba(188,190,209,1)",
                        "icon": "COMMUNICAT_FAIL"
                    }
                ]
            }]
        },{ 
            "type": 'bs',
            "icon": 'GRID',
            "name_cn": "升压站",
            "name_en": "Substation",
            // "prefixName": 'Substation',
            "jumpable": true,
            "toSwitchPage": true,
            "needStatus": false,
            "needQuotas": false,
            "needName": false,
            "status":[],
            "quotas":[]
        }
    ],
    matrix: {
        name_cn: '方阵运行状态',
        name_en: 'Array Run State',
        alias: 'Statics.MatrixSts',
        tableNo: '61',
        fieldNo: '9',
        unit: '',
        decimal: 0,
        valueMap: {
            0: {background: '#58F5C0', icon: ''},
            1: {background: '#FFB500', icon: ''}
        }
    },
    topo: [
        {
            key: 'inverter',
            tableNo: 430,
            type: 7,
            quotas: [{
                "alias": "INVT.Status_OEM001",
                "name_cn": "故障停机",
                "name_en": "Fault Stop",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "INVT.Status_OEM002",
                "name_cn": "逆变器故障",
                "name_en": "INVT Fault",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "INVT.Status_OEM020",
                "name_cn": "交流防雷器异常",
                "name_en": "AC SPD Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "INVT.Status_OEM021",
                "name_cn": "直流防雷器异常",
                "name_en": "DC SPD Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "INVT.Status_OEM016",
                "name_cn": "通讯故障",
                "name_en": "No Connection",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "INVT.Status_OEM017",
                "name_cn": "高温告警",
                "name_en": "Temperature High Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "INVT.Status_OEM018",
                "name_cn": "直流绝缘异常",
                "name_en": "Out of electrical.DC ground fault",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "INVT.Status_OEM013",
                "name_cn": "直流侧故障",
                "name_en": "DC Input Fault",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                isSelfColor: true,
                "alias": "INVT.ListSts",
                "name_cn": "运行状态",
                "name_en": "INVT Running State",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    1: {color: '#FA465C'},  // 红
                    2: {color: '#FFB500'},
                    3: {color: '#FA465C'},
                    4: {color: '#04C766'},
                    5: {color: '#04C766'},
                    6: {color: '#04C766'},
                    7: {color: '#04C766'},
                    8: {color: '#04C766'},
                    9: {color: '#BCBED1'}
                }
            },
        ]
        },
        {
            key: 'pad',
            tableNo: 430,
            type: 8,
            quotas: [{
                "alias": "BXTF.SGZ",
                "name_cn": "事故总",
                "name_en": "Transformer Trip ",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "BXTF.GJZ",
                "name_cn": "告警总",
                "name_en": "Transformer Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "BXTF.OilTempHigh",
                "name_cn": "油温高告警",
                "name_en": "Oil Temperature Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "BXTF.OilTempHigher",
                "name_cn": "油温超高跳闸",
                "name_en": "Oil Temperature Trip",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "BXTF.OilLow",
                "name_cn": "油位低信号",
                "name_en": "Oil Low",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "BXTF.OilHigh",
                "name_cn": "油位高信号",
                "name_en": "Oil High",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "BXTF.WindingTempHigh",
                "name_cn": "绕组温度高告警",
                "name_en": "Winding Temperature Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "BXTF.OilPressure",
                "name_cn": "压力释放跳闸",
                "name_en": "Oil Pressure Trip",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },{
                "alias": "BXTF.LightGas",
                "name_cn": "轻瓦斯告警",
                "name_en": "Light Gas Alarm",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
            {
                "alias": "BXTF.HeavyGas",
                "name_cn": "重瓦斯跳闸",
                "name_en": "Heavy Gas Trip",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},
                    1: {color: '#FA465C'},
                }
            },
        ]
        },
        {
            key: 'dc',
            tableNo: 432,
            type: 8,
            quotas: [{
                isSelfColor: true,
                "alias": "CBBX001.OperateSts",
                "name_cn": "",
                "name_en": "",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},//绿色
                    1: {color: '#04C766'},
                    2: {color: '#04C766'},
                    3: {color: '#FA465C'},//红色
                    4: {color: '#FFB500'},//黄色
                }
            },{
                isSelfColorLink: true, // 关联的其它遥信颜色,0使用isSelfColor=true测点颜色,1则使用当前颜色
                "alias": "CBBX001.ConnectionSts",
                "name_cn": "",
                "name_en": "",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    1: {color: '#BCBED1'}
                }
            }]
        },
        {
            key: 'ac',
            tableNo: 430,
            type: 15,
            quotas: [{
                isSelfColor: true,
                "alias": "CBBX.OperateSts",
                "name_cn": "",
                "name_en": "",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    0: {color: '#04C766'},//绿色
                    1: {color: '#04C766'},
                    2: {color: '#04C766'},
                    3: {color: '#FA465C'},//红色
                    4: {color: '#FFB500'},//黄色
                }
            },{
                isSelfColorLink: true, // 关联的其它遥信颜色,0使用isSelfColor=true测点颜色,1则使用当前颜色
                "alias": "CBBX.ConnectionSts",
                "name_cn": "",
                "name_en": "",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    1: {color: '#BCBED1'}
                }
            }]
        },
        {
            key: 'strInverter',
            tableNo: 432,
            type: 6,
            quotas: [{
                isSelfColor: true,
                "alias": "INVT001.ListSts",
                "name_cn": "",
                "name_en": "",
                "table_no": 61,
                "field_no": 9,
                "point_type": "DI",
                valueMap: {
                    1: {color: '#FA465C'},  // 红
                    2: {color: '#FFB500'},
                    3: {color: '#FA465C'},
                    4: {color: '#04C766'},
                    5: {color: '#04C766'},
                    6: {color: '#04C766'},
                    7: {color: '#04C766'},
                    8: {color: '#04C766'},
                    9: {color: '#BCBED1'}
                }
            }]
        }

    ]
}