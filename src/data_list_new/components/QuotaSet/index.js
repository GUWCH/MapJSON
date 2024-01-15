import React, {useReducer, useContext, useMemo, useCallback, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { Collapse, InputNumber, Popover } from 'antd';
import _ from 'lodash';
import '@/common/css/app.scss';
import './style.scss';
import {getLocOptions, getcurQuotas, isZh, defaultColNum} from "../../constants";
import {msgConvert, getLocationContent, listTypes, STATISTICS_MAX_COL} from "./constant";
import { GlobalContext, GlobalReducer, InitialState } from './context';
import { FontIcon, IconType } from 'Icon';
import QuotaSetLoc from './quotaSetLoc';

const { Panel } = Collapse;

const quotaSetPrefix = "env-quota-set";

const handleRawData = ({rawData, listType}) => {
	const {cfg, quotaList = []} = rawData;
	const {functionCfg = {}, quotaCfg = []} = cfg || {};
	const quotaOptions = getLocOptions(quotaList);

	// 指标模型数据和指标数据融合
	let newQuotaData = {};
	quotaList.map((quota) => {
		let {is_local, alias = '', nameCn = '', nameEn = '', tableNo = '', fieldNo = '', unit = '', valueList} = quota;
		let key = is_local + ":" + tableNo + ':' + alias + ':' + fieldNo;
		let quotaSetItem = quotaCfg.find(item => item.key === key);
		newQuotaData[key] = Object.assign({},
			{
				tableNo: tableNo.toString(),
				fieldNo: fieldNo.toString(),
				isLocal: is_local,
				unit: unit,
				alias: alias ? alias.toString() : '',
				key: key,
				nameCn: quotaSetItem?.nameCn || nameCn,
				nameEn: quotaSetItem?.nameEn || nameEn,
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

			
	let newInitialState = Object.assign({},
		{
			functionData: newfunctionData,
			quotaData: newQuotaData, 
			quotaOptions: newQuotaOptions,
			listType: listType
		}
	);
	return newInitialState;
}

const QuotaSet = (props) => {

	const {cacheQuotaData, elementId, isFarm, onCancle=() => {}, onSubmit=() => {}, height, ...restProps} = props;

	const locationContent = getLocationContent(isFarm);

	let { state, dispatch } = useContext(GlobalContext);

	let { listType, functionData, quotaData} = state;

	let {colNumSet = false, colSetContent = {}, title = '', children} = listTypes[listType] || {};

	const handleRest = () => {
		dispatch({type:'SET_STATE', ...cacheQuotaData });
	}

	const handleCancel = () =>{

		// dispatch({type:'SET_STATE', ...cacheQuotaData });
		// callbak close

		// 判是否销毁一些东西,如果需要就要销毁
		onCancle();
	}

	const handleSave = () => {
		// 返回数据
		// callbak close feedbackData

		let quotaDataList = [];

		Object.keys(quotaData).map(alias => {
			quotaDataList.push(quotaData[alias])
		})

		let feedbackData = {
			functionCfg: functionData,
			quotaCfg: quotaDataList
		}

		// 判是否销毁一些东西,如果需要就要销毁
		onSubmit(feedbackData); 
	}

	const handleColChange = (e) => {
		let newfunctionData = JSON.parse(JSON.stringify(functionData));
		// let currentColNum = Number(e.target.value) > STATISTICS_MAX_COL ? STATISTICS_MAX_COL : Number(e);
		(newfunctionData[listType])[colSetContent.key] = Number(e);

		dispatch({type:'SET_STATE', functionData: newfunctionData });
	};

	const renderContent = () => {

		return(
			<div className= {`${quotaSetPrefix}-container`}>
				<div className= {`${quotaSetPrefix}-header`}>
					<span className= {`${quotaSetPrefix}-header-title`}>{title}</span>
					<span className= {`${quotaSetPrefix}-header-reset`} onClick = {handleRest}>
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
						<Collapse bordered={false} ghost>
							{
								children.map(child => {
									return <Panel header = {child.title} className = {`${quotaSetPrefix}-panel`}> 
										<div className= {`${quotaSetPrefix}-content`}>
									 	{
											(locationContent[child.key] || []).map((loc, index) => {
												return (
													<QuotaSetLoc key = {index} locObj = {loc} model = {child.key}/>
												)
											})
										}
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
	 	 </div>
		)	
	};

	return <Popover 
		autoAdjustOverflow = {true}
		arrowPointAtCenter = {true}
		destroyTooltipOnHide={true}
		content={renderContent()} 
		{...restProps}
	>{props.children}</Popover>
}

let globalData = {};
let globalListType = '';

function Set(props) {

	let {data = {}, elementId, listType, isFarm = false, isZh = true, keyFlag, ...restProps} = props;

    if(!listType){
        return null;
    };

	const [state, dispatch] = useReducer(GlobalReducer, InitialState);
	let rawData = JSON.parse(JSON.stringify(data));
	let newInitialState = handleRawData({rawData, listType});

	if(!_.isEqual(data, globalData) || listType !== globalListType){
		globalData = data;
		globalListType = listType;
		dispatch({type:'SET_STATE', ...newInitialState });
	}

	const cacheQuotaData = JSON.parse(JSON.stringify(newInitialState));

    return(
        <GlobalContext.Provider value={{ state, dispatch }} isZh = {isZh}>
			<QuotaSet 
				cacheQuotaData = {cacheQuotaData}
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

	return prevProps.visible === nextProps.visible && _.isEqual(prevProps.data, nextProps.data);
    
}
export default React.memo(Set, areEqual);