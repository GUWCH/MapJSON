import * as React from 'react';
import _ from 'lodash';
import { Collection, AutoSizer } from 'react-virtualized';
import { TimerInterval, CommonHisTimerInterval, ListRealTimeCurveTimerInterval } from '@/common/const-scada';
import { navTo, PointEvt } from '@/common/util-scada';
import { LegalData, EmptyList, _dao, _pageDao, daoIsOk } from '@/common/dao';
import { BAY_TYPE, DEVICE_TYPE, DateUtil, BStools, isOtherDeviceType } from '@/common/utils';
import EnvLoading from '@/components/EnvLoading';
import { FetchModel, getPointKey } from '@/common/constants';
import { FontIcon, IconType } from 'Icon';
import { CARD_ATTR, CARD_ATTR_SMALL, MODE, reqDecimal, isReal, msgPrev, TOKEN_SIZE } from '../../constants';
import Card from '../Card';
import Alarm from '../Alarm/alarm';
import EllipsisToolTip from 'EnvEllipsisTooltip';
import { isDevelopment } from '@/common/constants';
import {SetToken, ShowToken} from '@/components_utils/Token';

import styles from './style.module.scss';

const MIN_MARGIN = 5;
const scrollBarWidth = BStools.getScrollWidth();

type TInfiniteLoaderProps = {
    width: number;
    height: number;
    isGroupByFac?: boolean;
    isMultiFac?: boolean;
    isGroupByFeeder?: boolean;
    verticalSiteName?: boolean;
    searchName?: string;
    topAlias?: string;
    deviceType?: string | number;
    siteType?: string;
    filters?: any[]
    filterPhaseAlias?: string;
    sortOrderNo?: boolean;
    svgFile?: string;
    mode?: string;
    largeCardHeight?: number;
    largeCardWidth?: number;
    quotaTextWidth?: number;
    models: any[];
    chartModels?: any[];
    widthResize: number;
    heightResize: number;
    stopRefresh?: boolean;
    showAlarm?: boolean;
    alarmLevel?: string;
    alarmType?: string;
    showToken?: boolean;
    tokenData?: any[];
    tokenSize: number;
    loadingContainer?: Element | null;
    flashByState?: string | string[];
    filterFacName?: boolean;

    /**注入的states */
    pageState: any;
    dataState: any;
};

type TInfiniteLoaderState = {
    data: any[];
    loading?: boolean;
    flashDevice: any[];
    flashStateDevice: any[];
    hasToken?: boolean;
};

class InfiniteLoader extends React.Component<TInfiniteLoaderProps, TInfiniteLoaderState> {

    static defaultProps = {
        width: 800,
        height: 600,

        // 是否以场站分组
        isGroupByFac: false,
        // 是否多场站以分组
        isMultiFac: false,
        // 按馈线分组显示
        isGroupByFeeder: false,
        // 分组时场站名称竖排
        verticalSiteName: false,

        searchName: '',

        // 以下是数据刷新参数
        topAlias: '',
        deviceType: 'wtg',
        siteType: '',
        filters: [],
        filterPhaseAlias: '',
        sortOrderNo: false,

        // 卡片对应svg文件
        svgFile: '',
        mode: MODE.LARGE_ICON,
        largeCardHeight: CARD_ATTR.height,
        largeCardWidth: CARD_ATTR.width,
        quotaTextWidth: undefined,
        // 动态字模型
        models: [],
        // 历史曲线模型
        chartModels: [],
        widthResize: 1,
        heightResize: 1,

        // 强制停止/恢复刷新
        stopRefresh: false,

        // 显示告警信息
        showAlarm: false,
        alarmLevel: '',
        alarmType: '',

        // 是否挂牌
        showToken: false,

        /**
         * @type {Object[]}
         * @property {String} alias
         * @property {String} tokenPath
         */
        tokenData: [],
        tokenSize: TOKEN_SIZE.min,

        loadingContainer: null,

        /**
         * 状态别名,如果有则会按状态变化进行闪烁
         * 原页面只有过滤时才生效
         * 第一次展示无需闪烁
         * 确认后无需闪烁
         */
        flashByState: undefined,

        // 是否需要过滤掉场站名称
        filterFacName: true
    }

    mouted: boolean;
    defaultNameKey: string;
    defaultAliasKey: string;
    defaultFarmNameKey: string;
    collectRef: any;
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
    sizedWidth?: number;
    sizedHeight?: number;
    firstDynReq: boolean;
    reRequest: boolean;
    timerIdDevice?: number;
    timerIdDyn?: number;
    timerHistroy?: number;
    timerRealCurve?: number;
    svgFile: {};
    svgAttr: {};
    svgText: string;
    svgModel: any[];
    allDevice: any[];
    deviceData: any[];
    deviceByFac: any;
    indexByFac: any;
    phaseFeederByFac: any;
    deviceCountByPhaseFeeder: any;
    indexByPhaseFeeder: any;
    deviceMap: any;
    dynData: any[]
    scrollStartTime: number;
    longPress: boolean;
    longPressTimeout?: number;
    alarmComponet: any;
    app?: string;
    drillDown?: boolean;

    constructor(props) {
        super(props);

        this.mouted = false;
        this.defaultNameKey = 'WTG.Name';
        this.defaultAliasKey = 'WTG.Alias';
        this.defaultFarmNameKey = 'Farm.Name';

        this.collectRef = React.createRef<HTMLElement>();
        this.overscanStartIndex = 0;
        this.overscanStopIndex = 0;
        this.visibleStartIndex = 0;
        this.visibleStopIndex = 0;
        this.sizedWidth = undefined;
        this.sizedHeight = undefined;

        this.firstDynReq = true;
        this.reRequest = true;
        this.timerIdDevice = undefined;
        this.timerIdDyn = undefined;
        this.timerHistroy = undefined;
        this.timerRealCurve = undefined;

        // related to loaded svg file
        this.svgFile = {};
        this.svgAttr = {};
        this.svgText = '';
        this.svgModel = [];

        /**
         * 所有设备
         */
        this.allDevice = [];
        /**
         * 过滤后的设备数据
         */
        this.deviceData = [];
	    /**
         * key is fac alias, value is device count, used to calculate cell size
         */
        this.deviceByFac = {};
        /**
         * key is fac alias, value is fac index, used to calculate cell size
         */
        this.indexByFac = {};
        /**
         * 每个场站的馈线, 场站别名为键值
         * @type {Map<string, String[]>}
         */
        this.phaseFeederByFac = {};
        /**
         * 每个馈线设备数量, 馈线别名为键值
         * @type {Map<string, number}
         */
        this.deviceCountByPhaseFeeder = {};
        /**
         * 每个馈线索引, 馈线别名为键值
         * @type {Map<string, number>}
         */  
        this.indexByPhaseFeeder = {};
        
        // device alias mapping at present, used to flash card
        this.deviceMap = {}; 
	
        this.dynData = [];

        // event flag
        this.scrollStartTime = 0;
        this.longPress = false;
        this.longPressTimeout = undefined;

        // alarm component
        this.alarmComponet = React.createRef<HTMLElement>();
        this.app = props.app
        this.drillDown = props.drillDown

        this.state = {
            data: [],
            loading: false,
            /**
             * 第一次不使用,配合flashByState使用
             * 新增或第二次请求状态变化时闪烁,确认后不闪烁,状态再次变化闪烁,周而复始
             * 消失
             */
            flashDevice: [],
            flashStateDevice: [],
            hasToken: false
        };
    }

