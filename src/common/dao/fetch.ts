import { Moment } from 'moment';
import BaseDAO, { LegalData, daoIsOk, parseRes } from './basedao';
import Intl from '@/common/lang';
import { POINT_TABLE, TPointType } from '../constants';
import scadaCfg from '../const-scada';

export default class DAO extends BaseDAO {
    constructor() {
        super('scada.dao', '');
    }

    // 联合请求方法
    when(list: any[] = []) {
        let that = this;
        let ajaxList = list.map((f) => {
            return that.fetchData(f.url, f.query || {}, JSON.stringify(f.data), f.method);
        })
        return Promise.all(ajaxList);
    }

    // 导航树列表接口
    async getTreeList(type, nodeNameList, otherQuery = {}): Promise<ScadaResponse<ITree[]>> {
        const res = await this.fetchData(
            '/scadaweb/get_tree',
            Object.assign({}, type ? { type: type } : {}, nodeNameList ? { node_name_list: nodeNameList } : {}, otherQuery),
            null, 'GET'
        );
        return parseRes(res);
    }

    // 对象模型列表
    async getObjects(): Promise<ScadaResponse<IDomainInfo[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetObjectModelList', undefined, undefined, 'GET');
        return parseRes(res);
    }

    // 根据模型别名获取对象模型
    async getModelsById(data: {
        domain_id: string
        model_id: string
        if_public: boolean
    }): Promise<ScadaResponse<IModelPoint[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetModelByModelID', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 根据资产别名获取模型
    async getModelByObjectAlias(req: {
        object_alias: string
        type?: string
        is_sample?: boolean
        if_public?: boolean // 是否仅返回公有模型，不传后端默认为true
    }): Promise<ScadaResponse<IModelPoint[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetModelByObjectAlias', {}, JSON.stringify({
            object_alias: req.object_alias,
            type: req.type ?? '',
            is_sample: !!req.is_sample,
            if_public: req.if_public === undefined ? undefined : req.if_public
        }), 'POST');
        return parseRes(res);
    }

    // 获取资产所属领域，all_domain为true时获取该资产可访问的所有领域
    async getDomainByObjectAlias(req: { object_alias: string, all_domain?: boolean }): Promise<ScadaResponse<Omit<IDomainInfo, 'model_id_vec'>[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetDomainByObjectAlias', {}, JSON.stringify(req), 'POST')
        return parseRes(res)
    }

    async getDeviceTreeByObjectAlias(alias: string, modelIds: string[], groupBy: 'MODEL' | 'FAC'): Promise<ScadaResponse<IAssetGroup[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetDeviceTreeByObjectAlias', {}, JSON.stringify({
            object_alias: alias,
            model_id: modelIds.join(','),
            group_by: groupBy
        }), 'POST')
        return parseRes(res)
    }

    async getObjectByNodeAlias(alias: string): Promise<ScadaResponse<IModelInfo[]>> {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetDeviceTypeByNodeAlias', {}, JSON.stringify({
            object_alias: alias,
            model_id: ''
        }), 'POST')
        return parseRes(res)
    }

    // 多间隔列表接口
    getBayList(datas: any[] = []) {
        return this.when(datas.map(data => ({
            url: '/scadaweb/get_wtgtable',
            data: data,
            method: 'POST'
        })));
    }

    // 单间隔列表接口
    async getDeviceList(data = {}) {
        const res = await this.fetchData('/scadaweb/get_wtgtable', {}, JSON.stringify(data));
        return parseRes(res);
    }

    // 获取节点下设备类型列表
    async getDeviceType(nodeAlias = ''): Promise<ScadaResponse<IDeviceModelValue>> {
        const res = await this.fetchData(
            '/scadaweb/get_model',
            { node_name_list: nodeAlias },
            null, 'GET'
        );

        const ret = await parseRes(res) as ScadaResponse<IDeviceModelValue>

        if (ret && 'data' in ret) {
            // 储能要特殊处理, 应该后台或数据库里进行修改, 无语
            Object.keys(ret.data).map(k => {
                switch (String(k)) {
                    case '20':
                        ret.data[k].name = Intl.isZh ? '变流器' : 'Converter';
                        break;
                    case '21':
                        ret.data[k].name = Intl.isZh ? '电池组' : 'Battery Array';
                        break;
                    case '22':
                        ret.data[k].name = Intl.isZh ? '子系统' : 'SubSystem';
                        break;
                    case '23':
                        ret.data[k].name = Intl.isZh ? '空调' : 'Air Conditioner';
                        break;
                    case '25':
                        ret.data[k].name = Intl.isZh ? '电池簇' : 'Battery Cluster';
                        break;
                    case '432_23':
                        ret.data[k].name = Intl.isZh ? '测控装置' : 'Protection and Measuring-control Devices';
                        break;
                }
            })
        }

        return new Promise((resolve) => {
            resolve(ret);
        });
    }

    // 动态字数据获取接口
    async getDynData(data: IDynData[], query?): Promise<ScadaResponse<IDyn[]>> {
        const res = await this.fetchData('/scadaweb/get_dyndata', query || {}, JSON.stringify({ data }));
        return parseRes(res);
    }

    // 告警等级接口
    async getAlarmLevel(): Promise<ScadaResponse<IWarnLevel[]>> {
        const res = await this.fetchData('/scadaweb/get_warn_level', {}, null, 'GET');
        return parseRes(res);
    }

    // 告警类型接口
    async getAlarmType(): Promise<ScadaResponse<IWarnType[]>> {
        const res = await this.fetchData('/scadaweb/get_alarm_type', {}, null, 'GET');
        return parseRes(res);
    }

    // 实时告警接口
    async getAlarm(data) {
        const res = await this.fetchData('/scadaweb/get_alarm', {}, JSON.stringify(data));
        return parseRes(res);
    }

    // 获取挂牌数据接口
    async getToken(regionAlias) {
        const res = await this.fetchData(
            '/scadaweb/token_info',
            regionAlias ? { region: regionAlias } : {},
            null, 'GET'
        );
        return parseRes(res);
    }

    // 获取挂牌菜单
    async getPopupMenu(aliasKey) {
        const res = await this.fetchData(
            '/scadaweb/get_popup_menu',
            { key: aliasKey },
            null, 'GET'
        );
        return parseRes(res);
    }

    // 批量挂牌
    async multiHandlePopupMenu(list) {
        return this.when(list.map(l => ({
            url: '/scadaweb/handle_popup_menu',
            query: {
                class: 'setflag',
                key: l.alias,
                id: l.id,
                remark: l.remark || ''
            },
            method: 'GET'
        })))
    }

    // 历史数据接口
    async getCurve(data) {
        const res = await this.fetchData('/scadaweb/get_curve', {}, JSON.stringify(data));
        return parseRes(res);
    }

    getCurveList(datas: any[] = []) {
        return this.when(datas.map(data => ({
            url: '/scadaweb/get_curve',
            data: data,
            method: 'POST'
        })))
    }

    /**
     * 用户习惯数据接口（增删改查）
     * @param {String} operate get|update|insert
     * @param {Object} data 
     * @returns 
     */
    async memo(operate: 'get' | 'update' | 'insert' | 'delete', data: object): Promise<
        ScadaResponse<IUserPreference[]> // get
        | { // insert/update
            code: string
            id: string
            message: string
        }
    > {
        const res = await this.fetchData(`/scadaweb/user_preference/${operate}`, {}, JSON.stringify(data));
        return parseRes(res);
    }

    async runPointsDataExport(params: IPointDataExport): Promise<{
        code: string, id: string, message: string
    }> {
        const res = await this.fetchData('/scadaweb/get_data_export', {}, JSON.stringify({ ...params, newExp: true }));
        return parseRes(res);
    }

    async runWarnDataExport(params: IWarnDataExport): Promise<{
        code: string, id: string, message: string
    }> {
        const res = await this.fetchData('/scadaweb/history_warn_export', {}, JSON.stringify({ ...params, newExp: true }))
        return parseRes(res)
    }

    async runMultiDataExport(params: { dataReqList?: IPointDataExport[], warnReqList?: IWarnDataExport[] }): Promise<{
        code: string, id: string, message: string
    }> {
        const res = await this.fetchData('/scadaweb/multi_data_export', {}, JSON.stringify(
            Object.assign(
                {},
                params.dataReqList ? { dataReqList: params.dataReqList } : {},
                params.warnReqList ? { warnReqList: params.warnReqList } : {}
            )
        ))
        return parseRes(res)
    }

    // 通用数据导出接口
    async exportFile(data) {
        const res = await this.fetchData('/scadaweb/get_save_file_by_data', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 测点集接口
    async getDataSet(data) {
        const res = await this.fetchData('/scadaweb/uniForward/rdbService/getDatasetDirectory', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 测点集历史数据查询接口
    async getDataSetHistoryData(data) {
        const res = await this.fetchData('/scadaweb/uniForward/rdbService/getDatasetHisData', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 测点集历史数据颗粒度获取接口
    async getDataSetDilution(data: IReqDataSetDilution): Promise<IResDataSetDilution> {
        const res = await this.fetchData('/scadaweb/uniForward/rdbService/getDataSetDilution', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    //电芯电压温度实时数据获取
    async getDataSetValue(data) {
        const res = await this.fetchData('/scadaweb/uniForward/rdbService/getDatasetValue', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }


    // 权限获取接口
    async getAuth(nodeAlias) {
        const res = await this.fetchData('/scadaweb/get_privilege', nodeAlias ? { area: nodeAlias } : {}, undefined, 'GET');
        return parseRes(res);
    }

    /**
     * 获取资产测点信息
     * @param {Object} req 
     * @property {String} bay_alias 资产别名(间隔及以上资产)
     * @property {String} device_type
     * @property {String} point_type -1:全部 | 1:遥测和电度 | 2:遥信 | 其它值不返回
     * @property {String} meter_reading_type -1:普通测点形式 | 0:数据导出特有形式 | 其它值不返回
     * @returns 
     */
    async getAssetPoint(req) {
        const res = await this.fetchData('/scadaweb/get_device_point', undefined, JSON.stringify(req), 'POST');
        return parseRes(res);
    }

    /**
     * 搜索资产测点信息
     * @param {Object} req 
     * @property {String} search_key 搜索包含的内容
     * @property {number} name_alias_flag 按名称还是别名搜索, 0名称 | 1别名
     * @property {number} ddyc_flag 测点类型， 0电度 | 1遥测 | 2遥信 | 其它(所有测点, 一般使用-1)
     * @property {String} node_name_list 场站节点别名,如果有值代表在此节点里搜索,否则会按用户所有场站搜索
     * @property {number} row_begin 1
     * @property {number} row_count Number.POSITIVE_INFINITY
     * @property {boolean} is_all 默认false, 只返回采样数据,针对遥测和电量; true包含虚点的所有点
     * @property {boolean} is_filter 默认false, 单设备基础控件里全数据过滤特殊设备
     * @returns 
     */
    async searchAssetPoint(req) {
        const res = await this.fetchData('/scadaweb/point_search', {
            new_model: true
        }, JSON.stringify(req), 'POST');
        return parseRes(res);
    }

    async getDeviationThresold(req) {
        const res = await this.fetchData(`/scadaweb/get_point_config`, {}, JSON.stringify(req));
        return parseRes(res);
    }

    async updateDeviationThresold(alias, valAttribute) {
        const res = await this.fetchData(`/scadaweb/update_point_config`, {}, JSON.stringify({
            points: [{
                alias,
                attribute: valAttribute
            }]
        }));
        return parseRes(res);
    }

    /**
     * 控制下发接口
     * @param {*} opt_str 
     * @returns 
     */
    async doOperation(opt_str, userName = '') {
        const res = await this.fetchData('/scadaweb/do_operation', {}, JSON.stringify({
            opt_str,
            opt_type: 2,
            operator_name: userName
        }));
        return parseRes(res);
    }

    /**
     * 根据别名获取某些信息
     * {
        alias_list: [{alias: "WTUR.TurbineListSts"}...],
        para_list: [{para: "all_yxvalue"}...]
       }
        para选项:all_yxvalue至少需要别名后两段除外其它都需要完整别名
        disp_name名称
        fac_alias风场别名
        fac_name风场名称
        bay_alias间隔别名
        bay_name间隔名称
        bay_type间隔类型
        bay_type_sub间隔子类型
        field_name域名
        logic_device逻辑设备名
        reference_name引用名
        point_number点号
        point_status测点状态
        yx_value遥信值
        all_yxvalue所有遥信状态值
        if_sample是否采样
     * @param {string} aliasStr 
     * @param {string} infoAttrStr 
     * @returns 
     */
    async getInfoByAlias(aliasStr: string, infoAttrStr: string) {
        const res = await this.fetchData(`/scadaweb/get_infoByAlias`, {}, JSON.stringify({
            alias_list: aliasStr.split(',').map((alias) => ({ alias })),
            para_list: infoAttrStr.split(',').map((para) => ({ para }))
        }));
        return parseRes(res);
    }

    /**
     * 定制化支路电流请求
     * @param {string} deviceAlias 一般为四段别名设备A.B.C.D
     * @returns 
     */
    async getBranchCurrentPoints(deviceAlias, currentAlias = 'Cur') {
        const fixDeviceAlias = deviceAlias.split('.').slice(0, 5 - currentAlias.split('.').length).join('.');
        const searchKey = `${fixDeviceAlias}.${currentAlias}`;
        const res = await this.searchAssetPoint({
            // 多个设备时不传搜索项
            search_key: deviceAlias.indexOf(',') > -1 ? '' : searchKey,
            name_alias_flag: '1',
            ddyc_flag: 1,
            node_name_list: deviceAlias,
            row_begin: 1,
            row_count: 10000
        });

        if (res && String(res.code) === '10000' && Array.isArray(res.data)) {
            const points = res.data.filter(p => /.*\.Cur\d+?$/.test(p.point_alias));
            points.sort((prev, next) => {
                const prevNum = prev.point_alias.replace(/.*\.Cur(\d+)?/, '$1');
                const nextNum = next.point_alias.replace(/.*\.Cur(\d+)?/, '$1');

                return Number(prevNum) - Number(nextNum);
            });
            return points;
        }

        return [];
    }

    /**
     * 获取拓扑结构
     * @param alias 
     */
    async getTopologyStracture(alias) {
        const res = await this.fetchData('/scadaweb/uniForward/topo/GetTopologyByAlias', undefined, JSON.stringify({
            object_alias: alias,
            if_ignore: true
        }))
        const resObj = await parseRes(res)
        if (!LegalData(resObj)) {
            throw new Error("ilegal response when fetching topology by alias:" + alias);
        }
        return resObj.data
    }

    /**
     * 计划有功测点查询
     */
    async emcScheduleGetPoints() {
        const res = await this.fetchData('/scadaweb/plan_power/get_points', {}, undefined, 'GET')
        const resObj = await parseRes(res)
        if (!LegalData(resObj)) {
            throw new Error('ilegal response when fetching emc schedule points')
        }
        return resObj.data
    }

    async emcScheduleExport(alias) {
        const res = await this.fetchData('/scadaweb/plan_power/export_tpl', { ycAlias: alias }, undefined, 'GET')
        const header = res.headers.map['content-disposition']
        const fileName = decodeURIComponent(header.slice(header.indexOf("filename=")).replace("filename=", ""))
        let blob = await res.blob()
        let a = document.createElement('a')
        a.style.display = 'none'
        a.href = window.URL.createObjectURL(blob)
        a.setAttribute('download', fileName)
        document.body.appendChild(a)
        a.click()
        res.data = null
        return Promise.resolve(res)
    }

    async emcScheduleImport(formData) {
        const res = await this.fetchData('/scadaweb/plan_power/import_tpl', undefined, formData, 'POST', true)
        const resObj = await parseRes(res)
        if (!LegalData(resObj)) {
            return Promise.reject(resObj)
        }
    }

    async backgroundImgUpload(formData) {
        const res = await this.fetchData('/scadaweb/fileSave/import', undefined, formData, 'POST', true)
        const resObj = await parseRes(res)
        return resObj;
    }

    async backgroundImgDelete(fileList) {
        const res = await this.fetchData('/scadaweb/fileSave/delete', undefined, JSON.stringify(fileList), 'POST', true)
        const resObj = await parseRes(res)
        if (!LegalData(resObj)) {
            return Promise.reject(resObj)
        } else {
            return resObj
        }
    }

    async backgroundImgDisplay(fileName) {
        const res = await this.fetchData('/scadaweb/fileSave/display', { fileName: fileName }, undefined, 'GET');
        return res
    }

    async lightWords(type: string, data: {
        /**true时会对光字做些过滤, 根据情况加此参数, 新控件里把此参数加上 */
        newMode?: boolean;
        [k: string]: any;
    }) {
        const res = await this.fetchData(`/scadaweb/get_lightwords${type ? '/' + type : ''}`, {}, JSON.stringify(data))
        return parseRes(res);
    }

    async confirmSignal(data) {
        const res = await this.fetchData('/scadaweb/confirm_signal', {}, JSON.stringify(data))
        return parseRes(res);
    }

    /**
     * 获取活动状态字数据
        wtg_alias: SXHH.T1_L2.WTG001
        last_time: 0
        site_node: SXHH
        appName: SCADASIT
     */
    async activeSc(query) {
        const res = await this.fetchData('/scadaweb/get_active_sc', query, undefined, 'GET');
        return parseRes(res);
    }

    /**
     * 获取亚健康状态字数据
        "ids": "SXHH.T1_L2.WTG001",
        "poly_date_type": "day",
        "poly_area_type": "wtg",
        "starttime": "2022-09-28",
        "endtime": "2022-09-29",
        "row_count": 50,
        "row_begin": 1,
        "order_by": "sc_starttime",
        "date_format": "yyyy-MM-dd",
        "time_format": "HH:mm:ss",
        "is_asc": false
     */
    async subhealth(data) {
        const res = await this.fetchData('/mrweb/subhealth', {}, JSON.stringify(data));
        return parseRes(res);
    }

    async getPriv(nodeAlias) {
        const res = await this.fetchData('/scadaweb/get_privilege', {
            area: nodeAlias || ''
        }, undefined, 'GET')
        return parseRes(res)
    }

    async getAssetInfo(aliasArr) {
        const res = await this.fetchData('/scadaweb/get_asset_info', {}, JSON.stringify(aliasArr))
        return parseRes(res)
    }

    /** 根据遥信测点别名获取遥信点值类型列表 */
    async getYXConst(aliasList: string[] = []) {
        const res = await this.fetchData(`/scadaweb/get_yx_const`, {}, JSON.stringify({
            alias: aliasList.join(',')
        }));
        return parseRes(res);
    }

    /** 根据常量名获取常量信息, 即遥信值类型列表 */
    async getConst(constTypeName: string) {
        const res = await this.fetchData(`/scadaweb/get_const`, { name: constTypeName }, undefined, 'GET');
        return parseRes(res);
    }

    /** 修改测点信息 */
    async updatePoint(params: IUpdatePointParam[]) {
        const res = await this.fetchData('/scadaweb/update_field_val', undefined, JSON.stringify({ points: params }), 'POST')
        return parseRes(res)
    }

    // 根据场站别名查询对应的升压站别名
    async getSubstationByFac(facList) {
        const res = await this.fetchData('/scadaweb/uniForward/rdbService/getSubstationByFac', {}, JSON.stringify({ data: facList.map(f => { return { fac_alias: f } }) }), 'POST');
        return parseRes(res);
    }

    // 获取文件列表
    async getFileList(path: IReqFileList) {
        const res = await this.fetchData('/scadaweb/uniForward/platform/GetFilesByPath', {}, JSON.stringify(path), 'POST');
        return parseRes(res);
    }

    // 下载文件
    async downloadFile(reqJson: IReqDownloadFile[]) {
        const res = await this.fetchData('/scadaweb/fileDownloadForward', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 历史告警 */
    async getWarn(reqJson: IReqWarn): Promise<ScadaResponse<IResWarn[]>> {
        const res = await this.fetchData('/scadaweb/get_warn', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 告警选项包括等级和类型列表 */
    async getWarnOptionList(): Promise<ScadaResponse<IResWarnOption>> {
        const res = await this.fetchData('/scadaweb/get_warn_template_option_list', {}, undefined, 'GET');
        return parseRes(res);
    }

    /** 储能可利用率报表 */
    async storageGetAvailability(reqJson: IReqStorageAvailability) {
        const res = await this.fetchData('/storage/avai/get', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 储能可利用率报表导出 */
    async storageExportAvailability(reqJson: IReqStorageAvailability) {
        const res = await this.fetchData('/storage/avai/export', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 储能设备停机记录报表 */
    async storageGetDowntime(reqJson: IReqStorageDowntime) {
        const res = await this.fetchData('/storage/state_change/get_down_time', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 储能设备停机记录报表导出 */
    async storageExportDowntime(reqJson: IReqStorageDowntime) {
        const res = await this.fetchData('/storage/state_change/export', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 储能设备停机记录报表eco列表 */
    async storageECO() {
        const res = await this.fetchData('/storage/state_change/get_eco', {}, undefined, 'GET');
        return parseRes(res);
    }

    /** 储能设备停机记录拆分 */
    async storageSplitRecord(reqJson) {
        const res = await this.fetchData('/storage/state_change/break', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    /** 储能设备停机记录编辑 */
    async storageEditRecord(reqJson) {
        const res = await this.fetchData('/storage/state_change/edit', {}, JSON.stringify(reqJson), 'POST');
        return parseRes(res);
    }

    async getPointHisData(params: {
        fullAlias: string,
        fieldNo?: number | string,
        interval: number,
        st: Moment,
        et: Moment,
        saveType?: 'xls' | 'csv' | 'pdf',
        valueType: number,
        decimal?: number
    }): Promise<IPointHisRes> {
        const data: any = {
            alias: params.fullAlias + (params.fieldNo !== undefined && String(params.fieldNo) ? ':' + params.fieldNo : ''),
            interval: params.interval,
            st: params.st.format('YYYY-MM-DD%20HH:mm:ss'),
            et: params.et.format('YYYY-MM-DD%20HH:mm:ss'),
            value_type: params.valueType,
        }
        params.decimal !== undefined && (data.decimal = params.decimal)
        params.saveType !== undefined && (data.savetype = params.saveType)

        const res = await this.fetchData('/scadaweb/history_data', data, undefined, 'GET', false, { skipUriEncode: true })
        return parseRes(res)
    }

    async exportHistoryData(params: {
        chart?: string
        file_name: string
        multi_point: {
            alias: string // "SXGL.Farm.Statistics.WWPP.APProduction:28"
            decimal: string // "2"
            et: string // "2023-06-27 13:55:00"
            interval: string // "5"
            st: string // "2023-06-27 00:00:00"
            value_type: string // "2"
        }[]
        save_type: string
    }): Promise<{ code: string, file_path: string }> {
        const res = await this.fetchData('/scadaweb/history_data/batch_import', {}, JSON.stringify(params), 'POST');
        return parseRes(res)
    }

    async setPointValue(params: { alias: string, value: string }[]): Promise<ScadaResponse<void>> {
        const res = await this.fetchData('/scadaweb/set_point', {}, JSON.stringify({
            user: scadaCfg.getUser(),
            data: params
        }))
        return parseRes(res)
    }
    async getDeviceData(data: Object): Promise<ScadaResponse<void>> {
        const res = await this.fetchData(
            '/scadaweb/uniForward/platform/GetMonitor',
            undefined, JSON.stringify(data), 'POST')
        return parseRes(res)
    }

    async getPointConst(alias: string | string[]): Promise<ScadaResponse<IPointConst[]>> {
        const res = await this.fetchData('/scadaweb/get_yx_const', {}, JSON.stringify({
            alias: Array.isArray(alias) ? alias.join(',') : alias
        }), 'POST')
        return parseRes(res)
    }

    async getReportTemplates(): Promise<ScadaResponse<IReportTemplateTreeNode[]>> {
        const res = await this.fetchData('/reportserver/report/template', {}, undefined, 'GET')
        return parseRes(res)
    }

    async loadReport(params: {
        tableId: string
        date: string
        isTemplate?: boolean
        force?: boolean
    }): Promise<ScadaResponse<IReportData>> {
        const res = await this.fetchData('/reportserver/table/load', params, undefined, 'GET')
        return parseRes(res)
    }

    async saveReport(params: {
        tableInfo: {
            tableId: string
            isTemplate?: boolean
            date: string
        },
        tableData: any
    }): Promise<ScadaResponse<void>> {
        const res = await this.fetchData('/reportserver/table/upload', {}, JSON.stringify(params), 'POST')
        return parseRes(res)
    }

    async downloadResource(path: string, options?: {
        plain?: boolean
        forward_ip?: string
    }) {
        window.open(`${window.location.origin}/scadaweb/get_rs?name=${encodeURIComponent(path)
            }&plain=${options?.plain ? 1 : 0
            }&forward_ip=${options?.forward_ip ?? ''
            }`)
    }
}

export const _dao = new DAO();



