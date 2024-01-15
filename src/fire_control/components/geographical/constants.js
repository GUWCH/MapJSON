import {msg, isZh} from '../../constants';
import { InputTextSize } from '@/common/constants';

export const KEY = 'geographical';

export const FIRE_M_TYPE = '30';

export const BASE_SIZE = {  // 画布标准大小
    width: 517,
    height: 558
}

export const getImageSize = (num) => {
    if(num < 10){
        return {
            width: 200,
            height: 175,
            colNum: 3,
            rowNum: 3
        }
    }else if(num < 17){
        return {
            width: 160,
            height: 140,
            colNum: 4,
            rowNum: 4
        }
    }else if(num < 26){
        return {
            width: 136,
            height: 119,
            colNum: 5,
            rowNum: 5
        }
    }else if(num < 37){
        return {
            width: 120,
            height: 105,
            colNum: 6,  // 6列
            rowNum: 6   // 6行
        }
    }else if(num < 49){
        return {
            width: 100,
            height: 87.5,
            colNum: 8,
            rowNum: 6
        }
    }else{
        return {
            width: 93,
            height: 72,
            colNum: 9
        }
    }
}

export const mockSubsystems = [{
    alias: "SXCN.ESS01.CESS",
    display_name: "濉溪储能1号子系统",
    full_name: "濉溪储能 濉溪储能1号子系统",
    id: "444003221",
    level: "4",
    link_id: "430003298",
    name: "濉溪储能1号子系统集装箱",
    node_type: "22",
    order_no: "2597",
    pid: "444003220"

},{
    alias: "SXCN.ESS02.CESS",
    display_name: "濉溪储能2号子系统",
    full_name: "濉溪储能 濉溪储能2号子系统",
    id: "444003237",
    level: "4",
    link_id: "430003313",
    name: "濉溪储能号2子系统集装箱",
    node_type: "22",
    order_no: "2613",
    pid: "444003236"
},{
    alias: "SXCN.ESS03.CESS",
    display_name: "濉溪储能3号子系统",
    full_name: "濉溪储能 濉溪储能3号子系统",
    id: "444003249",
    level: "4",
    link_id: "430003324",
    name: "濉溪储能3号子系统集装箱",
    node_type: "22",
    order_no: "2625",
    pid: "444003248"
},{
    alias: "SXCN.ESS04.CESS",
    display_name: "濉溪储能4号子系统",
    full_name: "濉溪储能 濉溪储能4号子系统",
    id: "444003265",
    level: "4",
    link_id: "430003339",
    name: "濉溪储能4号子系统集装箱",
    node_type: "22",
    order_no: "2641",
    pid: "444003264"
},{
    alias: "SXCN.ESS05.CESS",
    display_name: "濉溪储能5号子系统",
    full_name: "濉溪储能 濉溪储能5号子系统",
    id: "444003281",
    level: "4",
    link_id: "430003354",
    name: "Test5号子系统集装箱",
    node_type: "22",
    order_no: "2657",
    pid: "444003280"
},{
    alias: "SXCN.ESS06.CESS",
    display_name: "濉溪储能1号子系统",
    full_name: "濉溪储能 濉溪储能1号子系统",
    id: "444003221",
    level: "4",
    link_id: "430003298",
    name: "濉溪储能1号子系统集装箱",
    node_type: "22",
    order_no: "2597",
    pid: "444003220"

},{
    alias: "SXCN.ESS07.CESS",
    display_name: "濉溪储能2号子系统",
    full_name: "濉溪储能 濉溪储能2号子系统",
    id: "444003237",
    level: "4",
    link_id: "430003313",
    name: "濉溪储能号2子系统集装箱",
    node_type: "22",
    order_no: "2613",
    pid: "444003236"
},{
    alias: "SXCN.ESS08.CESS",
    display_name: "濉溪储能3号子系统",
    full_name: "濉溪储能 濉溪储能3号子系统",
    id: "444003249",
    level: "4",
    link_id: "430003324",
    name: "濉溪储能3号子系统集装箱",
    node_type: "22",
    order_no: "2625",
    pid: "444003248"
},{
    alias: "SXCN.ESS09.CESS",
    display_name: "濉溪储能4号子系统",
    full_name: "濉溪储能 濉溪储能4号子系统",
    id: "444003265",
    level: "4",
    link_id: "430003339",
    name: "濉溪储能4号子系统集装箱",
    node_type: "22",
    order_no: "2641",
    pid: "444003264"
}
// ,{
//     alias: "SXCN.ESS10.CESS",
//     display_name: "濉溪储能5号子系统",
//     full_name: "濉溪储能 濉溪储能5号子系统",
//     id: "444003281",
//     level: "4",
//     link_id: "430003354",
//     name: "Test5号子系统集装箱",
//     node_type: "22",
//     order_no: "2657",
//     pid: "444003280"
// }
];

export const LIMIT_NUM = 5;

export const defaultPointProps = {
    edictNameCn:'', 
    edictNameEn: '', 
    icon: '',
    color: '', 
    convert: {}
}

export const pointTypes = [
    {typeKey: 'YC', noList: ['62'], name: msg('yc')},
    {typeKey: 'YX', noList: ['61'], name: msg('yx')},
    {typeKey: 'DD', noList: ['35'], name: msg('dd')},

]

export const otherType = {typeKey: 'OTHER', name: msg('other')};

export const yxItemDropDown = [
    {
        name: msg('color'),
        members: [
            {
                component: 'colorPick',
                key: 'color',
            }
        ]
    }
]

export const getPointDropDown = (point) => {
    const {table_no, const_name_list = []} = point;

    return table_no == '61' ? [
        {
            name: msg('showName'),
            members: [
                {
                    component: 'input',
                    key: isZh ? 'edictNameCn' : 'edictNameEn',
                    maxLength: InputTextSize.Simple
                }
            ]
        }
    ] : [
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