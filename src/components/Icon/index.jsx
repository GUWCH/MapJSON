/* eslint-disable */

import React, { CSSProperties } from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import iconsMap from './iconsMap';

import styles from './style.mscss';
import { uuid } from '@/common/utils';

// icon list
export const IconType = iconsMap;

/**
 * 
 * @param {*} name 类名索引
 * @param {*} uid 当前页面创建的图标span的id
 */
export const getIconCode = (name, uid) => {
    const defaultUid = uuid(8);
    const id = uid ?? defaultUid;
    let iconCode = '';

    let iconEle = document.getElementById(id);
    if(!iconEle){
        let node = <span 
            id = {id}
            className={`icon-moon-${IconType[name] || ''}`} 
            style={{display: 'none'}} 
        ></span>
        let ele = document.createElement("span");
        ele.innerHTML = renderToStaticMarkup(node);
        document.body.appendChild(ele);
        iconCode = window.getComputedStyle(ele, '::before').getPropertyValue('content');
    }else{
        iconEle.className = `icon-moon-${IconType[name]}`;
        iconCode = window.getComputedStyle(iconEle, '::before').getPropertyValue('content');
    }

    const formIconCode = iconCode ? iconCode.split('"')[1] : '';

    return formIconCode;
}

/**
 * pure font icon
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} props 
 * @property {String} type {@link ../../../common/css/iconfont.scss}
 * @returns 
 */
export const FontIcon = (props) => {
    const { type, className, style, ...rest } = props;
    return (
        <span 
            className={`icon-moon-${type || ''} ${className||''}`} 
            style={style} 
            {...rest}
        ></span>
    );
}

FontIcon.propTypes = {
    type: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
};

FontIcon.defaultProps = {
    type: '',
    style: {},
    className: ''
};

/**
 * 无边无底
 * @param {*} props 
 * @returns 
 */
 export const PureIcon = (props) => {
    const {type, tip, tipColor, highlight, ...rest} = props;
    const hcls = highlight ? styles.highlight : '';
    const icon = <FontIcon type={type} className={`${styles.pureicon} ${hcls}`} {...rest}/>;
    return tip ? 
    <Tooltip placement='top' title={tip} overlayClassName={styles.tip} color={styles.tipColor || tipColor}>{icon}</Tooltip>
    : icon;
}

PureIcon.propTypes = {
    type: PropTypes.string,
    highlight: PropTypes.bool,
    tip: PropTypes.string,
    tipColor: PropTypes.string,
    style: PropTypes.object
};

PureIcon.defaultProps = {
    type: '',
    highlight: false,
    tip: '',
    tipColor: '',
    style: {}
};

/**
 * 风格1字体图标, 有边框
 * @param {*} props 
 * @returns 
 */
export const Icon = (props) => {
    const {type, tip, tipColor, highlight} = props;
    const hcls = highlight ? styles.highlight : '';
    const icon = <div className={`${styles.icon} ${hcls}`}>
        <FontIcon type={type}/>
    </div>;
    return tip ? 
    <Tooltip placement='top' title={tip} overlayClassName={styles.tip} color={styles.tipColor || tipColor}>{icon}</Tooltip>
    : icon;
}

Icon.propTypes = {
    type: PropTypes.string,
    highlight: PropTypes.bool,
    tip: PropTypes.string,
    tipColor: PropTypes.string
};

Icon.defaultProps = {
    type: '',
    highlight: false,
    tip: '',
    tipColor: ''
};

/**
 * 风格2字体图标, 无边框, 灰度背景
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} props 
 * @returns 
 */
export const Icon2 = (props) => {
    const {type, tip, tipColor, highlight, ...rest} = props;
    const hcls = highlight ? styles.highlight : '';
    const icon = <div className={`${styles.icon2} ${hcls}`} {...rest}>
        <FontIcon type={type}/>
    </div>;
    return tip ? 
    <Tooltip placement='top' title={tip} overlayClassName={styles.tip} color={styles.tipColor || tipColor}>{icon}</Tooltip>
    : icon;
}

Icon2.propTypes = {
    type: PropTypes.string,
    highlight: PropTypes.bool,
    tip: PropTypes.string,
    tipColor: PropTypes.string
};

Icon2.defaultProps = {
    type: '',
    highlight: false,
    tip: '',
    tipColor: ''
};

/* eslint-enable */