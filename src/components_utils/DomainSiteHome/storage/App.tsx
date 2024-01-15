import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import StoresContext, { useStores } from './stores';
import StorageCfg from './defaultCfg';
import '@/common/css/app.scss';

function App (props){
    const stores = useStores();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        (async ()=>{
            const res = await fetch('../project/storage_site.json?_=' + Math.random());
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
        <StoresContext.Provider value={{...stores}}>
            <Outlet />
        </StoresContext.Provider>
    );
}

export default App;

