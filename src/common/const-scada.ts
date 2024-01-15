import _ from 'lodash';
import { DATE_MOMENT_FORMAT, DATE_TYPE, SITE_TYPE, scadaVar } from './constants';

/**
 * 是否需要千分位
 */
const isThousand = () => {
    let scadaComma;
    try{
        scadaComma = (window as Window).g_num_add_comma || 
            (window as Window).parent.g_num_add_comma ||
            ((window as Window).top || {}).g_num_add_comma;
    }catch(e){
        console.error(e);
    }
    let isFn = scadaComma && typeof scadaComma.need_comma === 'function';
    if(isFn){
        return scadaComma.need_comma();
    }else{
        return true;
    }
};

let isThousanded = isThousand();

export const isProductEnv = scadaVar('g_head_cfg.template_env.is_product') === '1';
/**光伏采用模板 */
export const useSolarTemplate = scadaVar('g_head_cfg.device_toggle.solar') === '2';
/**光伏采用过渡 */
export const useSolarMiddle = scadaVar('g_head_cfg.device_toggle.solar') === '3';
export const useSolarSiteListPageId = scadaVar('g_head_cfg.device_toggle.solar_new_site_list');
const scadaCfg = {
    token: {
        path: '../project/images/token_images/new/',
        ext: '.png'
    },
    isThousand: isThousand,
    isThousanded: isThousanded,
    getCurNodeAlias: () => {
        return process.env.NODE_ENV !== 'development' ? scadaVar('g_field_parm') || '' : 'USCADA.Farm.Statistics';
    },
    getCurNodeName: function(cb) {
        let nodeAlias = scadaVar('g_field_parm') || '';
        if(!nodeAlias)return '';

        return this.getTree().then((tree: any) => {
            let node = tree.getNodeByParam('alias', nodeAlias) || tree.getNodeByParam('name', nodeAlias);
            if(typeof cb === 'function'){
                cb(node);
            }

            return node;
        });
    },
    getTree: () => {
        return new Promise((resovle) => {
            let count = process.env.NODE_ENV === 'development' ? 1 : 100;

            let get = () => {
                count = count - 1;
                let tree = scadaVar('tree_object');
                if(tree || count < 0){
                    resovle(tree);
                }else{                
                    setTimeout(() => {
                        get();
                    }, 100);
                }
            };

            get();
        });
    },
    getNodeByParam: function(key, value) {
        return this.getTree().then((treeObj: any) => {
            if(treeObj){
                return treeObj.getNodeByParam(key, value);
            }
            return null;
        })
    },
    getNodesByParam: function(key, value) {
        return this.getTree().then((treeObj: any) => {
            if(treeObj){
                let arrs = treeObj.transformToArray(treeObj.getNodes());
                return arrs.filter(f => f[key] === value);
            }
            return [];
        });
    },
    getAllFac: function(nodeAlias, type) {
        return this.getTree().then((treeObj: any) => {
            if(treeObj){
                let arrs = treeObj.transformToArray(treeObj.getNodes());

                if(nodeAlias){
                    let node = treeObj.getNodeByParam('alias', nodeAlias);
                    if(node){
                        arrs = treeObj.transformToArray(node);
                    }
                }

                switch(type){
                    case 'wind':
                        return arrs.filter(f => String(f.fac_type) === String(SITE_TYPE.WIND));
                    case 'solar':
                        return arrs.filter(f => String(f.fac_type) === String(SITE_TYPE.SOLAR));
                }
                return arrs;
            }
            return [];
        });
    },
    getUser: () => {
        return (window.EnvUtils && typeof window.EnvUtils.getLocal === 'function' ? 
            window.EnvUtils.getLocal("username") || '' : '');
    },
    resizeScale: () => {
        if (typeof window.resize_menu == "function"){
            window.resize_menu();
        }
    },
    getDateTimeFmt: () => {
        return scadaVar('g_field_date.time_format') || '';
    },
    getDateFmt: () => {
        return scadaVar('g_field_date.yyyy_MM_dd_format') || '';
    },
    getYearMonthFmt: () => {
        return scadaVar('g_field_date.yyyy_MM') || '';
    },

    getDataRefreshTime: () => {
        return scadaVar('g_web_cfg.my_dyn_refresh_time') || null;
    },

    getDataListRefreshTime: () => {
        return scadaVar('g_web_cfg.datalist_refresh_time') || null;
    },

    isSortNoForDataList: () => {
        return scadaVar('g_web_cfg.tree_sort') == '2';
    },

    isVerticalNameForDataList: () => {
        return !!scadaVar('g_web_cfg.verticalSiteName');
    },

    getVid: () => {
        return scadaVar('g_web_cfg.vid') || null;
    },
    
    
    fullScreen: () => {
        if(typeof SYS_BASE !== 'undefined'){
            SYS_BASE.set('isFullScreen', true);
		    SYS_BASE.maxScreenTrigger(true);
        }        
    },

    /**
     * 告警数据排序和去重, 新告警里可能含有旧告警的确认记录
     * @param {Object[]} oldAlarmData 
     * @param {Object[]} newAlarmData 
     * @param {Number} maxCount 
     */
    handleAlarm: (oldAlarmData: IAlarm[]=[], newAlarmData: IAlarm[]=[], maxCount: number) => {
        const padCount = 20;
        const getKey = (d) => {
            const {time, content, atype_name, no, id} = d;
            return `${time}${content}${atype_name}${no}${id}`.replace(/\s/gi, '');
        };
        const keys = oldAlarmData.map(d => getKey(d));
        let restAlarmData = newAlarmData.filter(d => !keys.includes(getKey(d)));
        restAlarmData.sort((a, b) => {
            var _a = String(a.id).padStart(padCount, '0') + "." + String(a.no).padStart(padCount, '0');
            var _b = String(b.id).padStart(padCount, '0') + "." + String(b.no).padStart(padCount, '0');
            if(_a > _b){
                return -1;
            }else if(_a < _b){
                return 1;
            }else{
                return 0;
            }
        });

        return restAlarmData.concat(oldAlarmData).slice(0, maxCount);
    },

    downLoad: function(fileName, param){
        let filePath = 'save_web/' + fileName;
        if(typeof WS !== 'undefined' && typeof WS.resource === 'function'){
            WS.resource(filePath, true);
        }        
    }
};

