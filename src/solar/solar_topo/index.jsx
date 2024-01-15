import '@/common/css/app.scss';

import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { EmptyList, LegalData, _dao } from '@/common/dao';
import EnvLoading from '@/components/EnvLoading';
import { TimerInterval } from '../../common/const-scada';
import { BAY_TYPE, DEVICE_TYPE, TreeDevice, TreeNode } from '../../common/utils';
import { getNodeInfo } from '../common_lib';
import { TopoOverview } from "./TopoOverview";
import { TopoContent } from './TopoContent';
import './style.scss';
import { 
    SITE_ALIAS, SiteOverviewQuatas, PAD_FAULT_POINT, 
    AC_CBX_FAULT_POINT, INV_FAULT_STOP_POINT, 
    INV_NO_CONN_POINT, DC_CBX_FAULT_POINT 
} from './constant';
import { COMMON_FLAG } from '../CONSTANT';

const topoAnalysisPrefix = "env-solar-topo";

export default class TopoAnalysis extends Component {

    constructor(props) {
        super(props);
        this.state = {
            siteName: '',
            loading: false,
            overviewDataMap: {},
            /**
             * 箱变间隔列表
             * @type {TreeNode[]}
             */
            padList: [],
            /**
             * 箱变拓扑列表,含集中逆变器、交流汇流箱、组串逆变器
             * @type {Map<string, (TreeNode|TreeDevice)[]>}
             */
            padTopo: {},
            /**
             * 独立集中逆变器列表
             * @type {TreeNode[]}
             */
            invList: [],
            /**
             * 独立交流汇流箱列表
             * @type {TreeNode[]}
             */
            accbxList: [],
            /**
             * 所有真实交流汇流箱(节点容器表里配置的)拓扑, 组串逆变器
             * @type {Map<string, TreeDevice[]>}
             */
            accbxTopo: {},
            /**
             * 独立组串逆变器列表
             * @type {TreeDevice[]}
             */
            aloneStrInvList: [],
            /**
             * 所有组串逆变器列表
             * @type {TreeDevice[]}
             */
            strInvList: [],
            /**
             * 所有集中逆变器的直流汇流箱列表
             * @type {TreeDevice[]}
             */
            dccbxList: [],

            /**
             * 设备数量总统计
             */
            statisticsCount: {},

            /**
             * 设备异常数量统计
             */
            abNormalStatisticsCount: {}
        }
    }

    componentDidMount() {
        if(!SITE_ALIAS) {
            console.error('No valid fac alias');
            return;
        }

        this.setState({ loading: true });
        Promise.all([this.fetchOverview(), this.getSiteName(), this.fetchData()])
            .catch(error => {
                console.log(error);
            })
            .finally(() => this.setState({ loading: false }));
        this.startTimer();
    }

    startTimer = () => {
        this.timeout = setTimeout(() => {
            this.fetchOverview().finally(this.startTimer);
        }, TimerInterval);
    }

