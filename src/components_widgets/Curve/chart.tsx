import React, {useEffect, useRef, useState} from "react";
import moment from "moment";
import type { Moment } from 'moment';
import EchartsWrap from 'EchartsWrap';
import { 
    XAXisComponentOption, 
    YAXisComponentOption, 
    LegendComponentOption, 
    SeriesOption 
} from 'echarts';
import lodash from 'lodash';
import { getPointKey } from '@/common/constants';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import {
    getHistoryCurveModel,
    getHistoryCurveReq,
    getInvertal,
    getConvertRes,
    DATE_TYPE,
    SLOT,
    isZh,
    getRangeChangedMomentDate,
    DEFAULT_VALUE,
    DATE_MOMENT_FORMAT,
    fill_UTC_area,
    fillingPoints,
    CHART_TYPE_MAP
} from './constant';
import { getTheme } from '@/common/theme';
import {CommonHisTimerInterval, RealTimeCurveTimerInterval} from '@/common/const-scada';
import { _dao, daoIsOk } from "@/common/dao";
import {gradient, autoComma} from '@/common/util-scada';
import { NumberUtil, getAssetAlias } from '@/common/utils';

import styles from './style.mscss';

const theme = getTheme('tplChartTheme');

export interface ChartProps {
    isDemo: boolean | undefined;
    userConfig: Array<{}>;
    rawAssetAlias: string;
    totalCustomAlias: string;
    dateSet: {curDateType: string, date: Moment | [Moment, Moment]};
    refEc: any;
    timeSelectEnable: boolean;
    onLoadingChange: (isLoading: boolean) => void;
};

const demoMockData = [
    {
        key: 'point_1',
        axisProps: {axisType: 'public', position: 'left', max: '', min: ''},
        color: 'rgb(0, 219, 255, 1)',
        name_cn: "测点1",
        name_en: "point_1",
        Points: [
            {x: '2022-07-27 00:00:00', y: '22'},
            {x: '2022-07-27 04:00:00', y: '45'},
            {x: '2022-07-27 08:00:00', y: '11'},
            {x: '2022-07-27 12:00:00', y: '67'},
            {x: '2022-07-27 16:00:00', y: '99'},
            {x: '2022-07-27 20:00:00', y: '56'},
            {x: '2022-07-27 24:00:00', y: '59'},
        ]
    },
    {
        key: 'point_2',
        axisProps: {axisType: 'public', position: 'right', max: '', min: ''},
        name_cn: "测点2",
        name_en: "Point_2",
        Points: [
            {x: '2022-07-27 00:00:00', y: '0.2'},
            {x: '2022-07-27 04:00:00', y: '0.4'},
            {x: '2022-07-27 08:00:00', y: '0.3'},
            {x: '2022-07-27 12:00:00', y: '0.5'},
            {x: '2022-07-27 16:00:00', y: '0.6'},
            {x: '2022-07-27 20:00:00', y: '0.8'},
            {x: '2022-07-27 24:00:00', y: '0.7'},
        ]
    }
]

/** 有数据但最大长度小于这个数则使用此值 */
const FixedOffset = 3;
/** 特殊轴数据一个文本大小 */
const EchartsSetTextWidth = 9;
/** 默认一个文本大小  */
const EchartsTextWidth = 9;
/** grid附加偏移量, 上方文本大小不精确还会有被隐藏问题, x轴有长文字显示也有问题 */
const EchartsGridOffset = 25;

