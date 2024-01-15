/* eslint-disable */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Slider } from 'antd';
import { FontIcon, IconType } from 'Icon';

import styles from './style.mscss';

export default function AntSlider(props){
    let [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    },[props.value]);

    const minus = e => {
        let val = value - props.step;
        if(val < props.min){
            val = props.min;
        }
        setValue(val);
        onChange(val);
    };

    const increase = e => {
        let val = value + props.step;
        if(val > props.max){
            val = props.max;
        }
        setValue(val);
        onChange(val);
    };

    const onChange = (val) => {
        setValue(val);
        props.onChange(val, (val - props.min) / (props.max - props.min));
    }

    return (
        <div className={`${styles.slider} ${props.className}`} style={props.style}>
            <i className={`${styles.minus} ${value <= props.min ? styles.disabled : ''}`} onClick={minus}>
                <FontIcon type={IconType.MINUS}/>
            </i>
            <div>
                <Slider 
                    {...props}
                    tooltipVisible={false}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={value}
                    onChange={onChange}
                />
            </div>
            <i className={`${styles.increase} ${value >= props.max ? styles.disabled : ''}`} onClick={increase}>
                <FontIcon type={IconType.PLUS}/>
            </i>
        </div>
    );
}

AntSlider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
};

AntSlider.defaultProps = {
    min: 0,
    max: 100,
    value: 1,
    step: 1,
    onChange: () =>{},
    className: '',
    style: {}
};

/* eslint-enable */