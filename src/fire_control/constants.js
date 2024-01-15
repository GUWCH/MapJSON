import Intl, { msgTag } from '@/common/lang';

export const msg = msgTag('storagesite');
export const isZh = Intl.isZh;

export const isDev = process.env.NODE_ENV === 'development';

export const STORAGE_SITE = 'storage_site';

export const SLOT = '--';

export const COMMON_DECIMAL = 3;

export const getQuotaKey = (ele) => {
    let {table_no = '', alias = '', field_no = ''} = ele;
    return table_no + ":" + alias + ":" + field_no;
}