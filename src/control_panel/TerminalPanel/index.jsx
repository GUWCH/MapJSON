/* eslint-disable complexity */
import React, { useState, useEffect } from "react";
import "./index.scss";
import Intl, { msgTag } from '../../common/lang';
import ControlTable from "../ControlTable";
import { renderInput, replaceTemplate } from "../Constant";
import { notify } from 'Notify';
import ControlDialog from "../ControlDialog";
import { NumberUtil } from '../../common/utils';

const isZh = (Intl.locale || "").toLowerCase().indexOf("cn") > -1;
const msg = msgTag('control');

export default function TerminalPanel(props) {
	const { 
		config={}, 
		dataSource = [], 
		onSubmit, 
		onChanged, 
		optionsMap = {} 
	} = props;
	const { table={} } = config;
	const { columns=[] } = table;
	const titleTag = isZh ? 'titleCN' : 'title';
	const tipsTag = isZh ? 'tipsCN' : 'tips';

	const [allState, setAllState] = useState({
		visible: false, // 窗口可见
		modalTitle: '', // 窗口标题
		modalData: {},  // 窗口数据
		setDataItems: [], // 窗口对应数据项
		changedMap: {},
		changedArray: []
	});
	const [selectItems, setSelectItems] = useState([]);
	const dialogDataMap = React.useRef({});

	const changeDialogData = (newDialogDataMap) => {
		dialogDataMap.current = newDialogDataMap;
	}

	const setState = (opt={}) => {
		setAllState(Object.assign({}, allState, opt));
	};

	const onSelected = (list) => {
		setSelectItems(list);
	};

	const onSelectedAll = (checked) => {
		if(checked){
			setSelectItems(dataSource);
		}else{
			setSelectItems([]);
		}
	}

	const isAllChecked = () => {
		if(dataSource.length === 0){
			return false;
		}else{
			let isAll = true;
			dataSource.map(d => {
				if(selectItems.filter(item => d.name.value === item.name.value).length === 0){
					isAll = false;
				}
			})
			return isAll;
		}
	}

	const changeSet = (dataItem) => {
		const rawItem = dataItem || dataSource[0];
		const { name: { value: bayAlias }} = rawItem;
		const modalData = {};

		columns
		.filter(i => i.isEdit && i.alias)
		.map(i => {
			const optionKey = replaceTemplate(i.alias, bayAlias);
			const options = optionsMap[optionKey] || [];
			modalData[i.alias] = options[0] ? options[0].value : 0;
		});

		if(dataItem){
			const { name: {value: bayAlias} } = dataItem;
			const changedMap = allState.changedMap;
			Object.keys(modalData).map(k => {
				const key = replaceTemplate(k, bayAlias);
				modalData[k] = key in changedMap ? changedMap[key] : dataItem[k].value;
			});
		}

		if(dataItem){
			setState({
				visible: true,
				modalTitle: `${dataItem.name.text}${isZh ? '' : ' '}${msg('set')}`,
				modalData,
				setDataItems: [JSON.parse(JSON.stringify(dataItem))]
			});
		}else{
			if (selectItems.length <= 0) {
				notify(msg('selectOne'))
			} else {
				setState({
					visible: true,
					modalTitle: msg('batchSet'),
					modalData,
					setDataItems: JSON.parse(JSON.stringify(selectItems))
				});
			}
		}		
	};

	const onClose = () => {
		changeDialogData({});
		setState({
			visible: false,
			modalTitle: '',			
			modalData: {},
			setDataItems: []
		});
	};

	const onOk = () => {
		const { setDataItems, modalData, changedArray, changedMap } = allState;

		let tempChangedArray = JSON.parse(JSON.stringify(changedArray));
		let tempChangedMap = Object.assign({}, changedMap);

		// 顶层传送门, 否则不更新已改变值导致判断错误
		let portalChangedMap = Object.assign({}, changedMap);

		setDataItems.forEach(i => {
			const {name: {value: bayAlias, text }} = i;

			columns.filter(i => i.isEdit).map(column => {
				const { alias } = column;
				const name = column[titleTag];

				const rawVal = (i[alias] || {}).value;
				const newVal = Object.assign({}, modalData, dialogDataMap.current)[alias];
				const key = replaceTemplate(alias, bayAlias);

				portalChangedMap[key] = newVal;

				if(rawVal == newVal){
					delete tempChangedMap[key];
					let eleIndex = tempChangedArray.findIndex(x => x.key == key);
					if(eleIndex > -1){
						let ele = tempChangedArray[eleIndex];
						const subArray = JSON.parse(JSON.stringify(ele.children || []));
						const subIndex = subArray.findIndex(x => x.key == key);
						if(subIndex > -1){
							subArray.splice(subIndex, 1);
							if(subArray.length === 0){
								tempChangedArray.splice(eleIndex, 1);
							}else{
								tempChangedArray[eleIndex].children = subArray;
							}
						}
					}
					return;
				}

				const options = optionsMap[key] || [];
				const optionsValue = (options || []).find(x => x.value == newVal) || {};

				tempChangedMap[key] = newVal;

				const temp = {
					name: name,
					text: optionsValue.name || newVal,
					value: newVal,
					key: key
				};
				let eleIndex = tempChangedArray.findIndex(x => x.key == key);				
				if (eleIndex > -1) {
					let ele = tempChangedArray[eleIndex];
					const subArray = JSON.parse(JSON.stringify(ele.children || []));
					const subIndex = subArray.findIndex(x => x.key == key);
					
					if (subIndex > -1) {
						subArray[subIndex] = temp;
					} else {
						subArray.push(temp);
					}
					tempChangedArray[eleIndex].children = subArray;
				} else {
					tempChangedArray.push({
						name: text,
						key: key,
						children: [temp]
					})
				}			
			});
		});
		
		onChanged && onChanged(JSON.parse(JSON.stringify(tempChangedArray)));
		onSubmit && onSubmit(portalChangedMap);

		changeDialogData({});
		setState({
			visible: false,
			modalTitle: '',
			modalData: {},
			setDataItems: [],
			changedMap: tempChangedMap,
			changedArray: tempChangedArray
		});
	};	

	return <div className="terminal-panel">
		<h4 className='control-right-title'>{config[titleTag]}</h4>
		<ControlTable 
			inputMap={allState.changedMap} 
			onSetting={changeSet} 
			onSelected={onSelected} 
			dataSource={dataSource}
			columns={columns}
			optionsMap={optionsMap}
			curSelected={selectItems}
		></ControlTable>
		<div className='control-right-tips'>
			{config[tipsTag] && <div className='control-right-tips-text'>
				<span className='img' />
				<span>{config[tipsTag]}</span>
			</div>
			}
			<div className='control-right-tips-all'>
				<input id='selectAll' type='checkbox' checked={isAllChecked()} onChange={(e) => {onSelectedAll(e.target.checked)}}/>
				<label htmlFor='selectAll'>{msg('selectAll')}</label>
			</div>
			<div className='batch-setting' onClick={()=>changeSet()}>{msg('batchSet')}</div>
		</div>
		<ControlDialog 
			handleClass='control-terminal-dialog-title' 
			title={allState.modalTitle} 
			visible={allState.visible} 
			onOk={onOk} 
			hasCancel={false} 
			onCancel={onClose} 
			hasAction
			content={
				<div style={{margin: 10}}>
					<SingleDevice 
						columns={columns}
						rawData={allState.modalData}
						itemDatas={allState.setDataItems}
						optionsMap={optionsMap}
						onChange={changeDialogData}
					/>
				</div>
			} 
		/>
	</div>;
}

