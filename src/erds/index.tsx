/* eslint-disable */
/* global $ */

import '../common/css/app.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import EnvLoading from 'EnvLoading';
import EchartsWrap from 'EchartsWrap';
import { notification } from 'antd';
import scadaCfg, { TimerInterval, CommonHisTimerInterval, PowerHisTimerInterval } from '../common/const-scada';
import { DateUtil, NumberUtil } from '../common/utils';
import Intl, { msgTag } from '../common/lang';
import { _dao, daoIsOk } from '../common/dao';
import { getAreaLineOption } from './components/EchartsUtil';
import SvgAnimate from './components/Animate';
import List from './components/List';
import Card from './components/Card';
import { PointConfig, Direction } from './constants';
import styles from './style.mscss';

const msg = msgTag('erds');
const isZh = Intl.isZh;
const text = (str) => {
    return str || '';
};

class Erds extends React.Component{
    public static displayName: string = '';
    private nodeAlias?: string = '';
    private config?: any = null;
    private pointsModel: {} = {};
    private pointsMap: {} = {};
    private dynTimer?: any = null;
    private hisTimer: {} = {};

    state: {
        isGenerate: boolean;
        isSolarGenerate?: boolean;
        isLoader?: boolean;        
        storageCharge?: Direction;
        outputCharge?: Direction;
        
        isLoading: boolean;

        otherDynMap: {};
        [k: string]: any;
    } = {
        isGenerate: false,
        isSolarGenerate: false,
        isLoader: false,
        storageCharge: Direction.ZERO,
        outputCharge: Direction.ZERO,
        isLoading: false,

        otherDynMap: {}
    }

    constructor(props) {
        super(props);
        this.resize = this.resize.bind(this);
    }

    resize(){
        if(window.___debug___){
            console.log(this);
        }
    }

    async initCfg(callback) {
        if(typeof callback !== 'function'){
            return;
        }

        //获取自定义配置文件
        //自定义配置未成功获取后获取本地默认配置
        const res = await fetch('../project/erds.json?_=' + Math.random());
        if(res.ok){
            const cfg = await res.json();
            callback(cfg);
        }else{
            callback(PointConfig);
        }
    }

