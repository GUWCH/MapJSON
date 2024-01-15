/* eslint-disable */

import '../../common/css/app.scss';

import React, { Component, useContext, useReducer, useMemo } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {DatePicker, Popover, Tooltip as AntdTooltip } from 'antd';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import { notify } from 'Notify';
import Intl, {msgTag} from '../../common/lang';
import scadaCfg, { TimerInterval, HalfMinuteInterval } from '../../common/const-scada';
import { autoComma } from '../../common/util-scada';
import { NumberUtil } from '../../common/utils';
import { Actions, GlobalContext, GlobalReducer, InitialState } from './context';
import { 
    SLOT,
    COMMON_FLAG, 
    DATE_TYPE,
    getMomentDateFormat,
    getRangeChangedMomentDate
} from '../CONSTANT';
import { toList } from '../common_lib';
import {
    DEVICE_LIST,
    POINTS,
    TAG,
    getKey,
    FixVal
} from './Constant';
import ViewDAO from './dao';
import Charts from './Chart';
import InvRank from './InvRank';

import styles from './index.mscss';

if(Intl.isZh){
    moment.locale('zh-cn');
}

const msg = msgTag('site');
const _dao = new ViewDAO();
const MAINTENANCE_TOKEN_ID = 769;
const CANCEL_MAINTENANCE_TOKEN_ID = 784;

