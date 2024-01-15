export const getAssetAlias = (assetalias?: string, customAlias?: string): string => {
    let tmp = customAlias ?? '';
    let asset = assetalias ?? '';
    let assetArr = asset.split('.');
    let site = assetArr[0] ?? '';
    let volt = assetArr[1] ? assetArr.slice(0, 2).join('.') : '';
    let voltNo = /.*[^\d]+(\d+)$/.test(volt) ? volt.replace(/.*[^\d]+(\d+)$/, '$1') : '';
    let bay = assetArr[2] ? assetArr.slice(0, 3).join('.') : '';
    let bayNo = /.*[^\d]+(\d+)$/.test(bay) ? bay.replace(/.*[^\d]+(\d+)$/, '$1') : '';

    return tmp ? tmp
        .replace(/\{FARM\}/gi, site)
        .replace(/\{VOLT\}/gi, volt)
        .replace(/\{VOLT_NO\}/gi, voltNo)
        .replace(/\{BAY\}/gi, bay)
        .replace(/\{BAY_NO\}/gi, bayNo) : asset;
}