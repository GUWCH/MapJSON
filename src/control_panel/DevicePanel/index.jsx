import React, { useState, useEffect, useRef } from "react";
import "./index.scss";
import { msgTag } from "../../common/lang";
import Tree, { TreeNode } from "rc-tree";
import "rc-tree/assets/index.css";
import { notify } from 'Notify';
import _ from "lodash";
import ControlDialog from "../ControlDialog";
import {_dao} from '../../common/dao'

let gData = [];
export default function DeviceList(props) {
	const msg = msgTag("control");
	const {
		onStart,
		onStop,
		treeData: treeObj,
		searchKey = "display_name",
		startAlias,
		stopAlias,
		getMonitor,
		checkAuth,
		entryModule
	} = props;
	const [keyword, setKeyword] = useState(undefined);
	const [filterKeys, setFilterKeys] = useState([]);
	const [expandKeys, setExpandKeys] = useState([]);
	const [autoExpandParent, setAutoExpandParent] = useState(false);
	const [checkedNodes, setCheckedNodes] = useState([]);
	const treeRef = useRef(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [currentOperate, setCurrentOperate] = useState(undefined);
	const [treeData, setTreeData] = useState([]);
	const [afterStartAlias, setAfterStartAlias] = useState('');
	const [afterStopAlias, setafterStopAlias] = useState('');
	const [checkedNum,setCheckedNum] = useState(0)
	const [maxLimit,setMaxLimit] = useState('')
	const [isNewLimit, setIsNewLimit] = useState(false);
	const [isExceed,setIsExceed] = useState(false)
	const [limitId, setLimitId] = useState(null);
	const [btnState, setBtnState] = useState({
		needMonitor: false,
		operateUser: '',
		monitor: false,
		exe: false
	});

	useEffect(() => {
		_dao.memo('get', {
			type: '4060',
			description: entryModule=='storage'?'storage':'solar',
			is_desc: '1'
		}).then(res=>{
			if(res.code == 10000 && res.count !=0){
				setIsNewLimit(true)
				setLimitId(res.data[0].id)
				setMaxLimit(res.data[0].content)
			}
		})
		gData = treeObj;
		setTreeData(transformTreeData(treeObj.map(o => { delete o.children; return o; })))
	}, [treeObj])

	const onSearch = () => {
		let keys = gData
			.filter((o) => o[searchKey].toLowerCase().indexOf(keyword && keyword.toLowerCase()) !== -1)
			.map((i) => i.id);
		if (keys.length > 0) {
			treeRef.current.scrollTo({ key: keys[0] });
		}else{
			const message = msg('noMatched')
			notify(message);
		}
	};

	useEffect(() => {
		let keys = gData.filter((o) => o[searchKey].toLowerCase().indexOf(keyword && keyword.toLowerCase()) > -1);
		if (keys) {
			setFilterKeys(keys.map((i) => i.id));
			setExpandKeys(keys.map((i) => i.id));
			setAutoExpandParent(true);
		}
	}, [keyword]);

	const transformTreeData = (data) => {
		let result = [];
		if (!Array.isArray(data)) {
			return result;
		}
		let map = {};
		data.forEach((item) => {
			item.key = item.id;
			item.title = item.display_name;
			item.iconPath = item.icon || '';
			delete item.icon;
			map[item.id] = item;
		});
		data.forEach((item) => {
			let parent = map[item.pid];
			item.key = item.id;
			item.title = item.display_name;
			if (parent) {
				(parent.children || (parent.children = [])).push(item);
			} else {
				result.push(item);
			}
		});
		return result;
	};

	const onExpand = (expandedKeys) => {
		setExpandKeys(expandedKeys);
		setAutoExpandParent(false);
	};

	const onCheck = (keys, info) => {
		const checkedArr = info.checkedNodes.filter((o) => isLeafNode(o))
		setCheckedNum(checkedArr.length)
		if(maxLimit&&checkedArr.length > maxLimit){
			notify(msg('selectedExceed'));
			setIsExceed(true)
		}else{
			setIsExceed(false)
		}
		setCheckedNodes(info.checkedNodes.filter((o) => isLeafNode(o)));
	};

	const onBlur = (e)=>{
		if(maxLimit&&checkedNodes.length > maxLimit){
			notify(msg('selectedExceed'));
			setIsExceed(true)
		}else{
			setIsExceed(false)
		}
	}

	const isLeafNode = (node) => {
		return !node.children || node.children.length <= 0;
	};

	const preStart = () => {
		const alias = handleAlias(startAlias);
		if (alias) {
			if(isExceed){
				notify(msg('selectedExceed'));
				return
			}
			let cb = (needMonitor) => {
				setAfterStartAlias(alias);
				setCurrentOperate("start");
				setBtnState(o => Object.assign({}, o, {needMonitor}));
				setModalVisible(true);
			};
			
			if(typeof getMonitor === 'function'){
				getMonitor(
					'start',
					// 别名不能超过5段
					checkedNodes.map(o => `${o.alias}.${(alias || '').split('.').slice((o.alias || '').split('.').length - 5).join('.')}`), 
					checkedNodes.map(o => `${o.alias}`), 
					alias,
					function(needMonitor){
						cb(needMonitor);
						cb = undefined;	
					}
				);
				return;
			}
	
			cb();
			cb = undefined;
		}
	};

	const preStop = () => {
		const alias = handleAlias(stopAlias);
		if (alias) {
			if(isExceed){
				notify(msg('selectedExceed'));
				return
			}
			let cb = (needMonitor) => {
				setafterStopAlias(alias);
				setCurrentOperate("stop");
				setBtnState(o => Object.assign({}, o, {needMonitor}));
				setModalVisible(true);
			};

			if(typeof getMonitor === 'function'){
				getMonitor(
					'stop',
					// 别名不能超过5段
					checkedNodes.map(o => `${o.alias}.${(alias || '').split('.').slice((o.alias || '').split('.').length - 5).join('.')}`), 
					checkedNodes.map(o => `${o.alias}`), 
					alias,
					function(needMonitor){
						cb(needMonitor);
						cb = undefined;	
					}
				);
				return;
			}
	
			cb();
			cb = undefined;
		}
	};

	const handleAlias = (alias) => {
		if (checkedNodes.length <= 0) {
			notify(msg('noSelected'));
			return false;
		}
		let aliasArr = [];
		if (!alias || (aliasArr = alias.split(".")).length < 2) {
			notify(msg("paramError"));
			return false;
		}
		return _.takeRight(aliasArr, 2).join(".");
	};

	return ((
		<fieldset className="control-device-panel">
			<div className="control-device-tree">
				<div className="control-device-head">
					<span className="control-device-title">{`${msg("batchOperate")}`}</span>
					<div className="control-device-content">
						<div>{`${msg("hasSelected")}(${checkedNum})`}</div>
					</div>
					<div className="control-device-content">
						<div className="control-device-total">
							{msg("maxLimit")}:
							<input id="maxLimit" maxLength={8} value={maxLimit} onChange={(e) => {
								var reg = /[^\d]/g // 校验是否数字
								var regNoZeroStart = /^0+(\d)/ //校验是否0开头
								e.target.value = e.target.value.replace(reg,'').replace(regNoZeroStart,'$1')
								setMaxLimit(e.target.value);
							}}
							onBlur={onBlur}
							/>
						</div>
					</div>
				</div>
				<div className="control-device-input-wrap">
					<input className='control-device-input' onChange={(e) => setKeyword(e.target.value)} 
					onKeyDown={e=>{
							e = window.event || e;
							if(e.keyCode == 13 || e.which == 13){
								onSearch()
							}
						}
					}></input>
					<div className='control-device-search' onClick={onSearch}>
						<i></i>
					</div>
				</div>
				<div className="control-device-list">
					<Tree
						onExpand={onExpand}
						autoExpandParent={autoExpandParent}
						showLine
						filterTreeNode={(node) => {
							return keyword && filterKeys.indexOf(node.key) > -1;
						}}
						onCheck={onCheck}
						expandedKeys={expandKeys}
						switcherIcon
						checkable
						selectable={false}
						ref={treeRef}
						treeData={treeData.map(d => {
							if(d.iconPath){
								d.icon = (props)=>{
									return <span
										style={{
											width: 16,
											height: 16,
											display: 'inline-block',
											background: `url(${d.iconPath}) 0 0 no-repeat`
										}}
									></span>;
								}
							}
							return d;
						})}
					></Tree>
				</div>
			</div>
			<div className="control-device-operate">
				<button className="control-device-stop" onClick={preStart}>
					{msg("start")}
				</button>
				<button className="control-device-stop" onClick={preStop}>
					{msg("stop")}
				</button>
			</div>
			<ControlDialog
				classes={{
					root: 'control-device-panel-dialog-root'
				}}
				disableEnforceFocus={true}
				handleClass='control-device-panel-dialog'
				content={
					<div className="control-device-panel-dialog-content">
						<div>
							<ul>
								{checkedNodes.map((o) => (
									<li key={o.id} style={{ listStyle: "none" }}>
										{o.display_name}
									</li>
								))}
							</ul>
						</div>
						<div className="control-device-panel-dialog-btns">
							{
								btnState.needMonitor && 
								<div>
									<button
										onClick={(e) => {
											typeof checkAuth === 'function' && checkAuth(function(u, p){
												setBtnState(o => Object.assign({}, o, {
													operateUser: u,
													monitor: true
												}));
											});
										}}
									>{msg('operateUser')}</button>
									<button
										disabled={!btnState.monitor}
										onClick={(e) => {
											typeof checkAuth === 'function' && checkAuth(function(u, p){
												setBtnState(o => Object.assign({}, o, {
													exe: true
												}));
											}, btnState.operateUser);
										}}
									>{msg('monitor')}</button>
								</div>
							}							
							<div>
								<button
									disabled={btnState.needMonitor && !btnState.exe}
									onClick={(e) => {
										if (currentOperate == "start") {
											onStart && onStart(
												checkedNodes.map(o => `${o.alias}.${afterStartAlias}`), 
												checkedNodes.map(o => `${o.alias}`), 
												afterStartAlias,
												() => {
													setCurrentOperate(undefined);
													setBtnState({
														needMonitor: false,
														operateUser: '',
														monitor: false,
														exe: false
													});
													setModalVisible(false);
													let apiMethod
													let data = {
																type: '4060',
																content: maxLimit,
																description: entryModule=='storage'?'storage':'solar',
																is_desc: '1'
															}
													if(isNewLimit){
														apiMethod = 'update'
														data.id = limitId
													}else{
														apiMethod = 'insert'
													}
													_dao.memo(apiMethod, data)
												}
											);
										} else if (currentOperate == "stop") {
											onStop && onStop(
												checkedNodes.map(o => `${o.alias}.${afterStopAlias}`), 
												checkedNodes.map(o => `${o.alias}`), 
												afterStopAlias,
												() => {
													setCurrentOperate(undefined);
													setBtnState({
														needMonitor: false,
														operateUser: '',
														monitor: false,
														exe: false
													});
													setModalVisible(false);
												}
											);
										}else{
											setCurrentOperate(undefined);
											setBtnState({
												needMonitor: false,
												operateUser: '',
												monitor: false,
												exe: false
											});
											setModalVisible(false);
										}	
									}}
								>{msg('ok')}</button>
								<button
									onClick={(e) => {
										setBtnState({
											needMonitor: false,
											operateUser: '',
											monitor: false,
											exe: false
										});
										setModalVisible(false)
									}}
								>{msg('cancel')}</button>
							</div>
						</div>
					</div>
				}
				title={msg("objConfirm")} 
				onCancel={() => {
					setBtnState({
						needMonitor: false,
						operateUser: '',
						monitor: false,
						exe: false
					});
					setModalVisible(false)
				}}
				hasAction={false} 
				visible={modalVisible} 
			/>
		</fieldset>
	)
	);
}