    stopTimer = () => {
        this.timeout && clearTimeout(this.timeout);
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    /**
     * 获取场站名称
     */
    getSiteName = () => {
        _dao.getInfoByAlias(SITE_ALIAS, 'disp_name')
            .then(res => {
                if (!EmptyList(res)) {
                    this.setState({
                        siteName: res.data[0].disp_name
                    })
                }
            });
    }

    getSiteStatBay(nodeAlias){
        return `${nodeAlias}.Farm.Statistics`;
    }

    /**
     * 获取场站概览和tab1里的概览
     */
    fetchOverview = async () => {
        const facBay = this.getSiteStatBay(SITE_ALIAS);
        let data = SiteOverviewQuatas.map(o => ({
            id: "",
            key: `1:${o.tableNo}:${facBay}.${o.key}:${o.fieldNo}`,
            decimal: o.decimal
        }));

        const padFaultAlias = `${facBay}.${PAD_FAULT_POINT}`;
        const accbxFaultAlias = `${facBay}.${AC_CBX_FAULT_POINT}`;
        const invFaultAlias = `${facBay}.${INV_FAULT_STOP_POINT}`;
        const invNoConnAlias = `${facBay}.${INV_NO_CONN_POINT}`;
        const dccbxFaultAlias = `${facBay}.${DC_CBX_FAULT_POINT}`;

        const statPoint = [
            padFaultAlias,
            accbxFaultAlias,
            invFaultAlias,
            invNoConnAlias,
            dccbxFaultAlias
        ];
        data = data.concat(statPoint.map(s => ({
            id: '',
            decimal: 0,
            key: `1:62:${s}:9`
        })));

        const res = await _dao.getDynData(data);
        if (!EmptyList(res)) {
            const list = res.data;
            let dataMap = {};
            let abNormalStatisticsCount = {};
            list.forEach((o, index) => {
                const key = SiteOverviewQuatas[index] && SiteOverviewQuatas[index].key;
                if(key){
                    dataMap[key] = o.display_value;
                }else{
                    const statKey = o.key.split(':')[2];
                    const value = o.display_value.replace(/\,/g, '');

                    switch(statKey){
                        case padFaultAlias:
                            abNormalStatisticsCount[COMMON_FLAG.PAD] = value;
                            break;
                        case accbxFaultAlias:
                            abNormalStatisticsCount[COMMON_FLAG.AC_COMBINER] = value;
                            break;
                        case dccbxFaultAlias:
                            abNormalStatisticsCount[COMMON_FLAG.DC_COMBINER] = value;
                            break;
                        case invFaultAlias:
                        case invNoConnAlias:
                            let prev = abNormalStatisticsCount[COMMON_FLAG.INVERTER];
                            if(value){
                                abNormalStatisticsCount[COMMON_FLAG.INVERTER] = (prev || 0) + Number(value);
                            }else{
                                abNormalStatisticsCount[COMMON_FLAG.INVERTER] = '';
                            }
                            break;
                    }
                    
                }
            });
            this.setState({
                overviewDataMap: dataMap,
                abNormalStatisticsCount
            });
        }
    }

    fetchDeviceList = async () => {
        const res = await _dao.getAssetPoint({
            "bay_alias": SITE_ALIAS,
            "device_type": "ivt, comb",
            "point_type": 1,
            "meter_reading_type": -1
        });
        return res.data && res.data[0] && res.data[0].device || [];        
    }

    fetchBayList = async () => {
        const res = await _dao.getTreeList('', SITE_ALIAS);
        return res.data || []; 
    }

    /**
     * 拓扑关系
     * @desc -->  必须上下关系
     * @desc -x-> 非必上下关系
     * 箱变从模型上建不应同时有集中逆变器和交流汇流箱
     * 箱变 -x-> 集中逆变器 --> 直流汇流箱（其间隔是逆变器为直流汇流箱）
     * 箱变 -x-> 交流汇流箱(在节点容器表里代表真实,否则只是虚拟的不显示) -x-> 组串逆变器（其间隔非逆变器为组串逆变器）
     * 箱变 -x-> 组串逆变器（其间隔非逆变器为组串逆变器）
     */
    fetchData = () => {
        Promise.all([
            this.fetchBayList(),
            getNodeInfo()
        ])
        .then(([nodes, nodeInfo]) => {

            /**
             * 导航树对象
             * @type {TreeNode[]}
             */
            let allNodes = nodes.map(b => new TreeNode(b));
            /**
             * @type {TreeNode[]}
             */
            let padList = allNodes.filter(node => node.isNodeType(BAY_TYPE.PAD_STR));
            /**
             * @type {TreeNode[]}
             */
            let centralInvList = allNodes.filter(node => node.isNodeType(BAY_TYPE.INVERTER_STR));
            /**
             * @type {TreeNode[]}
             */
            let accbxList = allNodes.filter(node => node.isNodeType(BAY_TYPE.AC_COMBINER_STR));

            /**
             * 设备树对象
             * @type {TreeDevice[]}
             */
            let stringInv = nodeInfo.stringInv.map(device => new TreeDevice(device));
            /**
             * 设备树对象
             * @type {TreeDevice[]}
             */
            let dcCombinerInCentralInv = nodeInfo.dcCombinerInCentralInv.map(device => new TreeDevice(device));

            let padTopo = {};
            let padAliases = [];
            let padLinkIdMapAlias = {};
            let accbxTopo = {};
            let accbxAliases = [];

            let independentCentralInvList = [];
            let independentAccbxList = [];
            let independentStringInv = [];
            
            padList.map(node => {
                padAliases.push(node.getAlias());
                padLinkIdMapAlias[node.getLinkId()] = node.getAlias();
            });
            // 集中逆变器分为独立的和箱变下拓扑
            centralInvList.forEach(node => {
                let padId = node.getFeederById();
                if(padId && padLinkIdMapAlias[padId]){
                    const padAlias = padLinkIdMapAlias[padId];
                    padTopo[padAlias] = padTopo[padAlias] || [];
                    padTopo[padAlias].push(node);
                }else{
                    independentCentralInvList.push(node);
                }
            });
            // 交流汇流箱分为独立的和箱变下拓扑
            accbxList.forEach(node => {
                accbxAliases.push(node.getAlias());

                let padId = node.getFeederById();
                if(padId && padLinkIdMapAlias[padId]){
                    const padAlias = padLinkIdMapAlias[padId];
                    padTopo[padAlias] = padTopo[padAlias] || [];
                    padTopo[padAlias].push(node);
                }else{
                    independentAccbxList.push(node);
                }
            });
            // 组串逆变器分为直挂箱变下、节点容器表交流汇流箱下、虚拟间隔(非节点容器表里间隔含交流汇流箱)的箱变下和独立的
            stringInv.forEach(strInv => {
                const bayAlias = strInv.getBayAlias();
                const topAlias = strInv.getTopAlias();
                if(padAliases.indexOf(bayAlias) > -1){
                    padTopo[bayAlias] = padTopo[bayAlias] || [];
                    padTopo[bayAlias].push(strInv);
                }else if(accbxAliases.indexOf(bayAlias) > -1){
                    accbxTopo[bayAlias] = accbxTopo[bayAlias] || [];
                    accbxTopo[bayAlias].push(strInv);
                }else if(padAliases.indexOf(topAlias) > -1){
                    padTopo[topAlias] = padTopo[topAlias] || [];
                    padTopo[topAlias].push(strInv);
                }else{
                    independentStringInv.push(strInv);
                }
            });

            this.setState({
                padList,
                padTopo,
                invList: independentCentralInvList,
                accbxList: independentAccbxList,
                accbxTopo: accbxTopo,
                aloneStrInvList: independentStringInv,
                strInvList: stringInv,
                dccbxList: dcCombinerInCentralInv,
                statisticsCount: {
                    [COMMON_FLAG.PAD]: nodeInfo[COMMON_FLAG.PAD],
                    [COMMON_FLAG.AC_COMBINER]: nodeInfo[COMMON_FLAG.AC_COMBINER],
                    [COMMON_FLAG.INVERTER]: nodeInfo[COMMON_FLAG.INVERTER],
                    [COMMON_FLAG.DC_COMBINER]: nodeInfo[COMMON_FLAG.DC_COMBINER],
                }
            });
        });
    }

    render() {
        const { overviewDataMap, siteName, loading } = this.state;
        
        return (
            <div className={topoAnalysisPrefix}>
                <TopoOverview 
                    name={siteName} 
                    dataMap={overviewDataMap}
                ></TopoOverview>
                <TopoContent 
                    padList={this.state.padList}
                    padTopo={this.state.padTopo}
                    invList={this.state.invList}
                    accbxList={this.state.accbxList}
                    accbxTopo={this.state.accbxTopo}
                    aloneStrInvList={this.state.aloneStrInvList}
                    strInvList={this.state.strInvList}
                    dccbxList={this.state.dccbxList}
                    statisticsCount={this.state.statisticsCount}
                    abNormalStatisticsCount={this.state.abNormalStatisticsCount}
                ></TopoContent>
                <EnvLoading isLoading={loading}></EnvLoading>
            </div>
        )
    }
}

if (process.env.NODE_ENV === 'development') {
    ReactDOM.render(<TopoAnalysis></TopoAnalysis>, document.getElementById('center'));
} else {
    ReactDOM.render(<TopoAnalysis></TopoAnalysis>, document.getElementById('container'));
}