const Chart = (props: ChartProps) => {

    let  {isDemo, userConfig, dateSet, rawAssetAlias, totalCustomAlias, refEc, timeSelectEnable, onLoadingChange, ...restProps} = props;

    const {curDateType, date} = dateSet;
    const {
        interval, 
        points, 
        yLeftMax,
        yLeftMin,
        yRightMax,
        yRightMin
    } = userConfig.find(ele => ele.timeGran === curDateType) || {};

    let curPoints = JSON.parse(JSON.stringify(points || []));

    const [chartState, setChartState] = useState({
        initialized: false,
        timeZone: '',
        historyData: []
    });
    const chartReq = useRef({
        hisReq: getHistoryCurveReq(false, false),
        planReq: getHistoryCurveReq(false, true),
        realReq: getHistoryCurveReq(true, false)
    });

    const clearEchartsIns = useRef(false);

    useEffect(() => {
        clearEchartsIns.current = true;
        setChartState(s => Object.assign({}, s, {initialized: false}, {historyData: []}));
    }, [curDateType, userConfig]);

    if(!isDemo){

        //统一获取
        useRecursiveTimeoutEffect(
            () => {
                setReq(curDateType, date || moment());
                if(curDateType === DATE_TYPE.REALTIME || !(curDateType && (date || !timeSelectEnable))){
                    return null;
                }
                const curveReqList: any[] = [];
                if(chartReq.current.planReq.curve?.length > 0){
                    curveReqList.push(chartReq.current.planReq);
                }
                if(chartReq.current.hisReq.curve?.length > 0){
                    curveReqList.push(chartReq.current.hisReq);
                }
                if(curveReqList.length === 0) return;

                onLoadingChange(true);

                return [
                    () => {
                        return _dao.getCurveList(curveReqList).then(responses => {
                            let ok = true;
                            for (let response of responses) {
                                if (!response.ok) {
                                    ok = false;
                                }
                            }
                
                            if (ok) {
                                return responses;
                            }
                
                            throw new Error('get list data failed');
                        }).then((responses) => {
                            return Promise.all(responses.map(res => res.json()));
                        })
                    }, 
                    (res) => {
                        onLoadingChange(false);
                        let hisData = [];
                        res.map((r) => {
                            if(daoIsOk(r)){
                                (r.data || []).forEach(d => {
                                    let { key, Points } = d;
                                    let {convert, ...rest} = curPoints.find(point => point.pointKey === key);
                                    d.Points = getConvertRes(Points, convert);
                                    Object.assign(d,{convert: convert}, rest);
                                    hisData.push(d);
                                });
                            }
                        })

                        //合并两个接口数据，没有数据的测点根据有数据的测点间隔补齐，并根据指标顺序重排序
                        let expData = hisData.find(d => d.Points.length > 0);

                        const reOrderHisData = expData ? curPoints.map((p) => {
                            let target = hisData.find(d => d.pointKey === p.pointKey);
                            if(target){
                                return target;
                            }else{
                                return {
                                    ...p,
                                    Points: expData.Points.map(v => {
                                        return {
                                            x: v.x,
                                            y: ''
                                        }
                                    })
                                }
                            }
                        }) : hisData
                        
                        setChartState(s => Object.assign({}, s, {
                            historyData: reOrderHisData
                        }));
                    }
                ];
            }, 
            CommonHisTimerInterval, 
            [curDateType, date, userConfig, rawAssetAlias, timeSelectEnable]
        );

        // 实时曲线获取初始数据
        useEffect(() => {
            if(curDateType !== DATE_TYPE.REALTIME){
                return;
            }
            setChartState(s => Object.assign({}, s, {
                historyData: []
            }));

            setReq(curDateType);
            onLoadingChange(true);
            
            _dao.getCurve(chartReq.current.realReq).then((res) => {
                onLoadingChange(false);

                let hisData = [];
                let tempTimeZone = '';
                if(daoIsOk(res)){

                    (res.data || []).forEach(d => {
                        let { key, Points } = d;
                        let {convert, ...rest} = curPoints.find(point => point.pointKey === key);
                        d.Points = getConvertRes(Points, convert);
                        Object.assign(d,{convert: convert}, rest);
                        hisData.push(d);
                    });
                    tempTimeZone = res.timezone;
                }
                setChartState(s => Object.assign({}, s, {
                    historyData: hisData,
                    initialized: true,
                    timeZone: tempTimeZone
                }));
            })
        }, [curDateType, date, userConfig, rawAssetAlias, timeSelectEnable]);

        // 定时获取实时数据
        useRecursiveTimeoutEffect(
            () => {
                if(!chartState.initialized 
                    || curDateType !== DATE_TYPE.REALTIME 
                    || !(curDateType && (date || !timeSelectEnable))){
                    return;
                }

                return [
                    () => {
                        return _dao.getDynData(curPoints.map(point => {
                            let {customAssetAlias} = point;
                            const customAlias = getAssetAlias(rawAssetAlias, customAssetAlias || totalCustomAlias);

                            const pointKey = getPointKey(point, customAlias);
                            point.pointKey = pointKey;
                            return {
                                id: '',
                                key: pointKey,
                                decimal: 3
                            }
                        }))
                    }, 
                    (res) => {
                        if(daoIsOk(res)){
                            setChartState(s => {
                                let hisData = JSON.parse(JSON.stringify(s.historyData));
                                let {current_date_time, data} = res;
                                (curPoints || []).forEach(p => {
                                    let { pointKey = '', convert} = p;
                                    let hisDataItem = hisData.find(point => point.pointKey === pointKey);

                                    if(!hisDataItem){
                                        hisDataItem = Object.assign({}, p, {Points: fillingPoints(current_date_time, 30, 5)});
                                        
                                        hisData.push(hisDataItem);
                                    }

                                    let {display_value = ''} = data.find(d => d.key === pointKey) || {};
                                    let addPoints = getConvertRes([{x: current_date_time, y: display_value}], convert);
                                    hisDataItem.Points.push.apply(hisDataItem.Points, addPoints);
                                    hisDataItem.Points.shift();
                                });

                                return Object.assign({}, s, {
                                    historyData: hisData
                                })
                            });
                        }
                    }
                ];
            }, 
            RealTimeCurveTimerInterval, 
            [curDateType, date, userConfig, rawAssetAlias, timeSelectEnable, chartState.initialized]
        );
    }

    const setReq = (granularValue, time = null) => {

        let hisCurvePoints: any[] = [];
        let planCurvePoints: any[] = [];
        let realCurvePoints: any[] = [];

        curPoints.map(point => {
            let {subtract, customAssetAlias, isPlan} = point;
            const customAlias = getAssetAlias(rawAssetAlias, customAssetAlias || totalCustomAlias);

            const pointKey = getPointKey(point, customAlias);

            point.pointKey = pointKey;

            let curveModel = Object.assign({}, 
                getHistoryCurveModel(curDateType === DATE_TYPE.REALTIME, isPlan),
                {key: pointKey},
                subtract ? {arith_type: subtract} : {}
            )

            if(isPlan){
                planCurvePoints.push(curveModel)
            }else if(curDateType === DATE_TYPE.REALTIME){
                realCurvePoints.push(curveModel)
            }else{
                hisCurvePoints.push(curveModel)
            }
        })

        if(granularValue === DATE_TYPE.REALTIME){
            chartReq.current.realReq = Object.assign({}, getHistoryCurveReq(true, false), {curve: realCurvePoints});

        }else if(granularValue === DATE_TYPE.CUSTOMIZE){

            const start = time && time[0] ? time[0].format(DATE_MOMENT_FORMAT.DATE_HOUR_MINUTE) + DATE_MOMENT_FORMAT.SECOND_ZERO : '';
            const end = time && time[1] ? time[1].format(DATE_MOMENT_FORMAT.DATE_HOUR_MINUTE) + DATE_MOMENT_FORMAT.SECOND_ZERO : '';

            let req = Object.assign({}, 
                {
                    start_time: start,
                    end_time: end,
                },
                getInvertal(interval) || {},
            );
            chartReq.current.hisReq = Object.assign({}, 
                getHistoryCurveReq(false, false),
                req,
                {curve: hisCurvePoints}
            );

            chartReq.current.planReq = Object.assign({}, 
                getHistoryCurveReq(false, true),
                req,
                {curve: planCurvePoints}
            );

        }else{

            const arr = getRangeChangedMomentDate(granularValue, time.clone());

            let req = Object.assign({}, 
                {
                    start_time: arr[0],
                    end_time: arr[1],
                },
                getInvertal(interval) || {}
            );

            chartReq.current.hisReq = Object.assign({}, 
                getHistoryCurveReq(false, false),
                req,
                {curve: hisCurvePoints}
            );

            chartReq.current.planReq = Object.assign({},
                getHistoryCurveReq(false, true), 
                req,
                {curve: planCurvePoints}
            );
        }
    }

    if(isDemo){
        return <div className={styles.chart}>
        <EchartsWrap 
            ref = {refEc}
            isClearOpt={clearEchartsIns.current}
            data = {{
                historyData: demoMockData,
                yLeftMax: '',
                yLeftMin: '',
                yRightMax: '',
                yRightMin: '',
            }}
            getOption={(data, ec) => {
                clearEchartsIns.current = false;
                return getOption(data, ec);
            }}
            replaceMerge={['series']}
            {...restProps}
        />
    </div>
    }

    return <div className={styles.chart}>
        <EchartsWrap 
            ref = {refEc}
            isClearOpt={clearEchartsIns.current}
            data = {{
                historyData: chartState.historyData,
                yLeftMax: yLeftMax,
                yLeftMin: yLeftMin,
                yRightMax: yRightMax,
                yRightMin: yRightMin,
                dateType: curDateType,
                interval: interval,
                timeZone: chartState.timeZone
            }}
            getOption={(data, ec) => {
                clearEchartsIns.current = false;
                return getOption(data, ec);
            }}
            replaceMerge={['series']}
            {...restProps}
        />
    </div>
}

