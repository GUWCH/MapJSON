import * as React from 'react';
import ScadaCfg, {
    TimerInterval, 
    PowerHisTimerInterval,
    CommonHisTimerInterval,
    DATE_FORMAT
} from '../../common/const-scada';
import { NumberUtil, GeoUtil, DateUtil } from '../../common/utils';
import { getTheme } from '../../common/theme';
import { isDevelopment, FetchModel, SITE_TYPE, PROPS, VALUES, getPointKey, POINT_TABLE } from "@/common/constants";
import EchartsWrap, { EchartsEvent } from 'EchartsWrap';
import { FixPointVal } from '../../common/util-scada';
import { _dao } from '../../common/dao';
import { Actions, GlobalContext } from './context';
import { toSiteList } from '../common_lib';
import { msg, CENTER_POINTS, SOLAR_POINTS, CUS_FLAG } from './constant';
import '../../common/css/app.scss';
import styles from './style.mscss';

const theme = getTheme();

class CenterIndex extends React.PureComponent {
    static contextType = GlobalContext;

    constructor(props) {
        super(props);        
        this.timerDyn = null;
        this.timerPower = null;
        this.timerProd = null;

        this.pointMap = {};

        const allProps = Object.keys(CUS_FLAG).map(k=>CUS_FLAG[k]).concat(Object.keys(PROPS).map(k=>PROPS[k])); 
        CENTER_POINTS.concat(SOLAR_POINTS).forEach(p => {
            allProps.forEach(prop => {
                if(p[prop]){
                    this.pointMap[prop] = Object.assign({}, p);
                }
            });
        });
    }

    async fetchDynData() {
        const {state: {solarFacs, dynData, currentAlias, updateAlias}, dispatch} = this.context;

        let points = [];
        let keys = [];

        // top indices
        points = [PROPS.CAPACITY, CUS_FLAG.FARM_COUNT, PROPS.GENERATE]
        .map(k => this.pointMap[k])
        .map(p => {
            const {decimal=0} = p;
            const key = getPointKey(p, currentAlias);
            keys.push(key);
            return {
                id: '',
                key: key,
                decimal
            };
        });

        // 代表统计节点
        if(updateAlias && updateAlias.split('.').length > 1){
            CENTER_POINTS.map(p => {
                const {decimal=0} = p;
                const key = getPointKey(p, updateAlias);
                if(keys.indexOf(key) === -1){
                    keys.push(key);
                    points.push({
                        id: '',
                        key: key,
                        decimal
                    });
                }
            });
    
            solarFacs.forEach(sf => {
                const {alias} = sf;
                points = points.concat(SOLAR_POINTS.map(p => {
                    const {decimal=0} = p;
                    return {
                        id: '',
                        key: getPointKey(p, `${alias}.${POINT_TABLE.FARM_STAT}`),
                        decimal
                    };
                }));
            });
        }        

        if(points.length > 0){
            const res = await _dao.getDynData(points);

            if(String(res.code) === '10000'){
                const data = {};
                // 遥信暂时用不到显示值
                res.data.forEach(d => {
                    // used to show detail desc and color
                    if('raw_value' in d){
                        data[`#${d.key}`] = d.display_value;
                        data[`$${d.key}`] = d.color || '';
                    }

                    if (process.env.NODE_ENV === 'development') {
                        data[d.key] = (Math.random() * 100).toFixed(2);
                    }else{
                        data[d.key] = NumberUtil.removeCommas('raw_value' in d ? d.raw_value : d.display_value);
                    }
                    
                });
                dispatch({
                    dynData: Object.assign({}, dynData, data)
                });
            }
        }

        clearTimeout(this.timerDyn);
        this.timerDyn = null;
        this.timerDyn = setTimeout(this.fetchDynData.bind(this), TimerInterval);
    }

