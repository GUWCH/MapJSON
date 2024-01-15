import * as React from 'react';
import { autorun, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Input } from 'antd';
import { _dao, daoIsOk } from '@/common/dao';
import { CommonTimerInterval } from '@/common/const-scada';
import { keyStringMap, MODE, msg, SLOT, farmSuffixAlias, reqDecimal } from '../../constants';
import { getPointKey } from '@/common/constants';
import {FontIcon, IconType } from 'Icon';
import {IconColor} from '../StyleShow';

import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';

import styles from './style.mscss';
import { isZh } from '@/center/center_sites/constant';
import DynData from '../DynData';

interface IStatusBarProps{
    dataState: IDataState;
    pageState: IPageState;
};

@inject('pageState', 'dataState')
@observer
class StatusBar extends React.PureComponent<IStatusBarProps> {
    
    constructor(props){
        super(props);
    }

    timer: any = null;
    deposer: any;

    state = {
        dynData: {},
        valList: []
    }

    componentDidMount(){

        this.deposer = reaction(() => this.props.dataState.getFilter(false)[0], (filter) => {
            filter && this.fetchData();
        });
    }
    
    componentWillUnmount(){
        clearTimeout(this.timer);
        this.deposer && this.deposer();
    }

    fetchData(){
        const { pageState, dataState } = this.props;
        const nodeAlias = pageState.nodeAlias;
        const fullNodeAlias = pageState.nodeType === 'FACTORY' ? nodeAlias + farmSuffixAlias : nodeAlias;
        const filter = dataState.getFilter(false)[0];
        if(!filter) return;
        const {valueListStyle = []} = (filter[keyStringMap.FILTER] || {})[keyStringMap.UNIVERSAL];
        const dataSourceArr = valueListStyle.map(ele => ele.dataSource);

        const req = dataSourceArr.filter(ele => ele).map(ele => ({
            id: '',
            key: getPointKey(ele, fullNodeAlias),
            decimal: 0
        }));
        
        const get = async () => {

            if(req.length === 0) return;

            const res = await _dao.getDynData(req);
            const dynData = {};

            if(daoIsOk(res)){
                res.data.forEach(data => {
                    delete data.timestamp;
                    dynData[data.key] = data;
                });
            }

            this.setState({dynData});
        }

        get();

        clearTimeout(this.timer);
        this.timer = setTimeout(this.fetchData.bind(this), CommonTimerInterval);
    }

    render(){
        const { pageState, dataState} = this.props;

        const filter = dataState.getFilter(false)[0];
        const {valueList = []} = filter || {};
        const {valueListStyle = []} = filter ? (filter[keyStringMap.FILTER] || {})[keyStringMap.UNIVERSAL] : {};

        let valList = valueList.map(ele => {
            let index = valueListStyle.findIndex(s => s.value == ele.value);
            return Object.assign({}, ele, valueListStyle[index], {order: index});
        })
        .sort(function(a, b){ return a.order - b.order;})

        if(valList.length === 0)return null;

        const fullNodeAlias = pageState.nodeType === 'FACTORY' ? pageState.nodeAlias + farmSuffixAlias : pageState.nodeAlias;

        let {dynData} = this.state;

        return (
            <div className={styles.statusbar}>
                {(valList || []).map((ele, ind) => {
                    let {icon, color, dataSource} = ele;
                    
                    const display_value = dataSource ? (dynData[getPointKey(dataSource, fullNodeAlias)] || {}).display_value || null : undefined;
                    return <button 
                        key={ind}
                        className={ele?.checked ? styles.hov: ''}
                        onClick={() => dataState.setFilter(ele)}
                    >
                    <IconColor icon = {icon} color = {color}/>
                    {isZh ? ele.nameCn || ele.name : ele.nameEn || ele.name}
                    {
                        display_value === undefined ? null : 
                        <>
                            <>{"("}</><DynData
                                value = {display_value || SLOT}
                                aKey = {getPointKey(dataSource, fullNodeAlias)}
                                name = {isZh? dataSource.nameCn : dataSource.nameEn}
                            /><>{")"}</>
                        </>
                    }
                    {}
                    </button>
                })}
            </div>
        );
    }
}

export default StatusBar;