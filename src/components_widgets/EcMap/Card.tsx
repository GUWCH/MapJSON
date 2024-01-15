import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import { Tooltip } from "antd";
import Spectra from 'Spectra';
import CommonDynData from 'DynData';
import { FontIcon, IconType } from 'Icon';
import EchartsWrap from "EchartsWrap";
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import { uIdKey, PointModel } from '@/components_utils/models';
import { _dao, daoIsOk } from '@/common/dao';
import { CommonTimerInterval, CommonHisTimerInterval } from '@/common/const-scada';
import { isZh } from "@/common/util-scada";
import { getPointKey, DECIMAL } from "@/common/constants";
import { NumberUtil, DateUtil } from "@/common/utils";
import { getTheme } from '@/common/theme';
import { EcMapPointMap, EcMapFnTypes } from './index';
import styles from './style.mscss';

const theme = getTheme();
const DEFAULT_COLOR = ['rgba(0,219,255,1)', 'rgba(88,245,192,1)', 'rgba(142,133,255,1)', 'rgba(255,181,0,1)', 'rgba(245,10,34,1)'];

const getChartOption = (series, ec) => {
    const options = {
        animation: false,
        textStyle: {
            color: theme.chartTextColor,
            fontWeight: 'normal'
        },
        title: {
            text: '',
            textStyle: {
                fontSize: 12,
                //fontWeight: 'normal',
                color: theme.white
            }
        },
        grid: {
            top: 25,
            bottom: 25,
            left: 2,
            right: 2,
            containLabel: false
        },
        tooltip: {
            trigger: 'axis',
            confine: false,
            appendToBody: true,
            backgroundColor: '#083F4D',
            borderWidth: 0,
            textStyle: {
                fontSize: 14,
                color: '#6A8CA3'
            },
            axisPointer: {
                type: 'none'
            },
            className: '',
            formatter: function (params) {
                var relVal = '<div>' + params[0].name + '</div>';
                for (var i = 0, l = params.length; i < l; i++) {
                    relVal += '<div style="padding: 2px 0;">' 
                        + params[i].marker 
                        + '<span style="margin-right: 10px;">' + params[i].seriesName + '</span>' 
                        + `<span style="color: white; margin-left: auto">`+ params[i].value + ' ' + (params[i].data?.unit || '')+'</span>'
                        + '</div>';
                }
                return relVal;
            }
        },
        legend: {
            type: 'scroll',
            icon: 'rect',
            itemHeight: 8,
            itemWidth: 8,
            padding: [0, 0, 5, 0],
            inactiveColor: theme.chartLegendActiveColor,
            y: 'bottom',
            textStyle: {
                color: theme.chartLegendColor,
                width: (ec.getWidth() - 50)/(series.length || 1),
                ellipsis: '...',
                overflow: 'truncate',
                rich: {
                    align: 'center'
                }
            },
            tooltip: {
                show: true
            },
            data: series.map(s => s.name)
        },
        xAxis: {
            show: false,
            type: 'category',
            data: ((series[0] || {}).data || []).map(d => d.date)
        },
        yAxis: series.map((s, ind) => {
            return {
                name: '',
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: ind === 0,
                    lineStyle: {
                        color: theme.chartYaxisSplitColor
                    }
                }                
            }
        }),
        series: series
    };

    return options;
}

class DataStore {
    dynDataMap: {[key: string]: IDyn} = {};
    historyDataMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    setDynDataMap(dynDataMap) {
        Object.assign(this.dynDataMap, dynDataMap);
    }

    setHistoryDataMap(historyDataMap) {
        Object.assign(this.historyDataMap, historyDataMap);
    }
}

const dataStore = new DataStore();

type CardProps = {
    name: string;
    alias: string;
    pointMap: EcMapPointMap;
}

type FnPointMap = {
    [key in EcMapFnTypes]: {
        allPoints: {[key: string]: PointModel},
        selectedPoints: {
            show?: boolean;
            points?: TCachePoint[]
        }
    }
};

