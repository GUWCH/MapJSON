import * as React from 'react';
import { autorun, observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Input } from 'antd';
import { FontIcon, IconType, Icon2 } from 'Icon';
import { getPointKey } from '@/common/constants';
import { _dao, daoIsOk } from '@/common/dao';
import { CommonTimerInterval } from '@/common/const-scada';
import { MODE, GRADE, msg, getCurQuotas, reqDecimal, isZh, farmSuffixAlias, defaultColNum } from '../../constants';
import Set from '../QuotaSet';
import {StatsStyleShow} from '../StyleShow';

import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';

import styles from './style.mscss';

interface IStatisticsBarProps{
    pageState: IPageState;
    dataState: IDataState;
};

@inject('pageState', 'dataState')
@observer
class StatisticsBar extends React.PureComponent<IStatisticsBarProps> {
    timer: any = null;

    state = {
        dynData: {}
    }

    componentDidMount(){
        this.fetchData();
    }
    
    componentWillUnmount(){
        clearTimeout(this.timer);
    }

    fetchData(){
        const { pageState, dataState } = this.props;
        const nodeAlias = pageState.nodeAlias;
        const fullNodeAlias = pageState.nodeType === 'FACTORY' ? nodeAlias + farmSuffixAlias : nodeAlias;
        const columns = dataState.getPageBottom();

        if(!columns)return;

        const req = columns.map(ele => ({
            id: '',
            key: getPointKey(ele, fullNodeAlias),
            decimal: reqDecimal
        }));
        
        const get = async () => {

            if(columns.length === 0) return;

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
        const { pageState, dataState, containerRef } = this.props;
        const nodeAlias = pageState.nodeAlias;
        const fullNodeAlias = pageState.nodeType === 'FACTORY' ? nodeAlias + farmSuffixAlias : nodeAlias;
        const columns = dataState.getPageBottom();
        const colNum = dataState.getColNum();
        const isCollapsed = dataState.getCollapsed();
        const dynMap = this.state.dynData;

        const {functionCfg = {}, quotaCfg = []} = dataState.pageBottomAndTabCfg || {};

        const setContentHight = containerRef.current?.clientHeight - (16 + Math.ceil(columns.length/Number(colNum))*35) -220;

        return (
            <div className={styles.statbar}>
                <div className={isCollapsed ? styles.hidden : ''}>
                    {
                        (Array.isArray(columns) ? columns : []).map((col, ind) => {

                            const key = getPointKey(col, fullNodeAlias);

                            return <StatsStyleShow 
                                aKey = {key}
                                ind = {ind}
                                colNum = {colNum || defaultColNum}
                                iconClassName = {styles.icon}
                                data = {dynMap[key]}
                                quota = {col}
                            />
                        })
                    }
                </div>
                <Set 
                    height = {setContentHight}
                    isFarm = {pageState.grade === GRADE.FARM}
                    listType = {'statistics'}
                    data = {{
                        quotaList: getCurQuotas(
                            dataState.getModels(), 
                            pageState.nodeType, 
                            pageState.grade === GRADE.FARM
                        ),
                        cfg: {
                            quotaCfg: quotaCfg,
                            functionCfg: functionCfg
                        }
                    }}
                    placement={'bottomRight'}
                    trigger={'click'}
                    visible={dataState.isStatsConfiguring}
                    onVisibleChange={visible => {
                        dataState.setIsStatsConfiguring(visible);
                    }}
                    onCancle={() => {
                        dataState.setIsStatsConfiguring(false);
                    }}
                    onSubmit={(data) => {
                        dataState.savePageBottom(data);
                        dataState.setIsStatsConfiguring(false);
                    }}
                >
                    <div className={styles.config} onClick={(e) => {
                        dataState.setIsStatsConfiguring();
                        e.stopPropagation();
                    }}>
                        <Icon2 type={IconType.CONFIG} tip={msg('flag.config')} highlight={dataState.isStatsConfiguring}/>
                    </div>
                </Set>
                <div className={styles.updown} onClick={() => dataState.setCollapsed()}>
                    {
                        isCollapsed
                        ? <FontIcon type={IconType.DOUBLE_UP}/>
                        : <FontIcon type={IconType.DOUBLE_DOWN}/>
                    }                    
                </div>
            </div>
        );
    }
}

export default StatisticsBar;