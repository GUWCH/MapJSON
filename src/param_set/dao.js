import { Global, scadaVar } from '../common/constants';

export class BaseDAO{
    constructor(channelName){
        this._channelName = channelName || `${new Date().getTime()}_channelName`;
    }
    
    _addUrlSuffix(url){
        // modify url suffix in scada
        var fn = scadaVar('now_time_tail');
        if(typeof fn === 'function'){
            return fn(url);
        }
        return url;
    }

    CreateXMLHttp(){
        let flag = true;
        let xmlhttp = null; 
        try{
            xmlhttp = new XMLHttpRequest();
        }catch(e){  
            try{
                xmlhttp = ActiveXobject("Msxml12.XMLHTTP");
            }catch(e1){
                try{
                    xmlhttp = ActiveXobject("Microsoft.XMLHTTP");
                }catch(e2){
                    flag = false;
                }   
            }  
        }
         
        if(!flag){
            throw new RuntimeExecption("创建XMLHTTPRequest 对象失败");
        }else{
            return xmlhttp;
        }
    }

    _fetchDataAction(ajaxObj){
        let ua = window.navigator.userAgent;
        if(/.*(MSIE 9.0|MSIE 10.0).*/gi.test(ua)){
            let d = $.Deferred();
            let xhr = this.CreateXMLHttp();

            if(!xhr){
                d.reject('无法发送请求！');
            }

            let method = ajaxObj.type.toUpperCase();

            try{
                xhr.responseType = 'json';
            }catch(e){}
            try{
                //xhr.withCredentials = true;
            }catch(e){}

            xhr.onload = function() {
                if(xhr.status !== 200){
                    d.reject(xhr.status);
                    return xhr;
                }
    
                let response = xhr.response || xhr.responseText;
    
                if(typeof response =='string'){
                    try{
                        response = JSON.parse(response);
                    }catch(e){
                        d.reject(xhr.status);
                        return xhr;
                    }
                }
                
                if(typeof response !== 'object'){
                    d.reject(xhr);
                    return xhr;
                }else{
                    d.resolve(response);
                    return xhr;
                }
            };
    
            xhr.onerror = function(){
                d.reject(xhr);
                return xhr;
            };

            if(method.trim() === 'GET'){
                let str = '';
                if(typeof ajaxObj.data === 'string'){
                    str = ajaxObj.data;
                }else if(Object.prototype.toString.call(ajaxObj.data) === '[object Object]'){
                    str = Object.keys(ajaxObj.data).map(function(key){
                        return key + '=' + ajaxObj.data[key];
                    }).join('&');
                }
                let url = ajaxObj.url + (str ? (ajaxObj.url.indexOf('?') > -1 ? '&' : '?') + str : '');
                xhr.open(method, url);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                if(window.WS){
                    xhr.setRequestHeader('Token',window.WS.token(xhr, url));
                    var content = window.WS.getGetSignStr(url);
                    var sign = window.WS.sign(url, content);
                    if(sign){
                        xhr.setRequestHeader("Authorization", sign);
                    }
                }
                xhr.send();
            }else{
                xhr.open(method, ajaxObj.url);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                if(window.WS){
                    xhr.setRequestHeader('Token',window.WS.token(xhr, ajaxObj.url));
                    var sign1 = window.WS.sign(ajaxObj.url, ajaxObj.data);
                    if(sign1){
                        xhr.setRequestHeader("Authorization", sign1);
                    }
                }
                xhr.send(ajaxObj.data);
            }

            return d.promise();
        }else{
            let beforeSend = ajaxObj.beforeSend;
            ajaxObj.beforeSend = function(xhr) {
                if(window.WS){
                    xhr.setRequestHeader('Token',window.WS.token(xhr, ajaxObj.url));
                    //Authorization
                    let method = ajaxObj.type || '';
                    method = method.toUpperCase();
                    let content;
                    if(method === 'GET'){
                        content = window.WS.getGetSignStr(ajaxObj.url, ajaxObj.data);
                    }else{
                        content = ajaxObj.data;
                    }
                    let sign = window.WS.sign(ajaxObj.url, content);
                    if(sign){
                        xhr.setRequestHeader("Authorization", sign);
                    }
                }
                if(typeof beforeSend === 'function'){
                    beforeSend(xhr);
                }
            };
            return $.ajax(ajaxObj);
        }        
    }

    fetchData(path, data, type, contentType = 'application/json;charset=UTF-8', 
        dataType = 'json', isNeedCheckSession = false){
        const ajaxObj = {
            'url': this._addUrlSuffix(Global.hostName 
                + path 
                + (path ? (path.indexOf('?') > -1 ? '&_=' : '?_=') + new Date().getTime() : '')),
            'type': type || 'POST',
            'data': data || '',
            'dataType': dataType
        };
        
        if(contentType){
            ajaxObj.contentType = contentType;
        }
        
        if(isNeedCheckSession){
            // eslint-disable-next-line new-cap
            const ajaxDeferred = $.Deferred();

            ajaxObj.beforeSend = function(request) {
                //request.setRequestHeader('token', '');
            };
            
            this.checkSession().then(
                valid => {
                    if(valid){
                        this._fetchDataAction(ajaxObj).then(
                            value => ajaxDeferred.resolve(value),
                            (xhr, status, errorMsg) => {
                                ajaxDeferred.reject(errorMsg);
                            }
                        );
                    }else{
                        // TODO
                    }
                },
                (xhr, status, errorMsg) => {
                    console.error(`session.check: ${errorMsg}`);
                    // TODO
                }
            );

            return ajaxDeferred.promise();
        }else{
            return this._fetchDataAction(ajaxObj);
        }
    }

    checkSession(){
        const sessionId = localStorage.getItem('global_id');

        return this._fetchDataAction({
            'url': `/scadaweb/checksession?global_id=${encodeURIComponent(sessionId)}`
        });
    }
};


export default class EmsDAO extends BaseDAO{
    constructor(){
        super('scada.ems.parameter');
    }

    request (reqArr){
        var promiseArr = [];

        reqArr.map((req, i) => {
            promiseArr.push(new Promise(
                (resolve, reject) => {
                    this.fetchData(req.url, JSON.stringify(req.data), req.method).then(
                        data => {
                            if(data.code && data.code.toString() === '10000'){
                                resolve(data);
                            }else{
                                reject(data);
                                console.info('get.ems.config: Fail to get data!');
                            }
                        },
                        (xhr, status, errorMsg) => {
                            reject(`get ${req.url} failed`);
                            console.error(`get.ems.config: ${errorMsg}`);
                        }
                    );
                }
            ));
        });

        return Promise.all(promiseArr);
    }

    send (reqArr){
        var promiseArr = [];

        reqArr.map((req, i) => {
            promiseArr.push(new Promise(
                (resolve, reject) => {
                    this.fetchData(req.url, JSON.stringify(req.data), req.method).then(
                        data => {
                            resolve(data);
                        },
                        (xhr, status, errorMsg) => {
                            reject(`get ${req.url} failed`);
                            console.error(`get.ems.config: ${errorMsg}`);
                        }
                    );
                }
            ));
        });

        return Promise.all(promiseArr);
    }
}