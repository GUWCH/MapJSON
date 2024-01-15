import React, {useEffect, useState} from "react";
import {PointSelect, PointSelectProps} from '@/components';
import {groupByTableNo} from '@/common/util-scada';
import { daoIsOk, _dao } from '@/common/dao';
import {Select} from 'antd';

import styles from './style.mscss';

import Intl, { msgTag } from '@/common/lang';
export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export interface DomainItem {
    domain_id: string,
    domain_name: string,
    model_id_vec: Array<{model_id: string, model_name: string, table_no: number, type: number}>
}

export interface PointItem {
    alias: string,
    const_name_list: Array<{name: string, value: number}>,
    field_no: number,
    if_standard: false,
    name_cn: string,
    name_en: string,
    point_type: string,
    table_no: number,
    type: string,
    unit: string,
}

export interface ModelSelectProps {
    domainOptions?: Array<DomainItem>,
    domainId?: string,
    domainName?: string,
    modelMap?: Object,
    modelId?: string,
    modelName?: string,
    points?: Array<PointItem>,
    onChange?: Function,
    pointSelecProps?: PointSelectProps
}

const defaultWidth = 200;

export const getQuotaKey = (ele) => {
    let {table_no = '', alias = '', field_no = ''} = ele;
    return table_no + ":" + alias + ":" + field_no;
}

export const pointTypes = [
    {typeKey: 'YC', noList: ['62'], name: msg('CURVE.yc')},
    {typeKey: 'YX', noList: ['61'], name: msg('CURVE.yx')},
    {typeKey: 'DD', noList: ['35'], name: msg('CURVE.dd')}
]

export const otherType = {typeKey: 'OTHER', name: msg('CURVE.other')};

const ModelSelect: React.FC<ModelSelectProps> = (props) => {

    const {
        domainOptions,
        modelMap,
        domainId = '',
        domainName,
        modelId = '',
        modelName,
        points = [],
        onChange = () => {},
        pointSelecProps = {}
    } = props;

    const [domains, setDomains] = useState([]);
    const [curModel, setCurModel] = useState({value: modelId, label: modelName || modelId}); // value&label
    const [curDomain, setCurDomain] = useState({value: domainId, label: domainName || domainId});  // value&label
    const [curModelMap, setCurModelMap] = useState({});
    const [domainLoading, setDomainLoading] = useState(false);
    const [curPoints, setCurPoints] = useState([]);

    const fetchModel = async (req) => {

        try {
            const res = await _dao.getModelsById(req);

            let newModelMap = Object.assign({}, curModelMap)
            
            if(daoIsOk(res) && Array.isArray(res.data)){
                Object.assign(newModelMap,
                    {[req.domain_id + '_' + req.model_id] : res.data}
                )
            }else{
                Object.assign(newModelMap, {[req.domain_id + '_' + req.model_id] : []})
            }

            setCurModelMap(JSON.parse(JSON.stringify(newModelMap)));

        } finally {
            
        }
    }
    
    useEffect(() => {
        const fetchDomains = async () => {
            setDomainLoading(true);
            const res = await _dao.getObjects();
            setDomainLoading(false);
            if(daoIsOk(res) && Array.isArray(res.data)){
                setDomains(res.data);
            }
        }

        fetchDomains();
    }, [])

    useEffect(() => {
        setCurDomain({value: domainId, label: domainName || domainId})
    }, [domainId, domainName])

    useEffect(() => {
        setCurModel({value: modelId, label: modelName || modelId})
    }, [modelId, domainName])

    useEffect(() => {

        if(curDomain.value && curModel.value && !curModelMap[curDomain.value + '_' + curModel.value]){
            fetchModel({
                domain_id: curDomain.value,
                model_id: curModel.value,
                if_public: false
            })
        }
    }, [curDomain, curModel])

    useEffect(() => {
        const newCurPoints = points.map(point => {return {
            key: getQuotaKey(point), 
            title: isZh ? point.name_cn : point.name_en
        }});
        setCurPoints(newCurPoints);
    }, points)

    const handlePointsChange = (valList) => {
        setCurPoints(valList);

        const modelkey = curDomain.value + '_' + curModel.value;
        const valKeys = valList.map(v => v.key);
        onChange({
            points: curModelMap[modelkey].filter(point => {
                let pointKey = getQuotaKey(point);

                return valKeys.indexOf(pointKey) > -1;
            })
        })
    }

    const handleModelChange = (valObj) => {
        setCurModel(valObj);
        setCurPoints([]);
        onChange({
            modelId: valObj.value,
            modelName: valObj.label,
            points: []
        })
    }

    const handleDomainChange = (valObj) => {
        setCurDomain(valObj);
        setCurPoints([]);
        setCurModel({value: '', label: ''});
        onChange({
            domainId: valObj.value,
            domainName: valObj.label,
            modelId: '',
            modelName: '',
            points: []
        })
    }

    const getPointsOptions = () => {
        const modelkey = curDomain.value + '_' + curModel.value;

        if(curModelMap[modelkey]){
            return groupByTableNo(curModelMap[modelkey].map(d => {
                const {name_cn, name_en, table_no} = d;
                return {
                    key: getQuotaKey(d),
                    name: isZh ? name_cn : name_en,
                    tableNo: table_no
                }
            }), pointTypes, otherType, true);
        }else{
            return null;
        }
    }

    return(
        <div className={styles.modelContainer}>
            <div className={styles.item}>
                <span>领域</span>
                <div className={styles.action}>
                    <Select
                        style={{ width: defaultWidth}}
                        disabled = {domainLoading ? true : false}
                        labelInValue={true} 
                        options={domains.map(domain =>{return {
                            label: domain.domain_name, 
                            value: domain.domain_id
                        }})}
                        onChange={(valObj) => handleDomainChange(valObj)} 
                        value={curDomain}
                    />
                </div>
            </div>
            <div className={styles.item}>
                <span>模型</span>
                <div className={styles.action}>
                    <Select
                        style={{ width: defaultWidth}}
                        disabled = {domainLoading ? true : false}
                        labelInValue={true} 
                        options={(domains.find(ele => ele.domain_id === curDomain.value)?.model_id_vec || []).map(model =>{return {
                            label: model.model_name, 
                            value: model.model_id
                        }})}
                        onChange={(valObj) => handleModelChange(valObj)} 
                        value={curModel}
                    />
                </div>
            </div>
            <PointSelect 
                limitNum = {-1} 
                selectedData = {curPoints} 
                options = {getPointsOptions() || []} 
                onChange = {handlePointsChange}
                treeProps = {{
                    treeDefaultExpandAll: true,
                    maxTagCount: "responsive",
                    disabled: getPointsOptions() === null ? true : false
                }}
            />
        </div>
    )
}

export default ModelSelect;