const areEqual = (prevProps, nextProps) => {
    if (lodash.isEqual(prevProps.userConfig, nextProps.userConfig)
    && lodash.isEqual(prevProps.dateSet, nextProps.dateSet)
    && lodash.isEqual(prevProps.rawAssetAlias, nextProps.rawAssetAlias)){
        return true;

    }else{
        return false;
    }
}

export default React.memo(Chart, areEqual) ;


const getOption = (data={}, ec) => {
    const {dateType, timeZone} = data;

    // debug
    /* data.historyData = data.historyData.map(d => {
        d.Points = d.Points.map((p,ind,arr) => {
            p.y = '1890';
            return p;
        });
        return d;
    }); */

    const {
        xAxis=[], 
        yAxis=[], 
        series=[], 
        legend=[], 
        yAxisLeftCount,
        yAxisRightCount,
        specialLeftOffset,
        specialRightOffset,
        hasSpecialLeft,
        hasSpecialRight
    } = parseData(data) || {};

    if(yAxis.length === 0){
        return null;
    }

    const lastAxisValueLabel = xAxis[xAxis.length - 1] || '';
    return {
        animation: false,
        tooltip: {
            appendToBody: true,
            trigger: 'axis',
            axisPointer: {
                type: 'none',
            },
            backgroundColor: theme.tooltipBg,
            borderWidth: 0,
            textStyle: {
                color: theme.tooltipDesColor,
            },
            className: 'curve-echart-tooltip',
            formatter: (params, ticket, callback) => {
                if(Array.isArray(params) && params.length > 0){
                    let time = params[0].axisValueLabel || lastAxisValueLabel;
                    let next = params[0].data.next;
                    const seriesTip = params.map(serie => {
                        const {marker, seriesName, data: {unit, value}} = serie;
                        const val = autoComma(value === '' || value === null || value === undefined ? SLOT : value);
                        return `<div>${marker} <span style="margin-right:5px;">${seriesName}:</span> <span style="color: ${theme.tooltipValColor}">${val} ${unit}</span></div>`
                    }).join('');
                    // if(curDateType === DATE_TYPE.DAY){
                    //     return `<div>${time} ~ ${next}</div>${seriesTip}`;
                    // }else{
                        return `<div>${time}</div>${seriesTip}`;
                    // }                        
                }
                return '';
            }
        },
        grid: Object.assign({}, {
                left: 25,
                right: 25,
                top: 30,
                bottom: 50,
                containLabel: false
            },
            specialLeftOffset ? {left: specialLeftOffset * (hasSpecialLeft ? EchartsSetTextWidth : EchartsTextWidth) + EchartsGridOffset} : {},
            specialRightOffset ? {right: specialRightOffset * (hasSpecialRight ? EchartsSetTextWidth : EchartsTextWidth) + EchartsGridOffset} : {}
        ),
        xAxis: {
            axisLabel: {
                hideOverlap: true
            },
            axisTick: {
                alignWithLabel: true
            },
            type: 'category',
            data: xAxis.map((e, inx) => {
                if(dateType === DATE_TYPE.REALTIME && inx === 0){
                    return `${e}\n${fill_UTC_area(timeZone)}`;
                }else if(inx === xAxis.length - 1){
                    return '';
                }else{
                    return e;
                }
            })
        },
        yAxis: yAxis,
        series: series,
        legend: {
            type: 'scroll',
            pageIconColor: theme.pageIconColor,
            pageIconInactiveColor: theme.pageIconInactiveColor,
            pageTextStyle: {
                color: theme.pageTextColor
            },
            y: 'bottom',
            itemWidth: 12,
            itemHeight: 8,
            textStyle: {
                color: theme.chartLegendColor,
                fontWeight: 500
            },
            data: legend
        },
        aria: {
            enabled: true,
            decal: {
                show: true
            }
        }
    }
};

