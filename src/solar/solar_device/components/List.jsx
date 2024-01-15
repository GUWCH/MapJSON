/* eslint-disable */

import React from 'react';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { Popover, Tooltip } from 'antd';
import Grid from 'EnvTable';
import Intl, { msgTag } from '../../../common/lang';
import ScadaCfg, { TimerInterval } from '../../../common/const-scada';
import { FixNumber, FixNumberFactor } from '../../../common/util-scada';
import { LegalData, EmptyList, _dao as CommonDao } from '../../../common/dao';
import { FetchModel } from '../../../common/constants';
import EnvLoading from 'EnvLoading';
import { COMMON_FLAG, FAC_BAY_TYPE, TREE_BAY_TYPE } from '../../CONSTANT';
import { Actions, GlobalContext } from '../context';
import { AntSlider as Slider } from '@/components';

import Column_BXT from '../list/transformer';
import Column_Inverter from '../list/inverter';
import Column_DC_Combiner from '../list/dccombiner';
import Column_AC_Combiner from '../list/accombiner';
import Column_Weather from '../list/weatherstation';
import Column_Meter from '../list/meter';
import { getStatus, getStatusIcon } from '../../common_lib';

import styles from '../index.mscss';
import _ from 'lodash';

const msg = msgTag('solardevice');

export default class List extends React.Component{
    static contextType = GlobalContext;

    constructor(props){
        super(props);

        this.displayName = 'Solar Device List Grid';
        this.defaultNameKey = 'WTG.Name';
        this.defaultAliasKey = 'WTG.Alias';
        this.defaultFarmNameKey = 'Farm.Name';
        this.favoriteKey = '_favorite_';

        this.iconContainer = React.createRef();
        this.iconWidth = 250;
        this.iconHeight = 120;
        this.iconBigSmallSwitchDataCount = 100;

        this.hasStatus = false;
        this.defaultStatusName = -1;
        this.statusColorKey = '__color__';

        this.timerId = null;

        this.state = {
            isLoading: false,
            showStatus: false,
            activeStatusName: this.defaultStatusName,

            /**
             * @type {Object<string, number>}
             */
            statusNameStatistics: {},
            data: []
        };
    }

    componentWillMount() {
    }

    async componentDidMount() {
        await this.getStar();
        this.request(true);

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState){
        if (!_.isEqual(this.state,  nextState)) {
            return true;
        }
        return false;
    }

    async componentWillReceiveProps(nextProps){
        if(nextProps.hidden){
            clearTimeout(this.timerId);
        }else if(nextProps.hidden !== this.props.hidden){
            clearTimeout(this.timerId);
            await this.getStar();
            this.request(true);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timerId);
        window.removeEventListener('resize', this.resize.bind(this));
    }

    async getStar(){
        let { state: {mainFlag}, dispatch } = this.context;
        if(!mainFlag)return;
        const res = await CommonDao.memo('get', Object.assign({}, FetchModel.MemoReq, {
            description: mainFlag,
            is_desc: '1',
            type: '5051',
            username: ''
        }));
        
        if(String(res.code) === '10000' && res.data[0]){
            const rd = res.data[0];
            this.setCache({
                topDbId: rd.id,
                topData: JSON.parse(rd.content)
            });
        }
    }

    async setStar(content=[]){
        let { state: {mainFlag, flagCache}, dispatch } = this.context;
        let { topDbId } = flagCache[mainFlag];
        const operate = topDbId !== undefined && topDbId !== null ? 'update' : 'insert';

        const res = await CommonDao.memo(operate, Object.assign({}, FetchModel.MemoReq, {
            description: mainFlag,
            is_desc: '1',
            type: '5051',
            username: ''
        }, {
            id: topDbId,
            content: JSON.stringify(content)
        }));

        if(String(res.code) === '10000' && res.id){
            this.setCache({
                topDbId: res.id
            });
        }
    }

    star(deviceAlias){
        let { state: {mainFlag, flagCache}, dispatch } = this.context;
        let { topData } = flagCache[mainFlag];

        const topCopy = JSON.parse(JSON.stringify(topData));
        const index = topCopy.indexOf(deviceAlias);

        if(index > -1){
            topCopy.splice(index, 1);
        }else{
            topCopy.push(deviceAlias);
        }

        this.setCache({topData: topCopy});
        this.setStar(topCopy);
    }

