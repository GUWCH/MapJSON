import { NavigateFunction } from 'react-router-dom';
import { _pageDao, daoIsOk } from './dao';
import { NumberUtil,ModelUtil } from '@/common/utils';
import ScadaCfg from './const-scada';
import { POINT_FIELD, POINT_TABLE, TPointFieldKey, TPointFieldValue, TPointType } from "@/common/constants";
import Intl, { msgTag } from "@/common/lang";

export type CustomMenuData = {
    name: string // 菜单名
    click: (pointAliasOrKey: string, menuInfo: CustomMenuData) => void
}

export namespace PointEvt {

    /**
     * 测点点击生成工具菜单
     * @param {String|Object} param 
     * '1:62:F01.T1.WTG01.WTUR.WindSpeed:9' | {class: '', key: '1:62:F01.T1.WTG01.WTUR.WindSpeed:9'}
     * @param {MouseEvent} e 
     * @param {CustomMenuData} customMenuData 
     */
    export const popMenu = (
        param: String | string | {class?: string, key: string}, 
        e: MouseEvent, 
        customMenuData?: CustomMenuData[],
        getWrapper?: (node: Node, dataLength: number) => void
    ) => {
        // @ts-ignore
        window.EnvPoint && EnvPoint.PointMenu.open(param, e, customMenuData, false, getWrapper);
    }

    /**
     * 测点遥调遥控下发
     * @param {String} cmd 'PopupMenu 30' | 'PopupMenu 30 5', 代表`操作字符 类型 值`
     * @param {String} param '1:61:F01.T1.WTG01.WTUR.WindSpeed:9'
     * @param beforeRequest 请求前操作
     * @param afterRequest 请求后操作
     */
    export const ykyt = (cmd: String | string, param: String | string, beforeRequest?: () => void, afterRequest?: () => void) => {
        // @ts-ignore
        window.EnvPoint && window.EnvPoint.Ykyt.open(cmd, param, beforeRequest, afterRequest);
    }
}

type TNavTo = {
    /**兼容模式, true则为svg模式, 否则模板模式 */
    compatible?: boolean;
    /**下面三个参数主要为新列表里传入 */
    listSign?: string;
    navigate?: NavigateFunction;
    appName?: AppName;
}
/**
 * 资产(场站或设备)跳转
 * 场站按兼容模式, 外部方法则会处理
 * 设备则会有模板、svg画面两种切换模式, 设备列表里切换如果是svg就使用svg模式，如果是模板则使用模板方式
 * @param assetAlias 
 * @param {TNavTo} param1
 */
export const navTo = async (assetAlias: string, {compatible, listSign, navigate, appName}: TNavTo = {}) => {
    // 新列表里单设备跳转
    if(!compatible && listSign){
        const res = await _pageDao.getDeviceTpl(assetAlias, appName);
        if(daoIsOk(res) && res.data[0] && res.data[0].page_id){
            const { page_id, list_id, table_no, type } = res.data[0];
            page_id && navigate && navigate(`/page/${listSign||list_id}/device/${assetAlias}/${page_id}`, {
                // 列表处定位tab使用
                state: {
                    tableNo: table_no,
                    type
                }
            });
        }
        // 其它地方设备跳转
        else{
            typeof commonSwitchPage === 'function' && 
            commonSwitchPage(assetAlias, false, listSign || '');
        }
    }else{
        if(typeof commonSwitchPage === 'function'){
            commonSwitchPage(assetAlias, compatible);
        }
    }
}

// 同颜色渐变实现(rgba)
export const gradient = (color, alphaDiff) => {
    if(color && color.includes('rgba')){
        let arr = color.split(/,|[)]/);

        let alpha = Number(arr[3]);

        let alphaFrom = alpha - alphaDiff >= 0 ? alpha - alphaDiff : alpha + 1 - alphaDiff;
        let alphaTo = alpha + alphaDiff >= 1 ? alpha + alphaDiff - 1 : alpha + alphaDiff;


        let colorFrom = arr.slice(0, 3).join(',') + ',' + alphaFrom.toString() + ')';
        let colorTo = arr.slice(0, 3).join(',') + ',' + alphaTo.toString() + ')';

        return {
            colorFrom: colorFrom,
            colorTo: colorTo
        };
    }

    return {};
}


