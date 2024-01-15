import React, { useEffect, useRef, useState } from 'react';
import { reaction, observe, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Tabs } from 'antd';
import _ from 'lodash';
import ScadaCfg, { CommonTimerInterval } from '@/common/const-scada';
import { _dao, daoIsOk } from '@/common/dao';
import DraggableTabs from '@/components/DraggableTabs';
import { MODE, GRADE, keyStringMap, TOKEN_SIZE } from '../constants';
import List, { TableState } from '../components/List';
import CardContainer from '../components/CardContainer';
import ToolBar from '../components/ToolBar';
import StatusBar from '../components/StatusBar';
import StatisticsBar from '../components/StatisticsBar';
import { IPageState } from '../stores/storePage';
import { IDataState } from '../stores/storeData';
import styles from './page.mscss';
import { FontIcon } from 'Icon';
import iconsMap from 'Icon/iconsMap';

const { TabPane } = Tabs;

interface IPageProps{
    app: AppName
    drillDown: boolean
    pageState: IPageState;
    dataState: IDataState;
    isDev?: boolean;
    navigate?: any;
    routerParams?: any;
}

/**@function */
/* const Page1: React.FC<IPageProps> = (props) => {
    const {isDev, pageState, dataState} = props;
    const {grade, deviceType, siteType, nodeAlias, nodeType, deviceTypes, setDeviceType} = pageState;
    const pageDeposer = useRef<any>();
    const dataDeposer = useRef<any>();
    const categoriesDeposer = useRef<any>();
    const deposer = useRef<any>();
    const timerToken = useRef<any>();
    const [state, setState] = useState<{
        tokenData: Array<IToken>
        tableState?: TableState
    }>({tokenData: []});

    useEffect(() => {
        if(isDev){
            pageDeposer.current = observe(pageState, change => {
                console.log('%cMobx changed in pageState', 'color:#f00');
                console.log('%cType', 'color:#0f0', change.type);
                console.log('%cName', 'color:#0f0', change.name);
                //@ts-ignore
                console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
            });
            dataDeposer.current = observe(dataState, change => {
                console.log('%cMobx changed in dataState', 'color:#f00');
                console.log('%cType', 'color:#0f0', change.type);
                console.log('%cName', 'color:#0f0', change.name);
                //@ts-ignore
                console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
            });
        }

        deposer.current = reaction(() => dataState.categories[pageState.deviceType], (categories) => {
            console.log('categories', categories);
        });
        // 设备和场站都需要
        fetchToken();

        return () => {
            clearTimeout(timerToken.current);
            pageDeposer.current && pageDeposer.current();
            dataDeposer.current && dataDeposer.current();
        }
    }, []);

    useEffect(() => {
        if(isDev){
            if(pageState.deviceType){
                categoriesDeposer.current && categoriesDeposer.current();
                categoriesDeposer.current = observe(dataState.categories[pageState.deviceType], change => {
                    console.log(`%cMobx changed in categories of device_type: ${pageState.deviceType}`, 'color:#f00');
                    console.log('%cType', 'color:#0f0', change.type);
                    console.log('%cName', 'color:#0f0', change.name);
                    //@ts-ignore
                    console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                    console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
                });
            }
        }

        return () => {
            categoriesDeposer.current && categoriesDeposer.current();
        }
    }, [deviceType, dataState.categories]);

    const handleTableStateChange = (tableState: TableState) => {
        setState(state => ({...state, tableState}))
    }

    const fetchToken = async() => {
        clearTimeout(timerToken.current);
        const get = async () => {
            const res = await _dao.getToken(nodeAlias);
            const isUpdate = daoIsOk(res) && !_.isEqual(res.data, state.tokenData);
            if(isUpdate){
                setState(state => ({...state, ...{tokenData: res.data}}));
                clearTimeout(timerToken.current);
                timerToken.current = window.setTimeout(get, CommonTimerInterval);
            }            
        }

        get();
    }

    const renderTabs = () => {
        if(grade !== GRADE.DEVICE) return null;

        return <DraggableTabs 
            tabBarGutter={50}
            activeKey={deviceType}
            onTabClick={(key) => {
                let tab = deviceTypes.filter(f => f.bay_value === key)[0];
                setDeviceType(tab.bay_value);
            }}
            onDragEnd = {(order) => {
                dataState.saveTab(order);
            }}
        >
            {
                deviceTypes.map(tab => {
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

    let content: any = null;
    if(dataState.getMode() === MODE.LIST){
        content = <List 
            key={deviceType}
            showAlarm={grade === GRADE.DEVICE} 
            onTableStateChange={(state) => handleTableStateChange(state)}
            {...props}
        />;
    }else if([MODE.LARGE_ICON, MODE.SMALL_ICON].includes(dataState.getMode())){
        content = <CardContainer 
            key={nodeAlias+deviceType+dataState.getMode()}//每次都卸载,否则会触发比对导致卡顿
            topAlias={nodeAlias}
            isMultiFac={grade === GRADE.DEVICE && !!nodeType && nodeType !== 'FACTORY' && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
            isGroupByFac={grade === GRADE.DEVICE && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
            isGroupByFeeder={grade === GRADE.DEVICE && dataState.isGroupByFeeder()}
            deviceType={deviceType}
            siteType={siteType}
            showAlarm={grade === GRADE.DEVICE}
            sortOrderNo={ScadaCfg.isSortNoForDataList()}
            verticalSiteName={ScadaCfg.isVerticalNameForDataList()}
            widthResize={dataState.getUserIconSize()}
            heightResize={dataState.getUserIconSize()}
            mode={dataState.getMode()}
            largeCardHeight={dataState.getLargeCardHeight()}
            largeCardWidth={dataState.getLargeCardWidth()}
            models={dataState.getCardAllQuotas()}
            chartModels={dataState.getCardCharts()}
            searchName={dataState.getSearchText()}
            filters={dataState.getReqFilter()}
            showToken={grade === GRADE.DEVICE || grade === GRADE.FARM}
            tokenSize={dataState.getCategoryCfg()?.functionCfg?.[keyStringMap.CARD]?.cardSize?.cardSize ?? TOKEN_SIZE.default}
            tokenData={
                state.tokenData.map(
                    ele => Object.assign(
                        {}, 
                        ele, 
                        // 使用scada/project路径下图片
                        {tokenPath: `${ScadaCfg.token.path}${ele.icon_name}${ScadaCfg.token.ext}`}
                    )
                )
            }
            flashByState={
                dataState.getCategoryCfg()?.functionCfg?.[keyStringMap.CARD]?.[keyStringMap.FLICKER]?.enable ?
                dataState.getFilter().map(f => f.alias): undefined
            }
            filterFacName={grade === GRADE.DEVICE && dataState.filterFacName}
            {...props}
        />
    }

    return (
        <div className={styles.container}>
            {renderTabs()}
            <ToolBar  {...props} tableState={state.tableState}/>
            <div className={styles.main}>
                <StatusBar {...props}/>
                <div className={styles.content}>
                    {content}
                </div>
            </div>
            <div className={styles.stat}>{
                dataState.getPageBottomModels() && 
                dataState.getPageBottomModels().length > 0 && 
                <StatisticsBar {...props}/>
            }</div>
        </div>
    );
} */

