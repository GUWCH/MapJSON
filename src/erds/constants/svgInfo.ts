/* eslint-disable */

type IAnimateInfo = {
    id: string;
    pathCoords: [number, number][];
    /**
     * 动画颜色
     */
    stroke: string;
    /**
     * 动画如果需要渐变而需要的层级叠加实现,如果没有渐变,赋值1
     */
    strokeGradientLayers: number;
    /**
     * 动画如果需要渐变而需要的层级叠加实现时每层偏移量
     */
    strokeGradientLayerOffset: number;
    /**
     * 动画线条长度
     */
    strokeLineLength: number;
    /**
     * 动画线条之间间隔长度
     */
    strokeLineSpaceLength: number;
    dur: number;
    begin?: string;
};
type IAnimateInfos = {
    wtgGeneration: IAnimateInfo[];
    solarGeneration: IAnimateInfo[];
    storage: IAnimateInfo[];
    loaderConsume: IAnimateInfo[];
    output: IAnimateInfo[];
    strokeLength: number;
    strokeInfo: {[k: string]: number | string};
    defs: {
        id: string;
        x1: number | string;
        y1: number | string;
        x2: number | string;
        y2: number | string;
        stops: {
            offset: number | string;
            'stop-color': string;
            'stop-opacity'?: number | string;
        }[];
    }[];
};