// 同颜色高亮实现(rgba)
export const highLight = (color, diff) => {
    if(color && color.includes('rgba')){
        let arr = color.split(/,|[)]|[(]/);

        if(arr[4] === '0'){
            return null;
        }

        let rgba = arr.slice(1,4).map((ele) => {
            return Number(ele) + diff > 255 ? 255 : Number(ele) + diff;
        }).join(',');

        return 'rgba(' + rgba + ')';
    }
    
    return null;
}

// 根据数值范围和颜色范围获取中间值对应颜色（仅限rgb)
export const valueToColor = (minColor, maxColor, min, max, value) => {
    if(minColor && minColor.includes('rgba') && maxColor && maxColor.includes('rgba')){

        if(value <= min){
            return minColor;
        }

        if(value >= max){
            return maxColor;
        }

        let minColorArr = minColor.split(/,|[)]|[(]/).slice(1,-1);
        let maxColorArr = maxColor.split(/,|[)]|[(]/).slice(1,-1);

        let scale = (value - min)/ (max - min);

        let resColorArr = [];

        for(let i=0; i<4; i++){
            let raw = scale * (Number(maxColorArr[i] || 1) - Number(minColorArr[i] || 1)) + Number(minColorArr[i] || 1);

            let e = Number(String(raw).split('.')[0]);

            if(e > 255){
                e = e - 255;
            }

            if(e < 0){
                e = e + 255;
            }

            resColorArr.push(e);
        }

        return 'rgba(' + resColorArr.join(',') + ')';
    }
    
    return null;
}


// 测点分类层级关系（遥信YX/遥测YC/电量DD/其他OTHER）
// points: Array<{name: string, key: string, tableNo: string | number}>
// pointTypes = Array<{typeKey: string, noList: Array<string>, name: string}>
// otherType = {typeKey: string, name: string} | undefind | boolean

export const groupByTableNo = (
    points: {name: string, key: string, tableNo: number}[],
    pointTypes:{typeKey: string, noList: string[], name: string}[] = [], 
    otherType?: {typeKey: string, name: string} | boolean, 
    allParentPoint?: boolean
) => {

    let res = [];

    allParentPoint && pointTypes.map(type => {
        res.push({
            title: type.name,
            key: type.typeKey,
            value: type.typeKey,
            id: type.typeKey,
        }) 
    });

    allParentPoint && otherType && res.push({
        title: otherType.name,
        key: otherType.typeKey,
        value: otherType.typeKey,
        id: otherType.typeKey
    });

    let realParentPoint = [];

    points.map(point => {
        let tableNo = (point.tableNo || '').toString();
        let {key = '', name = ''} = point;
        let foundFlag = false;
        pointTypes.map(type => {
            
            if(type.noList.indexOf(tableNo) > -1){
                foundFlag = true;
                res.push({
                    title: name,
                    key: key,
                    value: key,
                    id: key,
                    pId: type.typeKey,
                    needLabelShow: true
                })

                if(!allParentPoint && realParentPoint.map(r => r.key).indexOf(type.typeKey) === -1){
                    realParentPoint.push({
                        title: type.name,
                        key: type.typeKey,
                        value: type.typeKey,
                        id: type.typeKey,
                    })
                }
            }
        })

        if(!foundFlag && otherType){
            res.push({
                title: name,
                key: key,
                value: key,
                id: key,
                pId: otherType.typeKey,
                needLabelShow: true
            })

            if(!allParentPoint && realParentPoint.map(r => r.key).indexOf(otherType.typeKey) === -1){
                realParentPoint.push({
                    title: otherType.name,
                    key: otherType.typeKey,
                    value: otherType.typeKey,
                    id: otherType.typeKey,
                })
            }
        }
    })

    if(!allParentPoint){
        let typeKeyList = pointTypes.map(t => t.pointType);
        otherType && otherType.typeKey && typeKeyList.push(otherType.typeKey);
        realParentPoint.sort(function(a, b){
            return typeKeyList.indexOf(a.key) - typeKeyList.indexOf(b.key);
        })
        res = res.concat(realParentPoint);
    }

    return res;
}

