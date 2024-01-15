import Intl, { msgTag } from '@/common/lang';
export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const LIGHT_CARD_OPTIONS = [
    {
       value: 'deviceLightCard',
       label: msg('LIGHT_CARD.deviceLightCard')
    }
]

const LIGHT_CARD_GROUPS = Array.from(new Array(10)).map((g, index) => ({
    value: String(index+1) ,
    label: msg('LIGHT_CARD.gz') + String(index+1)
}));


export const SET_CONTENT = [
    {
        key: 'type',
        desc: 'type',
        type: 'select',
        options: LIGHT_CARD_OPTIONS
    },
    {
        key: 'characterFilter',
        desc: 'characterFilter',
        type: 'switch',
        tip: msg('LIGHT_CARD.tipAssetFilter')
    },
    {
        key: 'group',
        desc: 'group',
        type: 'select',
        options: LIGHT_CARD_GROUPS,
        tip: msg('LIGHT_CARD.tipGroup'),

        //antd api
        mode: 'multiple' as 'multiple' | 'tags',
        maxTagCount: 1,
        allowClear: true
    },
    /* {
        key: 'alarmGrade',
        desc: 'alarmGrade',
        type: 'input',
    },
    {
        key: 'yxValue',
        desc: 'yxValue',
        type: 'input',
    }, */
    {
        key: 'sortType',
        desc: 'sortType',
        type: 'select',
        options: [
            {
                value: 'no_asc',
                label: msg('LIGHT_CARD.no_asc')
            },
            {
                value: 'no_desc',
                label: msg('LIGHT_CARD.no_desc')
            }/* ,
            {
                value: 'name_asc',
                label: msg('LIGHT_CARD.name_asc')
            },
            {
                value: 'name_desc',
                label: msg('LIGHT_CARD.name_desc')
            },
            {
                value: 'node_no_asc',
                label: msg('LIGHT_CARD.node_no_asc')
            },
            {
                value: 'node_no_desc',
                label: msg('LIGHT_CARD.node_no_desc')
            } */
        ],
        tip: msg('LIGHT_CARD.tipSort'),

        // antd api
        allowClear: true
    },
    {
        key: 'cardWidth',
        desc: 'cardWidth',
        type: 'inputNumber',
        min: 1,
        tip: msg('LIGHT_CARD.tipSort')
    },
    {
        key: 'cardHeight',
        desc: 'cardHeight',
        type: 'inputNumber',
        min: 1,
        tip: msg('LIGHT_CARD.tipWidthHeight')
    },
]