    async fetchPowerData() {
        const {state: {updateAlias}, dispatch} = this.context;
        const powerPoint = this.pointMap[PROPS.POWER];
        let key = getPointKey(powerPoint, updateAlias);

        let req = Object.assign({}, FetchModel.HistoryCurveReq, {
            curve: [Object.assign({}, FetchModel.HistoryCurveModel, {
                key: key,
                decimal: powerPoint.decimal || 0
            })],
            start_time: DateUtil.getStdNowTime(true),
            end_time: DateUtil.getStdNowTime()
        });

        const res = await _dao.getCurve(req);

        if(String(res.code) === '10000'){
            dispatch({
                powerData: res.data[0].Points
            });
        }

        clearTimeout(this.timerPower);
        this.timerPower = null;
        this.timerPower = setTimeout(this.fetchPowerData.bind(this), CommonHisTimerInterval);
    }

    async fetchSevenProdData() {
        const {state: {updateAlias}, dispatch} = this.context;
        const prodPoint = this.pointMap[PROPS.GENERATE];
        let key = getPointKey(prodPoint, updateAlias);
        let day = DateUtil.getStdNowTime(true);
        let nextDay = DateUtil.getStdFromUTCTime(DateUtil.getUTCTime(day), 1 * 24 * 3600 * 1000);
        let sevenDay = DateUtil.getStdFromUTCTime(DateUtil.getUTCTime(day), -6 * 24 * 3600 * 1000);

        let req = Object.assign({}, FetchModel.HistoryCurveReq, {
            curve: [Object.assign({}, FetchModel.HistoryCurveModel, {
                key: key,
                decimal: prodPoint.decimal || 0,
                arith_type: 'subtract'
            })],
            start_time: sevenDay,
            end_time: nextDay,
            interval_type: 2
        });

        const res = await _dao.getCurve(req);

        if(String(res.code) === '10000'){
            dispatch({
                prodData: res.data[0].Points
            });
        }

        clearTimeout(this.timerProd);
        this.timerProd = null;
        this.timerProd = setTimeout(this.fetchSevenProdData.bind(this), PowerHisTimerInterval);
    }

    componentDidMount(){
        this.loadEcMap(() => {
            this.context.dispatch({mapMounted: true});
        });
        
        this.getSolarFacs();
        this.updateName(this.context.state.rootAlias);
        this.fetchDynData();
        this.fetchPowerData();
        this.fetchSevenProdData();
    }

    componentWillUnmount(){
        clearTimeout(this.timerDyn);
        this.timerDyn = null;
        clearTimeout(this.timerPower);
        this.timerPower = null;
        clearTimeout(this.timerProd);
        this.timerProd = null;
    }

    updateName(alias){
        ScadaCfg.getNodeByParam('alias', alias).then(res => {
            if(res){
                this.context.dispatch({updateName: res.display_name});
            }
        });
    }

    getSolarFacs() {
        if(!this.context.state.rootAlias)return;

        ScadaCfg.getAllFac(this.context.state.rootAlias).then(facs => {
            let solarFacs = facs.filter(f => String(f.fac_type) === String(SITE_TYPE.SOLAR));

            if (process.env.NODE_ENV === 'development') {
                solarFacs = [
                    { "display_name": "洺河", "alias": "SD1","lon": "115°26'22.919\"","lat": "33°42'7.92\""}, 
                    { "display_name": "云龙", "alias": "SD2", "lon": "114°55'41.879\"", "lat": "33°16'44.76\""}, 
                    { "display_name": "银城", "alias": "TEST05", "lon": "114°37'46.92\"", "lat": "34°6'59.759\"" }, 
                    { "display_name": "晨风", "alias": "TEST06", "lon": "116°11'20.759\"", "lat": "33°55'30.36\"" }, 
                    { "display_name": "垌沟", "alias": "TEST07", "lon": "113°17'25.439\"", "lat": "34°6'46.08\"" }
                ];
            }

            this.context.dispatch({solarFacs});
        });
    }

