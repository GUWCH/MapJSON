import { 
    observable, 
    action, 
    computed, 
    makeObservable, 
    reaction, 
    runInAction, 
    autorun,
    transaction,
    toJS
} from 'mobx';
import { _dao } from '@/common/dao';
import { getTextWidth } from '@/common/utils/browser'; 
import _ from 'lodash';
import Memory, { MemoryType } from '@/common/util-memory';
import { MODE, MEMO_REQ, CARD_ATTR, RES_KEY, keyStringMap, isZh, modelKeyConvert, GRADE, defaultIconArr, isCorrectListTabFlag } from '../constants';
import { Location } from 'history';
import { ListConfig, Quota, TAllListModel, TAllListModels, TConvertedModel, IListDefaultCfg } from '../types';
import { convertQuotaToFilterGroup } from '../oldVersionAdapter';
import { combinePointKey } from '@/common/utils/model';

interface ICategoryCfg{
    filterGroups?: ListConfig.FilterConfig['filterGroups'];
    functionCfg?: {
        card?: {
            cardSize?: {
                cardSize?: number;
            };
            divide?: {
                divideType?: string;
            };
            overview?: {
                type?: string;
            };
            titleRight?: {
                enable?: boolean;
            };
            quota?: {
                enable?: boolean;
                autoWidth?: boolean;
            }
        };
        filter?: {

        };
        grid?: {

        };
        statistics?: {
            
        }
    };
    otherCfg?: {
        iconArr?: string[]
    };
    quotaCfg?: Quota[];
}

interface ICategory{
    mode: string;
    /**
     * @unused
     */
    columnResize: Object;
    sortColumn: string;
    sortDir: string;

    isSearchFiltering: boolean;
    searchText: string;
    filters: Array<any>;
    isFetched: boolean;
    /**各设备类型配置 */
    categoryCfg: ICategoryCfg;
    /**各设备类型组态模型 */
    models: TConvertedModel[];
};

export interface IDataState{

    defaultCfg: Array<any>;
    setDefaultCfg(defaultCfg: Array<any>): void;

    sign: string;
    setSign(sign: string): void;
    widgetId: string;
    setWidgetId(widgetId: string): void;
    filterFacName: boolean;
    setFilterFacName(filterFacName: boolean): void;

    /** 各设备类型缓存, 包括配置、操作等 */
    categories: {[key: string | number]: ICategory};
    setCategory(category: string): void;
    /** 监听配置修改,缓存地方监听此配置进行修改 
     * page.tsx对大卡片尺寸进行了缓存
    */
    categoryChanged: boolean;
    recoverCategoryChanged(): void;
    /** 各设备类型缓存里获取相应字段属性 */
    get(prop: string): any;
    /** 各设备类型缓存里设置相应字段属性 */
    set(prop: string, value: any): void;
    /** 设置当前设备类型展示模式, 大图标|小图标|表格 */
    setMode(mode: string): void;
    /** 获取当前设备类型展示模式, 大图标|小图标|表格 */
    getMode(): string;
    /** 设置当前设备类型组态里配置的模型列表 */
    setModels(): void;
    /** 获取当前设备类型组态里配置的模型列表 */
    getModels(): TConvertedModel[];
    /** 设置当前设备类型对应的配置 */
    setCategoryCfg(data: ICategoryCfg): void;
    /** 获取当前设备类型对应的配置 */
    getCategoryCfg(): ICategoryCfg;
    // getPageBottomCfg(): Array<any>,
    setSearchText(text: string): void;
    getSearchText(): string | undefined;
    getSearchFilter(key: string): Array<any>;
    isSearchFilter(): boolean;
    setIsSearchFilter(isSearchFilter: boolean): void;
    getEnableAlarm(): boolean;

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

    getCfgDesc(): void;
    saveConfig(cfg: any): Promise<void>;
    fetchConfig(): Promise<void>;
    setAllListModels(allListModels: TAllListModels): void;

