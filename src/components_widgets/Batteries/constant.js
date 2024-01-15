import Intl, { msgTag } from '@/common/lang';
export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export const DEFAULT_PKNUM = 12;

export const SLOT = '--';

export const MODE_LIST = [
    {
        label: msg('BATTERIES.full'),
        value: 'full'
    },{
        label: msg('BATTERIES.extremum'),
        value: 'extremum'
    }
]

export const VOL_TEMP = [
    {
        value: 'voltage',
        name: msg('BATTERIES.vol'),
        unit: 'V',
        labels: ['3.6', '3.4', '3.2', '3.0']
    },{
        value: 'temperature',
        name: msg('BATTERIES.temp'),
        unit: '℃',
        labels: ['50.0', '37.5', '25.0', '12.5', '0']
    }
]

export const DIRECTIONS = [{
    value: 'row',
    label: msg('BATTERIES.row'),
},{
    value: 'column',
    label: msg('BATTERIES.col'),
}]

//mock组态配置
export const tempMock = {
    pack: {
        alias: 'RB.PkNum',
        field_no: 62,
        table_no: 9
    },
    modes: [
    {
        mode: 'full',
        contentTypes: [{
            type: 'voltage',
            point: {
                alias: 'RB.CelVolt',
                field_no: 62,
                table_no: 9
            },
            colNum: 4,
            direction: 'row',
            textColor: '#ffffff',
            minMaxColor: ['rgba(29, 205, 245, 1)', 'rgba(0, 80, 120, 1)'],
        },{
            type: 'temperature',
            point: {
                alias: 'RB.CelTmp',
                field_no: 62,
                table_no: 9
            },
            colNum: 4,
            direction: 'row',
            textColor: '#ffffff',
            minMaxColor: ['rgba(255, 181, 41, 1)', 'rgba(168, 67, 0, 1)'],
        }]
    }
]}

export const mockData1 = {
    "SXCN.ESS02.BBMS01.RB.CelTmp": [
        {
            "value": 41,
            "name": 0,
            "status": 0
        },
        {
            "value": 42,
            "name": 1,
            "status": 0
        },
        {
            "value": 43,
            "name": 2,
            "status": 0
        },
        {
            "value": 44,
            "name": 3,
            "status": 0
        },
        {
            "value": 43,
            "name": 4,
            "status": 0
        },
        {
            "value": 43,
            "name": 5,
            "status": 0
        },
        {
            "value": 43,
            "name": 6,
            "status": 0
        },
        {
            "value": 43,
            "name": 7,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 41,
            "name": 0,
            "status": 0
        },
        {
            "value": 42,
            "name": 1,
            "status": 0
        },
        {
            "value": 43,
            "name": 2,
            "status": 0
        },
        {
            "value": 44,
            "name": 3,
            "status": 0
        },
        {
            "value": 43,
            "name": 4,
            "status": 0
        },
        {
            "value": 43,
            "name": 5,
            "status": 0
        },
        {
            "value": 43,
            "name": 6,
            "status": 0
        },
        {
            "value": 43,
            "name": 7,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        }
    ],
    "SXCN.ESS02.BBMS01.RB.CelVolt": [
        {
            "value": 43,
            "name": 0,
            "status": 0
        },
        {
            "value": 43,
            "name": 1,
            "status": 0
        },
        {
            "value": 43,
            "name": 2,
            "status": 0
        },
        {
            "value": 43,
            "name": 3,
            "status": 0
        },
        {
            "value": 43,
            "name": 4,
            "status": 0
        },
        {
            "value": 43,
            "name": 5,
            "status": 0
        },
        {
            "value": 43,
            "name": 6,
            "status": 0
        },
        {
            "value": 43,
            "name": 7,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 43,
            "name": 12,
            "status": 0
        },
        {
            "value": 43,
            "name": 13,
            "status": 0
        },
        {
            "value": 43,
            "name": 14,
            "status": 0
        },
        {
            "value": 43,
            "name": 15,
            "status": 0
        },
        {
            "value": 43,
            "name": 16,
            "status": 0
        },
        {
            "value": 43,
            "name": 17,
            "status": 0
        },
        {
            "value": 43,
            "name": 18,
            "status": 0
        },
        {
            "value": 43,
            "name": 19,
            "status": 0
        },
        {
            "value": 43,
            "name": 20,
            "status": 0
        },
        {
            "value": 43,
            "name": 21,
            "status": 0
        },
        {
            "value": 43,
            "name": 22,
            "status": 0
        },
        {
            "value": 43,
            "name": 23,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 43,
            "name": 8,
            "status": 0
        },
        {
            "value": 43,
            "name": 9,
            "status": 0
        },
        {
            "value": 43,
            "name": 10,
            "status": 0
        },
        {
            "value": 43,
            "name": 11,
            "status": 0
        },
        {
            "value": 10,
            "name": 8,
            "status": 0
        },
        {
            "value": 21,
            "name": 9,
            "status": 0
        },
        {
            "value": 37,
            "name": 10,
            "status": 0
        },
        {
            "value": 10,
            "name": 11,
            "status": 0
        }
    ]
}

