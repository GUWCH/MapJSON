/* eslint-disable */

import '../common/css/app.scss';
import './style.scss';
import React from 'react';
import PropTypes  from 'prop-types';
import EnvLoading from 'EnvLoading';
import { WidthProvider, Responsive } from 'react-grid-layout'
import _, { keys, result } from 'lodash';
import Intl, { msgTag } from '../common/lang';
import { DiffUtil, BStools, NumberUtil } from '../common/utils';
import { notify } from 'Notify';
import { InputNumber } from "../components";
import { NewSelect } from 'Select';
import { RadioGroup } from 'Radio';
import Dialog from 'Dialog';
import EmsDao from './dao'; 
import Tabs, { TabPane } from 'Tabs'
import Curve from './curve';
 
import * as echarts from 'echarts/core';
import { GridComponent, MarkLineComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

const isZh = (Intl.locale || '').toLowerCase().indexOf('cn') > -1;

const ResponsiveReactGridLayout  = WidthProvider(Responsive);

echarts.use(
    [GridComponent, MarkLineComponent, LineChart, CanvasRenderer]
);

const msg = msgTag('param');
const chartDefault = 0;
const CONNECT_STR = '.';
const __INS_INDEX_ = '__ins_index__';

// declare classname
const prefixCls = 'ems-set';
const prefixClsName = `${prefixCls}-name`;
const prefixClsContent = `${prefixCls}-content`;
const prefixClsContentDisabled = `${prefixClsContent}-disabled`;
const prefixClsContentLeft = `${prefixClsContent}-left`;
const prefixClsChild = `${prefixCls}-child`;
const prefixClsChildName = `${prefixCls}-child-name`;
const prefixClsChildInput = `${prefixCls}-child-input`;
const prefixClsChart = `${prefixCls}-chart`;
const prefixClsChartDisabled = `${prefixClsChart}-disabled`;
const prefixClsChartList = `${prefixClsChart}-list`;
const prefixClsChartShow = `${prefixClsChart}-show`;
const prefixClsChartCanvas = `${prefixClsChart}-canvas`;
const prefixClsChartRow = `${prefixClsChart}-row`;
const prefixClsDialog = `env-rc-dialog`;
const prefixClsDialogPaper = `${prefixClsDialog}-paper`;
const prefixClsDialogContainer = `${prefixClsDialog}-container`;
const prefixClsDialogTitle = `${prefixClsDialog}-title`;
const prefixClsDialogContent = `${prefixClsDialog}-content`;
const prefixClsDialogAction = `${prefixClsDialog}-action`;
const prefixClsDialogDel = `${prefixClsDialog}-del`;
const prefixClsCompare = `env-compare`;
const prefixClsCompareTable = `${prefixClsCompare}-table`;
const prefixClsCompareHl = `${prefixClsCompare}-highlight`;
const paramIndexArr = Array.from({length: 4}, (_, index) => index);

class Param extends React.Component{

    static propTypes = {
        facAlias: PropTypes.string,
        config: PropTypes.object,
        authMap: PropTypes.object,
		save: PropTypes.func
    };

    static defaultProps = {
        container: null,
        facAlias: '',
        config: {},
        authMap: {},
		sava: (data, callback)=>{}
	};

    constructor(props){
        super(props);
        
        this.chartDoms = {};
        this.charts = {};
        this._dao = new EmsDao();

        this.childIns = [];
        this.rawData = {};
        this.data = {};
        this.diff = {};
        this.newCharts = []
        this.tabsData = []
        this.tabsChartData={}

        this.state = {
            disable: true,
            openDialog: false,
            extCls: '',
            loading: false,
            curveTabKey: '0',
            needRender:true,
            prevTab:''
        }
    }

    componentWillMount(){

        // use JSON to remove property with undefined
        // lodash compare will not corrected when object contains property with undefined
        this.rawData = JSON.parse(JSON.stringify(this.getInitialData()));
        this.data = JSON.parse(JSON.stringify(this.rawData));
    }

    componentDidMount(){
        let {facAlias} = this.props;

        if(!facAlias){
            notify(msg('noPcc'));
        }else{
            // this.initChart();
            this.request();
            this.resize();
            window.addEventListener('resize', this.resize.bind(this));
        }
    }


    componentWillUnmount(){
        window.removeEventListener('resize', this.resize.bind(this));
    }

    resize = e => {
        this.setState({
            extCls: this.autoResponse()
        });
        this.resizeCharts();

        if(window.___debug___){
            console.log(this);
        }
    };

    autoResponse(){
        let { container } = this.props;

        if(!container instanceof HTMLElement)return;

        const contextWidth = container.clientWidth;
        if(contextWidth < 1085){
            return 'mini'
        }else if(contextWidth < 1230){
            return 'middle'
        }else {
            return ''
        }
    }

    resizeCharts(){
        Object.keys(this.charts).map(key => {
            // this.charts[key].map(el=>{
            const el = this.charts[key][this.state.curveTabKey]
            
            let chart = el;
            setTimeout(() => {
                chart.resize({
                    width: chart._dom.clientWidth,
                    height: chart._dom.clientHeight
                });
            }, 100);
        // })
        });
    }

    /**
     * 初始化数据和实例
     * @important
     * @returns {Object}
     */
    getInitialData(){
        let { facAlias, config={} } = this.props;
        let temp = {};

        const handle = (childModule, parentKeys=[], parentNames=[], auth='') => {
            let { children=[], charts=[] } = childModule || {};
            [].concat(children).concat(charts).map((point, ind) => {

                const child = new Child(point);
                const name = child.getDesc();
                const alias = Child.getAlias(child.getAlias(), facAlias);

                const keys = parentKeys.concat([ind]);
                const names = parentNames.concat([name]);
                const insIndex = this.childIns.length;

                /**
                 * 存储的数据模式
                 * 根据需要增加属性
                 */
                if(alias){
                    temp[keys.join(CONNECT_STR)] = {
                        alias,
                        value: '',
                        [__INS_INDEX_]: insIndex
                    };
                }

                child.setAlias(alias);
                child.setIndex(ind);
                child.setKeys(keys);
                child.setNames(names);
                if(auth && !child.getAuth()){
                    child.setAuth(auth);
                }
                this.childIns.push(child);

                // 实例化索引
                point[__INS_INDEX_] = insIndex;

                if(child.hasNext()){
                    handle(point, keys, names, child.getAuth());
                }
            });
        };
        Object.keys(config).map((parentKey, ind) => {
            let parent = new Parent(config[parentKey]);
            let auth = parent.getAuth();

            handle(config[parentKey] || {}, [parentKey], [parent.getTitle()], auth);
        });

        return temp;        
    }

    request(){
        // get multiple curves aliases
        const requestList = [{
                url: '/scadaweb/uniForward/ems/get_frCurves',
                method: 'GET'
            }]
        this._dao.send(requestList).then(dataArr => {
            const tabsData = dataArr[0]
            if(tabsData.code!=10000){
                notify(msg('quest fail'));
                return;
            }
   
            this.tabsData = tabsData.data
            this.getCurvesData()
            this.setState({prevTab:tabsData.data[0].tab_name})
        })
         
    }
    getCurvesData(tabIndex=0){
        let requestList =[];
        let req = [];
        let yxAlias = [];

        const el= this.tabsData[tabIndex]
            req = []
        this.childIns.map((child) => {
            const keyAlias = child.getKeyAlias(el.point_suffix);
            const constAlias = child.getYxAlias();
            req.push({
                id: '',
                decimal: child.getDecimal(),
                key: keyAlias
            })

            if(constAlias){
                yxAlias.push(constAlias);
            }
        });

        if(req.length > 0){
            requestList.push({
                url: '/scadaweb/get_dyndata',
                method: 'POST',
                data: {
                    branch_para_list: '',
                    data: req
                }
            })
        }

        if(yxAlias.length > 0){
            requestList.push({
                url: '/scadaweb/get_yx_const',
                method: 'POST',
                data: {
                    alias: yxAlias.join(',')
                }
            })
        }

        if(requestList.length === 0){
            return;
        }
        // 判断是否已经查询过了
        if(this.tabsChartData[this.tabsData[tabIndex].tab_name]){
            // 判断切换tab时触发
            if(this.state.prevTab && this.state.prevTab != this.tabsData[tabIndex].tab_name){
                this.tabsChartData[this.state.prevTab].data = _.cloneDeep(this.data)
                this.setState({prevTab:this.tabsData[tabIndex].tab_name},()=>{
                    this.rawData = _.cloneDeep(this.tabsChartData[this.tabsData[tabIndex].tab_name].rawData)
                    const newData = _.cloneDeep(this.tabsChartData[this.tabsData[tabIndex].tab_name].data)
                    // FrequencyArea 中前6个参数为公用参数
                    // const paramIndexArr = Array.from({length: 6}, (_, index) => index);
                    Object.keys(newData).map(el=>{
                        if(el.indexOf('FrequencyArea')==-1||(el.indexOf('FrequencyArea')!=-1&&paramIndexArr.includes(Number(el.split('.')[1])))){
                            newData[el] = this.data[el]
                        }
                    })
                     this.data = newData
                    Object.keys(this.charts).map((parentKey) => {
                        this.updateChart(parentKey);
                    });
                    // this.resizeCharts()
                    this.forceUpdate()
                })
            }
            
            return
        }else{
            this.setState({
                loading: true
            });      
            if(this.state.prevTab && this.state.prevTab!=this.tabsData[tabIndex].tab_name){
                this.tabsChartData[this.state.prevTab] ={
                    data: _.cloneDeep(this.data),
                    rawData: _.cloneDeep(this.rawData)
                }
            }
        
            this._dao.send(requestList).then(dataArr => {
                // 动态字
                const dynData = dataArr[0];
                if(!dynData || String(dynData.code) !== '10000'){
                    notify(msg('fail'));
                    return;
                }

                if(Array.isArray(dynData.data)){
                    const newData = _.cloneDeep(this.data)
                    dynData.data.map(d => {
                        let value = '';
                        let alias = d.key.split(':')[2];
                        let child = this.childIns.find(ins => {
                            return ins.getAlias(el.point_suffix) === alias;
                        });

                        if(!child)return;

                        let keys = child.getKeys();
                        let factor = child.getFactor();
                        let min = child.getMin();
                        let max = child.getMax();
                        if('raw_value' in d){
                            value = d.raw_value;
                        }else{
                            value = d.display_value;
                        }

                        value = toNumber(String(value).replace(/,/g, ''));
                        let fixValue = value;

                        // 初始值不在规定范围内先修正
                        if(typeof fixValue === 'number'){
                            if(min !== undefined && fixValue < min){
                                fixValue = min;
                            }
        
                            if(max !== undefined && fixValue > max){
                                fixValue = max;
                            }
                        }

                        this.rawData[keys.join(CONNECT_STR)].value = String(inputData(fixValue, factor));
                        newData[keys.join(CONNECT_STR)].value = String(inputData(value, factor));
                    });
                    if(this.state.prevTab && this.state.prevTab!=this.tabsData[tabIndex].tab_name){
                        // FrequencyArea 中前6个参数为公用参数
                    // const paramIndexArr = Array.from({length: 6}, (_, index) => index);
                    Object.keys(newData).map(el=>{
                        if(el.indexOf('FrequencyArea')==-1||(el.indexOf('FrequencyArea')!=-1&&paramIndexArr.includes(Number(el.split('.')[1])))){
                            newData[el] = this.data[el]
                        }
                    })}
                    this.data = newData
                    this.tabsChartData[this.tabsData[tabIndex].tab_name] = {
                        rawData:_.cloneDeep(this.rawData),
                        data:_.cloneDeep(this.data)
                    }
                    this.setState({prevTab:this.tabsData[tabIndex].tab_name})
                }
                // yx
                const yxOptionsData = dataArr[1];
                if(yxOptionsData && String(yxOptionsData.code) === '10000'){
                    if(Array.isArray(yxOptionsData.data)){
                        yxOptionsData.data.map(d => {
                            let { alias='', list=[] } = d || {};

                            alias.split(',').map(oneAlias => {
                                let child = this.childIns.find(ins => {
                                    return ins.getAlias() === oneAlias;
                                });
            
                                if(!child)return;

                                // revert value to string
                                list = list.map(o => {
                                    o.value = String(o.value);
                                    return o;
                                });
                                child.setOptions(JSON.parse(JSON.stringify(list)));
                            });
                        });
                    }
                }
                // const tabsData = dataArr[dataArr.length-1];
                
                this.setState({
                    disable: false
                }, () => {
                    Object.keys(this.charts).map((parentKey) => {
                        this.updateChart(parentKey);
                    });
                });
            })
            .catch(err => {
                notify(msg('fail'));
                console.error(err);
            })
            .finally(() => {
                this.setState({
                    loading: false,
                });
            });
        }
    }
    popHandle(){
        let compareData = DiffUtil.difference(this.data, this.rawData);
        // 点保存是更改总的数据表记录
            this.tabsChartData[this.state.prevTab].data = _.cloneDeep(this.data)
        let diffDataObj = {}
        // const paramIndexArr = Array.from({length: 6}, (_, index) => index);
        for(let el in this.tabsChartData){
            const diffRaw = this.tabsChartData[el].rawData
            const diffData = this.tabsChartData[el].data
            // 更改完数据源之后 prevTab的值等于当前tab
            if(el !== this.state.prevTab){
                Object.keys(DiffUtil.difference(diffData, diffRaw)).map(dEl=>{
                    // FrequencyArea 前6个参数为公共参数 不需要加后缀名
                    if(dEl.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(dEl.split('.')[1]))){
                        diffDataObj[`${dEl}.${el}`] = DiffUtil.difference(diffData, diffRaw)[dEl]
                    }else{
                        diffDataObj[`${dEl}`] = DiffUtil.difference(diffData, diffRaw)[dEl]
                    }
                })
            }else{
                Object.keys(compareData).map(dEl=>{
                    if(dEl.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(dEl.split('.')[1]))){
                        diffDataObj[`${dEl}.${el}`] = compareData[dEl]
                    }else{
                        diffDataObj[`${dEl}`] = compareData[dEl]
                    }
                })
            }
            // diffDataObj[el] = el !== this.state.prevTab?DiffUtil.difference(diffData, diffRaw):DiffUtil.difference(this.data, this.rawData)
        }
        // diffDataObj[this.this.state.prevTab]
        if(Object.keys(diffDataObj).length > 0){
            this.diff = diffDataObj;
            this.setState({
                openDialog: true
            })
        }else{
            this.diff = {};
            notify(msg('noChange'))
        }
    }

    popConfirm(){
        // const paramIndexArr = Array.from({length: 6}, (_, index) => index);
        this.props.save(Object.keys(this.diff).map(keyStr => {
            const originTab= keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.')[2]:''
            const originKey = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.').slice(0,2).join('.'):keyStr
            let dataSource = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?this.tabsChartData[originTab].data[originKey]:this.data[originKey];
            
            let { alias, value } = dataSource
            if(keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))){
                const tabIndex = this.tabsData.findIndex(i=>i.tab_name == originTab)
                const tabAlias = this.tabsData[tabIndex].point_suffix
                alias += tabAlias
            } 
            let child = this.childIns[dataSource[__INS_INDEX_]];
            return {
                alias,
                value: (value !== '' && !isNaN(value)) 
                    ? outputData(Number(value), child.getFactor())
                    : value
            };
        }), () => {
            this.rawData = _.cloneDeep(this.data);
            Object.keys(this.tabsChartData).map(el=>{
                this.tabsChartData[el].rawData = _.cloneDeep(this.tabsChartData[el].data)
            })
        }, () => {
            this.setState({
                openDialog: false
            });
        });
    }

    renderDiff(){
        let dialogMaxWidth = parseInt(window.innerWidth * 0.8);
        let dialogMaxHeight = parseInt(window.innerHeight * 0.7);

        return(
            <Dialog
                disableEnforceFocus={true}
                classes={{
                    root: prefixClsDialog,
                    paper: prefixClsDialogPaper,
                    container: prefixClsDialogContainer
                }}
                titleClasses={{
                    root: prefixClsDialogTitle
                }}
                contentClasses={{
                    root: prefixClsDialogContent
                }}
                actionsClasses={{
                    root: prefixClsDialogAction
                }}
                PaperProps={{
                    style:{
                        minWidth: 400,
                        maxWidth: '100%',
                        minHeight: 200,
                        maxHeight: '100%'
                    }
                }}
                draggable={true}
                open={this.state.openDialog}
                fullWidth={false}
                maxWidth={'md'}
                title={() => {
                    return (
                        <div>
                            {msg('compare.title')}
                            <span  className={prefixClsDialogDel} onClick={() => {
                                this.setState({
                                    openDialog: false
                                });
                            }}></span>
                        </div>
                    )
                }}
                content={() => {
                    return this.renderDiffContent();
                }}
                contentStyle={{
                    maxWidth: dialogMaxWidth,
                    maxHeight: dialogMaxHeight
                }}
                action={() => {
                    return (
                        <div>
                            <button 
                                onClick={(e) => {
                                    this.popConfirm();
                                }}
                            >{msg('ok')}</button>
                            <button 
                                onClick={() => {
                                    this.setState({
                                        openDialog: false
                                    });
                                }}
                            >{msg('cancel')}</button>
                        </div>
                    );
                }}
            ></Dialog>
        )
    }

    /**
     * TODO
     * 未深度生成
     * @returns 
     */
    renderDiffContent(){
        const renderTable = () => {
            let groups = {};
            // const paramIndexArr = Array.from({length: 6}, (_, index) => index);
            Object.keys(this.diff).map((keyStr, index) => {
                let originTab = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.')[2]:''
                let originKey = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.').slice(0,2).join('.'):keyStr
                // let nowData = this.data[keyStr];
                let nowData = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?this.tabsChartData[originTab].data[originKey]:this.data[originKey]
                let child = this.childIns[nowData[__INS_INDEX_]];
                let keys = child.getKeys();

                groups[keys[0]] = groups[keys[0]] || [];
                groups[keys[0]].push(keyStr);
            });
            return Object.keys(groups).map((k, index) => {
                let keyStrs = groups[k];

                let originTab = keyStrs[0].indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStrs[0].split('.')[1]))?keyStrs[0].split('.')[2]:''
                // let originKey = keyStr.split('.').slice(0,2).join('.')
                // let nowData = this.data[keyStr];
                // let nowData = this.tabsChartData[originTab].data[originKey]

                let nowData = keyStrs[0].indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStrs[0].split('.')[1]))?this.tabsChartData[originTab].data[keyStrs[0].split('.').slice(0,2).join('.')]:this.data[keyStrs[0]];
                let child = this.childIns[nowData[__INS_INDEX_]];
                let names = child.getNames();
                return(
                    <tr key={index}>
                        <td>{names[0]}</td>
                        <td>
                            {
                                keyStrs.map((keyStr, ind) => {
                                    let domOriginTab = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.')[2]:''
                                    let domOriginKey = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.').slice(0,2).join('.'):keyStr
                                    let rawData = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?this.tabsChartData[domOriginTab].rawData[domOriginKey]:this.rawData[domOriginKey];
                                    let value = rawData.value;
                                    let child = this.childIns[rawData[__INS_INDEX_]];
                                    let name = `${child.getDesc()}(${domOriginTab})`;
                                    let options = child.getOptions();
                                    if(Array.isArray(options)){
                                        options.map(option => {
                                            if(String(option.value) === String(rawData.value)){
                                                value = option.name;
                                            }
                                        });
                                    }
                                    return (
                                        <div 
                                            key={ind}
                                            dangerouslySetInnerHTML={{
                                                __html:`
                                                ${name}: 
                                                <span class="${prefixClsCompareHl}">${value}</span>
                                            `
                                            }}
                                        > 
                                        </div>
                                    )
                                })
                            }
                            
                        </td>
                        <td>
                            {
                                keyStrs.map((keyStr, ind) => {
                                    let domOriginTab = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.')[2]:''
                                    let domOriginKey = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?keyStr.split('.').slice(0,2).join('.'):keyStr
                                    {/* let rawData = this.tabsChartData[originTab].rawData[domOriginKey]; */}

                                    let nowData = keyStr.indexOf('FrequencyArea')!=-1&&!paramIndexArr.includes(Number(keyStr.split('.')[1]))?this.tabsChartData[domOriginTab].data[domOriginKey]:this.data[domOriginKey];
                                    let value = nowData.value;
                                    let child = this.childIns[nowData[__INS_INDEX_]];
                                    let name = child.getDesc();
                                    let options = child.getOptions();
                                    if(Array.isArray(options)){
                                        options.map(option => {
                                            if(String(option.value) === String(nowData.value)){
                                                value = option.name;
                                            }
                                        });
                                    }

                                    return (
                                        <div 
                                            key={ind}
                                            dangerouslySetInnerHTML={{
                                                __html:`
                                                    ${name}: 
                                                    <span class="${prefixClsCompareHl}">${value}</span>
                                                `
                                            }}
                                        > 
                                        </div>
                                    )
                                })
                            }
                        </td>
                    </tr>
                )
            });
        };

        return(
            <table className={prefixClsCompareTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>{msg('compare.beforeChange')}</th>
                        <th>{msg('compare.afterChange')}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        renderTable()
                    }
                </tbody>
            </table>
        );
    }

    layout(){
        let {config} = this.props;
        return Object.keys(config).map((key, index) => {
            let item = new Parent(config[key]);
            let { i } = item.getLayout();

            return (
                <section key={i}>
                    <div className={prefixClsName}>
                        {item.getTitle()}
                    </div>
                    {this.renderParentDom(key)}
                </section>
            );
        })
    }

    isAuth(auth){
        if(auth){
            return String(this.props.authMap[auth]) === '1';
        }

        return true;
    }
    

    renderParentDom(key){
        let sectionItem = this.props.config[key] || {};

        const renderLoop = (module={}, keys) => {
            let { children, charts, auth } = module;
            let noAuth = !this.isAuth(auth);
            return [
                <div 
                    key={0} 
                    className={`${prefixClsContent} ${charts ? prefixClsContentLeft : ''} ${noAuth ? prefixClsContentDisabled : ''}`}
                    title={noAuth ? msg('noAuth') : ''}
                >
                    {
                        children.map((ele, index) => {
                            let child = this.childIns[ele[__INS_INDEX_]];
                            let _index = child.getIndex();
                            let hasNext = child.hasNext();

                            return(
                                <div key = {index} className={prefixClsChild}>
                                    <div className ={`${prefixClsChildName}`}>
                                        {child.getDesc()}
                                    </div>
                                    <div className ={`${prefixClsChildInput}`}>
                                        {this.renderChild(keys.concat([_index]), child)}
                                    </div>
                                    {hasNext ? renderLoop(ele, keys.concat([_index])) : null}
                                </div>
                            );
                        })
                    }
                </div>,
                
                charts ? this.renderChart(sectionItem, keys, noAuth) : null
            ];
        };
        this.resizeCharts()
        return(
            <div className={prefixCls}>
                {renderLoop(sectionItem, [key])}
            </div>
        )
    }

    /**
     * 
     * @param {String[]} keys 
     * @param {Child} item 
     * @param {StyleSheetList} style 
     * @returns 
     */
    renderChild(keys, item, style={}){
        const chartId = item.getChartId();
        const showType = item.getShowType();
        const noAuth = !this.isAuth(item.getAuth());
        const dataKey = keys.join(CONNECT_STR);

        let pointData = this.data[dataKey];
        let child = this.childIns[pointData[__INS_INDEX_]];
        
        switch(showType){
            case SHOW_TYPE.BOOL: {
                let disabled = !!!pointData || 
                    !child
                    !Array.isArray(child.getOptions()) || 
                    child.getOptions().length === 0;
                let val = '';
                if(pointData){
                    val = pointData.value;
                }else{
                    let options = child.getOptions() || [];
                    if(options[0]){
                        val = options[0].value;
                    }
                }

                return(
                    <RadioGroup 
                        value={val}
                        //data={[{name:'1',value:'1'},{name:'2',value:'2'}]}
                        data={child.getOptions() || []}
                        disabled={disabled || noAuth}
                        onChange={disabled ? undefined : (v)=>{
                            this.data[dataKey].value = v.value;
                            if(chartId){
                                this.updateChart(
                                    keys.slice(0, keys.length - 1).join(CONNECT_STR)
                                );
                            }
                        }}
                    />
                )
            }            
            break;

            case SHOW_TYPE.ENUM: {
                let disabled = !!!pointData || 
                    !child
                    !Array.isArray(child.getOptions()) || 
                    child.getOptions().length === 0;
                let val = '';
                if(pointData){
                    val = pointData.value;
                }else{
                    let options = child.getOptions() || [];
                    if(options[0]){
                        val = options[0].value;
                    }
                }

                return <NewSelect
                    style={Object.assign({ 
                        minWidth: 80, 
                        maxWidth: 200 
                    }, style)} 
                    dropdownStyle={{width: 'auto'}} 
                    dropdownMatchSelectWidth={false}
                    defaultActiveFirstOption={false}
                    value={val}
                    showSearch={false}
                    //data={[{name:'1',value:'1'},{name:'2',value:'2'}]}
                    data={child.getOptions() || []}
                    disabled={disabled || noAuth}
                    onChange={disabled ? undefined : (v)=>{
                        if(v === null || v === undefined){
                            v = '';
                        }
                        this.data[dataKey].value = v;
                        if(chartId){
                            this.updateChart(
                                keys.slice(0, keys.length - 1).join(CONNECT_STR)
                            );
                        }
                    }}
                />;
            }
            break;

            case SHOW_TYPE.NUMBER: {
                let val = '';
                let disabled = true;
                let min = item.getMin();
                let max = item.getMax();

                if(pointData){
                    disabled = false;
                    val = pointData.value;
                }

                return <InputNumber
                    hideManualBtn={true}
                    step={''}
                    min={min} 
                    max={max}
                    value={val} 
                    onChange={disabled ? null : (v)=>{
                        if(v === null || v === undefined){
                            v = '';
                        }
                        this.data[dataKey].value = v;
                        if(chartId){
                            this.updateChart(
                                keys.slice(0, keys.length - 1).join(CONNECT_STR)
                            );
                        }
                    }} 
                    disabled={disabled || noAuth}
                    style={Object.assign({width: 80}, style)}
                />
            }
            break;
            default:
                return null;
        }
    }
    handleCurveChartRender(param){
        this.setState({needRender:param})
    }
    /**
     * 
     * @param {Map} chartCfg 
     * @param {String} keys
     * @param {Boolean} noAuth
     * @returns 
     */
    renderChart(chartCfg, keys, noAuth){
        let { charts=[] } = chartCfg || {};
        let chartPos = {};
        let newCharts = [];
        // make charts and points synchronous
        charts = this.newCharts
        /**
         * group item
         */
        charts.map((ele, ind) => {
            let child = this.childIns[ele[__INS_INDEX_]];
            let group = child.getGroup();

            if(String(group) !== '0' && !group){
                newCharts.push([child]);
            }else{
                if(group in chartPos){
                    let pos = chartPos[group];
                    newCharts[pos] = newCharts[pos] || [];
                    newCharts[pos].push(child);
                }else{
                    let pos = newCharts.length;
                    newCharts[pos] = [];
                    newCharts[pos].push(child);
                    chartPos[group] = pos;
                }
            }
        });
        let maxEleNumInRow = Math.max.apply(this, newCharts.map(ele => ele.length));
        return(
            <Tabs activeKey={this.state.curveTabKey} 
                key='tabs1' 
                // style={{'height':'100%'}}
                onChange={k => {this.setState({curveTabKey:k},()=>{
                    this.getCurvesData(this.state.curveTabKey)
                })}}
            >
                {
                    this.tabsData.map((el,index)=>{
                     return (<TabPane key={`${index}`} 
                     tab={el.tab_name} 
                     forceRender={true}>
                        <Curve 
                            prefixClsChart={prefixClsChart} 
                            noAuth={noAuth} 
                            newCharts={newCharts} 
                            maxEleNumInRow={maxEleNumInRow}
                            prefixClsChartDisabled={prefixClsChartDisabled}
                            prefixClsChartList={prefixClsChartList} 
                            renderChild={this.renderChild.bind(this)}
                            keys={keys}
                            state={this.state}
                            prefixClsChartShow={prefixClsChartShow}
                            prefixClsChartCanvas={prefixClsChartCanvas}
                            chartDoms={this.chartDoms}
                            msg={msg}   
                            charts={this.charts}
                            resizeCharts={this.resizeCharts.bind(this)}
                            domIndex={index}
                            needRender={this.state.needRender}
                            handleChartRender={this.handleCurveChartRender.bind(this)}
                            chartsInsNum={this.tabsData.length}
                            />
                        </TabPane>)
                    })
                }
                
                {/* {infos && infos.map(info => {
                    return <TabPane key={info.alias} tab={(isZh ? info.nameCn : info.nameEn) || info.name} />
                })} */}
            </Tabs>

        );
    }

    /**
     * 初始化echarts
     */
    initChart(){
        Object.keys(this.chartDoms).map((parentKey) => {

            const chart = echarts.init(this.chartDoms[parentKey]);
            chart.setOption({
                grid: {
                    top: 30,
                    bottom: 30
                },
                textStyle: {
                    fontSize: 14
                }
            });
            this.charts[parentKey] = chart;
        });

        this.resizeCharts();
    }

    /**
     * update chart
     * @param {String} parentKey 
     * @returns 
     */
    updateChart(parentKey){
        // this.charts[parentKey].map(el=>{
        const el = this.charts[parentKey][this.state.curveTabKey]
            const echartIns = el;
        if(!echartIns)return;
        
        let baseLine = 100;
        let maxLine = 210;
        let xData = [];
        let series = [];
        let trendData = [];
        this.newCharts=[]//initial newCharts

        let cfg = this.props.config;
        parentKey.split(CONNECT_STR).map(key => {
            cfg = cfg[key];
        });
        let { children, charts, xAxis={}, yAxis={} } = cfg;
        let { name: xAxisName } = xAxis;
        let { name: yAxisName } = yAxis;
        let points = children.filter((point) => {
            let { chartId } = point || {};
            return !!chartId;
        }).concat(charts.filter((point) => {
            let { chartId } = point || {};
            return !!chartId;
        }));
        let maxLineTemp = [[],[],[]];
        // remove points  value = null || 0
       let pointsRes =  points.filter((point) => {
            let child = this.childIns[point[__INS_INDEX_]];
            let chartType = child.getChartType();
            let keys = child.getKeys();
            let { value } = this.data[keys.join(CONNECT_STR)];
            // 筛选value不为空的点，此处若点全为空，切换tab会导致正常的曲线被压缩
            if(value !== ''||(point.alias.indexOf(4)==-1&&point.alias.indexOf(5)==-1)){
                const pointIndex = this.newCharts.findIndex(el=>el==point)
                if(pointIndex == -1&&point){
                    this.newCharts.push(point)
                }
                return point
            }
        })
        points = pointsRes
        if(!pointsRes.length){
            notify(msg('no data'))
            return
        }else{

        
        points.map((point) => {
            let child = this.childIns[point[__INS_INDEX_]];
            let chartType = child.getChartType();
            let keys = child.getKeys();
            let { value } = this.data[keys.join(CONNECT_STR)];
            let [type, hostId = ''] = chartType.split(',');

            if(isNaN(value))return;

            value = Number(value);
            // NORMAL: 'normal',
            // NORMAL_CENTER: 'normal_center',
            // NORMAL_SIDE: 'normal_side',
            // DIFF_NIL: 'diff_nil',
            // DIFF_NEGATIVE: 'diff_negative',
            // DIFF_POSITIVE: 'diff_positive'
            switch(type){
                // 可正可负, 显示按正处理
                case POINT_CHART.DIFF_NIL: {
                    maxLineTemp[0].push(Math.abs(value));
                    break;
                }
                case POINT_CHART.DIFF_NEGATIVE: {
                    maxLineTemp[1].push(value);
                    break;
                }
                case POINT_CHART.DIFF_POSITIVE: {
                    maxLineTemp[2].push(value);
                    break;
                }
            }
        });

        let topHeight = 0;
        maxLineTemp = maxLineTemp.reduce((total, f, ind) => {
            var maxVal = 0;
            if(f.length > 0){
                maxVal = Math.max.apply(null, f);
            }
            if(ind === 2)topHeight = maxVal;
            return total + maxVal;
        }, 0);

        let maxLinePad = Math.ceil(Math.sqrt(maxLineTemp));
        let maxLineFinal = maxLineTemp + maxLinePad;
        maxLine = maxLineFinal + parseInt(maxLineTemp * 0.125);
        let baseLinePercent = (1 - topHeight / maxLineTemp);
        if(baseLinePercent === 1) baseLinePercent = 0.9;
        baseLine = parseInt(maxLineFinal * baseLinePercent);
        points.map((point, ind, arr) => {
            let child = this.childIns[point[__INS_INDEX_]];
            let keys = child.getKeys();
            let desc = child.getDesc();
            let chartType = child.getChartType();
            let chartLabel = child.getChartLabel();
            let [type, hostId = ''] = chartType.split(',');
            let { value } = this.data[keys.join(CONNECT_STR)];
            let hostValue = 0;
            arr.map((ele) => {
                const hostChildIns = this.childIns[ele[__INS_INDEX_]];
                const chartId = hostChildIns.getChartId();
                if(chartId === hostId){
                    hostValue = this.data[hostChildIns.getKeys().join(CONNECT_STR)].value;
                    if(isNaN(hostValue)){
                        hostValue = 0;
                    }
                    hostValue = Number(hostValue);
                }
            });

            if(isNaN(value)){
                value = chartDefault;
            }

            value = Number(value);
            switch(type){
                case POINT_CHART.NORMAL:
                    xData.push(value);
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[value, 0],[value, baseLine]],
                        CHART_TYPE.DASH
                    ));
                    break;
                case POINT_CHART.NORMAL_CENTER:
                    xData.push(value);
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[value, 0],[value, maxLine]],
                        CHART_TYPE.ARROW_SOLID,
                        yAxisName || ''
                    ));
                    break;
                case POINT_CHART.NORMAL_SIDE:
                    xData.push(value);
                    trendData.push([value, baseLine, desc]);
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[value, 0],[value, baseLine]],
                        CHART_TYPE.DASH

                    ));
                    break;
                case POINT_CHART.DIFF_NEGATIVE:
                    trendData.push([hostValue, baseLine - value, desc]);
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[hostValue, baseLine - value], [hostValue, baseLine]],
                        CHART_TYPE.DOUBLE_ARROW_RIGHT
                    ));
                    break;
                case POINT_CHART.DIFF_POSITIVE:
                    trendData.push([hostValue, baseLine + value, desc]);
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[hostValue, baseLine], [hostValue, baseLine + value]],
                        CHART_TYPE.DOUBLE_ARROW_LEFT
                    ));
                    break;
            }
        });
        // xData = [50.09, 49.9, 50.2, 49.79, 50.29, 49.7, 50.39, 49.69, 50.49, 49.59, 50]
        // calculate xAxis mininum and maxinum and step
        let min = Math.min.apply(this, xData);
        let max = Math.max.apply(this, xData);
        let step = Math.ceil((max - min) / (xData.length - 1) * 1000) / 1000;
        let xMin = min - 1 * step;
        let xMax = max + 2 * step;
        // pmin generate
        points.map((point, ind, arr) => {
            const childIns = this.childIns[point[__INS_INDEX_]];
            const keys = childIns.getKeys();
            let desc = childIns.getDesc();
            let chartType = childIns.getChartType();
            let chartLabel = childIns.getChartLabel();
            let [type, hostId = ''] = chartType.split(',');
            let { value } = this.data[keys.join(CONNECT_STR)];

            if(isNaN(value)){
                value = chartDefault;
            }

            value = Number(value);

            switch(type){
                case POINT_CHART.DIFF_NIL:
                    // 可正可负, 显示按正处理
                    const positiveValue = Math.abs(value);

                    //pmin base line
                    series.push(this.getLineSeries(
                        '', 
                        [[xMin, positiveValue], [xMax, positiveValue]],
                        CHART_TYPE.DASH
                    ));
                    //pmin
                    series.push(this.getLineSeries(
                        chartLabel, 
                        [[max + 1 * step, 0],[max + 1 * step, positiveValue]],
                        CHART_TYPE.DOUBLE_ARROW_RIGHT
                    ));
                    break;
            }
        });

        const y = (x, mid, next) => {
            return mid[1] - ((next[1] - mid[1]) / (next[0] - mid[0]) ) * (mid[0] - x);
        }

        // polyline generate
        let lineData = [];
        trendData.sort(function(a, b){
            return a[0] - b[0];
        });
        trendData.map(d => {
            lineData.push([d[0], d[1]]);
        });

        lineData.unshift([
            min - step, 
            y(min - step, lineData[0], lineData[1])
        ]);
        lineData.push([
            max + step, 
            y(max + step, lineData[lineData.length - 1], lineData[lineData.length - 2])
        ]);

        series.push(
            this.getLineSeries(
                '', 
                lineData
            )
        );

        // baseline generate
        series.push(
            this.getLineSeries(
                '', 
                [[min - 1 * step, baseLine], [max + 2 * step, baseLine]],
                CHART_TYPE.DASH
            )
        );
       
        echartIns.setOption({
            xAxis: {
                name: xAxisName || '',
                nameTextStyle: {
                    align: 'right',
                    verticalAlign: 'top',
                    padding: [5, 0, 0, 0]
                },
                nameGap: 0,
                show: true,
                min: xMin,
                max: xMax,
                type: 'value',
                splitLine:{
                    show: false
                },
                axisLine: {
                    symbol: ['none', 'triangle'],
                    lineStyle:{
                        color: '#FFFFFF'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    position: 'bottom'
                }
            },
            yAxis: {
                max: maxLine,
                min: 0,
                show: false,
                splitLine: {
                    show: false
                }
            },
            animation: false,
            series: series,
        })
        }
    // })
    }

    /**
     * line series generate
     * @param {String} name 
     * @param {Array[]} data 
     * @param {String} lineType 
     * @param {String} endLabel 
     * @returns 
     */
    getLineSeries(name, data, lineType, endLabel){
        let isDash = false;
        let labelPos = 'bottom';
        let markData = [];
        let markLabelOffset = [18, 12];
        if(lineType === CHART_TYPE.DOUBLE_ARROW_LEFT){
            markLabelOffset = [-18, 12];
        }

        switch(lineType){

            // use line series, but can use markLine
            case CHART_TYPE.DASH:
                isDash = true;
                data = data.map((d, ind, arr) => {
                    return {
                        value: d,
                        label: {
                            show: ind === 0
                        }
                    };
                });
                break;

            // use line series, but can use markLine
            case CHART_TYPE.ARROW_SOLID:
                data = data.map((d, ind, arr) => {
                    let temp = {};
                    if(ind === 0){
                        temp = {
                            symbol: 'circle',
                            symbolSize: 0
                        };
                    }
                    if(ind === arr.length - 1){
                        temp = {
                            symbol: 'triangle',
                            symbolSize: 10
                        };

                        if(endLabel){
                            temp.name = endLabel;
                        }
                    }
                    return Object.assign({
                        value: d,
                        label: {
                            show: ind === 0 || (ind === arr.length - 1 && endLabel), 
                            position: (ind === arr.length - 1 && endLabel) ? 'right' : labelPos
                        }
                    }, temp);
                });
                break;
            
            // use markLine, because of centering label
            case CHART_TYPE.DOUBLE_ARROW_LEFT:
            case CHART_TYPE.DOUBLE_ARROW_RIGHT:
                let temp = [];
                data.map((d, ind, arr) => {
                    return temp.push({
                        coord: d,
                        name: name || '',
                        symbol: 'arrow',
                        symbolSize: 5,
                        symbolRotate: ind === 0 ? 180 : 0,
                    });
                })
                markData.push(temp);
                break;
        }
        
        return {
            name: name || '',
            label:{
                show: true,
                position: labelPos,
                color:'#fff',
                formatter : function(params){
                    let seriesName = params.name || params.seriesName || '';
                    seriesName = seriesName.replace(/<sub[^>]*>([^<]*)<\/sub>/gi, '{a|$1}');

                    return seriesName;
                },
                rich: {
                    a: {
                        fontSize:'.8em',
                        verticalAlign: 'bottom',
                    }
                }
            },
            data: markData.length > 0 ? [] : data,
            type: 'line',
            silent: true,
            itemStyle:{
                color:'#FFFFFF'
            },
            lineStyle:{
                width: 1,
                type: isDash ? 'dashed' : 'solid'
            },
            symbolSize: 0,
            markLine: {
                data: markData,
                label:{
                    show: true,
                    rotate: 0,
                    position: 'middle',
                    offset: markLabelOffset,
                    color:'#fff',
                    formatter : function(params){
                        let markName = params.name || '';
                        markName = markName.replace(/<sub[^>]*>([^<]*)<\/sub>/gi, '{a|$1}');
    
                        return markName;
                    },
                    rich: {
                        a: {
                            fontSize:'.8em',
                            verticalAlign: 'bottom',
                        }
                    }
                },
                lineStyle: {
                    type: 'solid',
                    width: 1
                }
            }
        };
    }

    /**
     * calculate grid layout row height
     * @returns {Number}
     */
    calculateRowHeight(){
        const margin = 20;
        const otherHeight = 65;
        let rowHeight = 100;
        let maxHeight = 10;
        const {container, config} = this.props;

        if(container instanceof HTMLElement){
            let pos = BStools.getPos(container);
            let heights = Object.keys(config).map((key) =>{
                let {layout} = config[key] || {};
                let {h} = layout || {};
                return !isNaN(h) ? Number(h || 0) : 0;
            });

            if(heights.length > 0){
                maxHeight = Math.max.apply(null, heights);
            }

            rowHeight = Math.floor(
                ((window.innerHeight - pos.top - otherHeight) - (maxHeight - 1) * margin) 
                / maxHeight
            );
        }

        return rowHeight;
    }

    render() {
        const {config} = this.props;
        let layouts = Object.keys(config).map((key) => {
            let {layout} = config[key];
            return layout;
        });

        return(
            <div className={`emsparameter ${this.state.extCls}`}>
                <ResponsiveReactGridLayout
                    layouts={{lg: layouts, md: layouts}}
                    breakpoints={{lg: 1280, md: 900}}
                    cols={{lg: 32, md: 32}}
                    margin={[10, 20]}
                    isDraggable={true}
                    isResizable={true}
                    rowHeight={this.calculateRowHeight()}
                    draggableCancel="input,textarea"
                    draggableHandle={`.${prefixClsName}`}
                    onLayoutChange={() => {
                        this.resizeCharts();
                    }}
                >
                    {this.layout()}
                </ResponsiveReactGridLayout>

                <footer>
                    <button 
                        disabled={this.state.disable}
                        onClick={e => {
                            this.popHandle();
                        }}
                    >{msg('save')}</button>
                </footer>
                {
                    this.renderDiff()
                }
                {
                    <EnvLoading isLoading={this.state.loading} container={this.props.container}/>
                }                
            </div>
        );
    }
}

