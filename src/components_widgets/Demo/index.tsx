import React, { useEffect, useRef } from 'react';
import ResizeObserver from 'rc-resize-observer';
import { useParams } from "react-router-dom";
import EchartsWrap from 'EchartsWrap';
import PageCard, { PageCardConfig } from '@/components_utils/Card';

export {default as DemoForm} from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IDemoDefaultOptions {
    
};

export const DemoDefaultOptions: IDemoDefaultOptions = {
    
};

interface IDemoCfg extends PageCardConfig{
    customAssetAlias?: string;
    type?: 'line' | 'bar'
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const DemoDefaultCfg: IDemoCfg = {
    customAssetAlias: '',
    title: '',
    type: 'line'
};

export const Demo: WidgetElement<IDemoCfg>  = (props) =>{
    const { assetAlias, configure, scale } = props;
    const { pageId } = useParams();
    const ec = useRef(null);
    const { customAssetAlias, title='', type } = configure;

    // console.log(getAssetAlias(assetAlias, customAssetAlias));

    useEffect(() => {

    }, []);

    return <ResizeObserver
        onResize={() => {
            if(ec.current){
                ec.current.resize();
            }
        }}
    >
        <PageCard 
            {...configure}
        >
            <EchartsWrap 
                ref={ec}
                widthScale={scale}
                heightScale={scale}
                data={{type}}
                resizeDelay={50}
                getOption={(data, ec) => {
                    return {
                        grid: {
                            left: 35,
                            top: 10,
                            right: 15,
                            bottom: 20
                        },
                        xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        },
                        yAxis: {
                        type: 'value'
                        },
                        series: [
                        {
                            data: [150, 230, 224, 218, 135, 147, 260],
                            type: data.type || 'line'
                        }
                        ]
                    };
                }}
            />
        </PageCard>
    </ResizeObserver>;
}