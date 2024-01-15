import React, {useContext, useEffect, useState, useMemo } from "react";
import { Collapse } from 'antd';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { omit } from "lodash";
import './style.scss';
import { styleSetContent, msgConvert } from "../constant";
import { keyStringMap, getPointType, isZh } from "../../../constants";
import { GlobalContext} from '../context';
import TreeMultiSelect from './treeSelect';
import ColorPick from "ColorPick";
import Condition from '../../Condition';
import Select from "../../Select";
import { FontIcon, IconType } from 'Icon';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";

const { Panel } = Collapse;

const quotaSetUnitPrefixCls = "env-quota-set-unit";
const panelDropDownPrefixCls = 'panel-drop-down';

export function AssociatedSet(props){

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
			name: isZh ? quotaData[option].nameCn || '' : quotaData[option].nameEn || ''
		}
	})

	let { associated} = (quotaData[selectedData[0]][model])[location] || {}; 

	let valueOptions = [];

	let key = null;

	let {associatedValue = null, color = null} = associated || {};

	if(associated){
		let {
			isLocal = '',
			tableNo = '',
			fieldNo = '',
			alias = '',
		} = associated;

		key = isLocal + tableNo + alias + fieldNo === '' ? null : isLocal + ":"+ tableNo  + ":"+ alias + ":" + fieldNo;

		valueOptions = (quotaData[key]?.valueList || []).map(option => {
			return {
				value: option.value.toString(),
				name: option.name || ''
			}
		});
	}

	const handleQuotaChange = (e) => {

		let newQuotaData = Object.assign({}, quotaData);

		let locObj = ((newQuotaData[selectedData[0]])[model])[location];

		if(e){
			let {tableNo = '', fieldNo = '', alias = '', nameCn = '', nameEn = '', isLocal = ''} = quotaData[e] || {};
			locObj[type] = {
				tableNo: tableNo,
				fieldNo: fieldNo,
				isLocal: isLocal,
				alias: alias,
				nameEn: nameEn,
				nameCn: nameCn,
				associatedValue: null,
                color: null
			}
		}else{
			locObj[type] = e;
		}

		dispatch({type:'SET_STATE', quotaData: newQuotaData });
	}

	const handleChange = (e, keyString) => {

		let newQuotaData = Object.assign({}, quotaData);
		let locData = ((newQuotaData[selectedData[0]])[model])[location];
		Object.assign(locData[type], {[keyString]: e}) 

		dispatch({type:'SET_STATE', quotaData: newQuotaData });
	}

	return useMemo(() => {
		return (
			<div className={`${quotaSetUnitPrefixCls}-associated`}>
				<div className={`${quotaSetUnitPrefixCls}-associated-select`}>
					<span>{name}</span>
					<Select options = {newOptions} value = {key} incluedNo = {incluedNo} onChange = {handleQuotaChange}/>
				</div>
				{key ? <div className={`${quotaSetUnitPrefixCls}-associated-style`}>
					<Select options = {valueOptions} value = {associatedValue} onChange = {(e) => {handleChange(e, 'associatedValue')}}/>
					<ColorPick value = {color} onColorChange = {(e) => {handleChange(e, 'color')}}/>
				</div>: null}
			</div>
		);
	}, [key, associatedValue, color])
}

