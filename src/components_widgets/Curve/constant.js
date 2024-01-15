import Intl, { msgTag } from '@/common/lang';
import moment from 'moment';
import { NumberUtil } from '@/common/utils';
import { InputTextSize } from '@/common/constants';

export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const SLOT = '--';

export const CHART_LIMIT_NUM = 5;

export const TIME_LIMIT_NUM = -1;

export const tableNoList = ['62', '35'];

export const defaultRangeNum = 7;

export const DEFAULT_CACHE = {
    titleEnable: true,
    titleTextEn: '',
    titleTextCn: '',
    userConfig: []
}

export const TITLE_SET = [
    {
        name: msg('CURVE.showTitle'),
        members: [
            {
                component: 'check',
                key: 'titleEnable',
            }
        ]
    },
    {
        name: msg('CURVE.title'),
        members: [{
            component: 'input',
            key: isZh ? 'titleTextCn' : 'titleTextEn',
            maxLength: InputTextSize.Simple
        }]
    }
]

export const CHART_TYPE_MAP = {
    line: {
        type: 'line'
    },
    bar: {
        type: 'bar'
    },
    area: {
        type: 'line',
        symbol: 'none'
    },
    bullet: {
        type: 'scatter',
        symbol: 'roundRect',
        symbolSize:[11, 3]
    }
}

export const granularityUnits = [
    {
        label: msg('CURVE.day'),
        value: 'days'
    },
    {
        label: msg('CURVE.month'),
        value: 'months'
    },
    {
        label: msg('CURVE.year'),
        value: 'years'
    },
]

export const DEFAULT_VALUE = {
    CHART_TYPE: 'line',
    COLOR: ['rgba(0,219,255,1)', 'rgba(88,245,192,1)', 'rgba(142,133,255,1)', 'rgba(255,181,0,1)', 'rgba(245,10,34,1)'],
    SUBTRACT: 'normal',
    DECIMAL: 2
}

export const DATE_TYPE = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    TOTAL: 'total',
    CUSTOMIZE: 'customize',
    REALTIME: 'realtime'
};

export const PICKER = {
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
};

export const DATE_MOMENT_FORMAT = {
    DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
    DATE_HOUR_MINUTE: 'YYYY-MM-DD HH:mm',
    DATE: 'YYYY-MM-DD',
    YEAR: 'YYYY',
    MONTH: 'MM',
    DAY: 'DD',
    TIME: 'HH:mm:ss',
    HOUR: 'HH',
    MINUTE: 'mm',
    SECOND: 'ss',
    YEAR_MONTH: 'YYYY-MM',
    HOUR_MINUTE: 'HH:mm',
    TIME_ZERO: '00:00:00',
    ZERO: '00',
    MINUTE_ZERO: ':00',
    SECOND_ZERO: ':00'
};

export const pointTypes = [
    {typeKey: 'YC', noList: ['62'], name: msg('CURVE.yc')},
    // {typeKey: 'YX', noList: ['61'], name: msg('CURVE.yx')},
    {typeKey: 'DD', noList: ['35'], name: msg('CURVE.dd')}
]

export const otherType = {typeKey: 'OTHER', name: msg('CURVE.other')};

