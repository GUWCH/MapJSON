import { 
    observable, 
    action, 
    computed, 
    makeObservable, 
    reaction, 
    runInAction, 
    autorun
} from 'mobx';
import _ from 'lodash';
import { daoIsOk, _dao } from '@/common/dao';
import Memory from '@/common/util-memory';
import { MODE, MEMO_REQ, CARD_ATTR, RES_KEY, keyStringMap, isZh } from '../constants';

export interface ICategory{
    mode: string;
    /**
     * @unused
     */
    columnResize: Object;
    sortColumn: string;
    sortDir: string;

    searchText: string;
    filters: Array<any>;
    isFetched: boolean;
    categoryCfg: Array<any>;
    fnCfg: Object;
    models: Array<any>;
};

export interface IDataState{

    // related to category including its properties
    categories: {[key: string | number]: ICategory};
    setCategory(category: String): void;
    get(prop: string): ICategory | undefined;
    set(prop: string, value: any): void;
    setMode(mode: string): void;
    getMode(): string;
    getModels(): Array<any>,
    getCategoryCfg(): Array<any>,
    // getPageBottomCfg(): Array<any>,
    setSearchText(text: string): void;
    getSearchText(): string | undefined;
    getSearchFilter(key: string): Array<any>;

    // related to data
    dyndata: object;
    setDyndata(data: object): void;
    getDyndata(): object;
    historyData: object;
    setHisData(data: object): void;
    getHisData(): object;

    // related to configure
    isConfiguring: boolean;
    setIsConfiguring(isConfiguring?:boolean | Boolean): void;

    // related to stats configure
    isStatsConfiguring: boolean;
    setIsStatsConfiguring(isStatsConfiguring?:boolean | Boolean): void;

    // related to list configure
    configMemory: Memory;
    getCfgDesc(): void;
    saveConfig(cfg: any): Promise<void>;
    fetchConfigAndModel(): Promise<void>;
    // used by configure widget 
    getConfigData(): Array<any>;

    // related to page bottom configure
    pageBottomAndTabCfg: object;
    setPageBottomAndTabCfg(cfg:Array<any>): void;
    pageBottomModels: Array<any>;
    pageBottomAndTabMemory: Memory;
    getPageBottomAndTabDesc(): void;
    saveTab(cfg: any): Promise<void>;
    savePageBottom(cfg: any): Promise<void>;
    fetchPageBottomTabConfigAndModel(): Promise<void>;
    // used by configure widget 
    getPageBottomConfigData(): Array<any>;

    // related to user op, need to save it
    userMemory: Memory;
    userContent: {[k: string]: {
        topData: Array<any>,
        iconSize: Number
    }};
    getUserOpDesc(): String | string;
    getUserOp(): void;
    saveUserOp(): void;
    setUserIconSize(iconSize: number): void;
    getUserIconSize(): Number | number | null | undefined;
    getUserTopData(): Array<any>;
    setUserTopData(str: string): void;

    // related to page bottom
    getColNum(): String | string;
    getPageBottom(): Array<any>;
    getCollapsed(): boolean;
    setCollapsed(): void;

    // related to card, table and filter
    getGroup(): String | string | null | undefined;
    isGroupByFac(): Boolean | boolean;
    isGroupByFeeder(): Boolean | boolean;
    setFilter(status: any): void;
    initFilter(data: any): void;
    getFilter(flag: any): Array<any>;
    getReqFilter(): Array<any>;
    getStatusFilter(): Array<any>;
    getListColumns(): Array<any>;    
    getLargeCardHeight(): number;
    getCardAllQuotas(): Array<any>;
    getCardNameLeft(): Array<any>;
    getCardNameRight(): Array<any>;
    getCardIcon(): Array<any>;
    getCardCharts(): Array<any>;
    getCardQuotas(): Array<any>;
    getCardBottom(): Array<any>;
};

/**
 * about computed @see {@link https://github.com/mobxjs/mobx/issues/161}
 */
class DataState implements IDataState{
    rootStore: any;
    constructor(rootStore) {
        if(rootStore)this.rootStore  = rootStore;
        makeObservable(this);

        autorun(() => {
            console.log(this.dyndata);
        })
    }

    // 配置状态
    @observable isConfiguring = false;
    @action setIsConfiguring = (isConfiguring) => {console.log(window.event?.currentTarget);
        this.isConfiguring = typeof isConfiguring === 'boolean' ? isConfiguring : !this.isConfiguring;
    }

