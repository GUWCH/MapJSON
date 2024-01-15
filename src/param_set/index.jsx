import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import Param from 'param_set';
import {config} from './config';

if(process.env.NODE_ENV === 'development'){
    (function(){
        const fac_alias = 'SGCN.Farm.StorageEMS';
    
        // 回传格式
        //  data = {alias:value}
        function save(data){
            // TODO 
            // 数据回传
            console.log(data);
        }
    
        let container = document.getElementById('center');
        ReactDOM.render(<Param 
            container={container}
            facAlias={fac_alias} 
            config={config} 
            save={(data) => { save(data) }} 
        />, container);
    })();
}


/**
 * 
 * @param {Object} options 
 * @param {HTMLElement} options.dom
 * @param {String} options.facAlias
 * @param {Map} options.config
 * @param {Map} options.authMap
 * @param {()=>{}} options.onSubmit
 */
export const init = function (options) {
    let {dom, facAlias, config: importCfg, authMap= {}, onSubmit=()=>{}} = options || {};

    if(!dom || !dom instanceof HTMLElement){
        console.error('No Render Container!');
        return;
    }

    if(!facAlias){
        console.error('No Fac Agc Alias!');
        return;
    }

    if(!importCfg || Object.prototype.toString.call(importCfg) !== '[object Object]'){
        importCfg = config;
    }

    if(!authMap || Object.prototype.toString.call(authMap) !== '[object Object]'){
        authMap = {};
    }

    ReactDOM.render(<Param 
        container={dom}
        facAlias={facAlias} 
        config={JSON.parse(JSON.stringify(importCfg))} 
        authMap={JSON.parse(JSON.stringify(authMap))}
        save={(data, callback, closeFn) => {onSubmit(data, callback, closeFn)}}
    />, dom);
}