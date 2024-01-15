import '../common/css/app.scss';

import * as React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { SwitchTransition, CSSTransition } from "react-transition-group";
import _ from 'lodash';
import ReactComponentRenderer from 'ReactComponentRenderer';
import ScadaCfg, { TimerInterval, PowerHisTimerInterval } from '../common/const-scada';
import { SITE_TYPE } from '../common/constants';
import { NumberUtil, uuid } from '../common/utils';
import BodyTooltip from '../components/BodyTooltip';
import EchartsWrap from '../components/EchartsWrap';
import { _dao } from './dao';
import {
    msg, DOMAIN, STATUS, POINTS_CENTER, POINTS_FAC,
    getWtgSvg, getInvtSvg, HENAN_BOUNDARY_WGS84,
    getKey, FixVal, POINT_FLAG, POINTS_MAP, HistoryCurveReq, HistoryCurveModel
} from './constant';
import styles from './style.mscss';

// 坐标配置从url获取
let hashs = [];
if(window && window.location && window.location.hash){
    let hash = window.location.hash;
    hash = hash.replace(/^#/, '');
    if(/^@(\-?\d+(\.\d+)?)\,(\-?\d+(\.\d+)?)(\,(\-?\d+(\.\d+)?)\,(\-?\d+(\.\d+)?))?$/.test(hash)){
        hash = hash.replace(/^@/, '');
        hash = hash.split(',');
        for(let i = 0; i < hash.length / 2; i++){
            hashs.push(hash.slice(i*2, i*2 + 2).map(h => Number(h)));
        }
    }
}

let rootAlias = ScadaCfg.getCurNodeAlias();
let rootWindFacs = [{ "display_name": "洺河风电场", "alias": "GTSA","lon": "115°26'22.919\"","lat": "33°42'7.92\"", order_no: '1'
}, {"display_name": "云龙风电场", "alias": "TEST04", "lon": "114°55'41.879\"", "lat": "33°16'44.76\"", order_no: '2'
}, { "display_name": "银城风电场", "alias": "TEST05", "lon": "114°37'46.92\"", "lat": "34°6'59.759\"", order_no: '4' 
}, { "display_name": "晨风风电场", "alias": "TEST06", "lon": "116°11'20.759\"", "lat": "33°55'30.36\"", order_no: '3' 
}, { "display_name": "垌沟风电场", "alias": "TEST07", "lon": "113°17'25.439\"", "lat": "34°6'46.08\"", order_no: '5' 
}/* , { "display_name": "风场站08", "alias": "TEST08", "lon": "113.632040", "lat": "34.762476", order_no: '0' 
}, { "display_name": "风场站09", "alias": "TEST09", "lon": "116.442428", "lat": "33.924497", order_no: '0' 
}, { "display_name": "风场站10", "alias": "TEST10", "lon": "110.361832", "lat": "34.516374", order_no: '0' 
}, { "display_name": "风场站01", "alias": "TEST01", "lon": "115.750402", "lat": "33.787694", order_no: '0' 
}, { "display_name": "风场站02", "alias": "TEST02", "lon": "0", "lat": "0", order_no: '0' },{ "display_name": "风场站T", "alias": "TEST03","lon": "111.365175","lat": "34.271714", order_no: '0'
}, {"display_name": "风场站T1", "alias": "TEST04", "lon": "112.335146", "lat": "34.620658", order_no: '0'
}, { "display_name": "风场站T0", "alias": "TEST05", "lon": "113.280926", "lat": "34.711411", order_no: '0' 
}, { "display_name": "风场站T1", "alias": "TEST06", "lon": "115.330117", "lat": "33.773219", order_no: '0' 
}, { "display_name": "风场站T2", "alias": "TEST07", "lon": "115.642567", "lat": "34.427422", order_no: '0' 
}, { "display_name": "风场站T3", "alias": "TEST08", "lon": "113.632040", "lat": "34.762476", order_no: '0' 
} */];

if (process.env.NODE_ENV === 'development') {
    rootAlias = 'USCADA.Farm.Statistics';
}

class HomePage extends React.PureComponent {

    static defaultProps = {
        onClick: () => {},
        onMonitorClick: () => {}
    }

    constructor(props) {
        super(props);

        this.root = rootAlias;
        this.rootFac = rootAlias.split('.')[0];
        this.gridRows = 8;

        this.timerTip = null;
        this.timerDyn = null;
        this.timerCurve = null;
        this.timerPlayWind = null;
        this.timerPlaySolar = null;
        this.delayPlay = 15000; // ms

        this.state = {
            mounted: false,

            windFacs: [],
            solarFacs: [],

            /**
             * @example
             * {'alias': {}}
             */
            data: {},

            curveData: [],

            windPage: 1,
            solarPage: 1,

            tipTarget: null,
            tipDomain: '',
            tipAlias: ''
        };
    }

    WGS84_TO_DIGIT(wgs) {
        if (!wgs) return 0;
        if (!isNaN(wgs)) return Number(wgs);

        let deg = 0, min = 0, sec = 0;
        const matchs = /((\d+)\°)?((\d+)\')?((\d+)\")?/.exec(wgs);
        if (matchs) {
            deg = matchs[2] || 0;
            min = matchs[4] || 0;
            sec = matchs[6] || 0;
        }

        let ret = Number(deg) + Number((min / 60)) + Number((sec / 3600));
        ret = Number(ret).toFixed(6);
        ret = Number(ret);

        return ret;
    }

    WGS84_TO_WEB_MERCATOR(wgsLonDigit, wgsLatDigit) {
        let x = wgsLonDigit * 20037508.34 / 180;
        let y = Math.log(Math.tan((90 + wgsLatDigit) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return { x, y };
    }

    position(wgsLon, wgsLat) {
        let westNorth = HENAN_BOUNDARY_WGS84[0].map(wgs => this.WGS84_TO_DIGIT(wgs));
        let eastSouth = HENAN_BOUNDARY_WGS84[1].map(wgs => this.WGS84_TO_DIGIT(wgs));
        westNorth = this.WGS84_TO_WEB_MERCATOR.apply(this, westNorth);
        eastSouth = this.WGS84_TO_WEB_MERCATOR.apply(this, eastSouth);

        const coor = this.WGS84_TO_WEB_MERCATOR.apply(
            this, [wgsLon, wgsLat].map(wgs => this.WGS84_TO_DIGIT(wgs))
        );

        return {
            left: ((coor.x - westNorth.x) * 100 / (eastSouth.x - westNorth.x)) + '%',
            top: ((coor.y - westNorth.y) * 100 / (eastSouth.y - westNorth.y)) + '%'
        };
    }

    init() {
        if(!this.root)return;

        ScadaCfg.getAllFac(this.root).then(facs => {
            let windFacs = facs.filter(f => String(f.fac_type) === String(SITE_TYPE.WIND));
            let solarFacs = facs.filter(f => String(f.fac_type) === String(SITE_TYPE.SOLAR));

            if (process.env.NODE_ENV === 'development') {
                windFacs = rootWindFacs;
                //solarFacs = rootWindFacs;
            }

            // 现场需要按一定顺序排列, 根据节点容器表里序号升序排列
            windFacs.sort((a, b) => {
                let no1 = a.order_no || 0, no2 = b.order_no || 0;
                return Number(no1) - Number(no2);
            });
            solarFacs.sort((a, b) => {
                let no1 = a.order_no || 0, no2 = b.order_no || 0;
                return Number(no1) - Number(no2);
            });

            // 现场不想改场站信息表名称,只能定制去除
            windFacs = windFacs.map(fac => {
                fac.display_name = (fac.display_name || '').replace(/风电场/g, '');
                return fac;
            });

            this.setState({
                windFacs,
                solarFacs
            }, () => {
                this.startCarousel();
                this.fetchDynData();
                this.fetchCurveData();
            });            
        });
    }

    startCarousel(){
        if(this.state.windFacs.length > this.gridRows){
            const windMaxPage = Math.ceil(this.state.windFacs.length / this.gridRows);
            const windPlay = () => {
                let page = this.state.windPage + 1;
                if(page > windMaxPage){
                    page = 1;
                }
                this.setState({windPage: page}, () => {
                    clearTimeout(this.timerPlayWind);
                    this.timerPlayWind = setTimeout(windPlay, this.delayPlay);
                });
            }
            this.timerPlayWind = setTimeout(windPlay, this.delayPlay);
        }

        if(this.state.solarFacs.length > this.gridRows){
            const solarMaxPage = Math.ceil(this.state.solarFacs.length / this.gridRows);
            const solarPlay = () => {
                let page = this.state.solarPage + 1;
                if(page > solarMaxPage){
                    page = 1;
                }
                this.setState({solarPage: page}, () => {
                    clearTimeout(this.timerPlaySolar);
                    this.timerPlaySolar = setTimeout(solarPlay, this.delayPlay);
                });
            }
            this.timerPlaySolar = setTimeout(solarPlay, this.delayPlay);
        }
    }

    getDyn(nodeAlias, point, defaultVal=0){
        let key = getKey(point, nodeAlias);
        if(key in this.state.data){
            return this.state.data[key];
        }
        return defaultVal;
    }

    getFixDyn(nodeAlias, point, defaultVal=0){
        return FixVal(this.state.data[getKey(point, nodeAlias)], point, defaultVal);
    }

    getDisp(nodeAlias, point, defaultVal=0){
        const key = getKey(point, nodeAlias);
        if(`#${key}` in this.state.data){
            return this.state.data[`#${key}`];
        }
        return this.getFixDyn(nodeAlias, point, defaultVal);
    }

    async fetchDynData() {
        let rootFac = this.rootFac;
        let points = POINTS_CENTER.filter(p => p[POINT_FLAG._FLAG_] !== POINT_FLAG.CURVE).map(p => ({
            id: '',
            key: getKey(p, rootFac),
            decimal: p.decimal || 0
        }));

        this.state.windFacs.forEach(f => {
            const { alias } = f;
            points = points.concat(POINTS_FAC
            .filter(p => [
                POINT_FLAG.FAC_SOLAR_ANNUAL, 
                POINT_FLAG.FAC_SOLAR_RADIAT,
                POINT_FLAG.FAC_SOLAR_CAPACITY,
                POINT_FLAG.FAC_SOLAR_COUNT
            ].indexOf(p[POINT_FLAG._FLAG_]) === -1)
            .map(p => ({
                id: '',
                key: getKey(p, alias),
                decimal: p.decimal || 0
            })));
        });

        this.state.solarFacs.forEach(f => {
            const { alias } = f;
            points = points.concat(POINTS_FAC
            .filter(p => [
                POINT_FLAG.FAC_WIND_ANNUAL, 
                POINT_FLAG.FAC_WIND_SPEED,
                POINT_FLAG.FAC_WIND_CAPACITY,
                POINT_FLAG.FAC_WIND_COUNT
            ].indexOf(p[POINT_FLAG._FLAG_]) === -1)
            .map(p => ({
                id: '',
                key: getKey(p, alias),
                decimal: p.decimal || 0
            })));
        });

        if(points.length > 0){
            const res = await _dao.getDynData(points);

            if(String(res.code) === '10000'){
                
                // debug
                // res.data = res.data.map(d => {
                //     d.display_value = (Math.random() * 1).toFixed(2);
                //     if(d.key.indexOf('FarmSts') > -1){
                //         d.raw_value = 2;
                //     }
                //     return d;
                // });

                const data = {};
                // 遥信暂时用不到显示值
                res.data.forEach(d => {
                    // used to show detail desc
                    if('raw_value' in d){
                        data[`#${d.key}`] = d.display_value;
                    }
                    data[d.key] = NumberUtil.removeCommas('raw_value' in d ? d.raw_value : d.display_value);
                });
                this.setState({
                    data: Object.assign({}, this.state.data, data)
                });
            }
        }

        clearTimeout(this.timerDyn);
        this.timerDyn = null;
        this.timerDyn = setTimeout(this.fetchDynData.bind(this), TimerInterval);
    }

    async fetchCurveData() {
        let rootFac = this.rootFac;
        let point = POINTS_CENTER.find(p => p[POINT_FLAG._FLAG_] === POINT_FLAG.CURVE);
        let key = getKey(point, rootFac);
        let year = new Date().getFullYear();

        let req = Object.assign({}, HistoryCurveReq, {
            curve: [Object.assign({}, HistoryCurveModel, {
                key: key,
                decimal: point.decimal || 0,
                arith_type: 'subtract'
            })],
            start_time: `${year-1}-01-01 00:00:00`,
            end_time: `${year+1}-01-01 00:00:00`,
            interval_type: 3
        });

        const res = await _dao.getCurve(req);

        if(String(res.code) === '10000'){
            this.setState({
                curveData: res.data[0].Points.map(d => {
                    const {x, y} = d;
                    return FixVal(y, point);
                })
            });
        }

        clearTimeout(this.timerCurve);
        this.timerCurve = null;
        this.timerCurve = setTimeout(this.fetchCurveData.bind(this), PowerHisTimerInterval);
    }

    /**
     * 现场4x3的1920x1080屏幕, 保证每个模块和缝隙重合
     */
    resize() {
        const docHeight = document.documentElement.clientHeight;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const screeHeight = window.screen.height;

        const realDocHeight = Math.round(docHeight * devicePixelRatio);
        let topBarHeight = Math.ceil((screeHeight - realDocHeight) / devicePixelRatio);
        if(screeHeight - realDocHeight > 75 || topBarHeight < 0){
            topBarHeight = 0;
        }

        document.documentElement.style.setProperty('--barheight', topBarHeight + 'px');
    }

    componentDidMount() {
        this.init();

        // 使图片可以过渡
        // TODO Resource Timing API 监控
        const loadFinished = () => {
            if(document.readyState === 'complete'){
                setTimeout(() => {
                    this.setState({mounted: true});
                }, 2000);               
            }else{
                window.requestAnimationFrame(loadFinished);
            }            
        };
        loadFinished();

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
        clearTimeout(this.timerDyn);
        this.timerDyn = null;
        clearTimeout(this.timerCurve);
        this.timerCurve = null;
        clearTimeout(this.timerPlayWind);
        this.timerPlayWind = null;
        clearTimeout(this.timerPlaySolar);
        this.timerPlaySolar = null;
        clearTimeout(this.timerTip);
        this.timerTip = null;

        window.removeEventListener('resize', this.resize.bind(this));
    }

    renderLine() {
        return <i className={styles.hLine}><em></em></i>;
    }

    renderStat() {
        let total = POINTS_MAP[POINT_FLAG.LEFT_TOTAL];
        let wind = [POINTS_MAP[POINT_FLAG.LEFT_ONE], POINTS_MAP[POINT_FLAG.LEFT_ONE_POWER]];
        let solar = [POINTS_MAP[POINT_FLAG.LEFT_TWO], POINTS_MAP[POINT_FLAG.LEFT_TWO_POWER]];

        let totalVal = this.getFixDyn(this.rootFac, total);
        let totalValArr = String(totalVal).split('');

        const r = (temp) => {
            return temp.map((p, ind) => {
                const {name, unit} = p;
                const val = this.getFixDyn(this.rootFac, p);

                return <div key={ind}>
                    <div>{name}</div>
                    <div>
                        <span>{val}</span>
                        <span>{unit}</span>
                    </div>
                </div>;
            })
        };

        let valTotal = this.getDyn(this.rootFac, total);
        let valWind = this.getDyn(this.rootFac, POINTS_MAP[POINT_FLAG.LEFT_ONE_POWER]);
        let valSolar = this.getDyn(this.rootFac, POINTS_MAP[POINT_FLAG.LEFT_TWO_POWER]);

        let rationWind = 0;
        let rationSolar = 0;
        if(typeof valTotal !== 'undefined' 
            && valTotal !== null 
            && String(valTotal) !== '0'
            && valTotal !== ''){
            rationWind = NumberUtil.divide(NumberUtil.multiply(valWind, 100), valTotal, 0);
            rationSolar = NumberUtil.divide(NumberUtil.multiply(valSolar, 100), valTotal, 0);
        }

        return <div className={styles.stat}>
            <div>
                <span>{total.name}</span>
                {
                    totalValArr.map((v, ind) => {
                        let cls = styles.digit;
                        if(v === '.')cls = undefined;
                        return <span key={ind} className={cls}>{v}</span>;
                    })
                }
                <span>MW</span>
            </div>
            <div className={styles.statDetail}>
                <div>
                    {
                        r(wind)
                    }
                    <div>
                        <div>{msg('windContribute')}</div>
                        <div>
                            <span>{rationWind}</span>
                            <span>%</span>
                        </div>
                    </div>
                </div>
                <div>
                    {
                        r(solar)
                    }
                    <div>
                        <div>{msg('solarContribute')}</div>
                        <div>
                            <span>{rationSolar}</span>
                            <span>%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    renderChart() {
        return <div className={styles.chart}>
            <div>{msg('chart.title')}</div>
            <div>
                <EchartsWrap
                    resizeRedraw={true}
                    resizeDelay={100}
                    isClearOpt={false}
                    data={this.state.curveData}
                    getOption={(data, ec) => {
                        const scale = getComputedStyle(document.documentElement).getPropertyValue('--scale') || 1;
                        const size = (fontSize) => Math.floor(Number(fontSize.replace('px', '')) * (scale / 4));
                        return {
                            textStyle: {
                                fontSize: size('48px'),
                                fontFamily: 'Rajdhani-Medium'
                            },
                            grid: {
                                left: 0,
                                right: 0,
                                top: size('100px'),
                                bottom: size('60px'),
                                containLabel: true
                            },
                            tooltip: {
                                trigger: 'axis',
                                backgroundColor: 'rgba(0, 0, 0, .6)',
                                borderWidth: 0,
                                textStyle: {
                                    color: '#fff',
                                    fontSize: size('48px')
                                }
                            },
                            legend: {
                                bottom: 0,
                                padding: 0,
                                itemWidth: size('40px'),
                                itemHeight: size('40px'),
                                textStyle: {
                                    color: 'rgb(255, 255, 255, .6)',
                                    fontFamily: 'PingFangSC-Medium, Microsoft YaHei'
                                },
                                data: [msg('chart.monthPowerGen'), msg('chart.lastYearMonthPowerGen')]
                            },
                            xAxis: [{
                                axisTick: {
                                    show: false
                                },
                                type: 'category',
                                axisLabel: {
                                    fontSize: size('48px'),
                                    color: 'rgba(255, 255, 255, .5)'
                                },
                                data: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                            }],
                            yAxis: [{
                                name: '万kWh',
                                nameLocation: 'end',
                                nameGap: size('35px'),
                                nameTextStyle: {
                                    align: 'left',
                                    color: 'rgba(255, 255, 255, .5)'
                                },
                                type: 'value',
                                axisLabel: {
                                    fontSize: size('48px'),
                                    color: 'rgba(255, 255, 255, .5)'
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: ['rgba(216, 216, 216, .4)'],
                                        type: 'dashed'
                                    }
                                }
                            }],
                            series: [
                                {
                                    name: msg('chart.monthPowerGen'),
                                    type: 'bar',
                                    barGap: '100%',
                                    barWidth: size('20px'),
                                    itemStyle: {
                                        borderRadius: [size('10px'), size('10px'), 0, 0],
                                        shadowBlur: size('10px'),
                                        shadowColor: 'rgba(16, 159, 255, .4)',
                                        color: {
                                            type: 'linear',
                                            x: 0,
                                            y: 0,
                                            x2: 0,
                                            y2: 1,
                                            colorStops: [{
                                                offset: 0, color: '#27B2FF' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#0D3C85' // 100% 处的颜色
                                            }],
                                            global: false // 缺省为 false
                                        }
                                    },
                                    data: data.slice(data.length/2)
                                },
                                {
                                    name: msg('chart.lastYearMonthPowerGen'),
                                    type: 'bar',
                                    barGap: '100%',
                                    barWidth: size('20px'),
                                    itemStyle: {
                                        borderRadius: [size('10px'), size('10px'), 0, 0],
                                        shadowBlur: size('10px'),
                                        shadowColor: 'rgba(9, 194, 200, .4)',
                                        color: {
                                            type: 'linear',
                                            x: 0,
                                            y: 0,
                                            x2: 0,
                                            y2: 1,
                                            colorStops: [{
                                                offset: 0, color: '#31FFD4' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#04516B' // 100% 处的颜色
                                            }],
                                            global: false // 缺省为 false
                                        }
                                    },
                                    data: data.slice(0, data.length/2)
                                }
                            ]
                        };
                    }}
                />
            </div>
        </div>
    }

    renderFlag(alias='', name = '', domain, status, reactKey = 0) {
        let className = '';
        switch (status) {
            case STATUS.RUN:
                className = styles.flagRun;
                break;
            case STATUS.STANDBY:
                className = styles.flagStandby;
                break;
            case STATUS.FAULT:
                className = styles.flagFault;
                break;
            case STATUS.MAINTAIN:
                className = styles.flagMaintain;
                break;
            case STATUS.NO_CONNECT:
                className = styles.flagNoconnect;
                break;
            default:
                break;
        }

        switch (domain) {
            case DOMAIN.SOLAR:
                className = `${className || ''} ${styles.flagSolar}`;
                break;
            case DOMAIN.WIND:
            default:
                className = `${className || ''} ${styles.flagWind}`;
                break;
        }

        return <div className={`${styles.flagContainer} ${className}`} key={reactKey}>
            <div>
                <div 
                    className={styles.flag} 
                    onMouseEnter={this.showFlagTip.bind(this, alias, domain)} 
                    onMouseLeave={this.hideFlagTip.bind(this, alias, domain)}
                    onClick={this.props.onClick.bind(null, alias, domain)}
                >
                    <div></div>
                    <i></i>
                </div>
            </div>
            <div>
                <div className={styles.waterWave}>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div>{name}</div>
        </div>
    }

    showFlagTip(alias, domain, e){
        clearTimeout(this.timerTip);

        let target = e.currentTarget;
        this.timerTip = setTimeout(() => {
            this.setState({
                tipTarget: target,
                tipDomain: domain,
                tipAlias: alias
            }, () => {
                this.forceUpdate();
            });
        }, 200);        
    }

    hideFlagTip(alias, domain, e){
        clearTimeout(this.timerTip);
        this.timerTip = null;

        this.setState({
            tipTarget: null,
            tipDomain: '',
            tipAlias: ''
        });
    }

    generateTipContent(){
        const {tipDomain, tipAlias} = this.state;
        if(!tipDomain || !tipAlias)return null;
        
        let points = [];
        switch(tipDomain){
            case DOMAIN.WIND: {
                points = [
                    POINTS_MAP[POINT_FLAG.FAC_STATUS], 
                    POINTS_MAP[POINT_FLAG.FAC_WIND_CAPACITY],
                    POINTS_MAP[POINT_FLAG.FAC_WIND_COUNT],
                    POINTS_MAP[POINT_FLAG.FAC_WIND_SPEED],
                    POINTS_MAP[POINT_FLAG.FAC_POWER],
                    POINTS_MAP[POINT_FLAG.FAC_DAY_POWER]
                ];
                break;
            }
            case DOMAIN.SOLAR: {
                points = [
                    POINTS_MAP[POINT_FLAG.FAC_STATUS], 
                    POINTS_MAP[POINT_FLAG.FAC_SOLAR_CAPACITY],
                    POINTS_MAP[POINT_FLAG.FAC_SOLAR_COUNT],
                    POINTS_MAP[POINT_FLAG.FAC_SOLAR_RADIAT],
                    POINTS_MAP[POINT_FLAG.FAC_POWER],
                    POINTS_MAP[POINT_FLAG.FAC_DAY_POWER]
                ];
                break;
            }
        }

        return <div className={styles.tooltipContent}>
            {points.map((p, ind) => {
                return <div key={ind}>
                    <span>{`${p.name}: `}</span>
                    <span>
                        <span>{this.getDisp(tipAlias, p)}</span>
                        <span>{p.unit || ''}</span>
                    </span>
                </div>;
            })}
        </div>;
    }

    renderStatus(domain, status, statusNum = 0, reactKey = 0) {
        let svgColor = '';
        let statusDescKey = '';
        let statusDesc = '';

        let className = '';
        switch (status) {
            case STATUS.RUN:
                className = styles.statusRun;
                svgColor = styles.statusRunColor;
                statusDescKey = 'run';
                break;
            case STATUS.STANDBY:
                className = styles.statusStandby;
                svgColor = styles.statusStandbyColor;
                statusDescKey = 'standby';
                break;
            case STATUS.FAULT:
                className = styles.statusFault;
                svgColor = styles.statusFaultColor;
                statusDescKey = 'fault';
                break;
            case STATUS.MAINTAIN:
                className = styles.statusMaintain;
                svgColor = styles.statusMaintainColor;
                statusDescKey = 'maintain';
                break;
            case STATUS.NO_CONNECT:
                className = styles.statusNoconnect;
                svgColor = styles.statusNoconnectColor;
                statusDescKey = 'noConnect';
                break;
            default:
                break;
        }

        let svgStr = '';
        switch (domain) {
            case DOMAIN.SOLAR:
                svgStr = getInvtSvg(svgColor);
                statusDesc = msg(`solarStatus.${statusDescKey}`);
                break;
            case DOMAIN.WIND:
            default:
                svgStr = getWtgSvg(svgColor);
                statusDesc = msg(`windStatus.${statusDescKey}`);
                break;
        }

        return <div className={`${styles.status} ${className}`} key={reactKey}>
            <div className={styles.statusCount}>
                <div dangerouslySetInnerHTML={{ __html: svgStr }}></div>
                <div>{statusNum}</div>
            </div>
            <div className={styles.statusDesc}>
                <span>{statusDesc}</span>
            </div>
        </div>;
    }

    renderMapBottom(domain){
        let name = '';
        let total = 0;
        let list = [];

        switch(domain){
            case DOMAIN.WIND: {
                name = msg('countWtg');
                let temp = {};
                POINTS_MAP[POINT_FLAG.MAP_BOTTOM_WIND].map(p => {
                    temp[p[POINT_FLAG._STATUS_]] = p;
                })
                list = [
                    STATUS.RUN, STATUS.STANDBY, STATUS.FAULT,
                    STATUS.MAINTAIN, STATUS.NO_CONNECT
                ].map(k => temp[k]);
                break;
            }                
            case DOMAIN.SOLAR: {
                name = msg('countInvt');
                let temp = {};
                POINTS_MAP[POINT_FLAG.MAP_BOTTOM_SOLAR].map(p => {
                    temp[p[POINT_FLAG._STATUS_]] = p;
                })
                list = [
                    STATUS.RUN, STATUS.FAULT,
                    STATUS.MAINTAIN, STATUS.NO_CONNECT
                ].map(k => temp[k]);
                break;
            }
        }

        total = list.reduce((a, b) => {
            const count1 = typeof a === 'number' ? a : this.getFixDyn(this.rootFac, a);
            const count2 = this.getFixDyn(this.rootFac, b);
            return Number(count1) + Number(count2);
        }, 0)

        return <div>
            <div>
                <span>{name}</span>
                <span>{total}</span>
            </div>
            <div>{
                list.map((p, ind) => {
                    const status = p[POINT_FLAG._STATUS_];
                    return this.renderStatus(domain, status, this.getFixDyn(this.rootFac, p), ind);
                })
            }</div>
        </div>;
    }

    renderOther(name, otherClass = '') {
        return <div className={`${styles.mapOtherContainer}`}>
            <div className={`${styles.mapOther} ${otherClass}`}>
                <div>{name}</div>
                <i></i>
            </div>
            <div>
                <div className={styles.waterWave}>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    }

    getGridColumn(type){
        const toList = (param) => {
            if(!Array.isArray(param)) return [param];
            return param;
        };
        const nameIndex = {
            name: msg('grid.site'),
            index: 'display_name',
            unit: ''
        };
        const contribute = {
            name: msg('grid.contribute'),
            index: 'contribute',
            unit: '%'
        };

        let columns = [];
        switch(type){
            case 'wind1': {
                const power = POINTS_MAP[POINT_FLAG.FAC_POWER];
                const theoryPower = POINTS_MAP[POINT_FLAG.FAC_THEORY_POWER];
                const wind1 = POINTS_MAP[POINT_FLAG.FAC_WIND_SPEED];
                columns = [nameIndex].concat(toList(wind1), power, theoryPower, [contribute]);
                break;
            }
            case 'solar1': {
                const power = POINTS_MAP[POINT_FLAG.FAC_POWER];
                const theoryPower = POINTS_MAP[POINT_FLAG.FAC_THEORY_POWER];
                const solar1 = POINTS_MAP[POINT_FLAG.FAC_SOLAR_RADIAT];
                columns = [nameIndex].concat(toList(solar1), power, theoryPower, [contribute]);
                break;
            }
            case 'wind2': {
                const dayPower = POINTS_MAP[POINT_FLAG.FAC_DAY_POWER];
                const annual = POINTS_MAP[POINT_FLAG.FAC_WIND_ANNUAL];
                const fac_grid2 = POINTS_MAP[POINT_FLAG.FAC_GRID2];
                columns = [nameIndex].concat(dayPower, toList(fac_grid2), annual);
                break;
            }
            case 'solar2': {
                const dayPower = POINTS_MAP[POINT_FLAG.FAC_DAY_POWER];
                const annual = POINTS_MAP[POINT_FLAG.FAC_SOLAR_ANNUAL];
                const fac_grid2 = POINTS_MAP[POINT_FLAG.FAC_GRID2];
                columns = [nameIndex].concat(dayPower, toList(fac_grid2), annual);
                break;
            }
        }

        return columns.map(c => {
            if('alias' in c && 'fieldNo' in c){
                c.index = `${c.alias}:${c.fieldNo}`;
            }
            return c;
        });
    }

    getGridData(columns, fac){
        const {display_name, alias: facAlias} = fac;
        let data = {};
        columns.map(p => {
            const {index} = p;
            switch(index){
                case 'display_name':
                    data[index] = display_name;
                    break;
                case 'contribute':
                    let contribute = 0;
                    const power = this.getDyn(facAlias, POINTS_MAP[POINT_FLAG.FAC_POWER]) || 0;
                    const theoryPower = this.getDyn(facAlias, POINTS_MAP[POINT_FLAG.FAC_THEORY_POWER]) || 0;
                    if(!isNaN(theoryPower) && Number(theoryPower) !== 0){
                        contribute = NumberUtil.divide(Number(power) * 100, Number(theoryPower), 0)
                    }
                    data[index] = contribute;
                    break;
                default:
                    data[index] = this.getFixDyn(facAlias, p);
                    break;
            }
        });
        return data;
    }

    renderGridContent(title = '', columns = [], data = [], type, needStat = false, max) {
        let content;
        if (!Array.isArray(data) || data.length === 0) {
            content = <div className={styles.noData}>{msg('noData')}</div>
        } else {
            let cssTransitionKey = 1;
            let statCls;
            switch(type){
                case 'wind': 
                cssTransitionKey = this.state.windPage;
                statCls = styles.gridStat1;
                break;
                case 'solar': 
                cssTransitionKey = this.state.solarPage;
                statCls = styles.gridStat2;
                break;
            }

            content = <SwitchTransition mode={'out-in'}>
                <CSSTransition
                    key={cssTransitionKey}
                    addEndListener={(node, done) => {
                        node.addEventListener("transitionend", done, false);
                    }}
                    classNames="fade"
                >
                    <div className={styles.gridBodyData}>
                    {
                        data.map((d, ind, arr) => {
                            let divCls;
                            if(needStat && ind === arr.length - 1){
                                divCls = statCls;
                            }
                            return <div key={ind} className={divCls}>{
                                (!needStat && ind === arr.length - 1) ? null : 
                                // eslint-disable-next-line complexity
                                columns.filter(c => !c[POINT_FLAG._HIDE_]).map((c, ind1) => {
                                    let cellVal = d[c.index];
                                    if(typeof cellVal === 'undefined' || cellVal === null){
                                        cellVal = '';
                                    }
                                    let cell = [
                                        <span className={ind1 === 0 ? styles.gridName : styles.gridDigit}>{cellVal}</span>,
                                        <span className={styles.gridUnit}>{c.unit}</span>
                                    ];
                                    if((c[POINT_FLAG._FLAG_] === POINT_FLAG.FAC_WIND_ANNUAL || 
                                        c[POINT_FLAG._FLAG_] === POINT_FLAG.FAC_SOLAR_ANNUAL) && 
                                        cellVal && max && !isNaN(cellVal) && !isNaN(max)
                                    ){
                                        let iCls;
                                        let ratio = ((Number(cellVal) / Number(max)) * 100).toFixed(2);
                                        if(c[POINT_FLAG._FLAG_] === POINT_FLAG.FAC_SOLAR_ANNUAL){
                                            iCls = styles.yellow;
                                        }
                                        cell = [
                                            <div className={styles.gridVal}>{cell}</div>,
                                            <div className={styles.gridBar}><i className={iCls} style={{width: ratio + '%'}}></i></div>
                                        ];
                                    }
                                    return <div key={ind1}>{cell}</div>;
                                })
                            }</div>;
                        })
                    }
                    </div>
                </CSSTransition>
            </SwitchTransition>;
        }

        return <div className={styles.grid}>
            <div className={styles.gridHead}>
                <div className={styles.headline}>{title}</div>
                <div className={styles.gridTitle}>
                    {columns.filter(c => !c[POINT_FLAG._HIDE_]).map((c, ind) => {
                        return <div key={ind}>{c.name}</div>;
                    })}
                </div>
            </div>
            <div className={styles.gridBody}>{content}</div>
        </div>
    }

    // eslint-disable-next-line complexity
    renderGrid(type){
        let title = '';
        let columns = this.getGridColumn(type);
        let data = [];
        let needStat = false;
        let max;
        
        switch(type){
            case 'wind1': {
                title = msg('grid.windRealtime');
                const start = this.gridRows * (this.state.windPage - 1);
                const end = this.gridRows * this.state.windPage;
                data = this.state.windFacs.slice(start, end).map(fac => this.getGridData(columns, fac));
                if(data.length > 0){
                    data = data.concat(Array(1).fill({}));
                }
                
                break;
            }            
            case 'wind2': {
                title = msg('grid.windIndicators');
                const start = this.gridRows * (this.state.windPage - 1);
                const end = this.gridRows * this.state.windPage;
                const annualPoint = POINTS_MAP[POINT_FLAG.FAC_WIND_ANNUAL];
                const key = `${annualPoint.alias}:${annualPoint.fieldNo}`;

                data = this.state.windFacs.map(fac => this.getGridData(columns, fac));

                // 年完成率所以值, 取最大值计算百分比
                let annualPointVals = [];
                let stat = data.reduce((a, b) => {
                    let obj = {};
                    Object.keys(b).forEach(k => {
                        if(!isNaN(b[k])){
                            obj[k] = NumberUtil.add(Number(b[k] || 0), Number(a[k] || 0));
                            if(k === key){
                                annualPointVals.push(Number(b[k] || 0));
                            }                            
                        }else{
                            obj[k] = '';
                        }
                    });
                    return obj;
                }, {});
                if(annualPointVals.length > 0){
                    max = Math.max(...annualPointVals);
                }
                stat[key] = NumberUtil.divide(stat[key], this.state.windFacs.length, 0);
                stat.display_name = msg('grid.accumulative');
                data = data.slice(start, end);
                if(data.length > 0 ){
                    data = data.concat([stat]);
                }
                needStat = true;
                break;
            }
            case 'solar1': {
                title = msg('grid.solarRealtime');
                const start = this.gridRows * (this.state.solarPage - 1);
                const end = this.gridRows * this.state.solarPage;
                data = this.state.solarFacs.slice(start, end).map(fac => this.getGridData(columns, fac));
                if(data.length > 0 ){
                    data = data.concat(Array(1).fill({}));
                }
                break;
            }
            case 'solar2': {
                title = msg('grid.solarIndicators');
                const start = this.gridRows * (this.state.solarPage - 1);
                const end = this.gridRows * this.state.solarPage;
                const annualPoint = POINTS_MAP[POINT_FLAG.FAC_SOLAR_ANNUAL];
                const key = `${annualPoint.alias}:${annualPoint.fieldNo}`;

                data = this.state.solarFacs.map(fac => this.getGridData(columns, fac));

                // 年完成率所以值, 取最大值计算百分比
                let annualPointVals = [];
                let stat = data.reduce((a, b) => {
                    let obj = {};
                    Object.keys(b).forEach(k => {
                        if(!isNaN(b[k])){
                            obj[k] = NumberUtil.add(Number(b[k] || 0), Number(a[k] || 0));
                            if(k === key){
                                annualPointVals.push(Number(b[k] || 0));
                            }
                        }else{
                            obj[k] = '';
                        }
                    });
                    return obj;
                }, {});
                
                if(annualPointVals.length > 0){
                    max = Math.max(...annualPointVals);
                }
                stat[key] = NumberUtil.divide(stat[key], this.state.solarFacs.length, 0);
                stat.display_name = msg('grid.accumulative');
                data = data.slice(start, end);
                if(data.length > 0 ){
                    data = data.concat([stat]);
                }
                needStat = true;
                break;
            }
        }

        return this.renderGridContent(title, columns, data, type.replace(/\d/g, ''), needStat, max);
    }

    render() {
        const others = [{
            name: msg('monitorCenter'),
            wgs: [
                hashs[0] ? hashs[0][1] : '113°46\'5.636068582584\"', 
                hashs[0] ? hashs[0][0] : '34°46\'2.6668453245599997\"'
            ]
        }, {
            name: msg('maintenanceCenter'),
            wgs: [
                hashs[1] ? hashs[1][1] : '115°26\'43.433132171676\"', 
                hashs[1] ? hashs[1][0] : '33°42\'1.6145177594403\"'
            ],
            otherClass: styles.mapOther1
        }];

        const mapTop = [
            [ POINTS_MAP[POINT_FLAG.MAP_TOP_WIND1], POINTS_MAP[POINT_FLAG.MAP_TOP_SOLAR1] ],
            [ POINTS_MAP[POINT_FLAG.MAP_TOP_WIND2], POINTS_MAP[POINT_FLAG.MAP_TOP_SOLAR2] ]
        ];

        return (
            <div className={styles.mainContainer}>
                <div className={styles.container}>
                     <section>
                        <div>
                            <div className={styles.leftTop}>
                                {this.renderStat()}
                                {this.renderChart()}
                                {this.renderLine()}
                            </div>
                        </div>
                        <div>
                            <div>
                                {this.renderGrid('wind1')}
                                {this.renderGrid('wind2')}
                            </div>
                        </div>
                        <div>
                            <div>
                                {this.renderGrid('solar1')}
                                {this.renderGrid('solar2')}
                                {this.renderLine()}
                            </div>
                        </div>
                    </section>
                    <section>
                        <div className={styles.mapContainer}>
                            <div className={styles.mapHead}>{msg('title')}</div>
                            <div className={styles.mapMain}>
                                <div className={styles.map}>
                                    <div className={`${styles.mapImg} ${!this.state.mounted ? styles.mapImgInit : ''}`}><div></div></div>
                                    <div className={styles.mapData}>                                    
                                        {
                                            this.state.windFacs.map((fac, ind) => {
                                                const point = POINTS_MAP[POINT_FLAG.FAC_STATUS];
                                                const {display_name, alias, lon, lat} = fac;
                                                const status = this.getFixDyn(alias, point, 1);
                                                const pos = this.position(lon, lat);
                                                return <div key={ind} style={{
                                                    left: pos.left,
                                                    top: pos.top
                                                }}>
                                                    {this.renderFlag(alias, display_name, DOMAIN.WIND, Number(status), ind)}
                                                </div>;
                                            })
                                        }
                                        {
                                            this.state.solarFacs.map((fac, ind) => {
                                                const point = POINTS_MAP[POINT_FLAG.FAC_STATUS];
                                                const {display_name, alias, lon, lat} = fac;
                                                const status = this.getFixDyn(alias, point, 1);
                                                const pos = this.position(lon, lat);
                                                return <div key={ind} style={{
                                                    left: pos.left,
                                                    top: pos.top
                                                }}>
                                                    {this.renderFlag(alias, display_name, DOMAIN.SOLAR, Number(status), ind)}
                                                </div>;
                                            })
                                        }
                                        {
                                            others.map((o, ind) => {
                                                const { name, wgs, otherClass } = o;
                                                const pos = this.position(wgs[0], wgs[1]);
                                                return <div 
                                                    key={ind} 
                                                    style={{
                                                        left: pos.left,
                                                        top: pos.top
                                                    }} 
                                                    className={styles.mapOtherFlag}
                                                    onClick={(e) => {
                                                        if(ind === 0 && this.root){
                                                            // 节点跳转
                                                            this.props.onMonitorClick(this.root, e);
                                                        }
                                                    }}
                                                >
                                                    {this.renderOther(name, otherClass)}
                                                </div>;
                                            })
                                        }
                                        {[
                                            /* [34.271714, 111.365175],
                                            [34.620658, 112.335146],
                                            [34.711411, 113.280926],
                                            [33.773219, 115.330117],
                                            [34.427422, 115.642567],
                                            [34.762476, 113.632040],
                                            [33.924497, 116.442428],
                                            [34.516374, 110.361832],
                                            [33.787694, 115.750402] */
                                        ].map((coor, ind) => {
                                            const pos = this.position(coor[1], coor[0]);
                                            return <div key={ind} style={{
                                                left: pos.left,
                                                top: pos.top
                                            }}>
                                                {this.renderFlag('F01', '来安', DOMAIN.WIND, STATUS.NO_CONNECT, ind)}
                                            </div>;
                                        })}
                                    </div>
                                </div>
                                <div className={styles.mapTop}>
                                    {
                                        mapTop.map((g, ind) => {
                                            return <div key={ind}>
                                                {
                                                    g.map((p, index) => {
                                                        const {name, unit} = p;
                                                        return <div key={index}>
                                                            <span>{name}</span>
                                                            <span>{this.getFixDyn(this.rootFac, p)}</span>
                                                            <span>{unit}</span>
                                                        </div>;
                                                    })
                                                }
                                            </div>;
                                        })
                                    }
                                </div>
                                <div className={styles.mapBottom}>
                                    {this.renderMapBottom(DOMAIN.WIND)}
                                    {this.renderMapBottom(DOMAIN.SOLAR)}
                                </div>
                            </div>
                        </div>
                    </section>                
                </div>
                <BodyTooltip
                    show={!!this.state.tipTarget}
                    destroyOnHide={false}
                    target={this.state.tipTarget}
                    forceTarget={true}
                    className={styles.tooltip}
                    arrowClassName={styles.tooltipArrow}
                >{this.generateTipContent()}</BodyTooltip>
            </div>
        );
    }
}

let instance = {};
export const LoaderWidget = function (container, id, options = {}) {
    id = id || uuid();

    if (!instance[id]) {
        instance[id] = new ReactComponentRenderer(HomePage, container);
    }
    instance[id].setProps(options);

    return id;
}

export const setProps = function (id, options = {}) {
    if (!id || typeof id !== 'string' || !instance[id]) return;
    instance[id].setProps(options);

    if (window.___debug___) {
        console.log(instance);
    }
}

if (process.env.NODE_ENV === 'development') {
    ReactDOM.render(<HomePage />, document.querySelector('#center'));
}