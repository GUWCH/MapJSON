import React from "react";
import { Select } from "antd";
// import { NewSelect } from '@/components/NewSelect';
import { CHART_TYPES, msg, ICONS} from './constant';
import { FontIcon, IconType } from 'Icon';
import './style.scss';

const {Option} = Select;

const quota_set_select = 'quota-set-select';

const NO_CONTENT = msg('config.no');

const NO = {
    value: null,
    name: NO_CONTENT
};

function SetSelect(props) {

    let { type = '', options, value, onChange, incluedNo = false, className = quota_set_select, isMultiple = false,isShowSearch=false} = props;
    
    const renderIron = (iconKey) =>{
        return (
            <div className={`${className}-icon`}><FontIcon type={IconType[iconKey]}/></div>
        )
    }

    const renderImg = (img) =>{
        return (
            <div className= {`${className}-${img}`}></div>
        )
    }

    const renderText = (text) =>{
        return (
            <span className= {`${className}-text`}>{text}</span>
        )
    }

    const renderChartType = (name) => {
        return (
            <>
                <span className= {`${className}-${name}`}></span>
                <span className= {`${className}-${name}-text`}>{msg(`config.${name}`)}</span>
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
            ICONS.map(iconKey => {
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

    return (
        <Select
            mode={isMultiple? 'multiple': undefined}
            showSearch={isShowSearch}
            className={`${className}-self`}
            dropdownClassName = {`${className}-dropDown`}
            listHeight = {150}
            value = {value}
            filterOption={(input,option)=>{
                return option?.name?option?.name?.indexOf(input)>-1:false
            }}
            onChange = {typeof(onChange) === 'function' ? (value) => {onChange(value)} : () => {}}
        >
            {
                newOptions.map((ele, index) => {
                    let {value, name, ...rest} = ele;
                    return (
                        <Option 
                            className={`${className}-select`}
                            value = {value?.toString() || value}
                            name = {name}
                            key = {index}
                            {...rest}
                        >{name}</Option>
                    )
                })
            }
        </Select>
    )
}

export default SetSelect;
