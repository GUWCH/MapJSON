import BaseInfo from '@/components_utils/base';
import { Col, Row, Select, Space } from 'antd';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { IPictureFormCfg } from './Picture';
import Uploader from './Uploader';

export interface PropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

export const Form = (props: PropsType) => {
    const intl = useIntl()
    const { current, config } = props

    const store = config.getStore();
    const change = useCallback(<FieldName extends keyof IPictureFormCfg>(field: FieldName, value: IPictureFormCfg[FieldName]) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === current.id) {
                v.props[field] = value
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    }, [store, current])

    return <BaseInfo {...props}>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({ id: 'form.picture.config' })} key={'1'}>
                <Space direction='vertical' style={{ width: '100%' }}>
                    <Uploader onload={(b) => change('content', b)} />
                    <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.picture.fillType' })}</Col>
                        <Col span={14}>
                            <Select style={{ width: '100%' }} value={props.current.props.fillType} options={[
                                { value: 'fill', label: intl.formatMessage({ id: 'form.picture.fill' }) },
                                { value: 'contain', label: intl.formatMessage({ id: 'form.picture.contain' }) },
                            ]} onChange={e => e && change('fillType', e.toString() as any)} />
                        </Col>
                    </Row>
                </Space>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>
}