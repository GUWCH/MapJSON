import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import StoresContext, { useStores } from './stores';
import SolarCfg from './defaultCfg';
import { ConfigProvider } from 'antd';
import { isZh } from './constants';
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import '@/common/css/app.scss';
import { StoreCfg } from './stores/store';

function App() {
    const stores = useStores();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const res = await fetch('../project/solar_site.json?_=' + Math.random());
            if (res.ok) {
                try {
                    const cfg = await res.json();
                    stores.store.setCfg(cfg);
                    setMounted(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                stores.store.setCfg(SolarCfg as StoreCfg);
                setMounted(true);
            }
        })()
    }, []);

    if (!mounted) return null;

    return (
        <StoresContext.Provider value={{ ...stores }}>
            <ConfigProvider locale={isZh ? zhCN : enUS}>
                <Outlet />
            </ConfigProvider>
        </StoresContext.Provider>
    );
}

export default App;