export const mockData = [
    {
        "value": 2,
        "name": 0,
        "status": 0
    },
    {
        "value": 42,
        "name": 1,
        "status": 0
    },
    {
        "value": 43,
        "name": 2,
        "status": 0
    },
    {
        "value": 44,
        "name": 3,
        "status": 0
    },
    {
        "value": 43,
        "name": 4,
        "status": 0
    },
    {
        "value": 43,
        "name": 5,
        "status": 0
    },
    {
        "value": 43,
        "name": 6,
        "status": 0
    },
    {
        "value": 43,
        "name": 7,
        "status": 0
    },
    {
        "value": 43,
        "name": 8,
        "status": 0
    },
    {
        "value": 43,
        "name": 9,
        "status": 0
    },
    {
        "value": 43,
        "name": 10,
        "status": 0
    },
    {
        "value": 43,
        "name": 11,
        "status": 0
    },
    {
        "value": 43,
        "name": 8,
        "status": 0
    },
    {
        "value": 43,
        "name": 9,
        "status": 0
    },
    {
        "value": 43,
        "name": 10,
        "status": 0
    },
    {
        "value": 43,
        "name": 11,
        "status": 0
    },
    {
        "value": 41,
        "name": 0,
        "status": 0
    },
    {
        "value": 42,
        "name": 1,
        "status": 0
    },
    {
        "value": 43,
        "name": 2,
        "status": 0
    },
    {
        "value": 44,
        "name": 3,
        "status": 0
    },
    {
        "value": 43,
        "name": 4,
        "status": 0
    },
    {
        "value": 43,
        "name": 5,
        "status": 0
    },
    {
        "value": 43,
        "name": 6,
        "status": 0
    },
    {
        "value": 43,
        "name": 7,
        "status": 0
    },
    {
        "value": 43,
        "name": 8,
        "status": 0
    },
    {
        "value": 43,
        "name": 9,
        "status": 0
    },
    {
        "value": 43,
        "name": 10,
        "status": 0
    },
    {
        "value": 43,
        "name": 11,
        "status": 0
    },
    {
        "value": 43,
        "name": 8,
        "status": 0
    },
    {
        "value": 43,
        "name": 9,
        "status": 0
    },
    {
        "value": 43,
        "name": 10,
        "status": 0
    },
    {
        "value": 43,
        "name": 11,
        "status": 0
    },
    {
        "value": 43,
        "name": 8,
        "status": 0
    },
    {
        "value": 43,
        "name": 9,
        "status": 0
    },
    {
        "value": 43,
        "name": 10,
        "status": 0
    },
    {
        "value": 43,
        "name": 11,
        "status": 0
    }
];

export const DEFAULT_FULL_CONTENT = [{
    type: 'voltage',
    point: null,
    colNum: 4,
    direction: 'row',
    textColor: '#ffffff',
    minMaxColor: ['rgba(29, 205, 245, 1)', 'rgba(0, 80, 120, 1)'],
},{
    type: 'temperature',
    point: null,
    colNum: 4,
    direction: 'row',
    textColor: '#ffffff',
    minMaxColor: ['rgba(255, 181, 41, 1)', 'rgba(168, 67, 0, 1)'],
}]