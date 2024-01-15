import * as React from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { FontIcon, IconType, Icon2 } from 'Icon';
import { getPointKey } from '@/common/constants';
import { _dao, daoIsOk } from '@/common/dao';
import { TimerInterval } from '@/common/const-scada';
import {gradient} from '@/common/util-scada';
import { GRADE, msg, reqDecimal, defaultColNum, keyStringMap } from '../../constants';
import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';
import Set from '../QuotaSet';
import CommonDynData from '@/components/DynData';
import styles from './style.mscss';

interface IStatisticsBarProps{
    pageState: IPageState;
    dataState: IDataState;
};

@observer
class StatisticsBar extends React.PureComponent<IStatisticsBarProps> {
    isUnmounted: boolean = false;

    timer: any = null;

    deposer: any;

    state = {
        dynData: {}
    }

    componentDidMount(){
        this.deposer = reaction(() => this.props.dataState.getPageBottom(), (columns) => {
            columns && this.fetchData();
        });
    }
    
    componentWillUnmount(){
        this.isUnmounted = true;
        clearTimeout(this.timer);
        this.deposer && this.deposer();
    }

    fetchData(){
        const { pageState, dataState } = this.props;
        const nodeAlias = pageState.nodeAlias;
        const columns = dataState.getPageBottom();

        if(!columns)return;

        const req = columns.map(ele => ({
            id: '',
            key: getPointKey(ele, nodeAlias),
            decimal: reqDecimal
        }));
        
        clearTimeout(this.timer);
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

            !this.isUnmounted && this.setState({dynData: Object.assign({}, this.state.dynData, dynData)}, () => {
                clearTimeout(this.timer);
                this.timer = setTimeout(get, TimerInterval as number);
            });
        }

        get();
    }

    render(){
        const { pageState, dataState } = this.props;
        const nodeAlias = pageState.nodeAlias;
        let columns = dataState.getPageBottom();
        if(!Array.isArray(columns)){
            columns = [];
        }
        const colNum = dataState.getColNum();
        const isCollapsed = dataState.getCollapsed();
        const dynMap = this.state.dynData;

        const cls = ((isCollapsed || columns.length === 0) && !dataState.isStatsConfiguring) ? styles.collapse : '';
        return (
            <div className={`${styles.statbar} ${cls}`}>
                <div className={`${isCollapsed ? styles.hidden : ''} ${columns.length === 0 ? styles.empty : ''}`}>
                    {
                        columns.map((col, ind) => {

                            const key = getPointKey(col, nodeAlias);
                            const {nameCn, nameEn, tableNo, fieldNo, unit} = col;
                            let {STATISTICS, UNIVERSAL} = keyStringMap;
                            let {color, icon, edictNameCn, edictNameEn, convert} = col[STATISTICS][UNIVERSAL] || {};
                            let {colorFrom, colorTo} = gradient(color, 0.25);

                            const finalColNum = colNum || defaultColNum;

                            return <CommonDynData 
                                key={key}
                                wrapperStyle={{flex: `0 0 ${100/finalColNum}%`}}
                                wrapperCls={styles.dynWrapper}
                                containerStyle={{...(colorFrom && colorTo ? {background: `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`} : {})}}
                                containerCls={styles.dyn}
                                nameContainerCls={styles.dynName}
                                nameCls={styles.name}
                                valueContainerCls={styles.dynValue}
                                showName = {true}
                                unitAfterName = {true}
                                valueBackground={dynMap[key]?.fill_color}
                                valueColor={dynMap[key]?.line_color}
                                point={{
                                    aliasKey: key,
                                    nameCn,
                                    nameEn,
                                    tableNo,
                                    fieldNo,
                                    unit
                                }}
                                transform={{
                                    nameCn: edictNameCn,
                                    nameEn: edictNameEn,
                                    icon,
                                    convert
                                }}
                                value={dynMap[key]}
                            />
                        })
                    }
                </div>
                <div className={styles.toolbar}>
                    <div className={styles.updown} onClick={() => dataState.setCollapsed()}>
                        {
                            isCollapsed
                            ? <FontIcon type={IconType.DOUBLE_UP}/>
                            : <FontIcon type={IconType.DOUBLE_DOWN}/>
                        }                    
                    </div>
                    <Set 
                        height = {window.innerHeight - (16 + Math.ceil(columns.length/Number(colNum))*35) -220}
                        isFarm = {pageState.grade === GRADE.FARM}
                        listType = {'statistics'}
                        data = {{
                            quotaList: dataState.getPageBottomModels(),
                            cfg: dataState.getPageBottomConfigData()
                        }}
                        placement={'topLeft'}
                        trigger={'click'}
                        visible={dataState.isStatsConfiguring}
                        onVisibleChange={visible => {
                            dataState.setIsStatsConfiguring(visible);
                        }}
                        onCancel={() => {
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
                </div>
            </div>
        );
    }
}

export default StatisticsBar;