    componentDidMount() {
        this.nodeAlias = scadaCfg.getCurNodeAlias() as string | undefined;
        if(!this.nodeAlias){
            console.error('No node alias');
            return;
        }
        this.initCfg(data => {
            this.config = JSON.parse(JSON.stringify(data));
            this.initPointsModel();
            this.changeState();
            this.getData();
        });

        this.resize();
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    /**
     * 将配置扁平化, 无points属性时递归向下, 只适合二级结构
     * @param obj 
     * @param parentPrefix 
     * @returns 
     */
    initPointsModel(obj?: {}, parentPrefix?: string){
        if(!this.config) return;

        const objMap = obj || this.config;

        Object.keys(objMap).map(key => {
            let item = objMap[key];
            let objType = Object.prototype.toString.call(item);
            let modelKey = `${parentPrefix ? `${parentPrefix}_` : ''}${key}`;

            switch(objType){
                case '[object String]':
                    this.pointsModel[modelKey] = item;
                    break;
                case '[object Object]':
                    if(!item.points){
                        this.initPointsModel(item, modelKey);
                        return;
                    }

                    this.pointsModel[modelKey] 
                        = Object.assign({}, JSON.parse(JSON.stringify(item)), {
                            points: item.points
                            .filter(p => !!this.getKey(p))
                            .map((p, ind) => {
                                let decimal = 0;
                                let {decimal: finalDecimal, fact} = p;
                                if(fact && !isNaN(fact)){
                                    //TODO 根据配置的因子和位数计算获取数据时位数
                                }else if(finalDecimal){
                                    decimal = finalDecimal;
                                }
                                let id = `${modelKey}${ind}`;
                                let key = this.getKey(p);
                                this.pointsMap[id] = {
                                    key,
                                    modelKey,
                                    cfg: JSON.parse(JSON.stringify(p))
                                };
                                return {
                                    id,
                                    decimal,
                                    name: p[isZh ? 'name' : 'name_en'],
                                    value: '',
                                    unit: p.unit,
                                    key,
                                    cfg: JSON.parse(JSON.stringify(p))
                                };
                            })
                        }, !item.quotas ? {} : {
                            quotas: item.quotas.filter(p => !!this.getKey(p)).map((p, ind) => {
                                let decimal = 0;
                                let {decimal: finalDecimal, fact} = p;
                                decimal = finalDecimal;
                                let id = ``;
                                let key = this.getKey(p);
                                return {
                                    id,
                                    decimal,
                                    name: p[isZh ? 'name' : 'name_en'],
                                    value: '',
                                    unit: p.unit,
                                    key,
                                    cfg: JSON.parse(JSON.stringify(p))
                                };
                            })
                        });
                    break;
                default:
                    break;
            }            
        });
    }

    /**
     * 初始化state和更新state
     * @param init 
     * @param idDataMap 
     * @param keys 
     * @returns 
     */
    changeState(init: boolean = true, idDataMap={}, keys: string[] = []){
        if(!this.config) return;

        let state: {[k: string]: any} = {};
        Object.keys(this.pointsModel)
        .filter(key => keys.length === 0 || keys.indexOf(key) > -1)
        .map(key => {
            let item = this.pointsModel[key];
            
            switch(typeof item){
                case 'string':
                    state[key] = item;
                    break;
                case 'object':
                    let {type, title='', points=[], showKey, yAxisName='', total} = item;
                    switch(type){
                        case 'text':
                            state[key] = points.map(p => {
                                let {id, name, unit, value='', cfg={}} = p;
                                if(idDataMap[id]){
                                    let {display_value} = idDataMap[id];
                                    if(display_value){
                                        value = this.dataHandler(display_value, cfg);
                                    }
                                }
                                return {name, unit, value};
                            });
                            break;
                        case 'bar':{
                            let temp: {[k: string]: any} = {};
                            temp.data = points.map(p => {
                                let {id, name, unit, data=[], cfg={}} = p;
                                let {stack, color, inverse} = cfg;
                                if(idDataMap[id]){
                                    data = idDataMap[id]
                                    // .filter(d => {
                                    //     let {x, y} = d;
                                    //     return y !== '';
                                    // })
                                    .map(d => {
                                        let {x, y} = d;
                                        //IE HACK
                                        x = x.replace(/\-/g, '/');
                                        let val = y === '' ? '' : (inverse ? -1 : 1) * this.dataHandler(Number(y), cfg);
                                        return {
                                            unit,
                                            inverse,
                                            value: [new Date(x).getTime(), val]
                                        }
                                    });
                                }
                                return Object.assign({name, unit, data, stack, inverse}, color ? {color} : {});
                            });
                            if(init){
                                temp[`title`] = title;
                                temp.yAxisName = yAxisName;
                                temp.total = total;
                            }

                            state[key] = Object.assign({}, this.state[key] || {}, temp);
                        }
                        break;
                        case 'card':
                        case 'arealine':
                        {
                            if(showKey && init){
                                state[showKey] = false;
                            }

                            let temp: {[k: string]: any} = {};
                            if(init || Object.keys(idDataMap).filter(ele => Array.isArray(idDataMap[ele])).length > 0){
                                let spitData;
                                temp.eData = points
                                .filter(p => {
                                    return p.cfg.isCurve;
                                })
                                .map(p => {
                                    let {id, name, unit, data=[], cfg={}} = p;
                                    let {stack, color, inverse, splitPositiveNegative, curveType} = cfg;
                                    if(idDataMap[id]){
                                        let rawData = idDataMap[id]
                                        // .filter(d => {
                                        //     let {x, y} = d;
                                        //     return y !== '';
                                        // });
                                        if(!splitPositiveNegative){
                                            data = rawData.map(d => {
                                                let {x, y} = d;
                                                //IE HACK
                                                x = x.replace(/\-/g, '/');
                                                let val = y === '' ? '' : (inverse ? -1 : 1) * this.dataHandler(Number(y), cfg);
                                                return {
                                                    unit,
                                                    inverse,
                                                    value: [new Date(x).getTime(), val]
                                                }
                                            });
                                            return Object.assign({name, unit, data, stack, inverse, curveType}, color ? {color} : {});
                                        }else{
                                            let positiveData: any[] = [];
                                            let negativeData: any[] = [];
                                            data = rawData.map(d => {
                                                let {x, y} = d;
                                                //IE HACK
                                                x = x.replace(/\-/g, '/');
                                                let val = y === '' ? '' : (inverse ? -1 : 1) * this.dataHandler(Number(y), cfg);
                                                let meta = {
                                                    unit,
                                                    inverse,
                                                    value: [new Date(x).getTime(), val]
                                                };
                                                if(val === '' || val <= 0){
                                                    negativeData.push(meta);
                                                    positiveData.push(Object.assign({}, meta, {value: [new Date(x).getTime(), '']}));
                                                }else{
                                                    positiveData.push(meta);
                                                    negativeData.push(Object.assign({}, meta, {value: [new Date(x).getTime(), '']}));
                                                }
                                            });
                                            spitData = spitData || [];
                                            spitData.push(
                                                Object.assign({
                                                    name:splitPositiveNegative[1].name, 
                                                    unit, 
                                                    data: negativeData, 
                                                    stack, 
                                                    inverse,
                                                    curveType
                                                }, color ? {color} : {}),
                                                Object.assign({
                                                    name:splitPositiveNegative[0].name, 
                                                    unit, 
                                                    data: positiveData, 
                                                    stack, 
                                                    inverse,
                                                    curveType
                                                }, color ? {color} : {})
                                            );
                                            return null;
                                        }                                        
                                    }
                                    return null;
                                })
                                .filter(d => !!d);

                                if(spitData){
                                    temp.eData = temp.eData.filter(d => !!d).concat(spitData);
                                }
                            }

                            if(init || Object.keys(idDataMap).filter(ele => !Array.isArray(idDataMap[ele])).length > 0){
                                temp.textData = points
                                .filter(p => !('isText' in p.cfg) || p.cfg.isText )
                                .map(p => {
                                    let {id, name, unit, value='', cfg={}} = p;
                                    if(idDataMap[id]){
                                        let {display_value} = idDataMap[id];
                                        if(display_value){
                                            value = this.dataHandler(display_value, cfg);
                                        }
                                    }
                                    return {name, unit, value};
                                });
                            }
                            if(init){
                                temp.yAxisName = yAxisName;
                                temp.total = total;
                                temp.title = title;
                            }
                            
                            state[key] = Object.assign({}, this.state[key] || {}, temp);
                        }
                        break;
                        case 'status':{
                            if(!init){
                                points.map(p => {
                                    let {id, name, unit, value='', cfg={}} = p;
                                    let {storage, generation, sub, solar, loader} = cfg;
                                    if(idDataMap[id]){
                                        let {display_value} = idDataMap[id];
                                        if(display_value){
                                            value = this.dataHandler(display_value, cfg);
                                        }

                                        if(generation){
                                            state.isGenerate = !!(value && value > 0);
                                        }
                                        
                                        if(solar){
                                            state.isSolarGenerate = !!(value && value > 0);
                                        }
                                        if(loader){
                                            state.isLoader = !!(value && value > 0);
                                        }
                                        
                                        if(storage){
                                            /**
                                             * 大于0代表放电
                                             * 等于0代表停止
                                             * 小于0代表充电
                                             */
                                            if(value && value > 0){
                                                state.storageCharge = Direction.POSITION;
                                            }else if(value && value < 0){
                                                state.storageCharge = Direction.NEGATIVE;
                                            }else{
                                                state.storageCharge = Direction.ZERO;
                                            }
                                        }
                                        if(sub){
                                            if(value && value > 0){
                                                state.outputCharge = Direction.NEGATIVE;
                                            }else if(value && value < 0){
                                                state.outputCharge = Direction.POSITION;
                                            }else{
                                                state.outputCharge = Direction.ZERO;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        break;
                    }
                    break;
                default: break;                    
            }
        });

        this.setState({
            ...state
        },() => {
            //console.log(this);
        });
    }

    generateReq(dataType){
        let dyn: any[] = [];
        let oneHourDayHistory: any[]  = []; 
        let oneDayHistory: any[]  = [];
        let sevenDayHistory: any[]  = [];
        let oneShowDayHistory: any[]  = [];
        
        Object.keys(this.pointsModel)
        .filter(key => Array.isArray(this.pointsModel[key].points))
        .map(key => {
            let {type, showKey, points=[], dayRange, quotas=[]} = this.pointsModel[key];

            quotas.map(p => {
                const { id, key, decimal } = p;
                dyn.push({id, key, decimal});
            });

            if(showKey && !this.state[showKey]) return;

            points.map(p => {
                let {id, key, decimal, cfg={}} = p;
                let {isCurve, isSubtract} = cfg;
                switch(type){
                    case 'bar':
                        let temp;
                        if(dayRange){
                            temp = sevenDayHistory;
                        }else{
                            temp = oneHourDayHistory;
                        }
                        temp.push({
                            id,
                            key,
                            decimal,
                            sub_type: '4097',
                            sub_type_x: '4097',
                            arith_type: isSubtract ? 'subtract' : 'normal' //'normal'
                        });
                        break;
                    case 'arealine':
                        oneShowDayHistory.push({
                            id,
                            key,
                            decimal,
                            sub_type: '4097',
                            sub_type_x: '4097',
                            arith_type: isSubtract ? 'subtract' : 'normal' //'normal'
                        });
                        break;
                    case 'card':
                        dyn.push({id, key, decimal});
                        if(isCurve){
                            oneDayHistory.push({
                                id,
                                key,
                                decimal,
                                sub_type: '4097',
                                sub_type_x: '4097',
                                arith_type: isSubtract ? 'subtract' : 'normal' //'normal'
                            });
                        }
                        break;
                    default:                            
                        dyn.push({id, key, decimal});
                    break;
                }
            });
        });

        let historyReq = {
            branch_para_list: '',
            curve: [],
            curve_type: "4097",
            id: '',
            start_time: '',
            end_time: '',
            interval_type: 1, // 采样周期:0为秒,1为小时，2为天，3为月，4为年
            sample_cycle: 1,
            time_mode: '1'
        };

        switch(dataType){
            case 'dyn':
                return dyn.length > 0 ? dyn : null;
            case 'oneDayHistory':
                if(oneDayHistory.length > 0){
                    let now = DateUtil.format(new Date(), 0, 'yyyy-MM-dd');
                    let nowUtc = DateUtil.getUTCTime(now);
                    let sTtime = now + ' 00:00:00';
                    let eTtime = DateUtil.format(nowUtc, 1*24*60*60*1000, 'yyyy-MM-dd') + ' 00:00:00';
        
                    return Object.assign({}, historyReq, {
                        curve: oneDayHistory,
                        start_time: sTtime,
                        end_time: eTtime,
                        interval_type: 0,
                        sample_cycle: 60
                    });
                }
                return null;
            case 'oneShowDayHistory':
                if(oneShowDayHistory.length > 0){
                    let now = DateUtil.format(new Date(), 0, 'yyyy-MM-dd');
                    let nowUtc = DateUtil.getUTCTime(now);
                    let sTtime = now + ' 00:00:00';
                    let eTtime = DateUtil.format(nowUtc, 1*24*60*60*1000, 'yyyy-MM-dd') + ' 00:00:00';
        
                    return Object.assign({}, historyReq, {
                        curve: oneShowDayHistory,
                        start_time: sTtime,
                        end_time: eTtime,
                        interval_type: 0,
                        sample_cycle: 60
                    });
                }
                return null;
            case 'oneHourDayHistory':
                if(oneHourDayHistory.length > 0){
                    let now = DateUtil.format(new Date(), 0, 'yyyy-MM-dd');
                    let nowUtc = DateUtil.getUTCTime(now);
                    let sTtime = now + ' 00:00:00';
                    let eTtime = DateUtil.format(nowUtc, 1*24*60*60*1000, 'yyyy-MM-dd') + ' 00:00:00';
        
                    return Object.assign({}, historyReq, {
                        curve: oneHourDayHistory,
                        start_time: sTtime,
                        end_time: eTtime,
                        interval_type: 0,
                        sample_cycle: 3600
                    });
                }
                return null;
            case 'sevenDayHistory':
                if(sevenDayHistory.length > 0){
                    let now = DateUtil.format(new Date(), 0, 'yyyy-MM-dd');
                    let nowUtc = DateUtil.getUTCTime(now);
                    let eTtime = DateUtil.format(nowUtc, 1*24*60*60*1000, 'yyyy-MM-dd') + ' 00:00:00';
                    let sTtime = DateUtil.format(nowUtc, -6*24*60*60*1000, 'yyyy-MM-dd') + ' 00:00:00';
        
                    return Object.assign({}, historyReq, {
                        curve: sevenDayHistory,
                        start_time: sTtime,
                        end_time: eTtime,
                        interval_type: 2,
                        sample_cycle: 1
                    });
                }
                return null;
            default:return null
        }        
    }

    async getDyn(trigger?: boolean){
        let req = this.generateReq('dyn');

        if(trigger && this.dynTimer !== null){
            clearTimeout(this.dynTimer);
            this.dynTimer = null;
        }

        if(!req) return;

        const res = await _dao.getDynData(req);
        if(daoIsOk(res)){
            const data = res.data || [];
            let dataMap = {};
            let otherDynMap = {};
            let stateKey: any[]  = [];
            data.map(d => {

                // mock
                /* if(!d.display_value){
                    const fake = Math.random() * 1000;
                    d.display_value = fake < 800 ? fake : -fake;
                } */

                if(d.id){
                    dataMap[d.id] = d;
                    stateKey.push(this.pointsMap[d.id].modelKey);
                }else{
                    otherDynMap[d.key] = d.display_value;
                }
                
            });
            this.changeState(false, dataMap, stateKey);
            this.setState({
                otherDynMap: Object.assign({}, this.state.otherDynMap, otherDynMap)
            });
        }

        this.dynTimer = setTimeout(() =>{
            this.getDyn();
        },  TimerInterval as number);
    }

    async getHis(type, trigger?: boolean){
        let req, timeout;
        switch(type){
            case 'one':
                req = this.generateReq('oneDayHistory');
                timeout = CommonHisTimerInterval;
                break;
            case 'oneShow':
                req = this.generateReq('oneShowDayHistory');
                timeout = CommonHisTimerInterval;
                break;
            case 'hour':
                req = this.generateReq('oneHourDayHistory');
                timeout = CommonHisTimerInterval;
                break;
            case 'more':
                req = this.generateReq('sevenDayHistory');
                timeout = PowerHisTimerInterval;
                break;
        }

        if(trigger && typeof this.hisTimer[type] !== 'undefined' && this.hisTimer[type] !== null){
            clearTimeout(this.hisTimer[type]);
            this.hisTimer[type] = null;
        }
        
        if(!req || !timeout) return;

        const res = await _dao.getCurve(req);
        if(daoIsOk(res)){
            const data = res.data || [];
            let dataMap = {};
            let stateKey: any[] = [];
            data.map(d => {
                if(type === 'hour'){
                    //补全24:00数据
                    d.Points.push({
                        x: req.end_time,
                        y: ''
                    });
                }

                // mock
                /* const test = Math.random();
                d.Points.forEach((p,ind) => {
                    p.y = ind === 0 ? 0 : test * 1000000
                }); */

                dataMap[d.id] = d.Points;
                stateKey.push(this.pointsMap[d.id].modelKey);
            });
            this.changeState(false, dataMap, stateKey);
        }

        this.hisTimer[type] = setTimeout(() =>{
            this.getHis(type);
        },  timeout);
    }

    getData(onlyOne?: boolean, trigger?: boolean){
        this.getDyn(trigger);
        if(onlyOne){
            this.getHis('one', trigger);
        }else{
            this.getHis('hour', trigger);
            this.getHis('oneShow', trigger);
            //this.getHis('more', trigger);
        }
    }

    getKey(point){
        const nodeAlias = this.nodeAlias;
        const splitStr = '.';
        const fixNodeAlias = nodeAlias.split(splitStr).slice(0, 5 - point.key.split(splitStr).length).join(splitStr);
        return `1:${point.table}:${`${fixNodeAlias}${point.key ? `.${point.key}` : ''}`}:${point.field}`;
    }

    dataHandler(val, point){
        let valType = typeof val;
        if(valType !== 'string' && valType !== 'number'){
            return val;
        }

        if(val === ''){
            return val;
        }
    
        if(Object.prototype.toString.call(point) !== '[object Object]'){
            return val;
        }
    
        val = String(val === 0 ? 0 : val||'').replace(/\,/g, '');
        if(val && !isNaN(val) && point.factor && !isNaN(point.factor)){
            val = (Number(val) * Number(point.factor));
        }
        
        val = String(val);
        if(val && !isNaN(val) && point.decimal && !isNaN(point.decimal)){
            val = NumberUtil.round(Number(val), point.decimal);
        }
    
        return Number(val);
    };

    showModels(){
        if(!(/(^\?|.*\&)+?debug(\=.*|\&.*|\s)/.test(window.location.search)))return;
        
        const models = this.pointsModel || {};
        notification.open({
            message: '调试别名查看',
            duration: null,
            closeIcon: <span style={{color: '#fff'}}>关闭</span>,
            style: {
                width: 600,
                height: 550,
                overflow: 'auto',
                background: 'rgba(3, 20, 43, .8)'
            },
            description: Object.keys(models).filter(k => k !== 'title').map((k) => {
                const { points=[], moduleTitle} = models[k];
                return <div key={k}>
                    <div>{moduleTitle}</div>
                    <div style={{paddingLeft: 50}}>{
                        points.map((p) => {
                            const {id, key, cfg: {name}} = p;
                            return <div key={id}>
                                <span>{name}: </span>
                                <span>{key}</span>
                            </div>;
                        })
                    }</div>                    
                </div>;
            })
        });
    }

    renderCard(){
        let cards = [{
            nameKey: 'sub',
            stateKey: 'showSub',
            ref: 'btn-sub',
            position: 'rt',
            dataKey: 'cards_sub'
        },{
            nameKey: 'wtg',
            stateKey: 'showWtg',
            ref: 'btn-wtg',
            position: 'lb',
            dataKey: 'cards_wtg'
        },{
            nameKey: 'ess',
            stateKey: 'showEss',
            ref: 'btn-ess',
            position: 'lt',
            dataKey: 'cards_ess'
        },{
            nameKey: 'solar',
            stateKey: 'showSolar',
            ref: 'btn-solar',
            position: 'lb',
            dataKey: 'cards_solar'
        },{
            nameKey: 'loader',
            stateKey: 'showLoader',
            ref: 'btn-loader',
            position: 'lt',
            dataKey: 'cards_loader'
        }];

        const renderOther = (quotas) => {
            const length = quotas.length;
            return <span>({
                quotas.map((quota, ind) => {
                    const { key, unit, cfg } = quota;
                    return <>
                    <span key={ind}>
                        <span>{this.dataHandler(this.state.otherDynMap[key] ?? '', cfg)}</span>
                        {unit && <span>{unit}</span>}
                    </span>
                    {ind < length - 1 && <span>/</span>}
                    </>;
                })
            })</span>;
        }

        return cards.map((card, ind) => {
            let {nameKey, stateKey, ref, position, dataKey} = card;
            let models = this.pointsModel[dataKey] || {};
            let quotas = models.quotas ||[];

            return [
                <div key={0} className={`${styles.btn} ${styles[`btn${ind+1}`]}`} ref={ref}>
                    <button onClick={(e) => {
                        let show = !this.state[stateKey];
                        this.setState({
                            [stateKey]: show
                        }, () => {
                            if(show){
                                this.getData(true, show);
                            }                            
                        });
                    }}>
                        {`${msg(nameKey)}`}
                        {quotas.length > 0 ? renderOther(quotas) : ''}
                    </button>
                </div>,            
                this.state[stateKey] ? 
                <Card 
                    key={1}
                    title={msg('dayPowerCurve')}
                    source={()=>this.refs[ref]}
                    position={position}
                    className={styles.card}
                    data={this.state[dataKey]}
                    hasPower={((this.pointsModel[dataKey] || {}).points || []).find(p => String(p.cfg.table) === '35')}
                /> : null            
            ];
        });        
    }

    render() {        
        return (
            <div className={styles.main}>
                <div className={styles.spin}></div>
                <SvgAnimate 
                    isGenerate={this.state.isGenerate}
                    isSolarGenerate={this.state.isSolarGenerate}
                    isLoader={this.state.isLoader}
                    storageCharge={this.state.storageCharge}
                    outputCharge={this.state.outputCharge}
                    className={styles.animate}
                />
                <div className={styles.side}>
                    <div
                        className={styles.headline} 
                        dangerouslySetInnerHTML={{__html: text(this.state.title)}}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            this.showModels();
                            e.stopPropagation();
                        }}
                    >
                    </div>

                    <div className={styles.list}>
                        <List 
                            data={this.state.leftTop}
                        />
                    </div>

                    <div className={styles.sideCenter}>
                        <div>{(this.state.leftCenter || {}).title}</div>
                        <div>
                            <EchartsWrap
                                resizeDelay={200}
                                getOption={getAreaLineOption}
                                data={{
                                    data: this.state.leftCenter?.eData,
                                    yAxisName: 'MW',
                                    hasPower: ((this.pointsModel.leftCenter || {}).points || []).find(p => String(p.cfg.table) === '35')
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.sideBottom}>
                        <div className={(this.state.leftBottom || {}).title ? styles.space : ''}>{(this.state.leftBottom || {}).title}</div>
                        <div className={(this.state.leftBottom || {}).title ? styles.space : ''}>
                            <EchartsWrap
                                resizeDelay={200}
                                getOption={getAreaLineOption}
                                data={{
                                    data: this.state.leftBottom?.eData,
                                    yAxisName: 'MW',
                                    hasPower: ((this.pointsModel.leftBottom || {}).points || []).find(p => String(p.cfg.table) === '35')
                                }}
                            />
                        </div>
                    </div>
                </div>

                {this.renderCard()}

                <EnvLoading isLoading={this.state.isLoading} />
            </div>
        );
    }
};

// components/Card.tsx 使用了center容器, 若有变动需要一起改动
ReactDOM.render(<Erds />, document.getElementById('center'));

export default Erds;

/* eslint-enable */