    // related to page bottom configure
    pageBottomAndTabCfg: object;
    setPageBottomAndTabCfg(cfg:Array<any>): void;
    setPageBottomModels(models: []): void;
    pageBottomModels: Array<any>;
    pageBottomAndTabMemory?: Memory;
    getPageBottomAndTabDesc(): void;
    saveTab(cfg: any): Promise<void>;
    savePageBottom(cfg: any): Promise<void>;
    fetchPageBottomConfig(location: Location): Promise<void>;
    // used by configure widget 
    getPageBottomConfigData(): Object;

    // related to user op, need to save it
    userMemory?: Memory;
    userContent: Record<string, {
        topData: Array<any>,
        iconSize: number,
        listColWidth?: Record<string, number>,
        filters: Record<string, number[] | undefined> // key: point.key
    }>
    getUserOpDesc(): string;
    getUserOp(): void;
    saveUserOp(): void;
    setUserIconSize(iconSize: number): void;
    getUserIconSize(): number;
    getUserTopData(): Array<any>;
    setUserTopData(str: string): void;
    getUserFiltersData(): Record<string, number[] | undefined>
    setUserListColWidthData(key: string, width: number): void
    getUserListColWidthData(): Record<string, number | undefined> | undefined

    // related to page bottom
    getColNum(): string;
    getPageBottom(): Array<any>;
    getPageBottomModels(): Array<any>;
    getCollapsed(): boolean;
    setCollapsed(): void;