    loadEcMap(cb){
        let count = 0;
        ['world', 'china'].forEach(async geo => {
            let res = await fetch(`../common/plugins/echarts/mapdata/${geo}.json?_=` + Math.random());
            if(isDevelopment && !res.ok){
                // MAPS_PATH 定义在全局里
                res = await fetch(`${MAPS_PATH}/${geo}.json`);
            }
            if(res.ok){
                res = await res.json();
                EchartsEvent('registerMap', geo, res);
                count = count + 1;
                if(count === 2 && typeof cb === 'function'){
                    cb();
                }
            }            
        });
    }

    renderMap(){
        const {state: { mapMounted, solarFacs, dynData }} = this.context;
        const statePoint = this.pointMap[CUS_FLAG.FARM_STATE];
        const capacityPoint = this.pointMap[CUS_FLAG.FARM_CAPACITY];
        const powerPoint = this.pointMap[CUS_FLAG.FARM_POWER];
        const radiatPoint = this.pointMap[CUS_FLAG.FARM_RADIAT];       

        const scatterData = solarFacs.map(fac => {
            const {display_name, alias, lat, lon} = fac;
            const stateColor = dynData['$' + getPointKey(statePoint, `${alias}.${POINT_TABLE.FARM_STAT}`)] || 'gray';
            const values = [capacityPoint, powerPoint, radiatPoint].map(p => ({
                name: p.name,
                unit: p.unit || '',
                value: FixPointVal(dynData[getPointKey(p, `${alias}.${POINT_TABLE.FARM_STAT}`)], p, VALUES.SLOT)
            }));
            return {
                name: display_name, 
                value: [GeoUtil.WGS84_TO_DIGIT(lon), GeoUtil.WGS84_TO_DIGIT(lat)],
                itemStyle: {
                    color: stateColor
                },
                stateColor: stateColor,
                capacity: values[0],
                power: values[1],
                radiat: values[2]
            };
        });

        return <div className={styles.map}>{
            mapMounted ? 
            <EchartsWrap 
                georoam={(o, ec) => ec.resize()} // prevent marker offset after update echarts
                data={JSON.parse(JSON.stringify(scatterData))}
                getOption={(scatterData) => {
                    return {
                        animation: false,
                        tooltip: {
                            show: true,
                            enterable: true,
                            //alwaysShowContent: true,
                            borderWidth: 0,
                            padding: 0,
                            backgroundColor: 'none',
                            textStyle: {
                                fontWeight: 'normal'
                            },
                            extraCssText: 'transition:none;box-shadow:none;',
                            position: function(point, params, dom, rect, size){
                                const {x, y, width, height} = rect;
                                const domSize = size.contentSize;
                                const viewSize = size.viewSize;
                                
                                let left = x + (width / 2) - (domSize[0] / 2);
                                let top = y - domSize[1] - 5;

                                if(left < 0){
                                    left = 0;
                                }
                                if(left + domSize[0] > viewSize[0]){
                                    left = viewSize[0] - domSize[0];
                                }

                                if(top < 0){
                                    top = y + height + 5;
                                }

                                return {left, top};
                            }
                        },
                        geo: {
                            left: 30,
                            top: 30,
                            //right: 0,
                            bottom: 30,
                            map: 'world',
                            roam: true,
                            scaleLimit: {
                                min: 1
                            },
                            selectedMode: 'single',
                            label:{
                                show: false
                            },
                            itemStyle:{
                                areaColor: 'rgba(0,0,0,0.4)',
                                borderColor: '#0586ab',
                                borderWidth: 1
                            },
                            emphasis: {
                                label:{
                                    show:false
                                },
                                itemStyle:{
                                    areaColor: 'rgba(0,0,0,0.4)'
                                }
                            },
                            select: {
                                label:{
                                    show:false
                                },
                                itemStyle:{
                                    areaColor: 'rgba(0,0,0,0.4)'
                                }
                            },
                            tooltip: {
                                formatter: function(){
                                    return ''
                                }
                            }
                        },
                        series: [{
                            type: 'scatter',
                            name: 'scatter',
                            coordinateSystem: 'geo',
                            symbol:'circle',
                            symbolSize: 12,
                            animation: false,
                            data: scatterData,
                            itemStyle: {
                                opacity: 1,
                                color: 'red',
                                areaColor: 'red'
                            },
                            select: {
                                itemStyle:{
                                    color: 'red',
                                    areaColor: 'red'
                                }
                            },
                            tooltip: {
                                show: true,
                                formatter: function(params){
                                    const {name, data: {stateColor, capacity, power, radiat}} = params;
                                    return `
                                        <div class="${styles.ecTootip}">
                                            <em class="${styles.ecTootipArrow}"></em>
                                            <div><i style="background:${stateColor};"></i>${name} (${capacity.value} ${capacity.unit})</div>
                                            <div><span>${power.name}:</span> ${power.value} ${power.unit}</div>
                                            <div><span>${radiat.name}:</span> ${radiat.value} ${radiat.unit}</div>
                                        </div>
                                    `;
                                }
                            }
                        }]
                    };
                }}
            /> : null
        }</div>
    }

