/* eslint-disable */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@/common/css/app.scss';
import ScadaCfg from '@/common/const-scada';
import styles from './style.mscss';
import {StatisticsInfo, Overview, Alarm} from '@/components_widgets/index';
import Geographical from '../components/geographical';
import StoresContext, { useStores } from '../stores';
import { _dao } from '@/common/dao';

const FireControl = () => {
	const { store } = useStores();
	const assetAlias = store.isDev ? 'SXCN' : ScadaCfg.getCurNodeAlias() || '';

	const commonProps = {
		assetAlias: assetAlias as string,
		storageCfg: store.cfg,
		pageId: 'fire_control'
	}

	return <div className={styles.container} style = {store.isDev ? {} : {height: '100%'}}>
		<div className={styles.head}>
			<StatisticsInfo {...commonProps} isExternal = {true} externalCfg = {store.cfg['keyInfo']}/>
		</div>
		<div className={styles.content}>
			<div className={styles.left}>
				<div className={styles.overview}>
					<Overview 
						{...commonProps} 
						
						id = {'overview'} 
						isExternal = {true} 
						externalCfg = {{
							title: '实时数据概览',
							title_en: 'Real-time Data Overview',
							cfg: store.cfg['overview']
						}}
					/>
				</div>
				<div className={styles.alarm}>
					<Alarm 
						{...commonProps}
						id = {'alarm'}
						isDemo = {false}
						nodeAlias = {(assetAlias as string).split('.')[0]}
						configure = {store.cfg['alarm']}
					/>
				</div>
			</div>
			<div className={styles.right}>
				<Geographical {...commonProps}/>
			</div>
		</div>
	</div>;
}

export default FireControl;