import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import _ from 'lodash';
import { Collection, AutoSizer } from 'react-virtualized';
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import { FontIcon, IconType } from 'Icon';
import Tooltip from '@/components/Tooltip';
import { BAY_TYPE, DEVICE_TYPE, TreeNode, TreeDevice, NumberUtil } from '@/common/utils';
import { msgTag } from "@/common/lang";
import { EmptyList, LegalData, _dao, daoIsOk } from '@/common/dao';
import { TimerInterval } from '@/common/const-scada';
import { matchSuffixNumber, getMidNumber, over30Percent, kFormatProd, sum, NumberFactor } from '@/common/util-scada';
import { getPointKey } from '@/common/constants';
import {
    CBX_GENPOWER,
    CBX_REGENPOWER, CBX_STATE, CBX_TEMP, CENTRAL_INV_TEMP,
    CENTRAL_INV_HOUR, CENTRAL_INV_STATE, CENTRAL_INV_RATE,
    DCCBX_DISPERSE, DCCBX_STATE, PAD_INPUT_POWER,
    PAD_STATE, PAD_TEMP, STRING_INV_DISPERSE,
    STRING_INV_HOUR, STRING_INV_STATE, STRING_INV_TEMP, STRING_INV_RATE,
    PAD_STATE_CLASS_MAP,
    CBX_STATE_CLASS_MAP, INV_STATE_CLASS_MAP, ELECTRIC_DISABLED_VALUE,
    PAD_LOW1_POWER, PAD_LOW2_POWER,
    PAD_POINT, ACCBX_POINT, INV_POINT, STRING_INV_POINT, DCCBX_POINT
} from './constant';
import { COMMON_FLAG } from '../CONSTANT';
import { toList } from '../common_lib';
import './style.scss';

const fmt = (value, digit, thousand ) => {
    return NumberUtil.format(value, null, digit, thousand ) || '-';
}
const msg = msgTag("solar");
const topoContentrefix = "env-solar-topo-content";

const tabs = [
    {
        title: msg('topoAnalysis'),
        key: "topo",
        items: [{
            title: msg('transformer'),
            key: "box",
        }, {
            title: msg('accbx'),
            key: "combox",
        }, {
            title: msg('inverter'),
            key: "inv",
        }]
    },
    {
        title: msg('stringState'),
        key: "string"
    }
];

const PAD_TYPE = {
    CENTRAL_INV: 'CENTRAL_INV',
    ACCBX: 'ACCBX',
    STRING_INV: 'STRING_INV',
    SINGLE: 'SINGLE'
};

/**
 * 
 * @param {TreeNode|TreeDevice} bayOrDevice 
 * @returns 
 */
const getDeviceTypeName = (bayOrDevice) => {
    if(bayOrDevice.isNavNode()){
        switch(bayOrDevice.getNodeType()){
            case BAY_TYPE.PAD_STR:
                return msg('transformer');
            case BAY_TYPE.AC_COMBINER_STR:
                return msg('ac_cbx');
            case BAY_TYPE.INVERTER_STR:
                return msg('central_inv');
        }
    }else{
        switch(bayOrDevice.getType()){
            case DEVICE_TYPE.DC_COMBINER_STR:
                return msg('dc_cbx');
            case DEVICE_TYPE.INVERTER_STR:
                return msg('string_inv');
        }
    }
}

/**
 * 
 * @param {TreeNode|TreeDevice} node 
 * @param {*} stateValue 
 * @returns 
 */
const getBayOrDeviceStateCls = (node, stateValue) => {
    let cls = "default";
    if (node && stateValue !== undefined) {
        if(node.isNavNode()){
            switch(node.getNodeType()){
                case BAY_TYPE.INVERTER_STR:
                    if (INV_STATE_CLASS_MAP[stateValue] !== undefined) {
                        cls = INV_STATE_CLASS_MAP[stateValue];
                    }
                    break;
                case BAY_TYPE.AC_COMBINER_STR:
                    if (CBX_STATE_CLASS_MAP[stateValue] !== undefined) {
                        cls = CBX_STATE_CLASS_MAP[stateValue];
                    }
                    break;
                case BAY_TYPE.PAD_STR:
                    if (PAD_STATE_CLASS_MAP[stateValue] !== undefined) {
                        cls = PAD_STATE_CLASS_MAP[stateValue];
                    }
                    break;
            }
        }else{
            switch(node.getType()){
                case DEVICE_TYPE.INVERTER_STR:
                    if (INV_STATE_CLASS_MAP[stateValue] !== undefined) {
                        cls = INV_STATE_CLASS_MAP[stateValue];
                    }
                    break;
                case DEVICE_TYPE.DC_COMBINER_STR:
                    if (CBX_STATE_CLASS_MAP[stateValue] !== undefined) {
                        cls = CBX_STATE_CLASS_MAP[stateValue];
                    }
                    break;
            }
        }
    }
    return cls;
}

/**
 * 
 * @param {TreeNode|TreeDevice} a 
 * @param {TreeNode|TreeDevice} b 
 * @returns 
 */
const sortName = (a, b) => {
    let prevName = a.getName().replace(/(\d+)/g, ($,$1)=>$1.padStart(10, '0'));
    let nextName = b.getName().replace(/(\d+)/g, ($,$1)=>$1.padStart(10, '0'));
    return prevName.localeCompare(nextName);
};

