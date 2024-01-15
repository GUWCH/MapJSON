import React, { createContext, useEffect, useState } from 'react';
import { ConfigProvider, Button } from 'antd';
import { useIntl, FormattedMessage } from "react-intl";
import { UserConfig, locale } from 'dooringx-lib';
import { localeKey } from 'dooringx-lib/dist/locale';
import { IntlProvider } from 'react-intl';
import enUS from '../../../i18n/en-US';
import zhCN from '../../../i18n/zh-CN';
import { isZh } from '@/common/util-scada';
import plugin from '../plugin';

import 'dooringx-lib/dist/dooringx-lib.esm.css';
import '../../../assets/ant.light.css';
import 'animate.css';
import './style.scss';

export const config = new UserConfig(plugin);
export const configContext = createContext<UserConfig>(config);

//config.i18n = false;
// 自定义右键
const contextMenuState = config.getContextMenuState();
const unmountContextMenu = contextMenuState.unmountContextMenu;
const commander = config.getCommanderRegister();
const ContextMenu = () => {
	const intl = useIntl();

	const handleclick = () => {
		unmountContextMenu();
	};
	const forceUpdate = useState(0)[1];
	contextMenuState.forceUpdate = () => {
		forceUpdate((pre) => pre + 1);
	};

	let canDrag = true;
	const blockdata = config.getStore().getData();
	blockdata.block.forEach((v) => {
		if (v.focus) {
			canDrag = v.canDrag;
		}
	});
	
	return (
		<div
			style={{
				left: contextMenuState.left,
				top: contextMenuState.top,
				position: 'fixed',
				background: 'rgb(24, 23, 23)',
			}}
		>
			{/* <div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('redo');
					handleclick();
				}}
			>
				<Button>自定义</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('hide');
					handleclick();
				}}
			>
				<Button style={{ width: '100%' }}>隐藏</Button>
			</div> */}
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('copy');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }}>{intl.formatMessage({id: 'usd.copy' })}</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('delete');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }}>{intl.formatMessage({id: 'usd.delete' })}</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('lock');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }} disabled={!canDrag}>{intl.formatMessage({id: 'usd.lock' })}</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('unlock');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }} disabled={canDrag}>{intl.formatMessage({id: 'usd.unlock' })}</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('top');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }}>{intl.formatMessage({id: 'usd.top' })}</Button>
			</div>
			<div
				style={{ width: '100%' }}
				onClick={() => {
					commander.exec('bottom');
					handleclick();
				}}
			>
				<Button prefixCls='edit-frame-btn' style={{ width: '100%' }}>{intl.formatMessage({id: 'usd.bottom' })}</Button>
			</div>
		</div>
	);
};

interface LocaleContextType {
	change: Function;
	current: localeKey;
}
export const LocaleContext = createContext<LocaleContextType>({
	change: () => {},
	current: 'zh-CN',
});

export default function Layout({ children }) {
	const [l, setLocale] = useState<localeKey>(isZh ? 'zh-CN' : 'en');
	const allLocale = {};
	Object.keys(locale.localeMap).forEach(key => {
		const appLocale = l === 'zh-CN' ? zhCN : enUS;
		allLocale[key] = {...locale.localeMap[key], ...appLocale};
	});

	contextMenuState.contextMenu = <IntlProvider messages={allLocale[l]} locale={l} defaultLocale={l}>
		<ContextMenu></ContextMenu>
	</IntlProvider>;

	useEffect(() => {
		window.addEventListener('resize', resize);
		resize();

		() => {
			window.removeEventListener('resize', resize);
		}
	}, []);

	const resize = () => {
		const {width, height} = config.getStore().getData().container;
		const canvasWidth = Number(window.innerWidth - 320 - 200);
		const canvasHeight = Number(window.innerHeight - 45 - 90);
		const scale = Math.min.apply(null, [canvasWidth/width, canvasHeight/height]);
		config.scaleState.value = Number(scale.toFixed(1));
		config.getStore().forceUpdate();
	};

	return (
		<LocaleContext.Provider value={{ change: setLocale, current: l }}>
			<IntlProvider messages={allLocale[l]} locale={l} defaultLocale={l}>
				<configContext.Provider value={config}>
					<ConfigProvider prefixCls='edit-frame'>
						<div className={`env-editor-container`}>{children}</div>
					</ConfigProvider>
				</configContext.Provider>
			</IntlProvider>
		</LocaleContext.Provider>
	);
	return <configContext.Provider value={config}>{children}</configContext.Provider>;
}
