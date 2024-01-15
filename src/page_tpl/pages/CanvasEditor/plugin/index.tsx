import React, { FunctionComponent, ComponentClass} from 'react';
import { InitConfig, LeftDataPannel, ComponentItemFactory, createPannelOptions } from 'dooringx-lib';
import { CacheComponentType } from 'dooringx-lib/dist/config';
import { LeftRegistComponentMapItem } from 'dooringx-lib/dist/core/crossDrag';
import { HighlightOutlined } from '@ant-design/icons';
import commandModules from './commands';
import { functionMap } from './functionMap';
import { Formmodules } from './formComponents';
import * as RegistComponents from './registComponents';
import rightGlobalCustom, { rightGlobalState } from '../components/RightGlobal';
import { RegistedWidgets } from '@/components_widgets/_register';
import { FormattedMessage } from "react-intl";

// 左侧控件菜单
const LeftRegistMap: LeftRegistComponentMapItem[] = [
	/* {
		type: 'basic',
		component: 'button',
		img: 'icon-anniu',
		imgCustom: <PlayCircleOutlined />,
		displayName: '按钮',
		urlFn: () => import('./registComponents/button'),
	},
	{
		type: 'basic',
		component: 'input',
		img: 'icon-anniu',
		imgCustom: <PlayCircleOutlined />,
		displayName: '输入框',
	},
	{
		type: 'basic',
		component: 'test',
		img: 'icon-anniu',
		imgCustom: <PlayCircleOutlined />,
		displayName: '测试',
		urlFn: () => import('./registComponents/testCo'),
	},
	{
		type: 'basic',
		component: 'tab',
		img: 'icon-anniu',
		imgCustom: <PlayCircleOutlined />,
		displayName: '选项卡',
		urlFn: () => import('./registComponents/tabCo'),
	}, */
];

// 控件对应渲染组件
const initComponentCache: CacheComponentType = {
};

// 控件对应表单组件
const initComponentForm: Record<string, FunctionComponent<any> | ComponentClass<any, any>> = {
};

Object.keys(RegistedWidgets).sort((a, b) => {
	return (RegistedWidgets[a].order || 0) - (RegistedWidgets[b].order || 0);
}).map((widgetName, ind) => {
	const cfg: WidgetRegistParameter = RegistedWidgets[widgetName];

	LeftRegistMap.push({
		type: cfg.menu.type,
		component: cfg.id,
		img: 'icon-anniu',
		imgCustom: cfg.menu.imgCustom,
		displayName: cfg.name
	});

	initComponentCache[widgetName] = {
		component: new ComponentItemFactory(
			cfg.id,
			cfg.name,
			{
				style: [
					createPannelOptions(cfg.id, cfg.defaultOptions),
				]
			},
			cfg.renderConfigure,
			cfg.render,
			true
		) 
	};

	initComponentForm[widgetName] = cfg.formRender;
})

export const defaultConfig: Partial<InitConfig> = {
	containerIcon: null,
	initStoreData: [{
		container: {
			width: 1920,
			height: 1080,
		},
		block: [],
		modalMap: {},
		dataSource: {
			defaultKey: 'defaultValue',
		},
		// 全局属性设置
		globalState: rightGlobalState,
		modalConfig: {},
	}],
	leftAllRegistMap: LeftRegistMap,
	leftRenderListCategory: [
		{
			type: 'basic',
			icon: <HighlightOutlined />,
			displayName: <FormattedMessage id='usd.base' />,
		}/* ,
		{
			type: 'media',
			icon: <PlayCircleOutlined />,
			displayName: '媒体组件',
		},
		{
			type: 'datax',
			icon: <ContainerOutlined />,
			custom: true,
			displayName: '数据源',
			customRender: (config) => <LeftDataPannel config={config}></LeftDataPannel>,
		},
		{
			type: 'xxc',
			icon: <ContainerOutlined />,
			custom: true,
			displayName: '自定义',
			customRender: () => <div>我是自定义渲染</div>,
		}, */
	],
	initComponentCache: initComponentCache,
	rightRenderListCategory: [
		{
			type: 'style',
			icon: (<div><FormattedMessage id='usd.set' /></div>)
		},
		/* {
			type: 'config',
			icon: (
				<div className="right-tab-item" style={{ width: 50, textAlign: 'center' }}>
					配置
				</div>
			),
		},
		{
			type: 'fn',
			icon: (
				<div className="right-tab-item" style={{ width: 50, textAlign: 'center' }}>
					函数
				</div>
			),
		},
		{
			type: 'actions',
			icon: (
				<div className="right-tab-item" style={{ width: 50, textAlign: 'center' }}>
					事件
				</div>
			),
		}, */
	],
	initFunctionMap: functionMap,
	initCommandModule: commandModules,
	initFormComponents: Object.assign({}, Formmodules, initComponentForm),
	rightGlobalCustom: rightGlobalCustom
};

export default defaultConfig;
