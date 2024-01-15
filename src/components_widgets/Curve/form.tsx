import React, { useMemo, memo, useEffect, useState, useRef } from 'react';
import {FormattedMessage, useIntl } from "react-intl";
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { Select, Switch, InputNumber, Tooltip, Input, Divider } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, {BaseProfile} from '@/components_utils/base';
import { InputTextSize } from '@/common/constants';
import { daoIsOk, _dao } from '@/common/dao';
import styles from './form.mscss';
import { PointSelect, DropDown } from '@/components';
import {FontIcon, IconType} from 'Icon';
import {
    pointTypes,
    otherType, 
    timeOptions,
    TIME_LIMIT_NUM,
    timeSetContent,
    pointDropDown,
    timeDropDown,
    getQuotaKey,
    msg,
    attriKeys,
    DATE_TYPE,
    tableNoList,
    granularityUnits,
    defaultRangeNum
} from './constant';
import lodash from 'lodash';
import {groupByTableNo} from '@/common/util-scada';

import Intl from '@/common/lang';
export const isZh = Intl.isZh;

export interface CurvePropsType {
	data: {};
	current: IBlockType;
	config: UserConfig;
};

interface ContentItem {
    tplTimeGran: string,
    tplInterval: Array<string>,
    tplDomainId: string,
    tplDomainName: string,
    tplModelId: string,
    tplModelName: string,
    tplModelNameCn: string,
    tplModelNumber:string,
    tplMax: number | string,
    tplPoints: []
}

interface Point {
    key: string;
    name: string;
    tableNo: number | string;
}

