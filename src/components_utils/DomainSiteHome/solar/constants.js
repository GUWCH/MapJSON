import Intl, { msgTag } from '@/common/lang';

export const isZh = Intl.isZh;
export const msg = (keyStr) => {
    return (isZh ? {
        dcCombinerMeasure: '直流汇流箱遥测',
        inverterMeasure: '逆变器遥测',
        padMeasure: '箱变遥测',
        strInverterMeasure: '组串式逆变器遥测',
        back: '返回'
    }: {
        dcCombinerMeasure: 'DC Combiner Box',
        inverterMeasure: 'Inverter',
        padMeasure: 'MV Transformer',
        strInverterMeasure: 'String Inverter',
        back: 'Back'
    })[keyStr];
} 

export const deviceEx = ['array', 'weatherStation'];

const getQuotaKey = (ele) => {
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

export const BASEINFO_DEFAULT_POINTS = {
    'PAD': [
        'BXTF.IaBr1-62-9',
        'BXTF.IbBr1-62-9',
        'BXTF.IcBr1-62-9',
        'BXTF.IaBr2-62-9',
        'BXTF.IbBr2-62-9',
        'BXTF.IcBr2-62-9',
        'BXTF.IaBr22-62-9',
        'BXTF.IbBr22-62-9',
        'BXTF.IcBr22-62-9',
        'BXTF.ActPowPhBr2-62-9',
        'BXTF.ReActPowPhBr2-62-9',
        'BXTF.ActPowPhBr22-62-9',
        'BXTF.ReActPowPhBr22-62-9'
    ],
    'INV': [
        // 'INVT.CurDCTotal-62-9',
        // 'INVT.VolDCTotal-62-9',
        'INVT.PVPowIn-62-9',
        'INVT.GenActivePW-62-9',
        'INVT.InvtEffi-62-9',
        'INVT.GenReactivePW-62-9',
        // 'INVT.IPR-35-23',
        // 'INVT.APProduction-35-29',
        // 'INVT.APProduction-35-29',
        // 'INVT.APProductionHour-35-29'
    ],
    'AC_COMB': [
        'CBBX.GenActivePW-62-9',
        'CBBX.Temp-62-9'
    ],
    'DC_COMB': [
        'Disperse-62-9'
    ],
    'STR_INV': [
        'Disperse-62-9'
    ]
}