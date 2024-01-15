import React, { useState } from 'react';
import { observer, Provider, Observer } from 'mobx-react';
import EnvLoading from 'EnvLoading';
import { AntdProvider } from '@/common/antd.provider';
import StoresContext, { useStores } from './stores';
import PageRoutes from './routes';
import '../common/css/app.scss';

const isDev: boolean = process.env.NODE_ENV === 'development';

function App (props){
    const {container=null} = props;
    const stores = useStores();
    const [mounted, setMounted] = useState(true);
    const [available, setAvailable] = useState(true);
    
    return (
        <Provider {...stores} >
            <StoresContext.Provider value={{...stores, isDev}}>
                {
                    mounted 
                    ? available 
                        ? <AntdProvider>
							<Observer>{() => <PageRoutes />}</Observer>
						  </AntdProvider>
                        : <div style={{}}>{'unavailable'}</div> 
                    : <div></div>
                }
                <Observer>{
					() => 
					<EnvLoading 
						isLoading={stores.pageStore.isLoading} 
						container={container}
					/>
				}</Observer>
            </StoresContext.Provider>
        </Provider>
    );
}

export default observer(App);