export const timeSetContent = [
    {
        id: 'Graininess',
        key: 'Graininess',
        value: 'Graininess',
        title: msg('CURVE.graininess'),
    },
    {
        id: 'day',
        pId: 'Graininess',
        key: 'day',
        value: 'day',
        needLabelShow: true,
        title: msg('CURVE.day'),
        options: [
            {
                value: '1_min',
                name: '1' + msg('CURVE._min'),
            },
            {
                value: '5_min',
                name: '5' + msg('CURVE._min'),
            },
            {
                value: '10_min',
                name: 10 + msg('CURVE._min'),
            },
            {
                value: '15_min',
                name: '15' + msg('CURVE._min'),
            },
            {
                value: '30_min',
                name: '30' + msg('CURVE._min'),
            },
            {
                value: '1_hour',
                name: '1' + msg('CURVE._hour'),
            },
            {
                value: '2_hour',
                name: '2' + msg('CURVE._hour'),
            },
            {
                value: '4_hour',
                name: '4' + msg('CURVE._hour'),
            }
        ]
    },
    {
        id: 'week',
        pId: 'Graininess',
        key: 'week',
        value: 'week',
        needLabelShow: true,
        title: msg('CURVE.week'),
        options: [
            {
                value: '1_day',
                name: '1' + msg('CURVE._day'),
            }
        ]
    },
    {
        id: 'month',
        pId: 'Graininess',
        key: 'month',
        value: 'month',
        needLabelShow: true,
        title: msg('CURVE.month'),
        options: [
            {
                value: '1_day',
                name: '1' + msg('CURVE._day'),
            }
        ]
    },
    {
        id: 'year',
        pId: 'Graininess',
        key: 'year',
        value: 'year',
        needLabelShow: true,
        title: msg('CURVE.year'),
        options: [
            {
                value: '1_month',
                name: '1' + msg('CURVE._month'),
            }
        ]
    },
    {
        id: 'total',
        pId: 'Graininess',
        key: 'total',
        value: 'total',
        needLabelShow: true,
        title: msg('CURVE.total'),
        options: [
            {
                value: '1_year',
                name: '1' + msg('CURVE._year'),
            }
        ]
    },
    {
        id: 'customize',
        pId: 'Graininess',
        key: 'customize',
        value: 'customize',
        needLabelShow: true,
        title: msg('CURVE.customize'),
        options: [
            {
                value: '1_min',
                name: '1' + msg('CURVE._min'),
            },
            {
                value: '5_min',
                name: '5' + msg('CURVE._min'),
            },
            {
                value: '1_hour',
                name: '1' + msg('CURVE._hour'),
            },
            {
                value: '1_day',
                name: '1' + msg('CURVE._day'),
            }
        ]
    },
    {
        id: 'realtime',
        pId: 'Graininess',
        key: 'realtime',
        value: 'realtime',
        needLabelShow: true,
        title: msg('CURVE.realtime'),
        options: [
            {
                value: '5_second',
                name: '5' + msg('CURVE._second'),
            }
        ]
    },
]

export const getTimeTitle = (key) => {
    return timeSetContent.find(item => item.key === key)?.title || key;
}

export const timeOptions = timeSetContent.map((ele) => {
    let {id, key, value, title, pId, needLabelShow} = ele;
    return Object.assign({
        id: id,
        key: key,
        value: value,
        title: title,
    }, 
    pId ? {pId: pId} : {},
    needLabelShow ? {needLabelShow: needLabelShow} : {})
})

export const timeDropDown = (timeGran, list, includeDd = false) => {
    return [
        {
            name: msg('CURVE.timeInterval'),
            members: [
                {
                    component: 'select',
                    type: '',
                    key: 'interval',
                    options: timeSetContent.find(item => item.key === timeGran)?.options?.filter(option => {
                        return list.indexOf(option.value) > -1;
                    })?.map(option => {
                        if(includeDd && option.value === '1_min'){
                            return Object.assign({}, option, {disabled: true})
                        }else{
                            return option;
                        }
                    })
                }
            ]
        }
    ]
}

export const getQuotaKey = (ele) => {
    let {table_no = '', alias = '', field_no = ''} = ele;
    return table_no + ":" + alias + ":" + field_no;
}

export const attriKeys = [
    'edictNameCn', 
    'edictNameEn', 
    'chartType',
    'color',
    'convert',
    'subtract',
    'isDefault'
]

const basePointDropDown = [
    {
        name: msg('CURVE.showName'),
        members: [
            {
                component: 'input',
                key: isZh ? 'edictNameCn' : 'edictNameEn',
                maxLength: InputTextSize.Simple
            }
        ]
    },
    {
        name: msg('CURVE.style'),
        members: [
            {
                component: 'select',
                type: 'chartType',
                key: 'chartType',
            },
            {
                component: 'colorPick',
                key: 'color',
            }
        ]
    },
    {
        members: [
            {
                component: 'condition',
                type: 'convert',
                key: 'convert',
            }
        ]
    },
    {
        members: [
            {
                component: 'axis',
                key: 'axisProps',
            }
        ]
    },
];
    
const diff = {
    name: msg('CURVE.subtract'),
    members: [
        {
            component: 'select',
            type: '',
            key: 'subtract',
            options: [{value: 'subtract', name: msg('CURVE.yes')},{value: 'normal', name: msg('CURVE.no')}]
        }
    ]
}

