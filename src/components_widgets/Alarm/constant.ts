import Intl, { msgTag } from '@/common/lang';
import { TableProps } from 'antd';

export const tableColMinWidth = 190;

export enum TYPE_LIST {
    ALARM = 'alarm',
    ACTIVE_SC = 'activeSc',
    SUBHEALTH_SC = 'subhealthSc'
}


/* 类型定义 */
export type TableState = {
    height: number;
    data: any[];
    total: number;
    page: number;
    pageSize: number;
};

export type AlarmReq = {
    alias_list: string;
    type_list: string;
    level_list: string;
    max_cnt: number;
    node_name_list: string;
    seq_type: number;
    history_sc: number;
    start_id: number;
    start_no: number;
    app_list: string;
};

export type AlarmType = {
    id?: string | number;
    name_zh: string;
    name_en: string;
    value: string | number;
    label?: string;
}

export type AlarmLevel = {
    id: number;
    name: string;
    value: number | string;
    color: string;
}

export type AlarmConditionProps = {
    alarmTypes: Array<AlarmType>;
    alarmLevels: Array<AlarmLevel>;
    typeChange: Function;
    levelChange: Function;
    selectedTypes: Array<string>;
    selectedLevels: Array<string>;
    [key: string]: any;
};

export type AlarmTableProps = {
    devAlias: string;
    types: AlarmType[]
    levels: AlarmLevel[]
    alarmReqParams: AlarmReq;
    cols: any;
    maxRecords: number;
    historySc: number;
    pageSize: number;
    allowRedirect?: boolean
    onChange?: TableProps<any>['onChange']
    onRedirect: (params: {st:string, et:string}) => void 
};

type CommonContentOptions = {
    maxRecords: number;
    pageSize: number;
    userSaveCfg?: any;
    onSave?: (cfg: any) => void;
}

export type ContentOptions = {
    [TYPE_LIST.ALARM]: {
        alarmTypes: Array<AlarmType>;
        alarmLevels: Array<AlarmLevel>;
        historySc: number;
        allowRedirect?: boolean
    } & CommonContentOptions,
    [TYPE_LIST.ACTIVE_SC]: CommonContentOptions,
    [TYPE_LIST.SUBHEALTH_SC]: CommonContentOptions
}

export type ContentProps<T extends TYPE_LIST> = {
    type: T;
    devAlias: string;
    options: ContentOptions[T]
}

export type PureTableData = {
    cols: any;
    tableData: any;
    pageSize: number;
    onChange?: TableProps<any>['onChange']
    onRedirect?: () => void
}

export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const MAX_RECORDS: number = 100;
export const HISTORY_SC: number = 0;

export const PAGE_SIZE: number = 50;
export const PageSizeOption = [
    {
        label: isZh ? '10条/页' : '10/page',
        value: '10'
    },
    {
        label: isZh ? '20条/页' : '20/page',
        value: '20'
    },
    {
        label: isZh ? '50条/页' : '50/page',
        value: '50'
    },
    {
        label: isZh ? '100条/页' : '100/page',
        value: '100'
    }
];