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

export const curveCfgConvert = (cfg) => {
    let contentData = [];
    Object.keys(cfg).map(key => {
        let contentItem = {
            tplTimeGran: key,
            tplInterval: [],
            tplMax: 4,
            tplPoints: cfg[key].map(ele => {ele.key = getQuotaKey(ele); return ele;}),
            tplRangeNum: 7,
            tplRangeUnit: 'days'
        };
        switch(key){
            case 'day': 
                contentData.push(Object.assign(contentItem, {
                    tplInterval: [
                        "1_min",
                        "5_min",
                        "10_min",
                        "15_min",
                        "30_min",
                        "1_hour",
                        "2_hour",
                        "4_hour"
                    ]
                }))
                break;

            case 'week': 
                contentData.push(Object.assign(contentItem,{
                    tplInterval: ["1_day"]
                }))
                break;

            case 'month': 
                contentData.push(Object.assign(contentItem,{
                    tplInterval: ["1_day"]
                }))
                break;

            case 'year': 
                contentData.push(Object.assign(contentItem,{
                    tplInterval: ["1_month"]
                }))
                break;

            case 'total': 
                contentData.push(Object.assign(contentItem,{
                    tplInterval: ["1_year"]
                }))
                break;
            case 'customize':
                contentData.push(Object.assign(contentItem,{
                    tplInterval: [
                        "1_min",
                        "5_min",
                        "1_hour",
                        "1_day"
                    ]
                }))
                break;
        }
    })

    return contentData;
}