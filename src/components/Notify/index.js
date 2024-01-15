import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Notification from 'rc-notification';
import './style.scss';

const Notify = (props={}) => {
    let notification = null;
    Notification.newInstance(props, (n) => {notification = n;});
    return notification;
};

const ZINDEX = 1000000;
export const notification = Notify({
    style:{
        top: 5,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: ZINDEX
    }
});
export const notify = (message) => {
    console.debug('notify', message)
    // scada function
    if(typeof CommonUtil !== 'undefined' 
            && CommonUtil.envAlert
            && typeof CommonUtil.envAlert.exe === 'function'
    ){
        CommonUtil.envAlert.exe(message);
    }else{
        notification.notice({
            content: message,
            duration: 3
        });
    }
};

export default Notify;