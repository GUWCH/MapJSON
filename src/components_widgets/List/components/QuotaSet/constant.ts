import { msgTag } from '@/common/lang';
import { keyStringMap, isZh, TOKEN_SIZE } from '../../constants';
import { CommonDynPattern } from 'DynData';

const msg = msgTag('datalistnew');

export const msgConvert = (str) => {
    return msg('config.' + str);
}

export const STATISTICS_MAX_COL = 10;

export const listTypes = {
    statistics: {
        title:msgConvert('statisticsSet'),
        colNumSet: true,
        colSetContent:{
            name: msgConvert('colNum'),
            mode: 'input',
            key: 'colNum'
        }
    },

    list: {
        title: msgConvert('listSet'),
        children: [
            {  
                key: keyStringMap.FILTER,
                title: msgConvert('filterSet')
            },{
                key: keyStringMap.CARD,
                title: msgConvert('cardSet')
            },{
                key: keyStringMap.GRID,
                title: msgConvert('tableSet')
            },{
                key: keyStringMap.OTHER,
                title: msgConvert('otherSet')
            }
        ]
    }
}

export const farmCardItems = ['titleLeft', 'titleRight', 'overview', 'quota', 'statistics', 'cardSize'];
export const deviceCardItems = ['titleLeft', 'titleRight', 'overview', 'quota', 'statistics', 'flicker', 'divide', 'cardSize'];

export const getLocationContent = (isFarm: boolean): {
    [k: string]: {
        location: string;
        locNameShow?: boolean;
        checkable?: boolean;
        locSetEnable?: boolean;
        /** 指标附加配置项, 根据文字自适应卡片宽度 */
        locAddition?: boolean;
        quotaSelectEnable?: boolean;
        quotaSelect?: {
            mode: string;
            type?: string;
            name?: string;
            incluedNo?: boolean;
            defaultValue?: any;
        },
        limitNum?: number;
        expandSet?: boolean;
        expandSetContent?: {
            keyString?: string;
            needOrder: boolean;
            needDelete: boolean;
            needEdict: boolean;
        };
        locSet?: {
            mode: string;
            type: string;
            name: string;
            incluedNo: boolean;
            defaultValue: any;
            options?: {
                value: string;
                name: string;
            }[]
        }[];
        largeIcon?:{
            quotaSelectEnable?: boolean;
            quotaSelect: {
                mode: string;
                name: string;
                incluedNo: boolean;
                defaultValue: any;
            };
            limitNum: number;
            expandSet: boolean;
            expandSetContent: {
                keyString: string;
                needOrder: boolean;
                needDelete: boolean;
                needEdict: boolean;
            };
            associatedEnable: boolean;
            associatedContent: {
                type: string;
                name: string;
                incluedNo: boolean;
                defaultValue: any;
                valueListSelect: boolean;
            }
        };
        chart?: {
            quotaSelectEnable?: boolean;
            quotaSelect: {
                mode: string;
            };
            limitNum: number;
            expandSet: boolean;
            expandSetContent: {
                needOrder: boolean;
                needDelete: boolean;
                needEdict: boolean;
            }
        }
    }[]
} => {
    return {
    [keyStringMap.STATISTICS]: [{
        location: "universal",
        locNameShow: false,
        checkable: false,
        locSetEnable: false,
        quotaSelectEnable: true,
        quotaSelect: {
            mode:'treeSelect',
        },
        limitNum : 30,
        expandSet: true,
        expandSetContent: {
            needOrder: true,
            needDelete: true,
            needEdict: true
        }
    }],
    [keyStringMap.FILTER]:[{
        location: "universal",
        locNameShow: false,
        checkable: false,
        locSetEnable: false,
        quotaSelectEnable: true,
        quotaSelect: {
            mode:'multipleSelect',
            type:'select',
            name: msgConvert('filterType'),
            incluedNo: true,
            defaultValue: null
        },
        limitNum: 1,
        expandSet: true,
        expandSetContent: {
            keyString: keyStringMap.VALUE_LIST_STYLE,
            needOrder: false,
            needDelete: false,
            needEdict: false
        }
    }],
    [keyStringMap.CARD]: [
        {
            location: "titleRight",
            locNameShow: true,
            name: msgConvert('titleRight'),
            checkable: true,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'singleSelect',
                type:'select',
                name: msgConvert('informationType'),
                incluedNo: true,
                defaultValue: null,
            },
            limitNum: 1,
            expandSet: true,
            expandSetContent: {
                needOrder: true,
                needDelete: true,
                needEdict: true
            },
        },{
            location: "titleLeft",
            locNameShow: true,
            name: msgConvert('titleLeft'),
            checkable: false,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'singleSelect',
                type:'select',
                name: msgConvert('stateType'),
                incluedNo: true,
                defaultValue: null
            },
            limitNum: 1,
            expandSet: true,
            expandSetContent: {
                keyString: keyStringMap.VALUE_LIST_STYLE,
                needOrder: false,
                needDelete: false,
                needEdict: false
            }
        },{
            location: "quota",
            locNameShow: true,
            locAddition: true,
            name: msgConvert("quotaShow"),
            checkable: true,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'treeSelect',
            },
            limitNum: 6,
            expandSet: true,
            expandSetContent: {
                needOrder: true,
                needDelete: true,
                needEdict: true
            },
        },{
            location: "overview",
            locNameShow: true,
            name: msgConvert("overview"),
            checkable: false,
            locSetEnable: true,
            locSet: [{
                mode:'select',
                type:'type',
                name: msgConvert('overviewStyle'),
                incluedNo: false,
                defaultValue: 'largeIcon',
                options: [{
                    value:"largeIcon",
                    name:msgConvert("largeIcon")
                },{
                    value: "chart",
                    name: msgConvert("chart")
                }]
            }],
            largeIcon:{
                quotaSelectEnable: true,
                quotaSelect: {
                    mode:'singleSelect',
                    name: msgConvert('stateType'),
                    incluedNo: true,
                    defaultValue: null
                },
                limitNum: 1,
                expandSet: true,
                expandSetContent: {
                    keyString: keyStringMap.VALUE_LIST_STYLE,
                    needOrder: false,
                    needDelete: false,
                    needEdict: false
                },
                associatedEnable: true,
                associatedContent: {
                    type:'associated',
                    name: msgConvert('associated'),
                    incluedNo: true,
                    defaultValue: null,
                    valueListSelect: true,
                }
            },
            chart: {
                quotaSelectEnable: true,
                quotaSelect: {
                    mode:'treeSelect',
                },
                limitNum: 3,
                expandSet: true,
                expandSetContent: {
                    needOrder: true,
                    needDelete: true,
                    needEdict: true
                }
            }
        },
        {
            location: "statistics",
            locNameShow: true,
            name: msgConvert("statisticsShow"),
            checkable: true,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'treeSelect',
            },
            limitNum: 12,
            expandSet: true,
            expandSetContent: {
                needOrder: true,
                needDelete: true,
                needEdict: true
            }
        },{
            location: "flicker",
            locNameShow: true,
            name: msgConvert("flickerShow"),
            checkable: true,
            locSetEnable: false,
            quotaSelectEnable: false,
            expandSet: false
        },{
            location: "divide",
            locNameShow: false,
            checkable: false,
            locSetEnable: true,
            locSet: [{
                mode:'select',
                type:'divideType',
                name: msgConvert('divideType'),
                incluedNo: true,
                defaultValue: null,
                options: [{
                    value:"farm",
                    name:msgConvert("farm")
                },{
                    value: "feeder",
                    name: msgConvert("feeder")
                }]
            }],
            quotaSelectEnable: false,
            expandSet: false
        },{
            location: "cardSize",
            locSetEnable: true,
            locSet: [{
                mode:'input',
                type:'cardSize',
                name: msgConvert('cardSize'),
                incluedNo: true,
                defaultValue: TOKEN_SIZE.default,
                max: TOKEN_SIZE.max,
                min: TOKEN_SIZE.min
            }],
        }
    ].filter((locData => {return (isFarm ? farmCardItems: deviceCardItems).indexOf(locData.location) > -1})),
    [keyStringMap.GRID]: [
        {
            location: "universal",
            locNameShow: false,
            name: msgConvert("quotaShow"),
            checkable: false,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'treeSelect',
            },
            limitNum: -1,
            expandSet: true,
            expandSetContent: {
                needOrder: true,
                needDelete: true,
                needEdict: true
            }
        }
    ]
}}

