import React, {useContext, useEffect, useState, useMemo } from "react";
import { Collapse, InputNumber } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {Input, Checkbox, Tooltip} from 'antd';
import _, { omit } from "lodash";
import { styleSetContent, msgConvert } from "../constant";
import { keyStringMap, getPointType, isZh } from "../../../constants";
import { Actions, GlobalContext} from '../context';
import TreeMultiSelect from './treeSelect';
import ColorPick from "ColorPick";
import { Condition, SetSelect as Select } from "@/components";
import { FontIcon, IconType } from 'Icon';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { InputTextSize } from "@/common/constants";
import './style.scss';

const { Panel } = Collapse;

const quotaSetUnitPrefixCls = "env-quota-set-unit";
const panelDropDownPrefixCls = 'panel-drop-down';

const getName = (item?: {nameCn?:string;nameEn?:string;name?:string;name_en?:string;}) => {
	let {nameCn, nameEn, name, name_en} = item || {};
	return isZh ? nameCn || name || '' : nameEn || name_en || '';
}

function AssociatedSet(props){
	let {state, dispatch} = useContext(GlobalContext);
	let {quotaOptions, quotaData} = state;
	let {locObj, model, selectedData} = props;

	if(selectedData.length < 1) return null;

	let {
		location = "",
		associatedContent = {}
	} = locObj;

	let {
		type = '',
		name = '',
		incluedNo = true,
	} = associatedContent;


	let options = ((quotaOptions[model])[location] || {})[type] || [];

	let newOptions = options.map(option => {
		return {
			value: option,
			name: getName(quotaData[option])
		}
	})

	let { associated} = (quotaData[selectedData[0]]?.[model])[location] || {}; 

	let valueOptions = [];

	let finalValue: string | null = null;
	let key;

	let {associatedValue = null, color = null} = associated || {};

	if(associated){
		let {
			tableNo = '',
			fieldNo = '',
			alias = '',
			nameCn,
			nameEn,
			valueList = []
		} = associated;

		key = tableNo + alias + fieldNo === '' ? null : tableNo  + ":"+ alias + ":" + fieldNo;

		finalValue = key;

		if(newOptions.map(ele => ele.value).indexOf(key) === -1 && key){
			finalValue = getName(associated);
		}

		valueOptions = (quotaData[key]?.valueList || valueList || []).map(option => {
			return {
				value: option.value.toString(),
				name: getName(option)
			}
		});
	}

	const handleQuotaChange = (e) => {

		let newQuotaData = JSON.parse(JSON.stringify(quotaData));

		let locObj = ((newQuotaData[selectedData[0]])[model])[location];

		if(e){
			let {tableNo = '', fieldNo = '', alias = '', nameCn = '', nameEn = '', valueList = []} = quotaData[e] || {};
			locObj[type] = {
				tableNo: tableNo,
				fieldNo: fieldNo,
				alias: alias,
				nameEn: nameEn,
				nameCn: nameCn,
				associatedValue: null,
				valueList: valueList,
                color: null
			}
		}else{
			locObj[type] = e;
		}

		dispatch({type: Actions.SET_STATE, quotaData: newQuotaData });
	}

	const handleChange = (e, keyString) => {

		let newQuotaData = JSON.parse(JSON.stringify(quotaData));
		let locData = ((newQuotaData[selectedData[0]])[model])[location];
		Object.assign(locData[type], {[keyString]: e}) 

		dispatch({type: Actions.SET_STATE, quotaData: newQuotaData });
	}

	return useMemo(() => {
		return (
			<div className={`${quotaSetUnitPrefixCls}-associated`}>
				<div className={`${quotaSetUnitPrefixCls}-associated-select`}>
					<span>{name}</span>
					<Select 
						className = {`${quotaSetUnitPrefixCls}-loc`}  
						options = {newOptions} 
						value = {finalValue} 
						incluedNo = {incluedNo} 
						onChange = {handleQuotaChange}
					/>
				</div>
				{key ? <div className={`${quotaSetUnitPrefixCls}-associated-style`}>
					<Select 
						className = {`${quotaSetUnitPrefixCls}-loc`}  
						options = {valueOptions} 
						value = {associatedValue} 
						onChange = {(e) => {handleChange(e, 'associatedValue')}}
					/>
					<ColorPick 
						value = {color} 
						onColorChange = {(e) => {handleChange(e, 'color')}}
					/>
				</div>: null}
			</div>
		);
	}, [key, associatedValue, color])
}

