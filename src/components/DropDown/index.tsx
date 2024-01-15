import React, { useEffect, useState } from "react";
import lodash, { min } from 'lodash';
import { Input, Switch, InputNumber, Radio, Checkbox } from "antd";
import ColorPick from 'ColorPick';
import { Condition, SetSelect as Select } from '@/components';
import { msgTag } from '@/common/lang';
import { InputTextSize } from "@/common/constants";
import styles from './style.module.scss';
import StyledAntSelect from "Select/StyledAntSelect";
import {BoldOutlined} from '@ant-design/icons'

export const msg = msgTag('pagetpl');

export type AxisProps = {
    value?: AxisConfig
    autoSetDefaultValue?: boolean
    onChange: (values: AxisConfig) => void;
}

const defaultAxisValue: AxisConfig = {
    axisType: 'public',
    position: 'left',
}

const axisPropsContent = [
    {
        keyString: 'axisType',
        keyName: msg('CURVE.yAxis'),
        options: [
            {
                label: msg('CURVE.public'),
                value: 'public'
            },
            {
                label: msg('CURVE.special'),
                value: 'special'
            }
        ]
    },
    {
        keyString: 'position',
        keyName: msg('CURVE.position'),
        options: [
            {
                label: msg('CURVE.left'),
                value: 'left'
            },
            {
                label: msg('CURVE.right'),
                value: 'right'
            }
        ]
    }
]

export const AxisSet: React.FC<AxisProps> = ({
    value, autoSetDefaultValue, onChange
}) => {

    const [stateData, setStateData] = useState(value);

    useEffect(() => {
        if(value && !lodash.isEqual(stateData, value)){
            setStateData(value);
        }
    }, [value]);

    useEffect(() => {
        if(value === undefined && autoSetDefaultValue){
            setStateData(defaultAxisValue)
            onChange(defaultAxisValue)
        }
    }, [value, autoSetDefaultValue])

    return <div className={styles.axisContainer}>
        {axisPropsContent.map((obj, index) => {
            const {keyString, keyName, options} = obj;
            return <div className={styles.axisItem} key={index}>
                <span>{keyName}</span>
                <Radio.Group 
                    value={stateData?.[keyString]}
                    options={options}
                    onChange={(e) => {
                        const newStateData = Object.assign({}, stateData, {[keyString]: e.target.value});
                        setStateData(newStateData)
                        onChange(newStateData)
                    }} 
                />
            </div>
        })}
        {stateData?.axisType === 'special' ? <div className={styles.axisItem}>
            <span>{msg('CURVE.range')}</span>
            <div>
                {
                    ['min', 'max'].map((keyStr, index) => {
                        const extreme = {min: -10e15, max: 10e15};

                        return <InputNumber 
                            {...extreme}
                            key={index} 
                            style = {{width: '80px'}}
                            size = 'small' 
                            // controls={false}
                            value={stateData[keyStr]} 
                            onChange={(val) => {
                                const newStateData = Object.assign({}, stateData, {[keyStr]: val});
                                setStateData(newStateData)
                                onChange(newStateData)
                            }}
                        />
                    })
                }
            </div>
        </div> : null}
    </div>;
}

export const DropDownComponentType = {
    ICON: 'icon',
    INPUT: 'input',
    SELECT: 'select',
    SELECT_NEW: 'select_new',
    COLOR_PICK: 'colorPick',
    CONDITION: 'condition',
    SWITCH: 'switch',
    AXIS: 'axis',
    CUSTOM: 'custom',
    CHECK: 'check',
    ICONBOLD:'BoldOutlined',
} as const;

export interface Member {
    key: string;
    component: typeof DropDownComponentType[keyof typeof DropDownComponentType];
    customRender?: React.ReactNode;
    // select单选数据为列表
    dataIsArray?: boolean;
    [k:string]: any;
}

export interface DropDownProps {
    className?: string;
    content: Array<{name?: string, members:Array<Member>}>;
    data: {[k:string]: any};
    onChange: (data: {[k:string]: any}) => void;
    size?: 'normal' | 'large';
}

