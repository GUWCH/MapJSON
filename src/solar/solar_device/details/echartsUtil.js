import { getTheme } from '../../../common/theme';
import { SLOT } from '../../CONSTANT';
import { autoComma } from '../../../common/util-scada';

const theme = getTheme();

const DISPERSE = "Disperse";
const findSuffix = (alias) => {
    const matchs = alias.match(/\d+$/);
    if (matchs?.length > 0) {
        return matchs[0];
    }
    return alias;
};

export const getEchartsOption = (data, ec) => {
    let { data: chartData, disperseLimitValue, disperseName='离散率'} = data;
    const isNum = disperseLimitValue !== '' && disperseLimitValue !== null && !isNaN(disperseLimitValue);
    let allData = [];
    (chartData || []).forEach(ele => {
        const data = ele.Points || [];
        allData = allData.concat(data.map(d => d.y !== '' ? Number(d.y) : null));
    });
    let max = null;
    if(isNum){
        if(allData.length > 0){
            max = Math.max.apply(null, allData.concat([disperseLimitValue]));
        }else{
            max = Number(disperseLimitValue);
        }
    }

    return {
        title: {
            show: false,
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.chartTooltipBg,
            borderColor: theme.chartTooltipBorder,
            textStyle: {
                color: theme.white,
                fontSize: 14
            },
            appendToBody: true,
            formatter: (params, ticket, callback) => {
                if(Array.isArray(params) && params.length > 0){
                    let time = params[0].axisValueLabel;
                    time = time.split(' ')[1].split(':').slice(0, 2).join(':');
                    const seriesTip = params.map(serie => {
                        const {marker, seriesName, data: {unit}, value=[]} = serie;
                        const val = autoComma(value[1] === '' || value[1] === null || value[1] === undefined ? SLOT : value[1]);
                        return `<div>${marker} <span style="color:${theme.chartTooltipName};margin-right:5px;">${seriesName}:</span> ${val} ${unit}</div>`
                    }).join('');
                    return `<div>${time}</div>${seriesTip}`;
                }
                return '';
            }
        },
        legend: {
            bottom: 8,
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
            type: 'scroll',
            textStyle: {
                color: theme.chartLegendWhiteColor
            }
        },
        grid: {
            left: '5%',
            top: 40,
            right: '5%',
            bottom: 35,
            containLabel: true
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                formatter: '{HH}:{mm}'
            }
        },
        yAxis: [{
            type: 'value',
            name: '(%)',
            splitLine: {
                lineStyle: {
                    color: theme.chartYaxisSplitColor
                }
            },
            max: max
        }, {
            type: 'value',
            name: '(A)',
            splitLine: {
                show: false
            }
        }],

        // eslint-disable-next-line complexity
        series: chartData.map(o => {
            const { key, Points=[] } = o;
            const pointAlias = key.split(":")[2];
            const isDisperse = pointAlias.endsWith(DISPERSE);
            const xy = Points.map(i => ({
                value: [i.x, i.y !== '' ? Number(i.y) : null],
                unit: isDisperse ? '%' : 'A'
            }));

            let data = {
                name: isDisperse ? disperseName : findSuffix(pointAlias).padStart(2, '0'),                               
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: xy,
                yAxisIndex: isDisperse ? 0 : 1
            };
            if (isDisperse && isNum) {
                data.markLine = {
                    lineStyle: {
                        color: theme.red
                    },
                    precision: 100,
                    data: [{
                        yAxis: Number(disperseLimitValue)
                    }],
                    label: {
                        formatter: '{c}%'
                    }
                };
            }
            return data;
        })
    };
};