// 获取测点对应的类型（yx/yc包括遥测电量/other)
export const tableNoType = {
    yc: ['62', '35'],
    yx: ['61']
}

export const getPointType = (tableNo) => {
    let pointType = 'other';

    if(!tableNo) return pointType;

    Object.keys(tableNoType).map((type) => {
        tableNoType[type].indexOf(tableNo?.toString()) > -1 ? pointType = type : null;
    })

    return pointType;
}

// 获取指标配置的颜色图标转换后数值等
const defaultDecimal = 2;

export const getStyleValue = (quota = {}, data = {}):{
    color?: string
    icon?: string
    value?: string
    rawValue?: string
    unit?: string
} => {

    const {table_no = '', unit = '', color = '', icon = '', convert = {}, ycCondition = [], yxCondition = [], const_name_list = []} = quota;
    const {display_value, raw_value} = data;

    let quotaType = getPointType(table_no);

    const displayValue = display_value?.split(',').join(''); //去除千分位

    if(quotaType === 'yx'){

        let constListObj = const_name_list.find((ele) => {
            let {name = '', name_en = '', value} = ele;
            return (raw_value && String(value) === String(raw_value));
        }) || const_name_list.find((ele) => {
            let {name = '', name_en = '', value} = ele;
            return (display_value && [String(name), String(name_en)].indexOf(String(display_value)) > -1);
        });

        let valObj = yxCondition.find((ele) => {
            let {name_cn = '', name_en = '', value} = ele;
            return (raw_value && String(value) === String(raw_value));
        }) || yxCondition.find((ele) => {
            let {name_cn = '', name_en = '', value} = ele;
            return (display_value && [String(name_cn), String(name_en)].indexOf(String(display_value)) > -1);
        });

        return {
            color: valObj?.color || constListObj?.color || color,
            icon: valObj?.icon || constListObj?.icon || icon,
            value: display_value,
            rawValue: raw_value === undefined? undefined : String(raw_value)
        }

    }else if(quotaType === 'yc' || (displayValue && !isNaN(displayValue))){  //遥测或属性测点

        let value = displayValue;

        if(value && convert['coefficient']?.toString()){
            value = value * convert['coefficient'];
        }

        let valObj = {};

        let finalDecimal = defaultDecimal;

        if(convert['decimal'] || convert['decimal'] === 0){
            finalDecimal = convert['decimal'];
        }

        if(value || value === 0){
            value = NumberUtil.format(value, null, finalDecimal, false);
        }
        
        if(value || value === 0) {
            valObj = ycCondition.find((ele) => {
                let {min, max} = ele;

                let minStr = min?.toString();
                let maxStr = max?.toString();

                return (!minStr && !maxStr) 
                    || (!minStr && (maxStr - value >= 0)) 
                    || (!maxStr && (value - minStr >= 0)) 
                    || (value -minStr >= 0 && maxStr - value >= 0)
            })
        }

        if(value || value === 0){
            value = NumberUtil.format(value, null, finalDecimal, true);
        }

        return Object.assign({},
            {
                color: valObj?.color || color,
                icon: valObj?.color || icon ,
                value: value?.toString() || '',
                unit: convert['unit'] || unit
            }
        )
    }

    return {
        value: display_value || '',
        color: color,
        icon: icon ,
        unit: unit
    };
}


/**
 * 本系统根据千分位配置添加千分位符号
 * @param value 
 * @param autoRemoveComma 系统不需要千分位时返回的数据是否需要去除逗号
 * @returns 
 */
export const autoComma = (value?: number | string | null, autoRemoveComma=true) => {
    return ScadaCfg.isThousanded ? NumberUtil.addCommas(value) : (autoRemoveComma ? NumberUtil.removeCommas(value) : value);
}


/**
 * 匹配末尾是数字的字符串
 * @param {*} temp 待匹配字符串
 * @returns 匹配的第一个结果
 */