    renderSummary(){
        const {state: {updateAlias, dynData}} = this.context;
        const sitesPoint = this.pointMap[CUS_FLAG.FARM_COUNT];
        const capacityPoint = this.pointMap[PROPS.CAPACITY];

        return <div className={styles.asideSummary}>
            <div>
                <span>{sitesPoint.name}</span>
                <span>{FixPointVal(dynData[getPointKey(sitesPoint, updateAlias)], sitesPoint, VALUES.SLOT)}</span>
            </div>
            <div>
                <span>{msg('capacity')}</span>
                <span>{FixPointVal(dynData[getPointKey(capacityPoint, updateAlias)], capacityPoint, VALUES.SLOT)}</span>
                <span>{capacityPoint.unit}</span>
            </div>
        </div>;
    }

    renderWave(){
        const {state: {updateAlias, dynData}} = this.context;

        const powerPoint = this.pointMap[PROPS.POWER];
        const capacityPoint = this.pointMap[PROPS.CAPACITY];
        const prodDayPoint = this.pointMap[CUS_FLAG.DAY_GENERATE];
        const co2DayPoint = this.pointMap[CUS_FLAG.DAY_CO2];

        let powerRatio = 0;
        const powerVal = dynData[getPointKey(powerPoint, updateAlias)];
        const capacityVal = dynData[getPointKey(capacityPoint, updateAlias)];
        if(NumberUtil.isFinite(powerVal) && NumberUtil.isFinite(capacityVal) && Number(capacityVal) !== 0){
            powerRatio = NumberUtil.divide(powerVal * 100, capacityVal, 1);
        }

        return <div className={styles.asideChart}>
            <div className={styles.chart1}>
                <div>
                    <div className={styles.asideChartContent}>
                        <div>{FixPointVal(powerVal, powerPoint, VALUES.SLOT)}</div>
                        <div>{powerPoint.unit}</div>
                        <div>{powerRatio}%</div>
                    </div>                    
                </div>
                <div className={styles.asideChartName}>{powerPoint.name}</div>
            </div>
            <div className={styles.chart2}>
                <div>
                    <div className={styles.wave}></div>
                    <div className={styles.asideChartContent}>
                        <div>{FixPointVal(dynData[getPointKey(prodDayPoint, updateAlias)], prodDayPoint, VALUES.SLOT)}</div>
                        <div>{prodDayPoint.unit}</div>
                    </div>
                </div>
                <div className={styles.asideChartName}>{prodDayPoint.name}</div>
            </div>
            <div className={styles.chart3}>
                <div>
                    <div className={styles.wave}></div>
                    <div className={styles.asideChartContent}>
                        <div>{FixPointVal(dynData[getPointKey(co2DayPoint, updateAlias)], co2DayPoint, VALUES.SLOT)}</div>
                        <div>{co2DayPoint.unit}</div>
                    </div>
                </div>
                <div className={styles.asideChartName}>{co2DayPoint.name}</div>
            </div>
        </div>;
    }