/**
 * 由于echarts控件问题, 多轴显示时Y轴的偏移量根据单位、最值、数据文字长度实时计算
 * @param propsData 
 * @returns 
 */
const parseData = (propsData) => {
    const {
        yLeftMax = '',
        yLeftMin = '',
        yRightMax = '',
        yRightMin = '',
        historyData: data = [],
        dateType,
        interval
    } = propsData;

    let legend: LegendComponentOption[] = [];
    let xAxis: XAXisComponentOption[] = [];
    let yAxis: YAXisComponentOption[] = [];
    let series: SeriesOption[] = [];

    // 判断公用轴是否存在
    let includePublicLeft = false;
    let includePublicRight = false;
    const publicYxisLeft = 'publicLeft';
    const publicYxisRight = 'publicRight';

    /** 左侧Y轴数量 */
    let yAxisLeftCount = 0;
    /** 右侧Y轴数量 */
    let yAxisRightCount = 0;
    /** series对应Y轴索引 */
    const yAxisMap = {};
    /** 左侧公共轴数据长度集合, 含单位, 含最值, 计算轴的偏移量使用 */
    const leftPublicDataLength: number[] = [];
    /** 右侧公共轴数据长度集合, 含单位, 含最值, 计算轴的偏移量使用 */
    const rightPublicDataLength: number[] = [];
    /** 特殊轴数据长度集合映射, 含单位, 计算轴的偏移量使用 */
    const specialDataLength = {};

    data.forEach((item, ind) => {
        item.axisProps = Object.assign({}, {axisType: 'special', position: 'left'}, item.axisProps)
        const {pointKey, axisProps, convert, Points: pointData} = item;
        let {axisType, position, min, max} = axisProps;
        const unit = convert?.unit || item.unit;

        if(axisType === 'public'){
            if(position === 'right'){

                /** 公共右轴只计算一次 */
                if(!includePublicRight){
                    yAxisRightCount = yAxisRightCount + 1;

                    if(NumberUtil.isValidNumber(yRightMin)){
                        rightPublicDataLength.push(String(yRightMin).length);
                    }
                    if(NumberUtil.isValidNumber(yRightMax)){
                        rightPublicDataLength.push(String(yRightMax).length);
                    }
                }
                includePublicRight = true;

                rightPublicDataLength.push(String(unit || '').length);
                pointData.map((xy) => {
                    let y = String(xy.y || '').split('.');

                    // 数据开头非0时取整, 轴标签不含小数
                    let len = y[0] === '0' ? String(xy.y || '').length : y[0].length;
                    rightPublicDataLength.push(len);
                });
            }else{

                /** 公共左轴只计算一次 */
                if(!includePublicLeft){
                    yAxisLeftCount = yAxisLeftCount + 1;

                    if(NumberUtil.isValidNumber(yLeftMin)){
                        leftPublicDataLength.push(String(yLeftMin).length);
                    }
                    if(NumberUtil.isValidNumber(yLeftMax)){
                        leftPublicDataLength.push(String(yLeftMax).length);
                    }
                }
                includePublicLeft = true;

                leftPublicDataLength.push(String(unit || '').length);
                pointData.map((xy) => {
                    let y = String(xy.y || '').split('.');
                    let len = y[0] === '0' ? String(xy.y || '').length : y[0].length;
                    leftPublicDataLength.push(len);
                });
            }
        }else{
            if(position === 'right'){
                yAxisRightCount = yAxisRightCount + 1;
            }else{
                yAxisLeftCount = yAxisLeftCount + 1;
            }

            specialDataLength[pointKey] = [];
            specialDataLength[pointKey].push(String(unit || '').length);
            if(NumberUtil.isValidNumber(min)){
                specialDataLength[pointKey].push(String(min).length);
            }
            if(NumberUtil.isValidNumber(max)){
                specialDataLength[pointKey].push(String(max).length);
            }
            pointData.map((xy) => {
                let y = String(xy.y || '').split('.');
                let len = y[0] === '0' ? String(xy.y || '').length : y[0].length;
                specialDataLength[pointKey].push(len);
            });
        }
    })

    /** 有特殊左轴时grid left偏移量使用specialLeftOffset计算 */
    let hasSpecialLeft = false;
    /** 有特殊右轴时grid right偏移量使用specialRightOffset计算 */
    let hasSpecialRight = false;
    /** 特殊左Y轴偏移量, 初始化要加上公共左侧Y轴偏移量, echarts问题当有数据时但数据长度小的时候轴的数据可能会有3位 */
    let specialLeftOffset = leftPublicDataLength.length > 0 ? NumberUtil.numberArrMax(leftPublicDataLength) : 0;
    specialLeftOffset = specialLeftOffset > 0 && specialLeftOffset < FixedOffset ? FixedOffset : specialLeftOffset;
    /** 特殊右Y轴偏移量, 初始化要加上公共右侧Y轴偏移量, echarts问题当有数据时但数据长度小的时候轴的数据可能会有3位 */
    let specialRightOffset = rightPublicDataLength.length > 0 ? NumberUtil.numberArrMax(rightPublicDataLength) : 0;
    specialRightOffset = specialRightOffset > 0 && specialRightOffset < FixedOffset ? FixedOffset : specialRightOffset;

    data.forEach((item, ind) => {
        const {
            pointKey,
            axisProps, 
            convert = {}, 
            color = DEFAULT_VALUE.COLOR[ind%5]
        } = item;
        let {axisType, position, min, max} = axisProps;
        const unit = convert?.unit || item.unit;

        /** Y轴偏移量, 公共轴都是0 */
        let yAxisOffset = 0;
        /** Y公共轴偏索引, 大于-1代表已经存在此公共轴, 不可再添加 */
        let publicIndex = -1;
        if(axisType === 'public'){
            if(position === 'right'){
                min = yRightMin;
                max = yRightMax;
                publicIndex = yAxis.findIndex(item => item.id === publicYxisRight);
            }else{
                min = yLeftMin;
                max = yLeftMax;
                publicIndex = yAxis.findIndex(item => item.id === publicYxisLeft);
            }
        }else{
            if(position === 'right'){

                yAxisOffset = specialRightOffset;

                let d = specialDataLength[pointKey];
                let curOffset = (d.length > 0 ? NumberUtil.numberArrMax(d) : 0);
                curOffset = curOffset > 0 && curOffset < FixedOffset ? FixedOffset : curOffset;
                specialRightOffset = specialRightOffset + curOffset;

                hasSpecialRight = true;
            }else{

                yAxisOffset = specialLeftOffset;

                let d = specialDataLength[pointKey];
                let curOffset = (d.length > 0 ? NumberUtil.numberArrMax(d) : 0);
                curOffset = curOffset > 0 && curOffset < FixedOffset ? FixedOffset : curOffset;
                specialLeftOffset = specialLeftOffset + curOffset;

                hasSpecialLeft = true;
            }
        }

        if(publicIndex > -1){
            yAxisMap[pointKey] = publicIndex;
            return;
        }

        yAxis.push({
            id: axisType === 'public' ? (position === 'right' ? publicYxisRight : publicYxisLeft) : undefined,
            //alignTicks: true,
            position: position || 'left',
            offset: yAxisOffset * EchartsSetTextWidth,
            type: 'value',
            name: unit || '',
            splitNumber: 5,
            splitLine: {
                lineStyle: {
                    type:'dashed',
                    color: [theme.chartYaxisSplitColor]
                }
            },
            axisLine: {
                onZero: false
            },
            axisLabel: {
                hideOverlap: true,
                color: axisType === 'special' ? color : theme.chartLegendColor,
                formatter: function(value){
                    let isOverFlow = String(value)?.split('.')[1]?.length > 2;
                    return isOverFlow ? NumberUtil.format(value, null, DEFAULT_VALUE.DECIMAL, false) : value;
                }
            },
            ...(min || min === 0 ? {min: min} : {}),
            ...(max || max === 0 ? {max: max} : {})
        });

        yAxisMap[pointKey] = yAxis.length - 1;
    })

    data.forEach((item, ind) => {
        const { 
            name_cn, 
            name_en, 
            edictNameCn, 
            edictNameEn, 
            convert = {}, 
            chartType = DEFAULT_VALUE.CHART_TYPE, 
            color = DEFAULT_VALUE.COLOR[ind%5],
            Points: pointData,
            axisProps,
            pointKey
        } = item;

        const name = isZh ? (edictNameCn || name_cn) : (edictNameEn || name_en);
        const unit = convert?.unit || item.unit;

        const {colorFrom, colorTo} = gradient(color, 0.25);

        const linearColor = {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: colorFrom // 0% 处的颜色
            }, {
                offset: 1, color: colorTo // 100% 处的颜色
            }],
        }

        legend.push(Object.assign(
            {name},
            chartType === 'area' ? {
                icon: 'rect',
                itemStyle: {
                    color: linearColor
                } 
            } : {},
            chartType === 'bullet' ? {
                icon: 'rect',
                itemStyle: {
                    color: 'rgba(0, 0, 0, 0)',
                    decal: {
                        color: color,
                        dashArrayX: [1, 0],
                        dashArrayY: [0, 2, 4, 2],
                        rotation: 0
                    },
                } 
            } : {}
            )
        );

        series.push(Object.assign({}, {
            ...CHART_TYPE_MAP[chartType],
            name: name,
            data: pointData.map((xy, index, arr) => {
                let { x, y } = xy;
                if(ind === 0){
                    xAxis.push(getXaxisDate(x, dateType, interval));
                }
                return {
                    next: index === arr.length - 1 ? '24:00' : getXaxisDate(arr[index + 1].x, dateType, interval),
                    value: y,
                    unit: unit 
                }
            }),
            yAxisIndex: yAxisMap[pointKey],
            itemStyle: {
                color: color
            },
            ...(chartType === 'area' ? {areaStyle: {
                color: linearColor
            }} : {}),
        }, 
        chartType === 'bar' ? {
            barWidth: '30%',
            barMaxWidth: '30%',
            barMinWidth: '20%'
        } : {}, 
        chartType === 'line' ? {
            symbol: 'circle',
            symbolSize: 1
        } : {}));
    });

    return {
        legend, 
        xAxis, 
        yAxis: yAxis.map(y => {
            delete y.id;
            return y;
        }), 
        series,
        yAxisLeftCount,
        yAxisRightCount,
        specialLeftOffset,
        specialRightOffset,
        hasSpecialLeft,
        hasSpecialRight
    };
};