export const LocSet = (props) => {

	let {state, dispatch} = useContext(GlobalContext);

	let {functionData} = state;

	let {locObj = {}, model} = props;

	let {
		location = "",
		locSet = []
	} = locObj;

	return locSet.map((item) => {
		let {
			mode = '',
			type = '',
			name = '',
			incluedNo = true,
			defaultValue,
			options = []
		} = item;

		let value = ((functionData[model])[location] || {})[type];

		const handleChange = (e) => {

			let newfunctionData = Object.assign({}, functionData);
			(newfunctionData[model])[location] = Object.assign({},
				(newfunctionData[model])[location] || {},
				{[type]: e}
			);

			dispatch({type:'SET_STATE', functionData: newfunctionData });
		};

		if(value === undefined && defaultValue !== undefined){
			handleChange(defaultValue)
		}

		switch(mode){
			case 'select':
				return useMemo(() => {
					return (
						<div className={`${quotaSetUnitPrefixCls}-content-select`}>
							<span>{name}</span>
							<Select options = {options} value = {value} incluedNo = {incluedNo} onChange = {handleChange}/>
						</div>
					);
				},[value])
				
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

		let options = [];

		optionData.map((alias, index) => {

			let { nameCn, nameEn } = quotaData[alias] || '';
			options.push({
				title: isZh ? nameCn : nameEn,
				key: alias + index,
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
				name: isZh ? quotaData[alias].nameCn : quotaData[alias].nameEn,
				value: alias
			}
		});

		let alias = selectedData[0] || defaultValue;

		const handleChange = (value) => {

			let newQuotaData = Object.assign({}, quotaData);

			if(alias && newQuotaData[alias]){
				(newQuotaData[alias])[model] = omit((newQuotaData[alias])[model], [location]);
			}

			if(value && newQuotaData[value]){
				let fuctionType = (functionData[model])[location]?.type;
				((newQuotaData[value])[model])[location] = fuctionType ? {type: fuctionType} : {};
				let {keyString} = expandSetContent || {};
				if(expandSet && keyString === keyStringMap.VALUE_LIST_STYLE){
					let tempQuotaValueList = JSON.parse(JSON.stringify(quotaData[value].valueList || []));
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
			dispatch({type:'SET_STATE', quotaData: newQuotaData });
		}

		return (<div className={`${quotaSetUnitPrefixCls}-content-select`}>
			<span>{name || ''}</span>
			<Select 
				options = {currentOptions} 
				value = {alias} 
				incluedNo = {incluedNo} 
				onChange = {handleChange}
			/>
		</div>)
	}

	return null;
}

export function	PanelDropDownContent(props){

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
				let {isLocal, tableNo, alias, fieldNo} = itemData[type] || {};
					
				let keyStr = isLocal +':' + tableNo + ':' + alias + ':' + fieldNo;

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
				name: isZh ? quotaData[key].nameCn : quotaData[key].nameEn
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
				let newQuotaData = Object.assign({}, quotaData);
				let locObj = ((newQuotaData[aliasKey])[model])[location] || {};
				let valueListArr = locObj[keyString] || [];

				let newItem = valueListArr.find((data) => {
					return data.value.toString() === itemData.value.toString();
				})

				let targetChangeValue = needbaseInform && e ? {
					alias: newQuotaData[e]?.alias,
					tableNo: newQuotaData[e]?.tableNo,
					fieldNo: newQuotaData[e]?.fieldNo,
					isLocal: newQuotaData[e]?.isLocal,
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
				dispatch({type:'SET_STATE', quotaData: newQuotaData });

			}else{
				let newQuotaData = Object.assign({}, quotaData);

				(((newQuotaData[aliasKey])[model])[location])[type] = e;

				dispatch({type:'SET_STATE', quotaData: newQuotaData })
			}
		}

		if(value === undefined && defaultValue !== undefined){
			handleChange(needbaseInform ? defaultValue.alias : defaultValue)
		}

		const renderByMode = (props) => {
			let {mode} = props;

			if(!mode) return null;

			switch(mode){
				case 'select':
					return(<Select {...restProps} onChange = {handleChange}></Select>)
				case 'color':
					return(<ColorPick {...restProps} onColorChange = {handleChange} />)
				case 'condition':
					let valueListOptions = (quotaData[aliasKey].valueList || []).map(option => {
						return {
							value:option.value?.toString() || '', 
							name: option.name || ''
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

export function SetUnit(props){

	let {state, dispatch} = useContext(GlobalContext);

	let {quotaData, functionData} = state;

	let {selectedData = [], location = '', expandSetContent = {}, model} = props;

	let {needOrder, needDelete, needEdict, keyString } = expandSetContent;

	if(selectedData.length === 0 ) return null;

	let items = [];

	if(needOrder){
		// 排序
		selectedData.map((alias) => {
			let temp = Object.assign({}, quotaData[alias]);
			temp[alias] = alias;
			items.push(temp);
		});

		items = items.sort(function(a, b){
			return ((a[model])[location].order || '999999') - ((b[model])[location].order || '999999');
		})
	}else{

		let alias = selectedData[0];
		let arr = ((quotaData[alias][model]))[location][keyString] || [];

		items = (quotaData[alias].valueList || []).map(ele => {
			let index = arr.findIndex(s => s.value == ele.value);
			return Object.assign({}, ele, arr[index], {order: index})
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

		let newQuotaData = Object.assign({}, quotaData);

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

		dispatch({type:'SET_STATE', quotaData: newQuotaData })
    }

    const getListStyle = (isDraggingOver) => ({
        padding: "10px 0",
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
		let newQuotaData = Object.assign({}, quotaData);
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
		dispatch({type:'SET_STATE', quotaData: newQuotaData })
	}	

	const handleNameChange = (item, e) => {
		let newQuotaData = Object.assign({}, quotaData);
		if(keyString === keyStringMap.VALUE_LIST_STYLE){
			let key = selectedData[0];
			let {valueListStyle = []} = ((newQuotaData[key])[model])[location];
			(valueListStyle.find((v) => {return v.value.toString() === item.value.toString()}) || {})[isZh ? 'nameCn' : 'nameEn'] = e.target.value;
		}else{
			(newQuotaData[item.key])[isZh ? 'nameCn' : 'nameEn'] = e.target.value;
		}

		dispatch({type:'SET_STATE', quotaData: newQuotaData })

	}

	const RenderQuotaLable = (props) =>{

		let {item, index} = props;

		const [isEdict, setIsEdict] = useState(false);

		const elementId = `edict_${index}`;

		let name = isZh ? item.nameCn || item.name || '' : item. nameEn || item.name || '';

		useEffect(() => {
			document.getElementById(elementId)?.focus();
		})

		const handleEdict = () => {
			setIsEdict(true);
		}

		const handleEdictEnd = (e) => {
			handleNameChange(item, e);
			setIsEdict(false)
		}
		return useMemo(() => {
			return (
				<div className={`${quotaSetUnitPrefixCls}-content-label`} >
					{isEdict ? <input type='text' id = {elementId}
						defaultValue = {name} 
						onClick={(e) => {
							e.stopPropagation(); 
							}}
						onBlur = {(e) => {handleEdictEnd(e)}}
						></input> : <span><EllipsisToolTip>{name}</EllipsisToolTip></span>}
					{needEdict ? <span id = 'edict' 
						onClick={(e) => {
							e.stopPropagation(); 
							handleEdict(item)
						}}
					><FontIcon type = {IconType.EDITOR}/></span>:null} 
					{needDelete ? <span id = 'delete' 
						onClick={(e) => {
							e.stopPropagation(); 
							handleDelete(item)
						}}
					><FontIcon type = {IconType.WRONG}/></span> : null}
				</div>
			)
		}, [name, isEdict, elementId])
		
	}
	
	const [isFold, setIsFold] = useState(false);

	return(
		<>
		{keyString === keyStringMap.VALUE_LIST_STYLE ? <div onClick={() => {setIsFold(!isFold)}}>
			<div className={`${quotaSetUnitPrefixCls}-icon`}><FontIcon type= {isFold ? IconType.DIRECT_RIGHT : IconType.DIRECT_DOWN}></FontIcon></div>
			<span>{isZh ? quotaData[selectedData[0]].nameCn : quotaData[selectedData[0]].nameEn}</span>
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
										key={index.toString()}
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
														header = {
															<RenderQuotaLable 
																item = {item} 
																index = {index}
															/>
														}
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
						<span>{msgConvert('today')}</span>
					</div>
					<div>
						<span>{msgConvert('timeGranularity')}</span>
						<span>{'5min'}</span>
					</div>
				</div>
				:null
			}
		</>
	)
}

export function ExpandSet(props) {
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

	let {locObj = {}, model} = props;

	let {
		location = "",
		checkable = false,
		name
	} = locObj;

	let { state, dispatch } = useContext(GlobalContext);

	let { quotaData = {}, functionData = {}, quotaOptions = {}} = state;

	let optionData = [];
	let selectedData = [];

	let showType = (functionData[model])[location]?.type;

	let newLocObj = JSON.parse(JSON.stringify(locObj));

	if(showType){
		newLocObj = Object.assign({}, locObj, locObj[showType] || {})
	}

	let {
		locNameShow = true,
		locSetEnable = false,
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
				((quotaData[key])[model])[location]?.type === showType ? selectedData.push(key) : null;

			}else{
				((quotaData[key])[model])[location] ? selectedData.push(key) : null;
			}
	})

	let checked = (functionData[model])[location]?.enable || false;
	
	const handlCheck = () => {

		let newfunctionData = Object.assign({}, functionData);

		(newfunctionData[model])[location] = Object.assign({},
			(newfunctionData[model])[location] || {},
			{enable: !checked}
		);

		dispatch({type:'SET_STATE', functionData: newfunctionData })
	}

	return (
		<div className={quotaSetUnitPrefixCls}>
			{locNameShow ? <div className={`${quotaSetUnitPrefixCls}-header`}>
				<span>{name || ''}</span>
				{
					checkable ? 
					<input className={`${quotaSetUnitPrefixCls}-header-check`}
						id = {`${quotaSetUnitPrefixCls}-header-check`}
						type = "checkbox" 
						checked = {checked}
						onChange = {handlCheck}
					></input> : null
				}
			</div>:null}
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