    // related to card, table and filter
    getGroup(): string | null | undefined;
    isGroupByFac(): boolean;
    isGroupByFeeder(): boolean;
    setFilter(option: { pointKey:string, value:number, checked: boolean}): void;
    /** 目前好像没用用处 */
    initFilter(data: any): void;
    getFilter(): (
        Pick<TPointWithCfg, 'name' | 'nameCn' | 'nameEn' | 'tableNo' | 'fieldNo' | 'alias' | 'conf'> & 
        { key: string, valueList?: (YXConst & {checked?:boolean})[] }
    )[];
    getReqFilter(): Array<any>;
    getListColumns(): Array<any>;    
    getLargeCardHeight(): number;
    getLargeCardWidth(): {
        width: number;
        quotaTextWidth?: number;
    };
    getCardAllQuotas(): Array<any>;
    getCardNameLeft(): Array<any>;
    getCardNameRight(): Array<any>;
    getCardIcon(): Array<any>;
    getCardCharts(): Array<any>;
    getCardQuotas(): Array<any>;
    getCardBottom(): Array<any>;
    /**获取当前场站或设备类型组态配置 */
    getOriginConfig(): IListDefaultCfg | undefined;
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
            //console.log(this.dyndata);
        })
    }

    defaultCfg: any[] = [];
    setDefaultCfg = (defaultCfg: Array<any>) => {
        this.defaultCfg = defaultCfg;
    }

    // 组件唯一标识

    sign = '';
    setSign = (sign) => {
        this.sign = sign;
    }

    widgetId = '';
    setWidgetId = (widgetId) => {
        this.widgetId = widgetId;
    }

    filterFacName = true;
    setFilterFacName = (filterFacName) => {
        this.filterFacName = filterFacName;
    }

    // 配置状态
    @observable isConfiguring = false;
    @action setIsConfiguring = (isConfiguring) => {
        this.isConfiguring = typeof isConfiguring === 'boolean' ? isConfiguring : !this.isConfiguring;
    }

    // 统计配置状态
    @observable isStatsConfiguring = false;
    @action setIsStatsConfiguring = (isStatsConfiguring) => {
        this.isStatsConfiguring = typeof isStatsConfiguring === 'boolean' ? isStatsConfiguring : !this.isStatsConfiguring;
    }

    // 配置所有设备模型
    allListModels: TAllListModels = [];
    setAllListModels = (allListModels: TAllListModels) => {
        this.allListModels = allListModels;
    }

    getCfgDesc = () => {
        const {widgetId, sign} = this;
        const {deviceType } = this.rootStore.pageState || {};
        return `${sign}_${widgetId}_${deviceType}`;
    }
    // 配置保存
    @action saveConfig = async (cfg) => {
        this.set('categoryCfg', cfg);

        const configMemory = this.get('configMemory');
        configMemory && configMemory.save(cfg);
    }

    // 配置获取
    @action fetchConfig = async () => {
        const description = this.getCfgDesc();
        const params = Object.assign({}, MEMO_REQ, {description});

        this.set('configMemory', new Memory(params));
        const configMemory = this.get('configMemory'); 

        const res = await configMemory.init();

        if(res.isOk){
            let resContent: ICategoryCfg = {};
            try{
                resContent = JSON.parse(res.content);
            }catch(e){
                console.error(e)
            }
            
            runInAction(() => {
                const iconArr = resContent?.otherCfg?.iconArr
                if(iconArr && iconArr.length > 0){
                    this.setMode(iconArr[0])
                }

                /** 使用原始组态配置覆盖存储的配置 */
                if(resContent){
                    const originCfg = this.getOriginConfig();
                    if(originCfg){
                        const temp = {};
                        originCfg.models.forEach(m => {
                            temp[combinePointKey(m)] = m;
                        });
                        if(resContent.filterGroups){
                            resContent.filterGroups = resContent.filterGroups.map(f => {
                                const tempModel: IModelPoint = temp[combinePointKey(f)];
                                if(tempModel){
                                    f.nameCn = tempModel.name_cn;
                                    f.nameEn = tempModel.name_en;
                                    f.constNameList = tempModel.const_name_list || [];
                                }
                                return f;
                            });
                        }
                        if(resContent.quotaCfg){
                            resContent.quotaCfg = resContent.quotaCfg.map(f => {
                                const tempModel: IModelPoint = temp[combinePointKey(f)];
                                if(tempModel){
                                    f.nameCn = tempModel.name_cn;
                                    f.nameEn = tempModel.name_en;
                                    f.valueList = tempModel.const_name_list || [];
                                }
                                return f;
                            });
                        }
                    }
                }

                this.set('categoryCfg', resContent);
            }); 
        }
    }

    // 统计模型和配置
    pageBottomModels = [];
    setPageBottomModels = (models) => {
        this.pageBottomModels = modelKeyConvert(models || [])
        .map(ele => {
            ele.fn_statistics = true;
            return ele;
        });
    }

    getPageBottomModels = () => {
        return this.pageBottomModels;
    }

    @observable pageBottomAndTabCfg = {};
    @action setPageBottomAndTabCfg = (cfg) => {
        this.pageBottomAndTabCfg = Object.assign(this.pageBottomAndTabCfg, cfg);
    };

    pageBottomAndTabMemory: Memory | undefined = undefined;
    getPageBottomAndTabDesc = () => {
        const {widgetId, sign } = this;
        return `${sign}_${widgetId}_statistics`;
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
    fetchPageBottomConfig = async (location) => {
        const description = this.getPageBottomAndTabDesc();
        const params = Object.assign({}, MEMO_REQ, {description});

        if(!this.pageBottomAndTabMemory){
            this.pageBottomAndTabMemory = new Memory(params);
        }        
        const res = await this.pageBottomAndTabMemory.init();

        let resContent = {};

        if(res.isOk){
            try{
                resContent = JSON.parse(res.content as string);
            }catch(e){console.error(e)}
        }

        runInAction(() => {

            this.setPageBottomAndTabCfg(resContent);

            const { deviceTypes, setDeviceTypes, deviceType, setDeviceType } = this.rootStore.pageState || {};

            if(deviceType !== 'farm'){
                // @ts-ignore 类型声明缺失
                const deviceOrderCfg = resContent.deviceOrderCfg || [];

                let reOrderDeviceTypes = JSON.parse(JSON.stringify(deviceTypes));
                if(deviceOrderCfg.length > 0){
                    reOrderDeviceTypes = reOrderDeviceTypes.map(ele => {
                        let index = deviceOrderCfg.findIndex(s => s == ele.bay_value);
                        return Object.assign({}, ele, {order: index === -1 ? 999 : index});
                    })
                    .sort(function(a, b){ return a.order - b.order;})
                }
                setDeviceTypes(reOrderDeviceTypes);

                const {tableNo, type} = location.state || {};

                // 从state获取匹配的设备类型定位
                const fromType = reOrderDeviceTypes.find(f => {
                    return isCorrectListTabFlag(tableNo, type, f.bay_value);
                });
                if(fromType){
                    setDeviceType(fromType.bay_value);
                }else{
                    setDeviceType(reOrderDeviceTypes[0]?.bay_value || '');
                }                
            }

        }); 
    }
    // used by configure widget 
    getPageBottomConfigData = () => {
        // @ts-ignore fixme 类型声明缺失
        const {functionCfg = {}, quotaCfg = []} = this.pageBottomAndTabCfg;
        return {
            functionCfg: functionCfg,
            quotaCfg: quotaCfg
        };
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
                mode: defaultIconArr[0],
                columnResize: {},
                
                isSearchFiltering: false,
                searchText: '',
                sortColumn: '',
                sortDir: '',
                filters: [],

                // 配置
                isFetched: false,
                configMemory: null,
                categoryCfg: {},
                models: [],
            });
        }

        const typeCache = this.categories[category];
        if(typeCache.isFetched)return;
        typeCache.isFetched = true;
        this.fetchConfig();
        this.setModels();
        // this.fetchPageBottomConfig();
    }
    @observable categoryChanged = false;
    @action recoverCategoryChanged = () => {
        this.categoryChanged = false;
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
        this.categoryChanged = true;
    }

    getOriginConfig = () => {
        const { deviceType } = this.rootStore.pageState || {};

        if(!deviceType) return;

        let temp: TAllListModel | undefined;

        if(deviceType === 'farm'){
            temp = this.allListModels[0];
        }else{
            temp = this.allListModels.find((ele) => {
                // @ts-ignore fixme 类型声明缺失
                let {table_no = '', type = ''} = ele.object;

                return isCorrectListTabFlag(table_no, type, deviceType);
            })
        }

        return temp;
    }

    setModels = () => {
        const temp: TAllListModel | undefined = this.getOriginConfig();
        
        if(temp){
            let {models = [], statistics} = temp;
            let res = models.concat((statistics?.models || []).map(model => {
                model.fn_filter_source = true;
                return model;
            }))
            this.set('models', modelKeyConvert(res));
        }
    }

    getModels = () => {
        return this.get('models');
    }

    setCategoryCfg = (data) => {
        this.set('categoryCfg', data);
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
        transaction(() => {            
            this.set('isSearchFiltering', true);
            this.set('searchText', searchText);
        });
    }

    getSearchText = () => {
        return this.get('searchText');
    }

    isSearchFilter = () => {
        return this.get('isSearchFiltering');
    }

    @action setIsSearchFilter = (isSearchFilter) => {
        this.set('isSearchFiltering', isSearchFilter);
    }

    getEnableAlarm = () => {
        const originCfg = this.getOriginConfig();
        return !originCfg || originCfg.enableAlarm !== false;
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

        this.debounce(this.saveUserOp, 500);
    }

    getUserIconSize = () => {
        const defaultVal = 1;
        const { deviceType, grade } = this.rootStore.pageState || {};
        if(!deviceType)return defaultVal;

        const obj = this.userContent[deviceType] || {};
        return obj.iconSize || (grade === GRADE.FARM ? 1 : defaultVal);
    }

    getUserFiltersData = () => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType) return {};
        const obj = this.userContent[deviceType] || {};
        return obj.filters ?? {};
    }

    @action 
    setUserFilters = (valuesMap: Record<string, number[] | undefined>) => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType) return;

        const obj = this.userContent[deviceType];
        this.userContent[deviceType] = Object.assign({}, obj, { filters: valuesMap });

        this.saveUserOp();
    }

    getUserListColWidthData = (): typeof this.userContent[(keyof typeof this.userContent)]['listColWidth'] => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType) return;
        return this.userContent[deviceType]?.listColWidth;
    }

    setUserListColWidthData = (key: string, width: number) => {
        const { deviceType } = this.rootStore.pageState || {};
        if(!deviceType) return;

        const listColWidth = this.getUserListColWidthData() ?? {};
        listColWidth[key] = width
        const obj = this.userContent[deviceType];
        this.userContent[deviceType] = Object.assign({}, obj, { listColWidth });

        this.saveUserOp();
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

    @observable userContent: Record<string, {
        topData: Array<any>,
        iconSize: number,
        listColWidth?: Record<string, number>,
        filters: Record<string, number[] | undefined>
    }> = {};

    userMemory: Memory | undefined = undefined;

    getUserOpDesc = () => {
        return `user_op_${this.sign}_${this.widgetId}`;
    }
    
    getUserOp = async () => {
        const description = this.getUserOpDesc();
        const params = Object.assign({}, MEMO_REQ, {description, type: MemoryType.USER_OP});

        this.userMemory = new Memory(params);
        const res = await this.userMemory.init();
        if(res.isOk && res.content){
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
    setFilter = (option: { pointKey: string, value: number, checked: boolean}) => {
        const filters = this.getFilter()
        const newFilters = JSON.parse(JSON.stringify(filters)) as typeof filters
        const filterGroup = newFilters.find(g => g.key === option.pointKey)
        const filterValue = filterGroup?.valueList?.find(v => v.value === option.value)
        if(filterValue === undefined) return
        filterValue.checked = option.checked
        
        const userFilters = this.getUserFiltersData()
        let checkedValues = userFilters[option.pointKey] ?? []
        
        if(option.checked && !checkedValues.includes(option.value)) {
            checkedValues.push(option.value)
        }else if (!option.checked && checkedValues.includes(option.value)){
            _.remove(checkedValues, (v) => v === option.value)
        }
        const newUserFilters = {
            ...userFilters,
            [option.pointKey]: checkedValues
        }
        Object.entries(userFilters).forEach(([key, value]) => {
            if(_.isNumber(key)){
                console.warn('remove old version data')
                return
            }

            newUserFilters[key] = value
        })

        transaction(() => {            
            this.setUserFilters(newUserFilters)
            this.set('isSearchFiltering', true);
            this.set('filters', filters);
        });        
    }

    @action
    initFilter = (data) => {
        this.set('filters', data);
    }

    getFilter = (): (
        Pick<TPointWithCfg, 'name' | 'nameCn' | 'nameEn' | 'tableNo' | 'fieldNo' | 'alias' | 'conf'> & 
        { key: string, valueList?: (YXConst & {checked?:boolean})[] }
    )[] => {
        const {FILTER, UNIVERSAL} = keyStringMap;        
        const newestModels = this.getModels();
        const cfg = this.getCategoryCfg();
        
        const {quotaCfg = [], filterGroups} = (cfg || {}) as { quotaCfg:any[], filterGroups:ListConfig.FilterConfig['filterGroups'] };
        const filterFromOldVersion = quotaCfg
            .filter((ele: any) => (ele[FILTER])[UNIVERSAL])
            .map((quota: Quota) => {
                return convertQuotaToFilterGroup(quota);
            })
        const filters: NonNullable<ListConfig.FilterConfig['filterGroups']> = 
            (filterGroups ?? []).map(p => ({...p, key: combinePointKey(p)}))
            .concat(filterFromOldVersion.filter(fOld => 
                !filterGroups?.find(fNew => combinePointKey(fNew) === combinePointKey(fOld))
            ))
        
        const userFilters = this.getUserFiltersData();

        return filters.map((ele) => {
            const newesFilter = newestModels.find(
                m => (m.alias === ele.alias && m.tableNo == ele.tableNo && m.fieldNo == ele.fieldNo) 
                && !!m[RES_KEY.fn_filter]
            );

            const valueList = (((newesFilter?.valueList || ele.constNameList) ?? []) as YXConst[] ).map((valueObj, i) => {
                const finalIndex = ele.conf?.valueMap?.[valueObj.value]?.orderIndex ?? i

                return {
                    ...valueObj,
                    checked: userFilters[ele.key]?.includes(valueObj.value),
                    index: finalIndex
                }
            }).sort((a,b) => a.index - b.index)
            return {...ele, valueList}
        });
    }

    /**
     * getFilter里需要获取配置后才能获取到checked的过滤项, 异步导致第一次失败
     * 现改为从组态模型和用户操作缓存里过滤处理
     * TODO 或者改为获取配置成功后再渲染
     * @returns 
     */
    getReqFilter = () => {
        const userFilters = this.getUserFiltersData();
        const newestModels = this.getModels();

        const params: {
            col_name: string
            filter_str: string
        }[] = []

        newestModels.filter(m => !!m[RES_KEY.fn_filter]).forEach(f => {
            const userFilterKey = combinePointKey(f);
            const options = (f.valueList ?? []).filter(o => userFilters[userFilterKey]?.includes(o.value));
            if (options.length > 0) {
                params.push({
                    col_name: `${f.alias}:${f.fieldNo}`,
                    filter_str: `^${options.map(ele=> isZh ? ele.name : ele.name_en).join('|')}$`    
                })
            }
        })

        return params
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
            const prev = (a[GRID])[UNIVERSAL].order;
			const next = (b[GRID])[UNIVERSAL].order;
            return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
        })
    }

    /**
     * @returns 
     */
    getPageBottom = () => {

        const {STATISTICS, UNIVERSAL} = keyStringMap;
        const cfg = this.pageBottomAndTabCfg;

        // @ts-ignore fixme 类型声明缺失
        const {quotaCfg = []} = cfg || {};

        let temp = quotaCfg.filter((quota: any) => {
            return (quota[STATISTICS] || {})[UNIVERSAL];
        })

        return temp.sort(function(a, b){
            const prev = (a[STATISTICS])[UNIVERSAL].order;
			const next = (b[STATISTICS])[UNIVERSAL].order;
            return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
        })
    }

    getColNum = () => {
        const {STATISTICS} = keyStringMap;
        const cfg = this.pageBottomAndTabCfg;

        // @ts-ignore fixme 类型声明缺失
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
        const statMinus = Array.isArray(cardBottom) && cardBottom.length > 0 ? 0 : CARD_ATTR.bottomHeight
        const hasIcon = Array.isArray(cardIcon) && cardIcon.length > 0;
        const hasChart = Array.isArray(cardCharts) && cardCharts.length > 0;
        const hasQuota = Array.isArray(cardQuotas) && cardQuotas.length > 0;
        const middleMinus = (hasChart || hasQuota || hasIcon) ? 0 : CARD_ATTR.middleHeight;

        return CARD_ATTR.height - statMinus - middleMinus;
    }

    getLargeCardWidth = () => {
        const cardIcon = this.getCardIcon();
        const cardBottom = this.getCardBottom();
        const cardCharts = this.getCardCharts();
        const cardQuotas = this.getCardQuotas();
        const hasIcon = Array.isArray(cardIcon) && cardIcon.length > 0;
        const hasChart = Array.isArray(cardCharts) && cardCharts.length > 0;
        const hasQuota = Array.isArray(cardQuotas) && cardQuotas.length > 0;

        const bottomLength = Array.isArray(cardBottom) ? cardBottom.length : 0;
        const bottomWidth = CARD_ATTR.bottomItemWidth * bottomLength;
        let middleWholeWidth = CARD_ATTR.width;
        let quotaTextWidth;

        if(hasQuota){
            const {QUOTA, CARD} = keyStringMap;
            const { functionCfg = {} } = this.getCategoryCfg() || {};
            /** 以下计算要与css里保持一致,css修改同步修改此处
             * 以下比例不能保证展示完全
             */
            /**@TODO 以后再有优化考虑弄个样式配置, 包括文字大小、设备名称大小和卡片总宽度, 下面的做法很难实现所有需求 */
            const autoWidth = (functionCfg[CARD] || {})[QUOTA]?.autoWidth;
            
            if(hasChart){
                middleWholeWidth = CARD_ATTR.width;
                if(autoWidth){
                    const chartWidth = middleWholeWidth * 0.45;
                    const quotaWidth = middleWholeWidth * 0.55 * 0.5;
                    middleWholeWidth = Math.floor(chartWidth + quotaWidth);
                }
            }else if(hasIcon){
                middleWholeWidth = CARD_ATTR.hasIconWidth;
                if(autoWidth){
                    const iconWidth = middleWholeWidth * 0.35;
                    const quotaWidth = middleWholeWidth * 0.65 * 0.5;
                    middleWholeWidth = Math.floor(iconWidth + quotaWidth);
                }
            }else {
                middleWholeWidth = CARD_ATTR.smallWidth;
                if(autoWidth){
                    const quotaWidth = middleWholeWidth * 0.6;
                    middleWholeWidth = Math.floor(quotaWidth);
                }
            }

            if(autoWidth){
                const editNameKey = isZh ? 'edictNameCn' : 'edictNameEn';
                const pointNameKey = isZh ? 'nameCn' : 'nameEn';
                const cardQuotasNames = cardQuotas.map(q => {
                    return q?.[keyStringMap.CARD]?.[keyStringMap.QUOTA]?.[editNameKey] || q[pointNameKey];
                });
                const quotasNameWidths: number[] = [];
                cardQuotasNames.map((quotaName) => {
                    quotasNameWidths.push(getTextWidth(quotaName));
                });

                if(quotasNameWidths.length > 0){
                    quotaTextWidth = Math.max(...quotasNameWidths) + 2; // 2是补白
                    if(quotaTextWidth > CARD_ATTR.quotaMaxWidth){
                        quotaTextWidth = CARD_ATTR.quotaMaxWidth;
                    }
                    middleWholeWidth = middleWholeWidth + quotaTextWidth;
                }
            }
        }else{
            if(hasChart){
                middleWholeWidth = CARD_ATTR.smallWidth;
            }else if(hasIcon){
                middleWholeWidth = CARD_ATTR.smallWidth;
            }else{
                middleWholeWidth = CARD_ATTR.smallWidth;
            }
        }
        const width = Math.max.apply(null, [middleWholeWidth, bottomWidth]);
        return {
            width: width <= 0 ? CARD_ATTR.smallWidth : width,
            quotaTextWidth
        };
    }

    getCardAllQuotas = () => {
        const mode = this.getMode();

        if(mode === MODE.LARGE_ICON){
            const cardBottom = this.getCardBottom().map(ele =>{ele.decimal = '0'; return ele});
            const cardQuotas = this.getCardQuotas();
            const cardIcons = this.getCardIcon();
            const cardNameLeft = this.getCardNameLeft();
            const cardNameRight = this.getCardNameRight();
            return [
                ...cardQuotas, 
                ...cardBottom, 
                ...cardNameLeft, 
                ...cardNameRight, 
                ...cardIcons
            ]

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

            let iconQuotas: any[] = [];

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
                    const prev = (a[CARD])[OVERVIEW].order;
                    const next = (b[CARD])[OVERVIEW].order;
                    return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
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
                    const prev = (a[CARD])[QUOTA].order;
                    const next = (b[CARD])[QUOTA].order;
                    return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
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
                    const prev = (a[CARD])[STATISTICS].order;
                    const next = (b[CARD])[STATISTICS].order;
                    return (typeof prev !== 'undefined' ? prev : 999999) - (typeof next !== 'undefined' ? next : 999999);
                })
            }else{
                return [];
            }   
        }

        return [];
    }
}

export default DataState;

