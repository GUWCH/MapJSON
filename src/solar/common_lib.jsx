import scadaCfg, { useSolarTemplate, useSolarMiddle } from '@/common/const-scada';
import { navTo } from '@/common/util-scada';
import { BaseDAO } from '@/common/dao'; 
import { BAY_TYPE, DEVICE_TYPE } from '@/common/utils';
import { COMMON_FLAG, STATUS_CONST_TYPE_NAME, TREE_BAY_TYPE, LIST_DEVICE_TYPE } from './CONSTANT';

let icons = require.context('./common/icons/inverter', true, /\.svg$/);
const StatusIconMap = {};

icons.keys().forEach((file) => {
    let paths = file.split('/');
    let fileName = paths[paths.length - 1];
    let temp = fileName.split('_');
    let value = temp[0];
    StatusIconMap[value] = icons(file).default;
});

icons = null;

icons = require.context('./common/icons/pad', true, /\.svg$/);
const PadStatusIconMap = {};

icons.keys().forEach((file) => {
    let paths = file.split('/');
    let fileName = paths[paths.length - 1];
    let temp = fileName.split('_');
    let value = temp[0];
    PadStatusIconMap[value] = icons(file).default;
});

icons = null;

/**
 * 获取状态图标
 * @param {COMMON_FLAG} flag 
 * @param {String|Number} value 
 * @param {Boolean} defaultIcon 
 * @returns {String}
 */
export const getStatusIcon = (flag, value, defaultIcon=true) => {
    switch(flag){
        case COMMON_FLAG.INVERTER:
            if(value in StatusIconMap){
                return StatusIconMap[value];
            }else if(defaultIcon){
                return StatusIconMap['default'] || '';
            }
            break;
        case COMMON_FLAG.PAD:
            if(value in PadStatusIconMap){
                return PadStatusIconMap[value];
            }else if(defaultIcon){
                return PadStatusIconMap['default'] || '';
            }
            break;
        default:
            break;
    }

    return '';
}

const _dao = new BaseDAO();

async function _getStatus(flag, firstDeviceStatusAlias){
    let constTypeName = '';
    let ajaxList = [];

    switch(flag){
        case COMMON_FLAG.INVERTER:
            constTypeName = STATUS_CONST_TYPE_NAME.INVERTER;
            break;
        default:
            constTypeName = STATUS_CONST_TYPE_NAME.DEFAULT;
            break;
    }

    if(constTypeName){
        ajaxList.push(_dao.fetchData('/scadaweb/get_const', {name: constTypeName}, null, 'GET'));
    }else{
        ajaxList.push(null);
    }

    if(firstDeviceStatusAlias){
        ajaxList.push(_dao.fetchData('/scadaweb/get_yx_const', null, JSON.stringify({
            alias: firstDeviceStatusAlias
        }), 'POST'));
    }else{
        ajaxList.push(null);
    }

    return Promise.all(ajaxList)
    .then(responses => {
        return Promise.all(responses.map(res => {
            if(res === null || !res.ok){
                return null;
            }else{
                return res.json();
            }
        }));
    })
    .then(responses => {
        let aliasConst = responses[1];
        let nameConst = responses[0];
        let verify = (res) => {
            return res && String(res.code) === '10000' && Array.isArray(res.data);
        };

        // 测点别名优先
        if(verify(aliasConst)){
            let first = aliasConst.data[0];
            if(first && Array.isArray(first.list) && first.list.length > 0){
                return first.list;
            }
        }

        if(verify(nameConst) && nameConst.data.length > 0){
            return nameConst.data;
        }

        return [];
    })
    .catch(e => {
        console.error(e);
        return [];
    });
}

/**
 * 通过async函数里 await获取, 或者使用Promise方式获取
 * @param {String} flag 
 * @param {String} firstDeviceStatusAlias 
 * @returns {Promise}
 */
export async function getStatus(flag, firstDeviceStatusAlias){
    return _getStatus(flag, firstDeviceStatusAlias);
}

/**
 * 跳转到特定列表或设备详情
 * @param {String} flag @see COMMON_FLAG a property of COMMON_FLAG
 * @param {String} deviceAlias 设备别名, 为空时为场站首页设备类型跳转
 */
export const toList = (flag, deviceAlias) => {
    if(!flag || !(flag in COMMON_FLAG))return;
    
    let query = `flag=${encodeURIComponent(flag)}${deviceAlias ? `&device=${encodeURIComponent(deviceAlias)}` : ''}`;

    if (process.env.NODE_ENV === 'development') {
        window.open(`./solar_device.html?${query}`);
    }else{
        // 采用模板或非过渡版本时
        if((useSolarTemplate || !useSolarMiddle) && deviceAlias){
            navTo(deviceAlias);
        }else{
            window.open(`./list.html?${query}`);
        }        
    }
};

