import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Cascader, Tree,Select,Row,Col } from 'antd';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import msg from '@/common/lang';
import { POINT_TABLE } from '@/common/constants';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { dao } from '../dataStore';
import { Domain, Point, RawPoint } from '../models';
import { group } from '../utils';
import { FieldName, PointGroup } from '..';
import styles from './index.module.scss';
const isZh = msg.isZh

export interface PropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const ConfigPanel: React.FC<PropsType & { 
    pointTypes?: (typeof POINT_TABLE[keyof typeof POINT_TABLE])[] 
}> = ({ 
    data, 
    current, 
    config, 
    pointTypes 
}) => {
    const intl = useIntl()
    const { pointCandidates, modelId, domainId ,selectedModel} = current.props;
    const [currentType,setCurrentType] = useState<string>(selectedModel)//型号
    const [domainArr, setDomainArr] = useState<Domain[]>([])
    const [currentDomainId, setCurrentDomainId] = useState<string>(domainId)
    const [currentModelId, setCurrentModelId] = useState<string>(modelId)
    const [curPointCandidates, setCurPointCandidates] = useState<Point[]>(pointCandidates)
    useEffect(() => {
        dao.getObjects().then(data => {
            setDomainArr(data.map(d => ({
                name: d.domain_name,
                id: d.domain_id,
                models: d.model_id_vec.map(m => ({
                    name: m.model_name,
                    id: m.model_id,
                    modelNumbers:m.device_model_list
                }))
            })))
        }).catch(e => console.error('fetch object modal error', e));
    }, [])

    const [pointGroups, setPointGroups] = useState<PointGroup[]>([])
    useEffect(() => {
        if (currentDomainId && currentModelId) {
            dao.getModelsById(currentDomainId, currentModelId)
                .then(data => {
                    const groups = group(data as RawPoint[])
                    .filter(g => 
                        (!Array.isArray(pointTypes) || 
                        pointTypes.length === 0 || 
                        pointTypes.map(t => String(t)).includes(String(g.type)))
                    );
                    setPointGroups(groups)
                }).catch(e => console.error('fetch points modal error', e))
        }
    }, [currentDomainId, currentModelId])

    const store = config.getStore();
    const change = useCallback((field: FieldName, value: Point[] | string) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === current.id) {
                v.props[field] = value
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
        // currentDomainId, currentModelId
        // console.log('domainArr',domainArr,{ ...cloneData, block: [...newblock] })
    }, [store])

    return <SingleCollapse>
        <CollapsePanel header={intl.formatMessage({ id: 'form.pointcfg.select', defaultMessage: '测点选择' })} key={'1'}>
        <Row style={{ padding: '5px 0' }}>
            <Col span={6}>
            <div style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center'
            }}>{intl.formatMessage({id: 'form.pointcfg.domain'})}           
            </div></Col>
            <Col span={18}><Cascader
                style={{ width: '100%' }}
                popupClassName={styles.cascader}
                options={domainArr.map(d => ({
                    value: d.id,
                    label: d.name,
                    children: d.models.map(m => ({
                        value: m.id,
                        label: m.name
                    }))
                }))}
                onChange={v => {
                    v[0] && setCurrentDomainId(v[0].toString())
                    v[1] && setCurrentModelId(v[1].toString())
                    v[0] && change(FieldName.domainId, v[0].toString())
                    v[1] && change(FieldName.modelId, v[1].toString())
                    change(FieldName.pointCandidates, [])
                }}
                placeholder={'Please select'}
                value={domainArr.length > 0 && currentDomainId && currentModelId ? [currentDomainId, currentModelId] : []}
                allowClear={false}
            /></Col></Row>
            {currentDomainId&&currentModelId&&<Row style={{ padding: '5px 0' }}>
            <Col span={6}>
            <div style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center'
            }}>
                {intl.formatMessage({id: 'form.pointcfg.type'})}           
            </div>
           </Col>
           <Col span={18}>
                <Select 
                    allowClear={true}
                    maxTagCount={1}
                    style={{ width: '100%' }}
                    value={currentType}
                    onChange={v=>{
                        v && setCurrentType(v)
                        v && change(FieldName.modelNumber, v.toString())
                    }}
                >
                    {
                        domainArr.find(el=>el.id == currentDomainId)?.models.find(d => d.id == currentModelId).modelNumbers?.map((object, ind) => {
                            return <Select.Option value={object} key={ind}>
                                { object }
                            </Select.Option>
                        })
                    }
                </Select>
            </Col>
      </Row>}
            {
                pointGroups.length > 0 &&
                <Tree
                    className={styles.tree}
                    checkable
                    treeData={
                        pointGroups.map(g => ({
                            key: g.name,
                            title: g.name,
                            checkable: true,
                            children: g.points.map(p => ({
                                title: isZh ? p.name.cn : p.name.en,
                                ...p
                            })),
                            type: '-1'
                        }))}
                    onCheck={(keys, info) => {
                        const checkedNodes = info.checkedNodes.filter((node: any) => {
                            return node.type !== '-1';
                        })
                        setCurPointCandidates(checkedNodes as Point[]);
                        change(FieldName.pointCandidates, checkedNodes as Point[])
                    }}
                    checkedKeys={curPointCandidates.map((ele) => ele.key)}
                />
            }
        </CollapsePanel>
    </SingleCollapse>
}

export default ConfigPanel;