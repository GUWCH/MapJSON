import React, { memo, useCallback, useEffect, useState } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { Row, Input, Switch, Col, Space } from 'antd';
import { useIntl } from "react-intl";
import { getPADDefaultAliasMap, PADPointAliasMap } from '.';

export interface PropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
  outerIsEMS?: boolean
};

export type PadPointMapField = 'padPointMap' | 'isEMS'
export const PadPointForm = (props: PropsType) => {
  const intl = useIntl()
  const { padPointMap, isEMS } = props.current.props
  const [editable, setEditable] = useState(false)
  const map = padPointMap || getPADDefaultAliasMap(isEMS)

  const store = props.config.getStore();
  const change = useCallback((field: PadPointMapField, value: PADPointAliasMap | boolean) => {
    const cloneData = deepCopy(store.getData());
    const newblock = cloneData.block.map((v: IBlockType) => {
      if (v.id === props.current.id) {
        v.props[field] = value
      }
      return v;
    });
    store.setData({ ...cloneData, block: [...newblock] });
  }, [store])

  // 外部传入isEMS时，同步配置
  useEffect(() => {
    if (props.outerIsEMS !== undefined && props.outerIsEMS !== isEMS) {
      change('isEMS', props.outerIsEMS)
      change('padPointMap', getPADDefaultAliasMap(props.outerIsEMS))
    }
  }, [isEMS, props.outerIsEMS, change])

  return <SingleCollapse >
    <CollapsePanel header={intl.formatMessage({ id: 'form.padWiringDiagram.pointMap' })} key='1'>
      <Row style={{ padding: '5px 0' }}>
        <Space>
          <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.isEMS' })}:</span>
          <Switch checked={isEMS} onChange={(e) => {
            change('isEMS', e)
            change('padPointMap', getPADDefaultAliasMap(e))
          }} />
        </Space>
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <Space>
          <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.editable' })}:</span>
          <Switch checked={editable} onChange={(e) => {
            setEditable(e)
          }} />
        </Space>
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.high_remote' })}:</span>
        <Input disabled={!editable} value={map?.HIGH_REMOTE} onChange={(e) => change('padPointMap', {
          ...map,
          HIGH_REMOTE: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.high_disconnector' })}:</span>
        <Input disabled={!editable} value={map?.HIGH_DISCONNECTOR} onChange={(e) => change('padPointMap', {
          ...map,
          HIGH_DISCONNECTOR: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.high_breaker' })}:</span>
        <Input disabled={!editable} value={map?.HIGH_BREAKER} onChange={(e) => change('padPointMap', {
          ...map,
          HIGH_BREAKER: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.high_earth' })}:</span>
        <Input disabled={!editable} value={map?.HIGH_EARTH} onChange={(e) => change('padPointMap', {
          ...map,
          HIGH_EARTH: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.rmu_load1' })}:</span>
        <Input disabled={!editable} value={map?.RMU_LOAD1} onChange={(e) => change('padPointMap', {
          ...map,
          RMU_LOAD1: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.rmu_earth1' })}:</span>
        <Input disabled={!editable} value={map?.RMU_EARTH1} onChange={(e) => change('padPointMap', {
          ...map,
          RMU_EARTH1: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.rmu_load2' })}:</span>
        <Input disabled={!editable} value={map?.RMU_LOAD2} onChange={(e) => change('padPointMap', {
          ...map,
          RMU_LOAD2: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.rmu_earth2' })}:</span>
        <Input disabled={!editable} value={map?.RMU_EARTH2} onChange={(e) => change('padPointMap', {
          ...map,
          RMU_EARTH2: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.low_remote1' })}:</span>
        <Input disabled={!editable} value={map?.LOW_REMOTE1} onChange={(e) => change('padPointMap', {
          ...map,
          LOW_REMOTE1: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.low_remote2' })}:</span>
        <Input disabled={!editable} value={map?.LOW_REMOTE2} onChange={(e) => change('padPointMap', {
          ...map,
          LOW_REMOTE2: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.low_breaker1' })}:</span>
        <Input disabled={!editable} value={map?.LOW_BREAKER1} onChange={(e) => change('padPointMap', {
          ...map,
          LOW_BREAKER1: e.target.value
        })} />
      </Row>
      <Row style={{ padding: '5px 0' }}>
        <span>{intl.formatMessage({ id: 'form.padWiringDiagram.pointMap.low_breaker2' })}:</span>
        <Input disabled={!editable} value={map?.LOW_BREAKER2} onChange={(e) => change('padPointMap', {
          ...map,
          LOW_BREAKER2: e.target.value
        })} />
      </Row>
    </CollapsePanel>
  </SingleCollapse>
}

const Diagram = (props: PropsType) => {
  return <BaseInfo {...props}>
    <BaseProfile {...props} />
    <PadPointForm {...props} key={props.current.id} />
  </BaseInfo>
}

export default memo(Diagram);