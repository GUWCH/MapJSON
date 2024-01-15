import { BaseDAO } from '../common/dao'; 
import {scadaVar} from '../common/constants';

export default class NoiseDAO extends BaseDAO{
    constructor(){
        super('scada.noise');
    }    

    setNoise(data, callback, errorFn) {
        return this.fetchData(
            '/scadaweb/uniForward/noiseControl/setData',
            {},
            JSON.stringify(data), 'POST'
        )
        .then(res => {
            if(res.ok){
                return Promise.resolve(res.json())
            }

            if(typeof errorFn === 'function'){
                errorFn();
            }
            throw new Error(`error url:${res.url}`);
        })
        .then(
            data => {
                if(data.code === '10000' && typeof callback === 'function'){
                    callback(data);
                }else{
                    console.info('get.noise:Fail to get data!');
                    if(typeof errorFn === 'function'){
                        errorFn();
                    }
                }
            }
        )
        .catch(e => {
            console.error(e);
        });
    }

    when(list=[]){
        let that = this;
        let ajaxList = list.map((f, index) => {
            return that.fetchData(f.url, {}, JSON.stringify(f.data), f.method);
        })
        return Promise.all(ajaxList);
    }

    getAll(){
        let list = [{
            url: '/scadaweb/get_tree?type=wtg&node_name_list=' + (scadaVar('g_field_parm') || ''),
            method: 'GET'
        },{
            url: '/scadaweb/uniForward/noiseControl/getMode',
            method: 'GET'
        },{
            url: '/scadaweb/uniForward/noiseControl/getData',
            method: 'GET'
        }];

        return this.when(list);
    }
};
