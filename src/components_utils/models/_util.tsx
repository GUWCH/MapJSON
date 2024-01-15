import * as React from 'react';
import { useIntl } from "react-intl";
import _ from 'lodash';
import { Row, Col, Select, TreeSelect, TreeSelectProps} from 'antd';
import { _dao } from '@/common/dao';
import { isZh } from '../../common/util-scada';

export const uIdKey = '__uId__';
const splitStr = '__[###]__';

export const getPointName = (point: PointModel) => {
    const { name_cn, name_en } = point;
    return String(isZh ? name_cn : name_en).trim();
}

export const generatePointKey = (point?: Pick<PointModel, 'table_no' | 'alias' | 'field_no'>) => {
    if(!point) return;

    const { table_no, alias, field_no } = point;
    return `${table_no}${splitStr}${alias}${splitStr}${field_no}`;
}

export const generateTreeData = (data: PointModel[], filterType, intl, multi?: boolean) => {
    let groups = ['62', '61', '35', 'other'];
    if(Array.isArray(filterType) && filterType.length > 0){
        groups = groups.filter(g => filterType.indexOf(g) > -1);
    }
    const treeMap = {};

    data.map(d => {
        const { table_no } = d;
        const title = getPointName(d);
        const key = generatePointKey(d);

        let no = 'other';
        if(groups.indexOf(String(table_no)) > -1){
            no = String(table_no);
        }
        treeMap[no] = treeMap[no] || [];
        treeMap[no].push({
            title: title,
            value: key,
            key: key
        });
    });

    const treeMapKeys = Object.keys(treeMap);
    return groups.filter(no => treeMapKeys.includes(no)).map(d => {
        return {
            title: intl.formatMessage({id: `form.keyinfo.${d}`}),
            value: d,
            key: d,
            children: treeMap[d],
            disabled: !!!multi
        }
    });
}

export type TFilterType = '62' | '61' | '35' | 'other';

export interface PointModel {
    alias: string;
    const_name_list: {name: string; name_en: string; value: number | string}[];
    field_no: number | string;
    if_standard: boolean;
    name_cn: string;
    name_en: string;
    point_type: string; // AI|DI|PI
    table_no: number | string;
    type: string; // 型号
    unit: string;
    [uIdKey]?: string;
    [key: string]: any;
}

export interface ObjectModel {
    model_id: string;
    model_name: string;
    model_name_cn?: string;
    table_no: string | number;
    type: string | number;
    domain?: Pick<DomainModel, 'domain_id' | 'domain_name' | 'domain_name_cn'>;
    selectedPoint?: PointModel | PointModel[]; // 多选时为数组, 单选时为对象
    [key: string]: any;
}

export interface DomainModel {
    domain_id: string;
    domain_name: string;
    domain_name_cn?: string;
    model_id_vec: ObjectModel[];
    [key: string]: any;
}

export type BaseMode = 'multiple' | 'tags';

export const RenderDomain = (props: {
    value?: string; 
    data: DomainModel[]; 
    onChange: any;
}) => {
    const intl = useIntl();

    return <Row style={{ padding: '5px 0' }}>
        <Col span={6}>
            <div style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center'
            }}>
                {intl.formatMessage({id: 'form.common.domain'})}
            </div>
        </Col>
        <Col span={18}>
            <Select
                allowClear={true}
                style={{ width: '100%' }}
                value={props.value}
                onChange={props.onChange}
            >
                {
                    props.data.map((d, ind) => {
                        return <Select.Option value={d.domain_id} key={ind}>
                            {isZh ? d.domain_name_cn || d.domain_name : d.domain_name}
                        </Select.Option>
                    })
                }
            </Select>
        </Col>
    </Row>
}

export const RenderObject = (props: {
    mode?: BaseMode;
    value: any; 
    data: ObjectModel[]; 
    onChange: any;
}) => {
    const intl = useIntl();

    return <Row style={{ padding: '5px 0' }}>
        <Col span={6}>
            <div style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center'
            }}>
                {intl.formatMessage({id: 'form.common.object'})}           
            </div>
        </Col>
        <Col span={18}>
            <Select 
                allowClear={true}
                maxTagCount={1}
                style={{ width: '100%' }}
                mode={props.mode}
                value={props.value}
                onChange={props.onChange}
            >
                {
                    props.data.map((object, ind) => {
                        return <Select.Option value={object.model_id} key={ind}>
                            {isZh ? object.model_name_cn || object.model_name : object.model_name}
                        </Select.Option>
                    })
                }
            </Select>
        </Col>
    </Row>
}