class Page extends React.PureComponent<IPageProps> {

    static defaultProps = {};
    timerToken: number = 0;
    pageDeposer: any;
    dataDeposer: any;
    categoriesDeposer: any;
    deposer: any;
    changedDeposer: any;

    state:{
        tokenData: Array<IToken>;
        tableState?: TableState;
        largeCardWidth: number;
        largeCardHeight: number;
        quotaTextWidth?: number;
    } = {
        tokenData: [],
        largeCardWidth: 0,
        largeCardHeight: 0
    }

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        if(this.props.isDev){
            this.pageDeposer = observe(this.props.pageState, change => {
                console.log('%cMobx changed in pageState', 'color:#f00');
                console.log('%cType', 'color:#0f0', change.type);
                console.log('%cName', 'color:#0f0', change.name);
                //@ts-ignore
                console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
            });
            this.dataDeposer = observe(this.props.dataState, change => {
                console.log('%cMobx changed in dataState', 'color:#f00');
                console.log('%cType', 'color:#0f0', change.type);
                console.log('%cName', 'color:#0f0', change.name);
                //@ts-ignore
                console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
            });
        }

        this.deposer = reaction(() => this.props.pageState.deviceType, (deviceType) => {
            this.calLargeSize();
        });

        this.changedDeposer = reaction(() => this.props.dataState.categoryChanged, (changed) => {
            if(changed){
                this.calLargeSize();
                this.props.dataState.recoverCategoryChanged();
            }            
        });

