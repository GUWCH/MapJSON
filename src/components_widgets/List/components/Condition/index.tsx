import React, { useState } from 'react';
import {Popover, InputNumber} from 'antd';
import ColorPick from "ColorPick";
import { FontIcon, IconType } from 'Icon';
import Select from "../Select";
import {addConditions} from './constant';
import './style.scss';

const prefixCls = 'env-add-condition';

function Condition(props) {

    let {type, value, onConditionChange, valueList} = props;

    if(!type) return null;

    const preprocess = (value) => {

        if(!value){
            return [];
        }

        if(Object.prototype.toString.call(value) === '[object Object]'){

            let {conditionTypes} = addConditions[type] || {};
            let conditions: any[] = [];

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
    }

    let conditions = preprocess(value);
    
    let { name = '', text = '', expandable = false, conditionTypes = []} = addConditions[type] || {};

    let oldDisableList: any[] = [];

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

    if(expandable){
        conditions.map((oldCondition) => {
            let conditionType = getCurConditionType(oldCondition);
            oldDisableList[conditionType] ? null : oldDisableList.push(conditionType);
        })
    }

    const [ disableList, setDisableList ] = useState(oldDisableList);

    const handleAdd = (conditionTypeContent) => {

        let {content_list} = conditionTypeContent;

        let condition = {};

        content_list.map((content) => {
            content.editKey.split(',').map(key => {
                condition[key] = content.defaultValue === undefined ? null : content.defaultValue
            })
        })

        let newConditions = conditions;
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

    const handleConditionChange = (conditionIndex, key, value, needName?) => {

        let newConditions = conditions;
        (newConditions[conditionIndex])[key] = value;
        if(needName){
            (newConditions[conditionIndex])['name'] = valueList.find(ele => ele.value === value)?.name || ''; 
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

        onConditionChange(conditionsData);
    }

    const handleConditionDelete = (conditionIndex, curConditionTypeKey) => {

        let newConditions = conditions; 

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

        onConditionChange(conditionsData);
    }

    const renderConditionContent = (content_list, conditionValue, conditionIndex, curConditionTypeKey) => {
		return (
			<>
				{
					content_list.map((content)=>{
						let {editKey, editName, editType, incluedNo, defaultValue, min, max} = content;
						switch(editType){
                            case 'coefficient':
                                return (
									<span>
										<span className={`${prefixCls}-coefficient-name`}>{editName}</span>
										<InputNumber className={`${prefixCls}-coefficient-input`}
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                        ></InputNumber>
									</span>
								)
                            case 'unit':
                                return (
									<span>
										<span className={`${prefixCls}-unit-name`}>{editName}</span>
										<input className={`${prefixCls}-unit-input`}
                                            type = "text"
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e.target.value)}}
                                         ></input>
									</span>
									
								)
                            case 'decimal':
                                return (
									<span className={`${prefixCls}-demical`}>
										<span className={`${prefixCls}-demical-name`}>{editName}</span>
										<InputNumber className={`${prefixCls}-demical-input`}
                                            value = {conditionValue[editKey]}
                                            min = {min}
                                            max = {max}
                                            defaultValue = {defaultValue}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                        ></InputNumber>
									</span>
								)

							case 'range':
								return (
									<span className={`${prefixCls}-range`}>
										<InputNumber className={`${prefixCls}-range-input`}
                                            value = {conditionValue[editKey]}
                                            onChange = {(e) => {handleConditionChange(conditionIndex, editKey, e)}}
                                        ></InputNumber>
									</span>
									
								)
								break;

							case 'color':
								return (
                                    <span>
									<ColorPick value = {conditionValue.color || defaultValue}
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
                                        value = {conditionValue.value} 
                                        onChange = {(value, option) => {handleConditionChange(conditionIndex, editKey, value, true)}}
                                    ></Select>
								)

								break;

                            case 'icon':
                                return (
									<Select 
                                        incluedNo = {incluedNo}
                                        value = {conditionValue.icon} 
                                        type = {'icon'}
                                        onChange = {(value) => {handleConditionChange(conditionIndex, editKey, value)}}
                                    ></Select>
								)

                                break;
						}
					})
				}
                <span onClick={() => {handleConditionDelete(conditionIndex, curConditionTypeKey)}}>
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
            {conditions.length > 0 ?
                conditions.map((condition, index) => {
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

export default Condition;