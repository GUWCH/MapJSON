import * as React from 'react';
import { Collection, AutoSizer } from 'react-virtualized';
import hexToRgba from 'hex-to-rgba';
import ScadaCfg, { 
    CommonTimerInterval, 
    TimerInterval, 
    CommonHisTimerInterval
} from '../../common/const-scada';
import { NumberUtil, DateUtil, BStools } from '@/common/utils';
import { LegalData, _dao } from '../../common/dao';
import { getTheme } from '../../common/theme';
import Grid from 'EnvTable';
import EnvLoading from '../../components/EnvLoading';
import EchartsWrap from 'EchartsWrap';
import { 
    FetchModel, TOKEN,
    PROPS, 
    VALUES, 
    getPointKey, 
    POINT_TABLE,
    DECIMAL
} from '@/common/constants';
import { FixNumber, FixPointVal, autoComma } from '../../common/util-scada';
import { SOLAR_POINTS, msg, isZh, normalColor, memoReq, getListKey, CONST_TYPE } from './constant';
import { Actions, GlobalContext } from './context';
import { toSitePage, toFleet, getConstList } from '../common_lib';

import '../../common/css/app.scss';
import styles from './style.mscss';

let defaultTopAlias = ScadaCfg.getCurNodeAlias() || '';

if (process.env.NODE_ENV === 'development') {
    defaultTopAlias = 'USCADA.Farm.Statistics';
    //defaultTopAlias = 'F00.Farm.Statistics';
}

const scrollBarWidth = BStools.getScrollWidth();
const MIN_MARGIN = 5;
const theme = getTheme();

class Sites extends React.PureComponent {
    static contextType = GlobalContext;

    static defaultProps = {
        deviceType: 'farm',
        topAlias: defaultTopAlias,
        filters: [],
        sortOrderNo: true,
        width: 1000, 
        height: 600, 
        cardWidth: 420,
        cardHeight: 250,
        widthResize: 1, 
        heightResize: 1
    };

    constructor(props) {
        super(props);

        this.defaultNameKey = 'WTG.Name';
        this.defaultAliasKey = 'WTG.Alias';
        this.defaultFarmNameKey = 'Farm.Name';
        this.favoriteKey = '_favorite_';
        this.statusNameColor = {};

        this.sizedWidth = undefined;
        this.sizedHeight = undefined;
        this.cardIndices = null;

        this.deviceData = [];

        this.collectRef = React.createRef(null);
        this.timerIdDevice = null;
        this.timerToken = null;
        this.timerCurve = null;

        this.pointMap = {};
        const pointFlag = [
            PROPS.STATE,
            PROPS.CAPACITY,
            PROPS.POWER,
            PROPS.RADIATION,
            PROPS.RADIA,
            PROPS.GENERATE,
            PROPS.HOUR,
            PROPS.PR
        ];
        SOLAR_POINTS.forEach(p => {
            pointFlag.forEach(f => {
                if(p[f]){
                    this.pointMap[f] = Object.assign({}, p);
                }
            });
        });
    }