class SolarSite extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);

        this.timer = null;
        this.timerToken = null;

        this.state = {
            showToken: false
        };
    }

    componentDidMount(){
        let nodeAlias = scadaCfg.getCurNodeAlias() || 'SD1';

        if(nodeAlias){
            let { dispatch } = this.context;
            dispatch({
                nodeAlias: nodeAlias,
                mounted: true,
            })
        }else{
            notify(msg('invalidNode'));
        }
    }

    componentDidUpdate(){
        this.fetchRealData();
        this.fetchToken();
    }

    getHisData(pointData, point){
        if(!Array.isArray(pointData)) return '';

        let {name} = point;

        return FixVal(pointData.reduce((a, b) => {
            return NumberUtil.add(a, b);
        }, 0), point);
    }

    async fetchRealData(){
        let { state: {nodeAlias, pointRealData: rawPointRealData}, dispatch } = this.context;

        const req = POINTS.filter(p => TAG.DYNAMIC in p).map(point => {
            return {
                id: '',
                key: getKey(point, nodeAlias),
                decimal: point.decimal || 0
            };
        });

        DEVICE_LIST.forEach(device => {
            let {statistics=[], total} = device;
            statistics.map(ele => {
                req.push({
                    id: '',
                    key: getKey(ele, nodeAlias),
                    decimal: ele.decimal || 0
                });
            })  
            
            req.push({
                id: '',
                key: getKey(total, nodeAlias),
                decimal: total.decimal || 0
            });
        });

        if(req.length === 0)return;

        const res = await _dao.getDyn(req);

        const pointRealData = {};
        if(res && String(res.code) === '10000' && Array.isArray(res.data)){
            res.data.forEach(d => {
                let {display_value, key} = d;
                pointRealData[key] = display_value;
            });
        }

        if(!_.isEqual(pointRealData, rawPointRealData)){
            dispatch({pointRealData});
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(this.fetchRealData.bind(this), TimerInterval);
    }

    async fetchToken(){
        let { state: {nodeAlias, nodeToken}, dispatch } = this.context;
        let isToken = false;

        const res = await _dao.getToken(nodeAlias);

        if(res && String(res.code) === '10000' && Array.isArray(res.data)){

            /*
                alias: "SD1.Farm.Statistics"
                bay_name: "SD1全场统计1#"
                icon_name: "Maintenance"
                note: "test 置牌 2021/06/21 17:21:41\n"
                token_id: "769"
                token_name: "Test tag"
            */

            for(let i = 0; i < res.data.length; i++){
                let { alias,token_id } = res.data[i];

                if(alias === nodeAlias && String(token_id) === String(MAINTENANCE_TOKEN_ID)){
                    isToken = true;
                    break;
                }
            }
        }

        if(nodeToken !== isToken){
            dispatch({
                nodeToken: isToken
            });
        }

        clearTimeout(this.timerToken);
        this.timerToken = setTimeout(this.fetchToken.bind(this), HalfMinuteInterval);
    }

    async setToken(){
        let { state: {nodeAlias, nodeToken}, dispatch } = this.context;

        const res = await _dao.setToken(
            nodeAlias, 
            nodeToken ? CANCEL_MAINTENANCE_TOKEN_ID : MAINTENANCE_TOKEN_ID
        );

        if(res && String(res.code) === '10000'){
            clearTimeout(this.timerToken);

            // 设置接口虽然成功,但其实还未写入库
            setTimeout(this.fetchToken.bind(this), 1000);
            //this.fetchToken();
        }else{
            notify(msg('failed'));
        }

        this.setState({
            showToken: false
        });
    }

    componentWillUnmount(){
        clearTimeout(this.timer);
        clearTimeout(this.timerToken);
    }

    render(){
        let { state, dispatch } = this.context;
        let { mounted, nodeAlias, pointHisData, pointRealData, nodeToken } = state;

        return nodeAlias && mounted ? 
        <div className={styles.root}>
            <div className={styles.view}>
                <div className={`${styles.site} ${nodeToken ? styles.token : ''}`}>
                    <div>
                        <Popover
                            overlayClassName={styles.site_token_pop}
                            visible={this.state.showToken}
                            onVisibleChange={showToken => this.setState({showToken})}                            
                            trigger='click'
                            placement='bottom'
                            content={
                                <div 
                                    className={`${styles.site_token_main} ${nodeToken ? styles.site_token_tag : ''}`}
                                    onClick={e => {
                                        this.setToken();
                                    }}
                                >{msg('maintenance')}</div>
                            }
                        >
                            <span>{nodeToken ? msg('maintenance') : msg('siteNormal')}</span>
                        </Popover>
                        
                    </div>
                </div>
                <div className={styles.device}>{
                    DEVICE_LIST.map((device, ind) => {
                        let { flag, name, statistics, total } = device;

                        let totalNum = pointRealData[getKey(total, nodeAlias)] || 0;
                        
                        if(!totalNum || String(totalNum)=='0'){
                            return null;
                        }

                        return <SolarDevice 
                            key={ind}
                            flag={flag}
                            name={name}
                            total={totalNum}
                            counts={statistics.map(point => pointRealData[getKey(point, nodeAlias)] || 0)}
                            onClick={() => {
                                toList(flag);
                            }}
                        />;
                        
                    })
                }</div>
            </div>
            <SolarDate />
            <SolarCharts />
            <div className={styles.other}>
                <div>
                    <header>
                        <span>{msg('tableName')}</span>
                        <span
                            style={{display: 'none'}}
                            onClick={() => {
                                toList(COMMON_FLAG.INVERTER);
                            }}
                        >{msg('toDetail')}</span>
                    </header>
                    <SolarInvRank />
                </div>
                <div>
                    <header>{msg('siteQuota')}</header>
                    <div>{
                        POINTS.filter(point => TAG.RIGHT_BOTTOM in point).map((point, ind) => {
                            let { name, unit } = point;
                            let val = this.getHisData(pointHisData[getKey(point, nodeAlias)], point);

                            if(!isNaN(val)){
                                val = autoComma(val);
                            }else{
                                val = SLOT;
                            }

                            return <div key={ind}>
                                <span>{name}</span>
                                <span>
                                    <span>{val}</span>
                                    <span>{unit}</span>
                                </span>
                            </div>;
                        })
                    }</div>
                </div>
            </div>
        </div> : null
    }
}

