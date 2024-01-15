import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { Select } from 'antd';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';

const { Option } = Select;

export interface LinePropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const ChartLine = (props: LinePropsType) => {
    const value = Object.assign({}, {
        type: 'line'
    }, props.current.props).type;

    const store = props.config.getStore();

    const onChange = (value: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = { ...v.props, ...{ type: value } };
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header="样式" key="1">
                <div>
                    <span>形状：</span>
                    <Select style={{ width: 120 }} onChange={onChange} value={value}>
                        <Option value="line">Line</Option>
                        <Option value="bar">Bar</Option>
                    </Select>
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(ChartLine);