export function TopoContent(props={}) {
    /**
     * @type {TreeNode[]}
     */
    let padList = useMemo(() => props.padList || [], [props.padList]);
    /**
     * 箱变拓扑列表,含集中逆变器、交流汇流箱、组串逆变器
     * @type {Map<string, (TreeNode|TreeDevice)[]>}
     */
    let padTopo = useMemo(() => props.padTopo || {}, [props.padTopo]);
    /**
     * 独立集中逆变器
     * @type {TreeNode[]}
     */
    let invList = useMemo(() => props.invList || [], [props.invList]);
    /**
     * 独立交流汇流箱
     * @type {TreeNode[]}
     */
    let accbxList = useMemo(() => props.accbxList || [], [props.accbxList]);
    /**
     * 所有真实交流汇流箱拓扑, 组串逆变器
     * @type {Map<string, TreeDevice[]>}
     */
    let accbxTopo = useMemo(() => props.accbxTopo || {}, [props.accbxTopo]);
    /**
     * @type {TreeDevice[]}
     */
    let aloneStrInvList = useMemo(() => props.aloneStrInvList || [], [props.aloneStrInvList]);
    /**
     * @type {TreeDevice[]}
     */
    let strInvList = useMemo(() => props.strInvList || [], [props.strInvList]);
    /**
     * @type {TreeDevice[]}
     */
    let dccbxList = useMemo(() => props.dccbxList || [], [props.dccbxList]);
    let statisticsCount = useMemo(() => props.statisticsCount || {}, [props.statisticsCount]);
    let abNormalStatisticsCount = useMemo(() => props.abNormalStatisticsCount || {}, [props.abNormalStatisticsCount]);

    const [centralInvPadList, accomboxPadList, stringInvPadList, singlePadList] = useMemo(() => {
        /**
         * @type {(TreeNode | TreeDevice)[]}
         */
        let centralInvPadList = [];
        /**
         * @type {(TreeNode | TreeDevice)[]}
         */
        let accomboxPadList = [];
        /**
         * @type {(TreeNode | TreeDevice)[]}
         */
        let stringInvPadList = [];
        /**
         * @type {(TreeNode | TreeDevice)[]}
         */
        let singlePadList = [];
        
        padList.forEach(node => {
            /**
             * @type {(TreeNode | TreeDevice)[]}
             */
            const topo = padTopo[node.getAlias()];
            if(topo && topo.length > 0){
                const inv = topo.find(ele => ele.isNodeType && ele.isNodeType(BAY_TYPE.INVERTER_STR));
                const accbx = topo.find(ele => ele.isNodeType && ele.isNodeType(BAY_TYPE.AC_COMBINER_STR));
                const strInv = topo.find(ele => ele.getType && ele.getType() === DEVICE_TYPE.INVERTER_STR);
                if(inv){
                    centralInvPadList.push(node);
                }else if(accbx){
                    accomboxPadList.push(node);
                }else if(strInv){
                    stringInvPadList.push(node);
                }else{
                    singlePadList.push(node);
                }
            }else{
                singlePadList.push(node);
            }
        });

        return [centralInvPadList, accomboxPadList, stringInvPadList, singlePadList];
    }, [padList, padTopo]);

    const [currentTab, setCurrentTab] = useState(0);

    const renderStatistics = useCallback(() => {
        const padSum = statisticsCount[COMMON_FLAG.PAD];
        const padFault = abNormalStatisticsCount[COMMON_FLAG.PAD];
        const acSum = statisticsCount[COMMON_FLAG.AC_COMBINER];
        const acFault = abNormalStatisticsCount[COMMON_FLAG.AC_COMBINER];
        const invSum = statisticsCount[COMMON_FLAG.INVERTER];
        const invFault = abNormalStatisticsCount[COMMON_FLAG.INVERTER];
        const dcSum = statisticsCount[COMMON_FLAG.DC_COMBINER];
        const dcFault = abNormalStatisticsCount[COMMON_FLAG.DC_COMBINER];

        return <span className={`${topoContentrefix}-tab-item`}>
            {
                (padSum && padSum > 0) ? 
                <div>{msg('transformer')}:
                    <span>{fmt(padFault, 0, true)}</span>/{fmt(padSum, 0, true)}
                </div> : null
            }
            {
                (acSum && acSum > 0) ? 
                <div>{msg('ac_cbx')}:
                    <span>{fmt(acFault, 0, true)}</span>/{fmt(acSum, 0, true)}
                </div> : null
            }
            {
                (invSum && invSum > 0) ? 
                <div>{msg('inverter')}:
                    <span>{fmt(invFault, 0, true)}</span>/{fmt(invSum, 0, true)}
                </div> : null

            }
            {
                (dcSum && dcSum > 0) ? 
                <div>{msg('dc_cbx')}:
                    <span>{fmt(dcFault, 0, true)}</span>/{fmt(dcSum, 0, true)}
                </div> : null
            }
        </span>
    }, [statisticsCount, abNormalStatisticsCount]);

    const allDevice = useMemo(() => {
        return strInvList.map(f=>f).sort(sortName).concat(dccbxList.map(f=>f).sort(sortName));
    }, [strInvList, dccbxList]);

    return (
        <div className={topoContentrefix}>
            <header className={`${topoContentrefix}-tab`}>
            {
                tabs.map((tab, index) => {
                    return <div 
                        key={tab.key}
                        onClick={() => setCurrentTab(index)}
                        className={`${currentTab === index ? 'selected' : ''}`}
                    >
                        <span>
                            <span>{tab.title}</span>
                            {!index && renderStatistics()}
                        </span>
                    </div>
                })
            }
            </header>
            {
                currentTab === 0 
                ? <NodeTopo 
                    padList={padList}
                    padTopo={padTopo}
                    invList={invList}
                    accbxList={accbxList}
                    accbxTopo={accbxTopo}
                    aloneStrInvList={aloneStrInvList}
                    dccbxList={dccbxList}
                    centralInvPadList={centralInvPadList}
                    accomboxPadList={accomboxPadList}
                    stringInvPadList={stringInvPadList}
                    singlePadList={singlePadList}
                /> 
                : (currentTab === 1 ? <StringTopo  devices={allDevice}/> : null)
            }
        </div>
    )
}


/**
 * 
 * @typedef DynData 
 * @property {string} id
 * @property {string} key
 * @property {string} display_value
 * @property {string=} raw_value
 * @property {string} status
 * @property {string|number} status_value
 * @property {string=} color 遥信值对应颜色
 * @property {string=} timestamp
 */

/**
 * 
 * @param {DynData} dynData 
 * @returns 
 */
const transformDynData = (dynData) => {
    const { key } = dynData;
    delete dynData.timestamp;
    const alias = key.split(":")[2];

    return {[alias]: dynData}
}

const DeviceTooltip = React.memo((props) => {
    const {left, top, node, data={}} = props.tipInfo || {};

    if(!node)return <Tooltip visible={false}/>;

    const name = node.getName();
    const typeName = getDeviceTypeName(node);
    
    const { display_value='-', raw_value,  color, deviation, hourValue } = data;

    const isInv = node.isNavNode() 
        ? node.isNodeType(BAY_TYPE.INVERTER_STR) 
        : node.isType(DEVICE_TYPE.INVERTER_STR);

    return (
        <Tooltip 
            style={{ 
                left: left, 
                top: top 
            }} 
            visible={true}
        >
            <div style={{ display: 'flex', flexWrap: "nowrap", alignItems: 'center' }}>
                <span 
                    style={{
                        backgroundColor: color
                    }} 
                    className={`${topoContentrefix}-state ${getBayOrDeviceStateCls(node, raw_value)}`}
                >
                    {display_value}
                </span>
                <span>{name}</span>
            </div>
            <div style={{ marginTop: 8, color: '#aaa' }}>
                <div 
                    style={{ 
                        display: 'flex', 
                        flexWrap: "nowrap" 
                    }}
                >
                    <span>{typeName}</span>&nbsp;|&nbsp;
                    <span>{display_value}</span>
                </div>
                {
                    isInv 
                    ? <div>
                        <span>{msg('yieldToday')}</span>:
                        <span>{fmt(NumberUtil.removeCommas(hourValue), 2, false)}</span><span>h</span>
                    </div> 
                    : null
                }
                {
                    deviation !== undefined 
                    ? <div style={{ display: 'flex', flexWrap: "nowrap" }}>
                        <span>{msg('deviation')}</span>:
                        <span>{fmt(NumberFactor(NumberUtil.removeCommas(deviation), 100), 2, false)}</span>
                        <span>%</span>
                    </div> 
                    : null
                }
            </div>
        </Tooltip>
    );
});

class TopoDataStore {
    /**@type {DynData} */
    dynDataMap = {};
    /**@type {DynData} */
    dynDataMapSide = {};
    /** 组串状态选中设备的支路电流测点map */
    currentMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    setDynDataMap(dynDataMap) {
        const newMap = {};
        for(let k in dynDataMap){
            if(!this.dynDataMap[k] 
                || this.dynDataMap[k].display_value !== dynDataMap[k].display_value
                || this.dynDataMap[k].raw_value !== dynDataMap[k].raw_value
                || this.dynDataMap[k].status_value !== dynDataMap[k].status_value
            ){
                newMap[k] = dynDataMap[k];
            }
        }
        if(Object.keys(newMap).length){
            window.console.warn('设备数据有变化');
            this.dynDataMap = Object.assign({}, this.dynDataMap, dynDataMap);
        }
    }

    setDynDataMapSide(dynDataMapSide) {
        const newMap = {};
        for(let k in dynDataMapSide){
            if(!this.dynDataMapSide[k] 
                || this.dynDataMapSide[k].display_value !== dynDataMapSide[k].display_value
                || this.dynDataMapSide[k].raw_value !== dynDataMapSide[k].raw_value
                || this.dynDataMapSide[k].status_value !== dynDataMapSide[k].status_value
            ){
                newMap[k] = dynDataMapSide[k];
            }
        }
        if(Object.keys(newMap).length){
            window.console.warn('支路电流数据有变化');
            this.dynDataMapSide = Object.assign({}, this.dynDataMapSide, dynDataMapSide);
        }
    }

    setCurrentMap(currentMap) {
        const newMap = {};
        for(let k in currentMap){
            if(!this.currentMap[k]){
                newMap[k] = currentMap[k];
            }
        }
        if(Object.keys(newMap).length){
            this.currentMap = Object.assign({}, this.currentMap, currentMap);
        }
    }
}

/** 拓扑分析 */

const NTDS = new TopoDataStore();