    renderPowerCurve(){
        const {state: {powerData}} = this.context;
        return <div>
            <div className={styles.asideSubTitle}>{msg('title1')}</div>
            <div className={styles.asideCurve}>
                <EchartsWrap 
                    data={JSON.parse(JSON.stringify(powerData))}
                    getOption={(powerData, ec) => {
                        const xAxisData = [];
                        const seriesData = powerData.map(ele => {
                            const { x, y } = ele;
                            xAxisData.push(x);
            
                            return {
                                value: y !== '' ? Number(y) : '',
                                unit: 'kW'
                            };
                        });

                        return {
                            textStyle: {
                                color: theme.chartTextColor,
                                fontWeight: 'normal'
                            },
                            grid: {
                                top: 30,
                                bottom: 0,
                                left: 2,
                                right: 2,
                                containLabel: true
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: "line",
                                    lineStyle: {
                                        color: theme.chartTooltipLine
                                    }
                                },
                                borderWidth: 0,                
                                backgroundColor: theme.chartTooltipBg,
                                borderColor: theme.chartTooltipBorder,
                                textStyle: {
                                    color: theme.white,
                                    fontWeight: 'normal',
                                    fontSize: 14
                                },
                                formatter: function(params){
                                    const {seriesName, name, value, data: {unit=''}} = params[0];
                                    return `<div>
                                        <div>${DateUtil.format(name, 0, DATE_FORMAT.DATE_TIME)}</div>
                                        <div>
                                            <span style="color:${theme.chartTooltipName};">${seriesName}:</span>
                                         ${value} ${unit}</div>
                                    </div>`;
                                }
                            },
                            xAxis: {
                                show: true,
                                type: 'category',
                                data: xAxisData,
                                axisLabel: {
                                    interval: 0,
                                    textStyle: {
                                        fontSize: 12,
                                        color: theme.chartTextColor2
                                    },
                                    formatter: function(date) {
                                        const hour = DateUtil.format(date, 0, 'HH');
                                        const minute = DateUtil.format(date, 0, 'mm');
                                        return Number(hour) % 2 === 0 && Number(minute) === 0 ? hour : '';
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: [{
                                type: 'value',
                                name: 'kW',
                                nameTextStyle: {
                                    color: theme.chartTextColor2,
                                    align: 'left'
                                },
                                axisLabel: {
                                    textStyle: {
                                        fontSize: 12,
                                        color: theme.chartTextColor2
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: theme.chartYaxisSplitColor2
                                    }
                                }
                            }],
                            series: [{
                                name: msg('power'),
                                type: 'line',
                                smooth: true,
                                showSymbol: false,
                                itemStyle: {
                                    color: theme.white
                                },
                                lineStyle: {
                                    width: 3,
                                    color: {
                                        type: 'linear',
                                        x: 0,
                                        y: 0,
                                        x2: 0,
                                        y2: 1,
                                        colorStops: [{
                                            offset: 0,
                                            color: theme.chartAreaColor
                                        }, {
                                            offset: 1,
                                            color: theme.chartAreaColor2
                                        }],
                                        globalCoord: false
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
                                            offset: 0,
                                            color: theme.chartAreaColor3
                                        }, {
                                            offset: 1,
                                            color: theme.chartAreaColor4
                                        }],
                                        globalCoord: false
                                    }
                                },
                                data: seriesData
                            }],
                            legend: {
                                show: false
                            }
                        };
                    }}
                />
            </div>            
        </div>;
    }