    // 统计配置状态
    @observable isStatsConfiguring = false;
    @action setIsStatsConfiguring = (isStatsConfiguring) => {console.log(window.event?.currentTarget);
        this.isStatsConfiguring = typeof isStatsConfiguring === 'boolean' ? isStatsConfiguring : !this.isStatsConfiguring;
    }

    configMemory;
    getCfgDesc = () => {
        const { nodeType, siteType, deviceType } = this.rootStore.pageState || {};
        return `${nodeType}_${siteType}_${deviceType}`;
    }
    // 配置保存
    @action saveConfig = async (cfg) => {
        this.set('categoryCfg', cfg);

        this.configMemory && this.configMemory.save(cfg);
    }

    // 配置获取
    @action fetchConfigAndModel = async () => {
        const description = this.getCfgDesc();
        const params = Object.assign({}, MEMO_REQ, {description});

        this.configMemory = new Memory(params);  

        const res = await this.configMemory.init();
        const res2 = await _dao.getDeviceType();

        let resContent = [], res2Content = [];
        if(res.isOk){
            try{
                resContent = JSON.parse(res.content);
            }catch(e){console.error(e)}
        }
        if(daoIsOk(res2)){
            res2Content = res2.data || [];
        }

        runInAction(() => {
            this.set('categoryCfg', resContent);
            this.set('models', res2Content.map((ele) => {
                return {
                    nameCn: ele[RES_KEY.name_cn],
                    nameEn: ele[RES_KEY.name_en],
                    alias: ele[RES_KEY.alias],  
                    unit: ele[RES_KEY.unit],
                    tableNo: ele[RES_KEY.table_no],
                    fieldNo: ele[RES_KEY.field_no],
                    valueList: ele[RES_KEY.const_name_list],
                    is_local: ele[RES_KEY.is_local],
                    fn_filter: ele[RES_KEY.fn_filter],
                    fn_label: ele[RES_KEY.fn_label],
                    fn_info: ele[RES_KEY.fn_info],
                    fn_overview: ele[RES_KEY.fn_overview],
                    fn_quota: ele[RES_KEY.fn_quota],
                    fn_statistics: ele[RES_KEY.fn_statistics],
                    fn_grid: ele[RES_KEY.fn_grid],
                    fn_statusstats: ele[RES_KEY.fn_statusstats],
                    fn_filter_source: ele[RES_KEY.fn_filter_source],
                    fn_overview_assoc: ele[RES_KEY.fn_overview_assoc]
                }
            }));
        }); 
    }

    getConfigData = () => {
        return [];
    }

    @observable pageBottomAndTabCfg = {};
    @action setPageBottomAndTabCfg = (cfg) => {

        this.pageBottomAndTabCfg = Object.assign(this.pageBottomAndTabCfg, cfg);
    };
    pageBottomModels = [];
    pageBottomAndTabMemory;
    getPageBottomAndTabDesc = () => {
        const { nodeType, siteType, deviceType, grade } = this.rootStore.pageState || {};
        return `${nodeType}_${siteType}_${grade}`;
    };

    saveTab = async (data) => {
        this.setPageBottomAndTabCfg({'deviceOrderCfg': data});

        this.pageBottomAndTabMemory && this.pageBottomAndTabMemory.save(
            Object.assign(
                this.pageBottomAndTabCfg, 
                {'deviceOrderCfg': data}
            )
        );
    };


    savePageBottom = async (cfg) => {
        this.setPageBottomAndTabCfg(cfg);

        this.pageBottomAndTabMemory && this.pageBottomAndTabMemory.save(Object.assign(this.pageBottomAndTabCfg, cfg));
    };
    fetchPageBottomTabConfigAndModel = async () => {
        const description = this.getPageBottomAndTabDesc();
        const params = Object.assign({}, MEMO_REQ, {description});

        if(!this.pageBottomAndTabMemory){
            this.pageBottomAndTabMemory = new Memory(params);
        }        
        const res = await this.pageBottomAndTabMemory.init();
        const res2 = await _dao.getDeviceType();

        let resContent = [], res2Content = [];
        if(res.isOk){
            try{
                resContent = JSON.parse(res.content);
            }catch(e){console.error(e)}
        }
        if(daoIsOk(res2)){
            res2Content = res2.data || [];
        }

        runInAction(() => {
            this.setPageBottomAndTabCfg(resContent);
            this.set('models', res2Content.map((ele) => {
                return {
                    nameCn: ele[RES_KEY.name_cn],
                    nameEn: ele[RES_KEY.name_en],
                    alias: ele[RES_KEY.alias],  
                    unit: ele[RES_KEY.unit],
                    tableNo: ele[RES_KEY.table_no],
                    fieldNo: ele[RES_KEY.field_no],
                    valueList: ele[RES_KEY.const_name_list],
                    is_local: ele[RES_KEY.is_local],
                    fn_filter: ele[RES_KEY.fn_filter],
                    fn_label: ele[RES_KEY.fn_label],
                    fn_info: ele[RES_KEY.fn_info],
                    fn_overview: ele[RES_KEY.fn_overview],
                    fn_quota: ele[RES_KEY.fn_quota],
                    fn_statistics: ele[RES_KEY.fn_statistics],
                    fn_grid: ele[RES_KEY.fn_grid],
                    fn_statusstats: ele[RES_KEY.fn_statusstats],
                    fn_filter_source: ele[RES_KEY.fn_filter_source],
                    fn_overview_assoc: ele[RES_KEY.fn_overview_assoc]
                }
            }));
        }); 
    }
    // used by configure widget 
    getPageBottomConfigData = () => {
        return [];
    };

