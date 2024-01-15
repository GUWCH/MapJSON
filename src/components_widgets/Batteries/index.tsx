import React, { useEffect, useRef, useState } from "react";
import { getAssetAlias } from '@/common/utils';
import ResizeObserver from 'rc-resize-observer';
import { Observer } from 'mobx-react';
import {Tabs} from 'antd';
import PageCard from '../../components_utils/Card'
import { _dao } from '@/common/dao';
import EnvLoading from "EnvLoading";
import {CommonTimerInterval} from '@/common/const-scada';
import {MODE_LIST, DEFAULT_PKNUM, VOL_TEMP, tempMock, mockData} from './constant';
import { BatteriesItem } from "./form";
import Matrix from "./dataMatrix";
import {getPointsAlias} from '../common/constants/points';
import {PointModel} from '../../components_utils/models';

export {default as BatteriesForm} from './form';

import styles from './style.mscss';

const { TabPane } = Tabs;

export const BatteriesDefaultOptions = {

}

export interface IBatteriesCfg {
    customAssetAlias?: string;
    batteriesProps?: {
        pack: PointModel;
        modes: Array<BatteriesItem>;
    }
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const BatteriesDefaultCfg: IBatteriesCfg = {

};

const isDev: boolean = process.env.NODE_ENV === 'development';

export function Batteries(props: Omit<WidgetProps, 'configure'> & {configure: IBatteriesCfg}) {
    const { assetAlias = '', configure, scale, isDemo } = props;
    const { customAssetAlias, batteriesProps = tempMock } = configure || {};

    const finalAssetAlias = isDev ? "SXCN.ESS02.BBMS01" 
    : getAssetAlias(assetAlias, customAssetAlias);

    const [isMounted, setIsMounted] = useState(isDemo ? true : false);
    const [isLoading, setIsLoading] = useState(false);
    const [pkNum, setPkNum] = useState(DEFAULT_PKNUM);
    const [data, setData] = useState({});
    const ec = useRef(null);
    const containerRef = useRef();
    const timer = useRef()

    useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        }
    }, [])

    useEffect(() => {
        const {pack, modes = []} = batteriesProps;

        const fullModeItem = modes.find(item => item.mode === 'full');
        const points = fullModeItem?.contentTypes.map(contentType => contentType.point?.selectedObject?.selectedPoint || {}) || [];

        if(isDemo){
            return;
        }

        //请求电芯电压温度数据
        if(points.length > 0){
            const fetchData = () => {
                _dao.getDataSetValue({
                    points: points.map(point => {
                        return {
                            alias: getPointsAlias(finalAssetAlias, point, false)
                        }
                    })
                })
                .then((res) => {
                    if(res && (String(res.code) === '10000' || String(res.code) === '10001')&& res.success_lst?.length > 0){
                        let {success_lst} = res;
                        let tempData = {};
                        success_lst.map((typeItem) => {
                            const {alias, dataset} = typeItem;
                            tempData[alias] = dataset;
                        })

                        setData(tempData)
                    }
                })
                .finally(() => {
                    setIsMounted(true);
                    clearTimeout(timer.current);
                    timer.current = setTimeout(() => {
                        fetchData();
                    }, CommonTimerInterval)
                })
            } 

            setIsLoading(true)
            clearTimeout(timer.current);
            fetchData();
        }

        // 请求pack数量
        if(pack?.selectedObject?.selectedPoint){
            setIsLoading(true);
            _dao.getDynData([{
                    decimal: 0,
                    id: "",
                    key: getPointsAlias(finalAssetAlias, pack?.selectedObject.selectedPoint || {}, true)
                }]).then((res) => {
                if(res && String(res.code) === '10000' && res.data?.length > 0){
                    const strVal = String(res.data[0].display_value);
                    if(strVal && !isNaN(Number(strVal))){
                        setPkNum(Number(strVal));
                    }else{
                        setPkNum(DEFAULT_PKNUM);
                    }
                }

            }).finally(() => {
                setIsMounted(true);
                setIsLoading(false)
            })
        }

        return () => {
            clearTimeout(timer.current);
        }

    }, [finalAssetAlias])

    return <Observer>{() => {
        return <ResizeObserver
            onResize={() => {
                if(ec.current){
                    ec.current.resize();
                }
            }}
        >
            <PageCard {...configure}>
                <div className={styles.container} ref = {containerRef}>
                    {(!isMounted) || !batteriesProps?.modes || batteriesProps.modes.length === 0 ? null :
                    <div className={styles.tab}>
                        <Tabs>
                            {
                                batteriesProps.modes.map((item, ind) => {
                                    const {mode, contentTypes = []} = item;
                                    return <TabPane key = {ind} prefixCls={styles.tab} tab = {MODE_LIST.find(l => l.value === mode)?.label} key = {item.mode}>
                                        <div className={styles.tabContent}>{contentTypes.map((contentType, index) => {
                                            const {type, point,  ...restProps} = contentType;
                                            const volOrTemp = VOL_TEMP.find((o) => o.value === type);
                                            // console.log('battery type',type,volOrTemp)
                                            // 测试数据
                                            // const typeData = data[getPointsAlias(finalAssetAlias, point?.selectedObject?.selectedPoint || {}, false)];
                                            const typeData = data['ZZ.ESS10.RBMS101.RB.CelTmp']
                                            const len = contentTypes.length;
                                            console.log('typeData',typeData,data,getPointsAlias(finalAssetAlias, point?.selectedObject?.selectedPoint || {}, false))
                                            return <Matrix 
                                                key = {index}
                                                containerWidth = {`calc((100% - ${28 * (len - 1)}px)/${len})`}
                                                pkNum = {pkNum}
                                                data = {isDemo ? mockData : (typeData || [])}
                                                {...(volOrTemp || {})}
                                                {...restProps}
                                            />
                                        })}</div>
                                    </TabPane>
                                })
                            }
                        </Tabs>
                    </div>
                    }
                    <EnvLoading container = {containerRef} isLoading = {isLoading || !isMounted}/> 
                </div>
            </PageCard>
        </ResizeObserver>
    }}</Observer>
}

