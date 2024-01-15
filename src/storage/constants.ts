import moment from 'moment';
import { DATE_MOMENT_FORMAT, TREE_NODE_TYPE } from '@/common/constants';

export const getDateRange = (offsetSt: number = 0, offsetEt: number = 0): [string, string] => {
    const defaultMoment = moment().add(0 + offsetSt, 'days');
    const defaultDay = defaultMoment.format(DATE_MOMENT_FORMAT.DATE);
    const defaultSt = `${defaultDay} 00:00:00`;
    const defaultEndMoment = moment().add(1 + offsetEt, 'days');
    const defaultEndDay = defaultEndMoment.format(DATE_MOMENT_FORMAT.DATE);
    const defaultEt = `${defaultEndDay} 00:00:00`;
    return [defaultSt, defaultEt];
}

export type TableParameter = {
    page: number;
    pageSize: number;
    total: number;
    sorter?: string;
    sortOrder?: 'asc' | 'desc';
};
export const defaultTableParameter: TableParameter = {
    page: 1,
    pageSize: 50,
    total: 0,
    sorter: '',
    sortOrder: 'asc'
};