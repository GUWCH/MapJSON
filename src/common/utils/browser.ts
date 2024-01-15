export const getBsVivibilityState = () => {
    let prefixs = ['webkit', 'moz', 'mos', 'o'];
    if ('visibilityState' in window.document) return window.document.visibilityState;

    for (let i = 0; i < prefixs.length; i++) {
        const prop = `${prefixs[i]}VisibilityState`;
        if (prop in window.document){
            return window.document[prop];
        }
    }
    // not support
    return null;
}

/** 浏览器Tab窗口是否可见 */
export const isVisible = () => {
    const dc = window.document;
    if("hidden" in dc) return !dc.hidden;
    // @ts-ignore
    if("webkitHidden" in dc) return !dc.webkitHidden;
    // @ts-ignore
    if("mozHidden" in dc) return !dc.mozHidden;    
    return true;
}

let scrollBarWidth;

export const getScrollWidth = () => {
    if(scrollBarWidth !== undefined && scrollBarWidth !== null){
        return scrollBarWidth;
    }else{
        let noScroll, scroll, oDiv = document.createElement("DIV");
        oDiv.style.cssText = 'position:absolute;top:-1000px;width:100px;height:100px;overflow:hidden;';
        noScroll = document.body.appendChild(oDiv).clientWidth;
        oDiv.style.overflowY = "scroll";
        scroll = oDiv.clientWidth;
        document.body.removeChild(oDiv);
        scrollBarWidth = noScroll - scroll;
        return scrollBarWidth;
    }
};

export const getPos = (el?: Element | null) => {
    if(!el) return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    
    let box = el.getBoundingClientRect(),
        doc = el.ownerDocument,
        body = doc.body,
        html = doc.documentElement,
        clientTop = html.clientTop || body.clientTop || 0,
        clientLeft = html.clientLeft || body.clientLeft || 0,
        scrollTop = (self.pageYOffset || html.scrollTop || body.scrollTop ) - clientTop,
        scrollLeft = (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientLeft,
        top = box.top + scrollTop, 
        left = box.left + scrollLeft,
        bottom = box.bottom + scrollTop,
        right = box.right + scrollLeft;
    return {
        top: top,
        left: left,
        bottom,
        right
    };
};

export const getCookie = (name) => {
    var arr = document.cookie
            .match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    if (arr != null) {
        return unescape(arr[2]);
    }
    return null;
};

export const setCookie = (name, value) => {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + escape(value) + ';expires='
            + exp.toGMTString() + '; path=/';
};

export const  clearCookie = () => {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
        for (var i = keys.length; i--;) {
            document.cookie=keys[i]+'=0;expires=' + new Date(0).toUTCString() + '; path=/';
        }
    }
};

export const setLocalValue = (key, val) => {
    localStorage.setItem(key, val);
};

export const getLocalValue = (key) => {
    return localStorage.getItem(key);
};

// eslint-disable-next-line complexity
export const addUrlQuery = (url, params) => {
    if(typeof url !== 'string' || !url || Object.prototype.toString.call(params) !== '[object Object]'){
        return url || '';
    }

    let urls = url.split('#');
    url = urls.shift();
    let q = '';
    for(let k in params){
        let val = params[k];
        if(['string', 'boolean', 'number'].indexOf(typeof val) === -1 || 
            (typeof val === 'string' && !val)
        ){
            continue;
        }
        q += `${q ? '&' : ''}${k}=${val}`;
    }

    url = q ? `${url}${url.indexOf('?') > -1 ? '&' : '?'}${q}` : url;
    return `${url}${urls.length > 0 ? '#' + urls.join('#') : ''}`;
};

export const getQueryString = (name) => {
    var reg = new RegExp('(^|&|\\?)' + name + '=([^&\\?]*)(&|\\?|$)', 'i');
    var r = window.location.search.substr(1).match(reg);

    if (r != null){
        var value = r[2] || '';
        if(value.indexOf('%u') >= 0){
            return unescape(value);
        }else{
            return decodeURIComponent(value);
        }
    }
    return null;
};

export const getQueryStringEnhance = (name) => {
    let reg = new RegExp("(^|&|#|\\\\?)"+ name +"=([^(\&|\#|\\?)]*)(\\?|#|&|$)");
    let r = (window.location.href).match(reg);
    if (r != null){
        var value = r[2] || '';
        if(value.indexOf('%u') >= 0){
            return unescape(value);
        }else{
            return decodeURIComponent(value);
        }
    }
    return null;
};


export const getQuery = (): Record<string, string | undefined> => {
    const search = window.location.search
    if(!search){
        return {}
    }
    return search.slice(1).split('&').reduce((p, c) => {
        const kv = c.split('=')
        const k = decodeURIComponent(kv[0])
        const v = decodeURIComponent(kv[1])
        if (k && v) {
            return {...p, [k]: v}
        }
        return p
    }, {} as Record<string, string | undefined>)
}

/**
 * 
 * @param {Element} node 
 * @returns 
 */
export const getNodeAttrs = (node: Element) => {
    var attrMap = {};
    if (typeof node === "object" && node.attributes && node.attributes.length > 0) {
        var attributes = node.attributes || [];
        for (var i = 0, len = attributes.length; i < len; i++) {
            attrMap[attributes[i].name] = attributes[i].value;
        }
    }
    return attrMap;
}

export const getTextWidth = (text: string) => {
    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.style.fontFamily = '微软雅黑, Microsoft YaHei ,Arial, Helvetica, sans-serif, -apple-system, BlinkMacSystemFont, San Francisco, Helvetica Neue, Segoe UI, Tahoma, Roboto, PingFang SC, 苹方';
    span.textContent = text;
    document.body.appendChild(span);
    let textWidth = span.clientWidth;
    document.body.removeChild(span);
    return textWidth;
}