import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { GlobalContext } from './context';
import EchartsWrap from 'EchartsWrap';
import { NumberUtil, DateUtil } from '../../common/utils';
import { CommonHisTimerInterval } from '../../common/const-scada';
import { autoComma } from '../../common/util-scada';
import { getTheme } from '../../common/theme';
import { 
    DATE_TYPE,
    DATE_MOMENT_FORMAT,
    SLOT,
    COMMON_DECIMAL,
    DATE_CUSTOM_FORMAT,
    HistoryCurveReq
} from '../CONSTANT';
import EnvLoading from 'EnvLoading';
import {msgTag} from '../../common/lang';
import { POINTS, TAG, getKey, FixVal } from './Constant';
import DAO from './dao';

import styles from './index.mscss';

const _dao = new DAO();
const msg = msgTag('site');
const theme = getTheme();

export default class Charts extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);
        this.timer = null;

        this.state = {
            groups: [],
            groupsPoints: {},
            groupsData: {},
            otherPoints: [],
            isLoading: false
        };
    }

    componentDidMount(){
        this.init(true);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps){
        if(this.props.dateType !== prevProps.dateType || !_.isEqual(this.props.dateRange, prevProps.dateRange)){
            clearTimeout(this.timer);
            this.init(true);
        }
    }

    componentWillUnMount(){
        clearTimeout(this.timer);
    }

    init(loading){

        let { state } = this.context;
        let { dateType, nodeAlias } = state;
        let chartMap = {};

        // 历史数据部分都放在此地曲线接口里
        let otherPoints = [];

        POINTS.filter(point => dateType in point).forEach(point => {
            let {group=0, ...rest} = point[dateType];
            if(group === '' || group === null || isNaN(group))group = 0;

            let { name, unit, decimal=0, coefficient=1} = point;
            chartMap[group] = chartMap[group] || [];
            chartMap[group].push({
                id: '',
                key: getKey(point, nodeAlias),
                name,
                unit,
                decimal,
                coefficient,
                chart: rest
            });
        });

        POINTS.filter(point => TAG.RIGHT_BOTTOM in point).forEach(point => {
            let { name, unit, decimal=0, coefficient=1, ...rest} = point;
            otherPoints.push({
                id: '',
                key: getKey(point, nodeAlias),
                name,
                unit,
                decimal,
                coefficient,
                ...rest
            });
        });

        let groups = Object.keys(chartMap);
        groups.sort((a, b) => Number(a) - Number(b));
        
        this.setState({
            otherPoints,
            groups,
            groupsPoints: chartMap,
            groupsData: {}
        }, () => {
            this.fetchHisData(loading);
        });
    }

    /**
     * 接口采样参数
     * @returns {Object} {interval_type: Number, sample_cycle: Number}
     */
    getInterval(curveInterval){
        let { state } = this.context;
        let { dateType } = state;

        switch(dateType){
            case DATE_TYPE.DAY:
                return {
                    interval_type: 1,
                    sample_cycle: curveInterval && curveInterval > 0 ? parseInt(curveInterval / 60) : 60
                };
            case DATE_TYPE.MONTH:
                return {
                    interval_type: 2,
                    sample_cycle: 1
                };
            case DATE_TYPE.YEAR:
                return {
                    interval_type: 3,
                    sample_cycle: 1
                };
            case DATE_TYPE.TOTAL:
            default:
                return {
                    interval_type: 4,
                    sample_cycle: 1
                };
        }
    }

    /**
     * 
     * @param {String} xDate string of (@see Date)
     * @returns {String}
     */
    getXaxisDate(xDate){
        let { state } = this.context;
        let { dateType } = state;

        switch(dateType){
            case DATE_TYPE.DAY:
                return moment(xDate)
                .format(DATE_MOMENT_FORMAT.HOUR_MINUTE);
            case DATE_TYPE.MONTH:
                return moment(xDate)
                .format(DATE_CUSTOM_FORMAT.DATE);
            case DATE_TYPE.YEAR:
                return moment(xDate)
                .format(DATE_CUSTOM_FORMAT.YEAR_MONTH);
            case DATE_TYPE.TOTAL:
            default:
                return moment(xDate)
                .format(DATE_MOMENT_FORMAT.YEAR);                
        }
    }

    async fetchHisData(loading){
        if(loading){
            this.setState({isLoading: true});
        }

        let {
            state: {
                dateRange: [startTime, endTime], 
                pointHisData: rawPointHisData
            }, 
            dispatch
        } = this.context;

        let curves = [];

        // 接口不满足多种间隔类型请求,特殊处理
        let curveMap = {};
        Object.keys(this.state.groupsPoints).forEach(k => {
            this.state.groupsPoints[k].forEach(point => {
                let {key, id, decimal, chart={} } = point;
                let { curveInterval: cfgCcurveIinterval, curveArithType='normal'} = chart;

                let curve = {
                    id,
                    key,
                    decimal,
                    sub_type: '4097',
                    sub_type_x: '4097',
                    arith_type: curveArithType //'normal''subtract'
                };

                if(typeof cfgCcurveIinterval !== 'undefined' && 
                    cfgCcurveIinterval !== null && 
                    cfgCcurveIinterval !== '' &&
                    !isNaN(cfgCcurveIinterval)
                ){
                    curveMap[cfgCcurveIinterval] = curveMap[cfgCcurveIinterval] || [];
                    curveMap[cfgCcurveIinterval].push(curve);
                }else{
                    curves.push(curve);
                }                
            });
        });

        this.state.otherPoints.forEach(point => {
            let { key, id, decimal, curveArithType='normal' } = point;

            let curve = {
                id,
                key,
                decimal,
                sub_type: '4097',
                sub_type_x: '4097',
                arith_type: curveArithType //'normal''subtract'
            };

            curves.push(curve);
        });

        if((curves.length + Object.keys(curveMap).length) === 0) return;

        let reqs = [];

        if(curves.length > 0){
            reqs.push(Object.assign({}, HistoryCurveReq, {
                curve: curves,
                start_time: startTime,
                end_time: endTime
            }, this.getInterval()));
        }

        Object.keys(curveMap).forEach(curveInterval => {
            reqs.push(Object.assign({}, HistoryCurveReq, {
                curve: curveMap[curveInterval],
                start_time: startTime,
                end_time: endTime
            }, this.getInterval(Number(curveInterval))));
        });

        const res = await _dao.getCurves(reqs);

        let dataCollect = [];
        res.forEach(rs => {
            if(!rs || String(rs.code) !== '10000' || !Array.isArray(rs.data)){
                return;
            }

            dataCollect = dataCollect.concat(rs.data);
        });

        let groupsData = {};
        let pointHisData = {}; // 收集y值

        if(dataCollect.length > 0){
            let keyData = {};
            dataCollect.forEach(d => {
                let { key, Points=[] } = d;
                keyData[key] = Points;
                pointHisData[key] = Points.map(xy => {
                    let { y } = xy;
                    return y ? Number(y) : 0;
                });
            });

            this.state.groups.forEach(g => {
                this.state.groupsPoints[g].forEach(point => {
                    let {key} = point;

                    groupsData[g] = groupsData[g] || [];
                    groupsData[g].push({
                        group: g,
                        key,
                        data: keyData[key]
                    })
                });
            });
        }

        this.setState({
            isLoading: false,
            groupsData
        }, () => {
            if(!_.isEqual(pointHisData, rawPointHisData)){
                dispatch({
                    pointHisData
                });
            }

            clearTimeout(this.timer);
            this.timer = setTimeout(this.fetchHisData.bind(this), CommonHisTimerInterval);
        });
    }

    /**
     * 
     * @param {Object} data {groupData: [], allData: {}}
     * @param {Object} ec ehcarts instance
     * @returns 
     */
    getOption(data, ec){
        const echartsOpt = {
            textStyle: {
                color: theme.chartTextColor,
                fontWeight: 'normal'
            },
            grid: {
                top: 35,
                bottom: 45,
                left: 15,
                right:15,
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'none'
                },
                borderWidth: 1,                
                backgroundColor: theme.chartTooltipBg,
                borderColor: theme.chartTooltipBorder,
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 14
                },
                className: styles.chart_tooltip,
                formatter: (params, ticket, callback) => {

                    // relate to series content
                    if(Array.isArray(params) && params.length > 0){
                        return `<div>
                            <div class="${styles.chart_tooltip_name}">${params[0].name}</div>
                            ${
                                params.map((param, ind) => {
                                    let {seriesName, marker, data={}, value} = param;
                                    let {unit=''} = data;
                                    return`<div>
                                        ${marker}
                                        <span class="${styles.chart_tooltip_sname}">${seriesName}</span>
                                        <span class="${styles.chart_tooltip_val}">${autoComma(value)} ${unit}</span>
                                    </div>`;
                                }).join('')
                            }
                        </div>`;
                    }else if(typeof params === 'object'){
                        let {name, seriesName, marker, data={}, value} = param;
                        let {unit=''} = data;
                        return`<div>
                            <div class="${styles.chart_tooltip_name}">${name}</div>
                            <div>
                                ${marker}
                                <span class="${styles.chart_tooltip_sname}">${seriesName}</span>
                                <span class="${styles.chart_tooltip_val}">${autoComma(value)} ${unit}</span>
                            </div>
                        </div>`;
                    }

                    return '';
                }
            },
            xAxis: {
                type: 'category',
                data:[]
            },
            series: [],
            legend: {
                itemHeight: 10,
                padding: [0, 0, 20, 0],
                inactiveColor: theme.chartLegendActiveColor,
                y: 'bottom',
                textStyle: {
                    color: theme.chartLegendColor
                },
                data: []
            }
        };

        let { state, dispatch } = this.context;
        let { dateType, nodeAlias } = state;
        
        let xAxis = [];
        let yAxis = [];
        let legend = [];
        let series = [];

        let keyMap = {};
        Object.keys(this.state.groupsPoints).forEach(g => {
            this.state.groupsPoints[g].forEach(point => {
                let {key} = point;
                keyMap[key] = point;
            });
        });

        const curYear = `${moment().format(DATE_MOMENT_FORMAT.YEAR)}-01-01 00:00:00`;
        const nowTime = DateUtil.getStdNowTime();

        const { groupData=[], allData={} } = data;

        let finalData = groupData.filter(d => {
            const { key } = d;
            const { chart={} } = keyMap[key];
            let { hidden=false} = chart;

            return !hidden;
        });

        // 累计处理下无用的年数据
        if(dateType === DATE_TYPE.TOTAL){
            const sliceStarts = [];
            Object.keys(allData).forEach(k => {
                (allData[k] || []).forEach(ele => {
                    const { data: eleData=[] } = ele || {};
                    for(let i = 0; i < eleData.length; i++){
                        const {x, y} = eleData[i];
                        if(y !== '' || x >= curYear){
                            sliceStarts.push(i);
                            break;
                        }
                    }
                });
            });

            if(sliceStarts.length > 0){
                const sliceStart = Math.min.apply(null, sliceStarts);
                finalData = finalData.map(d => {
                    d.data = (d.data || []).slice(sliceStart);
                    return d;
                });
            }
        }

        finalData.forEach((d, ind) => {

            const { group, key, data: pointData } = d;
            const fixedPoint = keyMap[key];
            const { name, unit, chart={} } = fixedPoint;
            let { hidden=false, color, type, yAxisIndex} = chart;

            if(hidden)return;

            legend.push(name);
            yAxis.push({
                name: unit,
                splitLine: {
                    show: !(ind % 2),
                    lineStyle: {
                        color: [theme.chartYaxisSplitColor]
                    }
                }
            });
            series.push(Object.assign({}, {
                name: name,
                type: type,
                data: pointData
                .filter(xy => {
                    let { x, y } = xy;

                    switch(dateType){
                        case DATE_TYPE.DAY:
                            return x <= nowTime;
                        default:
                            return true;
                    }
                }).map(xy => {
                    let { x, y } = xy;
                    if(ind === 0){
                        xAxis.push(this.getXaxisDate(x));
                    }
                    return {
                        value: y !== '' ? FixVal(Number(y), fixedPoint) : '',
                        unit: unit // for custom tooltip
                    }
                }),
                yAxisIndex: typeof yAxisIndex === 'undefined' ? ind % 2 : yAxisIndex,
                itemStyle: {
                    color: color
                }
            }, 
            type === 'bar' ? {
                barWidth: '30%',
                barMaxWidth: '30%',
                barMinWidth: '20%'
            } : {}, 
            type === 'line' ? {
                symbol: 'circle',
                symbolSize: 1
            } : {}));

        });

        echartsOpt.xAxis.data = xAxis;
        echartsOpt.legend.data = legend;
        echartsOpt.yAxis = yAxis;
        echartsOpt.series = series;

        if(yAxis.length === 0){
            return null;
        }

        return echartsOpt;
    }

    getHisData(hisData, point){
        if(!Array.isArray(hisData)) return '';

        let {name} = point;

        return  FixVal(hisData.reduce((a, b) => {
            return NumberUtil.add(a, b);
        }, 0), point);
    }

    // eslint-disable-next-line complexity
    renderStat(){
        let { state: {dateType, dateTime, nodeAlias, pointHisData, pointRealData} } = this.context;

        let isNow = false;
        const nowDate = moment().format(DATE_MOMENT_FORMAT.DATE);
        const userDate = moment(dateTime).format(DATE_MOMENT_FORMAT.DATE);
        isNow = DATE_TYPE.DAY === dateType && userDate >= nowDate;

        const contents = POINTS
        .filter(p => TAG.STATISTICS in p && p[TAG.STATISTICS].indexOf(dateType) > -1)
        .filter(p => !p[TAG.DYNAMIC] || isNow)
        .map((point, ind) => {
            let { name, unit } = point;
            const isDyn = point[TAG.DYNAMIC];
            const key = getKey(point, nodeAlias);

            let val = isDyn ? 
            FixVal(NumberUtil.removeCommas(pointRealData[key]), point) : 
            this.getHisData(pointHisData[key], point);
            
            if(!isNaN(val)){
                val = autoComma(val);
            }else{
                val = SLOT;
            }

            return <div key={ind} className={styles.stat}>
                <span className={styles.statname}>{name}</span>
                <span className={styles.statval}>{val}</span>
                <span>{unit}</span>
            </div>;
        });

        switch(dateType){
            case DATE_TYPE.DAY:
                // 当天以后计算每瓦出力
                if(isNow){
                    const capacityPoint = POINTS.find(p => p[TAG.IS_CAPACITY]);
                    const powerPoint = POINTS.find(p => p[TAG.IS_POWER]);
                    if(capacityPoint && powerPoint){

                        // 全场有功功率/容量 * 100
                        let capa = NumberUtil.removeCommas(pointRealData[getKey(capacityPoint, nodeAlias)]);
                        let val = 0;

                        if(NumberUtil.isFinite(capa) && Number(capa) !== 0){
                            val = NumberUtil.divide(
                                NumberUtil.removeCommas(pointRealData[getKey(powerPoint, nodeAlias)]),
                                capa
                            );
                        }

                        if(!isNaN(val)){
                            val = NumberUtil.multiply(val, 100, COMMON_DECIMAL);
                            val = autoComma(val);
                        }else{
                            val = SLOT;
                        }

                        contents.push(
                            <div key={'watt'} className={styles.stat}>
                                <span className={styles.statname}>{msg('powerRatio')}</span>
                                <span className={styles.statval}>{val}</span>
                                <span>%</span>
                            </div>
                        );
                    }
                }
                break;
            default:
                const capacityPoint = POINTS.find(p => p[TAG.IS_CAPACITY]);
                const generatePoint = POINTS.find(p => p[TAG.IS_GENERATE]);
                const radiationPoint = POINTS.find(p => p[TAG.IS_RADIATION]);

                if(!capacityPoint || !generatePoint || !radiationPoint)break;

                // 有功发电量/(累计辐照*容量*1000)*100, STC辐照强度默认为1000
                let val = NumberUtil.multiply(
                    this.getHisData(pointHisData[getKey(radiationPoint, nodeAlias)], radiationPoint) || 0,
                    NumberUtil.removeCommas(pointRealData[getKey(capacityPoint, nodeAlias)]) || 0
                );

                val = NumberUtil.divide(
                    this.getHisData(pointHisData[getKey(generatePoint, nodeAlias)], generatePoint) || 0,
                    val === 0 || isNaN(val) ? 1 : val
                );

                if(!isNaN(val)){
                    val = NumberUtil.divide(val, 1000);
                    val = NumberUtil.multiply(val, 100, COMMON_DECIMAL);
                    val = autoComma(val);
                }else{
                    val = SLOT;
                }

                contents.push(
                    <div key={'pr'} className={styles.stat}>
                        <span className={styles.statname}>{msg('PR')}</span>
                        <span className={styles.statval}>{val}</span>
                        <span>%</span>
                    </div>
                );
        }

        return contents;
    }

    render(){
        return <div className={styles.charts}>
            <div className={styles.charts_header}>{
                this.renderStat()
            }</div>
            <div className={styles.charts_main}>{
                this.state.groups.map((g, ind, arr) => {
                    return [
                        <div key={1}>
                            <EchartsWrap 
                                data={JSON.parse(JSON.stringify({
                                    groupData: this.state.groupsData[g] || [],
                                    allData: this.state.groupsData
                                }))}
                                getOption={(data, ec) => {
                                    return this.getOption(data, ec);
                                }}
                            />
                        </div>,
                        ind === arr.length - 1 ? null : <span key={2}><i></i></span>
                    ];
                })
            }</div>
            <EnvLoading isLoading={this.state.isLoading} />
        </div>;
    }
}