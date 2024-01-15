/* eslint-disable */
import React, { useContext, useReducer, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tabs } from 'antd';

import Intl, { msgTag } from '../../common/lang';
import { LegalData, EmptyList } from '../../common/dao';
import ScadaCfg from '../../common/const-scada';
import EnvLoading from 'EnvLoading';
import { notify } from 'Notify';
import { _dao } from '../../common/dao';
import { 
    FAC_BAY_TYPE, 
    COMMON_FLAG, 
    LIST_BAY_TYPE, 
    LIST_DEVICE_TYPE 
} from '../CONSTANT';
import { getNodeInfo } from '../common_lib';
import { Actions, GlobalContext, GlobalReducer, InitialState } from './context';
import Tab from './components/tab';
import List from './components/List';
import Detail from './components/Detail';

const { TabPane } = Tabs;
const msg = msgTag('solardevice');

import '../../common/css/app.scss';
import styles from './index.mscss';

function Device(props){

    const { 
        state:{
            isLoading, isMain, tabs, mainFlag
        }, 
        dispatch
    } = useContext(GlobalContext);

    useEffect(() => {
        getTabs();
    }, []);

    /**
     * complex
     */
     const getTabs = () => {
        dispatch({ type: Actions.LOADING});

        Promise.all([_dao.getDeviceType(ScadaCfg.getCurNodeAlias()), getNodeInfo()])
        .then(([bayType, mode]) => {
            if(LegalData(bayType) && mode){

                // 这里值和定义的不一定相同, 但与属性里值相同
                let bayTypeKeys = [];
                Object.keys(bayType.data).map(key => {
                    bayTypeKeys.push(bayType.data[key][FAC_BAY_TYPE._valueKey]);
                });

                let listCategory = [
                    COMMON_FLAG.PAD,
                    COMMON_FLAG.INVERTER,
                    COMMON_FLAG.AC_COMBINER,
                    COMMON_FLAG.DC_COMBINER,
                    COMMON_FLAG.METER,
                    COMMON_FLAG.WEATHER_STATION
                ];

                let tabs = [];
                let name = '';

                listCategory.filter(c => {
                    let bayTypes = [];
                    let ok = false;

                    switch(c){
                        case COMMON_FLAG.PAD: 
                            bayTypes.push(FAC_BAY_TYPE.PAD);
                            name = msg('NAME.BXT');
                            break;                       
                        case COMMON_FLAG.AC_COMBINER:
                            bayTypes.push(FAC_BAY_TYPE.AC_COMBINER);
                            name = msg('NAME.AC_COMBINER');
                            break;                              
                        case COMMON_FLAG.WEATHER_STATION:
                            bayTypes.push(FAC_BAY_TYPE.WEATHER_STATION);
                            name = msg('NAME.WEATHER_STATION');
                            break;                                                    
                        case COMMON_FLAG.METER:
                            bayTypes.push(
                                FAC_BAY_TYPE.ENERGY_METER,
                                FAC_BAY_TYPE.GRID_METER,
                                FAC_BAY_TYPE.OTHER_METER
                            );
                            name = msg('NAME.METER');
                            break;  
                        case COMMON_FLAG.INVERTER:
                            if(mode.isCentral || mode.isString){
                                let listTypes = [];
                                if(mode.isCentral){
                                    listTypes.push(LIST_BAY_TYPE.INVERTER)
                                }
                                if(mode.isString){
                                    listTypes.push(LIST_DEVICE_TYPE.INVERTER)
                                }
                                tabs.push(new Tab(c, msg('NAME.INVERTER'), listTypes));
                                ok = true;
                            }
                            break;
                        case COMMON_FLAG.DC_COMBINER:
                            if(mode.isCentral){
                                tabs.push(new Tab(c, msg('NAME.DC_COMBINER'), [LIST_DEVICE_TYPE.DC_COMBINER]));
                                ok = true;
                            }
                            break;
                    }

                    let listTypes = [];
                    let listTypesValueKey = {};
                    Object.keys(FAC_BAY_TYPE).map(k => {
                        listTypesValueKey[FAC_BAY_TYPE[k]] = k;
                    });

                    bayTypes.map(f => {
                        let include = bayTypeKeys.includes(f) || bayTypeKeys.includes(String(f));
                        if(include){
                            ok = true;
                            listTypes.push(LIST_BAY_TYPE[listTypesValueKey[f]]);
                        }
                    });

                    if(ok && listTypes.length > 0){
                        tabs.push(new Tab(c, name, listTypes));
                    }

                    return ok;
                })

                if(tabs.length > 0){
                    let defaultTab = tabs[0];
                    if(mainFlag){
                        let matchTab = tabs.filter(tab => tab.getFlag() === mainFlag)[0];
                        if(matchTab)defaultTab = matchTab;
                    }

                    dispatch({
                        type: Actions.INITIAL,
                        tabs,
                        flag: defaultTab.getFlag()
                    });
                }
                
            }else{
                notify(msg('data_fail'));
            }
        })
        .catch(e => {
            notify(msg('data_fail'));
            console.error(e);
        })
        .finally(() => {
            dispatch({ type: Actions.UNLOADING});
        });
    }

    return (
        <div className={styles.solarDevice}>
            <div style={isMain ? {height: '100%'} : {display: 'none'}}>
                <Tabs 
                    tabBarGutter={50}
                    activeKey={mainFlag}
                    onTabClick={(key) => {
                        let tab = tabs.filter(f => f.getFlag() === key)[0];
                        dispatch({
                            mainFlag: key,
                            mainFlagName: tab.getName(),
                            mainTypes: tab.getType()
                        });
                    }}
                >
                    {
                        tabs.map(tab => {
                            return (
                                <TabPane
                                    tab={<span>{tab.getName()}</span>}
                                    key={tab.getFlag()}                                    >
                                </TabPane>
                            );
                        })
                    }
                </Tabs>
                <div style={{height: 'calc(100% - 48px)'}}>
                    {
                        tabs.map((tab, ind) => {
                            return String(mainFlag) === String(tab.getFlag()) 
                            ?  <List key={ind} hidden={!isMain}/> : null;
                        })
                    }
                </div>
            </div>

            { !isMain ? <Detail/> : null }
            
            <EnvLoading isLoading={isLoading}/>
        </div>
    );
}

function App(){
    const [state, dispatch] = useReducer(GlobalReducer, InitialState);

    return(
        <GlobalContext.Provider value={{ state, dispatch }}>
            <Device />
        </GlobalContext.Provider>
    );
}

if(process.env.NODE_ENV === 'development'){
    ReactDOM.render(<App />, document.getElementById('center'));
}else{
    ReactDOM.render(<App />, document.getElementById('container'));
}

export default App;

/* eslint-enable */