    @observable dyndata = {};
    getDyndata = () => {
        return this.dyndata;
    }
    @action setDyndata = (data) => {
        Object.keys(data).map(key => {
            if(!_.isEqual(data[key], this.dyndata[key])){
                this.dyndata[key] = data[key];
            }
        })
    }

    @observable historyData = {};
    getHisData = () => {
        return this.historyData;
    }
    @action setHisData = (data) => {
        // 消耗比较大
        // Object.keys(data).map(key => {
        //     if(!_.isEqual(data[key], this.historyData[key])){
        //         this.historyData[key] = data[key];
        //     }
        // })

        this.historyData = Object.assign({}, this.historyData, data);
    }

    // 各种类型交互记忆
    @observable categories:{[key: string | number]: ICategory} = {};
    @action setCategory = (category) => {
        if(!category) return;
        if(!this.categories[category]){
            this.categories[category] = observable({
                mode: MODE.LARGE_ICON,
                columnResize: {},
                
                searchText: '',
                sortColumn: '',
                sortDir: '',
                filters: [],

                // 配置
                isFetched: false,
                categoryCfg: [],
                fnCfg: {},
                models: []
            });
        }

        const typeCache = this.categories[category];
        if(typeCache.isFetched)return;
        typeCache.isFetched = true;
        this.fetchConfigAndModel();
        this.fetchPageBottomTabConfigAndModel();
    }


    get(prop){
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return;
        this.setCategory(deviceType);
        const typeMemo = this.categories[deviceType];
        return typeMemo[prop];
    }

    // 有些属性可以共用
    set(prop, value){
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return;
        this.setCategory(deviceType);
        const typeMemo = this.categories[deviceType];
        typeMemo[prop] = value;
    }

    getModels = () => {
        return this.get('models');
    }

    getCategoryCfg = () => {
        return this.get('categoryCfg');
    }

    @action setMode = (mode) => {
        this.set('mode', mode);
    }

    getMode = () => {
        return this.get('mode');
    }

    @action setSearchText = (searchText) => {
        this.set('searchText', searchText);
    }

    getSearchText = () => {
        return this.get('searchText');
    }

    iconSizeTimer;

    debounce = (fn, delay) => {
        clearTimeout(this.iconSizeTimer);
        this.iconSizeTimer = setTimeout(function(){
            fn();
        }, delay);
    }
    
    @action setUserIconSize = (iconSize) => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return;

        const obj = this.userContent[deviceType] || {};
        this.userContent[deviceType] = Object.assign({}, obj, {iconSize});

