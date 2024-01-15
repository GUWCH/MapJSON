import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { List, AutoSizer } from 'react-virtualized';
import { DatePicker } from 'antd';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';
import { notify } from 'Notify';
import { NewSelect } from 'Select';
import EchartsWrap from 'EchartsWrap';
import EnvLoading from 'EnvLoading';
import { getTheme } from '../common/theme';
import Intl from '../common/lang';
import scadaCfg, { DATE_CUSTOM_FORMAT } from '../common/const-scada';
import { NumberUtil } from '../common/utils';
import { _dao, daoIsOk } from '../common/dao';
import { DATE_MOMENT_FORMAT, TREE_NODE_TYPE } from '../common/constants';
import { 
    msg,
    POINT_ALIAS,
    SELECT, 
    COLUMN,
    EchartColors,
    debugData
} from './Constant';
import ExportDialog from './ExportDialog';
import CurveTab from './CurveTab';
import '../common/css/app.scss';
import './style.scss';

if (Intl.isZh) {
    moment.locale('zh-cn');
}

const { RangePicker } = DatePicker;
const theme = getTheme();
const FILE_NAME = 'history_data';
const TIME_LIMIT = 86400;
const TIME_UNIT = 3600;
const THRESHOLD_VALUE = 13;
const TEMP_GROUP = 14;
const VOL_NUM = 12;
const TEM_NUM = 4;

const prefixCls = 'battery-curve';

export default class BatteryCurve extends Component {

    constructor(props) {
        super(props);
        this.container = React.createRef(null);

        const lastDay = moment().subtract(1, 'days').format(DATE_MOMENT_FORMAT.DATE);
        const st = `${lastDay} 00:00:00`;
        const et = `${lastDay} 01:00:00`;
        this.state = {
            isRawVol: true,
            isVol: true,
            packNum: 0,
            subSystemAlias: undefined,
            batteryClusterAlias: undefined,
            subSystemNodes: [],
            batteryCluster: [],
            rawCurrentPack: 0,
            currentPack: 0,
            dilution: '',
            dilutionOptions: [],
            startTime: st,
            endTime: et,
            momentStartTime: moment(st),
            momentEndTime: moment(et),
            datasetAlias: undefined,

            /**
             * 测点集合
             * @type {Object[]}
             * @property {String} alias
             * @property {String} name
             */
            dataset: [],

            /**
             * 历史数据
             * @type {Object[]}
             * @property {String} name // 需要手动添加
             * @property {String} alias
             * @property {Object[]} history
             * @param {String} history.time
             * @param {String|Number} history.value
             * @param {String|Number} history.status
             * @param {String} history.statusName // 需要手动添加
             */
            data: [],
            isCurve: true,
            dialogShow: false,
            currentChartTab: 1,
            isLoading: false
        }
    }

    componentDidMount() {
        this.requestNodes();
    }

    requestNodes = () => {
        let subSystemNodes = [];

        if(process.env.NODE_ENV === 'development'){
            this.setState({
                subSystemNodes: debugData
            })
            return;
        }

        const curNode = scadaCfg.getCurNodeAlias();
        scadaCfg.getTree().then(tree => {
            if (!tree) return;

            let rootNode = tree.getNodeByParam('alias', curNode) || tree.getNodeByParam('name', curNode);

            if(!rootNode) return;

            const allNodes = tree.transformToArray(rootNode);
            const nodeMap = {};

            allNodes.forEach(node => {
                const { alias='', node_type } = node;

                const toSecond = alias.split('.').slice(0, 2).join('.');

                if(!toSecond)return;

                nodeMap[toSecond] = nodeMap[toSecond] || {};

                if(String(node_type) === String(TREE_NODE_TYPE.STORAGE_SUB_SYSTEM)){
                    nodeMap[toSecond].first = node;
                }

                if(String(node_type) === String(TREE_NODE_TYPE.STORAGE_BATTERY_CLUSTER)){
                    nodeMap[toSecond].second = nodeMap[toSecond].second || [];
                    nodeMap[toSecond].second.push(node);
                }
            });

            Object.keys(nodeMap).forEach(k => {
                const {first, second=[]} = nodeMap[k] || {};
                if(first){
                    first.batteryCluster = second;
                    subSystemNodes.push(first);
                }
            });

            this.setState({
                subSystemNodes: subSystemNodes
            })
        });
    }

