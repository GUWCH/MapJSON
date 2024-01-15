import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { IconType, FontIcon, Icon2, PureIcon } from 'Icon';
import { _dao, daoIsOk } from '@/common/dao';
import { useMemoryStateCallback } from '@/common/util-memory';
import { combineToFullAlias, PointEvt, navTo } from '@/common/util-scada';
import ScadaCfg, { TimerInterval, CommonTimerInterval } from '@/common/const-scada';
import { NumberUtil } from '@/common/utils';
import CommonDynData from '@/components/DynData';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import DeviceSwitch from '@/components_utils/DeviceSwitch';
import { ObjectModel, DomainModel, PointModel, uIdKey } from '@/components_utils/models';
import Intl, { msgTag } from '@/common/lang';
import CompSet from './set';
import styles from './style.mscss';
import { isDevelopment } from '@/common/constants';
import {SetToken, ShowToken } from '@/components_utils/Token';

const msg = msgTag('pagetpl');

export { default as KeyInfoForm} from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IKeyInfoDefaultOptions {
    
};

export const KeyInfoDefaultOptions: IKeyInfoDefaultOptions = {
    
};

export interface IKeyInfoCfg{
    customAssetAlias?: string;
    title?: string;
    showName?: boolean;
    showSwitch?: boolean;
    switchInfo: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel;
    };
    showToken?: boolean;
    showStatus?: boolean;
    statusInfo: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel;
    };
    parameterInfo: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel;
        selectedModel?:string;
        selectedMode?:string;
    };
    operateInfo: {
        useToken?: boolean;
        isWtg?: boolean;
        useStart?: boolean;
        startValue?: string | number;
        startInfo?: {
            selectedDomain?: DomainModel;
            selectedObject?: ObjectModel;
        };
        useStop?: boolean;
        stopValue?: string | number;
        stopInfo?: {
            selectedDomain?: DomainModel;
            selectedObject?: ObjectModel;
        };
        useReset?: boolean;
        customize?: Array<{
            key: string;
            name?: string;
            name_en?: string;
            icon?: string;
            selectedDomain?: DomainModel;
            selectedObject?: ObjectModel;
            operateVal?: number; 
        }>
    };
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const KeyInfoDefaultCfg: IKeyInfoCfg = {
    customAssetAlias: '',
    title: '',
    showName: false,
    showSwitch: false,
    switchInfo: {},
    showToken: false,
    showStatus: false,
    statusInfo: {},
    parameterInfo: {},
    operateInfo: {
        useToken: false,
        isWtg: false,
        useStart: false,
        startInfo: {},
        startValue: 0,
        useStop: false,
        stopValue: 0,
        stopInfo: {},
        useReset: false,
        customize: []
    }
};

export type CacheItem = {
    key: string;
    id?: string;
    value: string;
    title: string;
    attrs?: {
        nameCn: string;
        nameEn: string;
        valueMap: {
            [key: number | string]: {
                icon: typeof IconType[keyof typeof IconType];
                background: string;
            }
        };
        icon: typeof IconType[keyof typeof IconType];
        background: string;
        convert: {
            coefficient: number | string;
            unit: string;
            decimal: number | string;
        }
    }
};

export type CacheConfig = {
    statusInfo: CacheItem[];
    parameterInfo: CacheItem[];
    operateInfo: {
        useToken?: boolean;
        useStart?: boolean;
        useStop?: boolean;
        useReset?: boolean;
        [key: string]: boolean | undefined;
    }
}

const defaultCacheConfig: CacheConfig = {
    statusInfo: [],
    parameterInfo: [],
    operateInfo: {
        useToken: false,
        useStart: false,
        useStop: false,
        useReset: false,
    }
};