const NodeTopo = observer((props={}) => {
    const {padList, padTopo, invList, accbxList, accbxTopo, aloneStrInvList, dccbxList, centralInvPadList, accomboxPadList, stringInvPadList, singlePadList} = props;
    const [tooltipInfo, setTooltipInfo] = useState(null);
    const [electricInfo, setElectricInfo] = useState(null);
    const [nodeAlias, setNodeAlias] = useState([]);
    const topoWrap = useRef();
    
    const [
        /**
        * @type {TreeNode|TreeDevice}
        */
        currentSelectedItem, 
        setCurrentSelectedItem
    ] = useState(undefined);

    /** 获取显示设备相关数据 */
    useRecursiveTimeoutEffect(() => {
        let data = [];

        padList.map(padNode => {
            const padBay = padNode.getAlias();

            // 可见部分才需要获取数据
            if(nodeAlias.indexOf(padBay) === -1)return;

            data = data.concat(PAD_POINT.map(p => ({
                id: '',
                key: getPointKey(p, padBay),
                decimal: p.decimal || 0
            })));

            const padtopo = padTopo[padBay];
            if(!padtopo)return;

            padtopo.map(invOrAccbxOrStrInv => {
                if(invOrAccbxOrStrInv.isNavNode()){
                    const bayAlias = invOrAccbxOrStrInv.getAlias();
                    let temp = [];

                    switch(invOrAccbxOrStrInv.getNodeType()){
                        case BAY_TYPE.INVERTER_STR:
                            temp = INV_POINT;
                            break;
                        case BAY_TYPE.AC_COMBINER_STR:
                            temp = ACCBX_POINT;
                            if(accbxTopo[bayAlias]){
                                accbxTopo[bayAlias].map(stringInv => {
                                    const stringInvAlias = stringInv.getAlias();
                                    data = data.concat(STRING_INV_POINT.map(p => ({
                                        id: '',
                                        key: getPointKey(p, stringInvAlias),
                                        decimal: p.decimal || 0
                                    })));
                                });
                            }
                            break;
                    }

                    data = data.concat(temp.map(p => ({
                        id: '',
                        key: getPointKey(p, bayAlias),
                        decimal: p.decimal || 0
                    })));
                }else{
                    const deviceAlias = invOrAccbxOrStrInv.getAlias();
                    switch(invOrAccbxOrStrInv.getType()){
                        case DEVICE_TYPE.INVERTER_STR:
                            data = data.concat(STRING_INV_POINT.map(p => ({
                                id: '',
                                key: getPointKey(p, deviceAlias),
                                decimal: p.decimal || 0
                            })));                            
                            break;
                    }
                }
            });
        });

        invList.map(invNode => {
            const bayAlias = invNode.getAlias();

            // 可见部分才需要获取数据
            if(nodeAlias.indexOf(bayAlias) === -1)return;

            data = data.concat(INV_POINT.map(p => ({
                id: '',
                key: getPointKey(p, bayAlias),
                decimal: p.decimal || 0
            }))); 
        });

        accbxList.map(accbxNode => {
            const bayAlias = accbxNode.getAlias();

            // 可见部分才需要获取数据
            if(nodeAlias.indexOf(bayAlias) === -1)return;

            data = data.concat(ACCBX_POINT.map(p => ({
                id: '',
                key: getPointKey(p, bayAlias),
                decimal: p.decimal || 0
            })));

            if(accbxTopo[bayAlias]){
                accbxTopo[bayAlias].map(stringInv => {
                    const stringInvAlias = stringInv.getAlias();
                    data = data.concat(STRING_INV_POINT.map(p => ({
                        id: '',
                        key: getPointKey(p, stringInvAlias),
                        decimal: p.decimal || 0
                    })));
                });
            }
        });

        aloneStrInvList.map(invNode => {
            const deviceAlias = invNode.getAlias();

            // 可见部分才需要获取数据
            if(nodeAlias.indexOf(deviceAlias) === -1)return;

            data = data.concat(STRING_INV_POINT.map(p => ({
                id: '',
                key: getPointKey(p, deviceAlias),
                decimal: p.decimal || 0
            }))); 
        });

        if(data.length === 0) return;

        return [
            () => {
                return _dao.getDynData(data, {f: 'topo'})
            },
            (res) => {
                if (!LegalData(res)) return;
                const data = res.data || [];
                let valueMap = {};
                data.forEach(o => {
                    valueMap = {...valueMap, ...transformDynData(o)};
                });
                NTDS.setDynDataMap(valueMap);
            }
        ];
    }, TimerInterval, [padList, padTopo, invList, accbxList, accbxTopo, aloneStrInvList, nodeAlias]);

    /** 获取支路电流数据 */
    useEffect(() => {
        let device = currentSelectedItem;
        if(!device){
            return;
        }

        const isCentralInv = device.isNavNode() && device.isNodeType(BAY_TYPE.INVERTER_STR);
        const isStringInv = !device.isNavNode() && device.isType(DEVICE_TYPE.INVERTER_STR);

        const deviceAlias = device.getAlias();
        let currentDeviceAlias = [];
        if(isCentralInv){
            currentDeviceAlias = dccbxList.filter(d => d.getBayAlias() === deviceAlias && !NTDS.currentMap[d.getBayAlias()]).map(dc => dc.getAlias());
        }else if(isStringInv){
            if(!NTDS.currentMap[deviceAlias]){
                currentDeviceAlias.push(deviceAlias);
            }
        }

        if(currentDeviceAlias.length){
            (async () => {
                const curPoints = await _dao.getBranchCurrentPoints(currentDeviceAlias.join(','));
                if(Array.isArray(curPoints) && curPoints.length > 0){
                    const curMap = {};
                    curPoints.map(p => {
                        const { point_alias } = p;
                        // 对应设备别名目前是前四段
                        const deviceAlias = point_alias.split('.').slice(0, 4).join('.');
                        curMap[deviceAlias] = curMap[deviceAlias] || [];
                        curMap[deviceAlias].push(p);
                    });
                    NTDS.setCurrentMap(curMap);
                }
            })();
        }
    }, [currentSelectedItem, dccbxList]);

    /** 获取设备详情数据 */
    useRecursiveTimeoutEffect(() => {
        let data = [];

        if(currentSelectedItem){
            if(currentSelectedItem.isNavNode()){
                switch(currentSelectedItem.getNodeType()){
                    case BAY_TYPE.PAD_STR:
                        break;
                    case BAY_TYPE.AC_COMBINER_STR:
                        break;
                    case BAY_TYPE.INVERTER_STR:
                        dccbxList
                        .filter(d => d.getBayAlias() === currentSelectedItem.getAlias())
                        .map(d => {
                            const dccbxAlias = d.getAlias();
                            const curPoint = NTDS.currentMap[dccbxAlias] || [];
                            data = data.concat(DCCBX_POINT.map(p => ({
                                id: '',
                                key: getPointKey(p, dccbxAlias),
                                decimal: p.decimal
                            })));
                            data = data.concat(curPoint.map(p => ({
                                id: "",
                                key: `1:62:${p.point_alias}:9`,
                                decimal: 2
                            })));
                        })
                        break;
                }
            }else{
                data = data.concat((NTDS.currentMap[currentSelectedItem.getAlias()] || []).map(p => ({
                    id: "",
                    key: `1:62:${p.point_alias}:9`,
                    decimal: 2
                })));
            }
        }

        if(data.length === 0) return;

        return [
            () => {
                return _dao.getDynData(data, {f: 'topo_detail'})
            },
            (res) => {
                if (!LegalData(res)) return;
                const data = res.data || [];
                let valueMap = {};
                data.forEach(o => {
                    valueMap = {...valueMap, ...transformDynData(o)};
                });
                NTDS.setDynDataMapSide(valueMap);
            }
        ];
    }, TimerInterval, [currentSelectedItem, dccbxList, NTDS.currentMap]);
    

    const getSelectedClass = useCallback((alias, cls = 'health') => {
        return currentSelectedItem && currentSelectedItem.getAlias() === alias ? ` selected ${cls}` : ''
    }, [currentSelectedItem]);

    /**
     * 
     * @param {Event} e 
     * @param {TreeNode|TreeDevice} node 
     */
    const onSelected = useCallback((node) => {
        return () => {
            const alias = node.getAlias();
            const selectedAlias = currentSelectedItem ? currentSelectedItem.getAlias() : '';
            if (alias !== selectedAlias) {
                setCurrentSelectedItem(node);
            }
        }
    }, [currentSelectedItem]);

    /**
     * 
     * @param {Event} e 
     * @param {TreeNode|TreeDevice} node 
     * @param {Map} info 
     */
    const onHover = useCallback((node, data) => {
        return (e) => {
            const { clientX: left, clientY: top } = e.nativeEvent;
            setTooltipInfo({ top, left, node, data });
        }
    }, []);

    const onLeave = useCallback((e) => {
        setTooltipInfo(null);
    }, []);

    const onCurHover = useCallback((info) => {        
        return (e) => {
            if(!e) return;

            const { clientX: left, clientY: top } = e.nativeEvent;
            setElectricInfo({
                top: top,
                left: left,
                ...info
            })
        }
    });

    const onCurLeave = useCallback(() => {
        setElectricInfo(null);
    }, []);

    const renderCurrentTooltip = useCallback(() => {
        const { left, top, name, disabled, value } = electricInfo || {};

        return <Tooltip 
            style={{ 
                left: left, 
                top: top 
            }} 
            visible={!!electricInfo}
        >
            <div className={`${topoContentrefix}-box-side-box-combox-content-bottom-electric-tooltip`}>
                <div style={{whiteSpace: 'nowrap'}}>{name}</div>
                <div>
                    {
                        disabled
                        ? '/' 
                        : `${fmt(NumberUtil.removeCommas(value), 2, false)}A`
                    }
                </div>
            </div>
        </Tooltip>;
    }, [electricInfo]);

    /**
     * 
     * @param {TreeNode|TreeDevice} invNode 
     * @returns 
     */
    const renderSingInv = useCallback((invNode) => {
        const alias = invNode.getAlias();
        const name = invNode.getName();
        const valueMap = NTDS.dynDataMap;

        const splice = alias.split(".");
        const hourAlias = splice.length === 3 ? `${alias}.${CENTRAL_INV_HOUR}` : `${alias}.${STRING_INV_HOUR}`;
        const hourValue = valueMap[hourAlias] && valueMap[hourAlias].display_value;
        const stateAlias = splice.length === 3 ? `${alias}.${CENTRAL_INV_STATE}` : `${alias}.${STRING_INV_STATE}`;
        const stateData = valueMap[stateAlias] || {};
        const stateValue = stateData.raw_value;
        const cls = INV_STATE_CLASS_MAP[stateValue] || 'health';

        return (
            <div 
                key={alias}
                data-inv={alias}
                onClick={onSelected(invNode)} 
                onMouseMove={onHover(invNode, { hourValue, ...stateData })}
                onMouseOut={onLeave}
                className={`data-inv ${topoContentrefix}-box-inv ${cls} ${getSelectedClass(alias, cls)}`}
            >
                <div className={`${topoContentrefix}-box-inv-name`}>{name}</div>
                <div>
                    <span>{fmt(NumberUtil.removeCommas(hourValue), 2, false)}</span><span>h</span>
                </div>
            </div>
        );
    }, [NTDS.dynDataMap, getSelectedClass]);

    /**
     * 
     * @param {TreeNode} accbxNode 
     * @returns 
     */
    const renderSingAccbx = useCallback((accbxNode) => {
        const alias = accbxNode.getAlias();
        const name = accbxNode.getName();

        const cbxStateAlias = `${alias}.${CBX_STATE}`;
        const cbxStateData = NTDS.dynDataMap[cbxStateAlias] || {};
        const cbxStateValue = cbxStateData.raw_value;
        const cls = CBX_STATE_CLASS_MAP[cbxStateValue] || 'health';

        return (
            <div key={alias} data-cbx={alias} className={`data-cbx ${topoContentrefix}-combox`}>
                <div 
                    onClick={onSelected(accbxNode)} 
                    onMouseMove={onHover(accbxNode, {...cbxStateData})} 
                    onMouseOut={onLeave}
                    className={`${topoContentrefix}-combox-title ${cls} ${getSelectedClass(alias, cls)}`}
                >
                    <span className={`${topoContentrefix}-combox-icon ${cls} ${getSelectedClass(alias, cls)}`}></span>
                    <span>{msg('accbx')}</span> | <span>{name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {(accbxTopo[alias] || []).sort(sortName).map((stringInv, ind) => {
                        return renderSingInv(stringInv);
                    })}
                </div>
            </div>
        );
    }, [NTDS.dynDataMap, getSelectedClass]);

    /**
     * 
     * @param {TreeNode} padNode 
     * @param {PAD_TYPE} padType 
     */
    const renderPadTopo = useCallback((padNode, padType) => {
        const padAlias = padNode.getAlias();
        const topoList = padTopo[padAlias];

        switch(padType){
            case PAD_TYPE.CENTRAL_INV:
            case PAD_TYPE.ACCBX:
            case PAD_TYPE.STRING_INV:
            case PAD_TYPE.SINGLE:
            default:
                return (topoList || [])
                .map(f => f)
                .sort(sortName)
                .map((nodeOrDevice, ind) => {
                    const isNavNode = nodeOrDevice.isNavNode();
                    if(isNavNode){
                        switch(nodeOrDevice.getNodeType()){
                            case BAY_TYPE.INVERTER_STR:
                                return renderSingInv(nodeOrDevice);
                            case BAY_TYPE.AC_COMBINER_STR:
                                return renderSingAccbx(nodeOrDevice);
                        }
                    }else{
                        switch(nodeOrDevice.getType()){
                            case DEVICE_TYPE.INVERTER_STR:
                                return renderSingInv(nodeOrDevice);
                        }
                    }
                });
        }
    }, [padTopo, renderSingInv, renderSingAccbx]);

    const renderPadList = useCallback(() => {

        let centralInvPadIndex = centralInvPadList.length - 1;
        let accomboxPadIndex = centralInvPadIndex + accomboxPadList.length;
        let stringInvPadIndex = accomboxPadIndex + stringInvPadList.length;
        let singePadIndex = stringInvPadIndex + singlePadList.length;
        let valueMap = NTDS.dynDataMap;

        return <div>
            {
                centralInvPadList.sort(sortName).concat(
                    accomboxPadList.sort(sortName),
                    stringInvPadList.sort(sortName), 
                    singlePadList.sort(sortName)
                )
                .map((padNode, ind) => {
                    const padAlias = padNode.getAlias();
                    const stateData = valueMap[`${padAlias}.${PAD_STATE}`] || {};
                    const cls = PAD_STATE_CLASS_MAP[stateData.raw_value] || 'health';

                    let style = {};
                    let padType = PAD_TYPE.SINGLE;
                    if(ind >= 0 && ind <= centralInvPadIndex){
                        padType = PAD_TYPE.CENTRAL_INV;
                        style = {display: 'inline-block'};
                    }else if(ind > centralInvPadIndex && ind <= accomboxPadIndex){
                        padType = PAD_TYPE.ACCBX;
                    }else if(ind > accomboxPadIndex && ind <= stringInvPadIndex){
                        padType = PAD_TYPE.STRING_INV;
                    }

                    return (
                        <div 
                            key={padAlias} 
                            data-pad={padAlias}
                            className={`data-pad ${topoContentrefix}-box ${cls} ${getSelectedClass(padAlias)}`}
                            style={style}
                        >
                            <div 
                                onClick={onSelected(padNode)} 
                                onMouseMove={onHover(padNode, stateData)} 
                                onMouseOut={onLeave}
                                className={`${topoContentrefix}-box-header ${cls} ${getSelectedClass(padAlias, cls)}`}
                            >
                                {msg('transformer')}&nbsp;|&nbsp;{padNode.getName()}
                            </div>
                            {
                                renderPadTopo(padNode, padType)
                            }
                        </div>
                    );
                })
            }
        </div>
    }, [centralInvPadList, accomboxPadList, stringInvPadList, singlePadList, NTDS.dynDataMap, renderPadTopo, getSelectedClass]);

    useEffect(() => {
        let inViewAll = [];
        let timeout;
        let t = 0;

        const intersectionObserver = new IntersectionObserver((entries) => {
            let inView = [];
            let outView = [];
            entries.forEach(entry => {
                const $ele = $(entry.target);
                const a = $ele.attr('data-pad') || '';
                const b = $ele.attr('data-inv') || '';
                const c = $ele.attr('data-cbx') || '';
                if(a + b + c){
                    if (entry.intersectionRatio <= 0){
                        outView.push(a + b + c);
                    }else{
                        inView.push(a + b + c);
                    }
                }
            });
            inViewAll = inViewAll.filter(f => outView.indexOf(f) === -1);
            inView.forEach(f => {
                if(inViewAll.indexOf(f) === -1){
                    inViewAll.push(f);
                }
            });

            if(window.___debug___){
                let t2 = new Date().getTime();
                console.warn(`${t2 - t}ms`, inViewAll);
                t = t2;
            }

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setNodeAlias(inViewAll);
            }, 500);
            
        }, {
            root: topoWrap.current,
            rootMargin: '0px',
            threshold: 0
        });

        // 开始监听
        document.querySelectorAll('.data-pad, .data-inv, .data-cbx').forEach((i) => {
            if (i) {
                intersectionObserver.observe(i);
            }
        });

        return () => {
            clearTimeout(timeout);
            intersectionObserver.disconnect();
        }
    }, [padList.length]);

    /**
     * 
     * @param {TreeNode} padNode 
     * @returns 
     */
    const renderPadInfo = useCallback((padNode) => {
        const alias = padNode.getAlias();
        const name = padNode.getName();
        const typeName = getDeviceTypeName(padNode);
        const valueMap = NTDS.dynDataMap;

        const outputPowerAlias = `${alias}.${PAD_INPUT_POWER}`;
        const outPowerText = valueMap[outputPowerAlias] && valueMap[outputPowerAlias].display_value;
        const low1PowerAlias = `${alias}.${PAD_LOW1_POWER}`;
        const low1Value = valueMap[low1PowerAlias] && valueMap[low1PowerAlias].display_value;
        const low2PowerAlias = `${alias}.${PAD_LOW2_POWER}`;
        const low2Value = valueMap[low2PowerAlias] && valueMap[low2PowerAlias].display_value;
        const inputPowerValue = sum([NumberUtil.removeCommas(low1Value), NumberUtil.removeCommas(low2Value)]);
        const airTempAlias = `${alias}.${PAD_TEMP}`;
        const airTempText = valueMap[airTempAlias] && valueMap[airTempAlias].display_value;
        const stateAlias = `${alias}.${PAD_STATE}`;
        const stateText = valueMap[stateAlias] && valueMap[stateAlias].display_value;
        const stateValue = valueMap[stateAlias] && valueMap[stateAlias].raw_value;
        const cls = PAD_STATE_CLASS_MAP[stateValue] || 'health';

        return (
            <div 
                onClick={e => {
                    toList(COMMON_FLAG.PAD, alias);
                }} 
                style={{ cursor: "pointer" }} 
                className={`${topoContentrefix}-box-side`}
            >
                <header className={`${topoContentrefix}-box-side-header`}>
                    <span className={`${topoContentrefix}-box-side-header-icon ${cls}`}></span>
                    <span className={`${topoContentrefix}-box-side-header-title ${cls}`}>
                        {name}
                    </span>
                    <FontIcon type={IconType.DIRECT_RIGHT} style={{color: '#ccc'}}/>
                </header>
                <div className={`${topoContentrefix}-box-side-state`}>
                    <span title={typeName}>{typeName}</span>&nbsp;|&nbsp;
                    <span title={stateText}>{stateText}</span>
                </div>
                <div className={`${topoContentrefix}-box-side-item`}>
                    {msg('input_power')} : {kFormatProd(NumberUtil.removeCommas(inputPowerValue))}W
                </div>
                <div className={`${topoContentrefix}-box-side-item`}>
                    {msg('output_power')} : {kFormatProd(NumberUtil.removeCommas(outPowerText))}W
                </div>
                <div className={`${topoContentrefix}-box-side-item`}>
                    {msg('oil_temp')} : {fmt(NumberUtil.removeCommas(airTempText), 2, false)}℃
                </div>
            </div>
        );
    }, [NTDS.dynDataMap]);

    /**
     * 
     * @param {TreeNode} accbxNode 
     * @returns 
     */
    const renderACCbxInfo = useCallback((accbxNode) => {
        const alias = accbxNode.getAlias();
        const name = accbxNode.getName();
        const typeName = getDeviceTypeName(accbxNode);
        const valueMap = NTDS.dynDataMap;

        const activePowerAlias = `${alias}.${CBX_GENPOWER}`;
        const activePowerText = valueMap[activePowerAlias] && valueMap[activePowerAlias].display_value;
        const reActivePowerAlias = `${alias}.${CBX_REGENPOWER}`;
        const reActivePowerText = valueMap[reActivePowerAlias] && valueMap[reActivePowerAlias].display_value;
        const airTempAlias = `${alias}.${CBX_TEMP}`;
        const airTempText = valueMap[airTempAlias] && valueMap[airTempAlias].display_value;
        const stateAlias = `${alias}.${CBX_STATE}`;
        const stateText = valueMap[stateAlias] && valueMap[stateAlias].display_value;
        const stateValue = valueMap[stateAlias] && valueMap[stateAlias].raw_value;
        const cls = CBX_STATE_CLASS_MAP[stateValue];

        return <div className={`${topoContentrefix}-box-side`}>
            <header style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                className={`${topoContentrefix}-box-side-header`}>
                <span className={`${topoContentrefix}-box-side-header-icon ${cls}`}></span>
                <span className={`${topoContentrefix}-box-side-header-title ${cls}`}>
                    {name}
                </span>
            </header>
            <div className={`${topoContentrefix}-box-side-state`}>
                <span title={typeName}>{typeName}</span>&nbsp;|&nbsp;
                <span title={stateText}>{stateText}</span>
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('active_power')} : {kFormatProd(NumberUtil.removeCommas(activePowerText))}W
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('reactive_power')} : {kFormatProd(NumberUtil.removeCommas(reActivePowerText))}Var
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('air_temp')} : {fmt(NumberUtil.removeCommas(airTempText), 2, false)}℃
            </div>
        </div>
    }, [NTDS.dynDataMap]);

    /**
     * 
     * @param {TreeNode} invNode 
     * @returns 
     */
    const renderCentralInvInfo = useCallback((invNode) => {
        const alias = invNode.getAlias();
        const name = invNode.getName();
        const typeName = getDeviceTypeName(invNode);
        const dccbx = dccbxList.filter(d => d.getBayAlias() === alias);
        const valueMap = NTDS.dynDataMap;
        const sideValueMap = NTDS.dynDataMapSide;

        const airTempAlias = `${alias}.${CENTRAL_INV_TEMP}`;
        const airTempText = valueMap[airTempAlias] && valueMap[airTempAlias].display_value;
        const effictAlias = `${alias}.${CENTRAL_INV_RATE}`;
        const effictText = valueMap[effictAlias] && valueMap[effictAlias].display_value;
        const stateAlias = `${alias}.${CENTRAL_INV_STATE}`;
        const stateValue = valueMap[stateAlias] && valueMap[stateAlias].raw_value;
        const stateText = valueMap[stateAlias] && valueMap[stateAlias].display_value;
        const cls = INV_STATE_CLASS_MAP[stateValue] || 'health';

        return <div>
            <div 
                onClick={e => {
                    toList(COMMON_FLAG.INVERTER, alias)
                }} 
                style={{ cursor: "pointer", display: 'flex' }} 
                className={`${topoContentrefix}-box-side`}
            >
                <div className={`${topoContentrefix}-box-side-box`}>
                    <div className={`${topoContentrefix}-box-side-box-icon ${cls}`}></div>
                    <div className={`${topoContentrefix}-box-side-box-line`}></div>
                </div>
                <div style={{ width: '100%' }}>
                    <header className={`${topoContentrefix}-box-side-header`}>
                        <span title={name} style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            direction: 'rtl',
                            textAlign: 'left'
                        }} className={`${topoContentrefix}-box-side-header-title ${cls}`}>
                            {name}
                        </span>
                        <FontIcon type={IconType.DIRECT_RIGHT} style={{color: '#ccc'}}/>
                    </header>
                    <div className={`${topoContentrefix}-box-side-state`}>
                        <span title={typeName}>{typeName}</span>&nbsp;|&nbsp;
                        <span title={stateText}>{stateText}</span>
                    </div>
                    <div className={`${topoContentrefix}-box-side-item`}>
                        <span>
                            {msg('air_temp')}:{fmt(NumberUtil.removeCommas(airTempText), 2, false)}℃
                        </span>
                        <span>
                            {msg('effict_rate')}:{fmt(NumberUtil.removeCommas(effictText), 2, false)}%
                        </span>
                    </div>
                </div>
            </div>
            <div>{
                dccbx.map((treeDevice, index) => {
                    const dccbxAlias = treeDevice.getAlias();
                    const name = treeDevice.getName();
                    const points = (NTDS.currentMap[dccbxAlias] || []).slice().sort((a, b) => Number(matchSuffixNumber(a.point_alias)) - Number(matchSuffixNumber(b.point_alias)));

                    const deviationAlias = `${dccbxAlias}.${DCCBX_DISPERSE}`;
                    const deviationText = sideValueMap[deviationAlias] && sideValueMap[deviationAlias].display_value;
                    const dcCbxStateAlias = `${dccbxAlias}.${DCCBX_STATE}`;
                    const dcCbxStateData = sideValueMap[dcCbxStateAlias] || {};
                    const dcCbxStateValue = dcCbxStateData.raw_value;
                    const dcCls = CBX_STATE_CLASS_MAP[dcCbxStateValue] || 'health';
                    const electricNumberArray = points
                        .filter(i => sideValueMap[i?.point_alias] && String(sideValueMap[i?.point_alias]?.status_value) !== String(ELECTRIC_DISABLED_VALUE))
                        .map(i => NumberUtil.removeCommas(sideValueMap[i.point_alias] && sideValueMap[i.point_alias].display_value));
                    const electricMidNumber = getMidNumber(electricNumberArray);

                    return <div className={`${topoContentrefix}-box-side-box-combox`} key={dccbxAlias}>
                        <div className={`${topoContentrefix}-box-side-box-combox-line ${index >= dccbx.length - 1 ? 'last' : ''}`}></div>
                        <div
                            className={`${topoContentrefix}-box-side-box-combox-content`}>
                            <div 
                                className={`${topoContentrefix}-box-side-box-combox-content-top ${dcCls}`}
                                onClick={e => toList(COMMON_FLAG.DC_COMBINER, dccbxAlias)}
                                onMouseMove={onHover(treeDevice, {
                                    deviation: deviationText,
                                    ...dcCbxStateData
                                })}
                                onMouseOut={onLeave}
                            >
                                <div style={{
                                    width: '90%',
                                    textOverflow: 'ellipsis',
                                    overflow: "hidden",
                                    whiteSpace: 'nowrap',
                                    direction: 'rtl',
                                    textAlign: 'left'
                                }}>{name}</div>
                                <div className={`${topoContentrefix}-box-side-box-combox-content-top-topic`}>
                                    <div>
                                        <span>{msg('deviation')}</span>:
                                        <span>{fmt(NumberFactor(NumberUtil.removeCommas(deviationText), 100), 2, false)}%</span>
                                    </div>
                                    <FontIcon type={IconType.DIRECT_RIGHT} style={{color: '#ccc'}}/>
                                </div>
                            </div>
                            {
                                points.length > 0 && <div className={`${topoContentrefix}-box-side-box-combox-content-bottom`}>
                                    {
                                        points.map(i => {
                                            const pointAlias = i.point_alias;
                                            const currentData = sideValueMap[pointAlias] || {};
                                            const electricText = currentData.display_value;
                                            const electricValue = NumberUtil.removeCommas(electricText);
                                            const over = over30Percent(electricMidNumber, electricValue);
                                            const disabled = String(currentData.status_value) === String(ELECTRIC_DISABLED_VALUE);

                                            return <div
                                                onMouseMove={onCurHover({
                                                    name: i.point_name.replace(name, ''),
                                                    alias: pointAlias,
                                                    value: electricText,
                                                    disabled
                                                })}
                                                onMouseOut={onCurLeave}
                                                className={`${topoContentrefix}-box-side-box-combox-content-bottom-electric ${over ? 'over' : ''} ${disabled ? 'disabled' : ''}`}
                                                key={pointAlias}>
                                            </div>
                                        })
                                    }
                                </div>
                            }
                        </div>
                    </div>
                })
            }</div>
        </div>
    }, [NTDS.dynDataMap, NTDS.dynDataMapSide, dccbxList]);

    /**
     * 
     * @param {TreeDevice} invNode 
     * @returns 
     */
    const renderStringInvInfo = useCallback((invNode) => {
        const alias = invNode.getAlias();
        const name = invNode.getName();
        const typeName = getDeviceTypeName(invNode);
        const valueMap = NTDS.dynDataMap;
        const sideValueMap = NTDS.dynDataMapSide;

        const deviationAlias = `${alias}.${STRING_INV_DISPERSE}`;
        const deviationValue = valueMap[deviationAlias] && valueMap[deviationAlias].display_value;
        const airTempAlias = `${alias}.${STRING_INV_TEMP}`;
        const airTempText = valueMap[airTempAlias] && valueMap[airTempAlias].display_value;
        const effictAlias = `${alias}.${STRING_INV_RATE}`;
        const effictText = valueMap[effictAlias] && valueMap[effictAlias].display_value;
        const stateAlias = `${alias}.${STRING_INV_STATE}`;
        const stateValue = valueMap[stateAlias] && valueMap[stateAlias].raw_value;
        const stateText = valueMap[stateAlias] && valueMap[stateAlias].display_value;
        const cls = INV_STATE_CLASS_MAP[stateValue] || 'health';
        const points = (NTDS.currentMap[alias] || []).slice().sort((a, b) => Number(matchSuffixNumber(a.point_alias)) - Number(matchSuffixNumber(b.point_alias)));
        const pointNumberArray = points
            .filter(i => sideValueMap[i?.point_alias] && String(sideValueMap[i?.point_alias]?.status_value) !== String(ELECTRIC_DISABLED_VALUE))
            .map(i => NumberUtil.removeCommas(sideValueMap[i.point_alias] && sideValueMap[i.point_alias].display_value));
        const midNumber = getMidNumber(pointNumberArray);

        return <div style={{ cursor: "pointer" }} className={`${topoContentrefix}-box-side`}>
            <header onClick={e => toList(COMMON_FLAG.INVERTER, alias)} className={`${topoContentrefix}-box-side-header`}>
                <span>
                    <span className={`${topoContentrefix}-box-side-header-icon ${cls}`}></span>
                    <span className={`${topoContentrefix}-box-side-header-title ${cls}`}>
                        {name}
                    </span>
                </span>
                <FontIcon type={IconType.DIRECT_RIGHT} style={{color: '#ccc'}}/>
            </header>
            <div className={`${topoContentrefix}-box-side-state`}>
                <span title={typeName}>{typeName}</span>&nbsp;|&nbsp;
                <span title={stateText}>{stateText}</span>
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('deviation')} : {fmt(NumberFactor(NumberUtil.removeCommas(deviationValue), 100), 2, false)}%
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('air_temp')} : {fmt(NumberUtil.removeCommas(airTempText), 2, false)}℃
            </div>
            <div className={`${topoContentrefix}-box-side-item`}>
                {msg('effict_rate')} : {fmt(NumberFactor(NumberUtil.removeCommas(effictText), 100), 2, false)}%
            </div>
            {
                points && points.length > 0 && <div className={`${topoContentrefix}-box-side-cur`}>
                    {
                        points.map((o) => {
                            const currentData = sideValueMap[o.point_alias] || {};
                            const electricText = currentData.display_value;
                            const electricValue = NumberUtil.removeCommas(electricText);
                            const over = over30Percent(midNumber, electricValue);
                            const disabled = String(currentData.status_value) === String(ELECTRIC_DISABLED_VALUE);
                            return <div
                                key={o.point_alias}
                                className={`${over ? 'over' : ''} ${disabled ? 'disabled' : ''}`}>
                                <div title={o.name}>{matchSuffixNumber(o.point_alias).padStart(2, 0)}</div>
                                <div>{disabled ? '/' : `${fmt(NumberUtil.removeCommas(electricText), 2, false)}A`}</div>
                            </div>
                        })
                    }
                </div>
            }
        </div>
    }, [NTDS.dynDataMap, NTDS.dynDataMapSide]);

    const renderSelectedItem = useCallback(() => {
        if(!currentSelectedItem || !currentSelectedItem.getAlias()) return null;
        
        if(currentSelectedItem.isNavNode()){
            switch(currentSelectedItem.getNodeType()){
                case BAY_TYPE.PAD_STR:
                    return renderPadInfo(currentSelectedItem);
                case BAY_TYPE.AC_COMBINER_STR:
                    return renderACCbxInfo(currentSelectedItem);
                case BAY_TYPE.INVERTER_STR:
                    return renderCentralInvInfo(currentSelectedItem);
            }
        }else{
            return renderStringInvInfo(currentSelectedItem);
        }
    }, [currentSelectedItem, renderPadInfo, renderACCbxInfo, renderCentralInvInfo, renderStringInvInfo]);

    // 选中展示第一个, 不存在时才会执行
    if(!currentSelectedItem){
        if(padList.length > 0){
            if(centralInvPadList.length > 0){
                const firstPadAlias = centralInvPadList.map(f=>f).sort(sortName)[0].getAlias();
                setCurrentSelectedItem(padTopo[firstPadAlias].map(f=>f).sort(sortName)[0]);
            }else if(accomboxPadList.length > 0){
                const firstPadAlias = accomboxPadList.map(f=>f).sort(sortName)[0].getAlias();
                const firstAccbx = padTopo[firstPadAlias].map(f=>f).sort(sortName)[0];
                const firstAccbxAlias = firstAccbx.getAlias();
                if(accbxTopo[firstAccbxAlias] && accbxTopo[firstAccbxAlias].length > 0){
                    setCurrentSelectedItem(accbxTopo[firstAccbxAlias].map(f=>f).sort(sortName)[0]);
                }else{
                    setCurrentSelectedItem(firstAccbx);
                }                    
            }else if(stringInvPadList.length > 0){
                const firstPadAlias = stringInvPadList.map(f=>f).sort(sortName)[0].getAlias();
                setCurrentSelectedItem(padTopo[firstPadAlias].map(f=>f).sort(sortName)[0]);
            }else{
                setCurrentSelectedItem(singlePadList.map(f=>f).sort(sortName)[0]);
            }
        }else if(accbxList.length > 0){
            const temp = accbxList.map(f=>f).sort(sortName);
            const accbxInv = accbxTopo[temp[0].getAlias()];
            if(accbxInv && accbxInv.length > 0){
                setCurrentSelectedItem(accbxInv.map(f=>f).sort(sortName)[0]);
            }else{
                setCurrentSelectedItem(temp[0]);
            }  
        }else if(invList.length > 0){
            setCurrentSelectedItem(invList.map(f=>f).sort(sortName)[0]);
        }else if(aloneStrInvList.length > 0){
            setCurrentSelectedItem(aloneStrInvList.map(f=>f).sort(sortName)[0]);
        }
    }

    return <div className={`${topoContentrefix}-wrap`}>
        <div className={`${topoContentrefix}-main`} ref={topoWrap}>
            <div className={`${topoContentrefix}-box-wrap`} ref={topoWrap}>
                {
                    [
                        // 箱变列表
                        padList.length > 0 ? <div key={1} name="pad">{renderPadList()}</div> : null,
                        // 独立的交流汇流箱
                        accbxList.length > 0 ? <div key={2} name="accbx">{
                            accbxList.sort(sortName).map((accbx, ind) => {
                                return renderSingAccbx(accbx);
                            })
                        }</div> : null,
                        // 独立的集中式逆变器
                        invList.length > 0 ? <div key={3} name="central-inv">{
                            invList.sort(sortName).map((inv, ind) => {
                                return renderSingInv(inv);
                            })
                        }</div> : null,
                        // 独立的组串式逆变器
                        aloneStrInvList.length > 0 ? <div key={4} name="string-inv">{
                            aloneStrInvList.sort(sortName).map((inv, ind) => {
                                return renderSingInv(inv);
                            })
                        }</div> : null,
                    ]
                }
            </div>
        </div>
        <div className={`${topoContentrefix}-side`}>
            {renderSelectedItem()}
        </div>
        <DeviceTooltip tipInfo={tooltipInfo}/>
        {renderCurrentTooltip()}
    </div>
});


