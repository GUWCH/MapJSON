import React from "react";
import { FontIcon, IconType } from 'Icon';
import { isZh, getConditionStyle, keyStringMap } from "../../constants";
import DynData from '../DynData';
import styles from './style.mscss';

import {gradient, highLight} from '@/common/util-scada';


export const ValListStyleShow = (props) => {
    let { 
        className = '',
        rotateClassName = '',
        quota = {}, 
        raw_value = '', 
        display_value = '', 
        part = '', 
        loction = '',
        assocValue,
        hideDes,
        needShadow, 
        aKey
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

    let borderColor = highLight(color, 50);

    return (
        <div className={className} style={
            color ? {
                background: colorFrom || colorTo ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:'',
                borderColor: borderColor || '',
                boxShadow: needShadow ? `0px 0px 8px 0px ${borderColor || ''}` : 'none',
                
            } : {boxShadow: needShadow ? '' : 'none',}
        }>
            <div className={rotateClassName}>
                <FontIcon type = {IconType[icon] || ''}></FontIcon>
                {hideDes ? null : 
                <span className={styles.des}>
                    <DynData 
                        name = {isZh ? quota.nameCn : quota.nameEn}
                        aKey = {aKey}
                        value = {isZh ? nameCn || display_value : nameEn || display_value}
                        placement = {'bottom'}
                    />
                </span>}
            </div>
        </div>
    )
};

export const StatsStyleShow = (props) => {

    let {STATISTICS, UNIVERSAL} = keyStringMap;

    let {data, quota, iconClassName, ind, aKey, colNum} = props;

    let param = {
        ...props,
        part: STATISTICS,
        location: UNIVERSAL
    }

    let {color, icon, value, unit} = getConditionStyle(param);

    let {nameCn, nameEn} = quota || {};

    unit === undefined ? unit = quota.unit : null;

    let {colorFrom, colorTo} = gradient(color, 0.25);

    return <div 
        key={ind} 
        style={{
            flex: `0 0 ${100/colNum}%`,
        }}
    >
        <div style={color ? {background: colorFrom || colorTo ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:''} : {}}>
            <div className={styles.name}>
                {icon && <span className={iconClassName || ''}><FontIcon type={IconType[icon]} /></span>}
                <span>{isZh ? nameCn : nameEn}{unit && <span>({unit})</span>}</span>
            </div>
            <div className={styles.number}>
                <DynData name={isZh ? nameCn : nameEn} aKey={aKey} value={value}/>
            </div>
        </div>
    </div>;

}

export const IconColor = (props) => {
    const {icon, color, size, iconFontSize} = props;

    const boxSize = icon ? (size ? size : '20px') : '8px';

    return <>
        {icon || color ? 
        <div className={styles.icon} style = {color ? {backgroundColor: color, width: boxSize, height: boxSize, fontSize: iconFontSize || ''} : {}}>
            {icon ? <FontIcon type={IconType[icon]}/> : null}
        </div> : null}
    </>
}


