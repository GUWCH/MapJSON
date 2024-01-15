import Intl, { msgTag } from '@/common/lang';
import { InputTextSize } from '@/common/constants';

const msg = msgTag('pagetpl');
const isZh = Intl.isZh;

export const getQuotaKey = (ele) => {
    let {table_no = '', alias = '', field_no = ''} = ele;
    return table_no + ":" + alias + ":" + field_no;
}

export const DEFAULT_MEMORY_CFG = {
    titleEnable: true,
    titleTextEn: '',
    titleTextCn: '',
    items: []
}

export const WIDGET_SET = [
    {
        name: msg('OVERVIEW.showTitle'),
        members: [
            {
                component: 'check',
                key: 'titleEnable',
            }
        ]
    },
    {
        name: msg('OVERVIEW.title'),
        members: [{
            component: 'input',
            key: isZh ? 'titleTextCn' : 'titleTextEn',
            maxLength: InputTextSize.Simple
        }]
    }
]

export const TYPES = [
    // {
    //     label: msg('OVERVIEW.icon'),
    //     value: 'icon'
    // },
    {
        label: msg('OVERVIEW.droplet'),
        value: 'droplet'
    },
    // {
    //     label: msg('OVERVIEW.progressBar'),
    //     value: 'progressBar'
    // }
]

export const FONTS = [
    {
        label: msg('OVERVIEW.defaultFont'),
        value: 'defaultFont'
    },
    {
        label: msg('OVERVIEW.dsDigitalFont'),
        value: 'dsDigitalFont'
    }
]

export const SHOW_TYPES = {
    icon: {
        type: 'icon',
        defaulColNum: 2,
        limitNum: 4,
        name: msg('OVERVIEW.icon')
    },
    droplet: {
        type: 'droplet',
        defaulColNum: 2,
        limitNum: 2,
        name: msg('OVERVIEW.droplet')
    },
    progressBar: {
        type: 'progressBar',
        defaulColNum: 1,
        limitNum: 1,
        name: msg('OVERVIEW.progressBar')
    }
}

export const defaultStyle = [
    {
        color: 'rgba(0,219,255,0.7)',
        icon: 'GRID'
    },{
        color: 'rgba(88,245,192,0.7)',
        icon: 'ELETRICITY'
    },{
        color: 'rgba(142,133,255,0.7)',
        icon: 'HEALTH_CIRCLE'
    },{
        color: 'rgba(255,181,0,0.7)',
        icon: 'ELETRICITY_DOWN'
    },{
        color: 'rgba(245,10,34,0.7)',
        icon: 'CAPACITY'
    },{
        color: 'rgba(188,190,209,0.7)',
        icon: 'HEALTH_LINE'
    }
]

export const defaultPointProps = {
    edictNameCn:'', 
    edictNameEn: '', 
    icon: '',
    color: '', 
    convert: {}
}

export const pointTypes = [
    {typeKey: 'YC', noList: ['62'], name: msg('OVERVIEW.yc')},
    {typeKey: 'YX', noList: ['61'], name: msg('OVERVIEW.yx')},
    {typeKey: 'DD', noList: ['35'], name: msg('OVERVIEW.dd')},

]

export const otherType = {typeKey: 'OTHER', name: msg('OVERVIEW.other')};

export const getPointDropDown = (needConvert, needIcon = true) => {
    const base: any[] = [
        {
            name: msg('OVERVIEW.showName'),
            members: [
                {
                    component: 'input',
                    key: isZh ? 'edictNameCn' : 'edictNameEn',
                    maxLength: InputTextSize.Simple
                }
            ]
        },
        {
            name: msg('OVERVIEW.style'),
            members: needIcon ? [
                {
                    component: 'select',
                    type: 'icon',
                    key: 'icon',
                    incluedNo: true
                },
                {
                    component: 'colorPick',
                    key: 'color',
                }
            ] : [
                    {
                    component: 'colorPick',
                    key: 'color',
                }
            ]
        }
    ];

    if(needConvert){
        return base.concat([{
            members: [
                {
                    component: 'condition',
                    type: 'convert',
                    key: 'convert',
                }
            ]
        }]);
    }else{
        return base;
    }
};