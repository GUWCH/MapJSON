/* eslint-disable */

import React from 'react';
import _ from 'lodash';
import EnvTable from 'EnvTable';
import EnvLoading from 'EnvLoading';
import Intl, {msgTag} from '../../common/lang';
import { COMMON_FLAG, DATE_TYPE, TREE_BAY_TYPE } from '../CONSTANT';
import { DateUtil, NumberUtil } from '../../common/utils';
import scadaCfg, { CommonHisTimerInterval } from '../../common/const-scada';
import { autoComma } from '../../common/util-scada';
import { toList } from '../common_lib';
import { GlobalContext } from './context';
import DAO from './dao';

import styles from './index.mscss';

const _dao = new DAO();
const msg = msgTag('site');

/**
 * 排行榜列
 * 参考/mrweb/invtRpt接口返回参数
 */
const RANK_COLUMNS = [{
    key: 'devName',
    title: msg('name'),
    sortable: false,
    style: {
        width: 150,
        textAlign: 'left'
    },
    fmt: (value, rowData) => {
        return <a onClick={e => {
            let { devAlias } = rowData;
            const bayAlias = devAlias.split('.').slice(0, 3).join('.');
            scadaCfg.getTree().then(tree => {
                if(!tree)return;

                const node = tree.getNodeByParam('alias', bayAlias);
                if(node.node_type === TREE_BAY_TYPE.INVERTER){
                    toList(COMMON_FLAG.INVERTER, bayAlias);
                }else{
                    toList(COMMON_FLAG.INVERTER, devAlias);
                }
            })
            e.preventDefault();
        }}>{value}</a>;
    }
}, {
    key: 'utilizeHour',
    title: msg('hour'),
    style: {
        width: 135,
        textAlign: 'left'
    },
    fmt: (value, rowData) => {
        return value !== '' && !isNaN(value) ? autoComma(Number(value)) : value
    }
}, {
    key: 'realProduction',
    title: `${msg('production')}(kWh)`,
    style: {
        width: 155,
        textAlign: 'left'
    },
    fmt: (value, rowData) => {
        return value !== '' && !isNaN(value) ? autoComma(Number(value)) : value
    }
}, {
    key: 'genPerWatt',
    title: `${msg('powerRatio')}(%)`,
    today: true,
    style: {
        width: 120,
        textAlign: 'left'
    },
    fmt: (value, rowData) => {
        return value !== '' && !isNaN(value) ? autoComma(NumberUtil.multiply(Number(value), 100)) : value
    }
}, {
    key: 'pr',
    title: `${msg('PR')}(%)`,
    today: false,
    style: {
        width: 120,
        textAlign: 'left'
    },
    fmt: (value, rowData) => {
        return value !== '' && !isNaN(value) ? autoComma(Number(value)) : value
    }
}];

const reqModel = {
    starttime: '2021-06-24 00:00:00',
    endtime: '2021-06-25 00:00:00',
    row_count: 100,
    row_begin: 1,
    order_by: '',
    poly_date_type: 'day',
    facAlias: ''
};

export default class InvRank extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);
        this.timer = null;
        this.container = React.createRef();

        this.state = {
            sortColumn: '',
            sortDir: '',
            data: [],
            loading: false,
            width: 0
        };
    }

    resize(){
        if(!this.container.current) return;
        this.setState({width: this.container.current.clientWidth});
    }

    componentDidMount(){
        this.getData(true);

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps){
        if(this.props.dateType !== prevProps.dateType || !_.isEqual(this.props.dateRange, prevProps.dateRange)){
            
            this.changeState({
                sortColumn: '',
                sortDir: '',
                data: [],
            }, true);
        }
    }

    componentWillUnMount(){
        clearTimeout(this.timer);
        window.removeEventListener('resize', this.resize.bind(this));
    }

    getGridColumn(){
        let { state: { dateType, dateRange} } = this.context;

        let newWidth = this.state.width / 4;
        if(newWidth < 100){
            newWidth = 100;
        }

        const selectDate = dateRange[0].split(' ')[0];
        const nowDate = DateUtil.getStdNowTime().split(' ')[0];

        return RANK_COLUMNS
        .filter(c =>
            !('today' in c) || 
            (!c.today && (dateType !== DATE_TYPE.DAY || selectDate < nowDate)) || 
            (c.today && dateType === DATE_TYPE.DAY && selectDate >= nowDate))
        .map(c =>{
            let newObj = Object.assign({}, c);
            delete newObj.fmt;
            newObj = JSON.parse(JSON.stringify(newObj));
            newObj.fmt = c.fmt;
            newObj.style = newObj.style || {};
            newObj.style.width = newWidth;
            return newObj;
        });
    }

    async getData(loading){
        loading && this.setState({loading: true});

        let { state } = this.context;
        let { dateType, dateRange, nodeAlias } = state;

        let order = `${this.state.sortColumn} ${this.state.sortDir}`;
        let res = await _dao.getInvRank(Object.assign({}, reqModel, {
            starttime: dateRange[0],
            endtime: dateRange[1],
            facAlias: nodeAlias,
            poly_date_type: dateType === DATE_TYPE.DAY ? 'day' : dateType,
            order_by: `${order ? `${order}` : ''}`
        }));

        this.changeState({data: (res.data || [])});

        loading && this.setState({loading: false});
    }

    changeState(newState={}, newReq=false){
        this.setState(Object.assign({}, this.state, newState), () => {
            clearTimeout(this.timer);
            if(newReq){
                this.getData(true);
            }else{
                this.timer = setTimeout(this.getData.bind(this), CommonHisTimerInterval);
            }
        });
    }

    render(){
        let { state, dispatch } = this.context;
        let { dateType, dateRange, theme } = state;

        return <div ref={this.container}>
            <EnvTable 
                language={Intl.isZh ? 'zh' : 'en'}
                containerClassName={styles.rank_grid}
                data = {this.state.data} 
                columns={this.getGridColumn()}
                pager={false}
                sortColumn={this.state.sortColumn}
                sortDir={this.state.sortDir}
                afterSort={(sortColumn, sortDir, data) => {
                    this.changeState({sortColumn, sortDir}, true);
                }}
                onData={() => { // required when fetch data after sorting

                }}
                titleStyle={{
                    backgroundColor: theme.blackTranparent2,
                    color: theme.whiteTranparent6
                }}
                alterStyle={{
                    backgroundColor: theme.blackTranparent2
                }}
                cellStyle={{
                    borderRight: 'none'
                }}
            />
            <EnvLoading isLoading={this.state.loading} />
        </div>
    }
}
