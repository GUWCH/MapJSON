import React, { useEffect, useState } from 'react';
import { observer, Provider, Observer } from 'mobx-react';
import StoresContext, { useStores } from './stores';
import StorageCfg from './defaultCfg';
import PageRoutes from './routes';
import {ConfigProvider} from 'antd';
import { isZh } from './constants';
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import '../common/css/app.scss';

function App (props){
    const stores = useStores();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        (async ()=>{
            const res = await fetch('../project/fire_control.json?_=' + Math.random());
            if(res.ok){
                try{
                    const cfg = await res.json();
                    stores.store.setCfg(cfg);
                    setMounted(true);
                }catch(e){
                    console.error(e);
                }
            }else{
                stores.store.setCfg(StorageCfg);
                setMounted(true);
            }
        })()
    }, []);

    if(!mounted) return null;
    
    return (
        <Provider {...stores} >
            <StoresContext.Provider value={{...stores}}>
                <ConfigProvider locale={isZh ? zhCN : enUS}>
                    <Observer>{() => <PageRoutes />}</Observer>
                </ConfigProvider>
            </StoresContext.Provider>
        </Provider>
    );
}

export default observer(App);

