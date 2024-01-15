/* eslint-disable */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
	Domain,
} from '@/components_widgets';
import StoresContext, { useStores } from '../stores';
import { msg, isZh, deviceEx, BASEINFO_DEFAULT_POINTS } from '../constants'
import styles from './style.mscss';

const SIGN = 'solar_site_new_device';

const DeviceTopo = () => {
	const location = useLocation();
	const { store } = useStores();
	const nav = useNavigate();
	const { deviceAlias } = useParams();
	const nodeAlias = store.isDev ? 'SD1' : ScadaCfg.getCurNodeAlias();

	const matrix = store.cfg.matrix;
	const devices = (store.cfg.keyInfo?.devices??[]).filter(ele => {
		return ele.key && deviceEx.indexOf(ele.key) === -1;
	});

	const topoQuotas = store.cfg.topo??[];

	const [dynMap, setDynMap] = useState<{[key: string]:IDyn}>({});
	const [topologyAlias, setTopologyAlias] = useState<{
		padArr: ITopologyAsset[], // 箱变
		inverterArr: ITopologyAsset[], // 逆变器
		strInverterArr: ITopologyAsset[], // 组串式逆变器
		dCCombinerArr: ITopologyAsset[], // 直流汇流箱
		aCCombinerArr: ITopologyAsset[] // 交流汇流箱，除拓扑外暂时没用
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

	useRecursiveTimeoutEffect(() => {
		const totalAndCount: any[] = [];
		devices.map(d => {
			d.total && totalAndCount.push(d.total);
			d.count && totalAndCount.push(d.count);
		})
		const req: any[] = [];
		[matrix, ...totalAndCount].map((d, ind) =>{
			if(d){
				let dAlias = deviceAlias;
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
	}, TimerInterval as number, [deviceAlias, matrix, devices], true);

	let padBaseAlias = parseDevice(topologyAlias?.padArr??[]);
	let padBaseKey = `${deviceAlias}${typeof padBaseAlias === 'string' ? padBaseAlias : padBaseAlias[0].alias??''}`;
	let inverterBaseAlias = parseDevice(topologyAlias?.inverterArr??[]);
	let inverterBaseKey = `${deviceAlias}${typeof inverterBaseAlias === 'string' ? inverterBaseAlias : inverterBaseAlias[0].alias??''}`;
	let strInverterBaseAlias = parseDevice(topologyAlias?.strInverterArr??[]);
	let strInverterBaseKey = `${deviceAlias}${typeof strInverterBaseAlias === 'string' ? strInverterBaseAlias : strInverterBaseAlias[0].alias??''}`;
	let dCCombinerBaseAlias = parseDevice(topologyAlias?.dCCombinerArr??[]);
	let dCCombinerBaseKey = `${deviceAlias}${typeof dCCombinerBaseAlias === 'string' ? dCCombinerBaseAlias : dCCombinerBaseAlias[0].alias??''}`;

	let matrixVal = dynMap[getPointKey(matrix, deviceAlias)]?.raw_value;
	let matrixStyle = {};
	if(matrixVal){
		matrixStyle = matrix.valueMap[matrixVal]??{};
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
					type={29}
					switchCallback={(alias) => {
						// 支持其它地方跳转时的切换
						const routePaths = location.pathname.split('/');
						const routePath = routePaths.slice(0, routePaths.length - 1).join('/');
						nav(`${routePath}/${alias}`, {state: location.state});
					}}
				/>
				{
					matrix && <CommonDynData 
						key={getPointKey(matrix, deviceAlias)}
						containerCls={styles.infoLeftEle}
						showName={false}
						showUnit={false}
						point={{
							nameCn: matrix.name_cn,
							nameEn: matrix.name_en,
							aliasKey: getPointKey(matrix, deviceAlias),
							tableNo: matrix.table_no,
							fieldNo: matrix.field_no,
							decimal: 0
						}}
						value={dynMap[getPointKey(matrix, deviceAlias)]}
						transform={{
							background: matrixStyle.background??'',
							icon: matrixStyle.icon??''
						}}
						valueDefaultColor={matrix.color}
					/>
				}
			</div>
			<div className={styles.infoRight}>
				<div>
				{
					devices.map((d) => {
						const {total, count, name_cn, name_en} = d;
						// 统计点在设备对应电压等级统计间隔下
						const countKey = count ? getPointKey(count, deviceAlias || '') : '';
						const totalKey = total ? getPointKey(total, deviceAlias || '') : '';

						const totalNum = dynMap[totalKey]?.display_value || 0;

						if(!totalNum || String(totalNum) === '0') return null;

						return <div key={countKey}>
							<span className={styles.infoRightName}>{isZh ? name_cn : name_en}</span>
							({count && <CommonDynData 
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
							/>}
							{count && total &&<span>/</span>}
							{total && <CommonDynData 
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
							/>})
						</div>;
					})
				}
				</div>
			</div>
		</div>
		<div>
			<div>
				<PCSTopologyDiagram 
					key={deviceAlias}
					configure={{
						domain: Domain.SOLAR,
						padPointMap: getPADDefaultAliasMap(false),
						onSolarTopologyLoad: (padArr, inverterArr, strInverterArr, aCCombinerArr, dCCombinerArr) => {
							setTopologyAlias({
								padArr, inverterArr, strInverterArr, aCCombinerArr, dCCombinerArr
							})
						},
						topoQuotas: topoQuotas
					}} 
					assetAlias={deviceAlias}
				/>
			</div>
			<div>
				<div>
					<BaseInfo 
						key={padBaseKey}
						id={`solar_matrix_topo_pad_${SIGN}`}
						configure={{
							title: '',
							pointCandidates:[],
							defaultTemplateName: msg('padMeasure'),
							defaultPoints: BASEINFO_DEFAULT_POINTS['PAD'],
							publicTypes: [POINT_TABLE.YC],
							styleMode: IBaseInfoStyle.ICON,
							candidatesFromWebLevel: [1]
						}} 
						assetAlias={padBaseAlias.split('.').splice(0,3).join('.')}
					/>
				</div>
				{(topologyAlias?.strInverterArr??[]).length > 0 ? <div>
					<BaseInfo 
						key={strInverterBaseKey}
						id={`solar_matrix_topo_strinverter_${SIGN}`}
						configure={{
							title: '',
							pointCandidates:[],
							defaultTemplateName: msg('strInverterMeasure'),
							defaultPoints: BASEINFO_DEFAULT_POINTS['STR_INV'],
							publicTypes: [POINT_TABLE.YC],
							styleMode: IBaseInfoStyle.ICON,
							candidatesFromWebLevel: [1],
						}} 
						assetAlias={strInverterBaseAlias}
					/>
				</div> : null}
				{(topologyAlias?.inverterArr??[]).length > 0 ? <div>
					<BaseInfo 
						key={inverterBaseKey}
						id={`solar_matrix_topo_inverter_${SIGN}`}
						configure={{
							title: '',
							pointCandidates:[],
							defaultTemplateName: msg('inverterMeasure'),
							defaultPoints: BASEINFO_DEFAULT_POINTS['INV'],
							publicTypes: [POINT_TABLE.YC],
							styleMode: IBaseInfoStyle.ICON,
							candidatesFromWebLevel: [1],
						}} 
						assetAlias={inverterBaseAlias}
					/>
				</div>: null}
				{
					((topologyAlias?.dCCombinerArr??[]).length > 0) &&
				<div>
						<BaseInfo 
							key={dCCombinerBaseKey}
							id={`solar_matrix_topo_dcCombiner_${SIGN}`}
							configure={{
								title: '',
								pointCandidates:[],
								defaultTemplateName: msg('dcCombinerMeasure'),
								defaultPoints: BASEINFO_DEFAULT_POINTS['DC_COMB'],
								publicTypes: [POINT_TABLE.YC],
								styleMode: IBaseInfoStyle.ICON,
								candidatesFromWebLevel: [1]
							}} 
							assetAlias={dCCombinerBaseAlias}
						/>
					</div>
				}
			</div>
		</div>
	</div>;
}

export default DeviceTopo;