const POINT_CHART = {
    NORMAL: 'normal',
    NORMAL_CENTER: 'normal_center',
    NORMAL_SIDE: 'normal_side',
    DIFF_NIL: 'diff_nil',
    DIFF_NEGATIVE: 'diff_negative',
    DIFF_POSITIVE: 'diff_positive'
};

const CHART_TYPE = {
    DASH: 'dash',
    ARROW_SOLID: 'arrowSolid',
    DOUBLE_ARROW_LEFT: 'doubleArrowLeft',
    DOUBLE_ARROW_RIGHT: 'doubleArrowRight'
};

const SHOW_TYPE = {
    BOOL: 'bool',
    ENUM: 'enum',
    NUMBER: 'number'
};

class Parent {
    static propTypes = {
    };

    static defaultProps = {

    };

    constructor(props){
        let { title, titleEn, layout, auth} = JSON.parse(JSON.stringify(props));

        this.title = title || '';
        this.titleEn = titleEn || '';
        this.layout = layout || {};
        this.auth = auth;
    }

    getTitle(){
        return isZh ? this.title : this.titleEn;
    }

    getLayout(){
        return this.layout;
    }

    getAuth(){
        return this.auth;
    }
}

class Child {
    static propTypes = {
    };

    static defaultProps = {
    };

