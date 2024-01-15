export const config = {
	"ActiveArea": {
		"layout": {
			"i": "a",
			"x": 0,
			"y": 0,
			"w": 10,
			"h": 13
		},
		"title": "储能有功参数",
		"titleEn": "Active Power Control",
		"auth": "Ems_55",
		"children": [{
			"desc": "SOC裕度下限(%)",
			"descEn": "SOC Lower Limit (%)",
			"alias": ".DEFINE.AGC_SOCkeep_min",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "SOC裕度上限(%)",
			"descEn": "SOC Upper Limit (%)",
			"alias": ".DEFINE.AGC_SOCkeep_max",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "有功上升速率(kW/s)",
			"descEn": "Power Rising Rate (kW/s)",
			"alias": ".DEFINE.pUpRampRate",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "有功下降速率(kW/s)",
			"descEn": "Power Falling Rate (kW/s)",
			"alias": ".DEFINE.pDownRampRate",
			"tableNo": "62",
			"decimal": 3
		}]
	},
	"ReactiveArea": {
		"layout": {
			"i": "b",
			"x": 0,
			"y": 12,
			"w": 10,
			"h": 18
		},
		"auth": "Ems_57",
		"title": "储能无功参数",
		"titleEn": "Reactive Power Control",
		"children": [{
			"desc": "电压死区上限(p.u.)",
			"descEn": "Vol Upper Limit (p.u)",
			"alias": ".DEFINE.volNormalHigh",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "电压死区下限(p.u.)",
			"descEn": "Vol Lower Limit (p.u)",
			"alias": ".DEFINE.volNormalLow",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "电网额定电压(kV)",
			"descEn": "Grid Standard Vol (kV)",
			"alias": ".DEFINE.volRated",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "电压调节Droop(%)",
			"descEn": "Vol Regulation Droop (%)",
			"alias": ".DEFINE.droopPnt",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "无功调节上限(kvar)",
			"descEn": "RPower Upper Limit (kvar)",
			"alias": ".DEFINE.Qmax_contrat",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "无功调节下限(kvar)",
			"descEn": "RPower Lower Limit (kvar)",
			"alias": ".DEFINE.Qmin_contrat",
			"tableNo": "62",
			"decimal": 3
		}]
	},
	"FrequencyArea": {
		"layout": {
			"i": "c",
			"x": 11,
			"y": 0,
			"w": 22,
			"h": 31
		},
		"auth": "Ems_58",
		"title": "一次调频参数",
		"titleEn": "Frequency Control",
		"children": [{
			"desc": "SOC裕度下限(%)",
			"descEn": "SOC Lower Limit (%)",
			"alias": ".DEFINE.FR_SOCkeep_min",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "SOC裕度上限(%)",
			"descEn": "SOC Upper Limit (%)",
			"alias": ".DEFINE.FR_SOCkeep_max",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "有功上升速率(kW/s)",
			"descEn": "Power Rising Rate (kW/s)",
			"alias": ".DEFINE.FR_pUpRampRate",
			"tableNo": "62",
			"decimal": 3
		}, {
			"desc": "有功下降速率(kW/s)",
			"descEn": "Power Falling Rate (kW/s)",
			"alias": ".DEFINE.FR_pDownRampRate",
			"tableNo": "62",
			"decimal": 3
		},
		// {
		// 	"desc": "电网标准频率(Hz)",
		// 	"descEn": "Grid Standard Freq (Hz)",
		// 	"alias": ".DEFINE.grid_standard_freq",
		// 	"tableNo": "62",
		// 	"decimal": 3,
		// 	"chartId": "f0",
		// 	"chartType": "normal_center",
		// 	"chartName": "P(MW)",
		// 	"chartLabel": "f<sub>0</sub>"
		// }, {
		// 	"desc": "频率变化死区(Hz)",
		// 	"descEn": "Insensitive Freq (Hz)",
		// 	"alias": ".DEFINE.FR_insensitivity",
		// 	"tableNo": "62",
		// 	"decimal": 3
		// }, {
		// 	"desc": "调频有功下限(%Pn)",
		// 	"descEn": "Power Lowest Limit (%Pn)",
		// 	"alias": ".DEFINE.FR_limit_min",
		// 	"tableNo": "62",
		// 	"decimal": 3,
		// 	"chartId": "pmin",
		// 	"chartType": "diff_nil",
		// 	"chartName": "ΔP<sub>min</sub>",
		// 	"chartLabel": "ΔP<sub>min</sub>"
		// }
	],
		"xAxis": {
			"name": "f(Hz)"
		},
		"yAxis": {
			"name": "P(MW)"
		},
		"charts": [{
			"desc": "f<sub>1</sub>(Hz)",
			"descEn": "f<sub>1</sub>(Hz)",
			"alias": ".DEFINE.FR_over_f1",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f1",
			"chartType": "normal_side",
			"chartName": "",
			"chartLabel": "f<sub>1</sub>",
			"group": 1,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>-1</sub>(Hz)",
			"descEn": "f<sub>-1</sub>(Hz)",
			"alias": ".DEFINE.FR_bellow_f1",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f-1",
			"chartType": "normal_side",
			"chartName": "",
			"chartLabel": "f<sub>-1</sub>",
			"group": 1,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>2</sub>(Hz)",
			"descEn": "f<sub>2</sub>(Hz)",
			"alias": ".DEFINE.FR_over_f2",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f2",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>2</sub>",
			"group": 2,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>2</sub>(%Pn)",
			"descEn": "ΔP<sub>2</sub>(%Pn)",
			"alias": ".DEFINE.FR_over_P2",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p2",
			"chartType": "diff_negative,f2",
			"chartName": "",
			"chartLabel": "ΔP<sub>2</sub>",
			"group": 2,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>-2</sub>(Hz)",
			"descEn": "f<sub>-2</sub>(Hz)",
			"alias": ".DEFINE.FR_bellow_f2",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f-2",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>-2</sub>",
			"group": 2,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>-2</sub>(%Pn)",
			"descEn": "ΔP<sub>-2</sub>(%Pn)",
			"alias": ".DEFINE.FR_bellow_P2",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p-2",
			"chartType": "diff_positive,f-2",
			"chartName": "",
			"chartLabel": "ΔP<sub>-2</sub>",
			"group": 2,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>3</sub>(Hz)",
			"descEn": "f<sub>3</sub>(Hz)",
			"alias": ".DEFINE.FR_over_f3",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f3",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>3</sub>",
			"group": 3,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>3</sub>(%Pn)",
			"descEn": "ΔP<sub>3</sub>(%Pn)",
			"alias": ".DEFINE.FR_over_P3",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p3",
			"chartType": "diff_negative,f3",
			"chartName": "",
			"chartLabel": "ΔP<sub>3</sub>",
			"group": 3,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>-3</sub>(Hz)",
			"descEn": "f<sub>-3</sub>(Hz)",
			"alias": ".DEFINE.FR_bellow_f3",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f-3",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>-3</sub>",
			"group": 3,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>-3</sub>(%Pn)",
			"descEn": "ΔP<sub>-3</sub>(%Pn)",
			"alias": ".DEFINE.FR_bellow_P3",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p-3",
			"chartType": "diff_positive,f-3",
			"chartName": "",
			"chartLabel": "ΔP<sub>-3</sub>",
			"group": 3,
			"supCategory":'charts'
		},
		{
			"desc": "f<sub>4</sub>(Hz)",
			"descEn": "f<sub>4</sub>(Hz)",
			"alias": ".DEFINE.FR_over_f4",
			"tableNo": "62",
			"decimal": 4,
			"min": 0,
			"max": 100,
			"chartId": "f4",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>4</sub>",
			"group": 4,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>4</sub>(%Pn)",
			"descEn": "ΔP<sub>4</sub>(%Pn)",
			"alias": ".DEFINE.FR_over_P4",
			"tableNo": "62",
			"decimal": 4,
			"chartId": "p4",
			"chartType": "diff_negative,f4",
			"chartName": "",
			"chartLabel": "ΔP<sub>4</sub>",
			"group": 4,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>-4</sub>(Hz)",
			"descEn": "f<sub>-4</sub>(Hz)",
			"alias": ".DEFINE.FR_bellow_f4",
			"tableNo": "62",
			"decimal": 4,
			"min": 0,
			"max": 100,
			"chartId": "f-4",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>-4</sub>",
			"group": 4,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>-4</sub>(%Pn)",
			"descEn": "ΔP<sub>-4</sub>(%Pn)",
			"alias": ".DEFINE.FR_bellow_P4",
			"tableNo": "62",
			"decimal": 4,
			"chartId": "p-4",
			"chartType": "diff_positive,f-4",
			"chartName": "",
			"chartLabel": "ΔP<sub>-4</sub>",
			"group": 4,
			"supCategory":'charts'
		},
		{
			"desc": "f<sub>5</sub>(Hz)",
			"descEn": "f<sub>5</sub>(Hz)",
			"alias": ".DEFINE.FR_over_f5",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f5",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>5</sub>",
			"group": 5,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>5</sub>(%Pn)",
			"descEn": "ΔP<sub>5</sub>(%Pn)",
			"alias": ".DEFINE.FR_over_P5",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p5",
			"chartType": "diff_negative,f5",
			"chartName": "",
			"chartLabel": "ΔP<sub>5</sub>",
			"group": 5,
			"supCategory":'charts'
		}, {
			"desc": "f<sub>-5</sub>(Hz)",
			"descEn": "f<sub>-5</sub>(Hz)",
			"alias": ".DEFINE.FR_bellow_f5",
			"tableNo": "62",
			"decimal": 3,
			"min": 0,
			"max": 100,
			"chartId": "f-5",
			"chartType": "normal",
			"chartName": "",
			"chartLabel": "f<sub>-5</sub>",
			"group": 5,
			"supCategory":'charts'
		}, {
			"desc": "ΔP<sub>-5</sub>(%Pn)",
			"descEn": "ΔP<sub>-5</sub>(%Pn)",
			"alias": ".DEFINE.FR_bellow_P5",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "p-5",
			"chartType": "diff_positive,f-5",
			"chartName": "",
			"chartLabel": "ΔP<sub>-5</sub>",
			"group": 5,
			"supCategory":'charts'
		},
		{
			"desc": "电网标准频率(Hz)",
			"descEn": "Grid Standard Freq (Hz)",
			"alias": ".DEFINE.grid_standard_freq",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "f0",
			"chartType": "normal_center",
			"chartName": "P(MW)",
			"chartLabel": "f<sub>0</sub>",
			"group": 6,
			"supCategory":'charts'
		}, 
		{
			"desc": "频率变化死区(Hz)",
			"descEn": "Insensitive Freq (Hz)",
			"alias": ".DEFINE.FR_insensitivity",
			"tableNo": "62",
			"decimal": 3,
			"chartId":'FRins',
			"group": 6,
			"supCategory":'charts'
		},
		{
			"desc": "调频有功下限(%Pn)",
			"descEn": "Power Lowest Limit (%Pn)",
			"alias": ".DEFINE.FR_limit_min",
			"tableNo": "62",
			"decimal": 3,
			"chartId": "pmin",
			"chartType": "diff_nil",
			"chartName": "ΔP<sub>min</sub>",
			"chartLabel": "ΔP<sub>min</sub>",
			"group": 6,
			"supCategory":'charts'
		},
		{
			"desc": "PFC增功率使能",
			"descEn": "PFC-PwrUpAllow",
			"alias": ".DEFINE.FR_Pup_enable_flag",
			"tableNo": "61",
			"decimal": 3,
			"chartId":"PubEnable",
			"group": 7,
			"supCategory":"charts"
		},{
			"desc": "PFC减功率使能",
			"descEn": "PFC_PwrDownAllow",
			"alias": ".DEFINE.FR_Pdown_enable_flag",
			"tableNo": "61",
			"decimal": 3,
			"chartId":"PdownEnable",
			"group": 7,
			"supCategory":"charts"
		}
	]
	}
};