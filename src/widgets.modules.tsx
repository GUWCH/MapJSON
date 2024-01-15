/* eslint-disable */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { observer, Provider, Observer } from 'mobx-react';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import EnvLoading from 'EnvLoading';
import Intl from './common/lang';
import StoresContext, { useStores } from './page_tpl/stores';
import Widgets from './components_widgets/define';
import './common/css/app.scss';

if(Intl.isZh){
    moment.locale('zh-cn');
}

const isDev: boolean = process.env.NODE_ENV === 'development';

function App (appProps){
    const {container=null, widgetName, props} = appProps;
    const stores = useStores();
    const [mounted, setMounted] = useState(false);
    const [available, setAvailable] = useState(true);

    useEffect(() => {
        stores.assetStore.nodeAlias = props.alias;
        stores.assetStore.setPageSign(props.sign);
        stores.assetStore.setPageTplId(props.sign);
        setMounted(true);
    }, [])

    if(!widgetName || !Widgets[widgetName])return null;

    const AppWidget = Widgets[widgetName];
    
    return (
        <Provider {...stores} >
            <StoresContext.Provider value={{...stores, isDev}}>
                {
                    mounted 
                    ? available 
                        ? <ConfigProvider locale={Intl.isZh ? zhCN : enUS}>
							<Observer>{() => 
                                <AppWidget 
                                    id={props.id} 
                                    pageId={stores.assetStore.currentPageId}
                                    pageSign={stores.assetStore.currentPageSign}
                                    assetAlias={stores.assetStore.currentWidgetAssetAlias} 
                                    configure={props.props || {}} 
                                    key={`${stores.assetStore.currentPageId}_${stores.assetStore.currentWidgetAssetAlias}`}
                                    isDemo={false} 
                                    nodeAlias={stores.assetStore.currentNodeAlias}
                                />
                            }</Observer>
						  </ConfigProvider>
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

const AppWrap =  observer(App);

export const AppWidget = function (dom, widgetName, appProps) {
	if (!dom || !widgetName || !appProps) {
		return;
	}

	ReactDOM.render(
        <AppWrap 
            container={dom}
            widgetName={widgetName}
            props={appProps}
        />, dom
    );
}

/* eslint-enable */