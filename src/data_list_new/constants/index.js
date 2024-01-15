import Intl, { msgTag } from '@/common/lang';
import { getPageMemoryReq } from '@/common/util-memory';
import { NumberUtil, BAY_TYPE, DEVICE_TYPE } from '@/common/utils';

export const msg = msgTag('datalistnew');
export const isZh = Intl.isZh;

export const SLOT = '--';

export const defaultColNum = 5;

export const farmSuffixAlias = '.Farm.Statistics';

export const reqDecimal = 3;
export const defaultDecimal = 0;

// 组串逆变器和直流汇流箱只能从other device里获取
export const isOtherDeviceType = (type) => {
    return [DEVICE_TYPE.INVERTER, DEVICE_TYPE.DC_COMBINER].indexOf(type) > -1;
}

export const MEMO_REQ = getPageMemoryReq();

export const MEMO = {
    FARM: 'FARM',
    DEVICE: 'DEVICE'
};

export const GRADE = {
    FARM: 'FARM',
    DEVICE: 'DEVICE'
};

export const MODE = {
    CONFIG: '_CONFIG',
    LARGE_ICON: '_LARGE_ICON',
    SMALL_ICON: '_SMALL_ICON',
    LIST: 'LIST'
};

export const CARD_ATTR = {
    width: 405,
    height: 200,
    header: 40,
    middle: 120,
    bottom: 40
};

export const CARD_ATTR_SMALL = {
    width: 200,
    height: 40
};

export const RES_KEY = {
    name_cn: 'name_cn',
    name_en: 'name_en',
    table_no: 'table_no',
    field_no: 'field_no',
    is_local: 'is_local',
    alias: 'alias',
    unit: 'unit',
    const_name_list: 'const_name_list',
    value: 'value',
    name: 'name',
    fn_filter: 'fn_filter',
    fn_label: 'fn_label',
    fn_info: 'fn_info',
    fn_overview: 'fn_overview',
    fn_quota: 'fn_quota',
    fn_statistics: 'fn_statistics',
    fn_grid: 'fn_grid',
    fn_statusstats: 'fn_statusstatics',
    fn_filter_source: 'fn_filter_datasource',
    fn_overview_assoc: 'fn_overview_assoc'
}

export const keyStringMap = {
    LIST: "list",
    STATISTICS: "statistics",
    CARD: "card",
    FILTER: "filter",
    GRID: "grid",
    TITLE_LEFT: 'titleLeft',
    TITLE_RIGHT: 'titleRight',
    OVERVIEW: 'overview', 
    QUOTA: 'quota', 
    FLICKER: 'flicker', 
    DIVIDE: 'divide',
    ASSOCIATED: 'associated',
    VALUE_LIST_STYLE: 'valueListStyle',
    UNIVERSAL: 'universal',
    QUOTAS: 'quotas',
    DATA_SOURCE: 'dataSource',
    LARGE_ICON: 'largeIcon',
    CHART: 'chart',
    COEFFI:'coefficient',
    UNIT:'unit',
    DECIMAL:'decimal',
    NAME: {
        nameEn: "nameEn",
        nameCn: "nameCn"
    }
};

export const getCurQuotas = (res = [], nodeType, isFarm) => {
    let isLocalArr = [];

    if(nodeType === 'FACTORY'){
        isLocalArr.push('factory');

        isFarm ? null : isLocalArr.push('local')
    }else{
        isLocalArr.push('field');
        isFarm ? isLocalArr.push('factory') : isLocalArr.push('local')
    }

    return res.filter(point => {return isLocalArr.indexOf(point[RES_KEY.is_local]) > -1});
}

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

export const getQuotaKeys = (arr, fn, type) => {
    return arr.filter(point => point[fn])
        .filter(point => type ? getPointType(point.tableNo) === type : true)
        .map((point) => {
            let {is_local, tableNo = '', alias = '', fieldNo = ''} = point; 
            return is_local + ":" + tableNo + ':' + alias + ':' + fieldNo;
        })
}

export const getLocOptions = (res = []) => {

    const {
        FILTER,
        UNIVERSAL,
        QUOTAS, 
        DATA_SOURCE,
        CARD, 
        TITLE_LEFT, 
        TITLE_RIGHT,
        ASSOCIATED, 
        QUOTA, 
        FLICKER, 
        DIVIDE, 
        GRID, 
        STATISTICS,
        OVERVIEW,
        LARGE_ICON,
        CHART
    } = keyStringMap;

    return {
        [FILTER]: {
            [UNIVERSAL]:{
                [QUOTAS]: getQuotaKeys(res, 'fn_filter'),
                [DATA_SOURCE]: getQuotaKeys(res, 'fn_filter_source'),
            }
        },
        [CARD]: {
            [TITLE_LEFT]: {
                [QUOTAS]: getQuotaKeys(res, 'fn_label'),
            },
            [TITLE_RIGHT]: {
                [QUOTAS]: getQuotaKeys(res, 'fn_info'),
            },
            [OVERVIEW]: {
                [LARGE_ICON]: getQuotaKeys(res, 'fn_overview', 'yx'),
                [CHART]: getQuotaKeys(res, 'fn_overview', 'yc'),
                [ASSOCIATED]: getQuotaKeys(res, 'fn_overview_assoc'),
            },
            [QUOTA]: {
                [QUOTAS]: getQuotaKeys(res, 'fn_quota'),
            },
            [STATISTICS]: {
                [QUOTAS]: getQuotaKeys(res, 'fn_statusstats'),
            },
            [FLICKER]: {},
            [DIVIDE]: {}
        },
        [GRID]: {
            [UNIVERSAL]:{
                [QUOTAS]: getQuotaKeys(res, 'fn_grid'),
            }
        },
        [STATISTICS]: {
            [UNIVERSAL]:{
                [QUOTAS]: getQuotaKeys(res, 'fn_statistics'),
            }
        }
    }
}


export const getConditionStyle = (props = {}) => {
    let {
        quota = {},
        data = {},
        part = '',
        location = ''
    } = props;

    let quotaType = getPointType(quota.tableNo);

    let locStyle = (quota[part] || {})[location] || {};

    if(quotaType === 'yx'){
        let {yxCondition = []} = locStyle;

        let valObj = yxCondition.find((ele) => {
            return ele.value?.toString() === data.raw_value?.toString() 
                || ele.name?.toString() === data.display_value?.toString();
        })

        let {color, icon} = valObj || {};

        return {
            color: color,
            icon: icon,
            value: data.display_value,
        }

    }else if(quotaType = 'yc'){
        let {COEFFI, UNIT, DECIMAL} = keyStringMap;
        let {ycCondition = [], convert = {}, icon} = locStyle;

        let value = data.display_value?.split(',').join('');

        if(value && convert[COEFFI]?.toString()){
            value = value * convert[COEFFI];
        }

        let valObj = {};
        
        if(value) {
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

        if(value){
            value = NumberUtil.format(value, null, convert[DECIMAL] || String(defaultDecimal));
        }

        let {color} = valObj || {};

        return Object.assign({},
            {
                color: color || null,
                icon: icon || null,
                value: value?.toString() || ''
            },
            convert[UNIT] ?  {unit: convert[UNIT]} : {} 
        )
    }

    return {};
}

