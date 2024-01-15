import {fetch, Headers} from 'whatwg-fetch';
import { Global, scadaVar } from '../constants';

export default class BaseDAO{
    private _channelName: string;
    private _domain: string;

    constructor(channelName?: string, domain?: string){
        this._channelName = channelName || `${new Date().getTime()}_channelName`;
        this._domain = domain || '';
    }
    
    _addUrlSuffix(url){
        // modify url suffix in scada
        var fn: any = scadaVar('now_time_tail');
        if(typeof fn === 'function'){
            return fn(url, true);
        }else{
            url += url ? (url.indexOf('?') > -1 ? '&_=' : '?_=') + new Date().getTime() : '';
        }
        return url;
    }

    _objToQueryString(obj, skipEncode?: boolean) {
        const keyValuePairs: any[] = [];
        for (const key in obj) {
          const finalK = skipEncode? key : encodeURIComponent(key)
          const finalV = skipEncode? obj[key] : encodeURIComponent(obj[key])
          keyValuePairs.push(finalK + '=' + finalV);
        }
        return keyValuePairs.join('&');
    }

    fetchData(path, query={}, body, type?: any, uploadFile=false, opt?: {
        skipUriEncode?: boolean
    }){
        let url = (this._domain? this._domain : Global.hostName) + path;
        let options = {
            method: type || 'POST',
            body: body || '',
            headers: {}
        };
        let {method='GET', headers: oldHeaders, body: data} = options;

        let queryParams = this._objToQueryString(query, opt?.skipUriEncode);
        if(queryParams){
            url += (url.indexOf('?') > -1 ? '&' : '?' + queryParams);
        }
        url = this._addUrlSuffix(url);

        let headers = new Headers();
        for(let k in oldHeaders){
            headers.append(k, oldHeaders[k]);
        }
        if(!uploadFile){
            headers.append('Content-Type', 'application/json;charset=utf-8');
        }        

        //signature in scada
        //compatible with lower version
        if(method.toUpperCase() === 'GET'){
            if(window.WS && typeof window.WS.sign === 'function'){
                headers.append('Token', window.WS.token(null, url));
                let content = window.WS.getGetSignStr(url);
                let sign = window.WS.sign(url, content);
                if(sign){
                    headers.append("Authorization", sign);
                }
            }
        }else if(method.toUpperCase() === 'POST'){
            if(window.WS && typeof window.WS.sign === 'function'){
                headers.append('Token',window.WS.token(null, url));
                let sign1 = window.WS.sign(url, data);
                if(sign1){
                    headers.append("Authorization", sign1);
                }
            }
        }

        options.headers = headers;

        return fetch(url, options);
    }
};

export const parseRes = async (res) => {
    try{
        const contentType = res.headers.get("content-type");
        if(contentType && contentType.indexOf('application/json') > -1){
            const retJson = await res.json();
            if (process.env.NODE_ENV !== 'development') {
                if(retJson && String(retJson.code) === '30000'){
                    window.location.href = '../login/login.html';
                }
            }
            return retJson;
        }
        return res;
    }catch(e){
        return {};
    }
};

export const daoIsOk = (res) => res && String(res.code) === '10000';

export function LegalData(o){
    return o && String(o.code) === '10000';
}

export function EmptyList(o){
    return !LegalData(o) || !Array.isArray(o.data) || o.data.length === 0;
}
