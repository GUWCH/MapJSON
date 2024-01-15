import Intl, { msgTag } from '@/common/lang';
import { getPageMemoryReq } from '@/common/util-memory';
import { NumberUtil } from '@/common/utils';

export const msgPrev = msgTag('datalist');
export const msg = msgTag('datalistnew');
export const isZh = Intl.isZh;

export const defaultColNum = 5;

export const reqDecimal = 3;
export const defaultDecimal = 2;

export const isReal = true;

export const CHART_TYPE_MAP = {
    line: {
        type: 'line'
    },
    bar: {
        type: 'bar'
    },
    area: {
        type: 'line',
        symbol: 'none'
    },
    bullet: {
        type: 'scatter',
        symbol: 'roundRect',
        symbolSize:[11, 3]
    }
}

export const DEFAULT_COLOR = ['rgba(0,219,255,1)', 'rgba(88,245,192,1)', 'rgba(142,133,255,1)', 'rgba(255,181,0,1)', 'rgba(245,10,34,1)']

export const MEMO_REQ = getPageMemoryReq();

export const ASSET_LEVEL = {
    farm: 'farm',
    device: 'device'
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
    hasIconWidth: 350,
    smallWidth: 275,
    height: 200,
    header: 40,
    middleHeight: 120,
    bottomHeight: 40,
    bottomItemWidth: 30,
    quotaMaxWidth: 100
};

export const CARD_ATTR_SMALL = {
    width: 200,
    height: 40
};

export const RES_KEY = {
    nameCn: 'name_cn',
    nameEn: 'name_en',
    tableNo: 'table_no',
    fieldNo: 'field_no',
    alias: 'alias',
    unit: 'unit',
    valueList: 'const_name_list',
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
    fn_filter_source: 'fn_filter_source',
    fn_overview_assoc: 'fn_overview_assoc'
}

export const modelKeyConvert = (models) => {
    return models.map(model => {
        let newModel = {};
        Object.keys(RES_KEY).map(key => {
            if(model[RES_KEY[key]] !== undefined){
                newModel[key] = model[RES_KEY[key]];
            }
        })
        return newModel
    })
}

export const keyStringMap = {
    LIST: "list",
    STATISTICS: "statistics",
    CARD: "card",
    FILTER: "filter",
    OTHER: "other",
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

export const tableNoType = {
    yc: ['62', '35'],
    yx: ['61']
}

export const getPointType = (tableNo) => {
    let pointType = 'other';

    if(!tableNo) return pointType;

    Object.keys(tableNoType).map((type) => {
        tableNoType[type].indexOf(String(tableNo)) > -1 ? pointType = type : null;
    })

    return pointType;
}

type TExtendPoint = TPoint & {
    [k in keyof typeof RES_KEY]?: boolean | string | YXConst[]
};

type TRES_KEY = keyof typeof RES_KEY;

export const getQuotaKeys = (arr: TExtendPoint[], fn: TRES_KEY, type?: keyof typeof tableNoType) => {
    return arr.filter(point => point[fn])
        .filter(point => type ? getPointType(point.tableNo) === type : true)
        .map((point) => {
            let {tableNo = '', alias = '', fieldNo = ''} = point; 
            return tableNo + ':' + alias + ':' + fieldNo;
        })
}

type TPickKeyStringMap<T> = typeof keyStringMap[keyof Pick<typeof keyStringMap, T extends keyof typeof keyStringMap ? T : never>];
type TLocOptions = {
    [k: string]: any;
}

export const getLocOptions = (res: TExtendPoint[] = []): TLocOptions => {

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
type TConditionStyle = {
    quota: any;
    data: any;
    part: TPickKeyStringMap<'GRID'>;
    location: TPickKeyStringMap<'UNIVERSAL'>;
}
export const getConditionStyle = (props: TConditionStyle) => {
    let {
        quota = {},
        data = {},
        part = '',
        location = ''
    } = props || {};

    let quotaType = getPointType(quota.tableNo);

    let locStyle = (quota[part] || {})[location] || {};

    let display_value = data.display_value?.split(',').join('');

    if(quotaType === 'yx'){
        let {yxCondition = []} = locStyle;

        let valObj = yxCondition.find((ele) => {
            let {name_cn = '', name_en = '', value} = ele;
            return (data.raw_value && value?.toString() === String(data.raw_value)) 
                || (data.display_value && [String(name_cn), String(name_en)].indexOf(String(data.display_value)) > -1);
        })

        let {color, icon} = valObj || {};

        return {
            color: color,
            icon: icon,
            value: data.display_value,
        }

    }else if(quotaType === 'yc' || (display_value && !isNaN(display_value))){
        let {COEFFI, UNIT, DECIMAL} = keyStringMap;
        let {ycCondition = [], convert = {}, icon} = locStyle;

        let value = data.display_value?.split(',').join('');

        if(value && convert[COEFFI]?.toString()){
            value = value * convert[COEFFI];
        }

        let valObj = {};

        let finalDecimal = defaultDecimal;

        if(convert[DECIMAL] || convert[DECIMAL] === 0){
            finalDecimal = convert[DECIMAL];
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

    return {value: display_value || ''};
}

export const defaultIconArr = [MODE.LARGE_ICON, MODE.SMALL_ICON, MODE.LIST];

export const TOKEN_SIZE = {
    default: 50,
    min: 10,
    max: 65
};

export const getListTabFlag = (tableNo, type) => {
    return String(tableNo) === '430' ? String(type) : String(tableNo) + "_" + String(type);
}

export const isCorrectListTabFlag = (curTableNo, curType, typeStr) => {
    return String(curTableNo) === '430' ? String(curType) === String(typeStr) : (curTableNo + "_" + curType) === String(typeStr);
}