    static getAlias = (aliasPlaceHolder='', facAlias='') => {
        let alias = aliasPlaceHolder.split('.').slice(-2).join('.');
        return `${facAlias}.${alias}`;
    }

    constructor(props){
        let { 
            desc, 
            descEn, 
            alias, 
            type, 
            tableNo, 
            fieldNo=9,
            decimal=0,
            min,
            max,
            factor,
            options,
            group,
            chartId='',
            chartType='',
            chartName='',
            chartLabel='',
            children,
            charts,
            auth,
            supCategory=''
        } = JSON.parse(JSON.stringify(props));
        
        this._index = 0;
        this._keys = [];
        this._names = [];
        this.desc = desc || '';
        this.descEn = descEn || '';
        this.alias = alias || '';
        this.type = type || '';
        this.tableNo = tableNo || '';
        this.fieldNo = fieldNo;
        this.decimal = decimal;
        this.min = min;
        this.max = max;
        this.factor = factor;
        this.options = options;
        this.group = group;
        this.chartId = chartId;
        this.chartType = chartType;
        this.chartName = chartName;
        this.chartLabel = chartLabel;
        this.children = children;
        this.charts = charts;
        this.auth = auth;
        this.supCategory = supCategory

        if(String(this.tableNo) === '62'){
            this.options = undefined;
        }else if(String(this.tableNo) === '61'){
            if(!Array.isArray(this.options)){
                this.options = [];
            }
        }
    }

