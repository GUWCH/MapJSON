import { POINT_TABLE, TPointType } from '@/common/constants/point';
import { Cascader, Tree, TreeDataNode } from 'antd';
import { i18n } from 'PointSelector/utils';
import React, { useEffect, useMemo, useState } from 'react';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import dao from './dao';
import styles from './form.module.scss';
import { Domain } from './models';
import { convertRawPointToPoint } from './utils';
import msg from '@/common/lang';
import { combinePointKey } from '@/common/utils/model';
const isZh = msg.isZh

export type PointConfigurationCfg = {
    name: string
    candidates?: TPoint[]
    onDomainChange?: (domainId: string) => void
    onModelChange?: (modelId: string) => void
    onPointsChange: (p: TPoint[]) => void
    pointTypes?: TPointType[]
    restrictDomain?: boolean
    restrictModel?: boolean
    domainId?: string
    modelId?: string
}

export const PointCandidatesForm: React.FC<PointConfigurationCfg> = ({
    name,
    candidates = [],
    onDomainChange,
    onModelChange,
    onPointsChange,
    pointTypes = ['YC', 'YX', 'PROD', 'OTHER', 'FARM_STAT', 'SOLAR_STAT'],
    restrictDomain,
    restrictModel,
    domainId,
    modelId,
}) => {

    const [domainArr, setDomainArr] = useState<Domain[]>([])

    useEffect(() => {
        dao.getObjects().then(data => {
            setDomainArr(data.map(d => ({
                name: isZh ? d.domain_name_cn : d.domain_name,
                id: d.domain_id,
                models: d.model_id_vec.map(m => ({
                    name: isZh ? m.model_name_cn : m.model_name,
                    id: m.model_id
                }))
            })))
        }).catch(e => console.error('fetch object modal error', e));
    }, [])

    const [points, setPoints] = useState<IModelPoint[]>([])

    const { nodes, pointMap } = useMemo(() => {
        const ycNode: TreeDataNode = {
            key: 'YC',
            title: i18n('yc'),
            checkable: true,
            children: [],
            isLeaf: false
        }
        const yxNode: TreeDataNode = {
            key: 'YX',
            title: i18n('yx'),
            checkable: true,
            children: [],
            isLeaf: false
        }
        const dlNode: TreeDataNode = {
            key: 'DL',
            title: i18n('dl'),
            checkable: true,
            children: [],
            isLeaf: false
        }
        const otherNode: TreeDataNode = {
            key: 'OTHER',
            title: i18n('other'),
            checkable: true,
            children: [],
            isLeaf: false
        }

        const resArr: TreeDataNode[] = [];
        const pointMap: { [key: string]: TPoint } = {}

        points.forEach(point => {
            const key = combinePointKey(point)
            pointMap[key] = convertRawPointToPoint(point)

            switch (String(point.table_no)) {
                case String(POINT_TABLE.YC): ycNode.children!.push({
                    key: key,
                    title: (isZh ? point.name_cn : point.name_en),
                    isLeaf: true
                }); break
                case String(POINT_TABLE.YX): yxNode.children!.push({
                    key: key,
                    title: (isZh ? point.name_cn : point.name_en),
                    isLeaf: true
                }); break
                case String(POINT_TABLE.PROD): dlNode.children!.push({
                    key: key,
                    title: (isZh ? point.name_cn : point.name_en),
                    isLeaf: true
                }); break
                default: otherNode.children!.push({
                    key: key,
                    title: (isZh ? point.name_cn : point.name_en),
                    isLeaf: true
                })
            }
        });
        if (ycNode.children!.length > 0 && pointTypes.includes('YC')) {
            resArr.push(ycNode);
        }
        if (yxNode.children!.length > 0 && pointTypes.includes('YX')) {
            resArr.push(yxNode);
        }
        if (dlNode.children!.length > 0 && pointTypes.includes('PROD')) {
            resArr.push(dlNode);
        }
        if (otherNode.children!.length > 0 && pointTypes.includes('OTHER')) {
            resArr.push(otherNode)
        }

        return {
            nodes: resArr,
            pointMap
        }
    }, [points])

    useEffect(() => {
        if (domainId && modelId) {
            dao.getModelsById(domainId, modelId)
                .then((data: IModelPoint[]) => {
                    setPoints(data)
                }).catch(e => console.error('fetch points modal error', e))
        } else {
            setPoints([])
        }
    }, [domainId, modelId])

    return <SingleCollapse>
        <CollapsePanel header={name} key={'1'}>
            <Cascader
                style={{ width: '90%' }}
                popupClassName={styles.cascader}
                options={domainArr.map(d => ({
                    value: d.id,
                    label: d.name,
                    disabled: restrictDomain,
                    children: d.models.map(m => ({
                        value: m.id,
                        label: m.name,
                        disabled: restrictModel
                    }))
                }))}
                onChange={v => {
                    v[0] && onDomainChange?.(v[0].toString())
                    v[1] && onModelChange?.(v[1].toString())
                }}
                placeholder={isZh ? '请选择' : 'Please select'}
                value={domainArr.length > 0 && domainId && modelId ? [domainId, modelId] : []}
                allowClear={false}
            />
            {
                nodes.length > 0 &&
                <Tree
                    className={styles.tree}
                    checkable
                    treeData={nodes}
                    onCheck={(keys) => {
                        const ps = (
                            Array.isArray(keys) ?
                                keys.map(k => pointMap[k]) :
                                keys.checked.map(k => pointMap[k])
                        ).filter(p => p)
                        onPointsChange(ps)
                    }}
                    checkedKeys={candidates.map((ele) => combinePointKey(ele))}
                />
            }
        </CollapsePanel>
    </SingleCollapse>
}