    // 获取测点集前check
    onDataSetCheck = () => {

        if (!this.state.subSystemAlias) {
            notify(msg('Select ESS'))
            return false
        }

        if (!this.state.batteryClusterAlias) {
            notify(msg('Select RBMS'))
            return false
        }
        return true
    }

    getPointAlias = (alias, suffix) => {
        const bayAlias = alias.split('.').slice(0, 3).join('.');
        return `${bayAlias}.${suffix}`;
    }

    getYc = (alias, suffix) => {
        return `1:62:${this.getPointAlias(alias, suffix)}:9`;
    }

    // 请求数据集
    // eslint-disable-next-line complexity
    requestDataSet = async () => {
        if (!this.onDataSetCheck()) {
            return;
        }

        const { batteryClusterAlias, isVol } = this.state;
        const aliasSuffix = isVol ? POINT_ALIAS.VolNode : POINT_ALIAS.TempNode;
        const datasetAlias = this.getPointAlias(batteryClusterAlias, aliasSuffix);
        
        const [datasetRes={}, pkNumRes={}] = await Promise.all([_dao.getDataSet({
            points: [{
                define_alias: datasetAlias
            }]
        }), _dao.getDynData([{
            id: '',
            key: this.getYc(batteryClusterAlias, POINT_ALIAS.KeyPkNum),
            decimal: 0
        }])]);

        if (datasetRes.code !== '10000' || !datasetRes.success_lst) {
            notify(msg('get dataSet fail'))
            return;
        } else if (datasetRes.success_lst.length === 0) {
            notify(msg('dataSet null'))
            return;
        }

        if (pkNumRes.code !== '10000' || !Array.isArray(pkNumRes.data)) {
            notify(msg('get packNum fail'))
            return;
        }

        let { display_value='' } = pkNumRes.data[0] || {};
        display_value = NumberUtil.removeCommas(display_value);
        if (!NumberUtil.isFinite(display_value) || Number(display_value) <= 0) {
            notify(msg('get packNum fail'))
            return;
        }
        
        let { define_alias, dataset = [] } = datasetRes.success_lst[0];
        this.setState({
            packNum: /^[1-9]\d*$/.test(display_value) ? Number(display_value) : 0,
            datasetAlias: define_alias,
            dataset: dataset.sort(function (x, y) {
                return x.alias.localeCompare(y.alias);
            })
        });
    }

    // eslint-disable-next-line complexity
    onCheck = () => {
        let { 
            startTime, 
            endTime, 
            momentStartTime, 
            momentEndTime, 
            dilution, 
            dataset, 
            currentPack 
        } = this.state;

        if (!dataset || !Array.isArray(dataset)) {
            notify(msg('pointLost'));
            return false;
        }

        if (currentPack === undefined) {
            notify(msg('Select PACK'));
            return false;
        }

        if (!dilution) {
            notify(msg('timeInterval'));
            return false;
        }

        if (!momentStartTime || !momentEndTime || !startTime || !endTime) {
            notify(msg('timeLost'));
            return false;
        }

        if (moment(Date.now()).startOf('day').diff(momentStartTime, 'seconds') > TIME_LIMIT ||
            moment(Date.now()).startOf('day').diff(momentStartTime, 'seconds') < 0
        ) {
            notify(msg('too early'));
            return false;
        }

        if (moment(momentEndTime).diff(momentStartTime, 'seconds') > TIME_UNIT) {
            notify(msg('too long'));
            return false;
        }

        return true;
    }

