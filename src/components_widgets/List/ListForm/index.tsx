import { _dao, daoIsOk } from '@/common/dao';
import { combinePointKey } from '@/common/utils/model';
import BaseInfo from '@/components_utils/base';
import React, {useEffect, useState } from 'react';
import _ from 'lodash';
import { Select, Divider, Tooltip, Switch, Checkbox } from 'antd';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { ReactSortable } from "react-sortablejs";
import { isZh } from '../constants';
import { MinusCircleOutlined, MenuOutlined } from '@ant-design/icons';
import type { ListFormPropsType } from '../form';
import { functionList, listIntl, typeList } from './constant';
import styles from './style.module.scss';
import { SingleIconSelector } from 'IconSelector';
import { IconKey } from 'Icon/iconsMap';
import { TListProps, IListDefaultCfg } from '../types';

const { Option } = Select;

function useDeepCompareMemoize<T>(value: T) {
    const ref = React.useRef<T>(value);
    const signalRef = React.useRef<number>(0);
  
    if (!_.isEqual(value, ref.current)) {
      ref.current = value;
      signalRef.current += 1;
    }

    return React.useMemo(() => ref.current, [signalRef.current]);
}

const Universal = (props) => {

    const {objectData=[], data={}, onChange} = props;
    const { domain='', object, models} = data;
    const objects = objectData.find(ele => ele.domain_id === data.domain)?.model_id_vec || [];

    const [modelData, setModelData] = useState<IModelPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchModels = async (req) => {
            setIsLoading(true);
            try {
                const res = await _dao.getModelsById(req);
                daoIsOk(res) && setModelData(res.data);
            } finally {
                setIsLoading(false)
            }
        }

        domain && object && fetchModels({
            domain_id: domain,
            model_id: object.model_id,
            if_public: true
        })
    }, useDeepCompareMemoize([domain, object]));    

    const handleDomainChange = (value) => {
        onChange({domain: value, object: null, models: []});
    }

    const handleObjectChange = (value) => {
        onChange(Object.assign({}, data, {
            object: objects.filter(ele => ele.model_id === value)[0] || null,
            models: []
        }));
    }

    const handlePointsChange = (value) => {
        onChange(Object.assign({}, data, {models: value}));
    }

    const handleModelChange = (value) => {
        onChange(Object.assign({}, data, {models: value.map(v => {
            return modelData.find(ele => combinePointKey(ele) === v)
        })}));
    }

    const value = (models || []).map(ele => combinePointKey(ele)).filter(f => modelData.map(ele => combinePointKey(ele)).indexOf(f) > -1);
    
    return <>
        <div>
            <span>{listIntl('domain')}</span>
            <Select 
                className= {styles.select} 
                style={{ width: 200 }} 
                onChange = {handleDomainChange} 
                value = {domain}
            >
                {
                    objectData.map((object, index) => {
                        return(
                            <Option 
                                key={index} 
                                value={object.domain_id}
                            >{object.domain_name}</Option>
                        )
                    })
                }
            </Select>
        </div>
        <div>
            <span>{listIntl('model')}</span>
            <Select 
                className= {styles.select}
                style={{ width: 200 }}
                value = {object?.model_id}
                onChange={handleObjectChange}
            >
                {
                    objects.map((ele, index) => {
                        return <Option 
                            key={index} 
                            value={ele.model_id}
                        >{ele.model_name}</Option>
                    })
                }
            </Select>
        </div>
        {
            object ? <div className={styles.object}>
            <SingleCollapse>
                <CollapsePanel 
                    key=''
                    style={{width: "100%"}} 
                    header={object.model_name} 
                >
                    <div>
                        <Select 
                            placeholder = {listIntl('pointSelect')}
                            {...isLoading ? {disabled: true, loading: true} : {} }
                            value={value}
                            style={{ width: "100%"}}
                            mode="multiple"
                            optionFilterProp="children"
                            onChange={handleModelChange}
                        >
                            {
                                modelData.map((ele, index) => {
                                    return <Option key={index} value={combinePointKey(ele)}>{isZh ? ele.name_cn : ele.name_en}</Option>
                                })
                            }
                        </Select>
                    </div>
                    <div>
                        <PointList 
                            data = {models || []}
                            onChange = {handlePointsChange}
                        ></PointList>
                    </div>
                </CollapsePanel>
            </SingleCollapse> 
            </div>
            : null
        }
    </>
}

