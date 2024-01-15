/* eslint-disable */

import React, { Component, useEffect, useRef, useState, useMemo } from 'react';
import { DatePicker, Popover, Modal } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import { notify } from 'Notify';
import { NewSelect } from 'Select';
import EnvLoading from 'EnvLoading';
import EchartsWrap from 'EchartsWrap';
import { 
    ALARM_MAX,
    ALARM_LEVEL_STR,
    SLOT, 
    DATE_TYPE,
    getMomentDateFormat,
    getRangeChangedMomentDate,
    HistoryCurveReq,
    HistoryCurveModel,
    DATE_MOMENT_FORMAT,
    DATE_CUSTOM_FORMAT,
    COMMON_DECIMAL
} from '../../../CONSTANT';
import { LegalData, _dao } from '../../../../common/dao';
import Intl, { msgTag } from '../../../../common/lang';
import { getTheme } from '../../../../common/theme';
import { NumberUtil, DiffUtil } from '../../../../common/utils';
import { NumberFactor, autoComma } from '../../../../common/util-scada';
import scadaUtil, { 
    TimerInterval, 
    CommonTimerInterval, 
    CommonHisTimerInterval 
} from '../../../../common/const-scada';
import { GlobalContext, Actions } from '../../context';
import StringCurrent, { UNUSED_NO } from '../components/StringCurrent';
import { DetailTemplate, DetailNav } from '../../components/Detail';
import DeviationDialog, { getDisperseAttrs } from '../components/DeviationDialog';
import {
    TAG,
    POINTS,
    getKey,
    FixVal
} from './Constant';
import { getEchartsOption } from '../echartsUtil';
import LightWord from '../components/LightWord';
import AllData from '../components/AllData';

import '../../../../common/css/app.scss';
import './style.scss';

const prefixCls = 'env-invt';
const msg = msgTag('solarinverter');
const msg1 = msgTag('solardevice');
const theme = getTheme();

/**
 * @typedef {Object} DYNDATA
 * @property {String} key 1:tableno:alias:fieldno
 * @property {String} display_value
 * @property {String=?} raw_value
 * @property {String} status
 * @property {String} status_value
 */

/**
 * @typedef {Object} CURVEMODEL
 * @property {String} x string of (@see Date)
 * @property {String|Number} y
 */

/**
 * @typedef {Object} CURVEDATA
 * @property {String} key 1:tableno:alias:fieldno
 * @property {String} desc
 * @property {CURVEMODEL[]} Points
 */

export default class Inverter extends React.Component {
    static contextType = GlobalContext;

    static getInitState = () => {
        const dateRange = getRangeChangedMomentDate(DATE_TYPE.DAY, moment());
        return {

            /**@type {Map<string, DYNDATA>} */
            realTimeData: {},
    
            /**@type {Map<string, CURVEDATA>} */
            hisData: {},
    
            alarmData: [],
    
            /**@type {CURVEDATA[]} */
            currentData: [],
    
            dateString: dateRange[0],
            dateType: DATE_TYPE.DAY,
            dateRange: dateRange,
    
            loadingLeftTop: false,
            loadingLeftBottom: false,
            loadingRightTop: false,
            loadingRightBottom: false
        };
    };

    constructor(props) {
        super(props);

        this.init();

        this.state = this.constructor.getInitState();
    }

    init(changed){
        this.lastAlarmId = 0;
        this.lastAlarmNo = 0;
        this.timerAlarm = null;
        this.timerDyn = null;
        this.timerCurve = null;
        
        this.isStringInv = false;
        this.currentPoints = [];
        this.invalidCurrentKey = [];
        this.timerCurrent = null;

        if(changed){
            this.setState(this.constructor.getInitState());
        }
    }

    clear(){
        clearTimeout(this.timerDyn);
        clearTimeout(this.timerAlarm);
        clearTimeout(this.timerCurve);
        clearTimeout(this.timerCurrent);
    }

    setString(props){
        const { alias='' } = props || this.props;
        this.isStringInv = alias.split('.').length === 4;
    }

    componentWillMount() {
        this.setString();
    }

    componentDidMount() {
        this.initReq();
    }

