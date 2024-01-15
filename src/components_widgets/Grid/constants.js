import Intl, { msgTag } from '@/common/lang';

export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const TYPES = [
    {
        name: msg('GRID.text'),
        value: 'text'
    },
    {
        name: msg('GRID.point'),
        value: 'point'
    }
]

export const ALIGNS = [
    {
        name: msg('GRID.left'),
        value: 'left'
    },
    {
        name: msg('GRID.center'),
        value: 'center'
    },
    {
        name: msg('GRID.right'),
        value: 'right'
    }
]

export const DIRECTIONS = [
    {
        label: msg('GRID.horizontal'),
        value: 'horizontal'
    },
    {
        label: msg('GRID.vertical'),
        value: 'vertical'
    }
]

export const DEFAULT_MEMORY_CFG = {
    titleEnable: true,
    titleTextEn: '',
    titleTextCn: '',
    grid: []
}

export const DEFAULT_GRID_ITEM_CFG = {
    type: 'text',
    textEn: '',
    textCn: '',
    icon: '',
    color: '',
    unit: '',
    align: 'right'
}

export const getPointDropDown = (type) => {
    const base = [
        {
            name: msg('GRID.showName'),
            members: [
                {
                    component: 'input',
                    key: isZh ? 'edictNameCn' : 'edictNameEn',
                }
            ]
        }
    ];

    switch(type){
        case 'YX': 
            return [
                {
                    name: msg('GRID.style'),
                    members: [
                        {
                            component: 'select',
                            type: 'icon',
                            key: 'icon',
                        },
                        {
                            component: 'colorPick',
                            key: 'color',
                        }
                    ]
                }
            ]
        case 'YC_DD':
            return [].concat(
                [{
                    members: [
                        {
                            component: 'condition',
                            type: 'ycCondition',
                            key: 'ycCondition',
                        }
                    ]
                },{
                    members: [
                        {
                            component: 'condition',
                            type: 'convert',
                            key: 'convert',
                        }
                    ]
                }]
            )
    }
    
    return base;
};

export const TYPE_SET = [{
    name: msg('GRID.type'),
    members: [
        {
            component: 'select',
            options: TYPES,
            key: 'type',
        }
    ]
}]

export const ALIGN_SET = [
{
    name: msg('GRID.style'),
    members: [
        {
            component: 'input',
            type: 'number',
            key: 'fontSize'
        },
        {
            component: 'BoldOutlined',
            key: 'fontWeight',
        },
    ]
},{
    name: msg('GRID.align'),
    members: [
        {
            component: 'select',
            options: ALIGNS,
            key: 'align',
        }
    ]
}]

export const TEXT_SET = [
    {
        name: msg('GRID.type'),
        members: [
            {
                component: 'select',
                options: TYPES,
                key: 'type',
            }
        ]
    },
    {
        name: msg('GRID.textContent'),
        members: [{
            component: 'input',
            key: isZh ? 'textCn' : 'textEn'
        }]
    },
    {
        name: msg('GRID.unit'),
        members: [{
            component: 'input',
            key: 'unit'
        }]
    },
    {
        name: msg('GRID.style'),
        members: [
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
        ]
    },
    {
        name: msg(''),
        members: [
            {
                component: 'input',
                type: 'number',
                key: 'fontSize'
            },
            {
                component: 'BoldOutlined',
                key: 'fontWeight',
            },
        ]
    },
    {
        name: msg('GRID.align'),
        members: [
            {
                component: 'select',
                options: ALIGNS,
                key: 'align',
            }
        ]
    }
]

export const WIDGET_SET = [
    {
        name: msg('GRID.showTitle'),
        members: [
            {
                component: 'check',
                key: 'titleEnable',
            }
        ]
    },
    {
        name: msg('GRID.title'),
        members: [{
            component: 'input',
            key: isZh ? 'titleTextCn' : 'titleTextEn'
        }]
    }
]

export const getPointType = (tableNo) => {
    if(tableNo == '61'){
        return 'YX';
    }else if(tableNo == '35' || tableNo == '62'){
        return 'YC_DD';
    }else{
        return '';
    }
}