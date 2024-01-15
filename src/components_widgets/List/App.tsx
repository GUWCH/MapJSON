import React, { useEffect, useState } from 'react';
import { Observer } from 'mobx-react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Tabs, Skeleton } from 'antd';
import { notify } from 'Notify';
import EnvLoading from 'EnvLoading';
import { AntdProvider } from '@/common/antd.provider';
import { _dao, daoIsOk } from '@/common/dao';
import ScadaCfg from '@/common/const-scada';
import SingleStore from './stores';
import Page from './pages/Page';
import { msg, GRADE, ASSET_LEVEL, getListTabFlag} from './constants';
import { TListProps } from './types';
import '@/common/css/app.scss';

const { TabPane } = Tabs;

const isDev: boolean = process.env.NODE_ENV === 'development';

const App: WidgetElement<any> = (props: TListProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const routerParams = useParams();
    const [stores] = useState(() => new SingleStore());

    const {isDemo, configure, pageId, id, assetAlias=''} = props;
    const {type, app = 'SCADA', drillDown = true, filterFacName = true, objects = [], list = [], statistics = {}, defaultCfg = []} = configure || {};
    const {dataState, pageState} = stores;
    console.log('configure', configure)

    if(isDemo){
        return <Tabs defaultActiveKey="1" style={{height: '100%'}}>
            {
                objects.map(tab => {
                    const {model_name, model_id} = tab;
                    return (
                        <TabPane
                            tab={<span>{model_name}</span>}
                            key={model_id}
                            style={{height: '100%'}}
                        >
                            {Array.from(Array(20)).map((v, ind) => <Skeleton key={ind} avatar paragraph={{ rows: 4 }} />)}
                        </TabPane>
                    );
                })
            }
        </Tabs>;
    }
    
    useEffect(() => {
        (async () => {
            const currentNodeAlias = isDev ? 'USCADA.Farm.Statistics' : assetAlias;

            dataState.setDefaultCfg(defaultCfg);

            // 唯一标识
            dataState.setSign(pageId ?? '');
            dataState.setWidgetId(id ?? '');

            /** 设置列表里所有组态模型和页面底部统计功能的组态模型 */
            dataState.setAllListModels(list);
            dataState.setPageBottomModels(statistics?.models);

            /** 判断是当前节点是场站还是其它(统计节点) */
            pageState.setNodeAlias(currentNodeAlias);
            const res = await ScadaCfg.getNodeByParam('alias', currentNodeAlias);
            pageState.setNodeType((res && res.node_type === 'FACTORY') ? 'FACTORY' : 'OTHER');

            /**
             * 类型设置, 场站也泛化为设备类型
             */
            async function fetchDeviceType() {
                pageState.setLoading(true);
                let isGetted = false;
                const res = await _dao.getDeviceType(currentNodeAlias);
                /**其它地方跳转过来时带入参数优先处理,这个配置包含了页面底部统计功能配置和tab排序配置 */
                dataState.fetchPageBottomConfig(location);
                if(daoIsOk(res) && res.data && Object.keys(res.data).length > 0){

                    const rd: IDeviceModel = res.data;
                    const rawDeviceTypes = Object.keys(rd)
                    // 其它和统计过滤掉
                    .filter(key => ['4', '5'].indexOf(String(key)) === -1)
                    .map(key => {
                        let dt: IDeviceModelValue = rd[key];
                        dt.bay_value = String(dt.bay_value);
                        return dt;
                    });

                    const selectDeviceTypes = objects.map((obj) => {
                        let {table_no, type, model_id} = obj;
                        // 间隔, 非430则是其它设备, 只能通过表号+类型识别
                        return { modelId: model_id, type: getListTabFlag(table_no, type)};
                    })

                    const deviceTypes: IDeviceModelValue[] = [];
                    const iconCfgMapByModelId: Record<string, {key?: string, color?: string} | undefined> = 
                        list.reduce((p, c) => ({...p, [c.object?.model_id ?? '']: c.iconCfg}), {})
                    const deviceIconMap: typeof pageState.deviceIconMap = {}
                    selectDeviceTypes.map(({type, modelId}) => {
                        let temp = rawDeviceTypes.find(ele => ele.bay_value === type);
                        deviceIconMap[type] = iconCfgMapByModelId[modelId]
                        if(temp !== undefined){
                            deviceTypes.push(temp);
                        }
                    })
                    
                    if(deviceTypes.length > 0){
                        pageState.setDeviceTypes(deviceTypes);
                        pageState.setDeviceIconMap(deviceIconMap)
                        dataState.setModels();
                        const curdefaultCfg = defaultCfg.find(ele => ele.type === deviceTypes[0].bay_value);
                        curdefaultCfg && dataState.setCategoryCfg(curdefaultCfg.cfg);
                        isGetted = true;
                    }
                }

                if(!isGetted){
                    notify(msg('noDevice'));
                }

                pageState.setLoading(false);
            }

            // TODO 场站列表应该和设备一样, 可有多个
            if(type !== ASSET_LEVEL.farm){
                pageState.setGrade(GRADE.DEVICE);
                /**设备列表里是否对设备名称进行场站名称删除, 防止名称过长 */
                dataState.setFilterFacName(filterFacName);
                fetchDeviceType();
            }else{
                pageState.setSiteType(objects[0]?.type??'');//放在前面赋值,否则第一次请求获取不到正确的场站类型
                pageState.setGrade(GRADE.FARM);
                pageState.setDeviceType('farm'); // 必须farm, 作为请求参数                
                dataState.setModels();
                const curdefaultCfg = defaultCfg.find(ele => ele.type === 'farm');
                curdefaultCfg && dataState.setCategoryCfg(curdefaultCfg.cfg);
                /**其它地方跳转过来时带入参数优先处理,这个配置包含了页面底部统计功能配置和tab排序配置 */
                dataState.fetchPageBottomConfig(location);
            }

            /** 包含用户操作缓存, 需要先获取才能渲染 */
            dataState.getUserOp();
        })();

    }, []);
    
    return (
        <>
            <AntdProvider>
                <Page 
                    {...stores} 
                    app={app}
                    drillDown={drillDown}
                    isDev={isDev} 
                    navigate={navigate} 
                    routerParams = {routerParams}
                />
            </AntdProvider>
            <Observer>{() => 
                <EnvLoading isLoading={stores.pageState.isLoading}/>
            }</Observer>
        </>
    );
}

export default App;