    async fetchToken(){
        let { dispatch } = this.context;

        const res = await _dao.getToken(this.props.topAlias);

        const tokenData = [];
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
                let { alias, token_id } = res.data[i];

                if(String(token_id) === String(TOKEN.MAINTENANCE)){
                    tokenData.push(alias);
                }
            }
        }

        dispatch({
            tokenData
        });

        clearTimeout(this.timerToken);
        this.timerToken = setTimeout(this.fetchToken.bind(this), CommonTimerInterval);
    }

    fetchDevice(afterGet, loading) {
        if(loading && !this.context.state.loading){
            this.context.dispatch({loading: true});
        }

        clearTimeout(this.timerIdDevice);

        const {deviceType, topAlias, filters=[]} = this.props;
        const paras = [];
        filters.forEach(f => {
            const points = f.col_name.split(':');
            paras.push({
                type: points[0],
                field: points[1],
                decimal: 0
            });
        });

        SOLAR_POINTS.forEach(p => {
            paras.push({
                type: p.alias,
                field: p.fieldNo,
                decimal: p.decimal || 0
            });
        });

        let req = [];
        req.push(
            Object.assign({}, FetchModel.TableListReq, {
                root_nodes: topAlias,
                data_level: deviceType,
                device_type: '',
                filter_bay_type: '',
                paras,
                filters,
                if_filter: filters.length > 0
            })
        );

        _dao.getBayList(req)
            .then(responses => {
                let ok = true;
                for (let response of responses) {
                    if (!response.ok) {
                        ok = false;
                    }
                }

                if (ok) {
                    return responses;
                }

                throw new Error('get list data failed');
            })
            .then((responses) => {
                return Promise.all(responses.map(res => res.json()));
            })
            .then((responseDatas) => {
                responseDatas.map(res => {

                    // 排序、过滤
                    if (LegalData(res)) {
                        const { sortOrderNo } = this.props;

                        const nameKey = this.defaultNameKey;
                        let temp = res.data;
                        if(sortOrderNo){
                            temp.sort((prev, next) => {
                                const pNo = (prev.order_no || '').replace(/\,/g, '');
                                const nNo = (next.order_no || '').replace(/\,/g, '');
                                const diff =  Number(pNo || 0) - Number(nNo || 0);

                                if(diff === 0){
                                    const pName = prev[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                    const nName = next[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                    return pName.localeCompare(nName);
                                }

                                return diff;
                            });
                        }else{
                            temp.sort((prev, next) => {
                                const pName = prev[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                const nName = next[nameKey].replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                return pName.localeCompare(nName);
                            });
                        }
                        
                        // debug
                        // temp=temp.map(t => {
                        //     Object.keys(t).forEach(k=>{
                        //         if(t[k]==='' || !isNaN(t[k])){
                        //             t[k] = '555,555,45.3';
                        //         }
                        //     });
                        //     return t;
                        // });

                        this.deviceData = temp;
                    }else{
                        this.deviceData = [];
                    }
                });
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => {
                if(typeof afterGet === 'function'){
                    afterGet();
                }

                this.context.dispatch(Object.assign({}, {
                    data: JSON.parse(JSON.stringify(this.getFilterData()))
                }, loading ? {loading: false} : {})); 

                clearTimeout(this.timerIdDevice);
                this.timerIdDevice = setTimeout(this.fetchDevice.bind(this), TimerInterval);
            });
    }

    async fetchCurve(){
        clearTimeout(this.timerCurve);
        this.timerCurve = null;

        if(!this.deviceData || this.deviceData.length === 0) return;
        const power = this.pointMap[PROPS.POWER];
        const radia = this.pointMap[PROPS.RADIA];

        const curves = [];
        let temp = [];
        if(Array.isArray(this.cardIndices)){
            const start = this.cardIndices[0];
            const end = this.cardIndices[this.cardIndices.length - 1]
            if(start !== undefined && end !== undefined){
                temp = this.context.state.data.slice(start, end + 1);
            }            
        }else{
            temp = this.context.state.data.slice(0, 9);
        }
        temp.forEach(d => {
            const alias = d[this.defaultAliasKey];
            [power, radia].forEach(p => {
                curves.push(Object.assign({}, FetchModel.HistoryCurveModel, {
                    key: getPointKey(p, `${alias}.${POINT_TABLE.FARM_STAT}`), 
                    decimal: p.decimal || 0
                }));
            });
        });

        if(curves.length > 0){
            const res = await _dao.getCurve(Object.assign({}, FetchModel.HistoryCurveReq, {
                curve: curves,
                start_time: DateUtil.getStdNowTime(true),
                end_time: DateUtil.getStdNowTime()
            }));
    
            let historyData = {};
            if(String(res.code) === '10000' && Array.isArray(res.data)){
                res.data.forEach(d => {
                    const { key, Points } = d;
                    historyData[key] = Points;
                });
    
                this.context.dispatch({
                    historyData: Object.assign({}, this.context.state.historyData, historyData)
                });
            }
        }

        clearTimeout(this.timerCurve);
        this.timerCurve = setTimeout(this.fetchCurve.bind(this), CommonHisTimerInterval);
    }

    async getStatus(){
        const first = this.deviceData[0];
        let statusColumn = this.getStatusColumn();
        let constAlias;
        if(first && statusColumn){
            constAlias = `${first[this.defaultAliasKey]}.${POINT_TABLE.FARM_STAT}.${statusColumn.alias}`;
        }
        const { dispatch } = this.context;
        const statusList = await getConstList(CONST_TYPE.SOLAR_DEVICE_STATUS, constAlias);
        statusList.forEach(s => {
            this.statusNameColor[s.name] = s.color || normalColor;
        });
        dispatch({
            statusList
        });
    }

    async getStar(){
        const res = await _dao.memo('get', memoReq);
        
        if(String(res.code) === '10000' && res.data[0]){
            const rd = res.data[0];
            this.context.dispatch({
                topMemoId: rd.id,
                topData: JSON.parse(rd.content)
            });
        }
    }

    async setStar(content=[]){
        const {state: {topMemoId}} = this.context;
        const operate = topMemoId !== undefined ? 'update' : 'insert';

        const res = await _dao.memo(operate, Object.assign({}, memoReq, {
            id: topMemoId,
            content: JSON.stringify(content)
        }));

        if(String(res.code) === '10000' && res.id){
            this.context.dispatch({
                topMemoId: res.id
            });
        }
    }

    star(siteAlias){
        const {state: { topData }, dispatch} = this.context;
        const topCopy = JSON.parse(JSON.stringify(topData));
        const index = topCopy.indexOf(siteAlias);

        if(index > -1){
            topCopy.splice(index, 1);
        }else{
            topCopy.push(siteAlias);
        }

        dispatch({topData: topCopy});
        this.setStar(topCopy);
    }

    componentDidMount(){        
        this.fetchToken();
        this.getStar();
        this.fetchDevice(() => {
            this.getStatus();
            this.fetchCurve();
        }, true);
    }

    componentWillUnmount(){
        clearTimeout(this.timerIdDevice);
        this.timerIdDevice = null;
        clearTimeout(this.timerToken);
        this.timerToken = null;
        clearTimeout(this.timerCurve);
        this.timerCurve = null;
    }

    getChartOption({points=[], data=[], chartsProps=[]}, ec){
        const options = {
            textStyle: {
                color: theme.chartTextColor,
                fontWeight: 'normal'
            },
            title: {
                text: msg('powerCurve'),
                textStyle: {
                    fontSize: 12,
                    //fontWeight: 'normal',
                    color: theme.white
                }
            },
            grid: {
                top: 25,
                bottom: 25,
                left: 2,
                right: 2,
                containLabel: false
            },
            tooltip: {
                show: false,
                trigger: 'axis',
                axisPointer: {
                    type: 'none'
                }
            },
            xAxis: {
                show: false,
                type: 'category',
                data:[]
            },
            yAxis: [],
            series: [],
            legend: {
                icon: 'rect',
                itemHeight: 8,
                itemWidth: 8,
                padding: [0, 0, 5, 0],
                inactiveColor: theme.chartLegendActiveColor,
                y: 'bottom',
                textStyle: {
                    color: theme.chartLegendColor
                },
                data: []
            }
        };

        const legend = points.map(p => p.abbr || p.name);
        options.legend.data = legend;

        (data || []).forEach((d, ind) => {
            const seriesData = d.map(ele => {
                const { x, y } = ele;
                if(ind === 0){
                    options.xAxis.data.push(x);
                }

                return {
                    value: y !== '' ? Number(y) : ''
                };
            });

            const {type='line', color='#fff', smooth=true} = chartsProps[ind] || {};
            options.series.push({
                name: legend[ind],
                type: type,
                smooth: smooth,
                showSymbol: false,
                itemStyle: {
                    color: color
                },
                data: seriesData,
                yAxisIndex: ind
            });

            options.yAxis.push({
                name: '',
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: ind === 0,
                    lineStyle: {
                        color: theme.chartYaxisSplitColor
                    }
                }                
            });
        });

        return options;
    }

    cellRender({index, key, style}){
        const {state: {data, tokenData, historyData}} = this.context;

        const cell = data[index];
        const alias = cell[this.defaultAliasKey];
        const isToken = tokenData.indexOf(alias) > -1;
        const status = cell[getListKey(this.pointMap[PROPS.STATE])];
        const statusColor = this.statusNameColor[status] || normalColor;
        const capaPoint = this.pointMap[PROPS.CAPACITY];
        const powerPoint = this.pointMap[PROPS.POWER];

        const capa = FixPointVal(cell[getListKey(capaPoint)], capaPoint);
        let ratio = 0;
        let ratioTitle = `${powerPoint.name} / ${capaPoint.name}`;
        let capaStr = cell[getListKey(capaPoint)];
        let powerStr = cell[getListKey(powerPoint)];
        powerStr = NumberUtil.removeCommas(powerStr);
        capaStr = NumberUtil.removeCommas(capaStr);

        if(NumberUtil.isFinite(powerStr) && NumberUtil.isFinite(capaStr) && Number(capaStr) !== 0){
            ratio = NumberUtil.divide(powerStr, capaStr);
            ratio = NumberUtil.multiply(ratio, 100, DECIMAL.COMMON);
        }
        
        const front = [this.pointMap[PROPS.GENERATE], this.pointMap[PROPS.RADIATION]];
        const end = [powerPoint, this.pointMap[PROPS.HOUR]];

        const curvePoints = [powerPoint, this.pointMap[PROPS.RADIA]];
        const curveData = curvePoints.map(p => {
            return historyData[getPointKey(p, `${alias}.${POINT_TABLE.FARM_STAT}`)] || []
        });
        const chartsProps = [
            {type: 'line', color: theme.chartLineColor2},
            {type: 'line', color: theme.chartLineColor}
        ];

        return <div key={key} style={style} className={styles.cardItem} onClick={(e) => {
            e.preventDefault();
            toSitePage(alias);
            e.stopPropagation();
        }}>
            <div style={{
                background: `linear-gradient(90deg, ${hexToRgba(statusColor, 0.4)}, ${hexToRgba(statusColor, 0.1)})`
            }}>
                <div style={{
                    backgroundColor: `${hexToRgba(statusColor, 0.4)}`
                }}>{status}</div>
                <div>{cell[this.defaultNameKey]} ({capa} {capaPoint.unit})</div>
            </div>
            <div>
                <div className={isToken ? styles.token : null}>
                    {isToken ? `${msg('siteStop')}` : `${msg('siteNormal')}`}
                </div>
                <div>
                    <div onClick={e => {e.preventDefault();e.stopPropagation();}}>
                        <EchartsWrap 
                            data={JSON.parse(JSON.stringify({
                                points: curvePoints,
                                data: curveData,
                                chartsProps
                            }))}
                            getOption={(data, ec) => {
                                return this.getChartOption(data, ec);
                            }}
                            resizeDelay={200}
                        />
                    </div>
                    <div>
                        {front.map((p, ind) => 
                            <div key={ind}>
                                <span>{p.abbr || p.name}</span>
                                <span>{FixPointVal(cell[getListKey(p)], p)} {p.unit||''}</span>
                            </div>
                        )}
                        <div title={ratioTitle}>
                            <span>{msg('sitePowerRatio')}</span>
                            <span>{ratio} %</span>
                        </div>
                        {end.map((p, ind) => 
                            <div key={ind}>
                                <span>{p.abbr || p.name}</span>
                                <span>{FixPointVal(cell[getListKey(p)], p)} {p.unit||''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>            
        </div>;
    }

    cellSizeAndPositionGetter({index}){
        let {
            width: containerWidth, 
            height: containerHeight, 
            cardWidth,
            cardHeight,
            widthResize, 
            heightResize
        } = this.props;

        // width and height of every card
        let itemWidth = Math.ceil(Number(cardWidth) * widthResize);
        let itemHeight = Math.ceil(Number(cardHeight) * heightResize);

        // redefine container dimension after resizing window
        if(this.sizedWidth){
            containerWidth = this.sizedWidth;
        }

        // subtract scroll bar width (unknown reason, scroll bar width is 7, so add 1)
        // subtract 1 because container width is greater than actual width due to getting the width is an integer
        containerWidth = containerWidth - (scrollBarWidth + 1 + 1);

        // subtract other size of container
        const nameSize = 0;
        const itemBorder = 0;
        containerWidth = containerWidth - nameSize - itemBorder;

        // calculate number of arranging cards in a row and rows of cards in a cell(a fac)        
        const numPerRow = parseInt(containerWidth / (itemWidth + MIN_MARGIN));
        // numPerRow could be 1
        let widthPad = parseInt((containerWidth - itemWidth * numPerRow) / ((numPerRow - 1) || 1));

        // keep max margin between items
        if(widthPad > 25){
            widthPad = 25;
            itemWidth = parseInt((containerWidth - (numPerRow - 1) * widthPad) / numPerRow);
        }

        const itemTopPad = 10;
        const itemBottomMargin = 10;

        return {            
            height: itemHeight,
            width: itemWidth,
            x: (index % numPerRow) * (itemWidth + widthPad),
            y: Math.floor(index / numPerRow) * (itemHeight + itemTopPad + itemBottomMargin) + 10,
            numPerRow: numPerRow
        };
    }

    changeStatus(name){
        const { dispatch } = this.context;
        dispatch({
            status: name,
            data: this.getFilterData(name)
        });
    }

    switchTab(tabNum){
        const { dispatch } = this.context;
        dispatch({tab: tabNum});
    }

    setGridCache(obj={}){
        const { state: { gridCache }, dispatch } = this.context;
        dispatch({gridCache: Object.assign({}, gridCache, obj)});
    }

    getStatusColumn(){
        return SOLAR_POINTS.filter(f => f[PROPS.STATE])[0];
    }

    getStatusAlias(){
        let statusColumn = this.getStatusColumn();
        if(statusColumn){
            let { alias, fieldNo } = statusColumn;
            return `${alias}:${fieldNo}`;
        }
        return null;
    }

    /**
     * 
     * @returns {Object}
     * @property {Object[]} columns
     * @property {Number} frozen
     * @property {String[]} hidden
     */
    getGridColumns(){
        let { state: {gridCache} } = this.context;
        let columns = SOLAR_POINTS;

        let favorite = {
            key: this.favoriteKey,
            sortable: false,
            title: msg('favorite'),
            style: Object.assign({}, {
                textAlign: 'center'
            }, this.favoriteKey in gridCache ? {
                width: gridCache[this.favoriteKey]
            } : {
                width: 60
            }),
            fmt: (value, rowData) => {
                const siteAlias = rowData[this.defaultAliasKey];
                if(!siteAlias)return null;

                const isFavour = this.context.state.topData.indexOf(siteAlias) > -1;
                return <div 
                    className={`${styles.favorite} ${isFavour ? styles.favoriteIn : ''}`}
                    onClick={e => {
                        this.star(siteAlias);
                    }}
                >
                </div>
            }
        };

        let nameColumn = {
            key: this.defaultNameKey,
            title: msg('siteName'),
            style: Object.assign({}, {
                textAlign: 'center'
            }, this.defaultNameKey in gridCache ? {
                width: gridCache[this.defaultNameKey]
            } : {}),
            fmt: (value, rowData) => {
                return <span className={styles.cell} onClick={() => {
                    if(rowData[this.defaultAliasKey]){
                        toSitePage(rowData[this.defaultAliasKey]);
                    }else{
                        toFleet(this.props.topAlias);
                    }                    
                }}>{value}</span>
            }
        };

        var deviceColumns = columns.map(f => Object.assign({}, f, {
            colorMap: Object.assign({}, this.statusNameColor),
            isSum: f[PROPS.SIGMA],
            isAverage: f[PROPS.AVERAGE],
            isStatus: f[PROPS.STATE],
            key: `${f.alias}:${f.fieldNo}`, 
            title: `${f.name}${f.unit ? `(${f.unit})` : ''}`,
            style: Object.assign({}, {
                textAlign: 'center'
            }, `${f.alias}:${f.fieldNo}` in gridCache ? {
                width: gridCache[`${f.alias}:${f.fieldNo}`]
            } : {}),
            fmt: (value, rowData, col) => {
                if(!rowData[this.defaultAliasKey]) return <div>
                    <span>{value}</span>
                    {col.isSum ? <span className={styles.mathSum}>&#931;</span> : ''}
                    {col.isAverage ? <span className={styles.mathAve}>x</span> : ''}
                </div>;
                return <span>
                    {col.isStatus ? <i
                        style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: col.colorMap[value],
                            marginRight: 5
                        }}
                    ></i> : null}
                    {FixPointVal(value, col)}                    
                </span>
            }
        }));

        var frozenColumns = deviceColumns.filter(f => f[PROPS.FROZEN]);
        var remainColumns = deviceColumns.filter(f => !f[PROPS.FROZEN]);
        return {
            columns: [favorite, nameColumn].concat(frozenColumns).concat(remainColumns),
            frozen: frozenColumns.length + 2,
            hidden: remainColumns.filter(f => f[PROPS.HIDDEN]).map(f => f.key)
        };
    }

    handleGridData(gridData){
        if(!Array.isArray(gridData) || gridData.length === 0) return [];

        const {state: {topData, gridCache: {page, pageSize, sortColumn, sortDir}}} = this.context;
        const top = [];
        const grid = [];

        gridData.forEach(d => {
            if(topData.indexOf(d[this.defaultAliasKey]) > -1){
                top.push(d);
                return;
            }
            grid.push(d);
        });

        const statics = SOLAR_POINTS
            .filter(p => p[PROPS.SIGMA] || p[PROPS.AVERAGE])
            .map(p => getListKey(p));

        const staticsData = gridData.reduce((a, b) => {
            let newData = {};
            Object.keys(b).forEach(key => {
                if(statics.indexOf(key) > -1){
                    newData[key] = NumberUtil.add(FixNumber(b[key]), FixNumber(a[key] || ''));
                }else{
                    newData[key] = VALUES.SLOT;
                }                
            });
            return newData;
        }, {});
        Object.keys(staticsData).forEach(k => {
            if(statics.indexOf(k) > -1 && !isNaN(staticsData[k])){
                staticsData[k] = autoComma(staticsData[k]);
            }
        });
        staticsData[this.defaultNameKey] = msg('fleet');
        staticsData[this.defaultAliasKey] = '';

        if(sortColumn){
            let dir = sortDir === 'asc' ? 1 : sortDir === 'desc' ? -1 : 0;
            let sort = (a, b)=>{
                let prev = a[sortColumn], next = b[sortColumn];
                return dir * (
                    Number.isFinite(prev) && Number.isFinite(next) ? prev - next :
                    Number.isFinite(prev) ? 1 : 
                    Number.isFinite(next) ? -1 : 
                    (prev + '').localeCompare(next + '')
                );
            };
            top.sort(sort);
            grid.sort(sort);
            sort = undefined;
        }

        let size = pageSize - top.length;

        return [staticsData].concat(top, size <=0 ? [] : grid.slice(page * size, (page + 1) * size));
    }

    getFilterData(statusName, searchVal){
        let {state: {status, search}} = this.context;
        if(statusName !== undefined && statusName !== null){
            status = statusName || status;
        }
        if(searchVal !== undefined && searchVal !== null){
            search = searchVal;
        }

        let filterData = this.deviceData;
        let statusAlias = this.getStatusAlias();
        if(status !== VALUES.NEGATIVE_ONE && statusAlias){
            filterData = filterData.filter(d => d[statusAlias] === status);
        }
        if(search){
            filterData = filterData.filter(d => d[this.defaultNameKey].indexOf(search) > -1);
        }

        return filterData;
    }

    render(){
        const { state: {
            data,
            statusList, 
            status, 
            tab, 
            gridCache: {sortColumn, sortDir, page, pageSize}, 
            loading} 
        } = this.context;
        let { columns, frozen, hidden } = this.getGridColumns();
        const statusAlias = this.getStatusAlias();

        return (
            <div className={styles.container}>
                <div className={styles.head}>
                    <div className={styles.filter}>
                        <div 
                            className={status === VALUES.NEGATIVE_ONE ? styles.active : null} 
                            onClick={this.changeStatus.bind(this, VALUES.NEGATIVE_ONE)}
                        >
                            <span>{msg('allStatus')}</span>
                            <span className={styles.statusCount}>{this.deviceData.length}</span>
                        </div>
                        {
                            statusList.map((s, ind) => {
                                const { name, color, value } = s;
                                return <div 
                                key={ind} 
                                className={status === name ? styles.active : null} 
                                onClick={this.changeStatus.bind(this, name)}
                                >
                                    <i style={color ? {
                                        backgroundColor: color
                                    } : {}}></i>
                                    <span>{name}</span>
                                    <span className={styles.statusCount}>{
                                        this.deviceData.filter(d => d[statusAlias] === name).length
                                    }</span>
                                </div>;
                            })
                        }
                    </div>
                    <div className={styles.tabs}>
                        <div 
                            title={msg('card')} 
                            className={tab === 0 ? styles.active : null}
                            onClick={this.switchTab.bind(this, 0)}
                        ></div>
                        <div 
                            title={msg('list')}
                            className={tab === 1 ? styles.active : null}
                            onClick={this.switchTab.bind(this, 1)}
                        ></div>
                    </div>
                </div>                
                <div className={styles.main}>
                    <div className={styles.menu}>
                        <input 
                            type='text' 
                            //value={search}
                            placeholder={msg('search_name')}
                            onChange={(e) => {
                                this.context.dispatch({
                                    search: e.target.value,
                                    data: this.getFilterData(null, e.target.value)
                                });
                            }}
                        />
                    </div>
                    {
                        tab === 0 ? 
                        <div className={styles.card}>
                        <AutoSizer onResize={({width, height}) => {
                            this.sizedWidth = width;
                            this.sizedHeight = height;
                            if(this.collectRef.current){
                                this.collectRef.current.recomputeCellSizesAndPositions();
                            }
                            //$(window).trigger('resize');
                        }}>
                        {({width, height}) => {
                            return (
                                <Collection
                                    ref={this.collectRef}
                                    cellCount={data.length}
                                    cellRenderer={this.cellRender.bind(this)}
                                    cellSizeAndPositionGetter={this.cellSizeAndPositionGetter.bind(this)}
                                    // height={this.props.height}
                                    // width={this.props.width}
                                    height={height - 1}
                                    width={width - 1}
                                    verticalOverscanSize={2}
                                    noContentRenderer={() => {
                                        return loading ? null : <div className={styles.noData}>{msg('noData')}</div>;
                                    }}
                                    onSectionRendered={({ indices }) => {
                                        this.cardIndices = indices;
                                        this.scrollStartTime = new Date().getTime();
                                
                                        setTimeout(() => {
                                            if(new Date().getTime() - this.scrollStartTime > 799){
                                                this.fetchCurve();
                                            }
                                        }, 800);
                                    }}
                                />
                            )
                        }}
                        </AutoSizer>
                        </div> :
                        <Grid 
                            language={isZh ? 'zh' : 'en'}
                            containerClassName={styles.grid}
                            headerClassName={styles.gridHead}
                            frozenColumn={frozen}
                            //nameSearchKey={this.defaultNameKey}
                            intl18={{
                                searchPlaceHolder: msg('search_name'),
                                columnSetText: msg('indicator_setting'),
                                chooserSearchTitle: msg('search_indicator'),
                                chooserSearchPlaceHolder: msg('input_indicator'),
                                hideAll: msg('hide_all'),
                                showAll: msg('show_all')
                            }}
                            columnSet
                            columnSetStyle={{
                                maxHeight: parseInt(window.innerHeight * 0.5)
                            }}
                            columns={columns}
                            hiddenColumnKeys={hidden}
                            data={this.handleGridData(data)}
                            count={data.length}
                            page={page}
                            pageSize={pageSize}
                            sortColumn={sortColumn}
                            sortDir={sortDir}
                            afterSort={(sortColumn, sortDir, data) => {
                                this.setGridCache({
                                    sortColumn,
                                    sortDir
                                });
                            }}
                            onResizeColumn={(key, newWidth) => {
                                this.setGridCache({
                                    [key]: newWidth
                                });
                            }}
                            onData={(...props) => {
                                this.setGridCache({
                                    pageSize: props[0],
                                    page: props[1],
                                    sortColumn: props[2] || '',
                                    sortDir: props[3] || ''
                                });
                            }}
                        />
                    }                    
                </div>
                <EnvLoading isLoading={loading} container={this.props.loadingContainer}/>
            </div>
        );
    }
}

export default Sites;