/**
 * 
 * @param {String} xDate string of (@see Date)
 * @returns {String}
 */
const getXaxisDate = (xDate, dateType, interval='') => {

    const isDate = interval.split('_')[1] === 'day';

    switch(dateType){
        case DATE_TYPE.DAY:
            return moment(xDate)
            .format(DATE_MOMENT_FORMAT.HOUR_MINUTE);
        case DATE_TYPE.WEEK:
            return moment(xDate)
            .format(DATE_MOMENT_FORMAT.DATE);
        case DATE_TYPE.MONTH:
            return moment(xDate)
            .format(DATE_MOMENT_FORMAT.DATE);
        case DATE_TYPE.YEAR:
            return moment(xDate)
            .format(DATE_MOMENT_FORMAT.YEAR_MONTH);
        case DATE_TYPE.CUSTOMIZE:
            return moment(xDate)
            .format(isDate ? DATE_MOMENT_FORMAT.DATE : DATE_MOMENT_FORMAT.DATE_HOUR_MINUTE);
        case DATE_TYPE.REALTIME:
        return moment(xDate)
        .format(DATE_MOMENT_FORMAT.TIME);
        case DATE_TYPE.TOTAL:
        default:
            return moment(xDate)
            .format(DATE_MOMENT_FORMAT.YEAR);                
    }
}