export function matchSuffixNumber(temp = '') {
    const matchs = temp.match(/\d+$/);
    if (matchs && matchs.length > 0) {
      return matchs[0];
    }
    return '';
}


/**
 * 求数组的和
 * @param {any} array 数组
 */
export function sum(array: any[] = []) {
    const newArray = array.filter(o => o !== undefined && !isNaN(o) && Infinity !== o && typeof o !== "boolean");
    if (newArray.length === 0) {
        return NaN;
    }
    return newArray.reduce((a, s) => Number(s) + Number(a))
}


/**
 * 取数组的中位数
 * @param {Array<any>} data 包含数字的数组
 */
export function getMidNumber(data = []) {
    // 首先取出数组中的所有数字
    const array = data.filter(o => o !== undefined && !isNaN(o))
        //将数组所有元素都变成数字
        .map(o => Number(o))
        // 然后进行排序
        .sort((a, b) => a - b);
    // 如果数组为奇数个，取中间的数字，否则取中间两数字的平均数
    if (array.length % 2 != 0) {
        return array[(array.length - 1) / 2];
    } else {
        return (array[array.length / 2 - 1] + array[array.length / 2]) / 2;
    }
}

/**
 * 测试数字是否超出了30%
 * @param {number|string} value 基准数字
 * @param {number|string} testValue 测试数字
 * @returns 
 */
export function over30Percent(value, testValue) {
    if (isNaN(value) || isNaN(testValue)) {
        return false;
    }
    return testValue > value * (1 + 0.3) || testValue < value * (1 - 0.3);
}

// 格式化数字，根据数字大小，自动带上k，m，g
export function formatProd(value, digit = 2, thousand = true) {
    value = NumberUtil.removeCommas(value);
    if (value >= 0) {
        if (value < 10)
            return NumberUtil.format(value, null, digit, thousand);
        if (value < 1000)
            return NumberUtil.format(value, null, digit, thousand);
        if (value < 1000000)
            return NumberUtil.format(value / 1000, null, digit, thousand) + 'k';
        if (value < 1000000000)
            return NumberUtil.format(value / 1000000, null, digit, thousand) + 'M';
        if (true)
            return NumberUtil.format(value / 1000000000, null, digit, thousand) + 'G';
    } else if (value < 0) {
        if (value > -10)
            return NumberUtil.format(value, 2, null, thousand);
        if (value > -1000)
            return NumberUtil.format(value, digit, null, thousand);
        if (value > -1000000)
            return NumberUtil.format(value / 1000, digit, null, thousand) + 'k';
        if (value > -1000000000)
            return NumberUtil.format(value / 1000000, digit, null, thousand) + 'M';
        if (true)
            return NumberUtil.format(value / 1000000000, digit, null, thousand) + 'G';
    } else {
        return '-'
    }
}

export function kFormatProd(value, digit = 2, thousand = true) {
    return formatProd(value * 1000, digit, thousand);
}

/**
 * 将资产别名（3段或4段）和点别名组合为完整别名
 * @deprecated 改用 {@link ModelUtil.combineToFullAlias}
 */
export const combineToFullAlias = (asset: string, point?: string) => ModelUtil.combineToFullAlias(asset, point ?? '')

/**
 * 拼接动态字请求key
 * @deprecated 改用 {@link ModelUtil.getDynKey}
 */
export const aliasToDynDataKey = (
    alias: string, assetType: TPointType, 
    field: { fKey?: TPointFieldKey, fValue?: TPointFieldValue } = {fValue: POINT_FIELD.VALUE}
) => {
    return ModelUtil.getDynKey({
        fullAlias: alias,
        pointType: assetType,
        field: field?.fValue,
        fieldKey: field?.fKey
    })
}

/**
 * @deprecated 改用 {@link ModelUtil.parseDynKey}
 */
export const parseDynKey = (dynKey: string): {alias:string, tableNo: string, fieldNo: string} => ModelUtil.parseDynKey(dynKey)

/**
 * 类型化i18n工具
 * @param fileName i18n文件名
 */
export const getI18nMap = <T>(fileName: string): (code: T) => string =>
    msgTag(fileName)

