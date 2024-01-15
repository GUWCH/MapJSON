/* eslint-disable */
import React from 'react';
import App from './App';
import { TListProps } from './types';
import { IconKey } from 'Icon/iconsMap';

export { default as ListForm} from './form';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IListDefaultOptions {
    
};

export const ListDefaultOptions: IListDefaultOptions = {
    
};

export interface IListDefaultCfg {
    type: string;
    domain: string;
    list: {
        models: any[];
        object: {[key: string]: any};
        statistics: {[key: string]: any};
        iconCfg?: {
            key?: IconKey,
            color?: string
        }
    }[];
    objects: {
        model_id: string;
        model_name: string;
        table_no: string | number;
        type: string | number;
    }[];
};

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const ListDefaultCfg = {
    type: '',
    domain: '',
    list: [],
    objects: []
};

export function List(widgetProps: TListProps) {
    return <App {...widgetProps}/>;
}

/* eslint-enable */