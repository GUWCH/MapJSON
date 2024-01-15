/* eslint-disable */
import { DateUtil, NumberUtil } from '../../common/utils';
import { autoComma } from '../../common/util-scada';
import { scadaVar } from '../../common/constants';
import { AREALINE_TYPE } from '../constants';
import styles from '../style.mscss';

const timeFormat = scadaVar('g_field_date.time_format') || 'yyyy-MM-dd hh:mm:ss';
const dayFormat = scadaVar('g_field_date.yyyy_MM_dd_format') || 'yyyy-MM-dd';

const AREALINE_STYLE = {
    [AREALINE_TYPE.GREEN]: {
        color: '#00FF00',
        lineWidth: 2,
        lineOpacity: 1,
        startColor: 'rgba(180, 236, 81, 1)',
        stopColor: 'rgba(66, 147, 33, .4)'
    },
    [AREALINE_TYPE.TURQUOISE]: {
        color: '#0BA4CD',
        lineWidth: 2,
        lineOpacity: 1,
        startColor: '#51BEEC',
        stopColor: 'rgba(33, 98, 147, .4)'
    },
    [AREALINE_TYPE.BLUE]: {
        color: '#0E43FF',
        lineWidth: 2,
        lineOpacity: 1,
        startColor: '#3178F5',
        stopColor: 'rgba(23, 89, 182, .4)'
    },
    [AREALINE_TYPE.PURPLE]: {
        color: '#8C7DF2',
        lineWidth: 2,
        lineOpacity: 1,
        startColor: '#731CBD',
        stopColor: 'rgba(11, 6, 90, .4)'
    },
    [AREALINE_TYPE.RED]: {
        color: '#FF4500',
        lineWidth: 2,
        lineOpacity: 1,
        startColor: '#EC5151',
        stopColor: 'rgba(107, 103, 21, .4)'
    }
}

const getArealineStyle = (arealineType: keyof typeof AREALINE_TYPE): {} => {
    const def: typeof AREALINE_STYLE[keyof typeof AREALINE_STYLE] = AREALINE_STYLE[arealineType];
    if(!def) return {};

    const ret: {[k: string]: any} = {};
    ret.color = def.color;
    ret.lineStyle = {
        color: def.color,
        width: def.lineWidth,
        opacity: def.lineOpacity
    };
    ret.areaStyle = {
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: def.startColor
            }, {
                offset: 1, color: def.stopColor
            }],
            global: false
        },
        opacity: 0.55
    };

    return ret;
}

const areaLineSeries = {
    animation: false,
    name: '',
    type: 'line',
    smooth: true,
    symbol: 'none',
    showSymbol: false,
    color: 'rgba(81, 190, 236, 1)',
    stack: '',
    lineStyle: {
        width: 1.5,
        opacity: 0.55
    },
    label: {
        normal: {
            show: false,
            position: 'top'
        }
    },
    areaStyle: {
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: 'rgba(33, 98, 147, 0.4)'
            }, {
                offset: 1, color: 'rgba(81, 190, 236, 1)'
            }],
            global: false
        },
        opacity: 0.55
    },
    data: []
};

/**
 * 数据格式都要一致
 * @param data 
 * @returns 
 */
const hasValue = (data=[]) => {
    for(let i = 0, len = data.length; i < len; i++){
        for(let j = 0, jLen = data[i].data.length; j < jLen; j++){
            if(data[i].data[j].value[1] === 0 || !!data[i].data[j].value[1]){
                return true;
            }
        }
    }
    return false;
}

type TAreaLineData = {
    xAxisData: [],
    yAxisName: string;
    data: {}[];
    hasPower: boolean; // 是否含有电量, 电量时xAxis interval需要修改
    [k: string]: any;
};

const areaLineModel: TAreaLineData = {
    xAxisData: [],
    yAxisName: '',
    data: [],
    hasPower: false
};

export function getAreaLineOption(areaLineData?: TAreaLineData) {
    let data = Object.assign({}, areaLineModel, areaLineData || areaLineModel);
    data.data = data.data || [];

    return {
        tooltip: {
            transitionDuration: 0,
            trigger: 'axis',
            axisPointer: {
                type: 'none',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            textStyle: {
                color: '#fff'
            },
            className: styles.tooltip,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderWidth: 0,
            confine: false,
            appendToBody: true,
            formatter: tooltipFormat()
        },
        legend: {
            type: 'scroll',
            top: 'bottom',
            textStyle: {
                fontSize: '130%',
                color: '#fff'
            },
            icon: 'circle',
            itemGap: 15,
            itemHeight: 10,
            inactiveColor: '#666'
        },
        grid: {
            left: hasValue(data.data) ? '0px' : '25px',
            right: '15px',
            top: '30px',
            bottom: '30px',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(142, 143, 158, 1)'
                },
                show: false
            },
            axisLabel: {
                fontSize: 11,
                hideOverlap: true,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: function (value, index) {
                    var date = new Date(Number(value));
                    var label = DateUtil.format(date, 0, 'hh:mm');
                    if(label === '00:00' && value > new Date().getTime()){
                        label = '24:00';
                    }
                    return label;
                },
                interval: data.hasPower ? 47 : 239 //47
            },
            splitLine: {
                show: false
            }
        }],
        yAxis: [{
            name: data.yAxisName,
            nameGap: 8,
            nameTextStyle: {
                fontSize: 12,
                align: 'center',
                //padding: [0, 8, 0, 0]
            },
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'rgba(142, 143, 158, .9)'
                },
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true,
                //interval: 3,
                fontSize: 11,
                hideOverlap: true
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['rgba(62, 62, 71, .5)']
                }
            }
        }],
        series: data.data.map((d, ind, arr) => {
            return Object.assign({}, areaLineSeries, getArealineStyle(d.curveType), JSON.parse(JSON.stringify(d)));
        })
    };
};


