import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { observer, Observer } from 'mobx-react';
import { ConfigProvider, Button, Popover } from 'antd';
import { InsertRowBelowOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import {
	RightConfig,
	Container,
	useStoreState,
	innerContainerDragUp,
	LeftConfig,
	ContainerWrapper,
	Control,
	deepCopy,
} from 'dooringx-lib';
import { configContext, LocaleContext } from './layouts';
import { PREVIEWSTATE } from './constant';
import HeaderComponent from './components/Header';
import { _pageDao, daoIsOk } from '@/common/dao';
import { useStores } from '../../stores';

import styles from './style.mscss';

const footerConfig = function () {
	return null;
	return (
		<>
			<Popover content={'快捷键'} title={null} trigger="hover">
				<Button type="text" icon={<InsertRowBelowOutlined />}></Button>
			</Popover>
		</>
	);
};

interface ILocationState {
	id: string;
	[key: string]: any;
}

function Canvas(props) {
	const globalStores = useStores();
	const isDev = globalStores.isDev;
	const nav = useNavigate();
	const location = useLocation();
	const pageId = location.state ? (location.state as ILocationState).id : null;
	const pageName = location.state ? (location.state as ILocationState).name : null;
	const config = useContext(configContext);
	const commander = config.getCommanderRegister();

	useEffect(() => {
		if(!pageId){
			nav('/tpl');
		}
	});

	useEffect(() => {
		document.title = pageName;

		_pageDao.getPageTpl({id: pageId}).then(res => {
			if(res.data && res.data.content){
				config.getStore().resetToInitData([JSON.parse(res.data.content)]);
			}else{
				commander.exec('clear');
			}
		});

		return () => {
			document.title = '';
		};
	}, []);

	useEffect(() => {
		$('#yh-container').parent().siblings().remove();
	}, []);

	const everyFn = () => {};

	const subscribeFn = useCallback(() => {
		//需要去预览前判断下弹窗。
		//localStorage.setItem(PREVIEWSTATE, JSON.stringify(config.getStore().getData()));
	}, [config]);

	const [state] = useStoreState(config, subscribeFn, everyFn);

	const [rightColla, setRightColla] = useState(true);
	const changeRightColla = useMemo(() => {
		return (c) => {
		  setRightColla(c);
		};
	}, []);

	return (
		<div {...innerContainerDragUp(config)}>
			<HeaderComponent/>

			<div className={styles.container}>
				<div className={styles.containerLeft}>
					<LeftConfig footerConfig={footerConfig()} config={config}></LeftConfig>
				</div>

				<ContainerWrapper config={config}>
					<>
						<Control
							config={config}
							style={{ 
								position: 'fixed', 
								bottom: '160px', 
								right: '450px', 
								zIndex: 100,
								display: 'none'
							}}
						></Control>
						<ConfigProvider prefixCls='ant'>
						<Container 
							state={state} 
							config={config} 
							context="edit"
							editContainerStyle={{
								lineHeight: 1.575,
								color: '#fff'
							}}
						></Container>
						</ConfigProvider>
						
					</>
				</ContainerWrapper>
				<div className={`${styles.rightpanel} ${!rightColla ? styles.rightexpand : ''}`}>
					<RightConfig 
						state={state} 
						config={config}
					></RightConfig>
					<div
						className={`${styles.rightbtn}`}
						onClick={() => changeRightColla(!rightColla)}
						>
						{!rightColla ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
					</div>
				</div>
			</div>
		</div>
	);
}

export default observer(Canvas);
