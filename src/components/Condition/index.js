import React, { useCallback, useEffect, useState } from 'react';
import {Popover, InputNumber, Input} from 'antd';
import ColorPick from "ColorPick";
import { FontIcon, IconType } from 'Icon';
import { SetSelect as Select } from "@/components";
import {addConditions} from './constant';
import './style.scss';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { InputTextSize } from '@/common/constants';

const prefixCls = 'env-add-condition';

function Condition(props) {

    let {type, value, onConditionChange, valueList, needIcon = true} = props;

    if(!type) return null;

    const preprocess = useCallback((value) => {

        if(!value){
            return [];
        }

        if(Object.prototype.toString.call(value) === '[object Object]'){

            let {conditionTypes} = addConditions[type] || {};
            let conditions = [];

            (conditionTypes || []).map((type) => {
                
                let condition = {};
                type.content_list.map((content) => {
                    content.editKey.split(',').map(key => {
                        value[key] !== undefined ? condition[key] = value[key] : null;
                    })
                })
                Object.keys(condition).length > 0 ? conditions.push(condition) : null;
            })

            return conditions;
        }
        
        if(Array.isArray(value)){
            return value;
        }

        return [];
    }, []);

    const [conditionsState, setConditionsState] = useState(preprocess(value));

    useEffect(() => {
        setConditionsState(preprocess(value))
    }, [value]);
    
    let { name = '', text = '', expandable = false, conditionTypes = []} = addConditions[type] || {};

    const getCurConditionType = (conditionValue) => {

        let curConditionType = '';

        conditionTypes.map((type) => {
            type.content_list.map((content) => {
                if(Object.keys(conditionValue).indexOf(content.editKey) > -1){
                    curConditionType = type.key;
                }
            })
        })

        return curConditionType;
    }

    const [ disableList, setDisableList ] = useState([]);

    useEffect(() => {
        let tempDisableList = [];
        if(expandable){
            conditionsState.map((oldCondition) => {
                let conditionType = getCurConditionType(oldCondition);
                tempDisableList[conditionType] ? null : tempDisableList.push(conditionType);
            })
        }

        if(!_.isEqual(tempDisableList, disableList)){
            setDisableList(tempDisableList)
        }
        
    }, [conditionsState])

    const handleAdd = (conditionTypeContent) => {

        let {content_list} = conditionTypeContent;

        let condition = {};

        content_list.map((content) => {
            content.editKey.split(',').map(key => {
                condition[key] = content.defaultValue === undefined ? null : content.defaultValue
            })
        })

        let newConditions = conditionsState.map(ele => ele);
        newConditions.push(Object.assign({}, condition));

        let conditionsData;

        if(expandable){
            conditionsData = {};
            newConditions.map(condition => {
                Object.assign(conditionsData, condition);
            })
        }else{
            conditionsData = newConditions;
        }

        setConditionsState(preprocess(conditionsData));
        onConditionChange(conditionsData);

        if(expandable){
            let newDisableList = disableList.length > 0 ? disableList.map(item => {
                let newItem = item;
                return newItem;
            }) : [];
            newDisableList.push(conditionTypeContent.key);

            setDisableList(newDisableList);
        }
    }

    const handleConditionChange = (conditionIndex, key, value, needName) => {

        let newConditions = conditionsState.map(ele => ele);
        (newConditions[conditionIndex])[key] = value;
        if(needName){
            let valObj = valueList.find(ele => ele.value === value) || {};
            Object.assign(newConditions[conditionIndex], valObj);
        }

        let conditionsData;

        if(expandable){
            conditionsData = {};
            newConditions.map(condition => {
                Object.assign(conditionsData, condition);
            })
        }else{
            conditionsData = newConditions;
        }

        setConditionsState(preprocess(conditionsData));
        onConditionChange(conditionsData);
    }

    const handleConditionDelete = (conditionIndex, curConditionTypeKey) => {

        let newConditions = conditionsState.map(ele => ele); 

        newConditions.splice(conditionIndex, 1);

        let conditionsData;

        if(expandable){

            conditionsData = {};
            newConditions.map(condition => {
                Object.assign(conditionsData, condition);
            })

            let keyIndex = -1;
            
            let newDisableList = disableList.length > 0 ? disableList.map((item, index) => {
                if(item === curConditionTypeKey){
                    keyIndex = index;
                }
                let newItem = item;
                return newItem;
            }) : [];

            newDisableList.splice(keyIndex, 1);

            setDisableList(newDisableList);
        }else{

            conditionsData = newConditions;
        }

        setConditionsState(preprocess(conditionsData));
        onConditionChange(conditionsData);


    }

    const renderConditionContent = (content_list, conditionValue, conditionIndex, curConditionTypeKey) => {
		return (
			<>
				{
					content_list.filter(l => (needIcon || l.editType != 'icon')).map((content, index)=>{
						let {editKey, editName, editType, incluedNo, defaultValue, min, max} = content;
						switch(editType){
                            case 'coefficient':
                                return (
									<span key = {index}>
										<span className={`${prefixCls}-coefficient-name`}>{editName}</span>
										<InputNumber className={`${prefixCls}-coefficient-input`}
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                            min={-10000000000}
                                            max={10000000000}
                                        ></InputNumber>
									</span>
								)
                            case 'unit':
                                return (
									<span key = {index}>
										<span className={`${prefixCls}-unit-name`}>{editName}</span>
										<Input className={`${prefixCls}-unit-input`}
                                            type = "text"
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e.target.value)}}
                                            maxLength={InputTextSize.Unit}
                                         ></Input>
									</span>
									
								)
                            case 'decimal':
                                return (
									<span className={`${prefixCls}-demical`} key = {index}>
										<span className={`${prefixCls}-demical-name`}>{editName}</span>
										<InputNumber className={`${prefixCls}-demical-input`}
                                            value = {conditionValue[editKey]}
                                            precision = {0}
                                            min = {min}
                                            max = {max}
                                            defaultValue = {defaultValue}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                        ></InputNumber>
									</span>
								)

							case 'range':
								return (
									<span className={`${prefixCls}-range`} key = {index}>
										<InputNumber className={`${prefixCls}-range-input`}
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                            min={-10000000000}
                                            max={10000000000}
                                        ></InputNumber>
									</span>
									
								)
								break;

							case 'color':
								return (
                                    <span className={`${prefixCls}-color`} key = {index}>
									<ColorPick value = {conditionValue[editKey] || conditionValue.color || defaultValue}
                                        onColorChange = {(value) => {handleConditionChange(conditionIndex, editKey, value)}}
                                    />
                                    </span>
								)
								break;

							case 'yxValue':
								return (
									<Select 
                                        incluedNo = {incluedNo}
                                        options = {valueList} 
                                        value = {conditionValue[editKey] || conditionValue.value} 
                                        onChange = {(value, option) => {handleConditionChange(conditionIndex, editKey, value, true)}}
                                    ></Select>
								)

								break;

                            case 'icon':
                                return (
									<Select 
                                        incluedNo = {incluedNo}
                                        value = {conditionValue[editKey] || conditionValue.icon} 
                                        type = {'icon'}
                                        onChange = {(value) => {handleConditionChange(conditionIndex, editKey, value)}}
                                    ></Select>
								)

                                break;
						}
					})
				}
                <span className={`${prefixCls}-delete`} onClick={() => {handleConditionDelete(conditionIndex, curConditionTypeKey)}}>
                    <FontIcon type = {IconType.DELETE}/>
                </span>
			</>
		)
	}

    const renderCondition = (conditionValue, conditionIndex) =>{

        let content_list = [];

        let curConditionTypeKey = ''

        if(expandable){
            curConditionTypeKey = getCurConditionType(conditionValue);
            let content_list_arr = conditionTypes.filter((type) => {
                return type.key === curConditionTypeKey;
            })
            if(content_list_arr.length > 0){
                content_list = content_list_arr[0].content_list;
            }else{
                return null;
            }
        }else{
            content_list = conditionTypes[0].content_list;
        }

        return renderConditionContent(content_list, conditionValue, conditionIndex, curConditionTypeKey);
    }

    function renderDropDownContent(){
        return(
            <div>
            {
                conditionTypes.map((option, index) => {
                    let disable = disableList.indexOf(option.key) > -1
                    return (
                        <div
                            key={index}
                            className = {`${prefixCls}-option ${disable ? 'click-disable' : ''}`}
                            onClick = {() => {handleAdd(option)}}
                        >
                            {option.name || ''}
                        </div>
                    )
                })
            }
            </div>
        )
    }

    return (
        <div className = {prefixCls}>
            <div className = {`${prefixCls}-header`}>
                <span className = {`${prefixCls}-name`}>{name}</span>
                {
                    expandable ? <Popover 
                        content = {renderDropDownContent()}
                        placement="bottomRight"
                        trigger="click"
                    >
                        <span className = {`${prefixCls}-text`}>{text}</span>
                    </Popover> 
                    :
                    <span onClick={() => {handleAdd(conditionTypes[0])}} className = {`${prefixCls}-text`}>{text}</span>
                }
            </div>
            {conditionsState.length > 0 ?
                conditionsState.map((condition, index) => {
                    return(
                        <div className = {`${prefixCls}-content`} key ={index}>
                            {renderCondition(condition, index)}
                        </div>
                    )
                }) : null
            }
        </div>
    )
}

Condition.propTypes = {
    type: PropTypes.oneOf(['convert', 'ycCondition', 'yxCondition', 'yxConditionIconBg']),
    value: PropTypes.string | null,
    onConditionChange: PropTypes.func,
    valueList: PropTypes.array,
};

Condition.defaultProps = {
    value: null,
    onConditionChange: ()=>{},
    valueList: []
};

export default Condition;