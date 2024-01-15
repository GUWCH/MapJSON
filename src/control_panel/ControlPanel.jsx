/* eslint-disable complexity */
import React, { useEffect, useState, Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from 'rc-table';
import 'rc-table/assets/index.css';
import { notify } from 'Notify';
import { Popover } from 'antd';
import EnvLoading from '../components/EnvLoading';
import { LegalData, _dao } from "../common/dao";
import { POINT_TABLE, POINT_FIELD } from '../common/constants';
import { NumberUtil } from '../common/utils';
import DevicePanel from "./DevicePanel";
import SitePanel from "./SitePanel";
import TerminalPanel from "./TerminalPanel";
import Intl, { msgTag } from "../common/lang";
import { renderInput, replaceTemplate } from "./Constant";
import ControlDialog from "./ControlDialog";

import '../common/css/app.scss';
import "./index.scss";

const msg = msgTag("control");
const isZh = Intl.isZh;
let orignalValue = {};

export function ControlPanel(props) {
	const { options = {}, onDisvisitable } = props;
	const {
		startStopData = {},
		getMonitor,
		checkAuth,
		onStart,
		onStop,
		onSubmit,
		config = {},
		facBayAlias = '',
		bayList = [],
		privilege = {}
	} = options;
	const { siteControl = {}, terminalControl = {} } = config;
	const {
		entryModule = '',
		startAlias = '',
		stopAlias = '',
		treeData = [],
		searchKey = 'display_name'
	} = startStopData;

	const titleTag = isZh ? "titleCN" : "title";
	const subTitleTag = isZh ? "subTitleCN" : "subTitle";
	const tipsTag = isZh ? "tipsCN" : 'tips';

	const [loading, setLoading] = useState(false);
	const [optionsMap, setOptionsMap] = useState({});
	const [allDisabled, setAllDisabled] = useState();
	const [dynData, setDynData] = useState([]);
	const [inputValue, setInputValue] = useState({});
	const [changedMap, setChangedMap] = useState({ 'all': {}, 'site': {}, 'terminal': {} });
	const [modalVisible, setmodalVisible] = useState(false);
	const [terminalDataSource, setTerminalDataSource] = useState([]);
	const [modalTips, setModalTips] = useState('');
	const [changedInputValue, setChangedInputValue] = useState({});
	const [emsSOCAuthed, setEmsSOCAuthed] = useState(true); //Task #173968

	const columns = [
		{
			key: 'name',
			dataIndex: 'name',
			title: msg('function'),
			align: 'center',
			width: 100,
		}, {
			key: 'before',
			dataIndex: 'before',
			title: msg('beforeChanged'),
			align: 'center',
			width: 100,
			render: (value) => {
				return <div>{value.split("\n").map((o, i) =>
					<div style={{ whiteSpace: 'nowrap' }} key={i}>{o}</div>)}
				</div>;
			}
		},
		{
			key: 'after',
			dataIndex: 'after',
			title: msg('afterChanged'),
			align: 'center',
			width: 100,
			render: (value) => {
				return <div>{value.split("\n").map((o, i) =>
					<div style={{ whiteSpace: 'nowrap' }} key={i}>{o}</div>)}
				</div>;
			}
		}
	];

	useEffect(() => {
		getAllData();
	}, []);

	const getAllData = () => {
		const dynKeyList = getDynKey();
		if (dynKeyList.length === 0) return;

		setLoading(true);
		const yx = [];
		const dyn = [];
		dynKeyList.map(o => {
			const temp = o.split(':');
			const isYx = Number(temp[1]) === POINT_TABLE.YX;
			if (isYx) {
				yx.push(temp[2]);
			}

			dyn.push({
				id: '',
				key: o,
				decimal: isYx ? 0 : 3
			});
		});
		//Task #173968
		const socData = [];
		dynKeyList.forEach(item => {
			if (item.indexOf('socBalCalibEnable') !== -1) {
				socData.push({
					id: '',
					key: item.replace('socBalCalibEnable', 'socBalCalibAuthed'),
					decimal: 0
				})
			}
		})
		if (!_.isEmpty(socData)) {
			_dao.getDynData(socData).then(val => {
				if (!_.isEmpty(val.data) && val.data[0].raw_value === '1') {
					setEmsSOCAuthed(false)
				}
			})
		}


		Promise.all([
			yx.length > 0 ? _dao.getYXConst(yx) : {},
			_dao.getDynData(dyn)
		])
			.then(res => {
				const [optionRes, dynRes] = res;

				if (LegalData(optionRes)) {
					const optionsMap = {};
					optionRes.data.forEach(o => {
						const aliasArr = o.alias ? o.alias.split(",") : [];
						aliasArr.forEach(i => {
							optionsMap[`1:${POINT_TABLE.YX}:${i}:${POINT_FIELD.VALUE}`] = o.list;
						})
					})
					setOptionsMap(optionsMap);
				}

				const dynData = (dynRes.data || []).map(d => {
					d.display_value = NumberUtil.removeCommas(d.display_value);
					delete d.timestamp;
					return d;
				});
				setDynData(dynData);

				// 处理表格数据
				let dataSource = [];
				if (Array.isArray(bayList)) {
					dataSource = bayList.map(o => {
						let item = {};
						(terminalControl.table ? terminalControl.table.columns : []).forEach(i => {
							if (i.key === 'setting') return;

							if (i.key == 'name') {
								item[i.key] = {
									key: i.key,
									value: o.alias,
									text: o.name
								};
							} else {
								let ele = dynData.find(x => x.key == replaceTemplate(i.key, o.alias)) || {};
								let maxEle = dynData.find(x => x.key == replaceTemplate(i.maxAlias, o.alias));
								let minEle = dynData.find(x => x.key == replaceTemplate(i.minAlias, o.alias));
								if (i.maxAlias && maxEle) {
									item[i.maxAlias] = {
										key: replaceTemplate(i.maxAlias, o.alias),
										value: maxEle.display_value,
										text: maxEle.display_value
									}
								}
								if (i.minAlias && minEle) {
									item[i.minAlias] = {
										key: replaceTemplate(i.minAlias, o.alias),
										value: minEle.display_value,
										text: minEle.display_value
									}
								}
								item[i.key] = {
									key: replaceTemplate(i.alias, o.alias),
									value: ele.raw_value != undefined ? ele.raw_value : ele.display_value,
									text: ele.display_value
								}
							}
						})
						return item;
					})
				}
				setTerminalDataSource(Object.assign([], dataSource));

				if (dynData.length > 0) {
					dynData.forEach(x => {
						orignalValue[x.key] = {
							value: 'raw_value' in x ? x.raw_value : x.display_value,
							text: x.display_value
						}
						setInputValue(o => ({
							...o,
							[x.key]: 'raw_value' in x ? x.raw_value : x.display_value,
						}));

						// Bug #156786
						if (x.key === replaceTemplate(siteControl.alias, facBayAlias)) {
							setAllDisabled(x.raw_value == 0);
						}
					});
				}
			})
			.finally(() => setLoading(false))
	}

	const realAlias = (placeHolderAlias, replaceAlias) => {
		return placeHolderAlias.replace(/{[^{}]*}/, replaceAlias);
	};

	const getDynKey = () => {
		var keyList = [];
		const keys = ['alias', 'maxAlias', 'minAlias'];

		if (facBayAlias) {
			const siteRelatedAlias = [];
			siteRelatedAlias.push(siteControl.alias);
			if (Array.isArray(siteControl.controls)) {
				siteControl.controls.forEach(i => {
					keys.forEach(key => {
						siteRelatedAlias.push(i[key]);
					});
					if (Array.isArray(i.subControls)) {
						i.subControls.forEach(j => {
							keys.forEach(key => {
								siteRelatedAlias.push(j[key]);
							});
						})
					}
				})
			}

			siteRelatedAlias
				.filter(tempAlias => !!tempAlias)
				.map(tempAlias => {
					const dynKey = realAlias(tempAlias, facBayAlias);
					if (!keyList.includes(dynKey)) {
						keyList.push(dynKey);
					}
				});
		}

		const columns = terminalControl.table ? terminalControl.table.columns : [];
		if (Array.isArray(columns) && Array.isArray(bayList)) {
			columns.forEach(o => {
				bayList.forEach(i => {
					keys.forEach(key => {
						if (!o[key]) return;
						const dynKey = realAlias(o[key], i.alias);
						if (!keyList.includes(dynKey)) {
							keyList.push(dynKey);
						}
					});
				})
			})
		}

		return keyList;
	}

	const execute = () => {
		let arrayMap = {};
		Object.keys(changedMap).forEach(x => {
			let children = changedMap[x].children || [];
			children.forEach(y => {
				if (orignalValue[y.key] == undefined || Number(orignalValue[y.key].value) != Number(y.value)) {
					arrayMap[y.key] = true;
				} else {
					arrayMap[y.key] = false;
				}
				if (Array.isArray(y.children)) {
					y.children.forEach(z => {
						if (orignalValue[z.key] == undefined || Number(orignalValue[z.key].value) != Number(z.value)) {
							arrayMap[z.key] = true;
						} else {
							arrayMap[z.key] = false;
							arrayMap[y.key] = false;
						}
					})
				}
			})
		})
		if (Object.keys(arrayMap).map(x => arrayMap[x]).every(y => y == false)) {
			notify(msg('nochange'));
		} else {
			// 处理有功提示
			if (terminalControl.validate) {
				// 有功控制模式
				let agcModeArray = Object.keys(inputValue).filter(i => {
					let arr = i.split(":")
					let alias = arr[arr.length - 2];
					let mode = _.takeRight(alias.split("."), 2).join(".")
					return mode == 'EMS.agcMode';
				}).map(x => inputValue[x]);
				let str = '';
				if (!agcModeArray.every(value => value == agcModeArray[0])) {
					str += msg('agcTips');
				}
				// 有功控制设值
				let manPowerArray = Object.keys(inputValue).filter(i => {
					let arr = i.split(":")
					let alias = arr[arr.length - 2];
					let mode = _.takeRight(alias.split("."), 2).join(".")
					return mode == 'EMS.manPower';
				}).map(x => inputValue[x]);
				if (!manPowerArray.every(value => value >= 0) && !manPowerArray.every(value => value <= 0) && str.length === 0) {
					str += `${msg('manTips')}`;
				}
				setModalTips(str);
			}
			setmodalVisible(true);
		}
	}

	const cancel = () => {
		onDisvisitable && onDisvisitable();
	}

	let inputVal = inputValue[replaceTemplate(siteControl.alias, facBayAlias)];

	return (
		<div className="control-panel">
			{
				Array.isArray(treeData) && treeData.length > 0
					? <DevicePanel
						entryModule={entryModule}
						treeData={treeData}
						startAlias={startAlias}
						stopAlias={stopAlias}
						searchKey={searchKey}
						onStart={(aliasList, deviceList, pointAlias, closeFn) => {
							onStart && onStart(aliasList, deviceList, pointAlias, closeFn);
						}}
						onStop={(aliasList, deviceList, pointAlias, closeFn) => {
							onStop && onStop(aliasList, deviceList, pointAlias, closeFn);
						}}
						getMonitor={getMonitor}
						checkAuth={checkAuth}
					/>
					: null
			}
			{
				facBayAlias && <div className="control-right-wrap">
					<header className="control-right-header">
						<span className="control-right-text">
							{siteControl[titleTag]}
						</span>
						{
							siteControl[tipsTag] ?
								<Popover
									overlayClassName={'tips_info_div'}
									content={siteControl[tipsTag]}
									trigger='hover'
									placement='bottomLeft'
								>
									<span
										className={'site-point-item-tips'}
									></span>
								</Popover> : null
						}
						{renderInput(siteControl.type, siteControl.alias.replace('{0}', facBayAlias), false, [], inputVal, (value) => {
							setAllDisabled(value == 0);
							setInputValue(o => ({
								...o,
								[siteControl.alias.replace('{0}', facBayAlias)]: value ? 1 : 0
							}));
							setChangedInputValue(x => ({
								...x,
								[siteControl.alias.replace('{0}', facBayAlias)]: value ? 1 : 0
							}))
							setChangedMap(x => ({
								...x,
								all: {
									title: siteControl[titleTag],
									children: [{
										name: siteControl[titleTag],
										key: replaceTemplate(siteControl.alias, facBayAlias),
										text: value ? Intl('enable') : Intl('disable'),
										value: value ? 1 : 0
									}]
								}
							}))
						})}
					</header>
					<div className="control-right">
						{
							facBayAlias && <SitePanel allDisabled={allDisabled}
								config={siteControl}
								data={dynData}
								privilege={privilege}
								onSubmit={value => {
									setInputValue(x => ({
										...x,
										...value
									}));
									setChangedInputValue(x => ({
										...x,
										...value
									}))
								}}
								onChanged={arr => {
									setChangedMap(x => ({
										...x,
										site: {
											title: siteControl[subTitleTag],
											children: Object.assign([], arr)
										}
									}));
								}}
								facBayAlias={facBayAlias}
								optionsMap={optionsMap}
								socDisabled={emsSOCAuthed}   //Task #173968
							></SitePanel>
						}
						{
							bayList.length > 0 && <TerminalPanel
								onSubmit={value => {
									setInputValue(x => ({
										...x,
										...value
									}));
									setChangedInputValue(x => ({
										...x,
										...value,
									}))
								}}
								onChanged={arr => {
									setChangedMap(x => ({
										...x,
										terminal: {
											title: config.terminalControl[titleTag],
											children: Object.assign([], arr)
										}
									}))
								}}
								config={terminalControl}
								optionsMap={optionsMap}
								dataSource={terminalDataSource}
							></TerminalPanel>
						}
					</div>
					<div className='control-right-footer'>
						<div className='control-right-footer-button' onClick={execute}>
							{msg('execute')}
						</div>
						<div className='control-right-footer-button' onClick={cancel}>
							{msg('cancel')}
						</div>
					</div>
				</div>
			}

			{
				<EnvLoading isLoading={loading} container={document.body} />
			}

			<ControlDialog
				disableEnforceFocus={true}
				handleClass='env-control-handle-class'
				hasAction
				onOk={() => {
					let submitValue = Object.assign({}, changedInputValue);
					Object.keys(submitValue).forEach(i => {
						if ((orignalValue[i] || {}).value == submitValue[i]) {
							delete submitValue[i];
						}
					});
					onSubmit && onSubmit(submitValue, () => {
						setmodalVisible(false);
						let dataSource = JSON.parse(JSON.stringify(terminalDataSource));
						Object.keys(submitValue).forEach(i => {
							const tableNo = i.split(":")[1];
							// 构建场站控制修改后的数据
							if (tableNo == 61) {
								let val = {};
								if (optionsMap[i]) {
									val = optionsMap[i].find(o => o.value == submitValue[i]) || {};
								};
								orignalValue[i] = { text: val.name, value: submitValue[i] };
							} else {
								orignalValue[i] = { text: submitValue[i], value: submitValue[i] }
							}
							// 构建终端控制修改后的数据
							dataSource.forEach((x, index) => {
								Object.keys(x).forEach(y => {
									let key = x[y].key;
									if (key == i) {
										const tableNo = key.split(":")[1];
										dataSource[index][y].value = submitValue[i];
										if (tableNo == 61) {
											let val = {};
											if (optionsMap[key]) {
												val = optionsMap[key].find(o => o.value == submitValue[i]) || {};
											}
											dataSource[index][y].text = val.name;
										} else {
											dataSource[index][y].text = submitValue[i];
										}
									}
								})
							});
							if (!_.isEqual(dataSource, terminalDataSource)) {
								setTerminalDataSource(dataSource);
							}
						});
						setChangedMap({
							all: {},
							site: {},
							terminal: {}
						})
						// notify(msg('modifySuccess'));
						onDisvisitable && onDisvisitable();    // Bug #156786
						setChangedInputValue({});
						setInputValue({});
					});
				}}
				visible={modalVisible}
				title={msg('changedConfirm')}
				onCancel={() => setmodalVisible(false)}
				content={
					<div>
						{
							modalTips ?
								<div className='modal-tips'>
									<div className='modal-tips-title'>
										<span className="img" />
										<span>{msg('warn')}</span>
									</div>
									<div className='modal-tips-content'>{modalTips}</div>
								</div> : null
						}
						{
							Object.keys(changedMap).map((o, ind) => {
								let children = changedMap[o].children || [];
								if (children.length === 0) return null;

								let data = [];
								const dataSource = [];
								children.forEach(i => {
									let orignal = orignalValue[i.key] || {};
									let subChildren = i.children || [];
									let ele = data.find(y => y.key == i.key);
									let beforeStr = '';
									let afterStr = '';

									if (i.value != undefined && Number(orignal.value) != Number(i.value)) {
										beforeStr += `\n${orignal.text == undefined ? '' : orignal.text}`;
										afterStr += `\n${i.text}`;
										if (ele) {
											if (ele.before) {
												ele.before += beforeStr;
											}
											if (ele.after) {
												ele.after += afterStr;
											}
										} else {
											data.push({
												name: i.name,
												before: orignal.text == undefined ? '' : orignal.text,
												after: i.text,
												key: i.key
											})
										}
									}
									if (subChildren.length > 0) {
										subChildren.forEach(x => {
											let subOrignal = orignalValue[x.key] || {};
											if (x.value != undefined && Number(subOrignal.value) != Number(x.value)) {

												// TODO 名称改变
												// originalName: multi类型怪异的交互
												beforeStr += `\n${'originalName' in x ? x.originalName : x.name}：${subOrignal.text == undefined ? '' : subOrignal.text}`;
												afterStr += `\n${x.name}：${x.text}`;
												if (ele) {
													if (ele.before) {
														ele.before += beforeStr;
													}
													if (ele.after) {
														ele.after += afterStr;
													}
												} else {
													data.push({
														name: i.name,
														before: `${'originalName' in x ? x.originalName : x.name}：${subOrignal.text == undefined ? '' : subOrignal.text}`,
														after: `${x.name}：${x.text}`,
														key: i.key
													})
												}
											}
										})
									}

									// 不应该使用name
									data.forEach(x => {
										let ele = dataSource.find(i => i.name == x.name);
										if (ele) {
											if (ele.before && ele.before.indexOf(x.before) <= -1) {
												ele.before += '\n' + x.before;
											}
											if (ele.after && ele.after.indexOf(x.after) <= -1) {
												ele.after += '\n' + x.after;
											}
										} else {
											dataSource.push({
												name: x.name,
												before: x.before,
												after: x.after
											})
										}
									})
								});

								if (dataSource.length === 0) return null;

								let temp = columns;
								if (o === 'terminal') {
									temp = temp.slice(1);
									temp.unshift({
										key: 'name',
										dataIndex: 'name',
										title: msg('wtgName'),
										align: 'center',
										width: 100,
									});
								}
								return <div key={ind}>
									<div className='control-modal-item-title'>
										{changedMap[o].title}
									</div>
									<div>
										<Table
											rowKey={'name'}
											columns={temp}
											data={dataSource}
										></Table>
									</div>
								</div>;
							})
						}
					</div>
				}
			></ControlDialog>
		</div>
	);
}

ControlPanel.propTypes = {
	options: PropTypes.shape({
		dom: PropTypes.instanceOf(Element),
		config: PropTypes.object,
		startStopData: PropTypes.shape({
			treeData: PropTypes.array,
			entryModule: PropTypes.string.isRequired,
			startAlias: PropTypes.string.isRequired,
			stopAlias: PropTypes.string.isRequired,
			searchKey: PropTypes.string,
		}),
		facBayAlias: PropTypes.string,
		bayList: PropTypes.arrayOf(PropTypes.shape({
			alias: PropTypes.string,
			name: PropTypes.string,
		})),
		privilege: PropTypes.objectOf(PropTypes.number),
		onStart: PropTypes.func,
		onStop: PropTypes.func,
		onSubmit: PropTypes.func
	}).isRequired,
}