import React, {useEffect, useRef, useState} from "react";
import ResizeObserver from 'rc-resize-observer';
import { Icon2, IconType } from 'Icon';
import EnvLoading from "EnvLoading";
import { useMemoryStateCallback } from '@/common/util-memory';
import PageCard from '@/components_utils/Card';
import {defaultCardProps} from '@/components_utils/Card/form';
import {
    isZh, 
    timeSetContent, 
    DEFAULT_CACHE,
    DEFAULT_VALUE
} from './constant';
import TimeSelect from './timeSelect';
import Chart from './chart';
import Set from './set';
import { getAssetAlias } from '@/common/utils';
import styles from './style.mscss';

interface ICurveCfg extends CommonConfigure {

};

interface ExternalCfg extends CommonConfigure {
    timeSelectEnable: boolean, 
    contentData: {
        tplTimeGran: string,
        tplInterval: string[],
        tplMax: number,
        tplPoints: any[],
        tplRangeNum: number,
        tplRangeUnit: string
    }[],
    [key: string]: any
}

const initConfigItem = (item, isDefaultCfg = false) => {
    let {tplTimeGran, tplInterval, tplPoints} = item;
    let includeDd = false;
    let interval = tplInterval[0] || '';
    tplPoints.map(p => {
        if(p.table_no == '35'){
            includeDd = true
        }
    })

    if(includeDd && interval === '1_min'){
        interval = tplInterval[1] || '';
    }

    return {
        timeGran: tplTimeGran,
        interval: interval,
        points: (isDefaultCfg ? (tplPoints || []).filter(point => point.isDefault) : []).map((p, index) => {
            let color = DEFAULT_VALUE.COLOR[index%5]
            let {defaultStyle = {}, ...rest} = p;
            if(index % 2 === 1){
                return {...rest, ...{axisProps: {position: 'right', axisType: 'special'}}, color, ...defaultStyle}
            }else{
                return {...rest, ...{axisProps: {position: 'left', axisType: 'special'}}, color, ...defaultStyle}
            }
        })
    }
}

const initialTransfer = (data) => {
    if(Array.isArray(data)){
        return {userConfig: data};
    }else{
        return data;
    }
}