type TBarData = {
    yAxisName: string;
    data: {}[];
    type: string;
    total: any;
    [k: string]: any;
};

const barModel: TBarData = {
    yAxisName: '',
    data: [],
    type: '',
    total: null
};

let barSeries = {
    name: '',
    type: 'bar',
    barWidth: 5,
    smooth: true,
    symbol: 'none',
    showSymbol: false,
    color: 'rgba(81, 190, 236, 1)',
    stack: '',
    data: []
};

export function getBarOption(barData: TBarData) {
    let data = Object.assign({}, barModel, barData || {});
    data.data = data.data || [];

    return {
        tooltip: {
            transitionDuration: 0,
            trigger: 'axis',
            axisPointer: {
                type: 'none',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            confine: false,
            appendToBody: true,
            formatter: tooltipFormat(data.type, data.total)
        },
        legend: {
            top: 'bottom',
            textStyle: {
                fontSize: '130%',
                color: '#fff'
            },
            icon: 'circle',
            itemGap: 15,
            itemHeight: 10,
            inactiveColor: '#666'
        },
        grid: {
            left: '0px',
            right: '11px',
            top: '30px',
            bottom: '30px',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: true,
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(142, 143, 158, 1)'
                },
                show: false
            },
            axisLabel: {
                fontSize: 11,
                showMinLabel: true,
                showMaxLabel: true,
                formatter: function (value, index) {
                    value = Number(value);
                    var date = new Date(value);
                    if(data.type === 'day'){
                        return DateUtil.format(date, 0, 'MM-dd');
                    }else{
                        var label = DateUtil.format(date, 0, 'hh:mm');
                        if(label === '00:00' && value > new Date().getTime()){
                            label = '24:00';
                        }
                        return label;
                    }
                },
                interval: data.type !== 'day' ? 5 : null
                // ,
                // interval: (index, value) => {console.log(index);
                //     return index === 0 || index % 5 === 3;
                // }
            },
            splitLine: {
                show: false
            }
        }],
        yAxis: [{
            name: data.yAxisName,
            nameGap: 8,
            nameTextStyle: {
                fontSize: 12,
                align: 'left',
                padding: [0, 8, 0, 0]
            },
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'rgba(142, 143, 158, .9)'
                },
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true,
                fontSize: 11
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['rgba(62, 62, 71, .5)']
                }
            }
        }],
        series: data.data.map(d => {
            return Object.assign({}, barSeries, d);
        })
    };
};

const tooltipFormat = (type, total) => {
    return (param) => {
        if(Array.isArray(param)){
            let label = param[0] && param[0].axisValue || '';
            let totalStr = '';

            let content = param
            .filter(s => {
                let val = s.value[1];
                return val !== '' && typeof val !== 'undefined' && val !== null;
            })
            .map(s => {
                let {inverse, unit=''} = (s.data || {});
                let val = s.value[1];
                val = val === '' ? val : autoComma(inverse ? -1 * Number(val) : val);
                return `
                    ${getTooltipMarker(s.color)}
                    ${s.seriesName ? `${s.seriesName}: ` : ''}
                    ${val === 0 ? 0 : val || ''}
                    ${unit}
                `;
            }).join('<br/>')

            if(total && param.length > 1){
                totalStr = `
                ${getTooltipMarker('#fff')} 
                ${total.name||''}: 
                ${autoComma(param.map(s=>Number(s.value[1])).reduce((a,b) => {return NumberUtil.add(a, b);}, 0))} 
                ${total.unit||''}<br/>
                `;
            }
    
            return content ? `
                ${label ? `${DateUtil.format(new Date(Number(label)), 0, type === 'day' ? dayFormat : timeFormat)}<br/>` : ''}
                ${totalStr}
                ${content}
            ` : null;
        }else{
            let label = (param.seriesName 
                && param.name 
                && param.seriesName !== param.name) ? param.seriesName : '';
            let val = autoComma(param.value);
            return `
                ${getTooltipMarker(param.color)}
                ${param.seriesName ? `${param.seriesName}: ` : ''}
                ${val === 0 ? 0 : val || ''}
            `;
        }
    }
};

const getTooltipMarker = (color) => {
    return color
        ? `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${color};"></span>`
        : '';
};

/* eslint-enable */