export default<IAnimateInfos> {
    // 风机发电
    wtgGeneration: [{
        id: 'wtgGeneration',
        pathCoords: [[1503, 310], [1882, 443], [894, 912], [694, 787]],
        stroke: '#48B97F',
        strokeGradientLayers: 20,
        strokeGradientLayerOffset: 10,
        strokeLineLength: 10,
        strokeLineSpaceLength: 650,
        dur: 4,
        begin: '0;generateProcess2.begin'
    }],
    // 光伏发电
    solarGeneration: [{
        id: 'solarGeneration',
        pathCoords: [[635, 593], [495, 647], [620, 733]],
        stroke: '#48B97F',
        strokeGradientLayers: 20,
        strokeGradientLayerOffset: 3,
        strokeLineLength: 3,
        strokeLineSpaceLength: 350,
        dur: 2,
        begin: '0;generateProcess2.begin'
    }],
    // 储能充放电
    storage: [{
        id: 'storageCharge',
        pathCoords: [[636, 882], [742, 835], [680, 793]],
        stroke: '#48B97F',
        strokeGradientLayers: 20,
        strokeGradientLayerOffset: 2,
        strokeLineLength: 1,
        strokeLineSpaceLength: 200,
        dur: 1,
        begin: '0;generateProcess2.begin'
    }],
    // 负载消耗
    loaderConsume: [{
        id: 'solarGeneration',
        pathCoords: [[599, 747], [180, 465], [534, 377]],
        stroke: '#48B97F',
        strokeGradientLayers: 20,
        strokeGradientLayerOffset: 5,
        strokeLineLength: 10,
        strokeLineSpaceLength: 650,
        dur: 3,
        begin: '0;generateProcess2.begin'
    }],
    // 并网输出输入
    output: [{
        id: 'output',
        pathCoords: [[610, 766], [150, 947]],
        stroke: '#FFFFFF',
        strokeGradientLayers: 20,
        strokeGradientLayerOffset: 5,
        strokeLineLength: 5,
        strokeLineSpaceLength: 550,
        dur: 1.5,
        begin: 'generateProcess1.end',
    }],

    // 光束属性
    strokeLength: 60,
    strokeInfo: {
        'stroke-opacity': 1,
        'stroke-width': 10,
        'stroke-linecap': 'round',
        'fill': 'none'
    },
    // 光束定义
    defs: [{
        id: 'EC1',
        x2: '100%',
        y2: '50.510152%',
        x1: '23.8432027%',
        y1: '49.7075105%',
        stops: [{
            offset: '0%', 
            'stop-color': '#48B97F'
        },{
            offset: '100%',
            'stop-color': '#47B97F',
            'stop-opacity': 0
        },{
            offset:'100%',
            'stop-color':'#FFFFFF',
            'stop-opacity': 0
        }]
    },{
        id: 'EC2',
        x1: '100%',
        y1: '50.510152%',
        x2: '23.8432027%',
        y2: '49.7075105%',
        stops: [{
            offset: '0%', 
            'stop-color': '#48B97F'
        },{
            offset: '100%',
            'stop-color': '#47B97F',
            'stop-opacity': 0
        },{
            offset:'100%',
            'stop-color':'#FFFFFF',
            'stop-opacity': 0
        }]
    },{
        id: 'EC3',
        x1: '100%',
        y1: '50.510152%',
        x2: '23.8432027%',
        y2: '49.7075105%',
        stops: [{
            offset: '0%', 
            'stop-color': '#FFFFFF'
        },{
            offset: '100%',
            'stop-color': '#FFFFFF',
            'stop-opacity': 0
        },{
            offset:'100%',
            'stop-color':'#FFFFFF',
            'stop-opacity': 0
        }]
    },{
        id: 'EC4',
        x2: '100%',
        y2: '50.510152%',
        x1: '23.8432027%',
        y1: '49.7075105%',
        stops: [{
            offset: '0%', 
            'stop-color': '#FFFFFF'
        },{
            offset: '100%',
            'stop-color': '#FFFFFF',
            'stop-opacity': 0
        },{
            offset:'100%',
            'stop-color':'#FFFFFF',
            'stop-opacity': 0
        }]
    }],

    // 风机发电(废弃)
    generation_deprecated: [{
        id: 'generateStart',
        coor: [1503, 310],
        stroke: 'EC2',
        begin: '0;generateProcess2.begin',
        dur: 1
    },{
        id: 'generateProcess1',
        coor: [1882, 443],
        stroke: 'EC1',
        begin: 'inherit',
        dur: 2
    },{
        id: 'generateProcess2',
        coor: [1388, 677.5],
        stroke: 'EC1',
        begin: 'inherit',
        dur: 2
    },{
        id: 'generateProcess3',
        coor: [894, 912],
        stroke: 'EC1',
        begin: 'inherit',
        dur: 1.5
    },{
        id: 'generateEnd',
        coor: [694, 787]
    }],
    // 并网输出(废弃)
    output_deprecated: [{
        id: 'outputStart',
        coor: [610, 766],
        stroke: 'EC4',
        begin: 'generateProcess1.end',
        dur: 1
    },{
        id: 'outputEnd',
        coor: [150, 947]
    }],
    // 储能充电(废弃)
    charge_deprecated: {
        c1: [{
            id: 'charge1Start',
            coor: [1030.5, 591.5],
            stroke: 'EC3',
            begin: 'outputStart.end',
            dur: 0.3
        },{
            id: 'charge1Process1',
            coor: [1125, 646],
            stroke: 'EC3',
            begin: 'inherit',
            dur: 0.3
        },{
            id: 'charge1End',
            coor: [1206, 690]
        }],
        c2: [{
            id: 'charge2Start',
            coor: [1125, 646],
            stroke: 'EC4',
            begin: 'charge1Start.end',
            dur: 0.3
        },{
            id: 'charge2Process1',
            coor: [1024, 693],
            stroke: 'EC3',
            begin: 'inherit',
            dur: 0.5
        },{
            id: 'charge2End',
            coor: [1105, 744]
        }]
    },
    // 储能放电(废弃)
    antiCharge_deprecated: {
        c1: [{
            id: 'antiCharge1Start',
            coor: [1206, 690],
            stroke: 'EC1',
            begin: 'antiCharge2Start.begin+0.1s',
            dur: 0.5
        },{
            id: 'antiCharge1Process1',
            coor: [1125, 646],
            stroke: 'EC1',
            begin: 'inherit',
            dur: 0.3
        },{
            id: 'antiCharge1End',
            coor: [1030.5, 591.5]
        }],
        c2: [{
            id: 'antiCharge2Start',
            coor: [1105, 744],
            stroke: 'EC1',
            begin: 'generateStart.begin+0.9s',
            dur: 0.2
        },{
            id: 'antiCharge2Process1',
            coor: [1024, 693],
            stroke: 'EC2',
            begin: 'inherit',
            dur: 0.4
        },{
            id: 'antiCharge2End',
            coor: [1125, 646]
        }]
    }
};

/* eslint-enable */