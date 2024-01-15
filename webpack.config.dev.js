const path = require('path');
const fs = require('fs');

var ROOT_PATH = path.resolve(__dirname);
var SOURCE_PATH = path.resolve(ROOT_PATH, 'src');
var AssetsDir = 'assets2';
var isDevelopment = true;

module.exports = {
    port: 8887,
    serverPort: 8886,
    // target: 'http://10.230.153.31:8701',
    target: 'http://10.230.153.90:8701',
    // target: "http://10.230.153.69:8701/",
    router: {
        '/scadaweb/get_tree': {
            enabled: false,
            source: './mock/getTree.json'
        },
        '/scadaweb/get_dyndata': {
            enabled: false,
            source: './mock/mapData.json'
        },
        '/scadaweb/get_curve': {
            enabled: false,
            source: './mock/mapData.json'
        },
        '/scadaweb/history_data': {
            enabled: false,
            source: './mock/mapData.json'
        },
        '/scadaweb/get_wtgdata': {
            enabled: true,
            source: './mock/wtgData.json'
        },
        '/scadaweb/get_noisedata': {
            enabled: true,
            source: './mock/getNoisedata.json'
        },
        '/scadaweb/get_configdata': {
            enabled: true,
            source: './mock/configData.json'
        },
        '/scadaweb/uniForward/rdbService/getDatasetDirectory': {
            enabled: true,
            source: './mock/datasetVolDir.json'
        },
        '/scadaweb/uniForward/rdbService/getDatasetHisData': {
            enabled: true,
            source: './mock/datasetHis.json'
        },
        '/scadaweb/object_list': {
            enabled: true,
            source: './mock/allObject.json'
        },
        '/scadaweb/models_by_id': {
            enabled: true,
            source: './mock/getModelByModelId.json'
        },
        '/scadaweb/models': {
            enabled: true,
            source: './mock/models.json'
        },
        '/scadaweb/tpl/get': {
            enabled: true,
            source: './mock/deviceTpl.json'
        },
        '/scadaweb/uniForward/scadaModel/GetPageIdByObjectAlias': {
            enabled: false,
            source: './mock/deviceTpl.json'
        },
        '/scadaweb/uniForward/rdbService/getDataSetDilution': {
            enabled: false,
            target: 'http://10.65.99.81:6524/',
            pathRewrite: {
                '/scadaweb/uniForward/rdbService/getDataSetDilution': '/rdbservice/get_record_svr_period'
            },
            source: './mock/dilution.json'
        },
        '/scadaweb/get_alarm_type': {
            enabled: true,
            source: './mock/alarmTypes.json'
        },
        '/scadaweb/uniForward/scadaModel/GetObjectModelList':{
            enabled:true,
            source:'./mock/pageTplModel.json'
        },
        '/scadaweb/uniForward/rdbService/getDatasetValue':{
            enabled:true,
            source:'./mock/batteriesData.json'
        },
        // '/scadaweb/uniForward/ems/get_frCurves':{
        //         enabled: false,
        //         target: 'http://10.230.153.90:8701/',
        //         pathRewrite: {
        //             '/scadaweb/uniForward/ems/get_frCurves': '/scadaweb/uniForward/ems/get_frCurves'
        //         },
        // },
        '/scadaweb/uniForward/platform/GetMonitor':{
            enabled: true,
            target: 'http://10.65.90.23:8892/',
            pathRewrite: {
                '/scadaweb/uniForward/platform/GetMonitor': '/get_it_monitor_data'
            },
            source: './mock/dilution.json'
        },
        '/GetSubSystemData':{
            enabled: true,
            target: 'http://10.65.90.24:8892',
            pathRewrite: {
                '/GetSubSystemData': '/get_topology_subsystem_data'
            },
            source: ''
        }
    }
};