    renderProduction(){
        const {state: {prodData}} = this.context;
        const unit = 'MWh';

        return <div>
            <div className={styles.asideSubTitle}>{msg('title2')}</div>
            <div className={styles.asideCurve}>
                <EchartsWrap 
                    data={JSON.parse(JSON.stringify(prodData))}
                    getOption={(prodData, ec) => {
                        const xAxisData = [];
                        const seriesData = prodData.map(ele => {
                            const { x, y } = ele;
                            xAxisData.push(x);
            
                            return {
                                value: y !== '' ? NumberUtil.multiply(Number(y), 1e-3, 2) : '',
                                unit: unit
                            };
                        });

                        return {
                            textStyle: {
                                color: theme.chartTextColor,
                                fontWeight: 'normal'
                            },
                            grid: {
                                top: 30,
                                bottom: 0,
                                left: 2,
                                right: 2,
                                containLabel: true
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'line',
                                    lineStyle: {
                                        color: theme.chartTooltipLine
                                    }
                                },
                                borderWidth: 0,                
                                backgroundColor: theme.chartTooltipBg,
                                borderColor: theme.chartTooltipBorder,
                                textStyle: {
                                    color: theme.white,
                                    fontWeight: 'normal',
                                    fontSize: 14
                                },
                                formatter: function(params){
                                    const {seriesName, name, value, data: {unit=''}} = params[0];
                                    return `<div>
                                        <div>${DateUtil.format(name, 0, DATE_FORMAT.DATE)}</div>
                                        <div>
                                            <span style="color:${theme.chartTooltipName};">${seriesName}:</span>
                                            ${value} ${unit}</div>
                                    </div>`;
                                }
                            },
                            xAxis: {
                                show: true,
                                type: 'category',
                                data: xAxisData,
                                axisLabel: {
                                    interval: 0,
                                    textStyle: {
                                        fontSize: 12,
                                        color: theme.chartTextColor2
                                    },
                                    formatter: function(date) {
                                        return DateUtil.format(date, 0, DATE_FORMAT.MONTH_DAY);
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: [{
                                type: 'value',
                                name: unit,
                                nameTextStyle: {
                                    color: theme.chartTextColor2,
                                    align: 'left'
                                },
                                axisLabel: {
                                    textStyle: {
                                        fontSize: 12,
                                        color: theme.chartTextColor2
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: theme.chartYaxisSplitColor2
                                    }
                                }
                            }],
                            series: [{
                                name: msg('production'),
                                type: 'bar',
                                smooth: true,
                                showSymbol: false,
                                barWidth: 17,
                                itemStyle: {
                                    borderRadius: [2, 2, 0, 0],
                                    color: {
                                        type: 'linear',
                                        x: 0,
                                        y: 0,
                                        x2: 0,
                                        y2: 1,
                                        colorStops: [{
                                            offset: 0,
                                            color: theme.chartBarColor2
                                        }, {
                                            offset: 1,
                                            color: theme.chartBarColor3
                                        }],
                                        globalCoord: false
                                    }
                                },
                                data: seriesData
                            }],
                            legend: {
                                show: false
                            }
                        };
                    }}
                />
            </div>            
        </div>;
    }

    renderTopFive(){
        const {state: {solarFacs, dynData}} = this.context;
        const hourPoint = this.pointMap[CUS_FLAG.FARM_HOUR];
        let maxes = [];
        let tops = solarFacs.map(fac => {
            const {alias, display_name} = fac;
            const key = getPointKey(hourPoint, `${alias}.${POINT_TABLE.FARM_STAT}`);
            let val = dynData[key];
            if(NumberUtil.isFinite(val)){
                val = Number(val);
                maxes.push(val);
            }
            return {
                name: display_name,
                value: val
            };
        });

        tops = tops.filter(d => NumberUtil.isFinite(d.value));
        tops.sort((a, b) => b.value - a.value);
        maxes = Math.max.apply(this, maxes);

        return <div>
            <div className={styles.asideSubTitle}>{msg('title3')}</div>
            {
                tops.slice(0, 5).map((top, ind) => (
                    <div key={ind} className={`${styles.asideTopSite} top${ind+1}`}>
                        <div>{ind+1}</div>
                        <div>{top.name}</div>
                        <div>
                            <div style={{
                                width: (top.value * 100 / maxes) + '%'
                            }}></div>
                            <div>{top.value}{hourPoint.unit}</div>
                        </div>
                    </div>
                ))
            }
        </div>;
    }

    renderReduction(){
        const {state: {updateAlias, dynData}} = this.context;
        const co2Point = this.pointMap[CUS_FLAG.CO2];

        return <div>
            <div className={styles.asideSubTitle}>{msg('title4')}</div>
            <div className={styles.asideOther}>
                <div>
                    <div>{co2Point.name}</div>
                    <div>
                        <span>{FixPointVal(dynData[getPointKey(co2Point, updateAlias)], co2Point, VALUES.SLOT)}</span>
                        <span>{co2Point.unit}</span>
                    </div>
                </div>
            </div>
        </div>;
    }

    renderSimple(){
        const {state: {updateAlias, dynData}} = this.context;
        const prodDayPoint = this.pointMap[CUS_FLAG.DAY_GENERATE];
        const profitDayPoint = this.pointMap[CUS_FLAG.PROFIT];

        return <div className={styles.asideSimpleContent}>
            {
                [prodDayPoint, profitDayPoint].map((p, ind) => {
                    return <div key={ind}>
                        <div>{FixPointVal(dynData[getPointKey(p, updateAlias)], p, VALUES.SLOT)}</div>
                        <div>{p.name}</div>
                        <div>({p.unit})</div>
                    </div>
                })
            }            
        </div>;
    }

    renderFolder(){
        return <div 
            className={styles.folder}
            onClick={() => {
                this.context.dispatch({collapse: !this.context.state.collapse});
            }}
        ></div>;
    }

    renderNav(){
        const {state: {currentAlias, dynData}} = this.context;
        let indicesPoints = [
            CUS_FLAG.FARM_COUNT, 
            PROPS.CAPACITY,
            PROPS.GENERATE
        ].map(k => this.pointMap[k]);

        return <div className={styles.nav}>
            <div>
                <div onClick={() => {
                    toSiteList(this.context.state.rootAlias);
                }}>{msg('toSites')}</div>
            </div>
            {
                indicesPoints.map((point, ind) => {
                    const {name, unit} = point;
                    const key = getPointKey(point, currentAlias);

                    return <div key={ind} className={styles.navItem}>
                        <span>{name}:</span>
                        <span>{FixPointVal(dynData[key], point, VALUES.SLOT)}</span>
                        <span>{unit}</span>
                    </div>;
                })
            }
            <em className={styles.fullScreen} onClick={() => {
                ScadaCfg.fullScreen();
            }}></em>
        </div>;
    }

    render(){
        const {state: { collapse, updateName }} = this.context;
        return <div className={styles.container}>
            {this.renderNav()}
            <div className={styles.main}>
                {this.renderMap()}
                <div className={`${styles.aside} ${collapse ? styles.collapse : ''}`}>
                    {this.renderFolder()}
                    <div>
                        <div className={styles.asideHead}>{updateName}</div>
                        {this.renderSummary()}
                        {this.renderWave()}
                        {this.renderPowerCurve()}
                        {this.renderProduction()}
                        {this.renderTopFive()}
                        {this.renderReduction()}
                    </div>
                </div>
                <div className={`${styles.asideSimple} ${!collapse ? styles.collapse : ''}`}>
                    {this.renderFolder()}
                    <div>                        
                        <div className={styles.asideHead}>{updateName}</div>
                        {this.renderSimple()}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default CenterIndex;