const SingleDevice = (props) => {
	const { columns=[], rawData={}, itemDatas=[], optionsMap, onChange } = props;
	const [itemMap, setItemMap] = useState({});
	const titleTag = isZh ? 'titleCN' : 'title';
	const finalData = Object.assign({}, JSON.parse(JSON.stringify(rawData)), itemMap);

	// eslint-disable-next-line complexity
	const renderDialog = column => {
		if(!itemDatas[0]) return null;

		const { name: { value: bayAlias } } = itemDatas[0];
		const { alias, maxAlias, minAlias, related, relatedValue, type, step } = column;
		const columnName = column[titleTag];
		const optionKey = replaceTemplate(alias, bayAlias);

		const options = optionsMap[optionKey] || [];
		const disabled = related ? finalData[related] != relatedValue : false;
		const currentVal = finalData[alias];
		let min, max;

		if (maxAlias) {
			const maxArr = itemDatas
			.filter(d => maxAlias in d)
			.map(d => d[maxAlias].value)
			.filter(v => NumberUtil.isFinite(v));
			if(maxArr.length > 0){
				max = Math.max(...maxArr);
			}
		}

		if (minAlias) {
			const minArr = itemDatas
			.filter(d => minAlias in d)
			.map(d => d[minAlias].value)
			.filter(v => NumberUtil.isFinite(v));
			if(minArr.length > 0){
				min = Math.min(...minArr);
			}
		}
		
		return <div key={alias} className='terminal-modal-item'>
			<span 
				className='terminal-modal-input-label' 
				title={columnName}
			>{columnName}</span>
			<span className='terminal-modal-input-wrap'>
				{renderInput(type, alias, disabled, options, currentVal, (v) => {
					setItemMap(Object.assign({}, itemMap, {[alias]: v}));
					onChange(Object.assign({}, itemMap, {[alias]: v}));
				}, min, max, step)}
			</span>
		</div>
	};

	return <>{columns.filter(i => i.isEdit).map(i => renderDialog(i))}</>;
}
