import * as React from 'react';
import ReactDOM from 'react-dom';
import { autorun, IReactionDisposer, reaction } from 'mobx';
import { observer } from 'mobx-react';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { Table } from 'antd';
import { FontIcon, IconType } from 'Icon';
import { _dao, daoIsOk } from '@/common/dao';
import { FetchModel, getPointKey } from '@/common/constants';
import { CommonTimerInterval } from '@/common/const-scada';
import { BAY_TYPE, DEVICE_TYPE } from '@/common/utils';
import StoresContext from '../../stores';
import { msg, isOtherDeviceType, isZh, getConditionStyle, keyStringMap, getPointType, reqDecimal } from '../../constants';
import DynData from '../DynData';

import styles from './style.mscss';

interface ICardListProps {

}

class CardList extends React.PureComponent<ICardListProps> {
    static contextType = StoresContext;

    list: React.RefObject<HTMLDivElement> = React.createRef();
    timer: number = 0;
    dispose: any;
    reactionDispose: any;
    tableRowMinWidth = 190;

    state = {
        height: 200,
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        sorter: '',
        sortOrder: false // ascend descend false
    };

    defaultNameKey = 'WTG.Name';
    defaultAliasKey = 'WTG.Alias';

    resize(){
        if(!this.list.current) return;
        let height = this.list.current.clientHeight - 84;
        if(height < 200) height = 200;
        this.setState({height});
    }

    async fetchData(loading=false){
        clearTimeout(this.timer);

        const { pageState, dataState } = this.context;
        const { deviceType, nodeAlias } = pageState;
        const topData = dataState.getUserTopData() || [];
        const cols = dataState.getListColumns();
        let filters = dataState.getReqFilter() || [];
        const nameSearch = dataState.getSearchFilter(this.defaultNameKey) || [];
        filters = filters.concat(nameSearch);
        let filter = dataState.getFilter(false)[0];

        let parasArr = filter ? [{
            type: filter.alias,
            field: Number(filter.fieldNo || ''),
            decimal: reqDecimal,
        }] : [];

        const req = Object.assign({}, FetchModel.TableListReq, {
            data_level: isOtherDeviceType(deviceType) ? 'device' : deviceType,
                device_type: isOtherDeviceType(deviceType) ? deviceType : '',
                filter_bay_type: deviceType === DEVICE_TYPE.INVERTER 
                ? BAY_TYPE.INVERTER_STR
                : (deviceType === DEVICE_TYPE.DC_COMBINER ? BAY_TYPE.AC_COMBINER_STR: ''),
            root_nodes: nodeAlias,
            paras: parasArr.concat(cols.map(ele => ({
                type: ele.alias,
                field: Number(ele.fieldNo || ''),
                decimal: reqDecimal,
            }))),
            farm_type: '',
            page_num: this.state.page,
            row_count: this.state.pageSize,
            top_rows: topData.join(','),
            order_by: this.state.sorter || this.defaultNameKey,
            is_asc: this.state.sortOrder !== 'descend',
            filters: filters,
            tree_grid: false,
            need_color: "true"
        });

        const get = async (loading) => {
            
            loading && pageState.setLoading(true);
            const res = await _dao.getDeviceList(req);
            loading && pageState.setLoading(false);

            this.setState(daoIsOk(res) ? {data: res.data, total: res.record_count} : {}, () => {
                clearTimeout(this.timer);
                this.timer = window.setTimeout(get, CommonTimerInterval);
            });
        }

        get(loading);
    }

    componentDidMount(){
        this.dispose = autorun(() => {
            this.fetchData(true);
        });
        this.reactionDispose = reaction(() => this.context.dataState.getCollapsed(), (collapsed) => {
            window.setTimeout(() => {
                this.resize();
            }, 100);
        });

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }
    
    componentWillUnmount(){
        clearTimeout(this.timer);
        window.removeEventListener('resize', this.resize.bind(this));
        this.dispose();
        this.reactionDispose();
    }

    change(pagination, filters, sorter, extra){
        switch(extra.action){
            case 'paginate':
                this.setState({
                    pageSize: pagination.pageSize,
                    page: pagination.current
                }, () => this.fetchData(true));
                break;
            case 'sort':
                this.setState({
                    sorter: sorter.order ? sorter.field : '',
                    sortOrder: sorter.order || ''
                }, () => this.fetchData(true));
                break;
        }
    }

    getColumns(){
        const { getListColumns, getUserTopData, setUserTopData } = this.context.dataState;
        const topData = getUserTopData();

        return [{
            title: msg('name'),
            dataIndex: this.defaultNameKey,
            fixed: true,
            align: 'center',
            sorter: true,
            ellipsis: true,
            sortOrder: this.state.sorter === this.defaultNameKey ? this.state.sortOrder : false,
            render: (text, row, index) => {
                const alias = row[this.defaultAliasKey];
                const isTop = topData.indexOf(alias) > -1;
                return <div className={styles.name}>
                    <div 
                        className={`${styles.top} ${isTop ? styles.checked : ''}`}
                        onClick={() => setUserTopData(alias)} 
                    >
                        <span>
                            <FontIcon type={isTop ? IconType.MARK : IconType.UNMARK}/>
                        </span>
                    </div>
                    <div style={{paddingLeft: 10}}>
                        <EllipsisToolTip><a>{text}</a></EllipsisToolTip>
                    </div>
                </div>;
            }
        }].concat(getListColumns().map(ele => {
            let param = {
                quota: ele,
                data: {},
                part: keyStringMap.GRID,
                location: keyStringMap.UNIVERSAL
            }
            let {unit} = getConditionStyle(param);
            let currentName = isZh ? ele.nameCn || ele.name : ele.nameEn || ele.name;
            return Object.assign({}, ele, {
                title: <EllipsisToolTip>{`${currentName}${unit || ele.unit ? ` (${unit || ele.unit})` : ''}`}</EllipsisToolTip>,
                dataIndex: `${ele.alias}:${ele.fieldNo}`,
                align: 'center',
                sorter: true,
                ellipsis: true,
                sortOrder: this.state.sorter === `${ele.alias}:${ele.fieldNo}` ? this.state.sortOrder : false,
                render: (text = '', row, index) => {
                    // 数据格式 值::背景色::文字颜色
                    const texts = text.split('::');

                    const quotaType = getPointType(ele.tableNo);

                    let {unit, ...restProps} = getConditionStyle(Object.assign({}, param, {data: {display_value: texts[0]}}));
                    return <div>
                        <DynData 
                            aKey={getPointKey(ele, row[this.defaultAliasKey])}
                            name = {currentName}
                            {...restProps}
                            bgShow = {quotaType === 'yx'}
                            colorShow = {quotaType !== 'yx'}
                        />
                    </div>;
                },
            });
        }));
    }

    render(){
        const cols = this.getColumns();

        return (
            <div className={styles.list} ref={this.list} >
                <Table
                    showSorterTooltip={false}
                    columns={cols} 
                    dataSource={this.state.data}
                    size="small" 
                    scroll={{
                        y: this.state.height,
                        x: cols.length * this.tableRowMinWidth
                    }}
                    pagination={{
                        pageSize: this.state.pageSize,
                        total: this.state.total,
                        position: ["bottomCenter"],
                        showSizeChanger: true,
                        showTotal: () => msg('totalRecords') + this.state.total.toString()

                    }}
                    onChange={this.change.bind(this)}
                />
            </div>
        );
    }
}

export default CardList;