    async setStatus(data=[]){
        if(this.hasStatus)return;

        let statusColumn = this.getStatusColumn();
        let deviceStatusAlias = null;

        if(data[0] && statusColumn){
            let deviceAlias = data[0][this.defaultAliasKey];
            let statusAlias = statusColumn.alias;
            statusAlias = statusAlias.split('.').slice(deviceAlias.split('.').length - 5).join('.');
            deviceStatusAlias = `${deviceAlias}.${statusAlias}`;
        }

        let status = await getStatus(this.getFlag(), deviceStatusAlias);

        if(Array.isArray(status) && status.length > 0){
            this.hasStatus = true;

            if(statusColumn){
                let statusAlias = `${statusColumn.alias}:${statusColumn.fieldNo}`;
                let colors = {};
                status.forEach(s => {
                    colors[s.name] = s.color;
                });
                this.setState({
                    data: data.map(d => {
                        d[this.statusColorKey] = colors[d[statusAlias].split('::')[0]];
                        return d;
                    })
                }, () => {
                    this.setCache({
                        statusList: status
                    });
                });
            }else{
                this.setCache({
                    statusList: status
                });
            }
        }        
    }

    getStatusNameValueMap(){
        let { state: { mainFlag, flagCache } } = this.context;
        let { statusList} = flagCache[mainFlag];
        let statusValue = {};
        statusList.forEach(f => {
            let { name, value } = f;
            statusValue[name] = value;
        });
        return statusValue;
    }

    getStatusNameColorMap(){
        let { state: { mainFlag, flagCache } } = this.context;
        let { statusList } = flagCache[mainFlag];
        let statusColor = {};
        statusList.forEach(f => {
            let { name, color } = f;
            statusColor[name] = color || '';
        });
        return statusColor;
    }

    getStatusValueColorMap(){
        let { state: { mainFlag, flagCache } } = this.context;
        let { statusList} = flagCache[mainFlag];
        let statusColor = {};
        statusList.forEach(f => {
            let { name, color, value } = f;
            statusColor[value] = color || '';
        });
        return statusColor;
    }

    getStatusDetail(data=[], statusName){
        let statusAlias = this.getStatusAlias();

        if(!statusAlias)return{};

        let { activeStatusName } = this.state;
        let statusNameStatistics = {};

        data.forEach(d => {
            let statusName = String(d[statusAlias]).split('::')[0];
            let count = statusNameStatistics[statusName];
            statusNameStatistics[statusName] = (count || 0) + 1;
        });

        if(statusName !== null && typeof statusName !== 'undefined'){
            activeStatusName = statusName;
        }

        if(!statusNameStatistics[activeStatusName]){
            activeStatusName = this.defaultStatusName;
        }

        return {statusNameStatistics, activeStatusName};
    }

    resize(){
        if(this.state.data.length > this.iconBigSmallSwitchDataCount) return;

        let { state: { mainFlag }, dispatch } = this.context;
        setTimeout(() => {
            dispatch({
                type: Actions.SET_FLAG_CACHE,
                cache: Object.assign({}, {
                    flag: mainFlag
                }, this.calcLargeIcon())
            });
        }, 0);
    }

    getFlag(){
        let { state: { mainFlag } } = this.context;
        return mainFlag;
    }

    getTypes(){
        let { state: { mainTypes } } = this.context;
        return mainTypes;
    }

    getColumnConfig(){
        switch(this.getFlag()){
            case COMMON_FLAG.PAD:
                return Column_BXT;
            case COMMON_FLAG.INVERTER:
                return Column_Inverter;
            case COMMON_FLAG.DC_COMBINER:
                return Column_DC_Combiner;
            case COMMON_FLAG.AC_COMBINER:
                return Column_AC_Combiner;
            case COMMON_FLAG.WEATHER_STATION:
                return Column_Weather;
            case COMMON_FLAG.METER:
                return Column_Meter;
        }
        return [];
    }

