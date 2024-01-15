import Intl, { msgTag } from '@/common/lang';
import { InputTextSize } from '@/common/constants';
import { DropDownProps } from 'DropDown';

export const isZh = Intl.isZh;

export const msg = msgTag('pagetpl');
export const geoMsg = (str) => {
    return msg('GEOGRAPHY_DIST.' + str || '')
}

export const KEY = 'geographical';
export const BG_KEY = 'background';

export const FONT_FAMILY = 'scada_iconfont';

export const BASE_SIZE = {  // 画布标准大小
    width: 517,
    height: 558
}

export const LIMIT_NUM = 5;

export const defaultPointProps = {
    edictNameCn: '',
    edictNameEn: '',
    icon: '',
    color: '',
    convert: {}
}

export const pointTypes = [
    { typeKey: 'YC', noList: ['62'], name: geoMsg('yc') },
    { typeKey: 'YX', noList: ['61'], name: geoMsg('yx') },
    { typeKey: 'DD', noList: ['35'], name: geoMsg('dd') },

]

export const otherType = { typeKey: 'OTHER', name: geoMsg('other') };

export const yxItemDropDown: DropDownProps['content'] = [
    {
        name: geoMsg('style'),
        members: [
            {
                component: 'icon',
                key: 'icon',
            },
            {
                component: 'colorPick',
                key: 'color',
            }
        ]
    }
]

export const yxBgDropDown: DropDownProps['content'] = [
    {
        name: geoMsg('style'),
        members: [
            {
                component: 'colorPick',
                key: 'color',
            }
        ]
    }
]

export const getPointDropDown = (point): DropDownProps['content'] => {
    const { table_no, const_name_list = [] } = point;

    return table_no == '61' ? [
        {
            name: geoMsg('showName'),
            members: [
                {
                    component: 'input',
                    key: isZh ? 'edictNameCn' : 'edictNameEn',
                    maxLength: InputTextSize.Simple
                }
            ]
        },
        {
            members: [
                {
                    component: 'condition',
                    type: 'yxCondition',
                    key: 'yxCondition',
                    needIcon: false,
                    valueList: const_name_list.map((item) => {
                        return {
                            value: item.value,
                            name: isZh ? item.name : item.name_en
                        }
                    })
                }
            ]
        }
    ] : [
        {
            name: geoMsg('showName'),
            members: [
                {
                    component: 'input',
                    key: isZh ? 'edictNameCn' : 'edictNameEn',
                    maxLength: InputTextSize.Simple
                }
            ]
        },
        {
            members: [
                {
                    component: 'condition',
                    type: 'ycCondition',
                    key: 'ycCondition',
                }
            ]
        },
        {
            members: [
                {
                    component: 'condition',
                    type: 'convert',
                    key: 'convert',
                }
            ]
        }
    ];
}