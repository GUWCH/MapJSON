import {msg, isZh} from '../../constants';
import { InputTextSize } from '@/common/constants';

export const KEY = 'statistics';

export const LIMIT_NUM = 6;

export const defaultPointProps = {
    edictNameCn:'', 
    edictNameEn: '', 
    icon: '',
    color: '', 
    convert: {}
}

export const defaultStyle = [
    {
        color: 'rgba(0, 122, 81, 0.4)',
    },{
        color: 'rgba(0, 122, 81, 0.4)',
    },{
        color: 'rgba(109, 42, 66, 0.7)',
    },{
        color: 'rgba(109, 42, 66, 0.7)',
    },{
        color: 'rgba(253, 133, 26, 0.4)',
    },{
        color: 'rgba(253, 133, 26, 0.4)',
    }
]

export const pointTypes = [
    {typeKey: 'YC', noList: ['62'], name: msg('yc')},

]

export const pointDropDown = [
    {
        name: msg('showName'),
        members: [
            {
                component: 'input',
                key: isZh ? 'edictNameCn' : 'edictNameEn',
                maxLength: InputTextSize.Simple
            }
        ]
    },
    {
        name: msg('style'),
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
    // {
    //     members: [
    //         {
    //             component: 'condition',
    //             type: 'convert',
    //             key: 'convert',
    //         }
    //     ]
    // }
];