    getIndex(){
        return this._index;
    }

    setIndex(index){
        this._index = index;
    }

    getNames(){
        return this._names;
    }

    setNames(names){
        this._names = names;
    }

    getKeys(){
        return this._keys;
    }

    setKeys(keys){
        this._keys = keys;
    }

    getDesc(){
        return isZh ? this.desc : this.descEn;
    }

    getType(){
        return this.type;
    }

    getAlias(param=''){
        return `${this.alias}${this.supCategory?param:''}`;
    }

    setAlias(alias){
        this.alias = alias;
    }

    getYxAlias(){
        if(String(this.tableNo) === '61'){
            return this.alias;
        }

        return null;
    }

    getKeyAlias(param=''){
        return `1:${this.tableNo}:${this.alias}${this.supCategory?param:''}:${this.fieldNo}`;
    }

    getDecimal(){
        return this.decimal;
    }

    getMin(){
        const min = this.min;
        if(min !== '' && min !== null && !isNaN(min)){
            return Number(min);
        }
        return undefined;
    }

    getMax(){
        const max = this.max;
        if(max !== '' && max !== null && !isNaN(max)){
            return Number(max);
        }
        return undefined;
    }

    getFactor(){
        return this.factor;
    }

    getOptions(){
        return this.options;
    }