const defaultCheck = {
    name: msg('CURVE.default'),
    members: [
        {
            component: 'switch',
            key: 'isDefault',
            style: {'margin-left': 'auto'}
        }
    ]
}

const planCheck = {
    name: msg('CURVE.plan'),
    members: [
        {
            component: 'switch',
            key: 'isPlan',
            style: {'margin-left': 'auto'}
        }
    ]
}

export const defaultAxisProps = {
    axisType: 'special',
    position: 'left',
    max: '',
    min: '',
    onChange: () => {}
}

// export const defaultPointProps = {
//     convert: {},
//     edictNameCn: '',
//     edictNameEn: '',
//     chartType: 'line',
//     axisProps: defaultAxisProps
// }

export const getDefaultValue = (index) => {
    return {
        isDefault: false,
        isPlan: false,
        edictNameCn: '',
        edictNameEn: '',
        chartType: 'line',
        axisProps: defaultAxisProps,
        color: DEFAULT_VALUE.COLOR[index] || 'rgba(255,162,0,1)',
        subtract: 'normal',
        convert: {}
    }
}

export const pointDropDown = (arithType, isDemo = false, configEnable = true, isReal = false) => {
    let headLen = 1;
    let content = JSON.parse(JSON.stringify(basePointDropDown));
    arithType && content.splice(1, 0, diff);
    isDemo && content.splice(0, 0, defaultCheck);
    if(!isReal && isDemo){
        content.splice(0, 0, planCheck);
        headLen = 2;
    }
    !configEnable && content.splice(headLen, content.length - 1);
    return content;
} 

const getCurveType = (isReal, isPlan) =>{
    if(isPlan){
        return "4104";
    }else if(isReal){
        return "4096";
    }else{
        return "4097";
    }
}

export const getHistoryCurveReq = (isReal = false, isPlan = false) => {
    return {
        branch_para_list: '',
        curve: [],
        curve_type: getCurveType(isReal, isPlan),
        id: '',
        start_time: isReal ? "{\"day\":{\"bflag\":\"1\",\"value\":\"0\"},\"hour\":{\"bflag\":\"1\",\"value\":\"0\"},\"minute\":{\"bflag\":\"1\",\"value\":\"-30\"},\"month\":{\"bflag\":\"1\",\"value\":\"0\"},\"second\":{\"bflag\":\"1\",\"value\":\"0\"},\"week\":{\"bdealweek\":\"0\",\"bflag\":\"1\",\"dayofweek\":\"0\",\"firstweekday\":\"1\",\"week\":\"0\"},\"year\":{\"bflag\":\"1\",\"value\":\"0\"}}\n" : '',
        end_time: isReal ? "{\"day\":{\"bflag\":\"1\",\"value\":\"0\"},\"hour\":{\"bflag\":\"1\",\"value\":\"0\"},\"minute\":{\"bflag\":\"1\",\"value\":\"0\"},\"month\":{\"bflag\":\"1\",\"value\":\"0\"},\"second\":{\"bflag\":\"1\",\"value\":\"0\"},\"week\":{\"bdealweek\":\"0\",\"bflag\":\"1\",\"dayofweek\":\"0\",\"firstweekday\":\"1\",\"week\":\"0\"},\"year\":{\"bflag\":\"1\",\"value\":\"0\"}}\n" : '',
        interval_type: 1, // 0为秒，1为分钟，2为日，3为月，4为年（默认为0）
        sample_cycle: 1, // interval_type对应采样间隔值
        time_mode: isReal ? '0' : '1' // start_time、end_time时间模式, 0为json格式, 1为标准时间字符串
    };
}

export const getHistoryCurveModel = (isReal = false, isPlan = false) => {
    return {
        id: '',
        key: '', // 1:tableNo:alias:feildNo
        decimal: 3,
        sub_type: getCurveType(isReal, isPlan),
        sub_type_x: getCurveType(isReal, isPlan),
        arith_type: 'normal' //normal | subtract做差处理
    };
} 

