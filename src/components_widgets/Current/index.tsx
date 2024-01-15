import React, { useEffect, useRef, useState } from 'react';
import ResizeObserver from 'rc-resize-observer';
import { Observer } from 'mobx-react';
import _ from 'lodash';
import moment from 'moment';
import PageCard from '../../components_utils/Card'
import { DateUtil, getAssetAlias } from '@/common/utils';
import {EmptyList, LegalData, _dao} from '@/common/dao';
import {CommonHisTimerInterval, CommonTimerInterval} from '@/common/const-scada';
import { NumberFactor } from "@/common/util-scada";
import EnvLoading from "EnvLoading";
import {getPointsAlias} from '../common/constants/points';
import { ObjectModel, DomainModel } from '@/components_utils/models';
import Header from'./header';
import Disperse from './disperse';
import BranchCurrent from './current';
import {
    DEFAULT_CUR, 
    UNUSED_NO, 
    HistoryCurveReq, 
    disperseConfigReq,
    DISPERSE,
    FIELD_NAME,
    VALUE_FIELD,
    DEFAULT_DISPERSE,
    CURRENT
} from './constant';

export {default as CurrentForm} from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface ICurrentDefaultOptions {
    
};

export const CurrentDefaultOptions: ICurrentDefaultOptions = {

};

export interface DisperseProps {
    selectedDomain?: DomainModel;
    selectedObject?: ObjectModel;
    threshold?: number;
}

