/* eslint-disable */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import styles from './index.mscss';

export default function Slider(props){
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
        props.onChange(val, (val - props.min) / (props.max - props.min));
    }

    return (
        <div className={`${styles.container} ${props.className}`} style={props.style}>
            <i className={styles.minus} onClick={minus}></i>
            <div>
                <div className={styles.bg}></div>
                <div className={styles.overlay} style={{ 
                    width: `${100 * (value - props.min) / (props.max - props.min)}%` 
                }}></div>
                <input type='range' onChange={e => {
                    let target = e.currentTarget;
                    setValue(target.value);
                    onChange(target.value);
                }} min={props.min}  max={props.max}  step={props.step} value={value}/>
            </div>
            <i className={styles.increase} onClick={increase}></i>
        </div>
    );
}

Slider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
};

Slider.defaultProps = {
    min: 0,
    max: 100,
    value: 1,
    step: 1,
    onChange: () =>{},
    className: '',
    style: {}
};

/* eslint-enable */