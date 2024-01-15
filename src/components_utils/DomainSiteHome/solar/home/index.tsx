/* eslint-disable */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@/common/css/app.scss';
import ScadaCfg from '@/common/const-scada';
import styles from './style.mscss';
import {StatisticsInfo, Overview, Curve, GeographyDist} from '@/components_widgets/index';
import {curveCfgConvert, deviceEx} from '../constants';
import StoresContext, { useStores } from '../stores';

const SolarSite = () => {
	const { store } = useStores();
	const assetAlias = store.isDev ? 'SD1' : ScadaCfg.getCurNodeAlias() || '';

	const commonProps = {
		isDemo: false,
		assetAlias: assetAlias as string,
		pageId: 'solar_site_new'
	}

	return <div className={styles.container} style = {store.isDev ? {} : {height: '100%'}}>
		<div className={styles.head}>
			<StatisticsInfo {...commonProps} isExternal = {true} externalCfg = {store.cfg['keyInfo']}/>
		</div>
		<div className={styles.content}>
			<div className={styles.left}>
				<div className={styles.overview}>
					<Overview {...commonProps} 
						id = {'overview'} 
						isExternal = {true} 
						externalCfg = {{
							title: '场站信息', 
							title_en: 'Station Information', 
							cfg: [{
								type: 'icon',
								limitNum: 6,
								colNum: 3,
								points: store.cfg['overview']
							}]
						}}
					/>
				</div>
				<div className={styles.curve}>
					<Curve {...commonProps} id = {'curve'} isExternal = {true} externalCfg = {{
						title: '运行趋势', 
						title_en: 'Operation Trend', 
						timeSelectEnable: true, 
						contentData: curveCfgConvert(store.cfg['curve'])}}
					/>
				</div>
				<div className={styles.waterDroplet}>
					<Overview 
						{...commonProps} 
						id = {'waterDroplets'} 
						isExternal = {true} 
						externalCfg = {{
							title: '发电概览', 
							title_en: 'Power Generation', 
							cfg: store.cfg['waterDroplet']
						}}
					/>
				</div>
			</div>
			<div className={styles.right}>
				<GeographyDist 
					{...commonProps}
					id = {'geographical'} 
					externalCfg = {{
						cfg: store.cfg['geographical'], 
						devicesTypes: (store.cfg['keyInfo']?.devices || [])
							.filter(c => deviceEx.indexOf(c.key) === -1)
					}}
				/>
			</div>
		</div>
	</div>;
}

export default SolarSite;