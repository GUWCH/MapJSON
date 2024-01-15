/**
 * 间隔类型值
 * 完全与菜单定义表里值相同，纯数值
 * 导航树和设备树里使用，导航树早期会将间隔使用其它字符串代替，如风机BAY_TURBINE,逆变器BAY_INVERTER，使用时需要注意
 * 
|  0 | 测控                     
|  1 | 保护                     
|  2 | 远动                     
|  3 | 风机                     
|  4 | 其他                     
|  5 | 统计                     
|  6 | 测风塔                  
|  7 | 光伏逆变器            
|  8 | 箱变                     
|  9 | 气象站                  
| 10 | 汇流箱                  
| 12 | 关口表                  
| 13 | 其他表                  
| 14 | 升压站                  
| 15 | 交流汇流箱
| 16 | 水轮机组
| 17 | 跟踪器通讯器
| 18 | 自发自用表
| 19 | 灰尘仪
| 20 | 储能变流器
| 21 | 电池组
| 22 | 集装箱子系统
| 23 | 空调
| 24 | 储能电表
| 25 | 电池簇
| 26 | 交流液冷控制器
 */

export const BAY_TYPE = {
    BCU: '0',
    TURBINE: '3',
    INVERTER: '7',
    INVERTER_STR: 'BAY_INVERTER', // 导航树
    PAD: '8',
    PAD_STR: 'BAY_PADMOUNT',// 导航树
    DC_COMBINER: '10',
    DC_COMBINER_STR: 'BAY_COMBINER',// 导航树
    AC_COMBINER: '15',
    AC_COMBINER_STR: 'BAY_COMBINER_AC'// 导航树
};

export class TreeNode{
    constructor(props={}){
        Object.keys(props).forEach(key => {
            this[key] = props[key]
        });
    }

    isNavNode(){
        return true;
    }

    isDevice(){
        return false;
    }

    getName(){
        return this.display_name || '';
    }

    getAlias(){
        return this.alias || '';
    }

    getNodeType(){
        return this.node_type || '';
    }

    isNodeType(nodeType){
        return this.node_type === nodeType;
    }

    getFeederById(){
        return this.feeder_bay_id || '';
    }

    getLinkId(){
        return this.link_id || '';
    }
}

export const isBayTable = (tableNo) => {
    return String(tableNo) === '430'
}

/**
 * 设备树里设备类型, 新增的使用表号_设备类型值表示，早期有的设备使用了字符代替，如逆变器ivt，使用时需要注意
|  1 |  CVT设备               
|  2 |  保护设备            
|  3 |  AVQC设备              
|  4 |  其它设备            
|  5 |  关口表               
|  6 |  逆变器               
|  7 |  直流柜               
|  8 |  汇流箱               
|  9 |  箱变                  
| 10 |  气象站               
| 11 |  跟踪器控制器      
| 12 |  电表                  
| 13 |  舱                    
| 14 |  动力单元            
| 15 |  系统设置            
| 16 |  能量管理            
| 17 |  储能变流器         
| 18 |  空调                  
| 19 |  储能电表            
| 20 |  电池簇               
| 21 |  电池组               
| 22 |  电池采集单元      
| 23 |  测控装置         
| 24 |  直流舱             
| 25 |  交流舱            
| 26 |  交流液冷控制器      
| 29 |  光伏方阵     
| 30 |  显控主机   
 */

export const NODE_TYPE = {
    cess: "22",
    matrix: "29",
    wts: "BAY_METSTATION",
    fm: "30"
}

export const DEVICE_TYPE = {
    INVERTER: '432_6',
    INVERTER_STR: 'ivt',
    DC_COMBINER: '432_8',
    DC_COMBINER_STR: 'comb'
};

// get wtg接口里类型使用表号+'_'+类型, 但430只需要类型
export const isOtherDeviceType = (type) => {
    const typeArr = String(type).split('_');
    return typeArr.length > 1 && typeArr[0] !== '430';
}

export class TreeDevice{
    constructor(props={}){
        Object.keys(props).forEach(key => {
            this[key] = props[key]
        });
    }

    isNavNode(){
        return false;
    }

    isDevice(){
        return true;
    }

    getName(){
        return this.device_name || '';
    }

    getAlias(){
        return this.device_alias || '';
    }

    getType(){
        return this.device_type || '';
    }

    isType(type){
        return this.getType() === type;
    }

    getBayName(){
        return this.bay_name || '';
    }

    getBayAlias(){
        return this.bay_alias || '';
    }

    getBayType(){
        return this.bay_type || '';
    }

    bayInNode(){
        return !!this.bay_in_node;
    }

    getTopName(){
        return this.feeder_name || '';
    }

    getTopAlias(){
        return this.feeder_alias || '';
    }

    getTopType(){
        return this.feeder_type || '';
    }

    getPoint(){
        return this.point || [];
    }
}

export enum TopologyAssetType {
    pad, // 箱变
    converter, // 变流器
    battery, // 电池组
    batteryCluster, // 电池簇,
    inverter, // 光伏逆变器,
    strInverter, // 组串式逆变器,
    acCombiner, //交流汇流箱
    dcCombiner, //直流汇流箱

    line, //馈线
    turbine, // 风机
    sys, // 子系统
    matric, // 方阵

    factory, // 场站
}

export const getTopologyAssetType = (tableNo: number, type: number): TopologyAssetType | undefined => {
    if (tableNo === 433) {
        if (type === 4) {
            return TopologyAssetType.pad
        }
    } else if (tableNo === 432) {
        if (type === 23) {
            return TopologyAssetType.pad
        }
        if (type === 9) {
            return TopologyAssetType.pad  //光伏箱变
        }
        if (type === 8) {
            return TopologyAssetType.dcCombiner
        }
        if (type === 6) {
            return TopologyAssetType.strInverter // 组串逆变器设备
        }
    } else if(tableNo === 430) {
        if (type === 8) {
            return TopologyAssetType.pad
        }
        if (type === 20) {
            return TopologyAssetType.converter
        }
        if (type === 21) {
            return TopologyAssetType.battery
        }
        if (type === 25) {
            return TopologyAssetType.batteryCluster
        }
        if (type === 7) {
            return TopologyAssetType.inverter
        }
        if (type === 15) {
            return TopologyAssetType.acCombiner
        }
        if (type === 33) {
            return TopologyAssetType.line
        }
        if (type === 3) {
            return TopologyAssetType.turbine
        }
        if (type === 29) {
            return TopologyAssetType.matric
        }
        if (type === 22) {
            return TopologyAssetType.sys
        }

    }
}