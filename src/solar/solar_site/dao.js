import { BaseDAO } from '../../common/dao'; 

export default class ViewDAO extends BaseDAO{
    constructor(){
        super('scada.site.view');
    }    
    
    when(list=[]){
        let that = this;
        let ajaxList = list.map((f, index) => {
            return that.fetchData(f.url, f.query, JSON.stringify(f.data), f.method);
        })
        return Promise.all(ajaxList);
    }

    getAll(list){
        return this.when(list);
    }

    async getInvRank(req){
        const res = await this.fetchData('/mrweb/invtRpt', {}, JSON.stringify(req), 'POST');
        return res.json();
    }

    async getCurves(paramList) {
        const res = await this.when(paramList.map(req => ({
            url: '/scadaweb/get_curve',
            query: {},
            data: req,
            method: 'POST'
        }))).then(promiseList => {
            return Promise.all(promiseList.map(p => p.json()));
        }).catch(e => {
            return [];
        });
        return res;
    }

    async getCurve(params) {
        const res = await this.fetchData('/scadaweb/get_curve', {}, JSON.stringify(params), 'POST');
        return res.json();
    }

    async getDyns(paramList) {
        const res = await this.when(paramList.map(req => ({
            url: '/scadaweb/get_dyndata',
            query: {},
            data: {
                branch_para_list: "",
                data: req
            },
            method: 'POST'
        }))).then(promiseList => {
            return Promise.all(promiseList.map(p => p.json()));
        }).catch(e => {
            return [];
        });
        return res;
    }

    async getDyn(params) {
        const res = await this.fetchData('/scadaweb/get_dyndata', {}, JSON.stringify({
            branch_para_list: "",
            data: params
        }), 'POST');
        return res.json();
    }

    async getToken(regionAlias) {
        const res = await this.fetchData(
            '/scadaweb/token_info', 
            regionAlias ? {region: regionAlias} : {}, 
            null, 'GET'
        );
        return res.json();
    }

    async setToken(key, id) {
        const res = await this.fetchData(
            '/scadaweb/handle_popup_menu', 
            {
                class: 'env_dyndata',
                key,
                id
            }, 
            null, 
            'GET'
        );
        return res.json();
    }
};