interface ICurrentCfg{
    customAssetAlias?: string;
    title?: string;
    types?: Array<string>;
    curAlias?: string;
    disperseProps?: DisperseProps;
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const CurrentDefaultCfg: ICurrentCfg = {

};

const isDev: boolean = process.env.NODE_ENV === 'development';

/**
 * 获取离散率限值及属性
 * @param {String} alias 
 * @returns {RET|null}
 */
export const getDisperseAttrs = async (alias) => {
    const res = await _dao.getDeviationThresold({
        points:[Object.assign({}, disperseConfigReq, {alias})]
    });

    if(LegalData(res) && Array.isArray(res.points)){
        const attrs = (res.points[0]?.attribute || []);
        for(let i = 0; i < attrs.length; i++){
            const {field_name, field_val, is_valid, field_no, table_no} = attrs[i] || {};

            if(field_name === FIELD_NAME){
                return {
                    updateAttrs: {field_name, field_no, table_no, field_val: ''},
                    valueField: VALUE_FIELD,
                    value: field_val, 
                    valid: !!is_valid
                };
            }
        }
    }

    return null;
};

export function Current(props: Omit<WidgetProps, 'configure'> & {configure: ICurrentCfg}) {
    const { assetAlias = '', configure, scale, isDemo } = props;
    const { customAssetAlias, title='', types = [], disperseProps, curAlias = DEFAULT_CUR } = configure;
    const {selectedObject = {}, threshold = DEFAULT_DISPERSE} = disperseProps || {};

    const quota = selectedObject?.selectedPoint || {};

    const finalAssetAlias = isDev ? "SD1.Matrix001.CBX001.INVT005" 
        : getAssetAlias(assetAlias, customAssetAlias);

    const [dynValueMap, setDynValueMap] = useState({});
    const [chartData, setChartData] = useState([]);
    const [deviationThresoldValueMap, setDeviationThresoldValueMap] = useState({});
    const [isDisperseSetting, setIsDisperseSetting] = useState(false);
    const [isCurrentSetting, setIsCurrentSetting] = useState(false);
    const [isLoading, setIsloading] = useState(false);
    const [isMounted, setIsMounted] = useState(isDemo ? true : false);
    const currentPoints = useRef([]);
    const invalidCurrentPoints = useRef([]);
    const hisTimer = useRef(null);
    const dynTimer = useRef(null);
    const ec = useRef(null);
    const containerRef = useRef(null);

    const fetchCurrentTrend = (data, disperseKey) => {
        const startTime = DateUtil.getStdNowTime(true);
        const endTime = `${moment().add(1, 'days').format('YYYY-MM-DD')} 00:00:00`;
        return _dao.getCurve(Object.assign({}, HistoryCurveReq, {
            start_time: startTime,
            end_time: endTime,
            interval_type: 0,
            sample_cycle: 300,
            curve: data.map(o=>({...o,sub_type:"4097"}))
        }))
        .then(res => {
            if (!EmptyList(res)) {
                /* res.data=res.data.map(d => {
                    d.Points = d.Points.map(e => {
                        e.y = '12.345'
                        return e;
                    });
                    return d;
                }) */
                setChartData(res.data.map(d => {
                    let { key } = d;
                    if(key === disperseKey){
                        d.Points = d.Points.map(ele => {
                            ele.y = NumberFactor(ele.y, 100, 2);
                            return ele;
                        });
                        return d;
                    }
                    return d;
                }));
            }
        })
    }

    const reqHisData = () => {
        const disperseKey = getPointsAlias(finalAssetAlias, quota, true);

        let reqContent = currentPoints.current.filter(point => { // 排除掉未接支路
            return invalidCurrentPoints.current.indexOf(point.key) === -1;
        })

        disperseKey && reqContent.splice(0, 0, {
            id: '',
            decimal: 3,
            key: disperseKey
        });
        const req = () => {            
            fetchCurrentTrend(reqContent, disperseKey)
            .catch(error => console.log(error))
            .finally(() => {
                setIsMounted(true);
                setIsloading(false);
                clearTimeout(hisTimer.current);
                hisTimer.current = setTimeout(() => {
                    req();
                }, CommonHisTimerInterval);
            });
        };

        clearTimeout(hisTimer.current);
        if(reqContent.length > 0){
            req();
        }else{
            setIsloading(false);
            setIsMounted(true);
        }
    };

    const fetchDyn = (isFirst = false) => {
        if(currentPoints.current.length === 0){
            setIsMounted(true);
            return;
        } 

        let isFirstTime = isFirst;

        const dynReq = () => {
            _dao.getDynData(currentPoints.current)
            .then(res => {
                const valueMap = {};
                if (LegalData(res)) {
                    const data = res.data || [];
                    data.forEach(o => {
                        const alias = o.key.split(":")[2];
                        if (alias) {
                            valueMap[alias] = o;
                        }
                    });
                    const oldInvalidCurrentPoints = invalidCurrentPoints.current;
                    invalidCurrentPoints.current = (currentPoints.current || []).filter(p => {
                        const {status_value} = valueMap[p.key.split(":")[2]] || {};
                        return String(status_value) === String(UNUSED_NO);
                    }).map(p => p.key);

                    if(types.indexOf(DISPERSE) > -1
                    && (!_.isEqual(oldInvalidCurrentPoints, invalidCurrentPoints.current) || isFirstTime)){
                        isFirstTime = false;
                        reqHisData();
                    }else{
                        setIsloading(false);
                        setIsMounted(true);
                    }
                    setDynValueMap(valueMap);                    
                }else{
                    setIsloading(false);
                    setIsMounted(true);
                }
                return valueMap;
            })
            .finally(() => {
                clearTimeout(dynTimer.current);
                dynTimer.current = setTimeout(() => {
                    dynReq();
                }, CommonTimerInterval);
            });;
        }

        clearTimeout(dynTimer.current);
        isFirst && setIsMounted(false);
        setIsloading(true);
        dynReq();
    }

    const getDeviationThresold = async () => {
        const disperseAlias = getPointsAlias(finalAssetAlias, quota);
        if(disperseAlias){
            setIsloading(true);
            const newDeviationThresoldValueMap = await getDisperseAttrs(disperseAlias) || {};
            setIsloading(false);
            setDeviationThresoldValueMap(newDeviationThresoldValueMap);
        } 
    }

    useEffect(() => {
        return () => {
            clearTimeout(dynTimer.current);
            clearTimeout(hisTimer.current);
        }
    }, [])

    useEffect(() => {
        if(!isDemo){
            let newCurrentPoints = [];

            if(finalAssetAlias){
                _dao.getBranchCurrentPoints(finalAssetAlias, curAlias).then(points => {
                    if (points?.length > 0) {
                        newCurrentPoints = points.map(o => ({
                            id: "", 
                            decimal: 3, 
                            key: `1:${o.table_no}:${o.point_alias}:${o.field_no}` 
                        }));

                        currentPoints.current = newCurrentPoints;
                    }
                }).finally(() =>{
                    fetchDyn(true);
                });
            }else{
                setIsMounted(false);
                setIsloading(true);
                reqHisData(); 
            }

            if(types.indexOf(DISPERSE) > -1){
                getDeviationThresold();
            } 
        }

        return () => {
            clearTimeout(dynTimer.current);
            clearTimeout(hisTimer.current);
        }
        
    }, [finalAssetAlias]);

    const disperse = <Disperse 
        isMultiType = {types?.length > 1}
        title={title}
        threshold = {threshold}
        disperseProps = {disperseProps}
        chartData = {chartData}
        deviationAlias = {getPointsAlias(finalAssetAlias, quota)}
        refEc={ec}
        widthScale={scale}
        heightScale={scale}
        deviationThresoldValueMap = {deviationThresoldValueMap}
        setStatus = {isDisperseSetting}
        isDemo = {isDemo}
        closeSet = {() => {setIsDisperseSetting(false)}}
        afterUpdate = {(isOk) => {
            isOk && getDeviationThresold();
        }}
    />

    const current = <BranchCurrent 
        isMultiType = {types?.length > 1}
        title={title}
        currentPoints = {currentPoints.current}
        dynValueMap = {dynValueMap}
        setStatus = {isCurrentSetting}
        isDemo = {isDemo}
        closeSet = {() => {setIsCurrentSetting(false)}}
        beforeChange = {() => {setIsloading(true)}}
        afterChange = {(isOk) => {isOk ? fetchDyn() : setIsCurrentSetting(false)}}
    />

    return <Observer>{() => {
        return <ResizeObserver
            onResize={() => {
                if(ec.current){
                    ec.current.resize();
                }
            }}
        >
            <PageCard ref = {containerRef}>
                {(!isMounted) || !types || types.length === 0 ? null :
                    (types.length > 1 ? 
                        <Header 
                            tabs = {types}
                            disperseContent = {disperse}
                            currentContent = {current}
                            onSetClick = {(tabValue) => {
                                tabValue === DISPERSE && setIsDisperseSetting(true);
                                tabValue === CURRENT && setIsCurrentSetting(true);
                            }}
                        />
                    : 
                    types[0] === DISPERSE && disperse || types[0] === CURRENT && current)
                }
                <EnvLoading container = {containerRef} isLoading = {isLoading || !isMounted}/> 
            </PageCard>
        </ResizeObserver>
    }}</Observer>
}