/**
 * timeout of timer, the unit is millisecond
 */
// timeout for dynamic data, it is configurable
export const TimerInterval = scadaCfg.getDataRefreshTime() || 6000;
export const DataListInterval = scadaCfg.getDataListRefreshTime() || 6000;
// timeout for normal data
export const CommonTimerInterval = 6000;
// timeout for harf minute
export const HalfMinuteInterval = 30000;
// timeout for normal history data(1 minute)
export const CommonHisTimerInterval = 60000;
// timeout for power history data(5 minutes)
export const PowerHisTimerInterval = 300000;
// timeout for light card(5 seconds)
export const LightCardTimerInterval = 5000;
// timeout for real-time curve data(5 seconds)
export const RealTimeCurveTimerInterval = 5000;
// timeout for list real-time curve data(10 seconds)
export const ListRealTimeCurveTimerInterval = 10000;


/**
 * scada date format define
 */
export const DATE_FORMAT = {
    DATE_TIME: scadaCfg.getDateTimeFmt() || 'yyyy-MM-dd HH:mm:ss',
    DATE: scadaCfg.getDateFmt() || 'yyyy-MM-dd',
    YEAR_MONTH: scadaCfg.getYearMonthFmt() || 'yyyy-MM',
    MONTH_DAY: scadaCfg.getDateFmt().replace(/yyyy(-|\/)/,'').replace(/(-|\/)yyyy/,'') || 'MM-dd'
};

/**
 * convert scada custom date format to moment format
 * used to show custom format date
 */
export const DATE_CUSTOM_FORMAT = {
    DATE_TIME: DATE_FORMAT.DATE_TIME.replace(/yyyy/gi, 'YYYY').replace(/dd/gi, 'DD').replace(/ss/gi, 'ss') || DATE_MOMENT_FORMAT.DATE_TIME,
    DATE: DATE_FORMAT.DATE.replace(/yyyy/gi, 'YYYY').replace(/dd/gi, 'DD') || DATE_MOMENT_FORMAT.DATE,
    YEAR_MONTH: DATE_FORMAT.YEAR_MONTH.replace(/yyyy/gi, 'YYYY') || DATE_MOMENT_FORMAT.YEAR_MONTH,
    YEAR_WEEK: (DATE_FORMAT.YEAR_MONTH.replace(/yyyy/gi, 'YYYY') || DATE_MOMENT_FORMAT.YEAR_MONTH).replace('MM', 'Wo')
};

/**
 * 
 * @param {String} dateType @see DATE_TYPE
 * @returns {String}
 */
export const getMomentDateFormat = (dateType) => {

    switch(dateType){
        case DATE_TYPE.DAY:
            return DATE_CUSTOM_FORMAT.DATE;
        case DATE_TYPE.WEEK:
            return DATE_CUSTOM_FORMAT.YEAR_WEEK;
        case DATE_TYPE.MONTH:
            return DATE_CUSTOM_FORMAT.YEAR_MONTH;
        case DATE_TYPE.YEAR:
            return DATE_MOMENT_FORMAT.YEAR;
    }

    return '';
};

export default scadaCfg;
