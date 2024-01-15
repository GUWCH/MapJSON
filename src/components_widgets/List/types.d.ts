import { IconKey } from '@/components/Icon/iconsMap'

/**
 * @warn 未直接声明完全，需要后续不断完善
 * @warn valueList不能使用, 一定要使用模型里的, 因为有可能改变
 */
export type Quota = {
    tableNo: string
    fieldNo: string
    unit?: string
    alias: string
    key: string // "61:WTUR.TurbineListSts:9",
    nameCn: string
    nameEn: string
    filter?: {
        universal?: {
            valueListStyle?: {
                name: string
                name_en: string
                value: number | string
                order: number
                icon: string // "NORMAL",
                color: string //"rgba(88,245,192,0.7)",
                dataSource: {
                    alias: string
                    tableNo: string
                    fieldNo: string
                    unit?: string
                    nameCn: string
                    nameEn: string
                }
            }[]
        }
    },
    valueList: {
        name: string
        name_en: string
        value: number
    }[]
}

export namespace ListConfig {
    export type FilterConfig = {
        filterGroups?: ({key: string} & Pick<TPointWithCfg, 'name' | 'nameCn' | 'nameEn' | 'tableNo' | 'fieldNo' | 'alias' | 'constNameList' | 'conf'>)[]
    }
    export type FilterValueEnums = (YXConst & {
        icon?: string
        color?: string
        disabled?: boolean
        dataSource?: Pick<TPoint, 'nameCn' | 'nameEn' | 'tableNo' | 'fieldNo' | 'alias'>
    })[]
}

export type TGlobalState = {
    listType: string
    quotaData: Record<string, Quota | undefined> // key:   tableNo:alias:fieldNo
    functionData: any
    otherData: {
        iconArr?: string[]
    }
    quotaOptions: any
} & ListConfig.FilterConfig

type TFn = {
    fn_filter?: boolean;
    fn_label?: boolean;
    fn_info?: boolean;
    fn_overview?: boolean;
    fn_quota?: boolean;
    fn_statistics?: boolean;
    fn_grid?: boolean;
    fn_statusstats?: boolean;
    fn_filter_source?: boolean;
    fn_overview_assoc?: boolean;
};

export type TAllListModel = {
    enableAlarm?: boolean;
    object: IModelInfo;
    models: (IModelPoint&TFn)[];
    statistics: {
        domain: string;
        object: IModelInfo;
        models: (IModelPoint&TFn)[];
    };
};

export type TAllListModels = TAllListModel[];

/** 不知为什么改字段,不用原始字段 */
export type TConvertedModel = {
    nameEn: string;
    nameCn?: string;
    name?: string;
    tableNo: number;
    fieldNo: number;
    alias: string;
    unit: string;
    valueList?: YXConst[];
} & TFn;

export interface IListDefaultCfg {
    type: string;
    domain: string;
    filterFacName?: boolean;
    drillDown?: boolean;
    list: {
        enableAlarm?: boolean;
        models: any[];
        object: {[key: string]: any};
        statistics: {[key: string]: any};
        iconCfg?: {
            key?: IconKey,
            color?: string
        }
    }[];
    objects: {
        model_id: string;
        model_name: string;
        table_no: string | number;
        type: string | number;
    }[];
};

export type TListProps = WidgetProps & {configure: IListDefaultCfg};