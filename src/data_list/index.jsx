import '../common/css/app.scss';

import * as React from 'react';
import ReactDOM from 'react-dom'
import _ from 'lodash';
import { Collection, AutoSizer } from 'react-virtualized';
import ReactComponentRenderer from 'ReactComponentRenderer';
import ScadaCfg, { TimerInterval } from '../common/const-scada';
import { navTo, PointEvt } from '../common/util-scada';
import { scadaVar, isDevelopment } from '../common/constants';
import { LegalData, EmptyList, _dao } from '../common/dao';
import { DateUtil, BStools, uuid } from '../common/utils';
import EnvLoading from '../components/EnvLoading';
import { notify } from '../components/Notify';
import Alarm from './alarm';
import {ShowToken, SetToken} from '@/components_utils/Token';
import { msg } from './constant';
import styles from './style.mscss';

let defaultIconPath = '';
let defaultSvgFile = '';
let defaultTokenData = [];
let defaultTopAlias = '';

if (process.env.NODE_ENV === 'development') {
    defaultIconPath = '../../icons/';
    defaultSvgFile = require('!file-loader?name=assets2/[name].[hash].svg!./max_wtg.svg').default;
    defaultTokenData = [{
        alias: 'SXGL.T1_L1.WTG008',
        tokenPath: '../../icons/Grounding.png'
    },{
        alias: 'EMS_TEST',
        tokenPath: '../../icons/Grounding.png'
    }];
    defaultTopAlias = 'USCADA.Farm.Statistics';
}

const replaceSvgImg = (svgText, imgPath) => {
    let svgUtil = scadaVar('SYS_BASE.svg') || {};
    let imgScadaPath = svgUtil.iconImgUrl || '';
    svgText = svgText || '';
    imgPath = imgPath || imgScadaPath || defaultIconPath;
    svgText = svgText.replace(/(<image[^>]*xlink:href=")([^">]*)"/g, function(all, $1, $2){
        let path = imgPath + $2;
        return $1 + (svgUtil.addSuffix ? svgUtil.addSuffix(path) : path) + '"';
    });
    svgText = svgText.replace(/(hov_pic=")([^">]*)"/g, function(all, $1, $2){
        let path = imgPath + $2;
        return $1 + (svgUtil.addSuffix ? svgUtil.addSuffix(path) : path) + '"';
    });
    return svgText;
}

const MIN_MARGIN = 5;
const TOKEN_SIZE = 20;
const scrollBarWidth = BStools.getScrollWidth();
let defaultReq = {
    id: '',
    data_level: 'wtg',
    device_type: '',
    root_nodes: defaultTopAlias,
    paras: [],
    page_num: 1,
    row_count: 3000000,
    top_rows: '',
    order_by: 'WTG.Name',
    is_asc: 1,
    if_filter: false,
    filters: [],
    tree_grid: false,
    need_color: false
};

class InfiniteLoader extends React.PureComponent {

    static defaultProps = {
        width: 1414,
        height: 650,

        // 是否分组
        isGroup: true,

        // 以下是数据刷新参数
        topAlias: defaultTopAlias,
        deviceType: 'wtg',
        filters: [],
        filterPhaseAlias: '',
        sortOrderNo: false,

        // 卡片对应svg文件
        svgFile: defaultSvgFile,
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
        tokenData:defaultTokenData,

        loadingContainer: null,

        // 分组时场站名称竖排
        verticalSiteName: false,
	
	    /**
         * 按馈线分组显示
         */
        isGroupByFeeder: true,

        /**
         * 状态别名,如果有则会按状态变化进行闪烁
         * 原页面只有过滤时才生效
         * 第一次展示无需闪烁
         * 确认后无需闪烁
         */
        flashByState: ''
    }