class SolarDevice extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);
    }

    render(){
        let {flag, name, total, counts, onClick} = this.props;
        const count = counts.reduce((a, b) => Number(a) + Number(b), 0);
        
        let intlKey = 'deviceTip';
        switch(flag){
            case COMMON_FLAG.INVERTER:
                intlKey = 'invtTip';
                break;
        }

        return <div>
            {
                <AntdTooltip
                    overlayClassName={styles.antd_tooltip}
                    overlayStyle={{maxWidth: 300}}
                    title={msg(intlKey, total, name, ...counts)}
                    placement='bottom'
                >
                    <span>
                        <span>{name}</span>
                        <span>(<span className={styles.red}>{count}</span>/{total})</span>
                    </span>
                </AntdTooltip>
            }
            
            {/* <span onClick={e => {
                typeof onClick === 'function' && onClick();
            }}>{msg('details')}</span> */}
        </div>;
    }
}

class SolarDate extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);
    }

    /**
     * 
     * @param {Moment} value 
     * @param {DATE_TYPE?} dateType 
     * @param {String?} dateString 
     * @returns 
     */
    changeDate(dateType, value, dateString){
        let { dispatch, state: { dateType: rawDateType } } = this.context;
        dateType = dateType || rawDateType;

        let dateRange = getRangeChangedMomentDate(dateType, value);

        if(dateRange.length === 0){
            return;
        }

        if(!dateString){
            dateString = dateRange[0];
        }

        dispatch({
            dateType: dateType,
            dateTime: dateString,
            dateRange: dateRange
        });
    }

    getFormat(){
        let { state: { dateType } } = this.context;
        return getMomentDateFormat(dateType);
    }

    render(){
        let { state, dispatch } = this.context;
        let { dateType, dateTime } = state;

        return <div className = {styles.datetime}>
            <div className={styles.date_type}>
                <section>{
                    Object.keys(DATE_TYPE)
                    .filter(type => DATE_TYPE[type] !== DATE_TYPE.WEEK)
                    .map((type, ind) => {
                        let typeVal = DATE_TYPE[type];
                        return <div 
                            className={`${dateType === typeVal ? styles.date_active : ''}`}
                            key={ind}
                            onClick={() => {
                                this.changeDate(typeVal, moment());
                            }}
                        >{msg(typeVal)}</div>;
                    })
                }</section>
            </div>
            {
                dateType !== DATE_TYPE.TOTAL ? 
                <DatePicker 
                    style = {{height: 30}}
                    locale={Intl.isZh ? zhCN : null}
                    allowClear={false}
                    value = {moment(dateTime)}
                    picker={dateType}
                    format={this.getFormat()}
                    onChange = {(value, dateString) => {
                        this.changeDate(null, value, dateString);
                    }}
                    disabledDate={(momentCurrent) => {
                        return momentCurrent && momentCurrent > moment().endOf('day');
                    }}
                /> : null
            }
        </div>
    }
}

function SolarCharts(props){
    let { state, dispatch } = useContext(GlobalContext);
    let { dateType, dateRange, nodeAlias } = state;

    return useMemo(() => {
        return <div className = {styles.charts_container}>
            <Charts dateType={dateType} dateRange={dateRange} />
        </div>
    }, [dateType, dateRange, nodeAlias]);
}

function SolarInvRank(){
    let { state, dispatch } = useContext(GlobalContext);
    let { dateType, dateRange, nodeAlias } = state;

    return useMemo(() => {
        return <InvRank dateType={dateType} dateRange={dateRange} />;
    }, [dateType, dateRange, nodeAlias]);
}

function App(){
    const [state, dispatch] = useReducer(GlobalReducer, InitialState);

    return(
        <GlobalContext.Provider value={{ state, dispatch }}>
            <SolarSite />
        </GlobalContext.Provider>
    );
}

if(process.env.NODE_ENV === 'development'){
    ReactDOM.render(<App />, document.getElementById('center'));
}else{
    ReactDOM.render(<App />, document.getElementById('container'));
}