export function KeyInfo(props: Omit<WidgetProps, 'configure'> & {
    configure: IKeyInfoCfg;
    switchCb?: (deviceAlias: string) => void
}) {
    const navigator = useNavigate();
    const { configure, id, pageId, pageSign, assetAlias, nodeAlias, isDemo, switchCb } = props;
    const { 
        showName, 
        showSwitch, 
        switchInfo,
        showToken, 
        showStatus, 
        statusInfo={}, 
        parameterInfo={}, 
        operateInfo={} 
    } = configure;
    const statusPoints = statusInfo.selectedObject?.selectedPoint || [];
    const paramPoints = parameterInfo.selectedObject?.selectedPoint || [];

    const [cacheConfig, setCacheConfig] 
        = useMemoryStateCallback<CacheConfig>(defaultCacheConfig, pageId, id);
    const [dynDataMap, setDynDataMap] = useState({});
    const [token, setToken] = useState<IToken[]>([]);

    const cacheStatusInfo = cacheConfig.statusInfo;
    const cacheParameters = cacheConfig.parameterInfo;
    const cacheOperate = cacheConfig.operateInfo;

    const allPoints: PointModel[] = [].concat(statusPoints).concat(paramPoints);
    const getPoint = (cacheKey) => {
        return allPoints.find(p => p[uIdKey] === cacheKey);
    }
    const getPointAlias = useCallback((point) => {
        return combineToFullAlias(assetAlias, point.alias);
    }, [assetAlias]);
    const getPointKey = useCallback((point) => {
        const tableNo = point.table_no;
        const fieldNo = point.field_no;
        return `1:${tableNo}:${getPointAlias(point)}:${fieldNo}`;
    }, [assetAlias]);

    useEffect(() => {
        let keysList = Object.keys(cacheOperate);
        let operateList = ['useToken', 'useStart', 'useStop', 'useReset']
            .concat((operateInfo.customize || []).map(item => item.key));
            
        // 清除缓存中存在，但配置中已删除的自定义操作
        let needSynchronize = false;
        keysList.map(key => {
            if(operateList.indexOf(key) === -1) needSynchronize = true;
        });

        if(needSynchronize){
            let tempCacheOperate = {};
            keysList.map(key => {
                if(operateList.indexOf(key) > -1) tempCacheOperate[key] = cacheOperate[key];
            });

            setCacheConfig(Object.assign({}, cacheConfig, {operateInfo: tempCacheOperate}), () => {})
        }
        
    }, [cacheOperate])

    useRecursiveTimeoutEffect(
        () => {
            return [
                () => _dao.getToken(nodeAlias), 
                (res) => {
                    if(daoIsOk(res)){
                        setToken(res.data.filter(d => {
                            // 储能特殊处理
                            if(String(switchInfo.selectedObject?.type) === '22'){
                                return d.alias === (assetAlias || '').split('.').slice(0, 2).join('.');
                            }else{
                                return d.alias === assetAlias;
                            }                             
                        }));
                    }
                }, 
                () => {
                    setToken([]);
                },
            ];
        }, 
        nodeAlias && showToken ? CommonTimerInterval : 0, 
        [showToken, nodeAlias, assetAlias, switchInfo.selectedObject?.type]
    );

    useRecursiveTimeoutEffect(
        () => {
            return [
                () => {
                    const cachePoints = [].concat(cacheStatusInfo).concat(cacheParameters);
                    const reqBody: any[] = [];
                    cachePoints.map((p) => {
                        const { key, attrs={} } = p;
                        const { decimal=3 } = attrs;
                        const point = getPoint(key);
        
                        if(!point) return;
        
                        reqBody.push({
                            id: '',
                            key: getPointKey(point),
                            decimal: decimal
                        });
                    });
        
                    return _dao.getDynData(reqBody);
                }, 
                (res) => {
                    if(daoIsOk(res)){
                        const newDynDataMap = {};
                        res.data.map((d) => {
                            delete d.timestamp;
                            newDynDataMap[d.key] = d;
                        });
                        setDynDataMap((prev) => Object.assign({}, prev, newDynDataMap));
                    }
                }
            ];
        }, 
        assetAlias && cacheStatusInfo.length + cacheParameters.length ? TimerInterval as number : 0, 
        [assetAlias, cacheStatusInfo, cacheParameters]
    );

    // 切换资产事件
    const toTarget = (deviceAlias) => {
        if(typeof switchCb === 'function'){
            switchCb(deviceAlias);
            return;
        }
        navTo(deviceAlias, {listSign: pageSign, navigate: navigator});
    }

    const toStart = () => {
        if(operateInfo.isWtg){
            PointEvt.ykyt('PopupMenu 86', `1:433:${assetAlias}.WTUR:4`);
        }else{
            
            const point = operateInfo.startInfo?.selectedObject?.selectedPoint;
            const val = operateInfo.startValue;
            if(!point) return;
            PointEvt.ykyt(`PopupMenu 30${NumberUtil.isValidNumber(val) ? ` ${val}` : ''}`, getPointKey(point));
        }
        return false;
    }

    const toStop = () => {
        if(operateInfo.isWtg){
            PointEvt.ykyt('PopupMenu 87', `1:433:${assetAlias}.WTUR:4`);
        }else{
            const point = operateInfo.stopInfo?.selectedObject?.selectedPoint;
            const val = operateInfo.stopValue;
            if(!point) return;
            
            PointEvt.ykyt(`PopupMenu 30${NumberUtil.isValidNumber(val) ? ` ${val}` : ''}`, getPointKey(point));
        }
        return false;
    }

    const toReset = () => {
        if(operateInfo.isWtg){
            PointEvt.ykyt('PopupMenu 88', `1:433:${assetAlias}.WTUR:4`);
        }
        return false;
    }

    const toCustomizeOperate = (customizeItem) => {
        const point = customizeItem?.selectedObject?.selectedPoint;
        const val = customizeItem.operateVal;
        if(!point) return;
        
        PointEvt.ykyt(`PopupMenu 30${NumberUtil.isValidNumber(val) ? ` ${val}` : ''}`, getPointKey(point));
        return false;
    }

    const toSetToken= (e) => {
        // PointEvt.popMenu点击事件会检测最后一个数字
        const deviceKey = `1:${switchInfo.selectedObject?.table_no}:${assetAlias}:1`;
        if(isDevelopment){
            SetToken(assetAlias, undefined);
        }else{
            PointEvt.popMenu(deviceKey, e.nativeEvent);
        }
        return false;
    }

    return <div className={styles.keyinfo}>
        {showName && <div className={styles.left}>
            <div className={styles.switchWrap}>
                <DeviceSwitch 
                    showSwitch={showSwitch}
                    defaultAssetName={isDemo ? 'Test' : ''}
                    pageNodeAlias={nodeAlias}
                    assetAlias={assetAlias}
                    tableNo={switchInfo.selectedObject?.table_no}
                    type={switchInfo.selectedObject?.type}
                    switchCallback={(alias) => {
                        toTarget(alias);
                    }}
                    nameEllipsis={true}
                />
            </div>
            {
                showStatus && cacheStatusInfo.length > 0 &&
                <div className={styles.status}>
                    {cacheStatusInfo.map((status) => {
                        const { attrs={}, key } = status;
                        const valueMap = attrs?.valueMap || {};
                        const point = getPoint(key);
                        if(!point) return;

                        const dynKey = getPointKey(point);
                        const value = dynDataMap[dynKey] || {};
                        const valueStyle = valueMap[value.raw_value] || {};

                        return <CommonDynData 
                            key={dynKey}
                            showName={false}
                            point={{
                                nameCn: point.name_cn,
                                nameEn: point.name_en,
                                aliasKey: dynKey,
                                tableNo: point.table_no,
                                fieldNo: point.field_no,
                                unit: point.unit,
                                decimal: NumberUtil.isValidNumber(point.decimal) ? Number(point.decimal) : 2
                            }}
                            value={value}
                            valuePropName={'display_value'}
                            transform={Object.assign({}, JSON.parse(JSON.stringify(attrs)), {
                                icon: valueStyle.icon,
                                background: valueStyle.background
                            })}
                        />;
                    })}
                </div>
            }
            {
                showToken &&
                <div className={styles.tokenShow}>
                    <ShowToken tokenData={token}/>
                </div>
            }
        </div>}
        <div className={styles.right}>
            {Array.isArray(cacheParameters) && cacheParameters.length 
                ? <div className={styles.param}>
                    {cacheParameters.map((p) => {
                        const { key, attrs={} } = p;
                        const point = getPoint(key);

                        if(!point) return null;

                        const dynKey = getPointKey(point);

                        return <CommonDynData 
                            key={dynKey}
                            nameColon={true}
                            point={{
                                nameCn: point.name_cn,
                                nameEn: point.name_en,
                                aliasKey: dynKey,
                                tableNo: point.table_no,
                                fieldNo: point.field_no,
                                unit: point.unit,
                                decimal: NumberUtil.isValidNumber(point.decimal) ? Number(point.decimal) : 2
                            }}
                            value={dynDataMap[dynKey]}
                            transform={attrs}
                        />;
                    })}
                </div> 
                : null
            }
            {cacheOperate.useStart && 
                <div className={styles.start}>
                    <button
                        onClick={toStart}
                    >
                        <FontIcon type={IconType.START}/>
                        <span>{msg('KEY_INFO.useStart')}</span>
                    </button>
                </div>
            }
            {cacheOperate.useStop && 
                <div className={styles.stop}>
                    <button
                        onClick={toStop}
                    >
                        <FontIcon type={IconType.STOP}/>
                        <span>{msg('KEY_INFO.useStop')}</span>
                    </button>
                </div>
            }
            {cacheOperate.useReset && operateInfo.isWtg && 
                <div className={styles.reset}>
                    <button
                        onClick={toReset}
                    >
                        <FontIcon type={IconType.RESET}/>
                        <span>{msg('KEY_INFO.useReset')}</span>
                    </button>
                </div>
            }
            {
                operateInfo.customize?.filter(item => cacheOperate[item.key]).map(item => {
                    return <div className={styles.customize}>
                        <button
                            onClick={() => toCustomizeOperate(item)}
                        >
                            {item.icon && <FontIcon type={IconType[item.icon]}/>}
                            <span>{Intl.isZh ? item.name : item.name_en}</span>
                        </button>
                    </div>
                })
            }
            {cacheOperate.useToken && 
                <div 
                    className={styles.token}
                    onClick={toSetToken}
                >
                    <PureIcon type={IconType.DATA_SUBSCRIPTION} tip={msg('KEY_INFO.setToken')} />
                </div>
            }
            <div>
                <CompSet 
                    config={configure} 
                    cache={cacheConfig}
                    onConfirmed={(data) => {
                        setCacheConfig(data, () => {});
                    }}
                >
                    <span style={{display: 'flex', cursor: 'pointer'}}>
                        <PureIcon type={IconType.SETTING} tip={msg('KEY_INFO.set')} />
                    </span>
                </CompSet>
            </div>
        </div>
        
    </div>;
}