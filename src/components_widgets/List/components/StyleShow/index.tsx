import React from "react";
import { FontIcon, IconType } from 'Icon';
import { Picture, iconToPicList } from "Pictrue";
import styles from './style.mscss';

import {gradient, highLight} from '@/common/util-scada';


export const ValListStyleShow = (props) => {
    let { 
        className = '',
        rotateClassName = '',
        pictureClassName= '',
        isTrigger = false,
        quota = {}, 
        raw_value = '',  
        part = '', 
        loction = '',
        assocValue,
        needShadow, 
        isPicDeviceType = false
    } = props;

    let {valueListStyle = [], associated} = (quota[part] || {})[loction] || {};

    let valueObj = valueListStyle.find((ele) => {
        return ele.value.toString() === raw_value.toString();
    })

    let {icon, nameCn, nameEn, color} = valueObj || {};

    let { associatedValue } = associated || {};

    if(assocValue && associatedValue === assocValue){
        color = associated.color;
        rotateClassName = '';
    }

    let {colorFrom, colorTo} = gradient(color, 0.25);

    const isPicture = isPicDeviceType && iconToPicList.indexOf(icon) > -1;

    let borderColor = highLight(color, 50) || (isPicture ? "transparent" : '');

    return (
        <div className={className} style={
            color || isPicture ? {
                background: colorFrom || colorTo ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:'',
                borderColor: borderColor,
                boxShadow: needShadow ? `0px 0px 8px 0px ${borderColor}` : 'none',
                
            } : {boxShadow: needShadow ? '' : 'none',}
        }>
            <div className={rotateClassName}>
                {
                    isPicture ? 
                    <Picture className = {pictureClassName} type = {icon} isTrigger = {isTrigger}></Picture> 
                    : <FontIcon type = {IconType[icon] || ''}></FontIcon>
                }
            </div>
        </div>
    )
};

export const IconColor = (props) => {
    const {icon, color, size, iconFontSize} = props;

    const boxSize = icon ? (size ? size : '20px') : '8px';

    return <>
        {icon || color ? 
        <div className={styles.icon} style = {color ? {
            backgroundColor: color, 
            width: boxSize, 
            height: boxSize, 
            fontSize: iconFontSize
        } : {}}>
            {icon ? <FontIcon type={IconType[icon]}/> : null}
        </div> : null}
    </>
}