const randomString = () => {    
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (let i = 0; i < 8; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

const labelPoints = (contentItem, onAttriChange) => {
    return (contentItem?.tplPoints || []).map(point => {
        let {edictNameCn, edictNameEn, chartType, color, convert, subtract, table_no, isDefault, isPlan, axisProps} = point;
        return {
            title: isZh ? point.name_cn : point.name_en,
            key: point.key,
            dropDownContent: <DropDown 
                data = {{
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    chartType: chartType,
                    color: color,
                    convert: convert,
                    subtract: subtract,
                    isDefault: isDefault,
                    axisProps: axisProps,
                    isPlan: isPlan
                }}
                content = {pointDropDown(
                    table_no == '35' && contentItem.tplTimeGran !== DATE_TYPE.REALTIME, 
                    true, 
                    !!isDefault,
                    contentItem.tplTimeGran === DATE_TYPE.REALTIME
                )}
                onChange = {(attri) => onAttriChange(point.key, attri)}
            />
        };
    })
}

const PointsSet = (props) => {
    const intl = useIntl();

    const { 
        contentItem = {},
        modelMap = {}, 
        domains = [],
        onChange, 
        onModelChange
    } = props;

    const [modelMapData, setModelMapData] = useState(modelMap);

    useEffect(()=> {
        setModelMapData(modelMap)
    }, [modelMap])

    const handlePointsChange = (valList: Array<{key: string, title: string}>) => {
        let {tplPoints = [], tplDomainId, tplModelId} = contentItem;

        const optionalPoints = (modelMapData[tplDomainId + '_' + tplModelId] || []).map(point => {
            return Object.assign({}, point, {key: getQuotaKey(point)});
        })

        // add
        valList.map(val => {
            if(tplPoints.map(point => point.key).indexOf(val.key) === -1){
                const rawPoint = optionalPoints.find(option => option.key === val.key);
                let {table_no} = rawPoint;
                tplPoints.push(Object.assign(rawPoint, {
                    key: val.key,
                    name: val.title,
                }, table_no == '35' ? {subtract: 'normal'} : {}))
            }
        })

        // delete
        contentItem.tplPoints = tplPoints.filter(point => {
            return valList.map(ele => ele.key).indexOf(point.key) > -1
        })

        const valKeys = valList.map(val => val.key)

        // reorder
        contentItem.tplPoints.sort((a,b)=>{
            return valKeys.indexOf(a.key) - valKeys.indexOf(b.key);
        });

        onChange(contentItem)
    }

    const handleAttriChange = (pointKey, attri) => {
        if(contentItem){
            let point = contentItem.tplPoints.find(ele => ele.key === pointKey);
            if(point){
                Object.assign(point, attri);
                if(!attri['isDefault']){
                    attriKeys.map((key) => {
                        delete point[key]
                    })
                }
                
                onChange(contentItem)
            }
        }
    }

    const handleDomainChange = (valObj) => {

        Object.assign(contentItem, {
            tplDomainId: valObj.value,
            tplDomainName: valObj.label,
            tplModelId: '',
            tplModelName: '',
            tplModelNameCn: '',
            tplPoints: []
        })

        onChange(contentItem);

    }

    const getCurModelsByGran = () => {
        const {tplDomainId} = contentItem;
        if(tplDomainId){
            return (domains.find(domain => domain.domain_id === tplDomainId)?.model_id_vec || []).map((model) => {
                return {
                    label: isZh ? model.model_name_cn : model.model_name, 
                    value: model.model_id
                }
            })
        }

        return [];
    }
    const getCurModelNumberByGran = () => {
        const {tplDomainId,tplModelId} = contentItem;
        if(tplDomainId&&tplModelId){
            return (domains.find(domain => domain.domain_id === tplDomainId)?.model_id_vec || []).find((model) => model.model_id ==tplModelId)?.device_model_list.map(model=>{
                return {
                    label: model, 
                    value: model
                }
            })
        }

        return [];
    }
    const getCurModelItem = (modelId) => {
        const {tplDomainId} = contentItem;
        if(tplDomainId){
            const models = domains.find(domain => domain.domain_id === tplDomainId)?.model_id_vec || [];
            return models.find(m => m.model_id === modelId) || null;
        }
        
        return null;
    }

    const getPointsOptions = () => {
        let {tplDomainId = '', tplModelId = ''} = contentItem;
        let modelkey = tplDomainId + '_' + tplModelId;
         if(tplDomainId && tplModelId ){

            if(modelMapData[modelkey]){
                return groupByTableNo(modelMapData[modelkey].map(d => {
                    const {name_cn, name_en, table_no} = d;
                    return {
                        key: getQuotaKey(d),
                        name: isZh ? name_cn : name_en,
                        tableNo: table_no
                    }
                }), pointTypes, otherType, true);
            }else{
                return [];
            }
          
        }else{
            return [];
        }
    }

    return <div>
        <div className={styles.timeGran}>
            <span>{intl.formatMessage({id: 'form.curve.domain'})}</span>
            <Select 
                style={{ width: 164}}
                disabled = {contentItem ? false : true}
                labelInValue={true} 
                options={domains.map(domain =>{return {
                    label: isZh ? domain.domain_name_cn : domain.domain_name, 
                    value: domain.domain_id
                }})}
                onChange={handleDomainChange} 
                value={{
                    value: contentItem.tplDomainId, 
                    label: contentItem.tplDomainName
                }}
            />
        </div>
        <div className={styles.timeGran}>
            <span>{intl.formatMessage({id: 'form.curve.model'})}</span>
            <Select 
                style={{ width: 164}}
                labelInValue={true} 
                options={getCurModelsByGran()}
                onChange={(valObj) => {
                    const {value, label} = valObj;
                    Object.assign(contentItem, {
                        tplModelId: value,
                        tplModelName: getCurModelItem(value)?.model_name || '',
                        tplModelNameCn: getCurModelItem(value)?.model_name_cn || '',
                        tplPoints: []
                    });
                    onChange(contentItem);
                    onModelChange(contentItem);
                }}
                value={{
                    value: contentItem.tplModelId, 
                    label: isZh ? contentItem.tplModelNameCn : contentItem.tplModelName
                }}
            />
        </div>
        <div className={styles.timeGran}>
            <span>{intl.formatMessage({id: 'form.curve.modelNumber'})}</span>
            <Select 
                style={{ width: 164}}
                labelInValue={true} 
                options={getCurModelNumberByGran()}
                onChange={(valObj) => {
                    const {value, label} = valObj;
                    Object.assign(contentItem, {
                        tplModelNumber:value
                    });
                    onChange(contentItem);
                    onModelChange(contentItem);
                }}
                value={{
                    value: contentItem.tplModelNumber, 
                    label: contentItem.tplModelNumber
                }}
            />
        </div>
        <PointSelect 
            limitNum={-1} 
            selectedData = {labelPoints(contentItem, (pointKey, attri) => handleAttriChange(pointKey, attri))} 
            options = {getPointsOptions()} 
            onChange = {handlePointsChange}
            treeProps = {{
                treeDefaultExpandAll: true,
                maxTagCount: "responsive"
            }}
        />
    </div>
}

const OtherModels = (props) => {

    const intl = useIntl();

    const {list = [], domains, modelMap, onChange, onModelChange} = props;

    const handleAdd = () => {

        list.push({
            key: randomString(),
            customAssetAlias: '',
            tplDomainId: '',
            tplDomainName: '',
            tplModelId: "",
            tplModelName: "",
            tplModelNameCn: "",
            tplPoints: [],
        })

        onChange({otherModelList: list})
    }

    const handleChange = (key, value) => {
        let item = list.find(l => l.key === key);
        Object.assign(item, value)
        onChange({otherModelList: list});
    }

    const handleDelete = (key) => {
        let newList = list.filter(l => l.key !== key);
        onChange({otherModelList: newList});
    }

    return <div className={styles.addModel}>
        <div className={styles.addModelDes}>
            <span onClick={handleAdd}>
                <FormattedMessage id='form.curve.addOtherModel' />
            </span>
        </div>
        {list.map((ele, index) => {
            let {key, customAssetAlias = ''} = ele;

            return <div key={index} className = {styles.modelItem}>
                <div className={styles.delete}>
                    <FontIcon type={IconType.WRONG_S} onClick = {() => handleDelete(key)}/>
                </div>
                <Divider style={{margin: '5px 0'}}/>
                <div className={styles.asset}>
                    <span><FormattedMessage id='form.base.asset' /></span>
                    <Tooltip 
                        placement="top" 
                        title={
                            <div dangerouslySetInnerHTML={{
                                __html:intl.formatMessage({id: 'form.base.assetDesc'}) 
                            }}></div>
                        }
                        overlayStyle={{
                            maxWidth: 500,
                            fontSize: 12
                        }}
                    >
                        <QuestionCircleFilled 
                            style={{cursor: 'help'}}
                        />
                    </Tooltip>
                    <Input 
                        type={'text'} 
                        onChange={(e) => {
                            handleChange(key, {'customAssetAlias': e.target.value});
                        }}
                        value={customAssetAlias} 
                        maxLength={InputTextSize.Alias}
                    />
                </div>
                <PointsSet 
                    contentItem = {ele}
                    domains = {domains}
                    modelMap = {modelMap}
                    onChange = {(val) => {
                        handleChange(key, val)
                    }}
                    onModelChange = {onModelChange}
                />
            </div>
        })}
    </div>

}

const labelTimes = (data = [], onInvertalChange, domains, modelMap, onChange, onModelChange, onOtherChange) => {
    const intl = useIntl();

    return data.map(d => {
        const {tplTimeGran, tplInterval, otherModelList, tplMax, tplRangeNum = defaultRangeNum, tplRangeUnit = granularityUnits[0].value} = d;
        const timeItem = timeOptions.find(option => option.key === tplTimeGran);
        return {
            title: timeItem?.title || tplTimeGran,
            key: tplTimeGran,
            dropDownContent: <div>
                <div className = {styles.dropDownItem}>
                    <span><FormattedMessage id='form.curve.interval'/></span>
                    <Tooltip 
                        placement="top" 
                        title={
                            <div dangerouslySetInnerHTML={{
                                __html:intl.formatMessage({id: 'form.curve.intervalDesc'}) 
                            }}></div>
                        }
                        overlayStyle={{
                            maxWidth: 500,
                            fontSize: 12
                        }}
                    >
                        <QuestionCircleFilled 
                            style={{cursor: 'help'}}
                        />
                    </Tooltip>
                    <Select 
                        mode='multiple'
                        maxTagCount = "responsive"
                        style={{ width: 164}}
                        value = {tplInterval}
                        options = {(timeSetContent.find(item => item.key === tplTimeGran)?.options || []).map(o => {
                            return {
                                label: o.name,
                                value: o.value
                            }
                        })}
                        onChange = {(value) => onInvertalChange(tplTimeGran, {tplInterval: value})}
                    />
                </div>
                <div className={styles.timeGran}>
                    <span>{intl.formatMessage({id: 'form.curve.max'})}</span>
                    <InputNumber 
                        style={{ width: 164}}
                        min = {1}
                        max = {5}
                        value = {tplMax}
                        onChange = {(value) => onOtherChange({tplMax: value}, tplTimeGran)}
                    />
                </div>
                {tplTimeGran === DATE_TYPE.CUSTOMIZE ? <div className={styles.timeGran}>
                    <span>{intl.formatMessage({id: 'form.curve.range'})}</span>
                    <InputNumber 
                        style={{ width: 60, marginLeft: 'auto'}}
                        min = {1}
                        value = {tplRangeNum}
                        onChange = {(value) => onOtherChange({tplRangeNum: value}, tplTimeGran)}
                    />
                    <Select
                        style={{ width: 94, marginLeft: '10px'}}
                        value = {tplRangeUnit}
                        options = {granularityUnits}
                        onChange = {(value) => onOtherChange({tplRangeUnit: value}, tplTimeGran)} />
                </div> : null}
                <PointsSet 
                    contentItem = {d}
                    domains = {domains}
                    modelMap = {modelMap}
                    onChange = {(val) => {
                        let newContent = data.map(ele => ele);
                        let tempItem = newContent.find(newD => newD.tplTimeGran === tplTimeGran);
                        Object.assign(tempItem, val);
                        onChange({contentData: newContent});
                    }}
                    onModelChange = {onModelChange}
                />
                <OtherModels 
                    list ={otherModelList} 
                    onChange = {(obj) => {onOtherChange(obj, tplTimeGran)}}
                    domains = {domains}
                    modelMap = {modelMap}
                    onModelChange = {onModelChange}
                />
            </div>
        };
    })
}

const Curve: React.FC<CurvePropsType> = (props: CurvePropsType) => {

    const intl = useIntl();

    const store = props.config.getStore();

    const [domains, setDomians] = useState([]);
    const tempModelMap = useRef({});
    const [modelMap, setModelMap] = useState({})
    const [isLoading, setIsLoading] = useState(false);

    const {contentData = [], timeSelectEnable = false} = props.current.props;
    const [curGrain, setCurGrain] = useState(contentData[0]?.tplTimeGran || '');

    const onChange = (values: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = {...v.props, ...values};
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    const fetchDomains = async () => {
        const res = await _dao.getObjects();
        if(daoIsOk(res)){
            setDomians(res.data);
        }
    }

    const fetchModel = async (req) => {

        try {
            // setIsLoading(true);
            const res = await _dao.getModelsById(req);
            
            if(daoIsOk(res) && Array.isArray(res.data)){
                Object.assign(tempModelMap.current,
                    {[req.domain_id + '_' + req.model_id] : res.data.filter(
                        d => tableNoList.indexOf(String(d.table_no)) > -1
                    )}
                )
            }else{
                Object.assign(tempModelMap.current, {[req.domain_id + '_' + req.model_id] : []})
            }

        } finally {
            // setIsLoading(false);
            setModelMap(JSON.parse(JSON.stringify(tempModelMap.current)));
        }
    }

    useEffect(() => {
        let curReq = [];
        contentData.map((item, index) => {
            const {tplDomainId, tplModelId, otherModelList} = item;

            const keyStr = tplDomainId + '_' + tplModelId;

            if(tplDomainId && tplModelId && curReq.indexOf(keyStr) === -1){
                curReq.push(keyStr);

                fetchModel({
                    domain_id: tplDomainId,
                    model_id: tplModelId,
                    if_public: true
                })
            }

            if(otherModelList && otherModelList.length > 0){
                otherModelList.map(ele => {
                    const {tplDomainId, tplModelId} = ele;
                    const eleKeyString = tplDomainId + '_' + tplModelId;
                    if(tplDomainId && tplModelId && curReq.indexOf(eleKeyString) === -1){
                        curReq.push(eleKeyString);
                        fetchModel({
                            domain_id: tplDomainId,
                            model_id: tplModelId,
                            if_public: true
                        })
                    }
                })
            }
        })
    }, [])

    useEffect(() => {
        fetchDomains();
    }, [])

    const handleGrainChange = (Grains) => {

        let newData = contentData.map(ele => ele);

        // add
        Grains.map(Grain => {
            if(newData.map(ele => ele.tplTimeGran).indexOf(Grain.key) === -1){
                newData.push({
                    tplTimeGran: Grain.key,
                    tplInterval: (timeSetContent.find(ele => ele.key === Grain.key)?.options || []).map(item => item.value),
                    tplRangeUnit: granularityUnits[0].value,
                    tplRangeNum: defaultRangeNum,
                    tplPoints: []
                })
            }
        })

        const GrainKeys = Grains.map(ele => ele.key);

        // delete
        newData = newData.filter(item => {
            return GrainKeys.indexOf(item.tplTimeGran) > -1
        })

        // reorder
        newData.sort((a,b)=>{
            return GrainKeys.indexOf(a.tplTimeGran) - GrainKeys.indexOf(b.tplTimeGran);
        });

        onChange({contentData: newData});

        if(!curGrain && Grains[0]){
            setCurGrain(Grains[0].key)
        }
    }

    const handleIntervalChange = (timeGran, attri) => {
        let newContentData = contentData.map(ele => ele);

        let item = newContentData.find(ele => ele.tplTimeGran === timeGran);

        if(item) {
            const order = (timeSetContent.find(ele => ele.key === timeGran)?.options || [])?.map(o => o.value)
            Object.assign(item, Object.assign({}, attri, {
                tplInterval: attri['tplInterval'].sort((a, b) => {
                    return order.indexOf(a) - order.indexOf(b)
                })
            
            }));
            onChange({contentData: newContentData});
        }
    }

    const handleTimeEnable = () => {

        onChange(Object.assign(
            {timeSelectEnable: !timeSelectEnable},
            !!timeSelectEnable && contentData.length > 1 ? {contentData: [contentData[0]]} : {}
        ));
    }

    const handleModelChange = (item) => {

        const {tplDomainId, tplModelId} = item;

        if((!modelMap[tplDomainId + '_' + tplModelId]) && tplDomainId && tplModelId){
            fetchModel({
                domain_id: tplDomainId,
                model_id: tplModelId,
                if_public: true
            })
        }
    }

    const handleOtherChange = (valObj, curGrainVal) => {
        let newContent = contentData.map(ele => ele);

        let item = newContent.find(item => item.tplTimeGran === curGrainVal);

        Object.assign(item, valObj)

        onChange({contentData: newContent});
    }


    return <BaseInfo {...props}>
        <BaseProfile {...props} ></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.curve.pointselect'})} key="1">
                <div className={styles.enable}>
                    <span>{intl.formatMessage({id: 'form.curve.timeSelectEnable'})}</span>
                    <Switch checked = {timeSelectEnable} onChange={handleTimeEnable} />
                </div>
                <div className={styles.content}>
                    <div className={styles.block}>
                        <div className={styles.title}>{intl.formatMessage({id: 'form.curve.timeGranSet'})}</div>
                        <PointSelect 
                            limitNum={timeSelectEnable ? TIME_LIMIT_NUM : 1} 
                            selectedData = {labelTimes(
                                contentData, 
                                (timeGran, attri) => handleIntervalChange(timeGran, attri),
                                domains,
                                modelMap,
                                onChange,
                                handleModelChange,
                                handleOtherChange
                            )} 
                            options = {timeOptions} 
                            onChange = {handleGrainChange}
                            treeProps = {{
                                treeDefaultExpandAll: true
                            }}
                        />
                    </div>
                </div>
            </CollapsePanel>
        </SingleCollapse>            
    </BaseInfo>
}

export default memo(Curve);