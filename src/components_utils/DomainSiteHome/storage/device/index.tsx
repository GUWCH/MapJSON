/* eslint-disable */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { observer } from 'mobx-react';
import { IconType, FontIcon } from 'Icon';
import ScadaCfg, { TimerInterval } from '@/common/const-scada';
import { getPointKey, DECIMAL, POINT_TABLE } from '@/common/constants';
import { _dao, daoIsOk } from '@/common/dao';
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import DeviceSwitch from '@/components_utils/DeviceSwitch';
import CommonDynData from '@/components/DynData';
import { 
	getPADDefaultAliasMap, 
	NavBreadCrumb, 
	PCSTopologyDiagram, 
	BaseInfo,
	IBaseInfoStyle,
	PADPointAliasMap
} from '@/components_widgets';
import StoresContext, { useStores } from '../stores';
import { msg, isZh } from '../constants'
import styles from './style.mscss';

const DeviceTopo = () => {
	const [padAliasMap, setPadAliasMap] = useState<Required<PADPointAliasMap | undefined>>()
	const location = useLocation();
	const { store } = useStores();
	const nav = useNavigate();
	const { deviceAlias } = useParams();
	const nodeAlias = store.isDev ? 'SXCN' : ScadaCfg.getCurNodeAlias();

	const cess = store.cfg.cess;
	const devices = store.cfg.keyInfo?.devices??[];

	const [dynMap, setDynMap] = useState<{[key: string]:IDyn}>({});
	const [topologyAlias, setTopologyAlias] = useState<{
		padArr: ITopologyAsset[], // 箱变
		converterArr: ITopologyAsset[], // 变流器
		batteryArr: ITopologyAsset[], // 电池组
		batteryClusterArr: ITopologyAsset[] // 电池簇
	}>()

	const parseDevice = useCallback((aliasList: any[]) => {
		let retAlias = '';
		if(aliasList.length === 1){
			let alias = aliasList[0].alias;
			if(alias && alias.split(',').length > 1){
				let aliasArr = alias.split(',');
				retAlias = aliasArr.map(f => ({
					alias: f,
					name: ''
				})).sort((a, b) => {
					return a.alias > b.alias ? 1 : -1
				}).map((f,ind) => Object.assign({}, f, {showName: `#${ind+1}`}));
			}else{
				retAlias = alias;
			}
		}else if(aliasList.length > 1){
			retAlias = aliasList
			.reduce((ret, b) => {
				let alias = b.alias;
				if(alias && alias.split(',').length > 1){
					let aliasArr = alias.split(',');
					ret = ret.concat(aliasArr.map(f => ({
						alias: f,
						name: ''
					})))
				}else{
					ret = ret.concat([{
						alias: alias,
						name: ''
					}])
				}
				return ret;
			}, [])
			.sort((a, b) => {
				return a.alias > b.alias ? 1 : -1
			}).map((f,ind) => Object.assign({}, f, {showName: `#${ind+1}`}));
		}

		return retAlias;
	}, []);


	useEffect(() => {
		const defaultCfg = getPADDefaultAliasMap(true)
		const updatePadAliasMap = async () => {
			try{
				const res = await fetch('../project/storage_device_pad.json?_=' + Math.random().toFixed(8))
				if(res.ok) {
					const cfg = await res.json()
					setPadAliasMap(Object.assign({}, defaultCfg, cfg))
				} else {
					throw new Error('json res is not ok')
				}
			} catch(e) {
				console.warn('no valid json file found, use default', e)
				setPadAliasMap(defaultCfg)
			}
		}
		updatePadAliasMap()
	}, [])

	useRecursiveTimeoutEffect(() => {
		const totalAndCount: any[] = [];
		devices.map(d => {
			totalAndCount.push(d.total);
			totalAndCount.push(d.count);
		})
		const req: any[] = [];
		[cess, ...totalAndCount].map((d, ind) =>{
			if(d){
				let dAlias = deviceAlias;
				if(ind !== 0){
					dAlias = (dAlias || '').replace(/\.cess/gi, '.Statistics');
				}
				req.push({
					id: '',
					key: getPointKey(d, dAlias),
					decimal: DECIMAL.COMMON
				});				
			}
		});

		if(!deviceAlias || req.length === 0) return;
		return [()=>{
			return _dao.getDynData(req);
		}, (res)=>{
			if(daoIsOk(res)){
				let dynMap = {};
				res.data.map(d => {
					dynMap[d.key] = d;
				})
				setDynMap(m => Object.assign({}, m, dynMap));
			}
		}]
	}, TimerInterval as number, [deviceAlias, cess, devices]);

	let padBaseAlias = parseDevice(topologyAlias?.padArr??[]);
	let converterBaseAlias = parseDevice(topologyAlias?.converterArr??[]);
	let batteryCluBaseAlias = parseDevice(topologyAlias?.batteryArr??[]);
	let padBaseKey = `${deviceAlias}${typeof padBaseAlias === 'string' ? padBaseAlias : padBaseAlias[0].alias??''}`;
	let converterBaseKey = `${deviceAlias}${typeof converterBaseAlias === 'string' ? converterBaseAlias : converterBaseAlias[0].alias??''}`;
	let batteryCluBaseKey = `${deviceAlias}${typeof batteryCluBaseAlias === 'string' ? batteryCluBaseAlias : batteryCluBaseAlias[0].alias??''}`;

	let cessVal = dynMap[getPointKey(cess, deviceAlias)]?.raw_value;
	let cessStyle = {};
	if(cessVal){
		cessStyle = cess.valueMap[cessVal]??{};
	}

	return <div className={styles.topo}>
		<div>
			<NavBreadCrumb 
				configure={{
					breads: [{
						name: msg('back'),
						name_en: msg('back'),
						icon: IconType.BACK, 
						target: '/'
					}]
				}} 
				navCb={() => {
					// 从其它页面过来时返回
					const state = (location && location.state) as {page: string};
					if(state && state.page){
						nav(`/page/${state.page}`, {state: location.state});
					}else{
						nav('/');
					}
				}}
			/>
		</div>
		<div className={styles.info}>
			<div className={styles.infoLeft}>
				<DeviceSwitch 
					showSwitch={true}
					pageNodeAlias={nodeAlias as string}
					assetAlias={deviceAlias}
					tableNo={430}
					type={22}
					switchCallback={(alias) => {
						// 支持其它地方跳转时的切换
						const routePaths = location.pathname.split('/');
						const routePath = routePaths.slice(0, routePaths.length - 1).join('/');
						nav(`${routePath}/${alias}`, {state: location.state});
					}}
				/>
				{
					cess && <CommonDynData 
						key={getPointKey(cess, deviceAlias)}
						containerCls={styles.infoLeftEle}
						showName={false}
						showUnit={false}
						point={{
							nameCn: cess.name_cn,
							nameEn: cess.name_en,
							aliasKey: getPointKey(cess, deviceAlias),
							tableNo: cess.table_no,
							fieldNo: cess.field_no,
							decimal: 0
						}}
						value={dynMap[getPointKey(cess, deviceAlias)]}
						valuePropName={'display_value'}
						transform={{
							background: cessStyle.background??'',
							icon: cessStyle.icon??''
						}}
						valueDefaultColor={cess.color}
					/>
				}
			</div>
			<div className={styles.infoRight}>
				<div>
				{
					devices.map((d) => {
						const {total, count, name_cn, name_en} = d;
						// 统计点在设备对应电压等级统计间隔下
						const countKey = getPointKey(count, (deviceAlias || '').replace(/\.cess/gi, '.Statistics'));
						const totalKey = getPointKey(total, (deviceAlias || '').replace(/\.cess/gi, '.Statistics'));

						const totalNum = dynMap[totalKey]?.display_value;

						if(!totalNum || Number(totalNum) === 0 ) return null;

						return <div key={countKey}>
							<span className={styles.infoRightName}>{isZh ? name_cn : name_en}</span>
							(<CommonDynData 
								key={countKey}
								showName={false}
								showUnit={false}
								point={{
									nameCn: count.name_cn,
									nameEn: count.name_en,
									aliasKey: countKey,
									tableNo: count.table_no,
									fieldNo: count.field_no,
									decimal: 0
								}}
								value={dynMap[countKey]}
								valueDefaultColor={count.color}
							/>
							/
							<CommonDynData 
								key={totalKey}
								showName={false}
								showUnit={false}
								point={{
									nameCn: total.name_cn,
									nameEn: total.name_en,
									aliasKey: totalKey,
									tableNo: total.table_no,
									fieldNo: total.field_no,
									decimal: 0
								}}
								value={dynMap[totalKey]}
							/>)
						</div>;
					})
				}
				</div>
			</div>
		</div>
		<div>
			<div>
				{padAliasMap && <PCSTopologyDiagram 
					key={deviceAlias}
					configure={{
						padPointMap: padAliasMap,
						onTopologyLoad: (padArr,converterArr, batteryArr,batteryClusterArr) => {
							setTopologyAlias({
								padArr,converterArr, batteryArr,batteryClusterArr
							})
						}
					}} 
					assetAlias={deviceAlias}
				/>}
			</div>
			<div>
				<div>
					<BaseInfo 
						key={padBaseKey}
						id={`storage_cess_topo_pad_${nodeAlias}`}
						configure={{
							title: '',
							pointCandidates:[],
							defaultTemplateName: msg('boxMeasure'),
							defaultShowNum: 15,
							publicTypes: [POINT_TABLE.YC],
							styleMode: IBaseInfoStyle.ICON,
							candidatesFromWebLevel: [1]
						}} 
						assetAlias={padBaseAlias}
					/>
				</div>
				<div>
					<BaseInfo 
						key={converterBaseKey}
						id={`storage_cess_topo_pcs_${nodeAlias}`}
						configure={{
							title: '',
							pointCandidates:[],
							defaultTemplateName: msg('pcsMeasure'),
							defaultShowNum: 15,
							publicTypes: [POINT_TABLE.YC],
							styleMode: IBaseInfoStyle.ICON,
							candidatesFromWebLevel: [1]
						}} 
						assetAlias={converterBaseAlias}
					/>
				</div>
				{
					((topologyAlias?.batteryArr??[]).length > 0) &&
					<div>
						<BaseInfo 
							key={batteryCluBaseKey}
							id={`storage_cess_topo_battery_${nodeAlias}`}
							configure={{
								title: '',
								pointCandidates:[],
								defaultTemplateName: msg('batteryMeasure'),
								defaultShowNum: 15,
								publicTypes: [POINT_TABLE.YC],
								styleMode: IBaseInfoStyle.ICON,
								candidatesFromWebLevel: [1]
							}} 
							assetAlias={batteryCluBaseAlias}
						/>
					</div>
				}
			</div>
		</div>
	</div>;
}

export default observer(DeviceTopo);