/**
 * 
 * @typedef NODE_INFO
 * @property {Boolean} isCentral
 * @property {Boolean} isString
 * @property {Object[]} dcCombinerInCentralInv
 * @property {Object[]} stringInv
 * @property {Number} COMMON_FLAG.PAD
 * @property {Number} COMMON_FLAG.AC_COMBINER
 * @property {Number} COMMON_FLAG.INVERTER
 * @property {Number} COMMON_FLAG.DC_COMBINER
 */

/**
 * 获取当前节点信息
 * @param {String} nodeAlias 节点别名或名字
 * @returns {NODE_INFO}
 */
export async function getNodeInfo(nodeAlias){
    nodeAlias = nodeAlias || scadaCfg.getCurNodeAlias() || 'SD1';
    let tree  = await scadaCfg.getTree();
    let siteInfo = await _dao
    .fetchData('/scadaweb/get_device_tree', null, JSON.stringify({
        node_alias: nodeAlias,
        type: `${LIST_DEVICE_TYPE.INVERTER},${LIST_DEVICE_TYPE.DC_COMBINER}`,
        // 点搜索性能慢, 全部去掉, 不再使用
        need_point: false
    }), 'POST').then(res => {
        if(res.ok){
            return res.json();
        }
        return null;
    });

    let padCount = 0;
    let acCombinerCount = 0;
    let centralInv = [];
    let dcCombinerInCentralInv = [];
    let stringInv = [];

    if(tree){
        let node = tree.getNodeByParam('alias', nodeAlias);
        if(node){
            padCount = tree.getNodesByParam('node_type', TREE_BAY_TYPE.PAD, node).length;
            acCombinerCount = tree.getNodesByParam('node_type', TREE_BAY_TYPE.AC_COMBINER, node).length;
        }
    }

    if(siteInfo && String(siteInfo.code) === '10000'){
        (siteInfo.data || []).forEach(d => {
            let { device_type, bay_type, bay_alias, feeder_type, bay_in_node } = d;

            // 设备为汇流箱, 间隔为逆变器且在节点容器表里, 则为集中逆变器, 汇流箱为直流汇流箱
            // 1. 集中逆变器无归属箱变, 拓扑: 集中逆变器->直流汇流箱
            // 2. 集中逆变器有归属箱变, 拓扑: 箱变->集中逆变器->直流汇流箱
            if(String(device_type) === DEVICE_TYPE.DC_COMBINER_STR && String(bay_type) === BAY_TYPE.INVERTER && bay_in_node){
                dcCombinerInCentralInv.push(d);
                if(centralInv.indexOf(bay_alias) === -1){
                    centralInv.push(bay_alias);
                }
            }
            // 设备为逆变器, 间隔不为逆变器, 则为组串逆变器
            // 1. 挂在交流汇流箱下(在节点容器表里,真实存在), 交流汇流箱无归属箱变, 拓扑: 交流汇流箱->组串逆变器
            // 2. 挂在交流汇流箱下(在节点容器表里,真实存在), 交流汇流箱有归属箱变, 拓扑: 箱变->交流汇流箱->组串逆变器
            // 3. 挂在交流汇流箱下(不在在节点容器表里,虚拟), 交流汇流箱无归属箱变, 拓扑: 组串逆变器
            // 4. 挂在交流汇流箱下(不在在节点容器表里,虚拟), 交流汇流箱有归属箱变, 拓扑: 箱变->组串逆变器
            // 5. 挂在箱变下, 拓扑: 箱变->组串逆变器
            // 6. 其它所有(理论不存在), 拓扑: 组串逆变器
            else if(String(device_type) === DEVICE_TYPE.INVERTER_STR && String(bay_type) !== BAY_TYPE.INVERTER){
                stringInv.push(d);
            }
        });
    }

    return {
        [COMMON_FLAG.PAD]: padCount,
        [COMMON_FLAG.AC_COMBINER]: acCombinerCount,
        [COMMON_FLAG.INVERTER]: centralInv.length + stringInv.length,
        [COMMON_FLAG.DC_COMBINER]: dcCombinerInCentralInv.length,
        isCentral: centralInv.length > 0,
        isString: stringInv.length > 0,
        dcCombinerInCentralInv,
        stringInv
    }
}