export const getInvertal = (interval) => {
    if(typeof interval === 'undefined' || interval === null || interval === '') return;

    let type = 1; // 0为秒，1为分钟，2为日，3为月，4为年（默认为0）
    let cycle = 1;

    let [num, unit] = interval.split('_');
    if(num && unit){
        switch(unit) {
            case 'min':
                type = 1;
                cycle = Number(num);
                break;

            case 'hour':
                type = 1;
                cycle = Number(num) * 60;
                break;

            case 'day':
                type = 2;
                cycle = Number(num);
                break;

            case 'month':
                type = 3;
                cycle = Number(num);
                break;

            case 'year':
                type = 4;
                cycle = Number(num);
                break;
        }
    };

    return {
        interval_type: type,
        sample_cycle: cycle
    }
}

export const getConvertRes = (pointData = [], convertRule) => {

    let convert = Object.assign({}, { decimal: DEFAULT_VALUE.DECIMAL }, convertRule || {});

    const {coefficient, decimal} = convert;

    return pointData.map(xy => {
        let {x, y} = xy;
        let yValue = (y || y === 0) ? Number(y.split(',').join('')) : '';

        if(yValue && coefficient){
            yValue = yValue * coefficient;
        }

        if(yValue || yValue === 0){
            yValue = NumberUtil.format(yValue, null, decimal, false);
        }

        return {
            x: x,
            y: String(yValue)
        }
    })
}

/**
 * 
 * @param {String} dateType @see DATE_TYPE
 * @param {Object} momentDate @see moment
 * @returns 
 */
 export const getRangeChangedMomentDate = (dateType, momentDate) => {
    let dateRange = [];

    switch(dateType){
        case DATE_TYPE.DAY:
            const day = momentDate.format(DATE_MOMENT_FORMAT.DATE);
            const nextDay = momentDate.add(1, 'days').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${day} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextDay} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.WEEK:
            const firstDayOfWeek = momentDate.isoWeekday(1).format(DATE_MOMENT_FORMAT.DATE);
            const lastDayOfWeek = moment(firstDayOfWeek).add(7, 'days').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${firstDayOfWeek} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${lastDayOfWeek} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.MONTH:
            const month = momentDate.date(1).format(DATE_MOMENT_FORMAT.DATE);
            const nextMonth = momentDate.date(1).add(1, 'months').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${month} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextMonth} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.YEAR:
            const year = momentDate.month(0).date(1).format(DATE_MOMENT_FORMAT.DATE);
            const nextYear = momentDate.month(0).date(1).add(1, 'years').format(DATE_MOMENT_FORMAT.DATE);
            dateRange = [
                `${year} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                `${nextYear} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
        case DATE_TYPE.TOTAL:
            dateRange = [
                '2010-01-01 00:00:00',
                `${moment().add(1, 'years').format(DATE_MOMENT_FORMAT.DATE)} ${DATE_MOMENT_FORMAT.TIME_ZERO}`
            ];
            break;
    }

    return dateRange;
};

export const getDefaultCustomizeRange = (num, granularity = granularityUnits[0].value) => {
    return [moment().subtract(num - 1, granularity).startOf('d'), moment().endOf('d')];
}

export const getAddTime = (interval) => {
    if(interval){
        let arr = interval.split('_');

        switch(arr[1]){
            case 'day':
                return [arr[0], 'days'];

            case 'min':
                return [arr[0], 'minutes'];

            case 'hour':
                return [arr[0], 'hours'];
        }
    }

    return [1, 'days']
}

export const fill_UTC_area = (val) => {
	if(val==null||val==undefined)return '';
	val=""+val;
	if(!val.match(/^((-|\+)?\d+)(\.\d+)?$/))return '';//如果不是数字
	if(0==val)return '(UTC)';
	
	var plus ='';
	var inte=parseInt(val);
	if(inte>=0)plus='+';
	else plus='-';
	inte=Math.abs(inte);
	inte=(inte>=10?'':'0')+inte;
	
	var floa=parseInt(parseFloat(Math.abs(val))%1*60);
	floa=(floa>=10?'':'0')+floa;
	return '(UTC'+plus+inte+':'+floa+')';
}

// time: "2022-10-12 13:51:26"
// lastPeriod unit: "minute"
// interval unit: "second"
export const fillingPoints = (time = '2022-04-25 00:00:00', lastPeriod = 30, interval = 5) => {
    let currentTime = moment(time);
    let res = [];

    for(let i = 0; i < lastPeriod*60/interval + 1; i++){
        let x = currentTime.subtract(interval, 'second').format('YYYY-MM-DD HH:mm:ss');
        res.splice(0, 0, {x: x, y: ''})
    }

    return res
}
