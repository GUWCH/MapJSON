import BaseDAO, { parseRes } from './basedao';

class PageDao extends BaseDAO{
    // 页面模板列表
    async getPageTplList() {
        const res = await this.fetchData('/scadaweb/page_tpl/list', {}, null, 'GET');
        return parseRes(res);
    }

    // 单页面模板
    async getPageTpl(data={}) {
        const res = await this.fetchData('/scadaweb/page_tpl/get', data, null, 'GET');
        return parseRes(res);
    }

    // 删除单页面模板
    async deletePageTpl(id) {
        const res = await this.fetchData('/scadaweb/page_tpl/delete', {}, JSON.stringify({id}), 'POST');
        return parseRes(res);
    }

    // 创建和更新单页面模板
    async savePageTpl(data) {
        const res = await this.fetchData('/scadaweb/page_tpl/save', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 页面类别列表
    async getPageCategoryList() {
        const res = await this.fetchData('/scadaweb/page_category/list', {}, null, 'GET');
        return parseRes(res);
    }

    // 删除页面类别
    async deletePageCategory(id) {
        const res = await this.fetchData('/scadaweb/page_category/delete', {}, JSON.stringify({id}), 'POST');
        return parseRes(res);
    }

    // 创建和更新页面类别
    async savePageCategory(data) {
        const res = await this.fetchData('/scadaweb/page_category/save', {}, JSON.stringify(data), 'POST');
        return parseRes(res);
    }

    // 根据资产别名获取单设备模板和其列表模板获取
    async getDeviceTpl(alias, appName: AppName = 'SCADA') {
        const res = await this.fetchData('/scadaweb/uniForward/scadaModel/GetPageIdByObjectAlias', {}, JSON.stringify({
            object_alias: alias,
            app_name: appName
        }), 'POST');
        return parseRes(res);
    }

    // 模板导出
    async exportTpl(pageIds) {
        const res = await this.fetchData('/scadaweb/page_tpl/export', {}, JSON.stringify({IdList: pageIds}), 'POST');
        return parseRes(res);
    }

    // 模板导入
    async importTpl(formData) {
        const res = await this.fetchData('/scadaweb/page_tpl/import', {}, formData, 'POST', true);
        return parseRes(res);
    }
}

export const _pageDao = new PageDao();