    setOptions(options){
        if(Array.isArray(options)){
            this.options = options;
        }        
    }

    getGroup(){
        return this.group;
    }

    getChartType(){
        return this.chartType;
    }

    getChartId(){
        return this.chartId;
    }

    getChartName(){
        return this.chartName;
    }

    getChartLabel(){
        return this.chartLabel;
    }

    getShowType(){
        switch(String(this.tableNo)){
            case '61':
                if(this.type === SHOW_TYPE.BOOL)return SHOW_TYPE.BOOL;
                return SHOW_TYPE.ENUM;
            case '62':
                return SHOW_TYPE.NUMBER;
            default:
                return '';
        }
    }

    getChildren(){
        return this.children;
    }

    getCharts(){
        return this.charts;
    }

    hasNext(){
        let hasChildren = Array.isArray(this.children) && this.children.length > 0;
        let hasCharts = Array.isArray(this.charts) && this.charts.length > 0
        return hasChildren || hasCharts;
    }

    getAuth(){
        return this.auth;
    }

    setAuth(auth){
        this.auth = auth;
    }
}

/**
 * 输入数据处理
 * @param {Number} sourceNumber 
 * @param {Number} factor 
 */
 const inputData = (sourceNumber, factor) => {
    if(typeof sourceNumber === 'number' && typeof factor === 'number'){
        return NumberUtil.multiply(sourceNumber, factor);
    }
    return sourceNumber;
};

const outputData = (fixedNumber, factor) => {
    if(typeof fixedNumber === 'number' && typeof factor === 'number'){
        return NumberUtil.divide(fixedNumber, factor);
    }
    return fixedNumber;
};

const toNumber = (number) => {
    if(number === '' || number === 0 || number === null || isNaN(number))return number;

    return Number(number);
};

export default Param;