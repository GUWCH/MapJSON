import React, { memo, MouseEventHandler } from 'react';
import { InputNumber } from 'antd';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels from '@/components_utils/models';
import { IRankListCfg } from './index';

export interface RankListFormPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const RankListForm = (props: RankListFormPropsType) => {
    const intl = useIntl();
    const configure: IRankListCfg = JSON.parse(JSON.stringify(props.current.props));
    const store = props.config.getStore();

    const onChange = (value: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = { ...v.props, ...value };
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    const handlePackChange = (value) => {
        configure.rankModels = value;
        onChange(configure);
    } 

    const onChangeCount = (value) => {
        configure.rankCount = value;
        onChange(configure);
    } 

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse key={1}>
            <CollapsePanel header={intl.formatMessage({ id: 'form.rank.set' })} key={1}>
                <BaseModels 
                    multiple={true}
                    selectedDomain={configure.rankModels?.selectedDomain}
                    selectedObject={configure.rankModels?.selectedObject}
                    needSelectPoint={true}
                    filterType={['62', '35', 'other']}
                    onChange={handlePackChange}
                />
            </CollapsePanel>
        </SingleCollapse>
        <SingleCollapse key={2}>
            <CollapsePanel header={intl.formatMessage({ id: 'form.rank.count' })} key={1}>
                <InputNumber 
                    min={1}
                    max={100000000} // 数据太大后台解析异常
                    style={{width: '100%'}}
                    value={configure.rankCount}
                    parser={value => value && /^\d+$/.test(value) ? value : configure.rankCount}
                    pattern='/^\d+$/'
                    onChange={onChangeCount}
                />
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo >;
}

export default memo(RankListForm);