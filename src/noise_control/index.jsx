/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import Intl, {msgTag} from '../common/lang';
import {uuid} from '../common/utils';
import {LegalData, EmptyList} from '../common/dao';
import EnvLoading from 'EnvLoading';
import {notify, getNoiseMode, zoneCol, zoneRow, nameMax} from './Constant';
import NoiseDao from './dao';
import Tree from './components/Tree';
import Zone from './Zone';

const msg = msgTag('noise');
const defPrefix = 'noise-control';

import '../common/css/app.scss';
import './index.scss';
class Noise extends React.Component{
    constructor(props){
        super(props);

        this.displayName = 'Noise Control';
        this.zoneContainer = null;
        this.resize = this.resize.bind(this);
        this._dao = new NoiseDao();

        this.checkedWtgsAlias = [];
        this.wtgAliasMaps = {};
        this.modelMaps = {};
        this.noiseDataMemo = [];

        this.state = {
            noiseData:[],
            rcTreeData: [],

            isLoading: false,            
            available: false
        };
    }

    componentWillMount() {
    }

    componentDidMount() {
        //获取风机、降噪模式和已存数据
        this.getAllData();

        window.addEventListener('resize', this.resize);
        this.resize();
    }

    componentWillUpdate() {

    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    getAllData(){
        this.setState({
            isLoading: true
        });

        let rcTreeData = [], noiseData = [],  available = true;

        this._dao.getAll()
        .then(responses => {
            let ok = true;
            for(let response of responses){
                if(!response.ok){
                    ok = false;
                }
            }
            
            if(ok){
                return responses;
            }
            
            throw new Error('请求数据有错误');
        })
        .then(([wtgDataRes, modesRes, noiseRes]) => {
            return Promise.all([wtgDataRes.json(), modesRes.json(), noiseRes.json()]);
        })
        .then(([wtgData, modes, noise]) => {
            if(LegalData(wtgData)){
                wtgData = wtgData.data || [];
                let nodeType = ['BAY_TURBINE']
                let modelMap = {};
                let modelId = {};

                wtgData
                .filter((f, ind) => {
                    return nodeType .indexOf(f.node_type) > -1;
                })
                .forEach((f, ind) => {
                    modelId[f.model] = f.model_id;
                    modelMap[f.model] = modelMap[f.model] || [];
                    modelMap[f.model].push({
                        key: f.alias,
                        title: f.display_name,
                        ...f
                    });
                    this.wtgAliasMaps[f.alias] = f;
                });
                rcTreeData = Object.keys(modelMap).map((model) => {
                    return {
                        key: modelId[model],
                        title: model,
                        children: modelMap[model] || []
                    };
                });
            }else{
                available = false;
            }

            if(LegalData(modes)){
                modes = modes.data || [];
                modes.forEach(f => {
                    this.modelMaps[f.wtg_model_alias] = f.noise_mode_list;
                });
            }else{
                available = false;
            }

            if(LegalData(noise)){
                noiseData = (noise.data || []).map(ele => {
                    //生成唯一key,防止增删改重复渲染
                    ele.key = uuid();
                    return ele;
                });
            }else{
                available = false;
            }

            if(!available){
                notify(msg('getDataFail'));
            }

            this.noiseDataMemo = JSON.parse(JSON.stringify(noiseData));
            this.setState({
                rcTreeData,
                noiseData,
                available
            }, ()=>{
                //console.log(this);
            });
        })
        .catch(e => {
            console.error(e);
        })
        .finally(() => {
            this.setState({
                isLoading: false
            });
        });
    }

    addBlock() {
        let zoneData = getNoiseMode();
        zoneData.key = uuid();
        this.setState({
            noiseData:this.state.noiseData.concat([JSON.parse(JSON.stringify(zoneData))])
        }, () => {
            this.noiseDataMemo = this.noiseDataMemo.concat([JSON.parse(JSON.stringify(zoneData))]);

            let {scrollHeight, clientHeight} = this.zoneContainer;
            this.zoneContainer.scrollTop = scrollHeight - clientHeight;
        });
    }

    delBlock(index){
        this.setState({
            noiseData:this.state.noiseData.filter((f, ind) => ind !== index)
        }, () => {
            this.noiseDataMemo = this.noiseDataMemo.filter((f, ind) => ind !== index);
        });
    }

    copyBlock(index){
        let temp = JSON.parse(JSON.stringify(this.noiseDataMemo));
        let meCopy = temp.filter((f, ind) => ind === index)[0];
        if(!meCopy) return;

        if(meCopy.block_name){
            meCopy.block_name = meCopy.block_name + '-' + msg('copy');
        }        
        meCopy.key = uuid();

        this.noiseDataMemo.splice(index+1, 0, meCopy);
        let noiseData = this.state.noiseData;
        noiseData.splice(index+1, 0, JSON.parse(JSON.stringify(meCopy)));
        
        this.setState({
            noiseData: noiseData
        });
    }

    change(index, data){
        this.noiseDataMemo.splice(index, 1, JSON.parse(JSON.stringify(data)));

        if(window.___debug___ && console !== undefined){
            console.log(this);
        }        
    }

    //转换数据并检查
    isOverlapping = (block_name, data, isCycle, keysMap) => {
        let isRangeFlag = true;
        let concatArray = [];

        if(!isCycle){
            isRangeFlag = data.some(item => {
                return +item[keysMap.checkIn] >= +item[keysMap.checkOut];
            })
            if(isRangeFlag){
                notify([block_name] + " "+ msg('less'));
                return true;
            }
        }else{
            isRangeFlag = data.some(item => {
                    return item[keysMap.checkIn] === item[keysMap.checkOut];
                })
            if(isRangeFlag){
                notify([block_name] + " "+ msg('equal'));
                return true;
            }

            data.map((item, index) => {
                if(+item[keysMap.checkIn] > +item[keysMap.checkOut] && 
                    +item[keysMap.checkIn] !== 360 && 
                    +item[keysMap.checkOut] !== 0){

                    data.splice(
                        index, 
                        1, 
                        {[keysMap.checkIn]:item[keysMap.checkIn], [keysMap.checkOut]:"360"}, 
                        {[keysMap.checkIn]:"0", [keysMap.checkOut]:item[keysMap.checkOut]}
                        )

                }else if(+item[keysMap.checkIn] === 360 && +item[keysMap.checkOut] === 0){
                    item[keysMap.checkIn] = "0";
                    item[keysMap.checkOut] = "360";

                }else if(+item[keysMap.checkIn] === 360){
                    item[keysMap.checkIn] = "0";

                }else if(+item[keysMap.checkOut] === 0){
                    item[keysMap.checkOut] = "360";
                }
            })
        }

        data.map(item => {
            concatArray.push(+item[keysMap.checkIn]);
            concatArray.push(+item[keysMap.checkOut]);
        })

        concatArray.sort((a, b) => {return a - b});

        for (let i = 0; i < concatArray.length; i += 2){
            isRangeFlag = data.some(item => {
                return +item[keysMap.checkIn] === concatArray[i] && 
                +item[keysMap.checkOut] === concatArray[i+1];
            });
            if(isRangeFlag){
                continue;
            }else{
                notify([block_name] + " "+ msg('overlap'));
                return true; 
            }
        }
        return false; 
    }


    /**
     * return boolean
     */
    check(){
        let angelKeysMap = {checkIn: "sector_in", checkOut: "sector_out"}
        let windspeedKeysMap = {checkIn: "windspeed_in", checkOut: "windspeed_out"}

        let sendData = this.noiseDataMemo;

        let nameObj = {};
        for(let zoneIdx = 0; zoneIdx < sendData.length; zoneIdx++ ){

            let {
                block_name='',
                time_in='',
                time_out='',
                modes=[],
                wtg_alias_list=[]
            } = sendData[zoneIdx];

            if(!block_name){                    //子区名称为空
                notify(msg('nullName'));
                return false;

            }else if(block_name.length > nameMax){            //子区名称过长
                notify([block_name] + " "+ msg('overLength'));
                return false;

            }else if(nameObj[block_name]){               //子区名称存在重复
                notify([block_name] + " "+ msg('repeat'));
                return false;
                
            }else{
                nameObj[block_name] = true;
            }

            if(!time_in || !time_out){          //日期区间不能为空
                notify([block_name] + " "+ msg('nullDate'));
                return false;

            }else if(time_in.length !== 19 || time_out.length !== 19){   //时间区间不能为空
                notify([block_name] + " "+ msg('nullTime')); 
                return false;
            }
            
            if(wtg_alias_list.length === 0){
                notify([block_name] + " "+ msg('nullWtgList'));         // 风机列表不能为空
                return false;
            }
               
            for(let i = 0; i < modes.length; i++){
                let item = modes[i];
                if ((!item.sector_in && item.sector_out) || 
                (item.sector_in && !item.sector_out)){
                    notify([block_name] +" " + msg('angleLost'));                    // 扇区左右值不能有缺失
                    return false;
                }
                if ((!item.windspeed_in && item.windspeed_out) || 
                (item.windspeed_in && !item.windspeed_out)){
                    notify([block_name] +" " + msg('windspeedLost'));                   // 风速左右值不能有缺失
                    return false;
                }
            }

            let angleList = [];
            let windspeedList = []; 

            if(modes.length < zoneCol * zoneRow){
                continue;
            }else{
                for(let sectorIdx = 0; sectorIdx < zoneCol; sectorIdx++){              
                    if (modes[sectorIdx].sector_in && modes[sectorIdx].sector_out){                        
                        angleList.push({
                            sector_in: modes[sectorIdx].sector_in,
                            sector_out: modes[sectorIdx].sector_out
                        });
                    }
                }

                for(let windspeedIdx = 0; windspeedIdx < modes.length; windspeedIdx += zoneCol){              
                    if (modes[windspeedIdx].windspeed_in && modes[windspeedIdx].windspeed_out){                        
                        windspeedList.push({
                            windspeed_in: modes[windspeedIdx].windspeed_in,
                            windspeed_out: modes[windspeedIdx].windspeed_out
                        });
                    }
                }

                if(angleList.length > 0 && windspeedList.length > 0){
                    if(this.isOverlapping(block_name, angleList, true, angelKeysMap) || 
                    this.isOverlapping(block_name, windspeedList, false, windspeedKeysMap)){
                        return false;
                    }
                }else{                                      //模式数据不能空
                    notify([block_name] + " " + msg('nullInterval'));
                    return false;
                }
            }            
        }
        return true;
    }

    save = () => {
        if(!this.check()) return;
        
        let temp = JSON.parse(JSON.stringify(this.noiseDataMemo));
        this.setState({
            isLoading: true
        });
        this._dao.setNoise({
            data: temp.map(f => {
                f.modes = f.modes.filter(ele =>{
                    let { windspeed_in, windspeed_out, sector_in, sector_out} = ele || {};
                    return windspeed_in && windspeed_out && sector_in && sector_out;
                });
                if(f.key){
                    delete f.key;
                }
                return f;
            })
        }, () => notify(msg('successSave')), () => notify(msg('failSave')))
        .finally(() => {
            this.setState({
                isLoading: false
            });
        });
    }

    /**
     * 
     * @param {*} wtgList 
     */
    getInfo(wtgList){
        let models = {};
        let modelWtgs = {};
        let wtgs = [];
        let noWtgs;
        (wtgList || this.checkedWtgsAlias.map(f=>f.alias)).map((wtgAlias, ind) => {
            let wtgInfo = this.wtgAliasMaps[wtgAlias];
            if(wtgInfo){
                let {model, model_id} = wtgInfo;
                modelWtgs[model] = modelWtgs[model] || [];
                modelWtgs[model].push(Object.assign({}, wtgInfo));
                models[model] = model_id;
                wtgs.push(Object.assign({}, wtgInfo));
            }else{
                noWtgs = noWtgs || [];
                noWtgs.push(wtgAlias);
            }
        });

        if(noWtgs){
            notify(msg('noWtg', [noWtgs.join(',')]));
        }

        if(wtgs.length === 0){
            return null;
        }

        let modelMap = {};
        Object.keys(models).map(model => {
            if(this.modelMaps[model]){
                modelMap[model] = JSON.parse(JSON.stringify(this.modelMaps[model]));
            }            
        });

        return {
            wtgs,
            modelMap,
            models,
            modelWtgs
        };
    }

    resize(){
    }

    render() {
        return (
            <div className={`${defPrefix}`}>
                <aside>
                    <h3>{msg('wtgList')}</h3>
                    <div>
                        {
                            (this.state.rcTreeData||[]).length > 0 ?
                            <Tree 
                                checkable={true}
                                showIcon={false}
                                showLine={false}
                                autoExpandParent={false}
                                defaultExpandAll={false}
                                onCheck={(checkedKeys, info) => {
                                    let {checkedNodes=[], checked} = (info || {});
                                    this.checkedWtgsAlias = checkedNodes
                                    .filter(f => !!!f.children)
                                    .map(f => ({
                                        name: f.title,
                                        alias: f.key
                                    }));
                                }}
                                treeData={this.state.rcTreeData}
                            /> : null
                        }                        
                    </div>
                </aside>
                <div className={`${defPrefix}-main`}>
                    <h3>{msg('zoneSet')}</h3>
                    <div>
                        <div ref={ele => this.zoneContainer = ele}>
                            {
                                this.state.noiseData.map((zoneData, ind) => {
                                    return (
                                        <Zone
                                            key = {zoneData.key}
                                            zoneData = {JSON.parse(JSON.stringify(zoneData))}
                                            copyFn={() => {this.copyBlock(ind);}}
                                            delFn={() => {this.delBlock(ind);}}
                                            getInfo={(wtgList) => {
                                                return this.getInfo(wtgList);
                                            }}
                                            change={(data) => {
                                                this.change(ind, data);
                                            }}
                                        />
                                    )
                                })
                            }
                        </div>

                        <div>
                            <button 
                                type={'button'}
                                disabled={!this.state.available}
                                onClick = {e => {
                                    this.addBlock();
                                }}
                            >{msg('addZone')}</button>
                        </div>
                    </div>
                </div>
                <div className={`${defPrefix}-save`}>
                    <button 
                        type={'button'}
                        disabled={(!this.state.available)}
                        onClick = {(e)=>{
                           this.save();
                        }}
                    >{msg('save')}</button>
                </div>
                <EnvLoading isLoading={this.state.isLoading}/>
            </div>
        );
    }
}

ReactDOM.render(<Noise />, document.getElementById('center'));

export default Noise;

/* eslint-enable */