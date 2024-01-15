import { useSolarTemplate, useSolarSiteListPageId } from '@/common/const-scada';

/**
 * 跳转到场站
 * @param {String} siteAlias
 */
 export const toSitePage = (siteAlias) => {
    if(!siteAlias)return;
    
    let query = `gFieldParm=${encodeURIComponent(siteAlias)}`;

    if (process.env.NODE_ENV === 'development') {
        window.open(`./solar_site.html?${query}`);
    }else{
        window.open(`../solar/site.html?${query}`);
    }
};

/**
 * 跳转到Fleet
 * @param {String} centerAlias
 */
 export const toFleet = (centerAlias) => {
    if(!centerAlias)return;
    
    let query = `gFieldParm=${encodeURIComponent(centerAlias)}`;

    if (process.env.NODE_ENV === 'development') {
        window.open(`./center_index.html?${query}`);
    }else{
        window.open(`../center_fleet/index.html?${query}`);
    }
};

/**
 * 跳转到场站列表
 * @param {String} centerAlias
 */
 export const toSiteList = (centerAlias) => {
    if(!centerAlias)return;
    
    let query = `gFieldParm=${encodeURIComponent(centerAlias)}`;

    if (process.env.NODE_ENV === 'development') {
        window.open(`./center_sites.html?${query}`);
    }else{
        // 使用模板时切换到模板画面
        if(useSolarTemplate && useSolarSiteListPageId){
            window.location = `../page/index.html?id=${useSolarSiteListPageId}&${query}`;
        }else{
            window.location = `../center_fleet/sitelist.html?${query}`;
        }
    }
};

async function _getConstList(constTypeName, firstDeviceStatusAlias, onlyValid){
    let ajaxList = [];

    // name contains blank
    if(constTypeName){
        ajaxList.push(_daoIns.getConst(constTypeName));
    }else{
        ajaxList.push(null);
    }

    if(firstDeviceStatusAlias){
        ajaxList.push(_daoIns.getYXConst(firstDeviceStatusAlias.split(',')));
    }else{
        ajaxList.push(null);
    }

    return Promise.all(ajaxList)
    .then(responses => {
        return Promise.all(responses.map(res => {
            if(res === null || !res.ok){
                return null;
            }else{
                return res.json();
            }
        }));
    })
    .then(responses => {
        let aliasConst = responses[1];
        let nameConst = responses[0];
        let verify = (res) => {
            return res && String(res.code) === '10000' && Array.isArray(res.data);
        };

        // 测点别名优先
        if(verify(aliasConst)){
            let first = aliasConst.data[0];
            if(first && Array.isArray(first.list) && first.list.length > 0){
                return first.list.filter(d => !onlyValid || d.valid);
            }
        }

        if(verify(nameConst) && nameConst.data.length > 0){
            return nameConst.data.filter(d => !onlyValid || d.valid);
        }

        return [];
    })
    .catch(e => {
        console.error(e);
        return [];
    });
}

/**
 * 通过async函数里 await获取, 或者使用Promise方式获取
 * @param {String} constTypeName 
 * @param {String} firstDeviceStatusAlias 
 * @returns {Promise}
 */
export async function getConstList(constTypeName, firstDeviceStatusAlias, onlyValid=true){
    return _getConstList(constTypeName, firstDeviceStatusAlias, onlyValid);
}