    onSearch = async () => {
        if (!this.onDataSetCheck() || !this.onCheck()) {
            return;
        }

        // 获取历史数据
        const { 
            startTime, 
            endTime, 
            dilution, 
            dataset, 
            datasetAlias, 
            currentPack, 
            isVol,
            packNum
        } = this.state;

        if (!currentPack) {
            notify(msg('Select PACK'));
            return;
        }
        const volOrTmpNum = packNum === 0 ? (isVol ? VOL_NUM : TEM_NUM) : Math.ceil(dataset.length / packNum);
        const points = (dataset || []).slice(volOrTmpNum * (currentPack - 1), volOrTmpNum * currentPack);
        let req = {
            start_time: startTime,
            end_time: endTime,
            dilution: dilution,
            points: points.map(p => ({alias: p.alias})),
            define_point: datasetAlias
        };
        this.setState({isLoading: true});
        const res = await _dao.getDataSetHistoryData(req);
        this.setState({isLoading: false});

        let data = [];
        if (res &&  ['10000', '10001'].indexOf(String(res.code)) > -1) {
            const {success_lst, failed_lst} = res;
            data = success_lst;
            if(Array.isArray(failed_lst) && failed_lst.length > 0){
                failed_lst.map((e) => {
                    data.push({
                        alias: e,
                        history: []
                    });
                });
            }            
        }else {
            notify(msg('getCurveFail'));
        }

        data.sort((x, y) => {
            return x.alias.localeCompare(y.alias);
        });

        let nameMap = {};
        this.state.dataset.forEach(p => {
            nameMap[p.alias] = p.name;
        });

        data = data.map(d => {
            d.name = nameMap[d.alias] || '';
            d.history = d.history.map(h => {
                h.statusName = String(h.status) === '0' ? msg('valid') : msg('invalid');
                return h;
            });
            return d;
        });

        this.setState({
            currentChartTab: 1,
            data: data,
            rawCurrentPack: this.state.currentPack,
            isRawVol: this.state.isVol
        });
    }

    onExport = () => {
        if (this.state.data.length > 0) {
            this.onExportConfirm('csv');
            // this.setState({
            //     dialogShow: true
            // });
        } else {
            notify(msg('dataLost'));
        }
    }

    async onExportConfirm(fileType) {
        this.setState({
            dialogShow: false
        })

        let { data, isRawVol, rawCurrentPack } = this.state;
        let exportData = [];
        let no = 0;
        data.map((d, ind) => {
            d.history.map((record, index) => {
                exportData.push({
                    //no: String((no++) + 1),
                    //name: d.name,
                    name: isRawVol ? 
                        `#${rawCurrentPack}${msg('PACK')} #${ind+1}${msg('vol')}` : 
                        `#${rawCurrentPack}${msg('PACK')} #${ind+1}${msg('temp')}`,
                    time: moment(record.time).format(DATE_CUSTOM_FORMAT.DATE_TIME),
                    value: String(record.value),
                    status: record.statusName,
                })
            })
        });

        this.setState({isLoading: true});
        const res = await _dao.exportFile({
            file_name: FILE_NAME,
            save_type: fileType,
            data: exportData,
            column_info: COLUMN.slice(1)
        });
        this.setState({isLoading: false});

        if (!res || String(res.code) !== '10000') {
            notify(msg('exportFail'));
            return;
        }

        scadaCfg.downLoad(res.file_path);
    }

    renderCurveType = () => {

        const data = SELECT.curveType.options;
        const { isVol } = this.state;

        return (
            <NewSelect
                className={`${prefixCls}-newselect`}
                style={Object.assign({
                    minWidth: 130,
                    maxWidth: 260,
                })}
                dropdownStyle={{ width: 'auto' }}
                dropdownMatchSelectWidth={false}
                defaultActiveFirstOption={false}
                value={isVol ? 0 : 1}
                showSearch={false}
                data={data || []}
                onChange={(v) => {
                    this.setState({ isVol: v === 0 }, () => {
                        Promise.all([this.requestDataSet()]);
                    });
                }}
            />
        )
    }

    requestDilution = async () => {
        const { subSystemNodes, subSystemAlias, isVol } = this.state;
        let subSystemNode = subSystemNodes.filter(n => {
            return n.alias === subSystemAlias;
        });
        let batteryClusters = subSystemNode[0]?.batteryCluster;

        if(!Array.isArray(batteryClusters) || !batteryClusters[0])return;

        const aliasSuffix = isVol ? POINT_ALIAS.VolNode : POINT_ALIAS.TempNode;
        const datasetAlias = this.getPointAlias(batteryClusters[0].alias, aliasSuffix);

        const res = await _dao.getDataSetDilution({
            define_point: datasetAlias
        });

        let dilutionOptions = [];
        let dilution = '';
        
        if(daoIsOk(res)){
            dilutionOptions = (res.period || []).map((d, ind) => {
                if(ind === 0){
                    dilution = d.val;
                }
                return {
                    name: Intl.isZh ? d.name_cn : d.name_en,
                    value: d.val
                };
            });
        }else{
            notify(msg('timeIntervalFailed'));
        }

        this.setState({
            dilution,
            dilutionOptions
        });
    }

