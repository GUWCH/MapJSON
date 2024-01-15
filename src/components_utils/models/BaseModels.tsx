import React, { useMemo, memo, useEffect, useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import _ from 'lodash';
import { MenuOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { FontIcon, IconType } from 'Icon';
import { _dao, daoIsOk } from '@/common/dao';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { isZh } from '@/common/util-scada';
import {Select} from 'antd'
import { 
    uIdKey, BaseMode, getPointName, generatePointKey, TFilterType, 
    DomainModel, ObjectModel, PointModel, RenderObject, RenderPoint, RenderDomain, 
    RenderTreeSelect,RenderType
} from './_util';

interface BasePropsType {
    children?: React.ReactNode;
    multiple?: boolean; // 跨领域多选, 自动treeselect模式渲染
    treeSelect?: boolean; // 只有单选才会生效
    needPrivate?: boolean;
    filterType?: TFilterType[]; // needSelectPoint时显示的测点类型
    objectMode?: BaseMode;
    pointMode?: BaseMode;
    selectedDomain?: DomainModel; // multiple=true时为undefined
    selectedObject?: ObjectModel | ObjectModel[];
    selectedModel?:string,
    selectStyle?: React.CSSProperties;
    needSelectPoint?: boolean;
    pointListStyle?: React.CSSProperties;
    onChange: ({...args}: {
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel | ObjectModel[];
        selectedModel?:string
    }) => void
};

const treeSelectMultiple = ['multiple', 'tags'];
const BaseModels: React.FC<BasePropsType> = ({
    multiple=false,
    treeSelect=false,
    needPrivate=false,
    objectMode, 
    pointMode,
    selectedDomain, 
    selectedObject, 
    selectedModel,
    selectStyle={},
    needSelectPoint=false,
    pointListStyle={},
    onChange,
    filterType,
    children
}: BasePropsType) => {
    
    const isTreeSelect = multiple 
        || (
            treeSelect 
            && treeSelectMultiple.indexOf(String(objectMode)) === -1 
            && treeSelectMultiple.indexOf(String(pointMode)) === -1
        );
    const [domainData, setDomainData] = useState<DomainModel[]>([]);
    const [objectPoint, setObjectPoint] = useState<{[key: string]: PointModel[]}>({});
    // const [modelData, setModelData] = useState<string[]>([])

    // multiple时不适用
    const domainValue = selectedDomain?.domain_id;
    const objectList = domainData.find(d => d.domain_id === domainValue)?.model_id_vec || [];

    const objectValue = Array.isArray(selectedObject) 
        ? selectedObject.map((d) => d.model_id) 
        : selectedObject?.model_id;
        const objectValueStr = Array.isArray(objectValue) 
        ? objectValue.sort().join(',')
        : objectValue;
    let modelData = selectedObject?.device_model_list||[]
    const modelValue = selectedModel     
    useEffect(() => {
        fetchObjects();
    }, []);

    useEffect(() => {
        if(needSelectPoint){
            const selectObj = Array.isArray(selectedObject) ? selectedObject : selectedObject ? [selectedObject] : [];
            selectObj.map((object) => {
                if(!objectPoint[object.model_id]){
                    const domain = object.domain || selectedDomain;
                    if(domain){
                        fetchPoints(domain.domain_id, object.model_id);
                        const matchedObject = domainData.find(el=>el.domain_id == domain.domain_id)
                        if(matchedObject&&matchedObject.model_id_vec){
                            const matchedModel = matchedObject.model_id_vec.find(el=>el.model_id == object.model_id)
                            // const options = []
                            // matchedModel?.length&&matchedModel.device_model_list.map(el=>{
                            //     options.push({value:el,label:el})
                            // })
                            // setModelData(options)
                        }
                    }
                }
            });
        }        
    }, [domainValue, objectValueStr]);

    const fetchObjects = async () => {
        const res = await _dao.getObjects();
        let domainData = daoIsOk(res) ? res.data : [];
        // multiple时需要领域数据
        domainData.map(d => {
            const {domain_id, domain_name, domain_name_cn } = JSON.parse(JSON.stringify(d)) as DomainModel;
            (d?.model_id_vec || []).map((m: ObjectModel) => {
                m.domain = {
                    domain_id,
                    domain_name,
                    domain_name_cn
                };
            });
        })
        setDomainData(domainData);
    }

    const fetchPoints = async (domainId, objId) => {
        const res = await _dao.getModelsById({
            domain_id: domainId,
            model_id: objId,
            if_public: !!!needPrivate
        });

        if(daoIsOk(res)){
            setObjectPoint(d => Object.assign({}, d, {[objId]: res.data.map(d => {
                d[uIdKey] = generatePointKey(d as unknown as PointModel)
                return d;
            })}));
        }
    }

    const getDomain = (domainId) => {
        return domainData.find(d => d.domain_id === domainId);
    }

    /** 单选字符, 多选字符列表, 目前多选不适用objectList未赋值 */
    const getObject = (objectIds: string | string[]) => {
        if(Array.isArray(objectIds)){
            return objectList.filter(object => objectIds.indexOf(object.model_id) > -1);            
        }else{
            return objectList.find(object => object.model_id === objectIds );
        }
    }

    const onDomainChange = (value, option) => {
        const selectedDomain = getDomain(value);
        onChange(JSON.parse(JSON.stringify({selectedDomain})));
    }

    /** 单选字符, 多选字符列表, 适用单选多选 */
    const onObjectChange = (objIds: string | string[], option?: any) => {
        let obj = getObject(objIds);
        if(Array.isArray(objIds)){
            obj = objIds.map(objId => {
                const selectObj = selectedObject?.find(s => s.model_id === objId);
                return Object.assign({}, selectObj || {});
            });
        }
        const options = []
        // obj.device_model_list.length&&obj.device_model_list.map(el=>{
        //     options.push({value:el,label:el})
        // })
        // console.log('options',options)
        // setModelData(obj.device_model_list)
        modelData = obj.device_model_list
        // modelData = obj.device_model_list
        onChange(JSON.parse(JSON.stringify({selectedDomain, selectedObject: obj,selectedModel})));
    }

    const onModelChange = (value: string | string[], option?: any) => {
        onChange(JSON.parse(JSON.stringify({selectedDomain, selectedObject,selectedModel:value})));
    }

    const onPointChange = (value: string | string[], currentObject?: ObjectModel) => {
        if(Array.isArray(value)){
            if(currentObject){
                currentObject.selectedPoint 
                    = objectPoint[currentObject.model_id]?.filter(p => value.includes(generatePointKey(p) as string));
            }
        }else if(selectedObject){
            if(currentObject){
                currentObject.selectedPoint 
                    = objectPoint[currentObject.model_id]?.find(p => generatePointKey(p) === value);
            }
        }

        onChange(JSON.parse(JSON.stringify({selectedDomain, selectedObject,selectedModel})));
    }

    const onPointSortChange = (multi: boolean, points: PointModel[], currentObject?: ObjectModel) => {
        if(multi){
            if(currentObject){
                currentObject.selectedPoint = points;
            }
        }else{
            if(currentObject){
                currentObject.selectedPoint = points[0];
            }
        }
        onChange(JSON.parse(JSON.stringify({selectedDomain, selectedObject,selectedModel})));
    }

    const renderOrderPoint = (selectedObject: ObjectModel) => {
        const selectPoint = selectedObject?.selectedPoint;
        let pointValue;
        let pointList: PointModel[] = [];
        if(Array.isArray(selectPoint)){
            pointValue = selectPoint.map(p => generatePointKey(p));
            pointList = selectPoint;
        }else{
            pointValue = generatePointKey(selectPoint);
            pointList = selectPoint ? [selectPoint] : [];
        }

        return <div>
            <RenderPoint
                mode={multiple ? 'multiple' : pointMode}
                value={pointValue} 
                data={selectedObject?.model_id ? objectPoint[selectedObject?.model_id] : []} 
                onChange={(value, label, extra) => {onPointChange(value, selectedObject)}}
                filterType={filterType}
            />
            <ReactSortable 
                list={pointList.map(p => ({id: generatePointKey(p) || '', ...p}))}
                setList={(pointList) => 
                    onPointSortChange(
                        Array.isArray(selectPoint),
                        pointList, 
                        selectedObject
                    )
                }
                handle='span.anticon'
                filter='.disable_item'
                animation={200}
                style={Object.assign({maxHeight: 250, overflowY: 'auto'}, pointListStyle)}
            >
                {
                    pointList.map((point, index) => {
                        return <div 
                            key={index} 
                            style={{
                                margin: '5px 0',
                                padding: '5px 0',
                                background: '#eee'
                            }}
                        >
                            <MenuOutlined 
                                style={{marginRight: 5, cursor: 'move'}}
                            />
                            <p 
                                style={{
                                    display: 'inline-block',
                                    width: 'calc(100% - 30px)' 
                                }}
                            >
                                {getPointName(point)}
                            </p>
                            <MinusCircleOutlined
                                className="dynamic-delete-button"
                                onClick={() => {
                                    pointList.splice(index, 1);
                                    onPointSortChange(
                                        Array.isArray(selectPoint),
                                        pointList, 
                                        selectedObject
                                    )
                                }}
                            />
                        </div>
                    })
                }
            </ReactSortable>
        </div>
    }

    const renderObjectChildren = () => {
        if(!selectedObject) return null;

        if(!Array.isArray(selectedObject)){
            return renderOrderPoint(selectedObject as ObjectModel);
        }

        return selectedObject.map((object, ind) => {
            return <SingleCollapse key={object.model_id} style={selectStyle}>
                <CollapsePanel 
                    key={object.model_id + '_1'}
                    header={isZh ? object.model_name_cn || object.model_name : object.model_name}
                    extra = {
                        <span
                            onClick={() => {
                                const value = selectedObject.map(o => o.model_id).filter(v => v !== object.model_id);
                                onObjectChange(value);
                            }}
                        >
                            <FontIcon type = {IconType.DELETE}/>
                        </span>
                    }
                >
                    {renderOrderPoint(object)}
                </CollapsePanel>
            </SingleCollapse>
        })
    }

    const onMultiObjectChange = (value: string | string[]) => {
        let modelIds = Array.isArray(value) ? value : [value];
        let objs: ObjectModel[] = [];
        domainData.map(d => {
            const objects = d?.model_id_vec || [];
            objs = objs.concat(objects.filter(o => modelIds.indexOf(o.model_id) > -1));            
        });
        objs = objs.map(o => {
            const selectObj = selectedObject?.find(s => s.model_id === o.model_id);
            return Object.assign({}, o, selectObj || {});
        });
        onChange(JSON.parse(JSON.stringify({selectedDomain, selectedObject: objs,selectedModel})));
    }

    return <div>
        {
            isTreeSelect 
            ? <RenderTreeSelect
                multiple={!!multiple} 
                value={objectValue}
                data={domainData}
                onChange={onMultiObjectChange}
            />
            : <>
                <RenderDomain  
                    value={domainValue}
                    data={domainData}
                    onChange={onDomainChange}
                />
                <RenderObject  
                    mode={multiple ? 'multiple' : objectMode}
                    value={objectValue}
                    data={objectList}
                    onChange={onObjectChange}
                />
                    <RenderType mode={multiple ? 'multiple' : objectMode}
                    value={modelValue}
                    data={modelData}
                    onChange={onModelChange}/>
            </>
        }
        {
            needSelectPoint && renderObjectChildren()
        }
        {children}
    </div>
}

/**
 * 对象模型和测点配置选择
 * 
 * 支持跨领域多选
 * 领域单选时
 *     支持到模型选择, 支持单选或多选
 *     支持到测点选择, 支持单选或多选
 */
export default memo(BaseModels);