        // 设备和场站都需要
        this.fetchToken();
    }

    componentDidUpdate(prevProps: Readonly<IPageProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if(this.props.isDev){
            if(this.props.pageState.deviceType){
                this.categoriesDeposer && this.categoriesDeposer();
                this.categoriesDeposer = observe(this.props.dataState.categories[this.props.pageState.deviceType], change => {
                    console.log(`%cMobx changed in categories of device_type: ${this.props.pageState.deviceType}`, 'color:#f00');
                    console.log('%cType', 'color:#0f0', change.type);
                    console.log('%cName', 'color:#0f0', change.name);
                    //@ts-ignore
                    console.log('%cPrev', 'color:#0f0', toJS(change.oldValue));
                    console.log('%cNext', 'color:#0f0', toJS(change.object[change.name]));
                });
            }
        }
    }

    componentWillUnmount(){
        clearTimeout(this.timerToken);
        this.pageDeposer && this.pageDeposer();
        this.dataDeposer && this.dataDeposer();
        this.categoriesDeposer && this.categoriesDeposer();
        this.deposer && this.deposer();
        this.changedDeposer && this.changedDeposer();
    }

    calLargeSize(){
        const largeCardSize = this.props.dataState.getLargeCardWidth();
        const largeCardWidth = largeCardSize.width;
        const quotaTextWidth = largeCardSize.quotaTextWidth;
        const largeCardHeight = this.props.dataState.getLargeCardHeight();
        this.setState(state => ({...state, ...{largeCardWidth, largeCardHeight, quotaTextWidth}}));
    }

    handleTableStateChange(tableState: TableState){
        this.setState(state => ({...state, tableState}))
    }

    async fetchToken(){
        const { pageState } = this.props;
        const { nodeAlias } = pageState;

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
        const {grade, deviceType, deviceTypes, deviceIconMap, setDeviceType} = pageState;

        if(grade !== GRADE.DEVICE) return null;

        return <DraggableTabs 
            tabBarGutter={50}
            activeKey={deviceType}
            onTabClick={(key) => {
                let tab = deviceTypes.filter(f => f.bay_value === key)[0];
                setDeviceType(tab.bay_value);
            }}
            onDragEnd = {(order) => {
                dataState.saveTab(order);
            }}
        >
            {
                deviceTypes.map(tab => {
                    const {name, bay_value} = tab
                    const iconCfg = deviceIconMap[bay_value]
                    return (
                        <TabPane
                            tab={<span>
                                {iconCfg?.key && <FontIcon type={iconsMap[iconCfg.key]} style={{
                                    marginRight: 4,
                                    color: iconCfg.color
                                }}/>}
                                {name}
                            </span>}
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
        const {grade, deviceType, siteType, nodeAlias, nodeType} = pageState;

        let content: any = null;
        if(dataState.getMode() === MODE.LIST){
            content = <List 
                key={deviceType}
                showAlarm={grade === GRADE.DEVICE && dataState.getEnableAlarm()} 
                onTableStateChange={(state) => this.handleTableStateChange(state)}
                {...this.props}
            />;
        }else if([MODE.LARGE_ICON, MODE.SMALL_ICON].includes(dataState.getMode())){
            content = <CardContainer 
                key={nodeAlias+deviceType+dataState.getMode()}//每次都卸载,否则会触发比对导致卡顿
                topAlias={nodeAlias}
                isMultiFac={grade === GRADE.DEVICE && !!nodeType && nodeType !== 'FACTORY' && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
                isGroupByFac={grade === GRADE.DEVICE && (dataState.isGroupByFac() || dataState.isGroupByFeeder())}
                isGroupByFeeder={grade === GRADE.DEVICE && dataState.isGroupByFeeder()}
                deviceType={deviceType}
                siteType={siteType}
                showAlarm={grade === GRADE.DEVICE && dataState.getEnableAlarm()}
                sortOrderNo={ScadaCfg.isSortNoForDataList()}
                verticalSiteName={ScadaCfg.isVerticalNameForDataList()}
                widthResize={dataState.getUserIconSize()}
                heightResize={dataState.getUserIconSize()}
                mode={dataState.getMode()}
                largeCardHeight={this.state.largeCardHeight}
                largeCardWidth={this.state.largeCardWidth}
                models={dataState.getCardAllQuotas()}
                chartModels={dataState.getCardCharts()}
                searchName={dataState.getSearchText()}
                filters={dataState.getReqFilter()}
                showToken={grade === GRADE.DEVICE || grade === GRADE.FARM}
                tokenSize={dataState.getCategoryCfg()?.functionCfg?.[keyStringMap.CARD]?.cardSize?.cardSize ?? TOKEN_SIZE.default}
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
                flashByState={
                    dataState.getCategoryCfg()?.functionCfg?.[keyStringMap.CARD]?.[keyStringMap.FLICKER]?.enable ?
                    dataState.getFilter().map(f => f.alias): undefined
                }
                filterFacName={grade === GRADE.DEVICE && dataState.filterFacName}
                quotaTextWidth={this.state.quotaTextWidth}
                {...this.props}
            />
        }

        return (
            <div className={styles.container}>
                {this.renderTabs()}
                <ToolBar  {...this.props} tableState={this.state.tableState}/>
                <div className={styles.main}>
                    <StatusBar {...this.props}/>
                    <div className={styles.content}>
                        {content}
                    </div>
                </div>
                <div className={styles.stat}>{
                    dataState.getPageBottomModels() && 
                    dataState.getPageBottomModels().length > 0 && 
                    <StatisticsBar {...this.props}/>
                }</div>
            </div>
        );
    }
}

export default observer(Page);