const DropDown: React.FC<DropDownProps> = (props: DropDownProps) => {
    const {className = '', content, data, onChange, size = 'normal'} = props;
    const [boldState,setBoldState] = useState(false)
    let {fontSize,fontWeight} = data
    const handleBlurChange = (key, value) => {
        if(key == 'fontSize'){
            value = value.replace(/^(\-)*(\d+)\.(\d).*$/, "$1$2.$3")
            if(value<10){
                value = 10
            }
            onChange && onChange(Object.assign({}, data, {[key]: value}));
        }
    }
    const handleChange = (key, value) => {
        if(key == 'fontWeight'){
            if(data.fontWeight == 'bold'){
                value = 'initial'
                setBoldState(false)
            }else{
                value = 'bold'
                setBoldState(true)
            }
        }
        if(key == 'fontSize'){
            value = value.replace(/[^\d.]/g, "")
        }
        onChange && onChange(Object.assign({}, data, {[key]: value}));
    }
    return <div className={`${styles.dropDown} ${size === 'large' ? styles.large : ''} ${className}`}>
        {
            content.map((row, index) => {
                return <div key={index}>
                    {row.name ? <span>{row.name}</span> : null}
                    <div className={styles.content}>{
                        row.members.map((member, ind) => {
                            const {component, type, key, options, defaultFirstOption=false, customRender, dataIsArray, ...restProps} = member;
                            switch(component) {
                                case DropDownComponentType.INPUT:
                                    return <Input
                                        key = {ind}
                                        size={size === "normal" ? "small" : undefined}
                                        value={data[key] || ''}
                                        onChange = {(e) => {handleChange(key, e.target.value)}}
                                        onBlur={(row.name == msg('GRID.style')||row.name ==='')?e=>{handleBlurChange(key, e.target.value)}:undefined}
                                        maxLength={InputTextSize.Simple}
                                        className={(row.name == msg('GRID.style')||row.name ==='')?styles.styleEdit:''}
                                        {...restProps}
                                    />
                                case DropDownComponentType.SELECT:
                                    let val = (Array.isArray(data[key]) ? data[key][0] : data[key]) || (type === 'chartType' ? 'line' :'');
                                    if(defaultFirstOption && typeof val === 'undefined' || val === ''){
                                        val = ((options??[])[0]?.value)??'';
                                    }
                                    // 只能单选
                                    /**
                                     * @warn 该组件会将options中的value强制转化成string类型
                                     */
                                    return <Select 
                                        key = {ind}
                                        type = {type} 
                                        value = {val}
                                        options = {options}
                                        className={(row.name == msg('GRID.style')||row.name ==='')?`${styles.styleEdit} quota-set-select`:'quota-set-select'}
                                        onChange = {(value) => {handleChange(key, dataIsArray ? [value] : value)}}
                                        {...restProps}
                                    ></Select>
                                case DropDownComponentType.SELECT_NEW: {
                                    let val = (Array.isArray(data[key]) ? data[key][0] : data[key]);
                                    if(defaultFirstOption && typeof val === 'undefined' || val === ''){
                                        val = ((options??[])[0]?.value)??'';
                                    }
                                    return <StyledAntSelect key={ind} value={val} options={options} onChange={v => handleChange(key, dataIsArray ? [v] : v)}/>
                                }
                                case DropDownComponentType.ICON:
                                    return <Select 
                                        key = {ind}
                                        incluedNo = {true}
                                        type = {'icon'} 
                                        value = {data[key] || ''}
                                        onChange = {(value) => {handleChange(key, value)}}
                                        {...restProps}
                                    ></Select>
                                case DropDownComponentType.COLOR_PICK:
                                    return <ColorPick 
                                        key = {ind}
                                        value={data[key] || ''}
                                        onColorChange = {(value) => {handleChange(key, value)}}
                                        {...restProps}
                                    />
                                case DropDownComponentType.CONDITION:
                                    return <Condition 
                                        key = {ind}
                                        type={type} 
                                        value={data[key] || null}
                                        onConditionChange = {(value) => {handleChange(key, value)}}
                                        {...restProps}
                                    />
                                case DropDownComponentType.SWITCH:
                                    return <Switch 
                                        key = {ind}
                                        size="small"
                                        checked = {data[key] || false}
                                        onChange = {(value) => {handleChange(key, value)}}
                                        {...restProps}
                                    />
                                case DropDownComponentType.AXIS:
                                    return <AxisSet 
                                        key = {ind}
                                        value={data[key]}
                                        autoSetDefaultValue={true}
                                        onChange = {(value) => {handleChange(key, value)}}
                                        {...restProps}
                                    />
                                case DropDownComponentType.CHECK:
                                    return <Checkbox 
                                        key = {ind}
                                        className = {styles.checkbox}
                                        checked = {data[key] || false}
                                        onChange = {(e) => {handleChange(key, e.target.checked)}}
                                        {...restProps}
                                    />
                                case DropDownComponentType.CUSTOM:
                                    return customRender;
                                case DropDownComponentType.ICONBOLD:
                                    return <BoldOutlined 
                                    style={{'marginLeft':'14px','marginRight':'10px',color:boldState||fontWeight == 'bold'?'#1890ff':'#fff'}}
                                    key = {ind} 
                                    value={data[key] || ''}
                                    onClick = {(value) => {handleChange(key, value)}}/>
                            }
                            
                        })
                    }</div>
                </div>
            })
        }
    </div>
}

export default DropDown;