const LocSet = (props) => {

	let {state, dispatch} = useContext(GlobalContext);

	let {functionData} = state;

	let {locObj = {}, model} = props;

	let {
		location = "",
		locSet = []
	} = locObj;

	return locSet.map((item, index) => {
		const {
			mode = '',
			type = '',
			name = '',
			incluedNo = true,
			defaultValue,
			options = [],
			max, min
		} = item;

		const value = ((functionData[model])[location] || {})[type];

		const handleChange = (e) => {
			const newfunctionData = _.cloneDeep(functionData)
			newfunctionData[model][location] = Object.assign({},
				(newfunctionData[model])[location] || {},
				{[type]: e}
			);

			dispatch({type: Actions.SET_STATE, functionData: newfunctionData });
		};

		if(value === undefined && defaultValue !== undefined){
			handleChange(defaultValue)
		}

		switch(mode){
			case 'select':
				return useMemo(() => {
					return (
						<div key = {index} className={`${quotaSetUnitPrefixCls}-content-select`}>
							<span>{name}</span>
							<Select 
								className = {`${quotaSetUnitPrefixCls}-loc`} 
								options = {options} 
								value = {value} 
								incluedNo = {incluedNo} 
								onChange = {handleChange}
							/>
						</div>
					);
				},[value])
			case 'input':
				return useMemo(() => <div key={index} style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}>
					<span>{name}</span>
					<InputNumber size="small" value={value} max={max ?? 100} min={min ?? 10} onChange={handleChange}/>
				</div>, [value])
				
			default:
				return null;
		}
	})
}

const QuotaSelect = (props) => {

	let {state, dispatch} = useContext(GlobalContext);

	let {quotaData, functionData} = state;

	let {selectedData = [], optionData = [], locObj = {}, model} = props;

	let {
		location = "",
		quotaSelect = {},
		limitNum = -1,
		expandSet = false,
        expandSetContent
	} = locObj;

	let { mode, name, defaultValue, incluedNo} = quotaSelect;

	if(mode === "treeSelect"){

		let options: {title?: string; value: string}[] = [];

		optionData.map((alias, index) => {
			options.push({
				title: getName(quotaData[alias]),
				value: alias
			})
		})

		let data = Object.assign({},
			{ 
				limitNum: limitNum,
				options: options
			}
		)

		return <TreeMultiSelect 
			selected = {selectedData} 
			data = {data} 
			location = {location}
			model = {model}
		/>
	}

	if(mode === "singleSelect"){

		let currentOptions = optionData.map(alias => {
			return {
				name: getName(quotaData[alias]),
				value: alias
			}
		});

		let alias = selectedData[0] || defaultValue;

		const handleChange = (value) => {

			let newQuotaData = JSON.parse(JSON.stringify(quotaData));

			if(alias && newQuotaData[alias]){
				(newQuotaData[alias])[model] = omit((newQuotaData[alias])[model], [location]);
			}

			if(value && newQuotaData[value]){
				let fuctionType = (functionData[model])[location]?.type;
				((newQuotaData[value])[model])[location] = fuctionType ? {type: fuctionType} : {};
				let {keyString} = expandSetContent || {};
				if(expandSet && keyString === keyStringMap.VALUE_LIST_STYLE){
					let tempQuotaValueList = JSON.parse(JSON.stringify(quotaData[value]?.valueList || []));
					let styleData = ((newQuotaData[value][model])[location])[keyString];

					let items = tempQuotaValueList.map(ele => {
						let index = (styleData || []).findIndex(s => s.value == ele.value);
						if(index > 0){
							let {value, name, ...rest} = styleData[index];
							return Object.assign({}, ele, {...rest} , {order: index});
						}
						return Object.assign({}, ele, {order: index});
					})
					.sort(function(a, b){ return a.order - b.order;})
			
					if(tempQuotaValueList.length > 0 || !styleData){
			
						(((newQuotaData[value])[model])[location])[keyString] = items;
					}
				}
			}
			dispatch({type: Actions.SET_STATE, quotaData: newQuotaData });
		}

		let finalValue = alias;

		if(currentOptions.map(ele => ele.value).indexOf(alias) === -1 && alias){
			finalValue = getName(quotaData[alias]);
		}

		return (<div className={`${quotaSetUnitPrefixCls}-content-select`}>
			<span>{name || ''}</span>
			<Select 
				className = {`${quotaSetUnitPrefixCls}-loc`}
				options = {currentOptions} 
				value = {finalValue} 
				incluedNo = {incluedNo} 
				onChange = {handleChange}
			/>
		</div>)
	}

	return null;
}

