export const getCookie = (name) => {
    var arr = document.cookie
            .match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    if (arr != null) {
        return unescape(arr[2]);
    }
    return null;
};

const getQueryString = (name) => {
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

const getQueryStringEnhance = (name) => {
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

export const Global = {
    hostName:
        window.location.origin
        //IE下换行有空格
        || `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`,
    language:
        getCookie('windosWebLang')
        || getQueryStringEnhance('locale')
        || getQueryString('lang')
        || getCookie('lang')
        || getCookie('portallanguage')
        || 'zh'
};

export const scadaVar: (varName: string) => any = (varName) => {
    try{
        const varNames = varName.split('.');
        let win = window as Window | undefined;
        varNames.map(v => {
            if(win && v in win){
                win = win[v];
            }else if(win && v in win.parent){
                win = win.parent[v];
            }else if(win && v in (win.top as Window)){
                win = (win.top as Window)[v];
            }else{
                win = undefined;
            }
        });
        return win;
    }catch(e){
        console.error(e);
        return undefined;
    }
};