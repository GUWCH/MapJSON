import React, { useEffect, useState } from 'react';
import { reaction } from 'mobx';
import { observer, Provider, Observer } from 'mobx-react';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import { notify } from 'Notify';
import EnvLoading from 'EnvLoading';
import ScadaCfg from '@/common/const-scada';
import { _dao, daoIsOk } from '@/common/dao';
import StoresContext, { useStores } from './stores';
import Page from './pages/Page';
import { msg, isZh, GRADE } from './constants';

import '../common/css/app.scss';
import styles from './style.mscss';

if(isZh){
    moment.locale('zh-cn');
}

const isDev: boolean = process.env.NODE_ENV === 'development';

function App (props){
    const {isFarm=false, container=null} = props;
    const stores = useStores();
    const [mounted, setMounted] = useState(false);
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        /**
         * 节点设置
         */

        let nodeAlias: any = ScadaCfg.getCurNodeAlias() || '';
        if (isDev) {
            nodeAlias = 'USCADA.Farm.Statistics';
        }
        stores.pageState.setNodeAlias(nodeAlias);

        /**
         * 类型设置, 场站也泛化为设备类型
         */

        async function fetchDeviceType() {
            const res = await _dao.getDeviceType(nodeAlias);

            let isGetted = false;
            if(daoIsOk(res) && Object.keys(res.data).length > 0){
                const rd: IDeviceModel = res.data;
                const deviceTypes = Object.keys(rd)
                // 其它和统计过滤掉
                .filter(key => ['4', '5'].indexOf(String(key)) === -1)
                .map(key => {
                    let dt: IDeviceModelValue = rd[key];
                    dt.bay_value = String(dt.bay_value);
                    return dt;
                });

                if(deviceTypes.length > 0){
                    stores.pageState.setDeviceTypes(deviceTypes);
                    stores.pageState.setDeviceType(deviceTypes[0].bay_value);
                    isGetted = true;
                }
            }
            
            if(!isGetted){
                notify(msg('noDevice'));
            }
        }

        if(!isFarm){
            stores.pageState.setGrade(GRADE.DEVICE);
            fetchDeviceType();
        }else{
            stores.pageState.setGrade(GRADE.FARM);
            stores.pageState.setDeviceType('farm'); // 必须farm, 作为请求参数
        }
        
        /**
         * 场站类型设置, 只允许单类型
         */

        async function fetchData() {
            stores.pageState.setLoading(true);
            const res = await _dao.getTreeList('onlytofac', nodeAlias);

            // 多个场站类型的节点不允许渲染
            const facTypes: String[] = [];
            let curNode;
            if(daoIsOk(res)){
                (res.data || [])
                .map(ele => {
                    if(ele.alias === nodeAlias) curNode = ele;
                    return ele;
                })
                .filter(ele => ele.node_type === 'FACTORY')
                .map((ele: {fac_type: String}) => {
                    const facType: String = ele.fac_type;
                    facTypes.indexOf(facType) === -1 && facTypes.push(facType);
                });
            }
            stores.pageState.setLoading(false);
            stores.pageState.setSiteType(facTypes.toString());
            if(curNode){
                stores.pageState.setNodeType(curNode.node_type);
            }
            
            setMounted(true);
            setAvailable(isDev ? true : facTypes.length === 1);
        }
        fetchData();

        const reactionDisposer = reaction(
            () => [stores.pageState.nodeType, stores.pageState.siteType], 
            (arr) => {
                if(arr[0] && arr[1]){
                    console.log('reactionDisposer');
                    stores.dataState.getUserOp();
                    stores.dataState.fetchPageBottomTabConfigAndModel();
                }
            }
        );

        return () => {
            reactionDisposer();
        }
        
    }, []);
    
    return (
        <Provider {...stores} >
            <StoresContext.Provider value={{...stores, isDev}}>
                {
                    mounted 
                    ? available 
                        ? <ConfigProvider locale={isZh ? zhCN : enUS}><Observer>{() => <Page />}</Observer></ConfigProvider>
                        : <div className={styles.noavail}>{msg('unavailable')}</div> 
                    : <div></div>
                }
                <Observer>{() => <EnvLoading isLoading={stores.pageState.isLoading} container={container}/>}</Observer>
            </StoresContext.Provider>
        </Provider>
    );
}

export default observer(App);
