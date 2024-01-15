import React from "react";
import { Select } from "antd";
// import { NewSelect } from '@/components/NewSelect';
import { CHART_TYPES, msg} from './constant';
import { FontIcon, IconType } from 'Icon';
import './style.scss';

const {Option} = Select;

const quota_set_select = 'quota-set-select';

const NO_CONTENT = msg('config.no');

const NO = {
    value: null,
    name: NO_CONTENT
};

function NewSelect(props) {

    let { type = '', options, value, onChange, incluedNo = false} = props;

    const renderIron = (iconKey) =>{
        return (
            <div className={`${quota_set_select}-icon`}><FontIcon type={IconType[iconKey]}/></div>
        )
    }

    const renderImg = (img) =>{
        return (
            <div className= {`${quota_set_select}-${img}`}></div>
        )
    }

    const renderText = (text) =>{
        return (
            <span className= {`${quota_set_select}-text`}>{text}</span>
        )
    }

    const renderChartType = (name) => {
        return (
            <>
                <span className= {`${quota_set_select}-${name}`}></span>
                <span className= {`${quota_set_select}-${name}-text`}>{msg(`config.${name}`)}</span>
            </>
        )
    }
    let defautOptions = [];

    switch(type){
        case "show_as":
            defautOptions = [
                {
                    value: 'number',
                    name: renderText(msg('config.number'))
                },{
                    value: 'progress',
                    name: renderImg('progress')
                },{
                    value: 'progress_step',
                    name: renderImg('progress_step')
                }
            ]
            break;
        
        case "icon":
            Object.keys(IconType).map(iconKey => {
                defautOptions.push({
                    value: iconKey,
                    name: renderIron(iconKey)
                }) 
            })
            break;

        case "chartType":
            defautOptions = CHART_TYPES.map(type => {
                return {
                        value: type,
                        name: renderChartType(type)
                    }
                })

            break;
    };

    let newOptions = incluedNo ? [NO, ...(options || defautOptions)] : (options || defautOptions);

    if(value === undefined){
        typeof(onChange) === 'function' && newOptions[0]?.value ? onChange(newOptions[0]?.value) : null;
    }else if(value){
        value = value.toString();
    }

    return (
        <Select
            className={`${quota_set_select}-self`}
            dropdownClassName = {`${quota_set_select}-dropDown`}
            listHeight = {150}
            value = {value}
            onChange = {typeof(onChange) === 'function' ? (value) => {onChange(value)} : () => {}}
        >
            {
                newOptions.map((ele, index) => {
                    return (
                        <Option 
                            className={`${quota_set_select}-select`}
                            value = {ele.value?.toString() || ele.value}
                            key = {index}
                        >{ele.name}</Option>
                    )
                })
            }
        </Select>
    )
}

const areEqual = (prevProps, nextProps) => {
    if(prevProps.value !== nextProps.value){
        return false;
    };

    if(prevProps.options === nextProps.options){
        return true;
    }

    if(prevProps.options.length !== nextProps.options.length){
        return false;
    }

    let areEqualFlag = true;

    prevProps.options.map((option, index) => {
        let nextOption = nextProps.options[index];
        if(option.value !== nextOption.value || option.name !== nextOption.name){
            areEqualFlag = false
        }
    })

    return areEqualFlag;
}

export default React.memo(NewSelect, areEqual);