export const styleSetContent = {
    statistics: {
        universal:{
            yc: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    name: msgConvert('color'),
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }]
                ,[{
                    mode: 'condition',
                    type:'convert'
                }]
            ],
            yx: [  
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    name: msgConvert('color'),
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }],
            ],
            other: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    name: msgConvert('color'),
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }],
            ]
        }
    },
    card:{
        titleLeft:{
            yx:[
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }]],
            yc:[],
            other:[]
        },
        titleRight:{
            yx: [],
            yc: [[{
                mode: 'condition',
                type:'convert'
            }]],
            other: [[{
                mode: 'condition',
                type:'convert'
            }]]
        },
        overview:{
            yc:[
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('style'),
                    mode: 'select',
                    incluedNo: false,
                    defaultValue: 'line',
                    type: 'chartType',
                },{
                    mode: 'color',
                    defaultValue: null,
                    type: 'color',
                }]
            ],
            yx:[
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }]],
            other: []
        },
        quota: {
            yc: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('style'),
                    mode: 'select',
                    incluedNo: false,
                    defaultValue: null,
                    options: [{
                        name: msgConvert('defaultStyle'),
                        value: null
                    },{
                        name: msgConvert('barStyle'),
                        value: CommonDynPattern.BAR
                    }],
                    type:'pattern'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'defaultColor'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],
                [{
                    mode: 'condition',
                    type:'ycCondition'

                }],[{
                    mode: 'condition',
                    type:'convert'
                }]
            ],
            yx: [  
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    mode: 'condition',
                    type:'yxCondition'
                }]
            ],
            other: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    name: msgConvert('color'),
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }],
            ]
        },
        statistics: {
            yc: [
                // [{
                //     name: msgConvert('edictName'),
                //     mode: 'input',
                //     defaultValue: '',
                //     type: isZh ? 'edictNameCn': 'edictNameEn'
                // }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }]
            ]
        }
    },
    grid:{
        universal: {
            yc: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    mode: 'condition',
                    type:'ycCondition'
                }],[{
                    mode: 'condition',
                    type:'convert'
                }]
            ],
            yx: [  
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    mode: 'condition',
                    type:'yxCondition'
                }]
            ],
            other: [
                [{
                    name: msgConvert('edictName'),
                    mode: 'input',
                    defaultValue: '',
                    type: isZh ? 'edictNameCn': 'edictNameEn'
                }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                }],[{
                    name: msgConvert('color'),
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }]
            ]
        }
    },
    filter: {
        universal:{
            yc: [],
            yx: [
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'color'
                }],[{
                    name: msgConvert('dataSource'),
                    mode: 'select',
                    incluedNo: true,
                    type: 'dataSource',
                    needbaseInform: true
                }]],
            other: []
        }
    }
}