export const RenderType = (props: {
    mode?: BaseMode;
    value: any; 
    data: string[]; 
    onChange: any;
}) => {
    const intl = useIntl();
    return <Row style={{ padding: '5px 0' }}>
        <Col span={6}>
            <div style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center'
            }}>
                {intl.formatMessage({id: 'form.common.model'})}           
            </div>
        </Col>
        <Col span={18}>
            <Select 
                allowClear={true}
                maxTagCount={1}
                style={{ width: '100%' }}
                mode={props.mode}
                value={props.value}
                onChange={props.onChange}
            >
                {
                    props.data?.map((object, ind) => {
                        return <Select.Option value={object} key={ind}>
                            { object }
                        </Select.Option>
                    })
                }
            </Select>
        </Col>
    </Row>
}

export const RenderPoint = ({
    mode,
    ...rest
}: {
    mode?: BaseMode
} & (SingleSelect | MultiSelect)) => {
    return ['multiple', 'tags'].indexOf(mode || '') > -1
    ? <RenderMultiPoint {...rest} />
    : <RenderSinglePoint {...rest} />
}

type SingleSelect = {
    data?: PointModel[];
    value?: string | number;
    onChange: any;
    filterType?: TFilterType[];
};
const RenderSinglePoint = (props: SingleSelect) => {
    const intl = useIntl();

    return <TreeSelect 
        allowClear={true}
        showSearch={true}
        treeNodeFilterProp={'title'}
        treeData={generateTreeData(props.data || [], props.filterType, intl)}
        value={props.value}
        onChange={props.onChange}
        placeholder={intl.formatMessage({id: 'form.common.selectpoint'})}
        style={{width: '100%'}}
        treeDefaultExpandAll={false}
    />;
}

type MultiSelect = {
    data?: PointModel[];
    value?: string | number;
    onChange: any;
    filterType?: TFilterType[];
};
const RenderMultiPoint = (props: MultiSelect) => {
    const intl = useIntl();

    return <TreeSelect 
        maxTagCount={1}
        allowClear={true}
        showSearch={true}
        treeNodeFilterProp={'title'}
        treeData={JSON.parse(JSON.stringify(generateTreeData(props.data || [], props.filterType, intl, true)))}
        value={props.value}
        onChange={props.onChange}
        treeCheckable={true}
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder={intl.formatMessage({id: 'form.common.selectpoint'})}
        style={{width: '100%'}}
        treeDefaultExpandAll={false}
    />;
}

const renderTreeNode = (data: DomainModel[]) => {
    return data.map(d => {
        const isParent = Array.isArray(d.model_id_vec) && d.model_id_vec.length > 0;
        return <TreeSelect.TreeNode 
            key={d.domain_id} 
            value={d.domain_id} 
            title={isZh ? d.domain_name_cn : d.domain_name} 
            isLeaf={!isParent} 
            selectable={false}
            checkable={false} // 会批量下发接口，避免太多接口一次性下发
        >
            { isParent ? d.model_id_vec.map(m => {
                return <TreeSelect.TreeNode 
                    key={m.model_id} 
                    value={m.model_id} 
                    title={isZh ? m.model_name_cn : m.model_name} 
                    isLeaf={true}
                    //checkable={false}
                ></TreeSelect.TreeNode>
            }) : null}
        </TreeSelect.TreeNode>
    });
}

export const RenderTreeSelect = (props: {
    multiple?: boolean;
    value: any;
    data: DomainModel[];
    onChange: (value) => void
}) => {
    const intl = useIntl();
    const multiple = !!props.multiple;

    const propsObj: TreeSelectProps<any> = Object.assign({}, {
        allowClear: true,
        showSearch: true,
        treeNodeFilterProp: 'title',
        value: props.value,
        onChange: props.onChange,
        placeholder: intl.formatMessage({id: 'form.common.selectobject'}),
        style: {width: '100%'},
        treeDefaultExpandAll: false,
        treeCheckable: multiple
    }, multiple ? {
        maxTagCount: 1
    } : {});

    return <TreeSelect {...propsObj}>
        {renderTreeNode(props.data)}
    </TreeSelect>
}