    componentWillReceiveProps(nextProps, nextState, nextContext) {
        if(nextProps.alias !== this.props.alias){
            this.clear();
            this.setState({
                realTimeData: {},
                hisData: {},
                alarmData: [],
                currentData: [],
            }, () => {
                this.init(true);
                this.setString(nextProps);
            });            
        }        
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.alias !== prevProps.alias){
            this.initReq();
        }        
    }

    componentWillUnmount() {
        this.clear();
    }

    async initReq(){
        await this.reqCurrentPoints(true);

        this.reqRealTimeData(true, () => {
            this.reqCurrentCurve(true);
        });
        this.reqHisData(true);
        this.reqAlarm(true);        
    }

    findTagPoint(tag){
        return POINTS.find(p => p[tag]);
    }

    findPoint(key){
        const { alias } = this.props;
        return POINTS.find(p => getKey(p, alias) === key);
    }

    /**
     * 
     * @param {Boolean} loading 
     * @param {()=>{}} oneCallback // 支路依赖动态字里的支路状态
     * @returns 
     */
    reqRealTimeData(loading, oneCallback){
        const { alias, name } = this.props;
        if(!alias)return;

        // 全数据组件里做了请求
        //const req = POINTS
        const req = []
        .filter(p => {
            return p[TAG.IS_STATUS] || p[TAG.IS_TEXT1] || p[TAG.IS_TEXT2] || p[TAG.IS_TEXT3];
        })
        .map(p => {
            let { decimal=0 }  = p;
            return {
                id: '',
                key: getKey(p, alias),
                decimal
            };
        });

        if(this.isStringInv){
            const dispersePoint = POINTS.find(p => p[TAG.IS_DISPERSE]);
            if(dispersePoint){
                let { decimal=0 }  = dispersePoint;
                req.push({
                    id: '',
                    key: getKey(dispersePoint, alias),
                    decimal
                });
            }

            this.currentPoints.forEach(p => {
                let { point_alias, table_no, field_no }  = p;
                req.push({
                    id: '',
                    key: `1:${table_no}:${point_alias}:${field_no}`,
                    decimal: COMMON_DECIMAL
                });
            });
        }

        if(req.length === 0) return;

        const fetchData = async (loading, callback) => {
            if(loading){
                this.setState({loadingLeftTop: true});
            }
            const res = await _dao.getDynData(req);

            let realTimeData = {};
            if(res && String(res.code) === '10000'){
                (res.data || []).forEach(d => {
                    let { key } = d;
                    realTimeData[key] = d;
                });
            }

            const invalidCurrent = [];
            this.currentPoints.forEach(p => {
                let { point_alias, table_no, field_no }  = p;
                const key = `1:${table_no}:${point_alias}:${field_no}`;
                const { status_value } = realTimeData[key];
                if(String(status_value) === String(UNUSED_NO)){
                    invalidCurrent.push(key);
                }
            });
            this.invalidCurrentKey = invalidCurrent;

            if(typeof callback === 'function'){
                callback();
            }

            this.setState({realTimeData}, () => {
                if(loading){
                    this.setState({loadingLeftTop: false});
                }

                clearTimeout(this.timerDyn);
                this.timerDyn = setTimeout(fetchData, TimerInterval);
            });
        }

        clearTimeout(this.timerDyn);
        fetchData(loading, oneCallback);
    }

    /**
     * 接口采样参数
     * @returns {Object} {interval_type: Number, sample_cycle: Number}
     */
    getInterval(curveInterval){
        let { dateType } = this.state;

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
            case DATE_TYPE.WEEK:
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

    reqHisData(loading){
        const { alias, name } = this.props;
        const { dateType, dateRange } = this.state;
        if(!alias)return;

        const reqCurves = POINTS
        .filter(p => {
            return dateType in p;
        })
        .map(p => {
            let { decimal=0 } = p;
            let { curveArithType }  = p[dateType];
            return Object.assign({}, HistoryCurveModel, {
                id: '',
                key: getKey(p, alias),
                decimal
            }, curveArithType ? {
                arith_type: curveArithType
            } : {});
        });

        const req = Object.assign({}, HistoryCurveReq, {
            curve: reqCurves,
            start_time: dateRange[0],
            end_time: dateRange[1]
        }, this.getInterval());

        const fetchData = async (loading) => {
            if(loading){
                this.setState({loadingLeftBottom: true});
            }

            const res = await _dao.getCurve(req);

            if(alias !== this.props.alias){
                clearTimeout(this.timerCurve);
                return;
            }

            let hisData = {};
            if(res && String(res.code) === '10000'){
                (res.data || []).forEach(d => {
                    let { key } = d;
                    hisData[key] = d;
                });
            }

            this.setState({hisData}, () => {
                if(loading){
                    this.setState({loadingLeftBottom: false});
                }

                clearTimeout(this.timerCurve);
                this.timerCurve = setTimeout(fetchData, CommonHisTimerInterval);
            });
        }

        clearTimeout(this.timerCurve);
        fetchData(loading);
    }

    getRealTimeData(key){
        const { realTimeData } = this.state;
        return realTimeData[key] || {};
    }

    formatRealTimeData(key, point){
        point = point || this.findPoint(key);

        if(!point)return SLOT;

        const {display_value, raw_value} = this.getRealTimeData(key);

        if(display_value === '' || isNaN(display_value)) return display_value;

        return autoComma(FixVal(NumberUtil.removeCommas(display_value), point));
    }

    async reqCurrentPoints(loading){
        if(!this.isStringInv)return;

        const { dispatch } = this.context;
        if(loading){
            dispatch({type: Actions.LOADING});
        }
        const { alias } = this.props;
        this.currentPoints = await _dao.getBranchCurrentPoints(alias);
        if(loading){
            dispatch({type: Actions.UNLOADING});
        }
    }

    reqCurrentCurve(loading){
        if(!this.isStringInv)return;

        const dispersePoint = POINTS.find(p => p[TAG.IS_DISPERSE]);

        if(!dispersePoint) return;

        // 过滤掉无效点
        const reqCurves = this.currentPoints.map(p => {
            let { point_alias=0, table_no, field_no } = p;
            return Object.assign({}, HistoryCurveModel, {
                id: '',
                key: `1:${table_no}:${point_alias}:${field_no}`,
                decimal: COMMON_DECIMAL,
                arith_type: 'normal'
            });
        });

        const { alias } = this.props;
        const disperseKey = getKey(dispersePoint, alias);
        reqCurves.unshift(Object.assign({}, HistoryCurveModel, {
            id: '',
            key: disperseKey,
            decimal: dispersePoint.decimal || 0,
            arith_type: 'normal'
        }));

        if(reqCurves.length === 0)return;

        const fetchData = async (loading) => {
            if(loading){
                this.setState({loadingRightBottom: true});
            }

            const req = Object.assign({}, HistoryCurveReq, {
                curve: reqCurves.filter(c => {
                    return this.invalidCurrentKey.indexOf(c.key) === -1;
                }),
                start_time: `${moment().format(DATE_MOMENT_FORMAT.DATE)} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                end_time: `${moment().add(1, 'days').format(DATE_MOMENT_FORMAT.DATE)} ${DATE_MOMENT_FORMAT.TIME_ZERO}`,
                interval_type: 1,
                sample_cycle: 5
            });

            let currentData = [];

            if(req.curve.length > 0){
                const res = await _dao.getCurve(req);

                if(res && String(res.code) === '10000'){
                    currentData = res.data.map(d => {
                        let { key } = d;
                        if(key === disperseKey){
                            d.Points = d.Points.map(ele => {
                                ele.y = FixVal(ele.y, dispersePoint);
                                return ele;
                            });
                            return d;
                        }
                        return d;
                    });
                }
            }

            this.setState({currentData}, () => {
                if(loading){
                    this.setState({loadingRightBottom: false});
                }

                clearTimeout(this.timerCurrent);
                this.timerCurrent = setTimeout(fetchData, CommonHisTimerInterval);
            });
        }

        clearTimeout(this.timerCurrent);
        fetchData(loading);
    }

    reqAlarm(loading) {
        const { alias, name } = this.props;
        if(!alias)return;

        const fetchData = async (loading) => {
            if(loading){
                this.setState({loadingRightTop: true});
            }

            const req = {
                start_id: this.lastAlarmId,
                start_no: this.lastAlarmNo,
                seq_type: (!this.lastAlarmId && !this.lastAlarmNo) ? 1 : 0,
                max_cnt: ALARM_MAX,
                level_list: ALARM_LEVEL_STR,
                node_name_list: alias,
                app_list: ''
            }
            const res = await _dao.getAlarm(req);

            let alarmData = this.state.alarmData;
            if (LegalData(res)) {
                
                this.lastAlarmId = res.last_time_id;
                this.lastAlarmNo = res.last_no;

                alarmData = scadaUtil.handleAlarm(alarmData, res.data, ALARM_MAX);
            }

            this.setState({alarmData}, () => {
                if(loading){
                    this.setState({loadingRightTop: false});
                }

                clearTimeout(this.timerAlarm);
                this.timerAlarm = setTimeout(fetchData, CommonTimerInterval);
            });
        }

        clearTimeout(this.timerAlarm);
        fetchData(loading);
    }

    startStop(isStart) {
        const { alias } = this.props;
        if (!alias) {
            return;
        }

        Modal.confirm({
            title: msg('startStopTitle', isStart ? msg('start') : msg('stop')),
            okText: msg('ok'),
            cancelText: msg('cancel'),
            cancelButtonProps: {
                style: {
                    background: 'transparent'
                }
            },
            onOk (){
                const point = POINTS.find(p => p[TAG.IS_START]);
                const key = getKey(point, alias);
                const pointAlias = key.split(':')[2];
                const optStr = `PopMenu ${isStart ? '37' : '36'} ${pointAlias}`;
                _dao.doOperation(optStr, scadaUtil.getUser())
                .then(res => {
                    if (LegalData(res)) {
                        notify(msg('opSuccess'));
                    } else {
                        notify(res?.message || msg('opFailed'));
                    }
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => {
                    
                });
            },
            onCancel() {

            }
        })
    }

    renderHeader() {
        const { alias, name } = this.props;
        const statusPoint = this.findTagPoint(TAG.IS_STATUS) || {};
        const statusData = this.getRealTimeData(getKey(statusPoint, alias));
        let { display_value, color='#fff' } = statusData;

        return (
            <div className={`${prefixCls}-head`}>
                <DetailNav 
                    detailAlias={alias}
                    detailName={name}
                    statusDesc={display_value}
                    statusColor={color}
                />
                <div className={`${prefixCls}-head-action`}>
                    <button 
                        disabled={false}
                        onClick={() => { this.startStop(true); }}
                    >{msg('start')}</button>
                    <button 
                        disabled={false}
                        onClick={() => { this.startStop(false); }}
                    >{msg('stop')}</button>
                </div>
            </div>
        )
    }

    renderDyn() {
        const { alias, name } = this.props;

        const P1 = POINTS.filter(p => (p[TAG.IS_TEXT1]));
        const P2 = POINTS.filter(p => (p[TAG.IS_TEXT2]));
        const P3 = POINTS.filter(p => (p[TAG.IS_TEXT3]));
        const arrayPoint = [];
        P1.map((p, ind) => {
            arrayPoint.push(p);
            if(P2[ind])arrayPoint.push(P2[ind]);
            if(P3[ind])arrayPoint.push(P3[ind]);
        });

        return (
            <div className={`${prefixCls}-attributes`}>
                <AllData 
                    // 集中逆变器只取本体设备
                    assetAlias={!this.isStringInv ? `${alias}.INVT` : alias} 
                    filterAssetName={name}
                    title={msg1('ai_info')}
                    oldPoints={arrayPoint}
                    style={{width: '100%'}}
                    timeout={TimerInterval}
                />
            </div>
        )
    }

    render() {
        const { alias, name } = this.props;

        return (
            <DetailTemplate 
                header={this.renderHeader()}
            >
                <div className={`${prefixCls}`}>
                    <div className={`${prefixCls}-left`}>
                        {this.renderDyn()}
                        <Curve 
                            alias={alias}
                            data={this.state.hisData}
                            dateType={this.state.dateType}
                            dateString={this.state.dateString}
                            onChangeDate={(dateType, momentDate, dateString) => {
                                const dateRange = getRangeChangedMomentDate(dateType, momentDate);
                                this.setState({
                                    dateType,
                                    dateRange,
                                    dateString: dateType === DATE_TYPE.WEEK ? 
                                    momentDate.format(DATE_MOMENT_FORMAT.DATE) : 
                                    dateString || dateRange[0]
                                }, () => {
                                    this.reqHisData(true);
                                });
                            }}
                            isLoading={this.state.loadingLeftBottom}
                        />
                    </div>
                    <div className={`${prefixCls}-right`}>
                        <div className={`${prefixCls}-gz ${this.isStringInv ? `${prefixCls}-gz-small` : ''}`} >
                            <LightWord 
                                // 集中逆变器只取本体设备
                                assetAlias={!this.isStringInv ? `${alias}.INVT` : alias} 
                                title={msg1('di_info')}
                                filterAssetName={name}
                                timeout={TimerInterval}
                            />
                        </div>
                        <Alarm 
                            alias={alias}
                            data={this.state.alarmData}
                            isShort={this.isStringInv}
                            isLoading={this.state.loadingRightTop}
                        />
                        {
                            this.isStringInv ? 
                            <BranchCurrent 
                                alias={alias}
                                currentDynData={
                                    (this.currentPoints || []).map(p => {
                                        const { point_alias=0, table_no, field_no } = p;
                                        const key = `1:${table_no}:${point_alias}:${field_no}`;
                                        return this.state.realTimeData[key] || {};
                                    })
                                }
                                currentCurveData={this.state.currentData}
                                isLoading={this.state.loadingRightBottom}
                                loading={() => {this.setState({loadingRightBottom: true});}}
                                unLoading={() => {this.setState({loadingRightBottom: false});}}
                                refresh={() => {
                                    this.reqRealTimeData(false, () => {
                                        this.reqCurrentCurve(true);
                                    });
                                }}
                            /> : 
                            null
                        }
                    </div>
                </div>
            </DetailTemplate>
        )
    }
}

const Alarm = React.memo((props) => {
    const {alias, data=[], isShort=false, isLoading} = props;

    return (
        <div 
            className={`${prefixCls}-alarm ${isShort ? `${prefixCls}-alarm-small` : ''}`} 
        >
            <div className={`${prefixCls}-alarm-header`}>
                {msg('alarm')}
            </div>
            <div className={`${prefixCls}-alarm-contain`}>
            {
                data.map(alarm => {
                    const { id, no, level_color, content, time } = alarm;
                    return (
                        <div 
                            key={`${id}_${no}`} 
                            style={level_color ? {color: level_color} : {}}
                        >
                            <div>{content}</div>
                            <div>{time}</div>
                        </div>
                    );
                })
            }
            </div>
            <EnvLoading isLoading={isLoading} />
        </div>
    );
}, (prevProps, nextProps) => {
    if(prevProps.alias !== nextProps.alias){
        return false;
    }
    if(prevProps.isShort !== nextProps.isShort){
        return false;
    }
    if(!DiffUtil.isEqual(prevProps.data, nextProps.data)){
        return false;
    }
    if(prevProps.isLoading !== nextProps.isLoading){
        return false;
    }
    
    return true;
});

const Curve = React.memo((props) => {
    const {alias, dateType, dateString, data={}, isLoading, onChangeDate=()=>{}} = props;
    const clearEchartsIns = useRef(false);

    useEffect(() => {
        clearEchartsIns.current = true;
    }, [dateType]);

    const getOption = (data, ec) => {

        const {xAxis=[], yAxis=[], series=[], legend=[]} = parseData(data) || {};

        if(yAxis.length === 0){
            return null;
        }

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'none',
                },
                backgroundColor: theme.chartTooltipBg,
                borderColor: theme.chartTooltipBorder,
                textStyle: {
                    color: theme.white,
                },
                formatter: (params, ticket, callback) => {
                    if(Array.isArray(params) && params.length > 0){
                        let time = params[0].axisValueLabel;
                        let next = params[0].data.next;
                        const seriesTip = params.map(serie => {
                            const {marker, seriesName, data: {unit, value}} = serie;
                            const val = autoComma(value === '' || value === null || value === undefined ? SLOT : value);
                            return `<div>${marker} <span style="color:${theme.chartTooltipName};margin-right:5px;">${seriesName}:</span> ${val} ${unit}</div>`
                        }).join('');
                        if(dateType === DATE_TYPE.DAY){
                            return `<div>${time} ~ ${next}</div>${seriesTip}`;
                        }else{
                            return `<div>${time}</div>${seriesTip}`;
                        }                        
                    }
                    return '';
                }
            },
            grid: {
                top: 45,
                bottom: 15,
                left: 15,
                right:15,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: xAxis
            },
            yAxis: yAxis,
            series: series,
            legend: {
                y: 'top',
                itemWidth: 12,
                itemHeight: 8,
                textStyle: {
                    color: theme.chartLegendWhiteColor,
                },
                data: legend
            }
        }
    };

    const parseData = (data) => {
        let legend = [];
        let xAxis = [];
        let yAxis = [];
        let series = [];

        const points = POINTS.filter(p => dateType in p);
        const keyPoint = {};
        points.map(p => keyPoint[getKey(p, alias)] = p);

        Object.keys(data).forEach((key, ind) => {
            const point = keyPoint[key];
            const { name, unit } = point;
            const { type, color, yAxisIndex } = point[dateType];
            const pointData = data[key].Points;

            legend.push(name);
            yAxis.push({
                name: ind <= 1 ? unit : '',
                show: ind <= 1,
                splitLine: {
                    show: ind === 0,
                    lineStyle: {
                        color: [theme.chartYaxisSplitColor]
                    }
                },
                axisLabel: {
                    show: ind <= 1
                }
            });
            series.push(Object.assign({}, {
                name: name,
                type: type,
                data: pointData.map((xy, index, arr) => {
                    let { x, y } = xy;
                    if(ind === 0){
                        xAxis.push(getXaxisDate(x));
                    }
                    return {
                        next: index === arr.length - 1 ? '24:00' : getXaxisDate(arr[index + 1].x),
                        value: y !== '' ? FixVal(Number(y), point) : '',
                        unit: unit // for custom tooltip
                    }
                }),
                yAxisIndex: typeof yAxisIndex === 'undefined' ? ind : yAxisIndex,
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

        return {legend, xAxis, yAxis, series};
    };

    /**
     * 
     * @param {String} xDate string of (@see Date)
     * @returns {String}
     */
     const getXaxisDate = (xDate) => {
        switch(dateType){
            case DATE_TYPE.DAY:
                return moment(xDate)
                .format(DATE_MOMENT_FORMAT.HOUR_MINUTE);
            case DATE_TYPE.WEEK:
                return moment(xDate)
                .format(DATE_CUSTOM_FORMAT.DATE);
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

    return (
        <div className={`${prefixCls}-prod`}>
            <div className={`${prefixCls}-prod-head`}>
                <div>{msg('production')}</div>
                <div>
                    <NewSelect
                        className={`${prefixCls}-prod-select`}
                        dropdownMatchSelectWidth={false}
                        defaultActiveFirstOption={false}
                        value={dateType}
                        showSearch={false}
                        data={Object.keys(DATE_TYPE).map(k => {
                            return {name: msg(DATE_TYPE[k]), value: DATE_TYPE[k]}
                        })}
                        onChange={(value) => {
                            typeof onChangeDate === 'function' && onChangeDate(value, moment());
                        }}
                    />
                    <DatePicker
                        className={`${prefixCls}-prod-date`}
                        allowClear={false}
                        locale={Intl.isZh ? zhCN.DatePicker : null}
                        picker={dateType}
                        disabled={dateType === DATE_TYPE.TOTAL}
                        style={dateType === DATE_TYPE.TOTAL ? {
                            borderColor: theme.whiteTranparent2
                        } : {}}
                        value={moment(dateString)}
                        format={
                            dateType === DATE_TYPE.TOTAL ? 
                            () =>{ return SLOT; } : 
                            getMomentDateFormat(dateType)
                        }
                        onChange={(value, dateString) => {
                            typeof onChangeDate === 'function' && onChangeDate(dateType, value, dateString);
                        }}
                        disabledDate={(momentCurrent) => {
                            return momentCurrent && momentCurrent > moment().endOf('day');
                        }}
                    />
                </div>
            </div>
            <div className={`${prefixCls}-prod-show`}>
                <EchartsWrap 
                    isClearOpt={clearEchartsIns.current}
                    data={data}
                    getOption={(data, ec) => {
                        clearEchartsIns.current = false;
                        return getOption(data, ec);
                    }}
                />
            </div>
            <EnvLoading isLoading={isLoading} />
        </div>
    );
}, (prevProps, nextProps) => {
    if(prevProps.alias !== nextProps.alias){
        return false;
    }
    if(prevProps.dateType !== nextProps.dateType){
        return false;
    }
    if(prevProps.dateString !== nextProps.dateString){
        return false;
    }
    if(!DiffUtil.isEqual(prevProps.data, nextProps.data)){
        return false;
    }
    if(prevProps.isLoading !== nextProps.isLoading){
        return false;
    }
    
    return true;
});

const BranchCurrent = React.memo((props) => {
    const {
        alias, 
        currentCurveData=[], 
        currentDynData=[], 
        isLoading, 
        refresh=()=>{},
        loading=()=>{},
        unLoading=()=>{}
    } = props;
    const dispersePoint = POINTS.find(p => p[TAG.IS_DISPERSE]);
    let disperseAlias = '';
    if(dispersePoint){
        disperseAlias = getKey(dispersePoint, alias).split(':')[2];
    }

    const [isDeviation, setIsDeviation] = useState(true);
    const [showTip, setShowTip] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [disperseLimit, setDisperseLimit] = useState(undefined);
    const disperseEnable = useRef(false);
    const disperseAttrs = useRef({});
    const clearEchartsIns = useRef(false);

    const reqYcLimit = async () => {
        if(!disperseAlias) return;

        const res = await getDisperseAttrs(disperseAlias);

        if(res){
            const { attrs, value, valid} = res;
            disperseEnable.current = valid;
            disperseAttrs.current = res;
            setDisperseLimit(value);
        }
    };

    useEffect(() => {
        setIsDeviation(true);
        setDisperseLimit(undefined);
        clearEchartsIns.current = true;
        disperseEnable.current = false;
        disperseAttrs.current = {};
        reqYcLimit();
    }, [alias]);

    const DisperseDialog = () => {
        return useMemo(() => {
            return <DeviationDialog
                show={showDialog}
                alias={disperseAlias}
                attrs={disperseAttrs.current}
                disperseLimitValue={disperseLimit}
                beforeUpdate={() => {
                    setShowDialog(false);
                    loading();
                }}
                afterUpdate={(success, value) => {
                    if(success){
                        setDisperseLimit(value);
                    }
                    unLoading();
                }}
                onCancel={() => {setShowDialog(false);}}
            ></DeviationDialog>
        }, [alias, disperseLimit, showDialog])
    };

    const tabs = [{
        name: msg('deviation')
    }, {
        name: msg('stringCurrent')
    }];

    return (
        <div className={`${prefixCls}-other`}>
            <div className={`${prefixCls}-tab`}>
                {
                    tabs.map((tab, ind) => (
                        <button 
                            key={ind}
                            className={`${isDeviation && ind === 0 || !isDeviation && ind !== 0 ? `${prefixCls}-tab-active` : ''}`}                                
                            onClick={() => {
                                setIsDeviation(ind === 0);
                            }}
                        >
                            <span>{tab.name}</span>
                        </button>
                    ))
                }
            </div>
            <div className={`${prefixCls}-chart`}>
            {
                isDeviation ? 
                <div className={`${prefixCls}-chart-first`}>
                    <div>
                        <Popover
                            overlayClassName={''}
                            visible={showTip}
                            onVisibleChange={showTip => setShowTip(showTip)}
                            trigger='hover'
                            placement='bottom'
                            content={
                                <div>{msg('currentTip')}</div>
                            }
                        >
                            <span>{msg('note')}</span>
                        </Popover>
                        <button onClick={() => {
                            if(!disperseEnable.current){
                                notify(msg1('DCCBX.denied'));
                                return;
                            }
                            setShowDialog(true);
                        }}>{msg('settings')}</button>
                    </div>
                    <div>
                        <EchartsWrap 
                            data={{
                                data: currentCurveData,
                                disperseLimitValue: NumberFactor(disperseLimit, 100),
                                disperseName: msg('deviation')
                            }}
                            getOption={(data, ec) => {
                                clearEchartsIns.current = false;
                                return getEchartsOption(data, ec);
                            }}
                            isNotMergeOpt={clearEchartsIns.current}
                        />
                    </div>
                </div> :
                <StringCurrent
                    data={currentDynData}
                    beforeChange={() => {
                        loading();
                    }}
                    afterChange={(succeed) => {
                        if(succeed){
                            clearEchartsIns.current = true;
                            refresh();
                        }
                        unLoading();
                    }}
                />
            }
            </div>
            {DisperseDialog()}
            <EnvLoading isLoading={isLoading} />
        </div>
    );
}, (prevProps, nextProps) => {
    if(prevProps.alias !== nextProps.alias){
        return false;
    }
    if(!DiffUtil.isEqual(prevProps.currentCurveData, nextProps.currentCurveData)){
        return false;
    }
    if(!DiffUtil.isEqual(prevProps.currentDynData, nextProps.currentDynData)){
        return false;
    }
    if(prevProps.isLoading !== nextProps.isLoading){
        return false;
    }
    
    return true;
});