import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { transaction } from 'mobx';
import { observer } from 'mobx-react';
import { _pageDao, daoIsOk } from '@/common/dao';
import { useStores } from '../../stores';
import { IAssetState } from '../../stores/assetStore';
import WidgetMap from '@/components_widgets/define';
import { IBlock, ITpl } from './index.d';
import styles from './index.mscss';

const initData = {container: {width: 1920, height: 1080}, block: []};

function IndexPage(props) {
    const globalStores = useStores();
    const assetStore: IAssetState = globalStores.assetStore;
    const { sign, deviceAlias, deviceSign } = useParams();
    const [isMob, setIsMob] = useState(false);
    const [tpl, setTpl] = useState<ITpl>(initData);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(false);

        (async () => {
            let pageSign = sign;
            let pageTplId = '';
            let deviceTplId = '';
            let tplObj = initData;

            // 设备页面
            if(deviceAlias){
                globalStores.pageStore.setLoading(true);

                const deviceRes = await _pageDao.getPageTpl({sign: deviceSign});
                if(deviceRes.data && deviceRes.data.id){
                    deviceTplId = deviceRes.data.id;
                }

                if(deviceRes.data && deviceRes.data.content){
                    tplObj = JSON.parse(deviceRes.data.content);
                }

                globalStores.pageStore.setLoading(false);
            }
            // 通用页面
            else if(pageSign){
                globalStores.pageStore.setLoading(true);
                const res = await _pageDao.getPageTpl({sign: pageSign});
                if(res.data && res.data.id){
                    pageTplId = res.data.id;
                }
                if(res.data && res.data.content){
                    tplObj = JSON.parse(res.data.content);
                }
                globalStores.pageStore.setLoading(false);
            }
    
            transaction(() => {
                assetStore.setDeviceSign(deviceSign || '');
                console.log('deviceSign', deviceSign);
                assetStore.setDeviceAlias(deviceAlias || '');
                console.log('deviceAlias', deviceAlias);
                assetStore.setDeviceTplId(deviceTplId || '');
                console.log('deviceTplId', deviceTplId);
                assetStore.setPageSign(pageSign || '');
                console.log('PageSign', pageSign);
                assetStore.setPageTplId(pageTplId || '');
                console.log('pageTplId', pageTplId);
            });
            
            setTpl(tplObj);
            setMounted(true);
        })()        
    }, [sign, deviceAlias, deviceSign]);

    if(!mounted) return null;

    const containerWidth = tpl.container.width;
    const containerHeight = tpl.container.height;
    const getPcBlockStyle: (block: IBlock) => React.CSSProperties = (block: IBlock) => {
        const { top, left, zIndex, width, height } = block;

        return {
            zIndex: zIndex,
            width: `${width / containerWidth * 100}%`,
            height: `${height / containerHeight * 100}%`,
            left: `${left / containerWidth * 100}%`,
            top: `${top / containerHeight * 100}%`,
            position: 'absolute'
        }
    }

    const getMobBlockStyle: (block: IBlock) => React.CSSProperties = (block: IBlock) => {
        const { top, left, zIndex, width, height } = block;

        return {
            width: `100%`,
            height: `100%`,
            flex: 1
        }
    }

    const blocks: IBlock[] = tpl.block || [];
    console.log('blocks',blocks);
    

    // TODO 小组件参数可以通用归类后存入store, 监听动态获取数据

	return !(assetStore.currentPageSign || assetStore.currentWidgetAssetAlias)
    ? <div>No page</div>
    : <div className={`${styles.page_tpl} ${isMob ? styles.page_auto : ''}`} key={assetStore.currentPageId}>
        {
            blocks.map((block: IBlock) => {
                let { id, name, props, width, height } = block;
                const Comp = WidgetMap[name];
                if(!Comp){
                    console.error('widget component not registered:', name);
                }
                return <div key={id}>
                    <div 
                        className={styles.panel}
                        style={
                            !isMob 
                            ? getPcBlockStyle(block) 
                            : getMobBlockStyle(block)
                        }
                    >
                        <Comp 
                            key={`${assetStore.currentPageId}_${assetStore.currentWidgetAssetAlias}`}
                            isDemo={false} 
                            nodeAlias={assetStore.currentNodeAlias}
                            assetAlias={assetStore.currentWidgetAssetAlias}
                            pageId={assetStore.currentPageId}
                            pageSign={assetStore.currentPageSign}
                            id = {id} 
                            width={width}
                            height={height}
                            tplContainerWidth={tpl.container.width}
                            tplContainerHeight={tpl.container.height}
                            configure={{...props}} 
                            editable={globalStores.pageStore.editable}
                            globalStores={globalStores}
                        />
                    </div>
                </div>;
            })
        }
    </div>;
}

export default observer(IndexPage);