export function Curve(widgetProps: Omit<WidgetProps, 'configure'> & {
    configure?: ICurveCfg;
    isExternal?: boolean;
    externalCfg?: ExternalCfg;
}){
    const {editable = true, id, isDemo, configure, assetAlias, pageId, scale, isExternal = false, externalCfg} = widgetProps;

    if(isExternal && !externalCfg){
        return null;
    }

    const {
        title, 
        title_en, 
        customAssetAlias = '', 
        timeSelectEnable = false, 
        contentData = [],
        ...cardProps
    } = Object.assign({}, defaultCardProps, isExternal ? externalCfg : configure);

    const finalAssetAlias = getAssetAlias(assetAlias, customAssetAlias)

    const [isConfiguring, setIsConfiguring] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef();
    const ec = useRef(null);

    let defaultUserConfig = contentData.map(ele => {
        return initConfigItem(ele, true)
    })

    const defaultCacheCfg = Object.assign(
        {},
        DEFAULT_CACHE,  
        {userConfig: defaultUserConfig}
    );

    const [cacheCfg, setCacheCfg, initialized] = useMemoryStateCallback(
        defaultCacheCfg, pageId, id, !isDemo, initialTransfer
    );
    const [mergeCacheCfg, setMergeCacheCfg] = useState(cacheCfg);
    const [dateSet, setDateSet] = useState({curDateType: '', date: null});

    useEffect(() => {
        if(isDemo) return;

        if(initialized){
            let newConfig = [];
            let userConfig = cacheCfg?.userConfig || [];

            /** 储能首页配置兼容处理 */
            if(cacheCfg && 'selected' in cacheCfg){
                userConfig = cacheCfg.selected || userConfig;
                delete cacheCfg.selected;
            }

            // 合并模板配置和用户配置
            // 模板删除
            newConfig = userConfig.filter(ele => contentData.map(item => item.tplTimeGran).indexOf(ele.timeGran) > -1);
            //模板添加
            let categoryKeyMap = {};
            let categoryKeyList: any[] = [];
            let customAssetAliasMap ={};
            contentData.map(ele => {
                if(userConfig.map(cfgItem => cfgItem.timeGran).indexOf(ele.tplTimeGran) === -1){
                    newConfig.push(initConfigItem(ele));
                }

                (ele.otherModelList || []).map(l => {
                    const {customAssetAlias = '', tplDomainId = '', tplModelId = '', key: contentKey} = l;
                    if(tplDomainId && tplModelId){
                        const oldCategoryKey = customAssetAlias + '-' + tplDomainId + '-' + tplModelId;
                        categoryKeyList.push(oldCategoryKey, contentKey);
                        categoryKeyMap[oldCategoryKey] = contentKey;
                    }

                    customAssetAliasMap[contentKey] = customAssetAlias;
                })
            })

            newConfig.map(u => {
                u.points = JSON.parse(JSON.stringify(u.points)).map(p => {
                    // 兼容以前的根据资产存储的模式
                    if(p.categoryKey && categoryKeyMap[p.categoryKey]){
                        p.key = p.key.replace(p.categoryKey, categoryKeyMap[p.categoryKey]);
                        p.categoryKey = categoryKeyMap[p.categoryKey];
                    }       
                    return p;           
                }).filter(p => { //过滤掉组态中不存在的其他模型
                    if(p.categoryKey && categoryKeyList.indexOf(p.categoryKey) === -1){
                        return false;
                    }else {
                        return true;
                    }
                }).map(p => {  //用户配置动态根据uid找到组态中对应的资产
                    if(p.customAssetAlias && p.categoryKey){
                        p.customAssetAlias = customAssetAliasMap[p.categoryKey];
                    }
                    return p;
                })
            })

            if(newConfig.length > 0){
                setDateSet(Object.assign({},
                    dateSet,
                    {curDateType: newConfig[0].timeGran}
                ))
            }

            setMergeCacheCfg(Object.assign({}, cacheCfg, {userConfig: newConfig}));
        }else{
            setMergeCacheCfg(defaultCacheCfg);
        }

        setIsLoading(!initialized);
        
    }, [initialized]);

    const getGranularOptions = () => {
        const userConfig = Array.isArray(mergeCacheCfg) ? mergeCacheCfg : (mergeCacheCfg.userConfig || []) ;
        return userConfig.map(item => {
            return {
                value: item.timeGran,
                name: timeSetContent.find(ele => ele.key === item.timeGran)?.title || item.timeGran
            }
        })
    }

    const handleTimeChange = (granularValue, time) => {
        setDateSet({
            curDateType: granularValue,
            date: time
        })
    }

    const handleConfigureChange = (isConfiguring: boolean) => {
        setIsConfiguring(isConfiguring)
    }

    const handleSetSave = (data) => {
        setCacheCfg(data);
        setMergeCacheCfg(data);
    }

    return <>
        <ResizeObserver onResize={() => {
            if(ec.current){
                ec.current.resize();
            }
        }}>
            <PageCard 
                {...cardProps}
                title={mergeCacheCfg.titleEnable ? mergeCacheCfg.titleTextCn || title : ''} 
                title_en={mergeCacheCfg.titleEnable ? mergeCacheCfg.titleTextEn || title_en : ''}
                extra={
                    <div className={styles.tool}>
                        {timeSelectEnable ? <TimeSelect 
                            contentData = {contentData}
                            granularOptions = {getGranularOptions()}
                            onChange = {handleTimeChange}
                        /> : null}
                        <div style = {!editable ? {visibility: 'hidden'} : {}}   onClick = {() => {handleConfigureChange(!isConfiguring)}}>
                            <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2> 
                        </div>
                        <Set 
                            visible={isConfiguring} 
                            timeSelectEnable = {timeSelectEnable}
                            onVisitableChange = {handleConfigureChange} 
                            onSave = {handleSetSave}
                            contentData = {contentData}
                            cacheCfg = {mergeCacheCfg}
                        />
                    </div>
                }
            >
                <div ref = {containerRef} className={styles.container}>
                    <Chart 
                        isDemo = {isDemo}
                        timeSelectEnable = {timeSelectEnable}
                        refEc={ec}
                        widthScale={scale}
                        heightScale={scale}
                        rawAssetAlias = {assetAlias}
                        totalCustomAlias = {customAssetAlias} 
                        dateSet = {timeSelectEnable ? dateSet : Object.assign(dateSet, {
                            curDateType: contentData[0]?.tplTimeGran || ''
                        })}
                        userConfig = {JSON.parse(JSON.stringify(mergeCacheCfg.userConfig || []))}
                        onLoadingChange = {(l) => {setIsLoading(l)}}
                    />
                </div>                        
            </PageCard>
        </ResizeObserver>
        <EnvLoading container = {containerRef} isLoading = {isLoading}/>
    </>
}