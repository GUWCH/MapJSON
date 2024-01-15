import { msgTag } from '@/common/lang';

export const msg = msgTag('datalistnew');

export const msgConvert = (str) => {
    return msg('config.' + str);
}

export const addConditions = {
    convert: {
        name: msgConvert('convert'),
        text: `+ ${msgConvert('addConvert')}`,
        expandable: true,
        keyString: 'convert',
        conditionTypes: [{
            key:'coefficientAndUnit',
            name: msgConvert('coefficientAndUnit'),
            content_list:[{
                editKey: 'coefficient',
                editName: msgConvert('coefficient'),
                editType: 'coefficient',
                defaultValue: ''
            },{
                editKey: 'unit',
                editName: msgConvert('unit'),
                editType: 'unit',
                defaultValue: ''
            }],
        },{
            key:'decimal',
            name: msgConvert('decimal'),
            content_list:[{
                editKey: 'decimal',
                editName: msgConvert('decimal'),
                editType: 'decimal',
                defaultValue: 2,
                min: 0,
                max: 3
            }],
        }]
    },
    ycCondition: {
        name: msgConvert('condition'),
        text: `+ ${msgConvert('addCondition')}`,
        expandable: false,
        keyString:'condition',
        conditionTypes: [{
            key:'style',
            name: msgConvert('condition'),
            content_list:[{
                editKey: 'min',
                editName: "",
                editType: 'range',
                defaultValue: ''
            },{
                editKey: 'max',
                editName: "",
                editType: 'range',
                defaultValue: ''
            },{
                editKey: 'color',
                editName: "",
                editType: 'color',
                defaultValue: null
            }],
        }]
    },
    yxCondition: {
        name: msgConvert('condition'),
        text: `+ ${msgConvert('addCondition')}`,
        expandable: false,
        keyString: 'condition',
        conditionTypes: [{
            key:'style',
            name: msgConvert('condition'),
            content_list:[{
                editKey: 'value',
                editName: "",
                editType: 'yxValue',
                incluedNo: false
            },{
                editKey: 'icon',
                editName: "",
                editType: 'icon',
                incluedNo: true,
                defaultValue: null
            },{
                editKey: 'color',
                editName: "",
                editType: 'color',
                defaultValue: null
            }],
        }]
    },
    yxConditionIconBg: {
        name: msgConvert('condition'),
        text: `+ ${msgConvert('addCondition')}`,
        expandable: false,
        keyString: 'condition',
        conditionTypes: [{
            key:'style',
            name: msgConvert('condition'),
            content_list:[{
                editKey: 'value',
                editName: "",
                editType: 'yxValue',
                incluedNo: false
            },{
                editKey: 'icon',
                editName: "",
                editType: 'icon',
                incluedNo: true,
                defaultValue: null
            },{
                editKey: 'background',
                editName: "",
                editType: 'color',
                defaultValue: null
            }],
        }]
    }
}