/** 组串拓扑 */

const STDS = new TopoDataStore();

const StringTopo = observer((props={}) => {
    const { devices=[] } = props;
    
    /** 组串状态选中项 */
    const [stringStateSelected, setStringStateSelected] = useState();
    const [indices, setIndices] = useState(null);
    const [tipInfo, setTipInfo] = useState(null);
    const collectRef = React.createRef();
    const scrollStartTime = React.createRef(0);

    useEffect(() => {
        setStringStateSelected(devices[0]);
    }, [devices]);

    useEffect(() => {
        let device = stringStateSelected;
        if(!device || STDS.currentMap[device.getAlias()]){
            return;
        }
        
        (async () => {
            const curPoints = await _dao.getBranchCurrentPoints(device.getAlias());
            if(Array.isArray(curPoints) && curPoints.length > 0){
                STDS.setCurrentMap({[[device.getAlias()]]: curPoints});
            }
        })();
    }, [stringStateSelected]);

    /** 获取显示设备相关数据 */
    useRecursiveTimeoutEffect(() => {
        let dynReq = [];
        let reqDevice = devices.slice(0, 30);
        if(indices && indices.length > 0){
            reqDevice = devices.slice(indices[0], indices[indices.length - 1] + 1);
        }

        reqDevice.map(treeDevice => {
            const deviceAlias = treeDevice.getAlias();
            let temp = [];
            switch(treeDevice.getType()){
                case DEVICE_TYPE.INVERTER_STR:
                    temp = STRING_INV_POINT.filter(p => p.isStringTopo);
                    break;
                case DEVICE_TYPE.DC_COMBINER_STR:
                    temp = DCCBX_POINT;
                    break;
            }
            dynReq = dynReq.concat(temp.map(p => ({
                id: '',
                key: getPointKey(p, deviceAlias),
                decimal: p.decimal
            })));
        });

        if(dynReq.length === 0) return;

        return [
            () => {
                return _dao.getDynData(dynReq, {f: 'string_state'})
            },
            (res) => {
                if (!LegalData(res)) return;
                const data = res.data || [];
                let valueMap = {};
                data.forEach(o => {
                    valueMap = {...valueMap, ...transformDynData(o)};
                });
                STDS.setDynDataMap(valueMap);
            }
        ];
    }, TimerInterval, [devices, indices]);

    /** 获取支路电流数据 */
    useRecursiveTimeoutEffect(() => {
        if(!stringStateSelected) return;

        let dynReq = [];
        const deviceAlias = stringStateSelected.getAlias();
        const curPoint = STDS.currentMap[deviceAlias] || [];
        dynReq = dynReq.concat(curPoint.map(p => ({
            id: '',
            key: `1:${p.table_no}:${p.point_alias}:${p.field_no}`,
            decimal: 2
        })));

        if(dynReq.length === 0) return;

        return [
            () => {
                return _dao.getDynData(dynReq, {f: 'string_current'})
            },
            (res) => {
                if (!LegalData(res)) return;
                const data = res.data || [];
                let valueMap = {};
                data.forEach(o => {
                    valueMap = {...valueMap, ...transformDynData(o)};
                });
                STDS.setDynDataMapSide(valueMap);
            }
        ];
    }, TimerInterval, [stringStateSelected, STDS.currentMap]);

    /**
     * 
     * @param {Event} e 
     * @param {TreeNode|TreeDevice} node 
     * @param {DynData} data 
     */
    const onHover = useCallback((event, node, data) => {
        const { clientX: left, clientY: top } = event.nativeEvent;
        setTipInfo({
            left,
            top,
            node,
            data
        });
    }, []);

    const onLeave = useCallback(() => {
        setTipInfo(null);
    }, []);    

    const renderCell = useCallback(({ index, isScrolling, key, style }) => {

        const treeDevice = devices[index];
        const isSelected = stringStateSelected === treeDevice;
        const isInv = treeDevice.isType(DEVICE_TYPE.INVERTER_STR);
        const alias = treeDevice.getAlias();
        const name = treeDevice.getName();
        const valueMap = STDS.dynDataMap;

        const stateAlias = isInv ? `${alias}.${STRING_INV_STATE}` : `${alias}.${DCCBX_STATE}`;
        const stateData = valueMap[stateAlias] || {};
        const stateValue = stateData.raw_value;
        const cls = (isInv ? INV_STATE_CLASS_MAP[stateValue] : CBX_STATE_CLASS_MAP[stateValue]) || 'health';
        
        const deviationAlias = isInv ? `${alias}.${STRING_INV_DISPERSE}` : `${alias}.${DCCBX_DISPERSE}`;
        const deviationText = valueMap[deviationAlias] && valueMap[deviationAlias].display_value || "-";
        const hourAlias = `${alias}.${STRING_INV_HOUR}`;
        const hourValue = valueMap[hourAlias] && valueMap[hourAlias].display_value;

        return <div 
            key={alias} 
            className={`${topoContentrefix}-cell`} 
            style={style}
        >
            <div 
                onMouseMove={e => onHover(e, treeDevice, {
                    ...stateData,
                    deviation: deviationText,
                    hourValue
                })} 
                onMouseLeave={onLeave}
                className={`${topoContentrefix}-cell-box  ${isSelected ? `${topoContentrefix}-cell-box-selected` : ''} ${cls}`}
                onClick={() => {
                    setStringStateSelected(treeDevice);
                }}
            >
                <div className={`${topoContentrefix}-cell-box-start`}>
                    <span>{getDeviceTypeName(treeDevice)}</span>
                    <FontIcon 
                        type={IconType.DIRECT_RIGHT} 
                        style={{color: '#ccc'}}
                        onClick={e => {
                            toList(isInv ? COMMON_FLAG.INVERTER : COMMON_FLAG.DC_COMBINER, alias);
                            e.stopPropagation;
                        }}
                    />
                </div>
                <div className={`${topoContentrefix}-cell-box-main`}>{name}</div>
                <div className={`${topoContentrefix}-cell-box-bottom`}>
                    <span>{msg('deviation')}:{fmt(NumberFactor(NumberUtil.removeCommas(deviationText), 100), 2, false)}%</span>
                </div>
            </div>
        </div>
    }, [devices, stringStateSelected, STDS.dynDataMap]);

    const cellSizeAndPositionGetter = useCallback((...[{index}, width, height]) => {
        // 去除滚动条宽度
        const offsetWidth = width - 10;
        // 与样式保持一致, 20为了留白
        const cellWidth = 132 + 20;
        // 与样式保持一致, 20为了留白
        const cellHeight = 80 + 20;
        const cellNumberPerRow = parseInt(offsetWidth / cellWidth) || 1;
        const restWidth = offsetWidth - cellNumberPerRow * cellWidth;
        let cellGap = 0;
        if(restWidth > 0){
            cellGap = restWidth / cellNumberPerRow;
        }
        const cellOuterWidth = cellWidth + cellGap;
        const cellInRow = Math.ceil((index + 1) / cellNumberPerRow);

        return {
            height: cellHeight, 
            width: cellOuterWidth, 
            x: (index % cellNumberPerRow) * cellOuterWidth, 
            y: (cellInRow - 1) * cellHeight 
        };
    }, []);

    let midNumber = useMemo(() => {
        if(stringStateSelected){
            const selectedDeviceCurPoints = STDS.currentMap[stringStateSelected.getAlias()] || [];
            const valueMap = STDS.dynDataMapSide;
            const pointNumberArray = selectedDeviceCurPoints
                .filter(o => valueMap[o.point_alias] && String(valueMap[o.point_alias].status_value) !== String(ELECTRIC_DISABLED_VALUE))
                .map(i => NumberUtil.removeCommas(valueMap[i.point_alias] && valueMap[i.point_alias].display_value));
            return getMidNumber(pointNumberArray);
        }
    }, [stringStateSelected, STDS.currentMap, STDS.dynDataMapSide]);

    return <div className={`${topoContentrefix}-wrap`}>
        <div className={`${topoContentrefix}-main`}>
            <div className={`${topoContentrefix}-cell-wrap`}>
                <AutoSizer onResize={({width, height}) => {
                    if(collectRef.current){
                        collectRef.current.recomputeCellSizesAndPositions();
                    }
                }}>
                {({width, height}) => {
                    return (
                        <Collection
                            ref={collectRef}
                            cellCount={devices.length}
                            cellRenderer={renderCell}
                            cellSizeAndPositionGetter={(args) => {
                                return cellSizeAndPositionGetter(args, width, height);
                            }}
                            height={height - 1}
                            width={width - 1}
                            verticalOverscanSize={12}
                            noContentRenderer={() => {
                                return <div style={{
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666'
                                }}>{msg('noData')}</div>;
                            }}
                            onSectionRendered={({ indices }) => {
                                scrollStartTime.current = new Date().getTime();
                                
                                setTimeout(() => {
                                    if(new Date().getTime() - scrollStartTime.current > 799){
                                        setIndices(indices);
                                    }
                                }, 800);
                            }}
                        />
                    )
                }}
                </AutoSizer>
            </div>
        </div>
        <div className={`${topoContentrefix}-side`}>
            {stringStateSelected && <div className={`${topoContentrefix}-cell-side`}>
                {
                    (STDS.currentMap[stringStateSelected.getAlias()] || []).map(i => {
                        const pointAlias = i.point_alias;
                        const electricValue = NumberUtil.removeCommas(STDS.dynDataMapSide[pointAlias] && STDS.dynDataMapSide[pointAlias].display_value);
                        const over = over30Percent(midNumber, electricValue);
                        const disabled = STDS.dynDataMapSide[pointAlias] && String(STDS.dynDataMapSide[pointAlias].status_value) === String(ELECTRIC_DISABLED_VALUE);
                        
                        let cls = "";
                        if (disabled) {
                            cls = 'disabled';
                        } else if (over) {
                            cls = 'over';
                        }
                        return <div 
                            key={pointAlias} 
                            className={`${cls}`}
                        >
                            <div 
                                title={i.name}
                            >{matchSuffixNumber(pointAlias).padStart(2, 0)}</div>
                            <div>{disabled ? '/' : `${fmt(electricValue, 2, false)}A`}</div>
                        </div>
                    })
                }
            </div>}
        </div>
        <DeviceTooltip tipInfo={tipInfo}/>
    </div>
});