function PanelDropDownContent(props){

	let {itemData = {}, location = '', keyString = '', aliasKey = '', model} = props;

	let pointType = keyString === keyStringMap.VALUE_LIST_STYLE ? 'yx' : getPointType(itemData.tableNo);

	let locContent = (styleSetContent[model])[location] || (styleSetContent[model])[keyStringMap.UNIVERSAL] || {};
	let contentList = locContent[pointType] || [];

	const renderItemContent = (contentItem, index) => {

		let { mode, type, name, incluedNo, options, defaultValue, needbaseInform = false} = contentItem;

		let {state, dispatch} = useContext(GlobalContext);

		let {quotaData, functionData, quotaOptions} = state;

		let value = undefined;
		switch(keyString){

			case keyStringMap.VALUE_LIST_STYLE:
				let {tableNo, alias, fieldNo} = itemData[type] || {};
					
				let keyStr = tableNo + ':' + alias + ':' + fieldNo;

				value = needbaseInform ? (quotaData[keyStr] ? keyStr : null) : itemData[type];

				break;

			default:
				value = ((itemData[model])[location])[type];
		};

		type === keyStringMap.DATA_SOURCE ? options = ((quotaOptions[model])[location]?.dataSource || []).filter((key =>{
			return quotaData[key]
		}))
		.map((key) =>{
			return {
				value: key,
				name: getName(quotaData[key])
			}
		}) : null;

		let restProps = Object.assign(
			{},
			{key: index},
			mode ? {mode: mode} : {},
			type ? {type: type} : {},
			incluedNo ? {incluedNo: incluedNo} : {},
			options ? {options: options} : {},
			value !== undefined ? {value: value} : {}
		);

		const handleChange = (e) => {
			if(keyString === keyStringMap.VALUE_LIST_STYLE){
				let newQuotaData = JSON.parse(JSON.stringify(quotaData));
				let locObj = ((newQuotaData[aliasKey])[model])[location] || {};
				let valueListArr = locObj[keyString] || [];

				let newItem = valueListArr.find((data) => {
					return data.value.toString() === itemData.value.toString();
				})

				let targetChangeValue = needbaseInform && e ? {
					alias: newQuotaData[e]?.alias,
					tableNo: newQuotaData[e]?.tableNo,
					fieldNo: newQuotaData[e]?.fieldNo,
					unit: newQuotaData[e]?.unit,
					nameCn: newQuotaData[e]?.nameCn,
					nameEn: newQuotaData[e]?.nameEn
				}: e;

				if(!newItem){
					let tempObj = Object.assign({}, itemData, {
						[type]: targetChangeValue
					});
					valueListArr.length === 0 ? locObj[keyString] = [tempObj] : locObj[keyString].push(tempObj);
				}else{
					newItem[type] = targetChangeValue;
				}
				dispatch({type: Actions.SET_STATE, quotaData: newQuotaData });

			}else{
				let newQuotaData = JSON.parse(JSON.stringify(quotaData));

				let typeKey = type;

				if(type === 'edictName'){
					typeKey = isZh ? 'edictNameCn' : 'edictNameEn';
				}
					
				(((newQuotaData[aliasKey])[model])[location])[typeKey] = e;

				dispatch({type: Actions.SET_STATE, quotaData: newQuotaData })
			}
		}

		if(value === undefined && defaultValue !== undefined){
			handleChange(needbaseInform ? defaultValue.alias : defaultValue)
		}

		const renderByMode = (props) => {
			let {mode} = props;

			if(!mode) return null;

			switch(mode){
				case 'input':
					return(<Input maxLength={InputTextSize.Simple} {...restProps} onChange = {(e) => handleChange(e.target.value)}></Input>)
				case 'select':
					return(<Select {...restProps} onChange = {handleChange}></Select>)
				case 'color':
					return(<ColorPick {...restProps} onColorChange = {handleChange} />)
				case 'condition':
					let valueListOptions = (quotaData[aliasKey]?.valueList || []).map(option => {
						return {
							value:option.value?.toString() || '', 
							name: getName(option),
							name_cn: option.name,
							name_en: option.name_en
						}
					})
				return (<Condition {...restProps} 
						valueList = {valueListOptions} 
						onConditionChange = {(e) => handleChange(e)}>
					</Condition>)
			}
		}

		return (
			<div key={index} className = {`${panelDropDownPrefixCls}-row-item`}>
				{name ? <span>{name}</span> : null}
				{
					renderByMode(restProps)
				}
			</div>
		)
		
	}

	return (
		<div>
			{
				contentList.map((rowContent, index) => {
					return (
						<div key = {index} className = {`${panelDropDownPrefixCls}-row`}>
							{
								rowContent.map((item, i) => {
									return renderItemContent(item, i)
								})
							}
						</div>
					)
				})
			}
		</div>
	)
}