    /**
     * 有过滤且有状态才会闪烁
     * @returns {Boolean}
     */
    needFlash(){
        const {filters=[], flashByState} = this.props;
        if(!flashByState) return false;

        let hasFilter = false;
        for(let i = 0, l = filters.length; i < l; i++){
            let f = filters[i];
            if(f.filter_str && ['^.*$', '.*', '^.*.*$'].indexOf(f.filter_str) === -1){
                hasFilter = true;
                break;
            }
        }
        return hasFilter;
    }

    rearrangeDevice(){
        const { isGroupByFeeder } = this.props;

        // convenient to participate in the calculation later
        this.deviceByFac = {};
        this.indexByFac = {};
        this.deviceCountByPhaseFeeder = {};
        this.phaseFeederByFac = {};
        this.indexByPhaseFeeder = {};

        let facIndex = 0;
        let feederIndex = 0;
        let temp = {};

        this.deviceData = this.allDevice.filter(
            ele => ele[this.defaultNameKey].indexOf(this.props.searchName)>-1
        );

        this.deviceData.forEach(d => {
            const farmAlias = d[this.defaultAliasKey].split('.')[0];
            let count = this.deviceByFac[farmAlias] || 0;
            this.deviceByFac[farmAlias] = count + 1;
            if(!(farmAlias in this.indexByFac)){
                this.indexByFac[farmAlias] = facIndex;
                facIndex = facIndex + 1;
            }

            // 馈线参数统计
            const { feederAlias, phaseAlias } = d;
            this.phaseFeederByFac[farmAlias] = this.phaseFeederByFac[farmAlias] || [];
            if(feederAlias){
                let subCount = this.deviceCountByPhaseFeeder[feederAlias] || 0;
                this.deviceCountByPhaseFeeder[feederAlias] = subCount + 1;
                if(this.phaseFeederByFac[farmAlias].indexOf(feederAlias) === -1){
                    this.phaseFeederByFac[farmAlias].push(feederAlias);
                }
                if(!(feederAlias in this.indexByPhaseFeeder)){
                    this.indexByPhaseFeeder[feederAlias] = feederIndex;
                    feederIndex = feederIndex + 1;
                }
            }

            temp[farmAlias] = temp[farmAlias] || [];
            temp[farmAlias].push(d);
        });

        // 按场站归类并保证顺序, 上面无法保证同一场站的设备在一起
        // 可能是乱序无章的, 进而导致下面排列计算异常
        let farms = Object.keys(temp);
        farms.sort((a, b) => this.indexByFac[a] - this.indexByFac[b]);
        
        // 馈线分组时要排序, 否则渲染时由于位置不对导致渲染异常
        if(isGroupByFeeder){
            this.deviceData = [].concat.apply([], farms.map((k) => {
                const feeders = this.phaseFeederByFac[k];
                if(feeders && feeders.length > 0){
                    temp[k].sort((a, b) => {
                        let no1 = feeders.indexOf(a.feederAlias);
                        let no2 = feeders.indexOf(b.feederAlias);
                        no1 = no1 === -1 ? 10e6 : no1;
                        no2 = no2 === -1 ? 10e6 : no2;
                        return no1 - no2;
                    });
                }
                return temp[k];
            }));
        }else{
            this.deviceData = [].concat.apply([], farms.map((k) => temp[k]));
        }
    }
    