    getStatusColumn(){
        return this.getColumnConfig().filter(f => f.isStatus)[0];
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
        let { state: {mainFlagName, mainFlag, flagCache} } = this.context;
        let { columnResize, topData=[] } = flagCache[mainFlag];
        let columns = this.getColumnConfig();

        let favorite = {
            key: this.favoriteKey,
            sortable: false,
            title: msg('favorite'),
            style: Object.assign({}, {
                textAlign: 'center'
            }, this.favoriteKey in columnResize ? {
                width: columnResize[this.favoriteKey]
            } : {
                width: 60
            }),
            fmt: (value, rowData) => {
                const deviceAlias = rowData[this.defaultAliasKey];
                if(!deviceAlias)return null;

                const isFavour = topData.indexOf(deviceAlias) > -1;
                return <div 
                    className={`${styles.favorite} ${isFavour ? styles.favoriteIn : ''}`}
                    onClick={e => {
                        this.star(deviceAlias);
                    }}
                >
                </div>
            }
        };

        var nameColumn = {
            key: this.defaultNameKey,
            title: msg('name', mainFlagName),
            style: Object.assign({}, {
                textAlign: 'center'
            }, this.defaultNameKey in columnResize ? {
                width: columnResize[this.defaultNameKey]
            } : {})
        };
        switch(this.getFlag()){
            case COMMON_FLAG.PAD:
            case COMMON_FLAG.INVERTER:
            case COMMON_FLAG.DC_COMBINER:
                nameColumn.fmt = (value, rowData) => {
                    return <span className={styles.cell} onClick={() => {
                        this.changeDetail(
                            rowData[this.defaultAliasKey],
                            rowData[this.defaultNameKey]
                        );
                    }}>{value}</span>
                }
        }

        var deviceColumns = columns.map(f => Object.assign({}, f, {
            key: `${f.alias}:${f.fieldNo}`, 
            title: `${f.name}${f.unit ? `(${f.unit})` : ''}`,
            style: Object.assign({}, {
                textAlign: 'center'
            }, `${f.alias}:${f.fieldNo}` in columnResize ? {
                width: columnResize[`${f.alias}:${f.fieldNo}`]
            } : {}),
            fmt: (value, rowData) => {
                let splitArray = String(value).split('::');
                return <span 
                    style={{
                        backgroundColor: splitArray[1] || undefined,
                        color: splitArray[2] || undefined
                    }}>
                    {f.isStatus && this.statusColorKey in rowData ? <i
                        style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: rowData[this.statusColorKey],
                            marginRight: 10
                        }}
                    ></i> : null}
                    {
                        f.unit !== '%' ? 
                        ('factor' in f ? FixNumberFactor(splitArray[0], f.factor, 2) : splitArray[0]) : 
                        FixNumberFactor(splitArray[0], 100, 2)
                    }
                </span>
            }
        }));

        var frozenColumns = deviceColumns.filter(f => f.frozen);
        var remainColumns = deviceColumns.filter(f => !f.frozen);
        return {
            columns: [favorite, nameColumn].concat(frozenColumns).concat(remainColumns),
            frozen: frozenColumns.length + 2,
            hidden: remainColumns.filter(f => f.hidden).map(f => f.key)
        };
    }

    request(loading){
        clearTimeout(this.timerId);
        
        let columns = this.getColumnConfig();
        let types = this.getTypes();
        let req = [];
        let defaultReq = {
            id: '',
            data_level: 'wtg',
            device_type: '',
            root_nodes: ScadaCfg.getCurNodeAlias(),
            paras: [],
            page_num: 1,
            row_count: 300000,
            top_rows: '',
            order_by: this.defaultNameKey,
            is_asc: 1,
            if_filter: false,
            filters: [],
            tree_grid: false,
            need_color: false
        }

        let filterBayTypes = '';
        switch(this.getFlag()){
            case COMMON_FLAG.INVERTER:
                filterBayTypes = [TREE_BAY_TYPE.INVERTER].join(',');
                break;
            case COMMON_FLAG.DC_COMBINER:
                filterBayTypes = [TREE_BAY_TYPE.AC_COMBINER].join(',');
                break;
        }

        types.map(type => {
            let isDevice = type.indexOf('_') > -1;

            let statusColumn = this.getStatusColumn();
            let statusYx = [];
            if(statusColumn){
                statusYx.push({
                    type: `#${statusColumn.alias}`,
                    field: statusColumn.fieldNo,
                });
            }

            req.push(
                Object.assign({}, defaultReq, {
                    data_level: isDevice ? 'device' : type,
                    device_type: isDevice ? type : '',
                    filter_bay_type: isDevice ? filterBayTypes : '',
                    paras: columns.map(c => {
                        return {
                            type: c.alias,
                            field: c.fieldNo,
                            decimal: c.decimal || 2
                        };
                    }).concat(statusYx),
                    top_rows: ''
                })
            );
        });
        
        if(req.length === 0){
            return;
        }

        if(loading){
            this.setState({
                isLoading: true
            })
        }

        let data = [];
        CommonDao.getBayList(req)
        .then(responses => {
            let ok = true;
            for(let response of responses){
                if(!response.ok){
                    ok = false;
                }
            }
            
            if(ok){
                return responses;
            }

            throw new Error('get list data failed');
        })
        .then((responses) => {
            return Promise.all(responses.map(res => res.json()));
        })
        .then((responseDatas) => {
            responseDatas.map(res => {
                if(LegalData(res)){
                    data = data.concat(res.data);
                }
            });
        })
        .catch(e => {
            console.error(e);
        })
        .finally(() => {
            /* if(this.context.state.isDevelopment){
                data = data.map((f, ind) => {
                    f.feederAlias = String(ind % 2);
                    f.feederName = `TESTTESTTESTTESTTESTTEST${String(ind % 2)}`;
                    return f;
                });
                data = data.concat(data).concat(data).concat(data).concat(data).concat(data);
            } */

            // add color property in data
            let statusAlias = this.getStatusAlias();
            if(statusAlias){
                let statusColor = this.getStatusNameColorMap();

                data.forEach(d => {
                    d[this.statusColorKey] = statusColor[d[statusAlias].split('::')[0]] || '';
                });
            }

            this.setState(Object.assign({}, {
                data: data,
                isLoading: false
            }, this.getStatusDetail(data)), () => {
                clearTimeout(this.timerId);
                this.timerId = setTimeout(() => {
                    this.request();
                }, TimerInterval);
            });

            this.setDetail(data);
            this.setStatus(data);
            
        });
    }

    /**
     * 获取详情设备名和队列
     * @param {Object[]} data 
     * @param {String} deviceAlias 
     * @returns 
     */
    getDetail(data, deviceAlias){
        let { state: {detailAlias} } = this.context;
        deviceAlias = deviceAlias || detailAlias;
        let detail = data.filter(d => d[this.defaultAliasKey] === deviceAlias)[0];
        const detailName = detail ? detail[this.defaultNameKey] || '' : '';
        const detailSiblings = data.map(d => ({
            name: d[this.defaultNameKey],
            alias: d[this.defaultAliasKey]
        }));

        return {detailSiblings, detailName};
    }

    setDetail(data){
        let { state, dispatch } = this.context;
        let { detailName: rawDetailName, detailSiblings: rawDetailSiblings } = state;

        const { detailSiblings, detailName } = this.getDetail(data);

        if(detailName !== rawDetailName || !_.isEqual(detailSiblings, rawDetailSiblings)){
            dispatch({
                detailSiblings,
                detailName
            });
        }
    }

    changeDetail(detailAlias, detailName){
        let { dispatch } = this.context;

        dispatch(Object.assign({}, this.getDetail(this.state.data, detailAlias), {
            type: Actions.SET_DETAIL,
            detailAlias: detailAlias,
            detailName: detailName,
        }));
    }

    setCache(opt={}, resizeColumn){
        let { state: {mainFlag, flagCache}, dispatch } = this.context;

        if(resizeColumn){
            let { columnResize } = flagCache[mainFlag];
            dispatch({
                type: Actions.SET_FLAG_CACHE,
                cache: Object.assign({}, {columnResize: Object.assign({}, columnResize, opt)}, {flag: mainFlag})
            });
        }else{
            dispatch({
                type: Actions.SET_FLAG_CACHE,
                cache: Object.assign({}, opt, {flag: mainFlag})
            });
        }
        
    }

    getIconClassName(){
        if(this.getFlag() === COMMON_FLAG.INVERTER && this.state.data.length > this.iconBigSmallSwitchDataCount){
            return styles.iconSmallList;
        }
        return styles.iconLargeList;
    }

    needIcon(){
        switch(this.getFlag()){
            case COMMON_FLAG.INVERTER:
                return true;
            case COMMON_FLAG.PAD:
                return true;
        }
        return false;
    }

    iconRender(data=[]){
        switch(this.getFlag()){
            case COMMON_FLAG.INVERTER:
                if(this.state.data.length > this.iconBigSmallSwitchDataCount){
                    return this.iconSmallRender(data);
                }else{
                    return this.iconLargeRender(data);
                }
            case COMMON_FLAG.PAD:
                return this.iconLargeRenderByFeeder(data);
        }
    }

    iconLargeRenderByFeeder(data=[]){
        let { state: { mainFlag, flagCache } } = this.context;
        let { iconSize, iconRowNum, iconMarginRight, iconShortRowNum, iconShortMarginRight } = flagCache[mainFlag];
        let columns = this.getColumnConfig();
        let iconColumns = columns.filter(c => c.icon);
        let statusAlias = this.getStatusAlias();
        let otherColumns = iconColumns.filter(c => !c.isStatus);
        let statusColor = this.getStatusValueColorMap();

        const feederArr = [];
        const feederMap = {};
        const feederNameMap = {};
        const other = [];
        data.map((d, ind) => {
            const {feederAlias, feederName} = d;
            if(feederAlias){
                feederNameMap[feederAlias] = feederName;
                feederMap[feederAlias] = feederMap[feederAlias] || [];
                feederMap[feederAlias].push(d);
                if(feederArr.indexOf(feederAlias) === -1){
                    feederArr.push(feederAlias);
                }
            }else{
                other.push(d);
            }            
        });

        if(feederArr.length === 0){
            return this.iconLargeRender(data);
        }else{
            return <div className={styles.largeContainer}>
                {
                    feederArr.map((f, ind) => {
                        return <section key={f}>
                            <div>{feederNameMap[f]}</div>
                            <div>{
                                feederMap[f].map((d, dIndex) => {
                                    return <div 
                                        key={dIndex} 
                                        style={{
                                            width: this.iconWidth * iconSize,
                                            height: this.iconHeight * iconSize,
                                            marginRight: (dIndex + 1) % iconShortRowNum === 0 ? 0 : iconShortMarginRight
                                        }} 
                                        draggable 
                                        onClick={() => {
                                            this.changeDetail(d[this.defaultAliasKey], d[this.defaultNameKey]);
                                        }}
                                    >
                                        <div style={{
                                            width: this.iconWidth,
                                            height: this.iconHeight,
                                            transform: `scale(${iconSize}, ${iconSize})`
                                        }}>
                                            <div>{d[this.defaultNameKey]}</div>
                                            <div>
                                                <div 
                                                    style={{
                                                        backgroundColor: statusAlias ? statusColor[d[`#${statusAlias}`]] : ''
                                                    }}
                                                >
                                                    {
                                                        statusAlias ? <img src={getStatusIcon(mainFlag, d[`#${statusAlias}`])} /> : ''
                                                    }
                                                </div>
                                                <div>
                                                {
                                                    otherColumns.map((c, index) => {
                                                        return <p key={index}>
                                                            <span>{c.iconName}:</span>
                                                            <span>{d[`${c.alias}:${c.fieldNo}`]}</span>
                                                            <span>{c.unit || ''}</span>
                                                        </p>;
                                                    })
                                                }
                                                </div>
                                            </div>
                                        </div>
                                    </div>;
                                })
                            }</div>
                        </section>;
                    })
                }
                {
                    other.length > 0 && <section key={'other'}>
                        <div>{msg('no_feeder')}</div>
                        <div>{
                            other.map((d, dIndex) => {
                                return <div 
                                    key={dIndex} 
                                    style={{
                                        width: this.iconWidth * iconSize,
                                        height: this.iconHeight * iconSize,
                                        marginRight: (dIndex + 1) % iconShortRowNum === 0 ? 0 : iconShortMarginRight
                                    }} 
                                    draggable 
                                    onClick={() => {
                                        this.changeDetail(d[this.defaultAliasKey], d[this.defaultNameKey]);
                                    }}
                                >
                                    <div style={{
                                        width: this.iconWidth,
                                        height: this.iconHeight,
                                        transform: `scale(${iconSize}, ${iconSize})`
                                    }}>
                                        <div>{d[this.defaultNameKey]}</div>
                                        <div>
                                            <div 
                                                style={{
                                                    backgroundColor: statusAlias ? statusColor[d[`#${statusAlias}`]] : ''
                                                }}
                                            >
                                                {
                                                    statusAlias ? <img src={getStatusIcon(mainFlag, d[`#${statusAlias}`])} /> : ''
                                                }
                                            </div>
                                            <div>
                                            {
                                                otherColumns.map((c, index) => {
                                                    return <p key={index}>
                                                        <span>{c.iconName}:</span>
                                                        <span>{d[`${c.alias}:${c.fieldNo}`]}</span>
                                                        <span>{c.unit || ''}</span>
                                                    </p>;
                                                })
                                            }
                                            </div>
                                        </div>
                                    </div>
                                </div>;
                            })
                        }</div>
                    </section>
                }
            </div>
        }        
    }

    iconLargeRender(data=[]){
        let { state: { mainFlag, flagCache } } = this.context;
        let { iconSize, iconRowNum, iconMarginRight } = flagCache[mainFlag];
        let columns = this.getColumnConfig();
        let iconColumns = columns.filter(c => c.icon);
        let statusAlias = this.getStatusAlias();
        let otherColumns = iconColumns.filter(c => !c.isStatus);
        let statusColor = this.getStatusValueColorMap();

        return data.map((d, ind) => {
            return <div 
                className={styles.largeBox}
                key={ind} 
                style={{
                    width: this.iconWidth * iconSize,
                    height: this.iconHeight * iconSize,
                    marginRight: (ind + 1) % iconRowNum === 0 ? 0 : iconMarginRight
                }} 
                draggable 
                onClick={() => {
                    this.changeDetail(d[this.defaultAliasKey], d[this.defaultNameKey]);
                }}
            >
                <div style={{
                    width: this.iconWidth,
                    height: this.iconHeight,
                    transform: `scale(${iconSize}, ${iconSize})`
                }}>
                    <div>{d[this.defaultNameKey]}</div>
                    <div>
                        <div 
                            style={{
                                backgroundColor: statusAlias ? statusColor[d[`#${statusAlias}`]] : ''
                            }}
                        >
                            {
                                statusAlias ? <img src={getStatusIcon(mainFlag, d[`#${statusAlias}`])} /> : ''
                            }
                        </div>
                        <div>
                        {
                            otherColumns.map((c, index) => {
                                return <p key={index}>
                                    <span>{c.iconName}:</span>
                                    <span>{d[`${c.alias}:${c.fieldNo}`]}</span>
                                    <span>{c.unit || ''}</span>
                                </p>;
                            })
                        }
                        </div>
                    </div>
                </div>
            </div>;
        });
    }

    iconSmallRender(data=[]){
        let { state: { mainFlag, flagCache } } = this.context;
        let statusColor = this.getStatusValueColorMap();
        let statusAlias = this.getStatusAlias();
        let farmMapData = {};

        data.forEach(d => {
            let farmName = d[this.defaultFarmNameKey];
            farmMapData[farmName] = farmMapData[farmName] || [];
            farmMapData[farmName].push(Object.assign({}, d));
        });

        Object.keys(farmMapData).forEach(f => {
            let threeAlias = [];
            let fourAlias = [];
            let other = [];
            farmMapData[f].forEach(d => {
                let aliasLength = d[this.defaultAliasKey].split('.').length;
                if(aliasLength === 3){
                    threeAlias.push(d);
                }else if(aliasLength === 4){
                    fourAlias.push(d);
                }else{
                    other.push(d);
                }
            });

            farmMapData[f] = [threeAlias, fourAlias, other];
        });

        let length = Object.keys(farmMapData).length;

        return Object.keys(farmMapData).map((f, ind) => {
            return <div key={ind}>
                { length > 1 ? <div className={styles.farm}>{f}</div> : null }
                <div className={styles.device}>{
                    farmMapData[f].map((group, index) => {
                        return group.length > 0 ? <div key={index}>
                            {
                                group.map((d, j) => {
                                    return <div 
                                        key={j}
                                        onClick={() => {
                                            this.changeDetail(d[this.defaultAliasKey], d[this.defaultNameKey]);
                                        }}
                                        style={{
                                            backgroundColor: statusAlias ? statusColor[d[`#${statusAlias}`]] : ''
                                        }}
                                    >
                                        {
                                            statusAlias ? <img src={getStatusIcon(mainFlag, d[`#${statusAlias}`])} /> : ''
                                        }
                                        
                                        <span>
                                            <EllipsisToolTip>{d[this.defaultNameKey]}</EllipsisToolTip> 
                                        </span>
                                    </div>;
                                })
                            }
                        </div> : null;
                    })
                }</div>
            </div>;
        });
    }

    iconToolRender(){
        if(this.getFlag() === COMMON_FLAG.INVERTER && this.state.data.length > this.iconBigSmallSwitchDataCount) return null;

        let { state: { mainFlag, flagCache }, dispatch } = this.context;
        let { iconSize } = flagCache[mainFlag];
        let step = 5;
        let min = 50;
        let max = 150;
        let value = iconSize * (max - min);

        return (
            <Slider 
                min={min}
                max={max}
                step={step}
                value={value}
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 0,
                    width: 200
                }}
                onChange={(val, percent) => {
                    let newSize = val / (max - min);
                    dispatch({
                        type: Actions.SET_FLAG_CACHE,
                        cache: Object.assign({}, {
                            flag: mainFlag,
                            iconSize: newSize
                        }, this.calcLargeIcon(newSize))
                    });
                }}
            />
        );        
    }

    calcLargeIcon(size){
        if(!this.needIcon())return;

        let { clientWidth } = this.iconContainer.current;
        clientWidth = clientWidth - 8; // scroll width
        let { state: { mainFlag, flagCache } } = this.context;
        let { iconSize } = flagCache[mainFlag];
        let width = this.iconWidth * (size || iconSize);
        let pad = 10; // small padding

        width = width + pad;
        let iconNum = Math.floor(clientWidth / width);
        let iconMarginRight = Math.floor(pad + (clientWidth - iconNum * width) / (iconNum - 1));
        let iconShortNum = Math.floor((clientWidth - Number(styles.cardGroupNameWidth) - 2) / width);
        let iconShortMarginRight = Math.floor(pad + ((clientWidth - Number(styles.cardGroupNameWidth) - 2) - iconShortNum * width) / (iconShortNum - 1));

        return {
            iconRowNum: iconNum,
            iconMarginRight: iconMarginRight,
            iconShortRowNum: iconShortNum,
            iconShortMarginRight: iconShortMarginRight
        };
    }

    handleGridData(gridData){
        if(!Array.isArray(gridData) || gridData.length === 0) return [];

        let { state: {mainFlag, flagCache}, dispatch } = this.context;
        let { topData, page, pageSize, sortColumn, sortDir } = flagCache[mainFlag];
        const top = [];
        const grid = [];

        gridData.forEach(d => {
            if(topData.indexOf(d[this.defaultAliasKey]) > -1){
                top.push(d);
                return;
            }
            grid.push(d);
        });

        if(sortColumn){
            let dir = sortDir === 'asc' ? 1 : sortDir === 'desc' ? -1 : 0;
            let sort = (a, b)=>{
                let prev = a[sortColumn], next = b[sortColumn];
                //有颜色分割
                prev = typeof prev === 'string' ? FixNumber(prev.split('::')[0]) : prev;
                next = typeof next === 'string' ? FixNumber(next.split('::')[0]) : next;
                
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

        return [].concat(top, size <=0 ? [] : grid.slice(page * size, (page + 1) * size));
    }

    render() {
        let { state: { mainFlag, mainFlagName, flagCache } } = this.context;
        let { sortColumn, sortDir, page, pageSize, statusList, searchText} = flagCache[mainFlag];
        let { columns, frozen, hidden } = this.getGridColumns();
        let { data, statusNameStatistics, activeStatusName } = this.state;

        let statusData = JSON.parse(JSON.stringify(data));
        let statusAlias = this.getStatusAlias();
        if(activeStatusName !== this.defaultStatusName && statusAlias){
            statusData = statusData.filter(d => String(d[statusAlias]).split('::')[0] === activeStatusName);
        }
        if(searchText){
            statusData = statusData.filter(d => (d[this.defaultNameKey] || '').indexOf(searchText) > -1);
        }

        let statusColor = this.getStatusNameColorMap();

        return (
            <div className={styles.list}>
                <div className={styles.status}>
                    <div 
                        className={activeStatusName === this.defaultStatusName ? styles.active : ''} 
                        onClick={e => {
                            this.setState(this.getStatusDetail(data, this.defaultStatusName));
                        }}
                    >
                        <span>{msg('allStatus')}</span>
                        <span className={styles.statusCount}>{data.length}</span>
                    </div>
                    {
                        statusList.filter(s => s.name in statusNameStatistics).map((s, ind) => {
                            let { name, value } = s;
                            let statusStyle = {};
                            let statusIconClassName = mainFlag === COMMON_FLAG.INVERTER ? styles.symbol : '';

                            // 逆变器需要图标
                            if(mainFlag === COMMON_FLAG.INVERTER){
                                statusStyle = {
                                    backgroundColor: statusColor[name],
                                    backgroundImage: `url(${getStatusIcon(mainFlag, value)})`
                                };
                            }else{
                                statusStyle = {
                                    backgroundColor: statusColor[name]
                                };
                            }
                            
                            return <div 
                                className={activeStatusName === name ? styles.active : ''} 
                                key={ind}
                                onClick={e => {
                                    this.setState(this.getStatusDetail(data, name));
                                }}
                            >
                                <i 
                                    className={statusIconClassName} 
                                    style={statusStyle}
                                ></i>
                                <span>{name}</span>
                                <span className={styles.statusCount}>{statusNameStatistics[name]}</span>
                            </div>;
                        })
                    }
                    <Popover
                        overlayClassName={styles.helpPop}
                        content={
                            statusList.filter(s => s.valid).map((s, ind) => {
                                let { name, value, color='' } = s;
                                let statusStyle = {};
                                let statusIconClassName = mainFlag === COMMON_FLAG.INVERTER ? styles.symbol1 : '';

                                // 逆变器需要图标
                                if(mainFlag === COMMON_FLAG.INVERTER){
                                    statusStyle = {
                                        backgroundColor: color,
                                        backgroundImage: `url(${getStatusIcon(mainFlag, value)})`
                                    };
                                }else{
                                    statusStyle = {
                                        backgroundColor: color
                                    };
                                }
                                
                                return <div key={ind}>
                                    <i 
                                        className={statusIconClassName} 
                                        style={statusStyle}
                                    ></i>
                                    <span>{name}</span>
                                </div>;
                            })
                        }
                        trigger='hover'
                        visible={this.state.showStatus}
                        //destroyTooltipOnHide
                        onVisibleChange={(visible) => {
                            this.setState({
                                showStatus: visible
                            });
                        }}
                        placement='bottomRight'
                    >
                        <i 
                            className={styles.help} >
                        </i>
                    </Popover>
                </div>
                <Grid 
                    language={Intl.isZh ? 'zh' : 'en'}
                    iconList={this.needIcon()}
                    iconListClassName={this.getIconClassName()}
                    iconRender={(data) => this.iconRender(data)}
                    iconData={statusData}
                    iconToolRender={() => this.iconToolRender()}
                    iconContainer={this.iconContainer}
                    containerClassName={styles.grid}
                    headerClassName={styles.gridHead}
                    frozenColumn={frozen}
                    hasSearch={true}
                    searchText={searchText}
                    onSearch={(searchText) => {
                        this.setCache({
                            searchText: searchText
                        });
                    }}
                    intl18={{
                        searchPlaceHolder: msg('search_name', mainFlagName),
                        columnSetText: msg('indicator_setting'),
                        chooserSearchTitle: msg('search_indicator'),
                        chooserSearchPlaceHolder: msg('input_indicator'),
                        hideAll: msg('hide_all'),
                        showAll: msg('show_all'),
                        iconTabTitle: msg('icon'),
                        listTabTitle: msg('list')
                    }}
                    columnSet
                    columnSetStyle={{
                        maxHeight: parseInt(window.innerHeight * 0.5)
                    }}
                    columns={columns}
                    hiddenColumnKeys={hidden}
                    data={this.handleGridData(statusData)}
                    count={statusData.length}
                    page={page}
                    pageSize={pageSize}
                    sortColumn={sortColumn}
                    sortDir={sortDir}
                    afterSort={(sortColumn, sortDir, data) => {
                        this.setCache({
                            sortColumn,
                            sortDir
                        });
                        this.setDetail(data);
                    }}
                    onResizeColumn={(key, newWidth) => {
                        this.setCache({
                            [key]: newWidth
                        }, true);
                    }}
                    onData={(...props) => {
                        this.setCache({
                            pageSize: props[0],
                            page: props[1],
                            sortColumn: props[2] || '',
                            sortDir: props[3] || ''
                        });
                    }}
                />
                <EnvLoading isLoading={this.state.isLoading}/>
            </div>
        );
    }
}

/* eslint-enable */