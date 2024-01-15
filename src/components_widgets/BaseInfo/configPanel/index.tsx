import React, { memo, useCallback, useState } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import ConfigPanel from '../../common/components/PointTplConfiguration/configPanel';
import styles from './index.module.scss';
import { useIntl } from 'react-intl';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { Col, Input, Row, Space, Switch } from 'antd';

export interface PropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
};

type FieldName = 'showFull' | 'trimNamePrefix'

const Form = (props: PropsType) => {
  const intl = useIntl()
  const { current, config } = props
console.log('baseinfo props',props)
  const store = config.getStore();
  const change = useCallback((field: FieldName, value: boolean) => {
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
    <BaseProfile {...props} />
    <ConfigPanel {...props} key={props.current.id} />
    <SingleCollapse>
      <CollapsePanel header={intl.formatMessage({ id: 'form.baseinfo.fullTpl', defaultMessage: '' })} key={'1'}>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Row align='middle' justify='space-between'>
            <Col span={11}>{intl.formatMessage({ id: 'form.baseinfo.showFull', defaultMessage: '' })}</Col>
            <Col span={12}>
              <Switch checked={current.props.showFull} onChange={v => {
                !v && change('trimNamePrefix', false)
                change('showFull', v)
              }} />
            </Col>
          </Row>
          {current.props.showFull && <Row align='middle' justify='space-between'>
            <Col span={11}>{intl.formatMessage({ id: 'form.baseinfo.trimPrefix', defaultMessage: '' })}</Col>
            <Col span={12} >
              <Switch checked={current.props.trimNamePrefix} onChange={v => {
                change('trimNamePrefix', v)
              }} />
            </Col>
          </Row>}
        </Space>
      </CollapsePanel>
    </SingleCollapse>
  </BaseInfo>
}

export default memo(Form);