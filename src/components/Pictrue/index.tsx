

import React from 'react';
import styles from './style.mscss';

export const iconToPicList = ['ALERT'];

/**
 * 渲染图片
 */
export const Picture = (props) => {
    const { type, className = '', ...rest } = props;
    let finalClassName = className;
    
    switch(type){
        case 'ALERT':
            const {isTrigger = false} = rest;
            finalClassName = `${className} ${isTrigger ? styles.trigger : styles.notTrigger}`
    }

    return <div className={finalClassName} {...rest}/>
}