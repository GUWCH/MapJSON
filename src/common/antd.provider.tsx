import * as React from "react";
import moment from 'moment';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import Intl from './lang';

if (Intl.isZh) {
	moment.locale('zh-cn');
}

export const AntdProvider = (props) => {
	const { children, ...rest } = props;
	
	return <ConfigProvider
		locale={Intl.isZh ? zhCN : enUS}
		{...rest}
	>
		{children}
	</ConfigProvider>
}