export const localText = msgTag('pagetpl');
export const isZh = Intl.isZh;


export const FixNumber = (val, defaultVal=0) => {
    if(typeof val === 'undefined' || val === null || val === '') return defaultVal;

    val = NumberUtil.removeCommas(val);

    if(val === '' || isNaN(val)) return defaultVal;

    return Number(val);
};

/**
 * 数字按系数和转换后位数进行转换
 * @param {Number|String} val 
 * @param {Number} factor 
 * @param {Number} decimal 
 * @returns 
 */
export const FixNumberFactor = (val, factor, decimal) => {
    if(typeof val === 'undefined' || val === null || val === '') return val;

    val = NumberUtil.removeCommas(val);

    if(factor === 1) return autoComma(val);

    return autoComma(NumberUtil.multiply(val, factor, typeof decimal === 'number' ? decimal : decimal));
};

/**
 * 数字按系数和转换后位数进行转换
 * @param {Number|String} val 
 * @param {Number} factor 
 * @param {Number} decimal 
 * @returns 
 */
export const NumberFactor = (val, factor=1, decimal) => {
    if(typeof val === 'undefined' || val === null || val === '' || isNaN(val)) return val;
    if(typeof factor !== 'number') return val;

    return NumberUtil.multiply(Number(val), factor, decimal);
};

/**
 * @typedef {Object} POINT
 * @property {String} name
 * @property {String} alias
 * @property {String} unit
 * @property {String|Number} tableNo
 * @property {String|Number} fieldNo
 * @property {String|Number} decimal
 * @property {Number?=} factor
 * @property {(String|Number)?=} fixDecimal 转换数据后修正
 */

/**
 * 
 * @param {String|Number} val 
 * @param {POINT} point @see POINT
 */
export const FixPointVal = (val, point, defaultVal=0) => {
    if(typeof val === 'undefined' || val === null || val === '') return defaultVal;

    let { factor=1, decimal=0, fixDecimal } = point;

    val = NumberUtil.removeCommas(val);

    if(factor === 1) return autoComma(val);

    return autoComma(NumberUtil.multiply(val, factor, typeof fixDecimal === 'number' ? fixDecimal : decimal));
};

type ScadaPathParamsMap = {
    /**
     * 历史告警 
     */
    'his_warn': {
        alias?: string
        st: string
        et: string
        levelIds?: string[]
        typeIds?: string[]
    },
    'demo': {
        demo?: number
    }
}
export type ScadaPathKey = keyof ScadaPathParamsMap
/**
 * 导航至scada页面
 * @param pathKey {@link ScadaPathKey}
 * @param opt.params {@link ScadaPathParamsMap}
 * @param opt.openNewTab 是否打开新页面
 */
export const redirectTo = <T extends ScadaPathKey>(pathKey: T, opt?: {
    params?: ScadaPathParamsMap[T],
    openNewTab?: boolean
}) => {
    const origin = window.location.origin
    const search = window.location.search ?? ''
    const map = search.slice(1).split('&').reduce((p, c) => {
        const [k, v] = c.split('=')
        if (k) {
            p.set(k, v)
        }
        return p
    }, new Map<string, string>())
    const newSearchParams = {} as { [key: string]: string }

    const remainParamKeys = ['windos_app_name', 'gFieldParm']
    remainParamKeys.forEach(k => {
        const v = map.get(k)
        if (v) {
            newSearchParams[k] = v
        }
    })

    if (pathKey === 'his_warn') {
        const {
            alias,
            st,
            et,
            levelIds,
            typeIds,
        } = opt?.params as ScadaPathParamsMap['his_warn']
        levelIds && (newSearchParams['levels'] = levelIds.join(','))
        typeIds && (newSearchParams['types'] = typeIds.join(','))
        st && (newSearchParams['st'] = String(st))
        et && (newSearchParams['et'] = String(et))
        alias && (newSearchParams['asset'] = alias)

        const path = '../v_warn/v_warn.html'
        const url = `${path}?${Object.entries(newSearchParams).map(([k, v]) => `${k}=${v}`).join('&')}`
        window.location.replace(url)
        return
    }
}