    constructor(props) {
        super(props);

        this.defaultNameKey = 'WTG.Name';
        this.defaultAliasKey = 'WTG.Alias';
        this.defaultFarmNameKey = 'Farm.Name';

        this.collectRef = React.createRef(null);
        this.overscanStartIndex = 0;
        this.overscanStopIndex = 0;
        this.visibleStartIndex = 0;
        this.visibleStopIndex = 0;
        this.sizedWidth = undefined;
        this.sizedHeight = undefined;

        this.firstDynReq = true;
        this.reRequest = true;
        this.timerIdDevice = null;
        this.timerIdDyn = null;

        // related to loaded svg file
        this.svgFile = {};
        this.svgAttr = {};
        this.svgText = '';
        this.svgModel = [];

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

        // key is device alias, value is object
        this.cache = {};

        // event flag
        this.scrollStartTime = 0;
        this.eventStartTime = 0;
        this.longPress = false;
        this.longPressTimeout = null;

        // alarm component
        this.alarmComponet = React.createRef(null);

        this.state = {
            data: [],
            loading: false,
            /**
             * 第一次不使用,配合flashByState使用
             * 新增或第二次请求状态变化时闪烁,确认后不闪烁,状态再次变化闪烁,周而复始
             * 消失
             */
            flashDevice: [],
            flashStateDevice: []
        };
    }

    svgTemplate(text){
        return `##${text}##`;
    }