const PointList = (props) => {

    let {data, onChange, needFnCheck = false} = props;

    const remove = (index) => {
        data.splice(index, 1);
        onChange(data);
    };

    const sortChange = (values) => {
        onChange(values);
    }

    const handleFnChange = (selected, id) => {

        let target = data.find(d => combinePointKey(d) === id);

        if(target){
            functionList.map((ele) => {
                target[ele.fnKey] = selected.indexOf(ele.fnKey) > -1 ? true : false;
            })
        }
        onChange(data);
    }

    return <ReactSortable 
        list={data.map(t => ({...t}))}
        setList={(points) => sortChange(points)}
        handle='span.anticon'
        filter='.disable_item'
        animation={200}
    >
        {data.map((point, index) => {
            const { name_cn, name_en} = point;
            let name = isZh ? name_cn : name_en;
            let id = combinePointKey(point);
            let fnValue = functionList.filter(fn => point[fn.fnKey]).map(fn => fn.fnKey);


            return <div key={id} style={{margin: '5px 0'}} className={styles.item}>
                <MenuOutlined 
                    style={{marginRight: 5, cursor: 'move'}}
                />
                <Tooltip title={name}><span className={needFnCheck ? styles.shortname : styles.longname}>{name}</span></Tooltip>
                {
                    needFnCheck ? <Select 
                        optionFilterProp = "children"
                        className= {styles.select}
                        placeholder= {listIntl('function')}
                        style={{ width:150 }}
                        mode="multiple"
                        value={fnValue}
                        onChange={value => handleFnChange(value, id)}
                    >
                        {
                            functionList.map((ele, index) => {
                                return <Option key={index} value={ele.fnKey}>{ele.fnName}</Option>
                            })
                        }
                    </Select> : null
                }
                
                <MinusCircleOutlined
                    className={styles.delete}
                    onClick={() => remove(index)}
                />
            </div>
            })
        }
    </ReactSortable>
}

