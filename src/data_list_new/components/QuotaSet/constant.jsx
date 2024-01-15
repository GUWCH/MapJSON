import { msgTag } from '@/common/lang';
import { keyStringMap } from '../../constants';

export const msg = msgTag('datalistnew');

export const msgConvert = (str) => {
    return msg('config.' + str);
}

export const STATISTICS_MAX_COL = 6;

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
            }
        ]
    }
}

export const farmCardItems = ['titleLeft', 'titleRight', 'overview', 'quota', 'statistics'];
export const deviceCardItems = ['titleLeft', 'titleRight', 'overview', 'quota', 'flicker', 'divide'];

export const getLocationContent = (isFarm) => {
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
            mode:'singleSelect',
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
            location: "titleLeft",
            locNameShow: true,
            name: msgConvert('titleLeft'),
            checkable: false,
            locSetEnable: false,
            quotaSelectEnable: true,
            quotaSelect: {
                mode:'singleSelect',
                type:'select',
                name: msgConvert('labelType'),
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
            expandSet: false,
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
                limitNum: 2,
                expandSet: true,
                expandSetContent: {
                    needOrder: true,
                    needDelete: true,
                    needEdict: true
                }
            }
        },{
            location: "quota",
            locNameShow: true,
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
        },
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
                    mode: 'condition',
                    type:'yxCondition'
                }]
            ],
            other: [
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
                    type:'color_pick'
                }],
            ]
        }
    },
    card:{
        titleLeft:{
            yx:[[{
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
        },
        overview:{
            yc:[
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
            yx:[[{
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
                    mode: 'condition',
                    type:'yxCondition'
                }]
            ],
            other: [
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
                    type:'color_pick'
                }],
            ]
        },
        statistics: {
            yc: [[{
                name: msgConvert('icon'),
                mode: 'select',
                incluedNo: true,
                defaultValue: null,
                type:'icon'
            },{
                mode: 'color',
                defaultValue: null,
                type:'color'
            }]]
        }
    },
    grid:{
        universal: {
            yc: [
                // [{
                //     name: msgConvert('style'),
                //     mode: 'select',
                //     incluedNo: false,
                //     defaultValue: 'number',
                //     type:'show_as'
                // }],
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    // type: 'IRON',
                    type:'icon'
                }],[{
                    // name: msgConvert('condition'),
                    mode: 'condition',
                    type:'ycCondition'
                }],[{
                    // name: msgConvert('convert'),
                    mode: 'condition',
                    // type: 'CONVERT',
                    type:'convert'
                }]
            ],
            yx: [  
                [{
                    // name: msgConvert('condition'),
                    mode: 'condition',
                    type:'yxCondition'
                }]
            ],
            other: [
                [{
                    name: msgConvert('icon'),
                    mode: 'select',
                    incluedNo: true,
                    defaultValue: null,
                    type:'icon'
                },{
                    mode: 'color',
                    defaultValue: null,
                    type:'color_pick'
                }],
            ]
        }
    },
    filter: {
        universal:{
            yc: [],
            yx: [[{
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
                    // defaultValue:{
                    //     alias: null,
                    // },
                    type: 'dataSource',
                    needbaseInform: true
                }]],
            other: []
        }
    }
}