        this.debounce(this.saveUserOp, 2000);
    }

    getUserIconSize = () => {
        const defaultVal = 0.75;
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return defaultVal;

        const obj = this.userContent[deviceType] || {};
        return obj.iconSize || defaultVal;
    }

    getUserTopData = () => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return [];
        const obj = this.userContent[deviceType] || {};
        return obj.topData || [];
    }

    @action setUserTopData = (str) => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType)return;

        let topData = this.getUserTopData() || [];
        const hasIn = topData.indexOf(str) > -1;
        if(hasIn){
            topData = topData.filter(d => d !== str);
        }else{
            topData.push(str);
        }

        const obj = this.userContent[deviceType] || {};
        this.userContent[deviceType] = Object.assign({}, obj, {topData});

        this.saveUserOp();
    }

    @observable userContent: {[k: string]: {
        topData: Array<any>,
        iconSize: Number
    }} = {};

    userMemory: Memory;
    
    getUserOpDesc = () => {
        const { nodeType, siteType } = this.rootStore.pageState || {};
        return `user_op_${nodeType}_${siteType}`;
    }
    getUserOp = async () => {
        const description = this.getUserOpDesc();
        const params = Object.assign({}, MEMO_REQ, {description});

        this.userMemory = new Memory(params);
        const res = await this.userMemory.init();
        if(res.isOk){
            try{
                runInAction(() => {
                    this.userContent = JSON.parse(res.content);
                });                    
            }catch(e){console.error(e)}
        }
    }
    saveUserOp = () => {
        this.userMemory && this.userMemory.save(this.userContent);
    }

    getGroup = () => {
        const {CARD, DIVIDE} = keyStringMap;
        const cfg = this.getCategoryCfg();

        const {functionCfg = {}} = cfg || {};
        return (functionCfg[CARD] || {})[DIVIDE]?.divideType;
    }
    isGroupByFac = () => {
        return ['farm'].includes(this.getGroup());
    }
    isGroupByFeeder = () => {
        return ['feeder'].includes(this.getGroup());
    }

    @action
    setFilter = (option) => {
        const filters = this.getFilter(false);
        const filter = filters[0];
        if(!filter)return;

        (filter.valueList || []).map(ele => {
            if(option.value === ele.value){
                ele.checked = !!!ele.checked;
            }
        });
        this.set('filters', filters);
    }

    @action
    initFilter = (data) => {
        this.set('filters', data);
    }

    getFilter = (flag) => {
        const {CARD, FLICKER, FILTER, UNIVERSAL} = keyStringMap;
        const cfg = this.getCategoryCfg();

        const {functionCfg = {}, quotaCfg = []} = cfg || {};

        if(flag){
            return (functionCfg[CARD] || {})[FLICKER]?.enable ? quotaCfg.filter((ele: any) => (ele[FILTER])[UNIVERSAL]) : [];
        }else{
            return quotaCfg.filter((ele: any) => (ele[FILTER])[UNIVERSAL]);
        }
    }

    getReqFilter = () => {
        const filter = this.getFilter(false)[0];
        if(!filter)return [];

        const options = (filter.valueList || []).filter(ele => ele.checked);
        if(!options || options.length === 0)return [];
        return [{
            col_name: `${filter.alias}:${filter.fieldNo}`,
            filter_str: `^.*${options.map(ele=> ele.name).join('|')}.*$`
        }];
    }

    getSearchFilter = (field) => {
        const searchTex = this.getSearchText();
        if(!searchTex)return [];
        return [{
            col_name: field,
            filter_str: `^.*${searchTex}.*$`
        }];
    }

    getListColumns = () => {

        const {GRID, UNIVERSAL} = keyStringMap;
        const cfg = this.getCategoryCfg();

        const {quotaCfg = []} = cfg || {};

        let temp = quotaCfg.filter((quota: any) => {
            return (quota[GRID] || {})[UNIVERSAL];
        })

        return temp.sort(function(a, b){
            return ((a[GRID])[UNIVERSAL].order || '999999') - ((b[GRID])[UNIVERSAL].order || '999999');
        })
    }

    /**
     * @returns 
     */
    getPageBottom = () => {

        const {STATISTICS, UNIVERSAL} = keyStringMap;
        const cfg = this.pageBottomAndTabCfg;

        const {quotaCfg = []} = cfg || {};

        let temp = quotaCfg.filter((quota: any) => {
            return (quota[STATISTICS] || {})[UNIVERSAL];
        })

        return temp.sort(function(a, b){
            return ((a[STATISTICS])[UNIVERSAL].order || '999999') - ((b[STATISTICS])[UNIVERSAL].order || '999999');
        })
    }

    getColNum = () => {
        const {STATISTICS} = keyStringMap;
        const cfg = this.pageBottomAndTabCfg;

        const {functionCfg = {}} = cfg || {};

        return (functionCfg[STATISTICS] || {})['colNum'] || '5';
    }

    @observable isStatCollapsed = false;
    getCollapsed = () => {
        return this.isStatCollapsed;
    }

    @action
    setCollapsed = () => {
        this.isStatCollapsed = !this.isStatCollapsed;
    }

    getLargeCardHeight = () => {
        const cardIcon = this.getCardIcon();
        const cardBottom = this.getCardBottom();
        const cardCharts = this.getCardCharts();
        const cardQuotas = this.getCardQuotas();
        const statMinus = Array.isArray(cardBottom) && cardBottom.length > 0 ? 0 : CARD_ATTR.bottom
        const hasIcon = Array.isArray(cardIcon) && cardIcon.length > 0;
        const hasChart = Array.isArray(cardCharts) && cardCharts.length > 0;
        const hasQuota = Array.isArray(cardQuotas) && cardQuotas.length > 0;
        const middleMinus = (hasChart || hasQuota || hasIcon) ? 0 : CARD_ATTR.middle;

        return CARD_ATTR.height - statMinus - middleMinus;
    }

    getCardAllQuotas = () => {
        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){
            const cardBottom = this.getCardBottom().map(ele =>{ele.decimal = '0'; return ele});
            const cardQuotas = this.getCardQuotas();
            const cardIcons = this.getCardIcon();
            const cardNameLeft = this.getCardNameLeft();
            const cardNameRight = this.getCardNameRight();
            return [].concat(cardQuotas, cardBottom, cardNameLeft, cardNameRight, cardIcons);

        }else if(mode === MODE.SMALL_ICON){
            const cardIcons = this.getCardIcon();
            return cardIcons;
        }

        return [];
    }

    getCardNameLeft = () => {

        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){
            const {TITLE_LEFT, CARD} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {quotaCfg = []} = cfg || {};

            return quotaCfg.filter((quota: any) => {
                return (quota[CARD] || {})[TITLE_LEFT];
            })
        }

        return [];
    }

    getCardNameRight = () => {
        const mode = this.getMode();

        if([MODE.LARGE_ICON, MODE.SMALL_ICON].indexOf(mode) > -1){
            const {TITLE_RIGHT, CARD} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {quotaCfg = [], functionCfg = {}} = cfg || {};

            if((functionCfg[CARD] || {})[TITLE_RIGHT]?.enable){
                return quotaCfg.filter((quota: any) => {
                    return (quota[CARD] || {})[TITLE_RIGHT];
                })
            }else{
                return [];
            }
        }

        return [];
    }

    getCardIcon = () => {
        const mode = this.getMode();

        if([MODE.LARGE_ICON, MODE.SMALL_ICON].indexOf(mode) > -1){
            const {LARGE_ICON, OVERVIEW, CARD} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {functionCfg = {}, quotaCfg = []} = cfg || {};

            let type = (functionCfg[CARD] || {})[OVERVIEW]?.type || LARGE_ICON;

            let iconQuotas = [];

            if(type === LARGE_ICON){
                let iconQuota = quotaCfg.filter((quota: any) => {
                    return (quota[CARD] || {})[OVERVIEW]?.type === type;
                })[0];

                if(iconQuota){
                    iconQuotas.push(iconQuota);

                    let {associated} = (iconQuota[CARD])[OVERVIEW];

                    associated && iconQuotas.push(associated);
                }
            }
            return iconQuotas;
        }
        return [];
    }

    getCardCharts = () => {
        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){
            const {LARGE_ICON, OVERVIEW, CARD, CHART} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {functionCfg = {}, quotaCfg = []} = cfg || {};
            let type = (functionCfg[CARD] || {})[OVERVIEW]?.type || LARGE_ICON;
            if(type === CHART){
                let temp = quotaCfg.filter((quota: any) => {
                    return (quota[CARD] || {})[OVERVIEW]?.type === type;
                });

                return temp.sort(function(a, b){
                    return ((a[CARD])[OVERVIEW].order || '999999') - ((b[CARD])[OVERVIEW].order || '999999');
                })

            }else{
                return []
            }
        }

        return [];
    }

    getCardQuotas = () => {
        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){

            const {QUOTA, CARD} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {quotaCfg = [], functionCfg = {}} = cfg || {};

            if((functionCfg[CARD] || {})[QUOTA]?.enable){

                let temp = quotaCfg.filter((quota: any) => {
                    return (quota[CARD] || {})[QUOTA];
                })

                return temp.sort(function(a, b){
                    return ((a[CARD])[QUOTA].order || '999999') - ((b[CARD])[QUOTA].order || '999999');
                })

            }else{
                return [];
            }   
        }

        return [];
    }

    getCardBottom = () => {
        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){

            const {STATISTICS, CARD} = keyStringMap;
            const cfg = this.getCategoryCfg();

            const {quotaCfg = [], functionCfg = {}} = cfg || {};

            if((functionCfg[CARD] || {})[STATISTICS]?.enable){
                let temp = quotaCfg.filter((quota: any) => {
                    return (quota[CARD] || {})[STATISTICS];
                })

                return temp.sort(function(a, b){
                    return ((a[CARD])[STATISTICS].order || '999999') - ((b[CARD])[STATISTICS].order || '999999');
                })
            }else{
                return [];
            }   
        }

        return [];
    }
}

export default DataState;

