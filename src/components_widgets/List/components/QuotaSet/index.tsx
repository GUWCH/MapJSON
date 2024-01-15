import React, {useReducer, useContext, useMemo, useCallback, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { Collapse, InputNumber, Popover } from 'antd';
import _ from 'lodash';
import '@/common/css/app.scss';
import './style.scss';
import {getLocOptions, defaultColNum, keyStringMap} from "../../constants";
import {
	msgConvert,
	getLocationContent, 
	listTypes, 
	STATISTICS_MAX_COL,
} from "./constant";
import { GlobalContext, GlobalReducer, initialState, Actions } from './context';
import { FontIcon, IconType } from 'Icon';
import { StyledModal } from 'Modal';
import QuotaSetLoc from './quotaSetLoc';
import OtherSet from '../OtherSet';
import FilterSet from '../FilterSet';
import { Quota } from '../../types';

const { Panel } = Collapse;

const quotaSetPrefix = "env-quota-set";

const handleRawData = (rawData, listType) => {
	const {cfg, quotaList = []} = rawData;
	const {functionCfg = {}, quotaCfg = [], otherCfg = {}, filterGroups} = cfg || {};
	const quotaOptions = getLocOptions(quotaList);

	// 指标模型数据和指标数据融合
	let newQuotaData = {};
	quotaList.forEach((quota) => {
		let {alias = '', nameCn = '', nameEn = '', tableNo = '', fieldNo = '', unit = '', valueList} = quota;
		let key = tableNo + ':' + alias + ':' + fieldNo;
		let quotaSetItem = quotaCfg.find(item => item.key === key);
		newQuotaData[key] = Object.assign({},
			{
				tableNo: tableNo.toString(),
				fieldNo: fieldNo.toString(),
				unit: unit,
				alias: alias ? alias.toString() : '',
				key: key,
				nameCn: nameCn,
				nameEn: nameEn,
				card: quotaSetItem?.card || {},
				filter: quotaSetItem?.filter || {},
				grid: quotaSetItem?.grid || {},
				statistics: quotaSetItem?.statistics || {},
				valueList: valueList
			}
		)
	})
	
	let newfunctionData = Object.assign({}, 
		{
			filter: functionCfg.filter || {},
			card: functionCfg.card || {},
			grid: functionCfg.grid || {},
			statistics: functionCfg.statistics || {},
		});
	
	let newQuotaOptions = Object.assign({}, 
		{
			filter: quotaOptions.filter || {},
			card: quotaOptions.card || {},
			grid: quotaOptions.grid || {},
			statistics: quotaOptions.statistics || {},
		});

			
	let newInitialState = Object.assign({},initialState,
		{
			functionData: newfunctionData,
			quotaData: newQuotaData, 
			quotaOptions: newQuotaOptions,
			otherData: otherCfg,
			listType: listType,
			filterGroups: filterGroups
		}
	);
	return newInitialState;
}

const QuotaSet = (props) => {

	const {cacheQuotaData, isFarm, onCancel=() => {}, onSubmit=() => {}, height, ...restProps} = props;

	const locationContent = getLocationContent(isFarm);

	let { state, dispatch } = useContext(GlobalContext);

	let { listType, functionData, quotaData={}, otherData, filterGroups} = state;

	let {colNumSet = false, colSetContent = {}, title = '', children} = listTypes[listType] || {};

	const [isModalVisible, setIsModalVisible] = useState(false);

	const handleRest = () => {
		dispatch({type: Actions.SET_STATE, ...cacheQuotaData });
	}

	const handleCancel = () =>{
		// 判是否销毁一些东西,如果需要就要销毁
		onCancel();
	}

	const handleSave = () => {
		// 返回数据
		// callbak close feedbackData

		let quotaDataList: Quota[] = [];

		Object.keys(quotaData).map(alias => {
			if(quotaData[alias]){
				quotaDataList.push(quotaData[alias] as Quota)
			}			
		})

		let feedbackData = {
			functionCfg: functionData,
			quotaCfg: quotaDataList,
			otherCfg: otherData,
			filterGroups: filterGroups
		}

		// 判是否销毁一些东西,如果需要就要销毁
		onSubmit(feedbackData); 
	}

	const handleColChange = (e) => {
		let newfunctionData = JSON.parse(JSON.stringify(functionData));
		(newfunctionData[listType])[colSetContent.key] = Number(e);

		dispatch({type: Actions.SET_STATE, functionData: newfunctionData });
	};

	const handleModalOk = () => {
		setIsModalVisible(false);
		handleRest();
	}

	const handleModalCancel = () => {
		setIsModalVisible(false);
	}

	const renderContent = () => {

		return(
			<div className= {`${quotaSetPrefix}-container`}>
				<div className= {`${quotaSetPrefix}-header`}>
					<span className= {`${quotaSetPrefix}-header-title`}>{title}</span>
					<span className= {`${quotaSetPrefix}-header-reset`} onClick = {() => {setIsModalVisible(true)}}>
						<FontIcon type = {IconType.RESET}/>
						<span className= {`${quotaSetPrefix}-header-reset-describe`}>{msgConvert('reset')}</span>
					</span>
				</div>
				{
					colNumSet ? 
					<div className= {`${quotaSetPrefix}-column`}>
						<span>{colSetContent.name}</span>
						<InputNumber 
							defaultValue={defaultColNum}
							min = {1}
							max = {STATISTICS_MAX_COL}
							onChange={handleColChange} 
							value = {(functionData[listType])[colSetContent.key] || ''}
						></InputNumber>
					</div> : null
				}
				<div className= {`${quotaSetPrefix}-model`} style = {{height: `${height}px`}}>
					{
						children ? 
						<Collapse overlayClassName= {`${quotaSetPrefix}-collapse`} bordered={false} ghost>
							{
								children.map((child, index) => {
									if(child.key === keyStringMap.OTHER && isFarm) {
										return null;
									}

									let content
									if (child.key === keyStringMap.FILTER) {
										content = <FilterSet />
									} else if (child.key === keyStringMap.OTHER) {
										content = <OtherSet />
									} else {
										content = <>
											{
												(locationContent[child.key] || []).map((loc, index) => {
													return (
														<QuotaSetLoc key = {index} locObj = {loc} model = {child.key}/>
													)
												})
											}
										</>
									}

									return <Panel key = {index} header = {child.title} className = {`${quotaSetPrefix}-panel`}> 
										<div className= {`${quotaSetPrefix}-content`}>
											{content}
										</div>
									</Panel>
								})
							}
						</Collapse> 
						: 
						<div className= {`${quotaSetPrefix}-content`}>
							{
								(locationContent[listType] || []).map((loc, index) => {
									return (
										<QuotaSetLoc key = {index} locObj = {loc} model = {listType}/>
									)
								})
							}
						</div>
					}
				</div>
				<div className= {`${quotaSetPrefix}-footer`}>
					<button className= {`${quotaSetPrefix}-footer-cancel`} onClick = {handleCancel}>{msgConvert('cancel')}</button>
					<button className= {`${quotaSetPrefix}-footer-save`} onClick = {handleSave}>{msgConvert('save')}</button>
				</div>
				<StyledModal 
					className = {`${quotaSetPrefix}-modal`}
					visible = {isModalVisible}
					mask = {true}
					maskClosable = {true}
					closable = {false}
					zIndex = {2000}
					maskStyle = {{zIndex: 1500}}
					onOk = {handleModalOk}
					onCancel = {handleModalCancel}
				>
					<div className= {`${quotaSetPrefix}-modal-confirm`}>
						<FontIcon type = {IconType.QUESTION_CIRCLE_BOLD}/>
						<span>{msgConvert('modalConfirm')}</span>
					</div>
					<div className= {`${quotaSetPrefix}-modal-info`}>{msgConvert('modalInfo')}</div>
				</StyledModal>
	 	 </div>
		)	
	};

	return <Popover 
		overlayClassName= {`${quotaSetPrefix}-popover`}
		autoAdjustOverflow = {true}
		arrowPointAtCenter = {true}
		destroyTooltipOnHide={true}
		content={renderContent} 
		{...restProps}
	>{props.children}</Popover>
}

function Set(props) {
	let {data = {}, listType, isFarm = false, deviceType, ...restProps} = props;

    if(!listType){
        return null;
    };
	
	let stateFromData = handleRawData(data, listType);
	const [state, dispatch] = useReducer(GlobalReducer, stateFromData);
	useEffect(() => {
		dispatch(handleRawData(data, listType))
	}, [data, listType])

    return(
        <GlobalContext.Provider value={{ state, dispatch }}>
			<QuotaSet 
				cacheQuotaData = {stateFromData}
				isFarm = {isFarm}
				listType = {listType}

				{...restProps}
			>
				{props.children}
			</QuotaSet>
        </GlobalContext.Provider>
    );
}

const areEqual = (prevProps, nextProps) => {

	return prevProps.visible === nextProps.visible 
	&& prevProps.height === nextProps.height 
	&& _.isEqual(prevProps.data, nextProps.data);
    
}
export default React.memo(Set, areEqual);