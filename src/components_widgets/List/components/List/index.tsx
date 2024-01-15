import * as React from 'react';
import { autorun, IReactionDisposer, reaction } from 'mobx';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { Table, TableProps } from 'antd';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header';
import '@minko-fe/use-antd-resizable-header/dist/style.css';
import { FontIcon, IconType } from 'Icon';
import { _dao, daoIsOk, _pageDao } from '@/common/dao';
import { FetchModel, getPointKey } from '@/common/constants';
import { DataListInterval } from '@/common/const-scada';
import { navTo } from '@/common/util-scada';
import { BAY_TYPE, DEVICE_TYPE, isOtherDeviceType } from '@/common/utils';
import { 
    msg, 
    isZh, 
    getConditionStyle, 
    keyStringMap, 
    reqDecimal 
} from '../../constants';
import CommonDynData from '@/components/DynData';
import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';
import Alarm from '../Alarm/alarm';
import styles from './style.mscss';
import { ColumnType, SortOrder } from 'antd/lib/table/interface';
import { isNumber } from 'lodash';

export type TableState = {
    sortBy?: string
    sortOrder?: string
}
interface ICardListProps {
    dataState: IDataState;
    pageState: IPageState;
    app?: AppName
    drillDown: boolean
    isDev?: boolean;
    navigate?: any;
    routerParams?: any;
    showAlarm?: boolean;
    onTableStateChange?: (state: TableState) => void
}

const ResizableTable = (props: TableProps<any> & {dataState: IDataState}) => {
    const {columns = [], scroll = {}, dataState, ...rest} = props;

    const { components, resizableColumns, tableWidth } = useAntdResizableHeader({
        // @ts-ignore
        columns: columns,
        onResizeEnd: (col) => {
            'dataIndex' in col &&
             col.dataIndex && 
             col.width && 
             dataState.setUserListColWidthData(String(col.dataIndex), col.width)
        }
    });

    return <Table 
        {...rest}
        columns= {resizableColumns}
        scroll = {Object.assign(scroll, {x: tableWidth})}
        components={components}
    />
}

class CardList extends React.PureComponent<ICardListProps> {

    list: React.RefObject<HTMLDivElement> = React.createRef();
    timer: number = 0;
    dispose: any;
    reactionDispose: any;
    reactionDisposeSearch: any;
    tableRowMinWidth = 190;
    alarmComponet: any = React.createRef();

    state = {
        height: 200,
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        sorter: '',
        sortOrder: null as SortOrder
    };

    defaultNameKey = 'WTG.Name';
    defaultAliasKey = 'WTG.Alias';

    resizeOb = new ResizeObserver((arr) => {
        const listEle = arr[0]
        if(!listEle) return
        const {height} = listEle.contentRect
        const listHeight = Math.max(0, height - 86)
        this.setState({height: listHeight})
    })