const ListConfig = (props: ListFormPropsType & {onChange: (values: any)=>void}) => {
    const {onChange} = props;
    const configure = props.current.props as IListDefaultCfg;
    
    const [objectData, setObjectData] = useState<IDomainInfo[]>([]);
    const [modelData, setModelData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchModels = async (data) => {
        setIsLoading(true);
        try {
            const res = await _dao.getModelsById(data);
            if(daoIsOk(res)){
                let temp = res.data;
                let newModelData = modelData;
                newModelData[data.domain_id + "_" + data.model_id] = temp;
                setModelData(newModelData);
            }
        }
        finally {
            setIsLoading(false);
        }
    }

    const fetchObjects = async () => {
        const res = await _dao.getObjects();
        setObjectData(daoIsOk(res) ? res.data : []);
    }

    useEffect(() => {
        fetchObjects();
    }, [])

    useEffect(() => {
        if(configure.domain && configure.objects.length > 0){
            configure.objects.map((obj) => {
                fetchModels({
                    domain_id: configure.domain,
                    model_id: obj.model_id,
                    if_public: true
                });
            })
        }
    }, useDeepCompareMemoize([configure.objects, configure.domain]))

    const handleTypeChange = (value) => {
        onChange({type: value});
    }
    const handleAppChange = (value) => {
        onChange({app: value});
    }

    const handleDomainChange = (value) => {
        onChange({domain: value, objects: [], list: []});
    }

    const handleObjectChange = (value) => {
        let temp = objectData.filter((ele) => ele.domain_id === configure.domain);

        let newObjects = [];
        let newList = configure.list;

        if(temp.length > 0){
            newObjects = value.map((key) => {
                let obj = temp[0].model_id_vec.find(ele => ele.model_id === key) || {};
                // add
                if(configure.list.filter(ele => ele.object.model_id === key).length === 0){
                    newList.push({
                        object: obj,
                        models: [],
                        statistics: {}
                    })
                }

                return obj;
            })
        }
        // delete
        newList = newList.filter(f => value.indexOf(f.object.model_id) > -1);
        onChange({objects: newObjects, list: newList});
    }

    const handleModelChange = (key, value) => {
        let newList = configure.list.map((ele => {
            if(ele.object.model_id === key){
                return Object.assign(ele, {
                    models: value.map(val =>{
                        let curValData = ele.models?.find(f => val === combinePointKey(f));

                        if(curValData){
                            return curValData;
                        }else{
                            return (modelData[configure.domain + "_" + key] || []).find(d => val === combinePointKey(d)) || {}
                        }
                    })
                })
            }else{
                return ele;
            }
        }))

        onChange({list: newList});
    }

    const handleModelAlarmEnable = (key: string, checked: boolean) => {
        let newList = configure.list.map((ele => {
            if(ele.object.model_id === key){console.log(ele);
                ele.enableAlarm = checked;
                return ele;
            }else{
                return ele;
            }
        }))

        onChange({list: newList});
    }

    const handlePointsChange = (key, data) => {
        let newList = configure.list.map((ele => {
            if(ele.object.model_id === key){
                return Object.assign(ele, {
                    models: data
                })
            }else{
                return ele;
            }
        }))
        onChange({list: newList});
    }

    const onStatisticsChange = (data) => {
        onChange({statistics: data});
    }

    const onDataSourceChange = (key, data) => {
        let newList = configure.list.map((ele => {
            if(ele.object.model_id === key){
                return Object.assign(ele, {
                    statistics: data
                })
            }else{
                return ele;
            }
        }))

        onChange({list: newList});
    }

    const onIconChange = (key: string, iconKey?: IconKey, color?: string) => {
        let newList = configure.list.map((ele => {
            if(ele.object.model_id === key){
                return Object.assign(ele, {
                    iconCfg: {
                        key: iconKey,
                        color: iconKey ? color : undefined
                    }
                })
            }else{
                return ele;
            }
        }))

        onChange({list: newList});
    }

    return <BaseInfo { ...props}>
        <SingleCollapse>
            <CollapsePanel header={listIntl('contentSet')} key="1">
                <div className={styles.list}>
                    <div>
                        <span>{listIntl('type')}</span>
                        <Select 
                            className = {styles.select} 
                            style = {{ width: 200}} 
                            value = {configure.type || null}
                            onChange = {handleTypeChange}
                        >
                            {
                                typeList.map((type, index) =>{
                                    return <Option key={index} value={type.value}>{type.name}</Option>
                                })
                            }
                        </Select>
                    </div>
                    {configure.type === 'device' ? <div>
                        <span>{listIntl('filter')}</span>
                        <Switch checked={configure.filterFacName ?? true} onChange={(c) => {onChange({filterFacName: c})}}/>
                    </div> : null}
                    {configure.type === 'device' && <>
                        <Divider className={styles.title} orientation="left" plain>{listIntl('drillDownSet')}</Divider >
                        <div>
                            <span>{listIntl('drillDown')}</span>
                            <Switch checked={configure.drillDown ?? true} onChange={(c) => {onChange({drillDown: c})}}/>
                        </div>
                    </>}
                    {configure.drillDown !== false && configure.type === 'device' && <div>
                        <span>{listIntl('app')}</span>
                        <Select 
                            className = {styles.select} 
                            style = {{ width: 200}} 
                            value = {configure.app || null}
                            onChange = {handleAppChange}
                        >
                            <Option key={'EMS'} value={'EMS'}>EMS</Option>
                            <Option key={'SCADA'} value={'SCADA'}>SCADA</Option>
                        </Select>
                    </div>}
                    <Divider className={styles.title} orientation="left" plain>{listIntl('listSet')}</Divider >
                    <div>
                        <span>{listIntl('domain')}</span>
                        <Select 
                            className= {styles.select} 
                            style={{ width: 200 }} 
                            onChange = {handleDomainChange} 
                            value = {configure.domain}
                        >
                            {
                                objectData.map((object, index) => {
                                    return(
                                        <Option key={index} value={object.domain_id}>{object.domain_name}</Option>
                                    )
                                })
                            }
                        </Select>
                    </div>
                    <div>
                        <span>{listIntl('model')}</span>
                        <Select 
                            optionFilterProp = "children"
                            className= {styles.select}
                            style={{ width: 200 }}
                            mode="multiple"
                            value={configure.objects.map(obj => obj.model_id)}
                            onChange={handleObjectChange}
                        >
                            {
                                (objectData.find(ele => ele.domain_id === configure.domain) || {})
                                .model_id_vec?.map((ele, index) => {
                                    return <Option key={index} value={ele.model_id}>{ele.model_name}</Option>
                                })
                            }
                        </Select>
                    </div>
                    {
                        configure.objects.map((object, index) => {
                            let { models = [], statistics = {}, enableAlarm=true, iconCfg } = configure.list.find(ele => ele.object.model_id === object.model_id) || {};
                            const otherProps = isLoading ? {disabled: true, loading: true} : {};
                            const options = modelData[configure.domain + "_" + object.model_id] || [];
                            const value = models.map(ele => combinePointKey(ele)).filter(f => options.map(ele => combinePointKey(ele)).indexOf(f) > -1);
                            return <div key = {index} className={styles.object}>
                                <SingleCollapse>
                                    <CollapsePanel key={index} header = {object.model_name}>
                                        <div className = {styles.alarm}>
                                            <span>{listIntl('showAlarm')}</span>
                                            <Checkbox 
                                                checked={enableAlarm}
                                                onChange={(e) => handleModelAlarmEnable(object.model_id, e.target.checked)}
                                            />
                                        </div>
                                        <div className={styles.icon}>
                                            <div><span>{listIntl('iconSet')}</span></div>
                                            <div>
                                                <SingleIconSelector allowClear iconKey={iconCfg?.key} color={iconCfg?.color} withColorPicker 
                                                    onChange={(icon, color) => onIconChange(object.model_id, icon, color)}/>
                                            </div>
                                        </div>
                                        <Select 
                                            optionFilterProp = "children"
                                            style={{ width: '100%' }}
                                            {...otherProps}
                                            placeholder = {listIntl('pointSelect')}
                                            mode="multiple"
                                            value={value}
                                            onChange={(value) => handleModelChange(object.model_id, value)}
                                        >
                                            {
                                                options.map((ele, index) => {
                                                    return <Option key={index} value={combinePointKey(ele)}>{isZh ? ele.name_cn : ele.name_en}</Option>
                                                })
                                            }
                                        </Select>
                                        <div className = {styles.model}>
                                            <PointList 
                                                data = {models}
                                                onChange = {(data) => {handlePointsChange(object.model_id, data)}}
                                                needFnCheck = {true}
                                            ></PointList>
                                        </div>
                                        <div className={styles.source}>
                                            <div><span>{listIntl('dataSourceSet')}</span></div>
                                            <Universal
                                                objectData = {objectData}
                                                data = {statistics || {}}
                                                onChange = {(data) => onDataSourceChange(object.model_id, data)}
                                            ></Universal>
                                        </div>
                                    </CollapsePanel>
                                </SingleCollapse>
                            </div>  
                        })
                    }
                    <Divider className={styles.title} orientation="left" plain>{listIntl('statisticsSet')}</Divider>
                    <Universal
                        objectData = {objectData}
                        data = {configure.statistics || {}}
                        onChange = {onStatisticsChange}
                    ></Universal>
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default ListConfig;