const Card = (props: CardProps) => {
    const { name, alias, pointMap } = props;
    const { cacheMap={}, pointsMap={} } = pointMap || {};

    // @ts-ignore
    const fnPointMap: FnPointMap = useMemo(() => {
        let fnPointMap = {};
        for(let k in EcMapFnTypes){
            const kv = EcMapFnTypes[k];
            fnPointMap[kv] = {allPoints: {}, selectedPoints: {}};
            (pointsMap[kv] || []).map(p => {
                fnPointMap[kv].allPoints[p[uIdKey]] = p;
            });
            fnPointMap[kv].selectedPoints = cacheMap[kv] || {};
        }
        return fnPointMap;
    }, [cacheMap, pointsMap]);

    const render = useCallback((fn: EcMapFnTypes) => {
        const { selectedPoints, allPoints } = fnPointMap[fn];
        const show = selectedPoints.show;
        const existedPoints = (selectedPoints.points || []).filter(s => allPoints[s.key]);

        if(existedPoints.length === 0 || (fn !== EcMapFnTypes.STATUS && !show))return null;
        
        const renderStatus = () => {
            const contents = existedPoints.map((s, ind) => {
                const point  = allPoints[s.key];
                const pKey = getPointKey(point, alias);

                const { attrs } = s;
                const { valueMap, convert } = attrs || {};
                let containerStyle;
                let icon;
                let decimal = DECIMAL.COMMON;

                const dynData = dataStore.dynDataMap[pKey] || {};
                const valueMapItem = (valueMap||{})[String(dynData.raw_value)] || {};
                containerStyle = {
                    borderRadius: '0 12px 12px 0',
                    padding: '0 10px'
                };
                if(valueMapItem.background){                    
                    const colorSpectra = Spectra(valueMapItem.background);
                    const startColor = `rgba(${colorSpectra.red()}, ${colorSpectra.green()}, ${colorSpectra.blue()}, .3)`;
                    containerStyle.background = `linear-gradient(90deg, ${startColor}, ${valueMapItem.background} 100%)`;
                }
                if(valueMapItem.icon){
                    icon = valueMapItem.icon;
                }
                decimal = 0;

                return <CommonDynData 
                    key={ind}
                    containerStyle={containerStyle}
                    showName={false}
                    point={{
                        aliasKey: pKey, 
                        tableNo: point.table_no,
                        fieldNo: point.field_no,
                        nameCn: point.name_cn,
                        nameEn: point.name_en,
                        unit: point.unit || '',
                        decimal: decimal
                    }} 
                    value={dataStore.dynDataMap[pKey]}
                    transform={{
                        icon: icon,
                        convert: convert
                    }}
                    eventWrap={true}
                />
            });

            return contents;
        }

        const renderInfo = () => {
            const contents = existedPoints.map((s, ind) => {
                const point  = allPoints[s.key];
                const pKey = getPointKey(point, alias);

                const { attrs } = s;
                const { valueMap, convert } = attrs || {};
                let icon;

                const dynData = dataStore.dynDataMap[pKey] || {};
                if('raw_value' in dynData){
                    const valueMapItem = (valueMap||{})[String(dynData.raw_value)] || {};
                    if(valueMapItem.icon){
                        icon = valueMapItem.icon;
                    }
                }

                return <CommonDynData 
                    key={ind}
                    showName={false}
                    point={{
                        aliasKey: pKey, 
                        tableNo: point.table_no,
                        fieldNo: point.field_no,
                        nameCn: point.name_cn,
                        nameEn: point.name_en,
                        unit: point.unit || '',
                        decimal: DECIMAL.COMMON
                    }} 
                    value={dataStore.dynDataMap[pKey]}
                    transform={{
                        icon: icon,
                        convert: convert
                    }}
                    eventWrap={true}
                />
            });

            return <div className={styles.cardHeadRight}>
                ({contents})
            </div>;
        }

        const renderChart = () => {
            const series = existedPoints.map((s, ind) => {
                const point  = allPoints[s.key];
                const pKey = getPointKey(point, alias);

                const { attrs } = s;
                const { nameCn, nameEn, chart='line', chartColor, convert: { coefficient=undefined, unit='', decimal=undefined } = {} } = attrs || {};
                const name = isZh ? nameCn || point.name_cn : nameEn || point.name_en;
                const seriesData = (dataStore.historyDataMap[pKey] || []).map(d => {
                    const { x, y } = d;
                    const val = NumberUtil.format(y, coefficient, NumberUtil.isValidNumber(decimal) ? Number(decimal) : 2);
                    return {
                        date: x,
                        value: val,
                        unit: unit || point.unit || ''
                    };
                });
                let chartType = chart;
                let symbol;
                let colorSpectra;
                switch(chart){
                    case 'area':
                        chartType = 'line';
                        symbol = 'none';
                        colorSpectra = Spectra(chartColor || DEFAULT_COLOR[ind]);
                        break;
                    case 'bullet':
                        chartType = 'scatter';
                        symbol = 'roundRect';
                        break;
                }

                return {
                    type: chartType,
                    name: name,
                    smooth: true,
                    symbol: symbol,
                    symbolSize: chart === 'bullet' ? [11, 3] : 4,
                    showSymbol: chart === 'bullet' ? true : false,
                    itemStyle: {
                        color: chartColor
                    },
                    data: seriesData,
                    yAxisIndex: ind,
                    ...(chart === 'area' ? {areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: `rgba(${colorSpectra.red()}, ${colorSpectra.green()}, ${colorSpectra.blue()}, 1)`
                            }, {
                                offset: 1, color: `rgba(${colorSpectra.red()}, ${colorSpectra.green()}, ${colorSpectra.blue()}, .3)`
                            }],
                        }
                    }} : {}),
                };
            });

            return <div 
                onClick={e => {e.preventDefault();e.stopPropagation();}} 
                className={`${styles.cardMiddleLeft}`}
            >
                <EchartsWrap 
                    data={series}
                    getOption={(series, ec) => {
                        return getChartOption(series, ec);
                    }}
                />
            </div>;
        }

        const renderQuota = () => {
            const contents = existedPoints.map((s, ind) => {
                const point  = allPoints[s.key];
                const pKey = getPointKey(point, alias);

                const attrs = JSON.parse(JSON.stringify(s.attrs || {}));
                attrs.iconLeftValue = true;

                return <CommonDynData 
                    key={ind}
                    wrapperCls={styles.rightItemWrap}
                    containerCls={styles.rightItem}
                    showName={true}
                    nameCls={styles.rightItemName}
                    nameContainerCls={styles.rightItemNameWrap}
                    point={{
                        aliasKey: pKey, 
                        tableNo: point.table_no,
                        fieldNo: point.field_no,
                        nameCn: point.name_cn,
                        nameEn: point.name_en,
                        unit: point.unit || '',
                        decimal: DECIMAL.COMMON
                    }} 
                    value={dataStore.dynDataMap[pKey]}
                    valueCls={styles.rightItemVal}
                    transform={attrs}
                    eventWrap={true}
                />
            });

            return <div className={styles.cardMiddleRight}>
                {contents}
            </div>;
        }

        const renderStat = () => {
            const contents = existedPoints.map((s, ind) => {
                const point  = allPoints[s.key];
                const pKey = getPointKey(point, alias);

                const { attrs } = s;
                const { icon, background, convert } = attrs || {};
                const dynData = dataStore.dynDataMap[pKey] || {};
                let { display_value } = dynData;
                let iconStyle = {};
                let cvtValue = NumberUtil.removeCommas(display_value);
                if(cvtValue && NumberUtil.isValidNumber(cvtValue) && Number(cvtValue) !== 0 && background){
                    iconStyle = {
                        background: background
                    }
                }

                return <div key={ind}>
                    <Tooltip 
                        placement="top" 
                        title={isZh ? point.name_cn : point.name_en}
                        destroyTooltipOnHide={{keepParent: false}}
                    >
                        <div style={iconStyle}>
                            <FontIcon type={IconType[icon]}/>
                        </div>
                    </Tooltip>
                    <CommonDynData 
                        key={ind}
                        showName={false}
                        point={{
                            aliasKey: pKey, 
                            tableNo: point.table_no,
                            fieldNo: point.field_no,
                            nameCn: point.name_cn,
                            nameEn: point.name_en,
                            unit: point.unit || '',
                            decimal: 0
                        }} 
                        value={dataStore.dynDataMap[pKey]}
                        transform={{
                            convert: convert
                        }}
                        eventWrap={true}
                    />
                </div>
            });

            return <div className={styles.cardBottom}>
                {contents}
            </div>;
        }

        switch(fn){
            case EcMapFnTypes.STATUS:
                return renderStatus();
            case EcMapFnTypes.INFO:
                return renderInfo();
            case EcMapFnTypes.OVERVIEW:
                return renderChart();
            case EcMapFnTypes.QUOTA:
                return renderQuota();
            case EcMapFnTypes.STATISTICS:
                return renderStat();
        }
        
    }, [alias, fnPointMap]);

    const renderMiddle = useCallback(() => {
        const quotas = render(EcMapFnTypes.QUOTA);
        const charts = render(EcMapFnTypes.OVERVIEW);

        const leftSpace = !!charts;
        const rightSpace = !!quotas;

        if(!leftSpace && !rightSpace) return null;

        let cls = '';
        if(leftSpace && !rightSpace){
            cls = styles.cardMiddleFullLeft;
        }else if(!leftSpace && rightSpace){
            cls = styles.cardMiddleFullRight;
        }

        return <div className={`${styles.cardMiddle} ${cls}`}>
            {leftSpace && <div className={styles.middleLeftCon}>{charts}</div>}
            {rightSpace && <div className={styles.middleRightCon}>{quotas}</div>}
        </div>
    }, [alias, fnPointMap]);

    useEffect(() => {

    }, []);

    // 获取动态数据
    useRecursiveTimeoutEffect(
        () => {
            const dynReq: IDynData[] = [];

            for(let k in EcMapFnTypes){                
                if(EcMapFnTypes[k] === EcMapFnTypes.OVERVIEW){
                    continue;
                }
                const { allPoints, selectedPoints } = fnPointMap[EcMapFnTypes[k]];
                (selectedPoints.points || []).map(p => {
                    const point = allPoints[p.key];
                    if(!point)return;

                    dynReq.push({
                        id: '',
                        key: getPointKey(point, alias),
                        decimal: 3 
                    });
                });
            }

            if(dynReq.length === 0)return;

            return [
                () => _dao.getDynData(dynReq), 
                (res) => {
                    if(daoIsOk(res)){
                        const newDynDataMap = {};
                        res.data.map((d) => {
                            delete d.timestamp;
                            newDynDataMap[d.key] = d;
                        });
                        dataStore.setDynDataMap(newDynDataMap);
                    }
                }, 
                () => {},
            ];
        }, 
        alias ? CommonTimerInterval : 0, 
        [alias, fnPointMap]
    );

    // 获取历史数据
    useRecursiveTimeoutEffect(
        () => {
            const curves: IHistoryCurveItem[] = [];

            for(let k in EcMapFnTypes){
                if(EcMapFnTypes[k] === EcMapFnTypes.OVERVIEW){
                    const { allPoints, selectedPoints } = fnPointMap[EcMapFnTypes[k]];
                    (selectedPoints.points || []).map(p => {
                        const point = allPoints[p.key];
                        if(!point)return;

                        curves.push({
                            key: getPointKey(point, alias),
                            sub_type: '4097',
                            decimal: 3 
                        });
                    });
                    break;
                }                
            }

            if(curves.length === 0)return;

            const historyReq: IHistoryCurve = {
                curve: curves,
                curve_type: '4097',
                interval_type: 1,
                sample_cycle: 5,
                start_time: DateUtil.getStdNowTime(true),
                // @ts-ignore
                end_time: DateUtil.getStdNowTime(),
                time_mode: '1'
            };

            return [
                () => _dao.getCurve(historyReq), 
                (res) => {                    
                    if(daoIsOk(res) && Array.isArray(res.data)){
                        let historyData = {};
                        res.data.forEach(d => {
                            const { key, Points } = d;
                            historyData[key] = Points;
                        });

                        dataStore.setHistoryDataMap(historyData);
                    }
                }, 
                () => {},
            ];
        }, 
        alias ? CommonHisTimerInterval : 0, 
        [alias, fnPointMap]
    );

    return <div className={styles.cardContent}>
        <div className={styles.cardHeadline}>
            {render(EcMapFnTypes.STATUS)}
            <div className={styles.cardHeadlineName}>{name}</div>
            {render(EcMapFnTypes.INFO)}
        </div>
        {renderMiddle()}
        {render(EcMapFnTypes.STATISTICS)}
    </div>;
}

export default observer(Card);