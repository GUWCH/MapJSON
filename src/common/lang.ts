import { Global } from './constants';

function initLocale() {
    let lang = Global.language;
	if(lang.toLowerCase().indexOf('zh') > -1){
		lang = 'cn';
	}
	if(lang.toLowerCase().indexOf('en') > -1){
		lang = 'en';
	}
	return lang;
}

function loadResources() {
    const req = require.context('./i18n', true, /\.js$/);
    const resources = {};

    req.keys().forEach((file) => {
        const fileName = file.replace('./', '').replace('.js', '');
        if(fileName.indexOf('_') > -1){
            const tag_local = fileName.split('_');
            resources[tag_local[0]] = resources[tag_local[0]] || {};
            resources[tag_local[0]][tag_local[1]] = req(file).default;
        }else{
            resources[fileName] = req(file).default;
        }        
    });

    return resources;
}

function getString(rMap, key) {
    const keyArr = key.split('.');

    for (let idx = 0, len = keyArr.length; idx < len; ++idx) {
        if (idx === len - 1) {
            if (rMap) {
                return rMap[keyArr[idx]];
            } else {
                return undefined;
            }
        } else {
            if (rMap) {
                // eslint-disable-next-line no-param-reassign
                rMap = rMap[keyArr[idx]];
            } else {
                return undefined;
            }
        }
    }

    return undefined;
}

function getFormatString(rMap, key, valueArr) {
    let strTemplate = getString(rMap, key);

    if (!strTemplate) {
        return undefined;
    }

    valueArr.forEach((item, idx) => {
        // eslint-disable-next-line no-param-reassign, prefer-template
        strTemplate = strTemplate.replace(new RegExp('\\{' + idx + '\\}', 'g'), item);
    });

    return strTemplate;
}

const selectedLocale = initLocale();
const localeResourceMap = loadResources();

export function msgTag(tag) {
    return function(key, ...valueArr){
        const rMap = (localeResourceMap[tag] || {})[selectedLocale] || {};
        const value = getFormatString(rMap, key, valueArr);
        return !value ? key : value;
    };    
}

export default function msg(key, ...valueArr) {
    const value = getFormatString(localeResourceMap[selectedLocale], key, valueArr);
    return !value ? key : value;
}

export const isZh = (selectedLocale || '').toLowerCase().indexOf('cn') > -1;

msg.locale = selectedLocale;

msg.isZh = (msg.locale || '').toLowerCase().indexOf('cn') > -1;

