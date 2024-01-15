/* eslint-disable */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@/common/css/app.scss';
import ScadaCfg from '@/common/const-scada';
import { Overview, Curve, StatisticsInfo } from '@/components_widgets';
import styles from './style.mscss';
import StatusStatistics from '../components/statusStatistics';
import Geographical from '../components/geographical';
import StoresContext, { useStores } from '../stores';
import { curveCfgConvert } from '../constants';

const StorageSite = () => {
	const { store } = useStores();
	const assetAlias = store.isDev ? 'SXCN' : ScadaCfg.getCurNodeAlias() || '';

	const commonProps = {
		assetAlias: assetAlias,
		storageCfg: store.cfg
	}

	return <div className={styles.container} style = {store.isDev ? {} : {height: '100%'}}>
		<div className={styles.head}>
			<StatisticsInfo 
				assetAlias={assetAlias}
				pageId={'storage_site'}
				id = {'info'}
				isExternal = {true} 
				externalCfg = {store.cfg['keyInfo']}
			/>
		</div>
		<div className={styles.content}>
			<div className={styles.left}>
				<div className={styles.overview}>
					<Overview
						assetAlias={assetAlias}
						pageId={'storage_site'}
						id = {'overview'}
						isExternal = {true}
						externalCfg = {{
							title: '实时数据概览',
							title_en: 'Real-time Data Overview',
							cfg: [{
								type: 'icon',
								limitNum: 6,
								colNum: 3,
								points: store.cfg['overview'] // TODO, 这里是mobx对象, 需要处理
							}]
						}}
					/>
				</div>
				<div className={styles.statistics}>
					<StatusStatistics {...commonProps}/>
				</div>
				<div className={styles.curve}>
					<Curve
						assetAlias={assetAlias}
						pageId={'storage_site'} 
						id = {'curve'} 
						isExternal = {true} 
						externalCfg = {{
							title: '曲线显示', 
							title_en: 'Curve Display', 
							timeSelectEnable: true, 
							contentData: curveCfgConvert(store.cfg['curve'])
						}}
					/>
				</div>
			</div>
			<div className={styles.right}>
				<Geographical {...commonProps}/>
			</div>
		</div>
	</div>;
}

export default StorageSite;