    async fetchData(loading=false){
        clearTimeout(this.timer);

        const { pageState, dataState } = this.props;
        const { deviceType, siteType, nodeAlias } = pageState;
        const topData = dataState.getUserTopData() || [];
        const cols = dataState.getListColumns();
        let filters = dataState.getReqFilter() || [];
        const nameSearch = dataState.getSearchFilter(this.defaultNameKey) || [];
        filters = filters.concat(nameSearch);
        let filterGroups = dataState.getFilter();

        let parasArr = filterGroups.map(f => ({
            type: f.alias,
            field: isNumber(f.fieldNo) ? f.fieldNo: parseInt(f.fieldNo),
            decimal: reqDecimal
        }))

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
                table_no: Number(ele.tableNo)
            }))),
            farm_type: deviceType === 'farm' ? siteType || '' : '',
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
                this.timer = window.setTimeout(get, DataListInterval);
            });
        }

        get(loading);
    }

    componentDidMount(){
        this.dispose = autorun(() => {
            this.fetchData(true);
        }, {
            // search变化时要置page为1
            delay: 300
        });
        this.reactionDispose = reaction(() => this.props.dataState.getCollapsed(), (collapsed) => {});

        this.list.current && this.resizeOb.observe(this.list.current)

        this.reactionDisposeSearch = reaction(() => this.props.dataState.isSearchFilter(), (isSearching) => {
            if(isSearching){
                this.setState({
                    //data: [],
                    page: 1
                }, () => {
                    this.props.dataState.setIsSearchFilter(false);
                })
            }
        });

    }
    
    componentWillUnmount(){
        clearTimeout(this.timer);
        this.resizeOb.disconnect()
        this.dispose();
        this.reactionDispose();
        this.reactionDisposeSearch();
    }

    onMouseEnter(deviceAlias, event){
        if(this.props.showAlarm && this.alarmComponet.current){
            this.alarmComponet.current.show({
                alias: deviceAlias,
                levelList: '', 
                typeList: '',
                target: event.currentTarget
            });
        }
    }

    onMouseLeave(deviceAlias, event){
        if(this.props.showAlarm && this.alarmComponet.current){
            this.alarmComponet.current.hide();
        }
    }

    change(pagination, filters, sorter, extra){
        switch(extra.action){
            case 'paginate':
                this.setState({
                    pageSize: pagination.pageSize,
                    page: pagination.current
                }, () => this.fetchData(true));
                break;
            case 'sort': {
                this.props.onTableStateChange?.({
                    sortBy: sorter.order ? sorter.field : '',
                    sortOrder: sorter.order || ''
                })
                this.setState({
                    sorter: sorter.order ? sorter.field : '',
                    sortOrder: sorter.order || ''
                }, () => this.fetchData(true));
                break;
            }
        }
    }

    toPage(deviceAlias, event){
        event.preventDefault();
        const eventBtn = event.button;
        const eventBtns = event.buttons;

        // trigger when pressing left mouse button
        // 点击事件暂往老画面跳转
        if((eventBtn === 0 || eventBtns === 1) && this.props.drillDown){
            const { sign } = this.props.routerParams;
            navTo(deviceAlias,{
                compatible: this.props.pageState.deviceType === 'farm',
                listSign: sign,
                navigate: this.props.navigate,
                appName: this.props.app
            });
        }
        
        event.stopPropagation();
    }

    getColumns(): ColumnType<any>[]{
        const { getListColumns, getUserTopData, setUserTopData,getUserListColWidthData } = this.props.dataState;
        const topData = getUserTopData();
        const cw = getUserListColWidthData()

        const nameCol:ColumnType<any> = {
            title: msg('name'),
            width: cw?.[this.defaultNameKey] ?? 200,
            dataIndex: this.defaultNameKey,
            fixed: true,
            align: 'center',
            sorter: true,
            ellipsis: true,
            sortOrder: this.state.sorter === this.defaultNameKey ? this.state.sortOrder : undefined,
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
                        <EllipsisToolTip><a
                            onClick={this.toPage.bind(this, alias)}
                            onMouseEnter={this.onMouseEnter.bind(this, alias)}
                            onMouseLeave={this.onMouseLeave.bind(this, alias)}
                        >{text}</a></EllipsisToolTip>
                    </div>
                </div>;
            }
        }

        const listCols: ColumnType<any>[] = getListColumns().map(ele => {
            let param = {
                quota: ele,
                data: {},
                part: keyStringMap.GRID,
                location: keyStringMap.UNIVERSAL
            }
            const conditionStyle = getConditionStyle(param)
            const unit = 'unit' in conditionStyle && conditionStyle.unit;
            const {nameCn, nameEn, tableNo, fieldNo, alias, unit: rawUnit} = ele;
            let {icon, color, edictNameCn, edictNameEn, ycCondition, yxCondition, convert} = (ele[keyStringMap.GRID])[keyStringMap.UNIVERSAL];
            let valueMap = {};
            if(yxCondition){
                yxCondition.map(c => {
                    const {value, name, name_cn, name_en, icon, color} = c;
                    const keyString = isZh ? name_cn : name_en;
                    if(keyString && !valueMap[keyString]){
                        valueMap[keyString] = {
                            icon: icon,
                            background: color
                        }
                    }
                })
            }
            const currentName = isZh ? edictNameCn || ele.nameCn : edictNameEn || ele.nameEn;
            const dataIndex = `${ele.alias}:${ele.fieldNo}`
            return Object.assign({}, ele, {
                width: cw?.[dataIndex] ?? 200,
                title: <EllipsisToolTip>{`${currentName}${unit || ele.unit ? ` (${unit || ele.unit})` : ''}`}</EllipsisToolTip>,
                dataIndex: dataIndex,
                align: 'center',
                sorter: true,
                ellipsis: true,
                sortOrder: this.state.sorter === dataIndex ? this.state.sortOrder : undefined,
                render: (text = '', row, index) => {
                    const aliasKey = getPointKey(ele, row[this.defaultAliasKey]);
                    // 数据格式 值::背景色::文字颜色
                    const texts = text.split('::');
                    const fill_color = texts[1] || '';
                    const line_color = texts[2] || '';
                    let simDyn = {
                        display_value: texts[0] || '',
                        raw_value: texts[0] || '',
                        timestamp: '',
                        status_value: -1,
                        status: '',
                        key: aliasKey
                    };

                    return <div>
                        <CommonDynData 
                            wrapperCls={styles.dyn}
                            valueContainerCls={styles.dynValue}
                            valueCls={styles.value}
                            showName = {false} 
                            showUnit = {false}
                            valueBackground={fill_color}
                            valueColor={line_color || color}
                            point = {{
                                aliasKey: aliasKey,
                                tableNo: tableNo || '',
                                fieldNo: fieldNo || '',
                                nameCn: nameCn || '',
                                nameEn: nameEn || '',
                                unit: rawUnit,
                            }} 
                            transform = {{
                                nameCn: edictNameCn,
                                nameEn: edictNameEn,
                                convert: convert,
                                icon: icon, 
                                conditions: ycCondition,
                                valueMap: valueMap
                            }}
                            value = {simDyn}
                        />
                    </div>;
                },
            })
        })

        return [
            nameCol,
            ...listCols
        ]
    }

    render(){
        const cols = this.getColumns();
        const actualTotal = this.state.total
        const pageSize = this.state.pageSize
        const topDataSum = Math.min((this.props.dataState.getUserTopData() || []).length, pageSize)
        const actualPageSize = Math.max(pageSize - topDataSum, 1)
        const calcPageSum = Math.ceil(actualTotal / actualPageSize) 
        const totalWithTop = pageSize - topDataSum === 0 ? pageSize: calcPageSum * pageSize

        return (
            <div className={styles.list} ref={this.list} >
                <ResizableTable
                    key={this.props.pageState.deviceType}
                    showSorterTooltip={false}
                    columns={cols} 
                    dataSource={this.state.data.map(d => Object.assign({}, d, {key: d[this.defaultAliasKey]}))}
                    size="small" 
                    scroll={{
                        y: this.state.height,
                        x: cols.length * this.tableRowMinWidth
                    }}
                    pagination={{
                        current: this.state.page,
                        pageSize: this.state.pageSize,
                        total: totalWithTop,
                        position: ["bottomCenter"],
                        showSizeChanger: true,
                        showTotal: () => msg('totalRecords') + actualTotal
                    }}
                    onChange={this.change.bind(this)}
                    dataState={this.props.dataState}
                />
                { this.props.showAlarm ? <Alarm ref={this.alarmComponet} /> : null }
            </div>
        );
    }
}

export default CardList;