function SetUnit(props){

	let {state, dispatch} = useContext(GlobalContext);

	let {quotaData, functionData} = state;

	let {selectedData = [], location = '', expandSetContent = {}, model} = props;

	let {needOrder, needDelete, needEdict, keyString } = expandSetContent;

	if(selectedData.length === 0 ) return null;

	let items: any[] = [];

	if(needOrder){
		// 排序
		selectedData.map((alias) => {
			let temp = JSON.parse(JSON.stringify(quotaData[alias] || {}));
			temp[alias] = alias;
			items.push(temp);
		});

		items = items.sort(function(a, b){
			const prev = (a[model])[location].order;
			const next = (b[model])[location].order;
			return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
		})
	}else{

		let alias = selectedData[0];
		let arr = ((quotaData[alias]?.[model]))[location][keyString] || [];

		items = (quotaData[alias]?.valueList || []).map(ele => {
			let index = arr.findIndex(s => s.value == ele.value);
			// 使用原始对象覆盖配置对象保证名称使用原始对象的，值类型变更后名称有可能被改变
			return Object.assign({}, arr[index], ele, {order: index == - 1 ? 999999 : index})
		})
		.sort(function(a, b){ return a.order - b.order;});
	}

	const reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
	
		return result;
	};

    const onDragEnd = (result) => {
		if (!result.destination) {
			return;
		}
		const newitems = reorder(
			items,
			result.source.index,
			result.destination.index
		);

		let newQuotaData = JSON.parse(JSON.stringify(quotaData));

		if(needOrder){
			newitems.map((item, index) => {
				let alias = item.key;
				let point = newQuotaData[alias];
				newQuotaData[alias] = Object.assign({},
					point,
					{[model]: Object.assign({}, 
						point[model],
						{[location]: Object.assign({}, 
							(point[model])[location], 
							{order: index + 1}
						)}, 
					)}
				) 
			})
		}else{
			let alias = selectedData[0];
			let point = newQuotaData[alias];
			newQuotaData[alias] = Object.assign({},
				point,
				{[model]: Object.assign({}, 
					point[model],
					{[location]: Object.assign({}, 
						(point[model])[location], 
						{[keyString]: newitems}
					)}, 
				)}
			) 
		}

		dispatch({type: Actions.SET_STATE, quotaData: newQuotaData })
    }

    const getListStyle = (isDraggingOver) => ({
        // padding: "10px 0",
        width: "100%",
		minWidth: '250px'
    })

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        margin: `0 0 8px 0`,
        ...draggableStyle
    });

	const handleDelete = (p) => {
		// 删除测点 更新order
		let aliasKey = p.key
		let newQuotaData = JSON.parse(JSON.stringify(quotaData));
		let deleteOrder = ((newQuotaData[aliasKey])[model])[location]?.order || '999999';
		items.map((item) => {
			let point = newQuotaData[item.key];
			let currentOrder = (point[model])[location]?.order || -1;
			if(item.key === aliasKey){
				// 删除
				let temp = Object.assign({}, point[model]);
				delete temp[location];
				newQuotaData[item.key] = Object.assign({},
					point,
					{[model]: Object.assign({}, temp)}
				) 
			}else{
				if(currentOrder > deleteOrder){
					// 更新order
					newQuotaData[item.key] = Object.assign({},
						point,
						{[model]: Object.assign({}, 
							point[model],
							{[location]: Object.assign({}, 
								(point[model])[location], 
								{order: currentOrder - 1}
							)}, 
						)}
					)
				}
			}
		})
		dispatch({type: Actions.SET_STATE, quotaData: newQuotaData })
	}

	const RenderQuotaLable = (props) =>{

		let {item} = props;
		let curName = getName(item);

		return (
			<div className={`${quotaSetUnitPrefixCls}-content-label`} >
				<span><EllipsisToolTip>{curName}</EllipsisToolTip></span>
				{needDelete ? <span id = 'delete' 
					onClick={(e) => {
						e.stopPropagation(); 
						handleDelete(item)
					}}
				><FontIcon type = {IconType.WRONG}/></span> : null}
			</div>
		)
	}
	
	const [isFold, setIsFold] = useState(false);

	return(
		<>
		{keyString === keyStringMap.VALUE_LIST_STYLE ? <div onClick={() => {setIsFold(!isFold)}}>
			<div className={`${quotaSetUnitPrefixCls}-icon`}><FontIcon type= {isFold ? IconType.DIRECT_RIGHT : IconType.DIRECT_DOWN}></FontIcon></div>
			<span>{getName(quotaData[selectedData[0]])}</span>
		</div> : null}
		{isFold && keyString === keyStringMap.VALUE_LIST_STYLE ? null : 
		<DragDropContext onDragEnd={onDragEnd} className={`${quotaSetUnitPrefixCls}-content`}>
			<Droppable droppableId="droppable">
				{
					(provided, snapshot) => (
						<div
							{...provided.droppableProps}
							ref = {provided.innerRef}
							style = {getListStyle(snapshot.isDraggingOver)}
						>
							{
								items.map((item, index) => (
									
									<Draggable 
										key={index}
										draggableId = {index.toString()}
										index = {index}
									>
										{(provided, snapshot) => (
											<div
												ref = {provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												style = {
													getItemStyle(
														snapshot.isDragging,
														provided.draggableProps.style
													)
												}
											>
												<Collapse >
													<Panel
														key={index}
														header = {
															<RenderQuotaLable 
																item = {item} 
															/>
														}
														extra = {<FontIcon type = {IconType.DRAG}/>}
													>
														{
															<PanelDropDownContent 
																itemData = {item} 
																location = {location} 
																keyString = {keyString}
																aliasKey = {item.key || selectedData[0]}
																model = {model}
															/>
														}
														
													</Panel>
												</Collapse>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
						</div>
					)
				}
			</Droppable>
		</DragDropContext>
		}
		{
			(functionData[model])[location]?.type === 'chart' ? 
				<div className={`${quotaSetUnitPrefixCls}-time`}>
					<div>
						<span>{msgConvert('timeRange')}</span>
						<span>{'30min'}</span>
					</div>
					<div>
						<span>{msgConvert('timeGranularity')}</span>
						<span>{'10s'}</span>
					</div>
				</div>
				:null
			}
		</>
	)
}

function ExpandSet(props) {
	let { selectedData, locObj = {}, model} = props;

	let { location = '', expandSetContent = {}} = locObj;

	return <SetUnit 
		selectedData = {selectedData}
		location = {location}
		expandSetContent = {expandSetContent}
		model = {model}
	/>
}

function QuotaSetLoc(props){
	let { state, dispatch } = useContext(GlobalContext);
	let {locObj = {}, model} = props;

	let { quotaData = {}, functionData = {}, quotaOptions = {}} = state;
	let { location = "", checkable = false, name } = locObj;

	let optionData: any[]  = [];
	let selectedData: any[] = [];

	let showType = (functionData[model])[location]?.type;
	let newLocObj = JSON.parse(JSON.stringify(locObj));

	if(showType){
		newLocObj = Object.assign({}, locObj, locObj[showType] || {})
	}

	let {
		locNameShow = true,
		locSetEnable = false,
		locAddition = false,
		quotaSelectEnable = true,
		expandSet = false,
		associatedEnable = false
	} = newLocObj;

	let quotas = ((quotaOptions[model])[location] || {})[showType] || (quotaOptions[model])[location]?.quotas || [];
	quotas.map((key) => {
		if(quotaData[key]){
			optionData.push(key);
		}
	})

	Object.keys(quotaData).map((key) => {
		if(showType){
			((quotaData[key])?.[model])[location]?.type === showType ? selectedData.push(key) : null;
		}else{
			((quotaData[key])?.[model])[location] ? selectedData.push(key) : null;
		}
	})

	let checked = (functionData[model])[location]?.enable || false;
	let autoWidth = (functionData[model])[location]?.autoWidth || false;
	
	const handlCheck = () => {

		let newfunctionData = JSON.parse(JSON.stringify(functionData));

		(newfunctionData[model])[location] = Object.assign({},
			(newfunctionData[model])[location] || {},
			{enable: !checked}
		);

		dispatch({type: Actions.SET_STATE, functionData: newfunctionData })
	}

	const handAutoWidth = (e: CheckboxChangeEvent) => {

		let newfunctionData = JSON.parse(JSON.stringify(functionData));

		(newfunctionData[model])[location] = Object.assign({},
			(newfunctionData[model])[location] || {},
			{autoWidth: (e.target as HTMLInputElement).checked}
		);

		dispatch({type: Actions.SET_STATE, functionData: newfunctionData })
	}

	return (
		<div className={quotaSetUnitPrefixCls}>
			{locNameShow ? <div className={`${quotaSetUnitPrefixCls}-header`}>
				<span>{name || ''}</span>
				{
					checkable ? 
					<Checkbox className={`${quotaSetUnitPrefixCls}-header-check`}
						checked = {checked}
						onChange = {handlCheck}
					></Checkbox> : null
				}
			</div>:null}
			{
				locAddition && <div className={`${quotaSetUnitPrefixCls}-header`}>
					<span>{msgConvert('quotaAutoWidth')}</span>
					<Tooltip
						overlay={msgConvert('quotaAutoWidthTip')}
					>
						<FontIcon type={IconType.QUESTION_CIRCLE} style={{marginLeft: 5}}/>
					</Tooltip>
					{
						checkable ? 
						<Checkbox className={`${quotaSetUnitPrefixCls}-header-check`}
							checked = {autoWidth}
							onChange = {handAutoWidth}
						></Checkbox> : null
					}
				</div>
			}
			{
				locSetEnable && (!checkable || checked) ? 
				<LocSet 
					locObj = {newLocObj}
					model = {model}
				/> : null
			}
			{ quotaSelectEnable && (!checkable || checked) ? 
				<QuotaSelect 
					selectedData = {selectedData} 
					optionData = {optionData} 
					locObj = {newLocObj}
					model = {model}
				/> : null
			}
			{ expandSet && (!checkable || checked) && selectedData.length > 0 ? 
				<ExpandSet 
					selectedData = {selectedData} 
					optionData = {optionData}
					locObj = {newLocObj}
					model = {model}
				/> : null
			}
			{ associatedEnable && (!checkable || checked) && selectedData.length > 0 ? <AssociatedSet 
				selectedData = {selectedData} 
				optionData = {optionData}
				locObj = {newLocObj}
				model = {model}
			/> : null}
		</div>
	)
}

export default QuotaSetLoc;