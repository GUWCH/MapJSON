import React, { useMemo, memo, useEffect, useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import _ from 'lodash';
import { MenuOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { FontIcon, IconType } from 'Icon';
import { _dao, daoIsOk } from '@/common/dao';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { isZh } from '../../common/util-scada';
import { 
    uIdKey, BaseMode, getPointName, generatePointKey, TFilterType, 
    DomainModel, ObjectModel, PointModel, RenderObject, RenderPoint 
} from './_util';

/**
 * 把模型中场站部分抽取出来, 可扩展抽取领域、设备等等
 */
export interface ExtractModel extends ObjectModel, DomainModel{
    /** 功能列表 */
    fnMap?: {
        [key: string]: PointModel | PointModel[] | undefined
    }
};
interface FnModel {
    name: string;
    id: string;
    /** 测点类型列表 */
    filterType?: TFilterType[];
};
interface BaseExtractPropsType {
    children?: React.ReactNode;
    needPrivate?: boolean;
    /** 测点类型列表 */
    filterType?: TFilterType[];
    /** 模型选择模式, 单选或多选 */
    selectMode?: BaseMode;
    /** 选择的模型 */
    selected?: ExtractModel | ExtractModel[];
    /** 功能列表 */
    fns?: FnModel[];
    /** 是否需要测点选择 */
    needSelectPoint?: boolean;
    /** 测点选择模式, 单选或多选 */
    pointMode?: BaseMode;
    selectStyle?: React.CSSProperties;
    fnStyle?: React.CSSProperties;
    pointListStyle?: React.CSSProperties;
    onChange: (selected?: ExtractModel | ExtractModel[]) => void
};

const BaseExtractModelsFn: React.FC<BaseExtractPropsType> = ({
    needPrivate=false,
    filterType,
    selectMode, 
    pointMode,
    selected, 
    fns=[],
    needSelectPoint=false,
    selectStyle={},
    fnStyle={},
    pointListStyle={},
    onChange,
    children
}: BaseExtractPropsType) => {
    const siteValue = Array.isArray(selected) 
        ? selected.map((d) => d.model_id) 
        : selected?.model_id;

    const [sitesData, setSitesData] = useState<ExtractModel[]>([]);
    const [sitePoint, setSitePoint] = useState<{[key: string]: PointModel[]}>({});
    const siteList = sitesData.map(s => s);

    useEffect(() => {
        fetchSiteList();

        if(selected){
            if(Array.isArray(selected)){
                selected.map((object) => {
                    fetchPoints(object.domain_id, object.model_id);
                });
            }else if(selected){
                fetchPoints(selected.domain_id, selected.model_id);
            }
        }        
    }, [])

    const fetchSiteList = async () => {
        const res = await _dao.getObjects();
        const domainData = daoIsOk(res) ? res.data : [];
        let sites: any[] = [];
        domainData.map(domain => {
            // table_no=4代表场站类型
            const domainSites = (domain.model_id_vec || [])
                .filter(obj => String(obj.table_no) === '4')
                .map(obj => Object.assign({}, obj, domain));
            sites = sites.concat(domainSites.map(obj => {
                // @ts-ignore
                delete obj.model_id_vec;
                return obj;
            }));
        });
        setSitesData(sites);
    }

    const fetchPoints = async (domainId, objId) => {
        const res = await _dao.getModelsById({
            domain_id: domainId,
            model_id: objId,
            if_public: !!!needPrivate
        });

        if(daoIsOk(res)){
            setSitePoint(d => Object.assign({}, d, {[objId]: res.data.map(d => {
                d[uIdKey] = generatePointKey(d as unknown as PointModel)
                return d;
            })}));
        }
    }

    const getSite = (siteIds) => {
        if(Array.isArray(siteIds)){
            return siteList.filter(object => siteIds.indexOf(object.model_id) > -1);            
        }else{
            return siteList.find(object => object.model_id === siteIds );
        }
    }

    const onSiteChange = (value, option?: any) => {
        if(needSelectPoint){
            if(Array.isArray(value)){
                const newValue = value.filter(v => !sitePoint[v]);
                if(newValue.length && !sitePoint[newValue[0]]){
                    const site = siteList.filter(s => s.model_id === newValue[0])[0];
                    fetchPoints(site.domain_id, newValue[0]);
                }
            }else{
                if(!sitePoint[value]){
                    const site = siteList.filter(s => s.model_id === value)[0];
                    fetchPoints(site.domain_id, value);
                }
            }
        }

        // 多选时要合并, 单选时已经删除可忽略
        let site = getSite(value);
        if(Array.isArray(site)){
            site = site.map(o => {
                const selectObj = selected?.find(s => s.model_id === o.model_id);
                return Object.assign({}, o, selectObj || {});
            });
        }
        onChange(JSON.parse(JSON.stringify(site)));
    }

    const onPointChange = (value: string | string[], currentObject?: ExtractModel, fnId?: string) => {
        if(Array.isArray(value)){
            if(currentObject){
                if(fnId){
                    if(!currentObject.fnMap){
                        currentObject.fnMap = {};
                    }
                    currentObject.fnMap[fnId] = sitePoint[currentObject.model_id]?.filter(p => value.includes(generatePointKey(p) as string));
                }else{
                    currentObject.selectedPoint 
                        = sitePoint[currentObject.model_id]?.filter(p => value.includes(generatePointKey(p) as string));
                }                
            }
        }else if(selected){
            if(currentObject){
                if(fnId){
                    if(!currentObject.fnMap){
                        currentObject.fnMap = {};
                    }
                    currentObject.fnMap[fnId] = sitePoint[currentObject.model_id]?.find(p => generatePointKey(p) === value);
                }else{
                    currentObject.selectedPoint 
                        = sitePoint[currentObject.model_id]?.find(p => generatePointKey(p) === value);
                }
            }            
        }

        onChange(JSON.parse(JSON.stringify(selected)));
    }

    const onPointSortChange = (multi: boolean, points: PointModel[], currentObject?: ExtractModel, fnId?: string) => {
        if(multi){
            if(currentObject){
                if(fnId){
                    if(!currentObject.fnMap){
                        currentObject.fnMap = {};
                    }
                    currentObject.fnMap[fnId] = points;
                }else{
                    currentObject.selectedPoint = points;
                }
            }
        }else{
            if(currentObject){
                if(fnId){
                    if(!currentObject.fnMap){
                        currentObject.fnMap = {};
                    }
                    currentObject.fnMap[fnId] = points[0];
                }else{
                    currentObject.selectedPoint = points[0];
                }                
            }
        }
        onChange(JSON.parse(JSON.stringify(selected)));
    }

    const renderOrderPoint = (selectedObject: ExtractModel, fn?: FnModel) => {
        let selectPoint;
        let pointValue;
        let pointList: PointModel[] = [];

        // 功能列表对应选择的点模型
        if(fn){
            selectPoint = (selectedObject?.fnMap || {})[fn.id] || [];
            pointValue = selectPoint.map(p => generatePointKey(p));
            pointList = selectPoint;
        }else{
            selectPoint = selectedObject?.selectedPoint;
            if(Array.isArray(selectPoint)){
                pointValue = selectPoint.map(p => generatePointKey(p));
                pointList = selectPoint;
            }else{
                pointValue = generatePointKey(selectPoint);
                pointList = selectPoint ? [selectPoint] : [];
            }
        }

        return <div>
            <RenderPoint
                mode={pointMode}
                value={pointValue} 
                data={selectedObject?.model_id ? sitePoint[selectedObject?.model_id] : []} 
                onChange={(value, label, extra) => {onPointChange(value, selectedObject, fn?.id)}}
                filterType={fn ? fn?.filterType??filterType : filterType}
            />
            <ReactSortable 
                list={pointList.map(p => ({id: generatePointKey(p) || '', ...p}))}
                setList={(pointList) => 
                    onPointSortChange(
                        Array.isArray(selectPoint),
                        pointList, 
                        selectedObject,
                        fn?.id
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
                                        selectedObject,
                                        fn?.id
                                    )
                                }}
                            />
                        </div>
                    })
                }
            </ReactSortable>
        </div>
    }

    const renderSitePoints = (fns?: FnModel[]) => {
        if(!selected) return null;

        if(!Array.isArray(selected)){
            return Array.isArray(fns) && fns.length > 0
            ? fns.map((fn, ind) => {
                return <SingleCollapse key={fn.id} style={fnStyle}>
                    <CollapsePanel key={fn.id} header={<span style={{fontSize: 14}}>{fn.name}</span>}>
                        {renderOrderPoint(selected, fn)}
                    </CollapsePanel>
                </SingleCollapse>;
            })
            : renderOrderPoint(selected as ExtractModel);
        }

        return selected.map((object, ind) => {
            return <SingleCollapse key={object.model_id} style={selectStyle}>
                <CollapsePanel 
                    key={object.model_id + '_1'}
                    header={isZh ? object.model_name_cn || object.model_name : object.model_name}
                    extra = {
                        <span
                            onClick={() => {
                                const value = selected.map(o => o.model_id).filter(v => v !== object.model_id);
                                onSiteChange(value);
                            }}
                        >
                            <FontIcon type = {IconType.DELETE}/>
                        </span>
                    }
                >
                    {
                        Array.isArray(fns) && fns.length > 0
                        ? fns.map((fn, ind) => {
                            return <SingleCollapse key={fn.id} style={fnStyle}>
                                <CollapsePanel key={fn.id} header={<span style={{fontSize: 14}}>{fn.name}</span>}>
                                    {renderOrderPoint(object, fn)}
                                </CollapsePanel>
                            </SingleCollapse>;
                        })
                        : renderOrderPoint(object)
                    }
                </CollapsePanel>
            </SingleCollapse>
        })
    }

    return <div>
        <RenderObject  
            mode={selectMode}
            value={siteValue}
            data={siteList}
            onChange={onSiteChange}
        />
        {
            needSelectPoint && renderSitePoints(fns)
        }
        {children}
    </div>
}

/**
 * 场站模型选择
 * 
 * 支持到场站选择, 支持单选或多选
 * 支持到测点选择, 支持单选或多选
 */
export const BaseExtractModels = memo(BaseExtractModelsFn);