    /**
     * 有过滤且有状态才会闪烁
     * @returns {Boolean}
     */
    needFlash(){
        const flashEnabled = (window.get_web_cfg?.('flash_enabled') ?? '').toLowerCase() === 'true'
        const {filters=[], flashByState} = this.props;
        if(!flashByState || !flashEnabled) return false;

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

    /**
     * 
     * @param {*} svgFile 
     * @param {*} cb 
     * @param {Boolean} rerender 更换文件时需要重新渲染
     * @returns 
     */
    fetchSvg(svgFile, cb, rerender){
        let loadSvgFinished = false;

        if(!svgFile){
            typeof cb === 'function' && cb(loadSvgFinished);
            return;
        }

        if(this.svgFile[svgFile]){
            this.svgAttr = this.svgFile[svgFile].attrs;
            this.svgModel = this.svgFile[svgFile].model;
            this.svgText = this.svgFile[svgFile].text;
            typeof cb === 'function' && cb(true);

            if(rerender){
                this.forceUpdate();
                if(this.collectRef.current){
                    this.collectRef.current.recomputeCellSizesAndPositions();
                }
            }
            return;
        }

        fetch(BStools.addUrlQuery(svgFile, {_: ScadaCfg.getVid() || ''}))
        .then((res) => {
            if(!res.ok){
                throw new Error('load svg failed');
            }

            return res.text();
        })
        // eslint-disable-next-line complexity
        .then((res) => {
            this.svgAttr = {};
            this.svgModel = [];
            this.svgText = '';

            res = replaceSvgImg(res);

            let divEle = document.createElement('div');
            divEle.innerHTML = res;
            let svgEle = divEle.children[0];
            this.svgAttr = BStools.getNodeAttrs(svgEle);
            let $gDyns = $(svgEle).find('g[dyn_param]');

            // prevent the same with other dynamic tags
            $gDyns.removeAttr('id');
            $(svgEle).find('g[id]').removeAttr('id');

            for (let k = 0, l = $gDyns.length; k < l; k++) {
                let gNode = $gDyns[k];
                let attr = BStools.getNodeAttrs(gNode);        
                let href = undefined;
                let temp = gNode.childNodes || [];

                for (let j = 0, jl = temp.length; j < jl; j++) {
                    let cNode = temp[j];
                    if (cNode.nodeType === Node.ELEMENT_NODE &&
                        String(cNode.nodeName) === 'use'
                    ) {
                        let xhref = cNode.attributes['xlink:href'];
                        if (xhref) {
                            href = xhref.value;
                            cNode.setAttribute('xlink:href', this.svgTemplate(attr.dyn_param));
                            break;
                        }
                    } else if (String(cNode.nodeName) === 'text') {
                        cNode.innerHTML = this.svgTemplate(attr.dyn_param);

                        // used by toking
                        attr.x = cNode.attributes['x']?.value || 0;
                        attr.y = cNode.attributes['y']?.value || 0;
                    }
                }
    
                if (attr.expression) {
                    let expressionStr = attr.dyn_param || '';
                    let reg = new RegExp('<([^<,]*),([^<,]*),([^<,]*)>', 'gi');
                    let temp = reg.exec(expressionStr);
                    let variables = [];
                    while (temp) {
                        variables.push([temp[1], temp[3]]);
                        temp = reg.exec(expressionStr);
                    }
                    attr.variables = variables;
                }
    
                // token on bay name
                const enableToken = /1:[^:]*:[^:]*:(1|3)$/.test(attr.dyn_param);
                attr.enableToken = enableToken;
                this.svgModel.push(Object.assign({}, attr, href ? {
                    xhref: href
                } : {}));
            }

            try{
                svgEle.setAttribute('width', this.svgTemplate('width'));
                svgEle.setAttribute('height', this.svgTemplate('height'));
                svgEle.setAttribute('viewBox', `0 0 ${this.svgAttr.width} ${this.svgAttr.height}`);
            }catch(e){};
            
    
            this.svgText = svgEle.outerHTML;

            this.svgFile[svgFile] = {
                attrs: JSON.parse(JSON.stringify(this.svgAttr)),
                model: JSON.parse(JSON.stringify(this.svgModel)),
                text: this.svgText
            };

            loadSvgFinished = true;

            if(rerender){
                this.forceUpdate();
                if(this.collectRef.current){
                    this.collectRef.current.recomputeCellSizesAndPositions();
                }
            }
        })
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            typeof cb === 'function' && cb(loadSvgFinished);
        });
    }

    fetchDevice(afterGet, loading, reRequest) {
        if(loading && !this.state.loading){
            this.setState({loading: true});
        }

        clearTimeout(this.timerIdDevice);

        const {deviceType, topAlias, filters=[], isGroupByFeeder , flashByState} = this.props;
        const paras = [];
        filters.forEach(f => {
            const points = f.col_name.split(':');
            paras.push({
                type: points[0],
                field: points[1],
                decimal: 0
            });
        });
        if(flashByState && 
            !this.svgModel.find(ele => ele.dyn_param.indexOf(flashByState) > -1) &&
            !paras.find(ele => ele.type === flashByState)
        ){
            paras.push({
                type: flashByState,
                field: '9',
                decimal: 0
            });
        }

        let req = [];
        req.push(
            Object.assign({}, defaultReq, {
                root_nodes: topAlias,
                data_level: deviceType,
                device_type: '',
                filter_bay_type: '',
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

                        this.deviceData = temp.filter(d => {
                            const { phaseAlias } = d;

                            // 不存在的不过滤,原有逻辑
                            return !phaseAlias || !filterPhaseAlias || phaseAlias === filterPhaseAlias;
                        });
                    }else{
                        this.deviceData = [];
                    }
                });
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => {

                // convenient to participate in the calculation later
                this.deviceByFac = {};
                this.indexByFac = {};
                this.deviceCountByPhaseFeeder = {};
                this.phaseFeederByFac = {};
                this.indexByPhaseFeeder = {};

                let facIndex = 0;
                let feederIndex = 0;
                let temp = {};
                // 闪烁时使用,记录新的设备mapping
                let deviceAliasMapping = {};
                this.deviceData.forEach(d => {
                    deviceAliasMapping[d[this.defaultAliasKey]] = 1;
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

                // 闪烁时需要的新增设备列表
                let newDevice = [];
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

                const data = this.concatData();

                this.setState(Object.assign({}, {
                    data
                }, 
                loading ? {loading: false} : {},
                {flashDevice: reRequest ? [] : newDevice}
                ), () => {
                    clearTimeout(this.timerIdDevice);
                    this.timerIdDevice = setTimeout(this.fetchDevice.bind(this), 6000);
                }); 
            });
    }

    fetchDyn(loading, reRequest){
        if(loading && !this.state.loading){
            this.setState({loading: true});
        }

        clearTimeout(this.timerIdDyn);
        
        let {flashByState} = this.props;
        let dynReq = [];
        let stateModel;
        let fromDyn = false;
        // 动态字里可能含有公式的状态点,如果没有再用普通的测点
        if(flashByState){
            stateModel = this.svgModel.find(m => m.dyn_param.indexOf(flashByState) > -1);
            if(stateModel){
                stateModel = stateModel.dyn_param;
                fromDyn = true;
            }
            if(!stateModel){
                stateModel = flashByState + ':9';
            }
        }

        this.deviceData.forEach((d, ind) => {

            const alias = d[this.defaultAliasKey];

            if (this.firstDynReq) {
                if (dynReq.length < 300) {
                    this.svgModel.map(m => {
                        if (m.variables) {
                            m.variables.forEach(v => {
                                dynReq.push({
                                    id: '',
                                    key: v[1].replace(/({[^}]*})/g, alias),
                                    decimal: m.decimal || 0
                                });
                            });
                        } else {
                            dynReq.push({
                                id: '',
                                key: m.dyn_param.replace(/({[^}]*})/g, alias),
                                decimal: m.decimal || 0
                            });
                        }

                    });
                }
            } else if (ind >= this.visibleStartIndex && ind <= this.visibleStopIndex) {
                this.svgModel.map(m => {
                    if (m.variables) {
                        m.variables.forEach(v => {
                            dynReq.push({
                                id: '',
                                key: v[1].replace(/({[^}]*})/g, alias),
                                decimal: m.decimal || 0
                            });
                        });
                    } else {
                        dynReq.push({
                            id: '',
                            key: m.dyn_param.replace(/({[^}]*})/g, alias),
                            decimal: m.decimal || 0
                        });
                    }

                });
            }
        });

        if (dynReq.length > 0) {
            this.firstDynReq = false;
            _dao.getDynData(dynReq)
                .then(res => {
                    if (String(res.code) === '10000') {
                        this.dynData = res.data || [];
                    }
                })
                .finally(() => {
                    const data = this.concatData();

                    let notSameStateDevice = [];
                    if(this.needFlash() && stateModel){
                        let aliasArr = [];
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
                            let newState = newDataMap[alias];
                            let oldState = oldDataMap[alias];
                            let isSame = true;
                            if(newState && oldState && newState[stateModel] && oldState[stateModel]){
                                isSame = !fromDyn 
                                ? newState[stateModel] === oldState[stateModel] 
                                : newState[stateModel].display_value === oldState[stateModel].display_value;
                            }
                            if(!isSame || this.state.flashStateDevice.indexOf(alias) > -1){
                                notSameStateDevice.push(alias);
                            }
                        });
                    }

                    this.setState(Object.assign({}, {
                        data
                    }, 
                    loading ? {loading: false} : {},
                    {flashStateDevice: reRequest ? [] : notSameStateDevice}
                    ), () => {
                        if(reRequest) this.reRequest = false;

                        clearTimeout(this.timerIdDyn);
                        this.timerIdDyn = setTimeout(this.fetchDyn.bind(this), TimerInterval);
                    });
                });
        }else{
            if(reRequest) this.reRequest = false;

            clearTimeout(this.timerIdDyn);
            this.timerIdDyn = setTimeout(this.fetchDyn.bind(this), TimerInterval);
        }
    }

    concatData(){
        let dynDataMap = {};
        this.dynData.forEach(d => {
            let pointData = JSON.parse(JSON.stringify(d));
            delete pointData.timestamp;
            dynDataMap[d.key] = pointData;
        });

        let newDeviceData = this.deviceData.map((ele, ind, arr) => {
            const deviceAttr = JSON.parse(JSON.stringify(ele));
            const deviceAlias = deviceAttr[this.defaultAliasKey];

            this.svgModel.forEach(m => {
                if (m.expression) {
                    let exp = m.expression;
                    let count = 0;
                    m.variables.forEach(v => {
                        let val = '';
                        let dyn = dynDataMap[v[1].replace(/({[^}]*})/g, deviceAlias)];
                        if (dyn) {
                            val = ('raw_value' in dyn ? dyn.raw_value : dyn.display_value).replace(/\,/g, '');
                            count = count + 1;
                        }

                        // given a default value 0 when no value
                        // otherwise generate error when evaling
                        exp = exp.replace(v[0], !val ? '\'\'' : val);
                    });

                    if(count === m.variables.length){
                        let expVal = '';
                        try {
                            expVal = new Function('return ' + exp)();
                        } catch (error) {
                            console.error(error);
                            console.error(`device: ${deviceAlias}`);
                            console.error(`variables: ${String(m.variables)}`);
                            console.error(`expression: ${exp}`);
                        }
                        deviceAttr[m.dyn_param] = {
                            display_value: String(expVal)
                        };
                    }
                    
                } else {
                    let dyn = dynDataMap[m.dyn_param.replace(/({[^}]*})/g, deviceAlias)];
                    if (dyn) {
                        deviceAttr[m.dyn_param] = Object.assign({}, dyn);
                    }
                }
            });

            return deviceAttr;
        });

        newDeviceData = newDeviceData.map(ele => {
            const deviceAlias = ele[this.defaultAliasKey];
            let cacheData = this.cache[deviceAlias];
            if(cacheData){
                let temp = Object.assign({}, cacheData, ele);
                this.cache[deviceAlias] = temp;
                return JSON.parse(JSON.stringify(temp));
            }
            this.cache[deviceAlias] = JSON.parse(JSON.stringify(ele));
            return ele;
        });

        return newDeviceData;
    }

    init(rerender, loading){
        // 重新请求时删除所有闪烁
        this.reRequest = true;
        this.setState({
            flashDevice: [],
            flashStateDevice: []
        });

        if(loading){
            this.setState({loading: true});
        }
        this.fetchSvg(this.props.svgFile, (ok) => {
            if(ok){
                if(this.props.stopRefresh){
                    if(loading){
                        this.setState({loading: false});
                    }
                    return;
                }

                this.fetchDevice(() => {
                    this.fetchDyn(loading, this.reRequest);
                }, loading, this.reRequest);
            }else{
                if(loading){
                    this.setState({loading: false});
                }
                notify(msg('errorFile'));
            }
        }, rerender);
    }

    componentDidMount() {
        this.init(false, true);
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEqual(nextProps.filters, this.props.filters) || 
            !_.isEqual(nextProps.tokenData, this.props.tokenData) || 
            (nextProps.isGroupByFeeder !== this.props.isGroupByFeeder)
        ){
            this.forceUpdate();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.stopRefresh !== this.props.stopRefresh ||
            prevProps.svgFile !== this.props.svgFile ||
            !_.isEqual(prevProps.filters, this.props.filters) ||
            prevProps.filterPhaseAlias !== this.props.filterPhaseAlias || 
            prevProps.flashByState !== this.props.flashByState
        ){
            this.clear();
            this.init(prevProps.svgFile !== this.props.svgFile, true);
        }
        if(prevProps.widthResize !== this.props.widthResize || 
            prevProps.heightResize !== this.props.heightResize
        ){
            if(this.collectRef.current){
                this.collectRef.current.recomputeCellSizesAndPositions();
            }
        }
    }

    componentWillUnmount() {
        this.clear();
    }

    clear(){
        clearTimeout(this.timerIdDevice);
        clearTimeout(this.timerIdDyn);
    }

    onMouseDown(deviceAlias, event){
        const eventBtn = event.button;
        const eventBtns = event.buttons;

        // trigger when pressing left mouse button
        if(eventBtn === 0 || eventBtns === 1){
            this.longPress = false;

            // react synthetic event does not exist
            const newEvent = {...event};
            this.longPressTimeout = setTimeout(function(){
                this.longPress = true;
                this.onLongPress(deviceAlias, newEvent);
            }.bind(this), 500);
        }
        
        event.stopPropagation();
    }

    onMouseUp(deviceAlias, event){
        const eventBtn = event.button;
        const eventBtns = event.buttons;

        // trigger when pressing left mouse button
        if(eventBtn === 0 || eventBtns === 1){
            if(!this.longPress){
                clearTimeout(this.longPressTimeout);
                navTo(deviceAlias, {compatible: true});
            }
        }
        
        event.stopPropagation();
    }

    onLongPress(deviceAlias, event){
        let curTarget = event.currentTarget;
        let target = event.target;
        let dynParam;

        while(curTarget.contains(target)){
            const attrs = BStools.getNodeAttrs(target);
            if(attrs.dyn_param && !attrs.expression){
                dynParam = attrs.dyn_param.replace(/({[^}]*})/g, deviceAlias);
                break;
            }
            target = target.parentNode;
        }

        if(dynParam){
            const virtualEvent = {...event};
            virtualEvent.currentTarget = null;
            PointEvt.popMenu(dynParam, virtualEvent);
        }
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

    onMouseLeave(deviceAlias, event){
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
            isGroup,
            width: containerWidth, 
            height: containerHeight, 
            widthResize, 
            heightResize,
            isGroupByFeeder
        } = this.props;
        const {width, height} = this.svgAttr;

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
        const nameSize = (isGroup || (isGroupByFeeder && feeders.length > 0)) ? Number(styles.nameSize) : Number(styles.noNameSize);
        const itemBorder = Number(styles.itemBorder);
        containerWidth = containerWidth - nameSize - itemBorder;

        /**
         * calculate number of arranging cards in a row and rows of cards in a cell(a fac)
         */     
        const numPerRow = parseInt(containerWidth / (itemWidth + MIN_MARGIN));
        /**
         * 每个卡片横向间隙
         */
        const widthPad = parseInt(containerWidth / numPerRow - itemWidth);

        let farmCount = 0;
        let farmAllGroup = 0;
        let farmGroupMap = {};
        let farmGroupBlank = {};
        let allRows = 0;
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
                prevBlankDeviceCount += farmGroupBlank[`${farmIndex}_${i}`] || 0;
                prevGroupCount += 1;
            }
        }
        while(temp >= 0){
            prevBlankDeviceCount += farmIndexBlank[temp];
            prevGroupCount += farmGroupMap[temp];
            temp -= 1;
        }

        /**
         * 每个场站项最终所有行数
         */
        rowIndex = Math.ceil((index + 1 + prevBlankDeviceCount) / numPerRow);


        /**
         * 每个场站项顶部padding大小
         */
        const itemTopPad = Number(styles.itemTopPad);
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
            numPerRow: numPerRow
        };
    }

    cellGroupRenderer({ cellRenderer, indices, cellSizeAndPositionGetter }){
        this.visibleStartIndex = indices[0] || 0;
        this.visibleStopIndex = indices[indices.length - 1] || 0;

        const farmKey = this.defaultFarmNameKey;
        const defaultAliasKey = this.defaultAliasKey;
        const defaultNameKey = this.defaultNameKey;
        const {widthResize, heightResize, isGroup, showToken, tokenData, verticalSiteName, isGroupByFeeder} = this.props;
        const {width, height} = this.svgAttr;
        const newWidth = Number(width) * widthResize;
        const newHeight = Number(height) * heightResize;

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
        indices.forEach((ind) => {
            let d = data[ind];
            d._index_ = ind;
            farmMap[d[farmKey]] = farmMap[d[farmKey]] || [];
            farmMap[d[farmKey]].push(d);

            farmNameAlias[d[farmKey]] = d[defaultAliasKey].split('.')[0];
        });

        return Object.keys(farmMap).map((k, ind) => {
            let deviceList = farmMap[k];
            const farmAlias = farmNameAlias[k];

            const dimension = this.cellSizeAndPositionGetter({ index: deviceList[0]._index_ });
            const {numPerRow, width, height, x, y, cardHeight, itemY} = dimension;
            const itemTopPad = Number(styles.itemTopPad);
            const groupBottomBorderSize = Number(styles.groupBorderBottom);

            let facFeederList = [];
            const feeders = this.phaseFeederByFac[farmAlias] || [];
            let facTotalRow = Math.ceil(deviceList.length / numPerRow);
            let facGroup = 0;

            // 边侧文字最好不换行, 否则单组只有一行时会导致整个布局有异常
            const showSlider = isGroup || (isGroupByFeeder && feeders.length > 0);
            // 卡片高度太小时,左侧文字溢出
            const fontSize = (showSlider && cardHeight < 33) ? 12 : undefined;
            
            if(isGroupByFeeder && feeders.length > 0){
                let temp = {};
                let other = [];
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
                    if(fName && fName.startsWith(k)){
                        fName = fName.replace(k, '').trim();
                    }
                    return {
                        alias: f,
                        name: `${k} <br/> ${fName}`,
                        list: temp[f]
                    };
                });
                if(other.length > 0){
                    facFeederList.push({
                        name: `${k} <br/> (${msg('noFeeder')})`,
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
                                <div className={styles.aside}>
                                    <div>
                                        <ShowToken 
                                            tokenData={tokenMap[ele.alias]}
                                            imgProps = {{
                                                style: {
                                                    width: TOKEN_SIZE * widthResize,
                                                    height: TOKEN_SIZE * heightResize
                                                }
                                            }}
                                        ></ShowToken>
                                    </div>
                                    <div 
                                        style={fontSize ? {fontSize} : {}}
                                        className={`${styles.fac} ${verticalSiteName ? styles.facRotate : ''}`}
                                        dangerouslySetInnerHTML={{ __html: verticalSiteName ? ele.name.replace(/\d+/g, function(num) {
                                            return `<span class="${styles.facNum}">${num}</span>`;
                                        }) : ele.name }}
                                        onClick={(e) => {
                                            if(isDevelopment){
                                                SetToken(ele.alias);
                                            }else{
                                                PointEvt.popMenu(`1:430:${ele.alias}:1`, e.nativeEvent);
                                            }
                                        }}
                                    ></div>
                                </div> : 
                                null
                            }                
                                <div className={`${styles.child} ${showSlider ? styles.part : ''}`}>
                                {
                                    ele.list.map((device, ind2) => {
                                        let tokenContent = [];
                                        let content = this.svgText;
                                        this.svgModel.forEach((m, ind) => {
                                            const { dyn_param, xhref, enableToken, x, y} = m;

                                            let pointData = device[dyn_param] || {};
                                            let val = pointData.display_value || '';

                                            if (xhref) {
                                                let rawValue = 'raw_value' in pointData ? 
                                                    pointData.raw_value : 
                                                    pointData.display_value;
                                                val = `${xhref}_${rawValue || ''}`;
                                            }
                                            content = content.replace(this.svgTemplate(dyn_param), val);

                                            // token
                                            if(enableToken){
                                                const deviceAlias = device[defaultAliasKey];
                                                const dynParam = dyn_param.replace(/({[^}]*})/g, deviceAlias);
                                                if(dynParam.split(':')[2] === deviceAlias && Array.isArray(tokenMap[deviceAlias])){
                                                    tokenContent.push(
                                                        <div
                                                            key={deviceAlias}
                                                            style={{
                                                                position: 'absolute',
                                                                left: Number(x) * widthResize,
                                                                top: Number(y) * heightResize - 18 * heightResize,
                                                                height: TOKEN_SIZE * heightResize,
                                                                width: TOKEN_SIZE * widthResize * tokenMap[deviceAlias].length,
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            <ShowToken
                                                                tokenData= {tokenMap[deviceAlias]}
                                                                imgProps = {{
                                                                    style: {
                                                                        width: TOKEN_SIZE * widthResize,
                                                                        height: TOKEN_SIZE * heightResize
                                                                    }
                                                                }}
                                                            >
                                                            </ShowToken>
                                                        </div>
                                                    );
                                                }                                    
                                            }
                                        });

                                        const deviceAlias = device[defaultAliasKey];
                                        const deviceName = device[defaultNameKey];
                                        const isFlash = this.state.flashDevice.indexOf(deviceAlias) > -1 || 
                                            this.state.flashStateDevice.indexOf(deviceAlias) > -1;
                                        const flashBorderWidth = isFlash ? styles.flashBorder : 0;

                                        const finalWidth = newWidth - flashBorderWidth;
                                        const finalHeight = newHeight - flashBorderWidth;
                                        content = content
                                        .replace(this.svgTemplate('width'), finalWidth)
                                        .replace(this.svgTemplate('height'), finalHeight);
                                        
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
                                                className={`${isFlash ? styles.flash : ''}`}
                                            >
                                                {isFlash ? 
                                                    <div className={styles.flashConfirm}>
                                                        <span onClick={this.confirmFlash.bind(this, deviceName, deviceAlias)}>
                                                            {msg('flashConfirm')}
                                                        </span>
                                                    </div> : null
                                                }
                                                <div 
                                                    dangerouslySetInnerHTML={{ __html: content }}
                                                    onMouseDown={this.onMouseDown.bind(this, deviceAlias)}
                                                    onMouseUp={this.onMouseUp.bind(this, deviceAlias)}
                                                    onMouseEnter={this.onMouseEnter.bind(this, deviceAlias)}
                                                    onMouseLeave={this.onMouseLeave.bind(this, deviceAlias)}
                                                    style={{
                                                        width: finalWidth,
                                                        height: finalHeight
                                                    }}
                                                ></div>
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
                                return <div className={styles.noData}>{msg('noData')}</div>;
                            }}
                            onSectionRendered={({ indices }) => {
                                this.onMouseLeave();
                                this.scrollStartTime = new Date().getTime();
                                
                                setTimeout(() => {
                                    if(new Date().getTime() - this.scrollStartTime > 799){
                                        this.fetchDyn();
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

let instance = {};
export const InfiniteLoaderWidget = function (container, id, options={}) {
    id = id || uuid();

    if(!instance[id]){
        instance[id] = new ReactComponentRenderer(InfiniteLoader, container);
    }
    instance[id].setProps(options);
    
	return id;
}

export const setProps = function (id, options={}) {
    if(!id || typeof id !== 'string' || !instance[id])return;
    instance[id].setProps(options);

    if(window.___debug___){
        console.log(instance);
    }
}

if (process.env.NODE_ENV === 'development') {
    ReactDOM.render(<InfiniteLoader />, document.querySelector('#center'));
}