    renderSubSysterm = () => {
        let { subSystemNodes, subSystemAlias } = this.state;

        let value = msg('Select ESS');
        let data = subSystemNodes.map(node => {
            return {
                value: node.alias,
                name: node.display_name
            }
        });
        return <NewSelect 
            className={`${prefixCls}-newselect`}
            style={{
                minWidth: 130,
                maxWidth: 260,
            }}
            dropdownStyle={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
            defaultActiveFirstOption={false}
            value={subSystemAlias || value}
            showSearch={false}
            data={data || []}
            onChange={(v) => {
                let subSystemNode = subSystemNodes.filter(n => {
                    return n.alias === v;
                });
                this.setState({
                    batteryCluster: subSystemNode[0]?.batteryCluster,
                    batteryClusterAlias: undefined,
                    subSystemAlias: v
                }, () => {
                    this.requestDataSet();
                    this.requestDilution();
                })
            }} />
    }

    renderBattery = () => {

        let { batteryCluster, isVol } = this.state;

        let value = msg('Select RBMS');
        let data = batteryCluster.map(node => {
            return {
                value: node.alias,
                name: node.display_name
            }
        });
        return <NewSelect 
            className={`${prefixCls}-newselect`}
            style={Object.assign({
                minWidth: 130,
                maxWidth: 260,
            })}
            dropdownStyle={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
            defaultActiveFirstOption={false}
            value={this.state.batteryClusterAlias || value}
            showSearch={false}
            data={data || []}
            onChange={v => {
                this.setState({
                    batteryClusterAlias: v
                }, () => {
                    Promise.all([this.requestDataSet()]);
                });
            }} />
    }

    renderPack = () => {

        let { packNum = 0, currentPack } = this.state;

        let value = msg('Select PACK');
        let data = new Array(packNum).fill({}).map((o, index) => {
            return {
                name: `#${index + 1} ${msg('PACK')}`,
                value: index + 1
            }
        });
        return <div onClick={() => { this.onDataSetCheck() }}>
            <NewSelect
                className={`${prefixCls}-newselect`}
                style={Object.assign({
                    minWidth: 130,
                    maxWidth: 260,
                })}
                dropdownStyle={{ width: 'auto' }}
                dropdownMatchSelectWidth={false}
                defaultActiveFirstOption={false}
                value={currentPack || value}
                showSearch={false}
                data={data || []}
                onChange={(v) => {
                    this.setState({ currentPack: v });
                }}
            />
        </div>
    }

    render() {

        const { isRawVol, dilution, dilutionOptions, isCurve, data, momentStartTime, momentEndTime, dialogShow } = this.state;
        return (
            <div className={prefixCls} ref={this.container}>
                <div className={`${prefixCls}-Head`}>
                    <div className={`${prefixCls}-Head-main`}>
                        <div className={`${prefixCls}-Head-Select`}>
                            {this.renderCurveType()}
                            {this.renderSubSysterm()}
                            {this.renderBattery()}
                            {this.renderPack()}
                            <NewSelect
                                className={`${prefixCls}-newselect`}
                                style={Object.assign({
                                    minWidth: 130,
                                    maxWidth: 260,
                                })}
                                dropdownStyle={{ width: 'auto' }}
                                dropdownMatchSelectWidth={false}
                                defaultActiveFirstOption={false}
                                value={dilution || SELECT.timeInterval.name}
                                showSearch={false}
                                data={dilutionOptions}
                                //data={SELECT.timeInterval.options || []}
                                onChange={(v) => {
                                    this.setState({
                                        dilution: v
                                    })
                                }}
                            />
                        </div>
                        <div className={`${prefixCls}-Head-Date`}>
                            <RangePicker
                                defaultValue={[
                                    moment(this.state.startTime, DATE_CUSTOM_FORMAT.DATE_TIME), 
                                    moment(this.state.endTime, DATE_CUSTOM_FORMAT.DATE_TIME)
                                ]}
                                showTime
                                format={DATE_CUSTOM_FORMAT.DATE_TIME}
                                allowClear={false}
                                locale={Intl.isZh ? zhCN : null}
                                onChange={(dates, dateStrings) => {
                                    this.setState({
                                        startTime: dates[0].format(DATE_MOMENT_FORMAT.DATE_TIME),
                                        endTime: dates[1].format(DATE_MOMENT_FORMAT.DATE_TIME),
                                        momentStartTime: dates[0],
                                        momentEndTime: dates[1]
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className={`${prefixCls}-Head-Search`} onClick={() => this.onSearch()}>{msg('search')}</div>
                </div>
                <div className={`${prefixCls}-ShowType`}>
                    <div className={`${prefixCls}-ShowType-Curve`}
                        style={{ backgroundColor: isCurve ? '#36a0c1' : null }}
                        onClick={() => {
                            if (!isCurve) {
                                this.setState({ isCurve: true })
                            }
                        }}>{msg('curve')}
                    </div>
                    <div className={`${prefixCls}-ShowType-Table`}
                        style={{ backgroundColor: isCurve ? null : '#36a0c1' }}
                        onClick={() => {
                            if (isCurve) {
                                this.setState({ isCurve: false })
                            }
                        }}
                    >{msg('table')}
                    </div>
                    <div className={`${prefixCls}-ShowType-Export`}
                        style={isCurve ? { 'display': 'none' } : null}
                        onClick={() => { this.onExport() }}
                    >{msg('export')}
                    </div>
                </div>
                <DataShow
                    data={data}
                    isCurve={isCurve}
                    rawCurrentPack={this.state.rawCurrentPack}
                    isRawVol={isRawVol}
                    moment_start_time={momentStartTime}
                    moment_end_time={momentEndTime}
                    dilution={dilution}
                    currentChartTab={this.state.currentChartTab}
                    onTabChange={(val) => {
                        this.setState({
                            currentChartTab: val
                        });
                    }}
                />
                <ExportDialog
                    display={dialogShow}
                    onOk={(fileType) => this.onExportConfirm(fileType)}
                    onCancel={() => {
                        this.setState({
                            dialogShow: false
                        })
                    }}
                />
                <EnvLoading isLoading={this.state.isLoading} container={this.container.current}/>
            </div>
        )
    }
}

class DataShow extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    genTabs = (data) => {
        const group = this.props.isRawVol ? THRESHOLD_VALUE : TEMP_GROUP;
        if (data.length > group) {
            return Object.assign(
                [], 
                new Array(Math.ceil(data.length / group))
            .fill({})
            .map((item, index) => ({
                title: msg('curveGroup', index + 1),
                key: index + 1
            })));
        }
        return [];
    }

    getEcOption(data, group=1, ec) {

        let { isRawVol, moment_start_time, moment_end_time, dilution } = this.props;

        let xAxisData = [];
        let historyXArray = [];

        if (!dilution || !moment_start_time || !moment_end_time) {
            return null;
        } else {
            let second_count = 1;
            switch (dilution) {
                case '1s':
                    second_count = 1;
                    break;
                case '1min':
                    second_count = 60;
                    break;
                case '5min':
                    second_count = 300;
                    break;
                case '10min':
                    second_count = 600;
                    break;
            }
            
            let num = moment_end_time.diff(moment_start_time, 'seconds')
            for (let i = 1; i <= Math.round(num / second_count); i++) {
                let moment_temp = moment(moment_start_time).add(second_count * i, 'seconds');
                xAxisData.push(moment_temp.format(DATE_MOMENT_FORMAT.TIME));
                historyXArray.push(moment_temp.format(DATE_MOMENT_FORMAT.DATE_TIME))
            }
        }

        let series = [];
        let legendData = [];

        const GroupVal = isRawVol ? THRESHOLD_VALUE : TEMP_GROUP;
        let newData = data.slice(GroupVal * (group - 1), GroupVal * group);
        newData.forEach((raw, index) => {
            let startNum = (group - 1) * GroupVal + index % GroupVal + 1;
            let seriName = isRawVol ? `#${startNum}${msg('vol')}` : `#${startNum}${msg('temp')}`;
            //let seriName = raw.name;
            legendData.push(seriName);
            let seri = {
                name: seriName,
                symbol: "circle",
                type: 'line',
                data: []
            };
            let temp = {};
            raw.history.map(point => {
                temp[point.time] = point.value
            })

            historyXArray.map(x => {
                temp[x] ? seri.data.push(temp[x]) : seri.data.push('')
            })

            series.push(seri);
        })

        return {
            grid: {
                left: 50,
                right: 50,
                top: 100,
                bottom: 20,
                containLabel: true
            },
            legend: {
                top: 50,
                textStyle: {
                    color: '#fff'
                },
                data: legendData
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: theme.chartTooltipBg,
                borderColor: theme.chartTooltipBg,
                borderWidth: 0,
                textStyle: {
                    color: theme.white
                }
            },
            color: EchartColors,
            xAxis: {
                type: 'category',
                data: xAxisData
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: theme.chartYaxisSplitColor
                    }
                }
            },
            series: series
        };
    }

    packData(){
        let { data, isRawVol, rawCurrentPack } = this.props;
        let tableData = [];
        let no = 0;
        data.map((d, ind) => {
            d.history.map((record, index) => {
                tableData.push({
                    no: (no++) + 1,
                    //name: d.name,
                    name: isRawVol ? 
                        `#${rawCurrentPack}${msg('PACK')} #${ind+1}${msg('vol')}` : 
                        `#${rawCurrentPack}${msg('PACK')} #${ind+1}${msg('temp')}`,
                    time: moment(record.time).format(DATE_CUSTOM_FORMAT.DATE_TIME),
                    value: record.value,
                    status: record.statusName,
                })
            })
        });
        return tableData;
    }

    render() {
        let { isCurve, data } = this.props;
        let tabs = this.genTabs(data);
        let tableData = this.packData();

        return (
            <div className={`${prefixCls}-DataShow`}>
                {
                    isCurve ?
                    <div>
                        {tabs && tabs.length > 0 && <CurveTab 
                        style={{
                            position: 'absolute',
                            right: 'calc(2% + 25px)',
                            marginTop: '8px',
                            zIndex: 999,
                        }} 
                        tabs={tabs} 
                        tabKey={this.props.currentChartTab} 
                        onItemSelected={item => {
                            this.props.onTabChange(item.key);
                        }} />}
                        <div id='chartShow' className={`${prefixCls}-DataShow-ChartShow`}>
                            <EchartsWrap 
                                isClearOpt={true}
                                data={{
                                    group: this.props.currentChartTab,
                                    data: this.props.data
                                }}
                                getOption={(data, ec) => {
                                    return this.getEcOption(data.data, data.group, ec);
                                }}
                            />
                        </div>
                    </div> :
                    <div className={`${prefixCls}-DataShow-TableShow`}>
                        <div className={`${prefixCls}-grid-head`}>
                            {COLUMN.map((e, index) => {
                                return <div key={index}>{e.display_name}</div>
                            })}
                        </div>
                        <div className={`${prefixCls}-grid-main`}>
                            <AutoSizer onResize={({width, height}) => {
                            }}>
                            {({width, height}) => {
                                return (
                                    <List                                        
                                        width={width-1}
                                        height={height-1}
                                        overscanRowCount={10}
                                        rowCount={tableData.length}
                                        rowHeight={32}
                                        rowRenderer={({key, index, style, isVisible, isScrolling}) => {
                                            let {no, name, time, value, status} = tableData[index];
                                            return <div key={key} className={`${prefixCls}-grid-row`} style={style}>
                                                <div>{no}</div>
                                                <div>{name}</div>
                                                <div>{time}</div>
                                                <div>{value}</div>
                                                <div>{status}</div>
                                            </div>;
                                        }}
                                    />
                                )
                            }}
                            </AutoSizer>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

ReactDOM.render(<BatteryCurve />, document.getElementById(process.env.NODE_ENV === 'development' ? 'center' : 'container'));