    fetchDevice(afterGet, loading, reRequest) {
        if(loading && !this.props.pageState.isLoading){
            //this.setState({loading: true});
            this.props.pageState.setLoading(true);
        }

        window.clearTimeout(this.timerIdDevice);

        // table_no暂时不传,基本是遥信会有别名
        const {deviceType, siteType, topAlias, filters=[], flashByState = []} = this.props;
        const paras: any[] = [];
        filters.forEach(f => {
            const points = f.col_name.split(':');
            paras.push({
                type: points[0], 
                field: points[1],
                decimal: reqDecimal
            });
        });
        (flashByState as []).forEach(alias => {
            if(alias && 
                !this.props.models.find(ele => ele.alias.indexOf(alias) > -1) &&
                !paras.find(ele => ele.type === alias)
            ){
                paras.push({
                    type: alias,
                    field: '9',
                    decimal: reqDecimal
                });
            }
        })

        let req: IReqWtgTable[] = [];        
        req.push(
            //@ts-ignore
            Object.assign({}, FetchModel.TableListReq, {
                root_nodes: topAlias,
                data_level: isOtherDeviceType(deviceType) ? 'device' : deviceType,
                device_type: isOtherDeviceType(deviceType) ? deviceType : '',
                filter_bay_type: deviceType === DEVICE_TYPE.INVERTER 
                ? BAY_TYPE.INVERTER_STR
                : (deviceType === DEVICE_TYPE.DC_COMBINER ? BAY_TYPE.AC_COMBINER_STR: ''),
                farm_type: deviceType === 'farm' ? siteType || '' : '',
                paras,
                filters,
                if_filter: filters.length > 0
            })
        );

        _dao.getBayList(req)
            .then(responses => {
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
            })
            .then((responses) => {
                return Promise.all(responses.map(res => res.json()));
            })
            .then((responseDatas) => {
                responseDatas.map(res => {

                    // 排序、过滤
                    if (LegalData(res)) {
                        const { filterPhaseAlias, sortOrderNo } = this.props;

                        const nameKey = this.defaultNameKey;
                        const farmKey = this.defaultFarmNameKey;
                        let temp = res.data;
                        /* temp = res.data.concat(res.data.map(d=>{
                            return Object.assign({}, d, {
                                'Farm.Name': d['Farm.Name'].replace('山西广灵','山西广灵01'),
                                'WTG.Alias': d['WTG.Alias'].replace('SXGL','TS01'),
                                "feederAlias": d['feederAlias'].replace('SXGL','TS01'),
                                'feederName':d.feederName.replace('SXGL','TS01')
                            });
                        })).concat(res.data.map((d, ind)=>{
                            return Object.assign({}, d, {
                                'Farm.Name': d['Farm.Name'].replace('山西广灵','山西广灵02'),
                                'WTG.Alias': d['WTG.Alias'].replace('SXGL','TS02'),
                                "feederAlias": ind > 10 ? d['feederAlias'].replace('SXGL','TS02') : '',
                                'feederName':ind > 10 ? d.feederName.replace('SXGL','TS02') : ''
                            });
                        })).concat(res.data.map(d=>{
                            return Object.assign({}, d, {
                                'Farm.Name': d['Farm.Name'].replace('山西广灵','山西广灵03'),
                                'WTG.Alias': d['WTG.Alias'].replace('SXGL','TS03'),
                                "feederAlias": '',
                                'feederName':''
                            });
                        })).concat(res.data.map(d=>{
                            return Object.assign({}, d, {
                                'Farm.Name': d['Farm.Name'].replace('山西广灵','山西广灵04'),
                                'WTG.Alias': d['WTG.Alias'].replace('SXGL','TS04'),
                                "feederAlias": d['feederAlias'].replace('SXGL','TS04'),
                                'feederName':d.feederName.replace('SXGL','TS04')
                            });
                        })); */

                        // 设备列表 场站名称过滤
                        if(this.props.filterFacName){
                            temp.forEach(t => {
                                let reg = new RegExp('^' + (t[farmKey] || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                t[nameKey] = t[nameKey].replace(reg, '').trim();
                            })
                        }

                        if(sortOrderNo){
                            temp.sort((prev, next) => {
                                const pNo = (prev.order_no || '').replace(/\,/g, '');
                                const nNo = (next.order_no || '').replace(/\,/g, '');
                                const diff =  Number(pNo || 0) - Number(nNo || 0);

                                if(diff === 0){
                                    const pName = prev[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                    const nName = next[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                    return pName.localeCompare(nName);
                                }

                                return diff;
                            });
                        }else{
                            temp.sort((prev, next) => {
                                const pName = prev[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                const nName = next[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                return pName.localeCompare(nName);
                            });
                        }

                        this.allDevice = temp.filter(d => {
                            const { phaseAlias } = d;

                            // 不存在的不过滤,原有逻辑
                            return !phaseAlias || !filterPhaseAlias || phaseAlias === filterPhaseAlias;
                        });
                    }else{
                        this.allDevice = [];
                    }
                });
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => {
                if(!this.mouted) return;

                this.rearrangeDevice();

                // 闪烁时使用,记录新的设备mapping
                let deviceAliasMapping = {};
                this.deviceData.forEach(d => {
                    deviceAliasMapping[d[this.defaultAliasKey]] = 1;
                });

                // 闪烁时需要的新增设备列表
                let newDevice: string[] = [];
                if(this.needFlash()){
                    Object.keys(deviceAliasMapping).map(alias => {
                        if(!(alias in this.deviceMap) || this.state.flashDevice.indexOf(alias) > -1){
                            newDevice.push(alias);
                        }
                    });                    
                }
                this.deviceMap = deviceAliasMapping;

                if(typeof afterGet === 'function'){
                    afterGet();
                }

                this.setState(Object.assign({}, {
                    data: JSON.parse(JSON.stringify(this.deviceData))
                }, 
                loading ? {loading: false} : {},
                {flashDevice: reRequest ? [] : newDevice},
                {hasToken: this.getHasToken(this.deviceData, this.props.tokenData)}
                ), () => {
                    loading && this.props.pageState.setLoading(false);

                    clearTimeout(this.timerIdDevice);
                    this.timerIdDevice = setTimeout(this.fetchDevice.bind(this), 6000);
                }); 
            });
    }

    async fetchHistory(){
        clearTimeout(this.timerHistroy);

        const {chartModels=[], dataState} = this.props;
        const deviceData = this.state.data;

        if(!deviceData || deviceData.length === 0 || chartModels.length === 0) return;

        const curves: any[] = [];
        let temp: any[] = [];
        if(this.visibleStartIndex + this.visibleStopIndex !== 0){
            temp = deviceData.slice(this.visibleStartIndex, this.visibleStopIndex + 1);
        }else{
            temp = deviceData.slice(0, 9);
        }
        temp.forEach(d => {
            const alias = d[this.defaultAliasKey];
            chartModels.forEach(p => {
                curves.push(Object.assign({}, FetchModel.HistoryCurveModel, {
                    key: getPointKey(p, `${alias}`), 
                    decimal: p.decimal || reqDecimal
                }));
            });
        });

        if(curves.length > 0){
            const res = await _dao.getCurve(Object.assign({}, FetchModel.HistoryCurveReq, {
                curve: curves,
                sample_cycle: 5,
                start_time: DateUtil.getStdNowTime(true),
                end_time: DateUtil.getStdNowTime()
            }));

            if(!this.mouted) return;
    
            let historyData = {};
            if(String(res.code) === '10000' && Array.isArray(res.data)){
                res.data.forEach(d => {
                    const { key, Points } = d;
                    historyData[key] = Points;
                });

                dataState.setHisData(historyData);
            }
        }

        clearTimeout(this.timerHistroy);
        this.timerHistroy = window.setTimeout(this.fetchHistory.bind(this), CommonHisTimerInterval);   
    }

    async fetchRealTime(){
        clearTimeout(this.timerRealCurve);

        const {chartModels=[], dataState} = this.props;
        const deviceData = this.state.data;

        if(!deviceData || deviceData.length === 0 || chartModels.length === 0) return;

        const curves: any[] = [];
        let temp: any[] = [];
        if(this.visibleStartIndex + this.visibleStopIndex !== 0){
            temp = deviceData.slice(this.visibleStartIndex, this.visibleStopIndex + 1);
        }else{
            temp = deviceData.slice(0, 9);
        }
        temp.forEach(d => {
            const alias = d[this.defaultAliasKey];
            chartModels.forEach(p => {
                curves.push(Object.assign({}, FetchModel.RealCurveModel, {
                    key: getPointKey(p, `${alias}`), 
                    decimal: p.decimal || reqDecimal
                }));
            });
        });

        if(curves.length > 0){
            const res = await _dao.getCurve(Object.assign({}, FetchModel.RealCurveReq, {
                curve: curves
            }));

            if(!this.mouted) return;
    
            let historyData = {};
            if(String(res.code) === '10000' && Array.isArray(res.data)){
                res.data.forEach(d => {
                    const { key, Points } = d;
                    historyData[key] = Points;
                });

                dataState.setHisData(historyData);
            }
        }

        clearTimeout(this.timerRealCurve);
        this.timerRealCurve = window.setTimeout(this.fetchRealTime.bind(this), ListRealTimeCurveTimerInterval);   
    }

    fetchDyn(loading?, reRequest?){
        if(loading && !this.props.pageState.isLoading){
            //this.setState({loading: true});
            this.props.pageState.setLoading(true);
        }

        clearTimeout(this.timerIdDyn);
        
        let {flashByState, models} = this.props;
        let dynReq: any[] = [];
        let stateModel;
        let fromDyn = false;
        // 动态字里可能含有公式的状态点,如果没有再用普通的测点
        if(flashByState){
            stateModel = models.find(m => m.alias.indexOf(flashByState) > -1);
        }

        let modelMap = {};
        let filterModels = models.filter(m => {
            let {tableNo, alias, fieldNo} = m;
            let key = `${tableNo}_${fieldNo}_${alias}`;
            if(modelMap[key]){
                return false;
            }else{
                modelMap[key] = true;
                return true;
            }
        });
        this.state.data.forEach((d, ind) => {

            const alias = d[this.defaultAliasKey];

            if (this.firstDynReq && dynReq.length < 300 || 
                (ind >= this.visibleStartIndex && ind <= this.visibleStopIndex)
            ) {
                filterModels.map(m => {
                    dynReq.push({
                        id: '',
                        key: getPointKey(m, alias),
                        decimal: m.decimal || reqDecimal
                    });
                });
            }
        });

        if (dynReq.length > 0) {
            this.firstDynReq = false;
            _dao.getDynData(dynReq)
                .then(res => {
                    if (String(res.code) === '10000') {
                        // debug
                        /* this.dynData = (res.data || []).map(d => {
                            if(d.key.indexOf(':62') > -1 || d.key.indexOf(':35') > -1){
                                d.display_value = (Math.random() * 100000).toFixed(2)
                            }
                            return d;
                        }); */
                        this.dynData = res.data || [];
                    }
                })
                .finally(() => {
                    if(!this.mouted) return;

                    const { dataState } = this.props;
                    const data = this.allDevice;

                    let dynDataMap = {};
                    this.dynData.forEach(d => {
                        let pointData = JSON.parse(JSON.stringify(d));
                        delete pointData.timestamp;
                        dynDataMap[d.key] = pointData;
                    });

                    let notSameStateDevice: string[] = [];
                    if(this.needFlash() && stateModel){
                        const oldDynMap = dataState.getDyndata();
                        let aliasArr: string[] = [];
                        let newDataMap = {};
                        let oldDataMap = {};
                        data.map(d => {
                            let alias = d[this.defaultAliasKey];
                            aliasArr.push(alias);
                            newDataMap[alias] = d;
                        });
                        this.state.data.map(d => {
                            let alias = d[this.defaultAliasKey];
                            oldDataMap[alias] = d;
                        });

                        aliasArr.map(alias => {
                            const dynKey = getPointKey(stateModel, alias);
                            const oldState = oldDynMap[dynKey];
                            const newState = dynDataMap[dynKey];
                            let isSame = true;
                            if(newState && oldState){
                                isSame = newState.display_value === oldState.display_value;
                            }
                            if(!isSame || this.state.flashStateDevice.indexOf(alias) > -1){
                                notSameStateDevice.push(alias);
                            }
                        });
                    }

                    dataState.setDyndata(dynDataMap);

                    this.setState(Object.assign({}, 
                        loading ? {loading: false} : {},
                        {flashStateDevice: reRequest ? [] : notSameStateDevice}
                    ), () => {
                        loading && this.props.pageState.setLoading(false);

                        if(reRequest) this.reRequest = false;

                        clearTimeout(this.timerIdDyn);
                        this.timerIdDyn = window.setTimeout(this.fetchDyn.bind(this), TimerInterval);
                    });
                });
        }else{
            if(reRequest) this.reRequest = false;

            clearTimeout(this.timerIdDyn);
            this.timerIdDyn = setTimeout(this.fetchDyn.bind(this), TimerInterval);
        }
    }

    getHasToken(deviceData: any[]=[], tokenData: any[]=[]){
        const tokenMap: {[k: string]: any[]} = {};
        tokenData.forEach(d => {
            const { alias='', tokenPath='' } = d || {};
            if(alias && tokenPath){
                tokenMap[alias] = tokenMap[alias] || [];
                tokenMap[alias].push(d);
            }            
        });
        const deviceAlias: string[] = [];
        deviceData.forEach(d => {
            deviceAlias.push(d[this.defaultAliasKey]);
        });
        let hasToken = false;
        for(let i = 0, l = deviceAlias.length; i < l; i++){
            const tokens = tokenMap[deviceAlias[i]];
            if(tokens && tokens.length > 0){
                hasToken = true;
                break;
            }
        }
        return hasToken;
    }

    init(rerender, loading){

        // 重新请求时删除所有闪烁
        this.reRequest = true;
        this.setState({
            flashDevice: [],
            flashStateDevice: []
        });

        if(loading){
            //this.setState({loading: true});
            this.props.pageState.setLoading(true);
        }
        if(this.props.stopRefresh){
            if(loading){
                //this.setState({loading: false});
                this.props.pageState.setLoading(false);
            }
            return;
        }

        this.fetchDevice(() => {
            this.fetchDyn(loading, this.reRequest);
            isReal ? this.fetchRealTime() : this.fetchHistory();
        }, loading, this.reRequest);
    }

    componentDidMount() {
        this.mouted = true;
        this.init(false, true);
    }

    shouldComponentUpdate(nextProps, nextState){
        // Maximum call stack size exceeded
        let getValidProps = (props) => {
            const obj = {};
            Object.keys(props).filter(key => ['pageState','dataState', 'navigate'].indexOf(key) === -1).map(key => {
                obj[key] = props[key];
            });
            return obj;
        };
        const isSameProps = _.isEqual(getValidProps(this.props), getValidProps(nextProps));
        const isSameState = _.isEqual(this.state, nextState);
        return !(isSameProps && isSameState);
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        if( !_.isEqual(nextProps.tokenData, this.props.tokenData)){
            const hasToken = this.getHasToken(this.state.data, nextProps.tokenData);
            if(hasToken !== this.state.hasToken){
                this.setState({hasToken});
            }
        }
        if(!_.isEqual(nextProps.filters, this.props.filters) || 
            !_.isEqual(nextProps.tokenData, this.props.tokenData) || 
            (nextProps.isMultiFac !== this.props.isMultiFac) ||
            (nextProps.isGroupByFac !== this.props.isGroupByFac) || 
            /* (nextProps.isGroupByFeeder !== this.props.isGroupByFeeder) || 
            (nextProps.searchName !== this.props.searchName) || */
            (nextProps.largeCardHeight !== this.props.largeCardHeight) || 
            (nextProps.largeCardWidth !== this.props.largeCardWidth)
        ){
            this.forceUpdate();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.stopRefresh !== this.props.stopRefresh ||
            prevProps.svgFile !== this.props.svgFile ||
            !_.isEqual(prevProps.filters, this.props.filters) ||
            prevProps.filterPhaseAlias !== this.props.filterPhaseAlias || 
            prevProps.flashByState !== this.props.flashByState ||
            prevProps.deviceType !== this.props.deviceType || 
            prevProps.mode !== this.props.mode || 
            !_.isEqual(prevProps.models, this.props.models)
        ){
            this.clear();
            this.init(prevProps.svgFile !== this.props.svgFile, true);
        }
        if(prevProps.widthResize !== this.props.widthResize || 
            prevProps.heightResize !== this.props.heightResize ||
            (prevProps.isMultiFac !== this.props.isMultiFac) ||
            (prevProps.isGroupByFac !== this.props.isGroupByFac) || 
            (prevProps.isGroupByFeeder !== this.props.isGroupByFeeder) || 
            (prevProps.searchName !== this.props.searchName) || 
            prevProps.mode !== this.props.mode || (prevProps.largeCardHeight !== this.props.largeCardHeight) || 
            prevState.hasToken !== this.state.hasToken ||
            (prevProps.largeCardWidth !== this.props.largeCardWidth)
        ){
            // 要重排下否则排列会异常
            if(prevProps.isGroupByFeeder !== this.props.isGroupByFeeder || prevProps.searchName !== this.props.searchName){
                this.rearrangeDevice();

                this.setState(Object.assign({}, {
                    data: JSON.parse(JSON.stringify(this.deviceData))
                })); 
            }
            
            if(this.collectRef.current){
                this.collectRef.current.recomputeCellSizesAndPositions();
            }
        }
    }

    componentWillUnmount() {
        this.clear();
        this.mouted = false;
    }

    clear(){
        clearTimeout(this.timerIdDevice);
        clearTimeout(this.timerIdDyn);
        clearTimeout(this.timerHistroy);
    }

    toPage(deviceAlias, event){
        const eventBtn = event.button;
        const eventBtns = event.buttons;

        // trigger when pressing left mouse button
        if(eventBtn === 0 || eventBtns === 1){
            const { sign } = this.props.routerParams;
            if(this.drillDown){
                navTo(deviceAlias, {
                    compatible: this.props.deviceType === 'farm',
                    listSign: sign,
                    navigate: this.props.navigate,
                    appName: this.app
                });
            }
        }
        
        event.stopPropagation();
    }

    onMouseEnter(deviceAlias, event){
        if(this.props.showAlarm && this.alarmComponet.current){
            this.alarmComponet.current.show({
                alias: deviceAlias,
                levelList: this.props.alarmLevel, 
                typeList: this.props.alarmType,
                target: event.currentTarget
            });
        }
    }

    onMouseLeave(deviceAlias?, event?){
        if(this.props.showAlarm && this.alarmComponet.current){
            this.alarmComponet.current.hide();
        }
    }

    confirmFlash(deviceName, deviceAlias){
        this.setState({
            flashDevice: this.state.flashDevice.filter(alias => alias !== deviceAlias),
            flashStateDevice: this.state.flashStateDevice.filter(alias => alias !== deviceAlias)
        }, () => {
            _dao.memo('insert', {
                type: '5051',
                content: JSON.stringify({
                    name: deviceName,
                    alias: deviceAlias,
                    time: DateUtil.getStdNowTime()
                }),
                description: 'Flash Confirm',
                is_desc: '1'
            });
        });
    }

    cellRender({ index, key, style }){
        return (
            <div key={key} style={style}>
                {this.state.data[index][this.defaultNameKey]}
            </div>
        );
    }

    cellSizeAndPositionGetter({ index }){
        let {
            isGroupByFac,
            isMultiFac,
            width: containerWidth, 
            height: containerHeight, 
            widthResize, 
            heightResize,
            isGroupByFeeder,
            mode,
            largeCardHeight,
            largeCardWidth,
            tokenSize
        } = this.props;
        let {width, height} = mode === MODE.LARGE_ICON ? CARD_ATTR : CARD_ATTR_SMALL;
        if(mode === MODE.LARGE_ICON && largeCardHeight){
            height = largeCardHeight;
        }
        if(mode === MODE.LARGE_ICON && largeCardWidth){
            width = largeCardWidth;
        }

        if(!this.state.hasToken){
            tokenSize = TOKEN_SIZE.min;
        }
        if(tokenSize !== undefined){

            /**@see {@link ..\..\constants\index} TOKEN_SIZE  挂牌尺寸最小10 */
            /**@see styles.cardBottomSize 卡片底部间距10*/
            /**保证补白,减去的数据要比20小,上面尺寸有变化,则需要变更 */
            height = height + tokenSize - 16
        }

        const aliasKey = this.defaultAliasKey;
        const curData = this.state.data[index];
        const farmAlias = curData[aliasKey].split('.')[0];
        const farmIndex = this.indexByFac[farmAlias] || 0;
        const feederAlias = curData.feederAlias;
        const feeders = this.phaseFeederByFac[farmAlias] || [];

        /**
         * width of every card
         */
        let itemWidth = Math.ceil(Number(width) * widthResize);
        /**
         * height of every card
         */
        let itemHeight = Math.ceil(Number(height) * heightResize);

        // redefine container dimension after resizing window
        if(this.sizedWidth){
            containerWidth = this.sizedWidth;
        }

        // subtract scroll bar width (unknown reason, scroll bar width is 7, so add 1)
        // subtract 1 because container width is greater than actual width due to getting the width is an integer
        containerWidth = containerWidth - (scrollBarWidth + 1 + 1);

        // subtract other size of container
        const nameSize = (isMultiFac || (isGroupByFeeder && feeders.length > 0)) ? Number(styles.nameSize) : Number(styles.noNameSize);
        const itemBorder = Number(styles.itemBorder);
        containerWidth = containerWidth - nameSize - itemBorder;

        /**
         * calculate number of arranging cards in a row and rows of cards in a cell(a fac)
         * must be greater than 0
         */     
        const numPerRow = parseInt(String(containerWidth / (itemWidth + MIN_MARGIN))) || 1;
        /**
         * 每个卡片横向间隙
         */
        const widthPad = numPerRow === 0 ? containerWidth : parseInt(String(containerWidth / numPerRow - itemWidth));
        /**
         * 每个场站项顶部padding大小
         */
        const itemTopPad = Number(styles.itemTopPad) + Math.max(tokenSize * heightResize - 8, 0);

        if(!isGroupByFac){
            /**
             * 每个项顶部padding大小
             */
            const glutterTopSize = Number(styles.cardTopSize);
            /**
             * 每个卡片项底部间隙大小
             */
            const glutterBottomSize = Number(styles.cardBottomSize);

            itemHeight = itemHeight + glutterTopSize + glutterBottomSize;
            return {            
                height: itemHeight,
                width: (itemWidth + widthPad),
                x: numPerRow === 0 ? 0 : (index % numPerRow) * (itemWidth + widthPad),
                y: numPerRow === 0 ? 0 : Math.floor(index / numPerRow) * itemHeight,
                itemY: numPerRow === 0 ? 0 : Math.floor(index / numPerRow) * itemHeight,
                cardHeight: itemHeight,
                numPerRow: numPerRow,
                itemTopPad
            };
        }

        /**场站数量 */
        let farmCount = 0;
        /**按场站或馈线分组后总的组数量 含未配置馈线 */
        let farmAllGroup = 0;
        /**场站馈线数量 含未配置馈线组数量 */
        let farmGroupMap = {};
        /**每组后面空余数量 */
        let farmGroupBlank = {};
        /**所有行数 */
        let allRows = 0;
        /**每个场站项最终所有行数*/
        let rowIndex = 0;

        /**
         * 每个场站最后空位数
         */
        const farmIndexBlank = {};
        Object.keys(this.deviceByFac)
        .map(k => {
            farmCount += 1;
            const farmIndex = this.indexByFac[k];
            const facDeviceCount = this.deviceByFac[k];
            const feeders = this.phaseFeederByFac[k] || [];

            if(isGroupByFeeder && feeders.length > 0){
                farmGroupMap[farmIndex] = feeders.length;

                let totalFeederDeviceNum = 0;
                let totalBlankNum = 0;
                feeders.forEach((feederAlias, ind) => {
                    const feederDeviceCount = this.deviceCountByPhaseFeeder[feederAlias] || 0;
                    const rest = feederDeviceCount % numPerRow;
                    const blackNum = (rest > 0 ? numPerRow - rest : 0);

                    totalFeederDeviceNum += feederDeviceCount;
                    totalBlankNum += blackNum;

                    farmAllGroup += 1;
                    farmGroupBlank[`${farmIndex}_${ind}`] = blackNum;
                    allRows += Math.ceil(feederDeviceCount / numPerRow);
                });

                let otherDeviceNum = facDeviceCount - totalFeederDeviceNum;
                if(otherDeviceNum > 0){
                    const rest = otherDeviceNum % numPerRow;
                    totalBlankNum += (rest > 0 ? numPerRow - rest : 0);
                    allRows += Math.ceil(otherDeviceNum / numPerRow);

                    farmAllGroup += 1;
                    farmGroupMap[farmIndex] = farmGroupMap[farmIndex] + 1;
                }

                farmIndexBlank[farmIndex] = totalBlankNum;
            }else{
                const rest = facDeviceCount % numPerRow;
                farmIndexBlank[farmIndex] = rest > 0 ? numPerRow - rest : 0;
                allRows += Math.ceil(facDeviceCount / numPerRow);
                farmAllGroup += 1;
                farmGroupMap[farmIndex] = 1;
            }            
        });

        /**
         * 当前场站之前所有场站的空位数之和
         */
        let prevBlankDeviceCount = 0;
        let prevGroupCount = 0;
        let temp = farmIndex - 1;

        if(isGroupByFeeder && feeders.length > 0){
            for(let i = 0, l = feeders.length; i < l; i++){
                const ele = feeders[i];
                if(ele === feederAlias){
                    break;
                }
                prevBlankDeviceCount += (farmGroupBlank[`${farmIndex}_${i}`] || 0);
                prevGroupCount += 1;
            }
        }
        while(temp >= 0){
            prevBlankDeviceCount += farmIndexBlank[temp];
            prevGroupCount += farmGroupMap[temp];
            temp -= 1;
        }
        
        rowIndex = Math.ceil((index + 1 + prevBlankDeviceCount) / numPerRow);

        /**
         * 每个场站项底部margin大小
         */
        const itemBottomMargin = Number(styles.itemBottomMargin);
        /**
         * 每个卡片项底部间隙大小
         */
        const glutterBottomSize = Number(styles.cardBottomSize);
        /**
         * 每个场站项里每个组的下底边框宽度, 最后一个组下底边框宽度不需要, 需要减掉
         */
        const groupBottomBorderSize = Number(styles.groupBorderBottom);

        // 每个卡片项总高度
        itemHeight = itemHeight + glutterBottomSize;
        // 每个卡片项总宽度
        itemWidth = itemWidth + widthPad;

        const farmTopPadBottomMargin = farmCount * itemBottomMargin - itemBottomMargin;
        const feederTopPad = farmAllGroup * itemTopPad;
        const allGroupBottomBorderSize = (farmAllGroup - farmCount) * groupBottomBorderSize;
        /**
         * 最终每个卡片虚拟高度
         */
        const virtualHeight = itemHeight 
            + ((farmTopPadBottomMargin + feederTopPad + allGroupBottomBorderSize) / allRows);
            
        return {
            height: virtualHeight,
            width: itemWidth,
            x: (index % numPerRow) * itemWidth,
            y: (rowIndex - 1) * virtualHeight,
            itemY: (rowIndex - 1) * itemHeight + farmIndex * itemBottomMargin + prevGroupCount * itemTopPad + (prevGroupCount - farmIndex) * groupBottomBorderSize,
            cardHeight: itemHeight,
            numPerRow: numPerRow,
            itemTopPad
        };
    }

    cellGroupRenderer({ cellRenderer, indices, cellSizeAndPositionGetter }){
        this.visibleStartIndex = indices[0] || 0;
        this.visibleStopIndex = indices[indices.length - 1] || 0;

        const farmKey = this.defaultFarmNameKey;
        const defaultAliasKey = this.defaultAliasKey;
        const defaultNameKey = this.defaultNameKey;
        let {
            widthResize, 
            heightResize, 
            isMultiFac, 
            showToken, 
            tokenSize,
            tokenData, 
            verticalSiteName, 
            isGroupByFeeder,
            isGroupByFac,
            mode,
            largeCardHeight,
            largeCardWidth,
            deviceType
        } = this.props;
        if(!this.state.hasToken){
            tokenSize = TOKEN_SIZE.min;
        }
        let {width: cardRawWidth, height: cardRawHeight} = mode === MODE.LARGE_ICON ? CARD_ATTR : CARD_ATTR_SMALL;
        if(mode === MODE.LARGE_ICON && largeCardHeight){
            cardRawHeight = largeCardHeight;
        }
        if(mode === MODE.LARGE_ICON && largeCardWidth){
            cardRawWidth = largeCardWidth;
        }
        const newWidth = Number(cardRawWidth) * widthResize;
        const newHeight = Number(cardRawHeight) * heightResize;

        const tokenMap = {};
        if(!Array.isArray(tokenData))tokenData = [];
        tokenData.forEach(d => {
            const { alias='', tokenPath='' } = d || {};
            if(alias && tokenPath){
                tokenMap[alias] = tokenMap[alias] || [];
                tokenMap[alias].push(d);
            }            
        });

        // group by factory
        let data = JSON.parse(JSON.stringify(this.state.data));
        let farmMap = {};
        let farmNameAlias = {};

        if(isGroupByFac){
            indices.forEach((ind) => {
                let d = data[ind];
                d._index_ = ind;
                farmMap[d[farmKey]] = farmMap[d[farmKey]] || [];
                farmMap[d[farmKey]].push(d);
    
                farmNameAlias[d[farmKey]] = d[defaultAliasKey].split('.')[0];
            });
        }else{
            //场站列表不需要分组
            indices.forEach((ind) => {
                let d = data[ind];
                d._index_ = ind;
                farmMap['farm'] = farmMap['farm'] || [];
                farmMap['farm'].push(d);
    
                farmNameAlias['farm'] = 'farm';
            });
        }        

        return Object.keys(farmMap).map((k, ind) => {
            let deviceList = farmMap[k];
            const farmAlias = farmNameAlias[k];

            const dimension = this.cellSizeAndPositionGetter({ index: deviceList[0]._index_ });
            const {numPerRow, width, height, x, y, cardHeight, itemY, itemTopPad} = dimension;
            const groupBottomBorderSize = Number(styles.groupBorderBottom);

            let facFeederList: any[] = [];
            const feeders = this.phaseFeederByFac[farmAlias] || [];
            let facTotalRow = Math.ceil(deviceList.length / numPerRow);
            let facGroup = 0;

            // 边侧文字最好不换行, 否则单组只有一行时会导致整个布局有异常
            const showSlider = isMultiFac || (isGroupByFeeder && feeders.length > 0);
            // 卡片高度太小时,左侧文字溢出
            const fontSize = (showSlider && cardHeight < 33) ? 12 : undefined;
            
            if(isGroupByFeeder && feeders.length > 0){
                let temp = {};
                let other: any[] = [];
                let feederAliasName = {};
                let totalRow = 0;

                deviceList.forEach(d => {
                    const { feederAlias, feederName } = d;
                    if(feederAlias){
                        temp[feederAlias] = temp[feederAlias] || [];
                        temp[feederAlias].push(d);
                    }else{
                        other.push(d);
                    }
                    feederAliasName[feederAlias] = feederName;
                });

                facFeederList = feeders.filter(f => !!temp[f]).map(f => {
                    totalRow += Math.ceil(temp[f].length / numPerRow);
                    facGroup += 1;

                    let fName = feederAliasName[f];
                    if(fName.startsWith(k)){
                        fName = fName.replace(k, '').trim();
                    }
                    return {
                        alias: [farmAlias, f],
                        name: [k, fName],
                        list: temp[f]
                    };
                });
                if(other.length > 0){
                    facFeederList.push({
                        alias: [farmAlias, ''],
                        name: [k, msgPrev('noFeeder')],
                        list: other
                    });
                    totalRow += Math.ceil(other.length / numPerRow);
                    facGroup += 1;
                }

                facTotalRow = totalRow;
            }else{
                facFeederList.push({
                    alias: farmAlias,
                    name: k,
                    list: deviceList
                });
                facGroup += 1;
            }

            return (
                <div key={k} 
                    className={`${styles.item} ${showSlider ? styles.group : ''}`}
                    style={{
                        top: itemY,
                        height: facTotalRow * cardHeight + facGroup * itemTopPad + (facGroup - 1) * groupBottomBorderSize
                    }}
                >
                {
                    facFeederList.map((ele, ind) => {
                        return <div key={ind}>
                            {
                                showSlider ? 
                                <div 
                                    className={`${styles.aside}`}
                                >
                                    <div>
                                        <ShowToken 
                                            height={tokenSize * heightResize}
                                            width={tokenSize * widthResize}
                                            tokenData={tokenMap[Array.isArray(ele.alias) ? ele.alias[1] : ele.alias] || []}
                                        ></ShowToken>
                                    </div>
                                    <div 
                                        style={fontSize ? {fontSize} : {}}
                                        className={`${styles.fac} ${verticalSiteName ? styles.facRotate : ''}`}
                                        onClick={(e) => {
                                            let tokenAlias = Array.isArray(ele.alias) ? ele.alias[1] : ele.alias;
                                            if(!tokenAlias)return;
                                            if(isDevelopment){
                                                SetToken(tokenAlias, undefined);
                                            }else{
                                                PointEvt.popMenu(`1:430:${tokenAlias}:1`, e.nativeEvent);
                                            }
                                        }}
                                        {...(
                                            verticalSiteName ? 
                                            {  
                                                dangerouslySetInnerHTML: { __html: (`${ele.name[0]} <br/> ${ele.name[1]}`).replace(/\d+/g, function(num) {
                                                    return `<span class="${styles.facNum}">${num}</span>`;
                                                })}} 
                                            : 
                                            {}
                                        )}
                                    >
                                        {verticalSiteName ? null : <div>
                                            <EllipsisToolTip>{Array.isArray(ele.name) ? ele.name[0] : ele.name}</EllipsisToolTip>
                                            {Array.isArray(ele.name) ? <EllipsisToolTip>{ele.name[1]}</EllipsisToolTip> : null} 
                                        </div>}
                                    </div>
                                </div>
                                : null
                            }                
                                <div className={`${styles.child} ${showSlider ? styles.part : ''}`} style={{
                                    paddingTop: itemTopPad
                                }}>
                                {
                                    ele.list.map((device, ind2) => {
                                        const deviceAlias = device[defaultAliasKey];
                                        const deviceName = device[defaultNameKey];
                                        let tokenKey = deviceAlias;

                                        // 储能子系统特殊处理
                                        if(String(deviceType) === '22'){
                                            tokenKey = deviceAlias.split('.').slice(0, 2).join('.');
                                        }
                                        
                                        let tokenContent: any[] = [];

                                        if(Array.isArray(tokenMap[tokenKey])){
                                            tokenContent.push(
                                                <div
                                                    key={deviceAlias}
                                                    style={{
                                                        position: 'absolute',
                                                        left: 10,
                                                        top: -(tokenSize * heightResize - 8),
                                                        height: tokenSize * heightResize,
                                                        width: tokenSize * widthResize * tokenMap[tokenKey].length,
                                                        zIndex: 1,
                                                        display: 'flex',
                                                        flexFlow: 'row nowrap'
                                                    }}
                                                >
                                                    <ShowToken 
                                                        key={ind}
                                                        placement={'top'}
                                                        trigger={'hover'}
                                                        color={styles.tipColor}
                                                        tokenData={tokenMap[tokenKey] || []}
                                                        width={tokenSize * widthResize}
                                                        height={tokenSize * heightResize}
                                                    >
                                                    </ShowToken>                                                            
                                                </div>
                                            );
                                        }

                                        const isFlash = this.state.flashDevice.indexOf(deviceAlias) > -1 || 
                                            this.state.flashStateDevice.indexOf(deviceAlias) > -1;
                                        const flashBorderWidth = isFlash ? styles.flashBorder : 0;

                                        const finalWidth = newWidth - flashBorderWidth;
                                        const finalHeight = newHeight - flashBorderWidth;
                                        
                                        return <div 
                                            key={deviceAlias} 
                                            style={{
                                                display: 'inline-block',
                                                verticalAlign: 'top',
                                                width: width,
                                                height: cardHeight,
                                                position: 'relative'
                                            }}
                                        >
                                            {showToken && tokenContent.length > 0 ? tokenContent : null}
                                            <div
                                                style={{
                                                    width: newWidth,
                                                    height: newHeight
                                                }}
                                                className={`${styles.cardContainer} ${isFlash ? styles.flash : ''}`}
                                            >
                                                {isFlash ? 
                                                    <div className={styles.flashConfirm}>
                                                        <span 
                                                            onClick={this.confirmFlash.bind(this, deviceName, deviceAlias)}
                                                            title={msgPrev('flashConfirm')}
                                                        >
                                                            <FontIcon type={IconType.CHECK}/>
                                                        </span>
                                                    </div> : null
                                                }
                                                <div
                                                    onClick={this.toPage.bind(this, deviceAlias)}
                                                    onMouseEnter={this.onMouseEnter.bind(this, deviceAlias)}
                                                    onMouseLeave={this.onMouseLeave.bind(this, deviceAlias)}
                                                    style={{
                                                        //width: finalWidth,
                                                        //height: finalHeight,
                                                        width: cardRawWidth,
                                                        height: cardRawHeight,
                                                        transform: `scale(${widthResize}, ${heightResize})`,
                                                        transformOrigin: 'left top',
                                                    }}
                                                >
                                                    <Card 
                                                        {...this.props}
                                                        //width={finalWidth}
                                                        //height={finalHeight}
                                                        width={cardRawWidth}
                                                        height={cardRawHeight}
                                                        data={device}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    })
                                }
                                </div>
                            </div>;
                        })
                    }
                </div>
            );
        });
    }

    render() {
        return (
            <div className={styles.container}>
                <AutoSizer onResize={({width, height}) => {
                    this.sizedWidth = width;
                    this.sizedHeight = height;
                    if(this.collectRef.current){
                        this.collectRef.current.recomputeCellSizesAndPositions();
                    }
                }}>
                {({width, height}) => {
                    return (
                        <Collection
                            ref={this.collectRef}
                            cellCount={this.state.data.length}
                            cellRenderer={this.cellRender.bind(this)}
                            cellSizeAndPositionGetter={this.cellSizeAndPositionGetter.bind(this)}
                            cellGroupRenderer={this.cellGroupRenderer.bind(this)}
                            // height={this.props.height}
                            // width={this.props.width}
                            height={height - 1}
                            width={width - 1}
                            verticalOverscanSize={200}
                            noContentRenderer={() => {
                                return <div className={styles.noData}>{msgPrev('noData')}</div>;
                            }}
                            onSectionRendered={({}) => {
                                this.onMouseLeave();
                                this.scrollStartTime = new Date().getTime();
                                setTimeout(() => {
                                    if(new Date().getTime() - this.scrollStartTime > 799){
                                        this.fetchDyn();
                                        isReal ? this.fetchRealTime() : this.fetchHistory();
                                    }
                                }, 800);
                            }}
                        />
                    )
                }}
                </AutoSizer>
                { this.props.showAlarm ? <Alarm ref={this.alarmComponet} /> : null }
                <EnvLoading isLoading={this.state.loading} container={this.props.loadingContainer}/>
            </div>
        );

    }
}

export default InfiniteLoader;