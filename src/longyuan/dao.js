import { BaseDAO } from '../common/dao'; 

export default class DeviceDAO extends BaseDAO{
    constructor(){
        super('scada.solar.device');
    }

    when(list=[]){
        let that = this;
        let ajaxList = list.map((f) => {
            return that.fetchData(f.url, {}, JSON.stringify(f.data), f.method);
        })
        return Promise.all(ajaxList);
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

    async getDynData(data) {
        const res = await this.fetchData('/scadaweb/get_dyndata', {}, JSON.stringify({ data }));
        try{
            return res.json();
        }catch(e){
            return {};
        }
    }
}

export const _dao = new DeviceDAO();
