import * as React from 'react';
import {useEffect} from 'react';
import { reaction } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Tabs, Popover } from 'antd';
import _ from 'lodash';
import ScadaCfg from '@/common/const-scada';
import { _dao, daoIsOk } from '@/common/dao';
import { CommonTimerInterval } from '@/common/const-scada';
import DraggableTabs from '@/components/DraggableTabs';
import { MODE, GRADE } from '../constants';
import List from '../components/List';
import CardContainer from '../components/CardContainer';
import ToolBar from '../components/ToolBar';
import StatusBar from '../components/StatusBar';
import StatisticsBar from '../components/StatisticsBar';

import { IPageState } from '../stores/storePage';
import { IDataState } from '../stores/storeData';

import styles from './page.mscss';

const { TabPane } = Tabs;

interface IPageProps{
    pageState: IPageState;
    dataState: IDataState;
}

@inject('pageState', 'dataState')
@observer
class Page extends React.PureComponent<IPageProps> {

    static defaultProps = {};
    timerToken: number = 0;
    deposer: any;
    containerRef: any = React.createRef();

    state:{
        tokenData: Array<IToken>
    } = {
        tokenData: []
    }

    constructor(props) {
        super(props);
    }

    componentDidMount(){    

        this.deposer = reaction(() => this.props.pageState.deviceTypes, (types) => {
            if(Array.isArray(types) && types.length > 0){
                this.fetchToken();
            }
        });
    }

    componentWillUnmount(){
        clearTimeout(this.timerToken);
        this.deposer && this.deposer();
    }

    async fetchToken(){
        const { pageState, dataState } = this.props;
        const { nodeAlias, grade } = pageState;

        if(grade === GRADE.FARM) return;

        clearTimeout(this.timerToken);
        const get = async () => {
            const res = await _dao.getToken(nodeAlias);
            const isUpdate = daoIsOk(res) && !_.isEqual(res.data, this.state.tokenData);

            this.setState( isUpdate ? {tokenData: res.data} : {}, () => {
                clearTimeout(this.timerToken);
                this.timerToken = window.setTimeout(get, CommonTimerInterval);
            });
        }

        get();
    }

    renderTabs(){
        const {pageState, dataState} = this.props;
        const {grade, deviceType, deviceTypes, setDeviceType, setDeviceTypes} = pageState;

        if(grade !== GRADE.DEVICE) return null;

        // reorder

        const {deviceOrderCfg = []} = dataState.pageBottomAndTabCfg;

        let reOrderDeviceTypes = JSON.parse(JSON.stringify(deviceTypes));

        if(deviceOrderCfg.length > 0){
            reOrderDeviceTypes = reOrderDeviceTypes.map(ele => {
                let index = deviceOrderCfg.findIndex(s => s == ele.bay_value);
                return Object.assign({}, ele, {order: index === -1 ? 999 : index});
            })
            .sort(function(a, b){ return a.order - b.order;})
        }

        return <DraggableTabs 
            tabBarGutter={50}
            activeKey={deviceType}
            onTabClick={(key) => {
                let tab = deviceTypes.filter(f => f.bay_value === key)[0];
                setDeviceType(tab.bay_value);
            }}
            onEnd = {(order) => {
                dataState.saveTab(order);
            }}
        >
            {
                reOrderDeviceTypes.map(tab => {
                    const {name, bay_value} = tab
                    return (
                        <TabPane
                            tab={<span>{name}</span>}
                            key={bay_value}
                        >
                        </TabPane>
                    );
                })
            }
        </DraggableTabs>
    }

    render(){
        const {pageState, dataState} = this.props;
        const {grade, deviceType, nodeAlias, nodeType} = pageState;

        let content: any = null;
        if(dataState.getMode() === MODE.LIST){
            content = <List />;
        }else if([MODE.LARGE_ICON, MODE.SMALL_ICON].includes(dataState.getMode())){
            content = <CardContainer 
                topAlias={nodeAlias}
                isMultiFac={grade === GRADE.DEVICE && nodeType && nodeType !== 'FACTORY' && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
                isGroupByFac={grade === GRADE.DEVICE && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
                isGroupByFeeder={grade === GRADE.DEVICE && dataState.isGroupByFeeder()}
                deviceType={deviceType}
                showAlarm={grade === GRADE.DEVICE}
                sortOrderNo={ScadaCfg.isSortNoForDataList()}
                verticalSiteName={ScadaCfg.isVerticalNameForDataList()}
                widthResize={dataState.getUserIconSize()}
                heightResize={dataState.getUserIconSize()}
                mode={dataState.getMode()}
                largeCardHeight={dataState.getLargeCardHeight()}
                models={dataState.getCardAllQuotas()}
                chartModels={dataState.getCardCharts()}
                searchName={dataState.getSearchText()}
                filters={dataState.getReqFilter()}
                showToken={grade === GRADE.DEVICE}
                tokenData={
                    this.state.tokenData.map(
                        ele => Object.assign(
                            {}, 
                            ele, 
                            // 使用scada/project路径下图片
                            {tokenPath: `${ScadaCfg.token.path}${ele.icon_name}${ScadaCfg.token.ext}`}
                        )
                    )
                }
                flashByState={dataState.getFilter(true)[0]?.alias || ''}
            />
        }

        return (
            <div className={styles.container} ref = {this.containerRef}>
                {this.renderTabs()}
                <ToolBar containerRef = {this.containerRef}/>
                <div className={styles.main}>
                    <StatusBar />
                    <div className={styles.content}>
                        {content}
                    </div>
                </div>
                <div className={styles.stat}>
                    <StatisticsBar containerRef = {this.containerRef}/>
                </div>
            </div>
        );
    }
}

export default Page;