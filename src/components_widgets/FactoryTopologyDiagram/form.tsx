import { DOMAIN_ENUM } from '@/common/constants';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import { useIntl } from "react-intl";
import { Select } from 'antd';
import { UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import React, { memo, useState } from 'react';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { IFactoryTopologyDiagramFormCfg } from '.';
import { PointCandidatesForm } from '../common/components/PointConfiguration/form';
import { useUserConfigChange } from '../common/hooks';
import { PadPointForm } from '../PADWiringDiagram/form';
import msg from '@/common/lang';
const isZh = msg.isZh

export interface PropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
};

const FactoryTopologyDiagramForm = memo((props: PropsType) => {
  const intl = useIntl()
  const change = useUserConfigChange<keyof IFactoryTopologyDiagramFormCfg>(props.config.getStore(), props.current.id)

  // 使用内部state，以实现仅邻域发生变化时触发padConfig变化
  const [isEMS, setIsEMS] = useState<boolean>()

  return <BaseInfo {...props}>
    <BaseProfile {...props}></BaseProfile>
    <SingleCollapse>
      <CollapsePanel key={'1'} header={intl.formatMessage({ id: 'form.factoryTopology.choseDomain' })}>
        <Select style={{ width: '90%' }} placeholder={isZh ? '请选择' : 'Please select'} options={[
          {
            label: intl.formatMessage({ id: 'form.factoryTopology.solarDomain' }),
            key: 'solar',
            value: DOMAIN_ENUM.SOLAR
          },
          {
            label: intl.formatMessage({ id: 'form.factoryTopology.windDomain' }),
            key: 'wind',
            value: DOMAIN_ENUM.WIND
          },
          {
            label: intl.formatMessage({ id: 'form.factoryTopology.storageDomain' }),
            key: 'storage',
            value: DOMAIN_ENUM.STORAGE
          },
        ]}
          value={props.current.props.domain}
          onChange={v => {
            change('domain', v)
            setIsEMS(v === DOMAIN_ENUM.STORAGE)
          }} />
      </CollapsePanel>
    </SingleCollapse>
    {/* <PointCandidatesForm name={intl.formatMessage({ id: 'form.factoryTopology.barrowRelated' })} pointTypes={['YX']}
      candidates={props.current.props.barrowRelatePointCandidates}
      domainId={props.current.props.barrowRelatePointDomainId}
      modelId={props.current.props.barrowRelatePointModelId}
      onDomainChange={(d) => change('barrowRelatePointDomainId', d)}
      onModelChange={(m) => change('barrowRelatePointModelId', m)}
      onPointsChange={(p) => change('barrowRelatePointCandidates', p)} />
    <PointCandidatesForm name={intl.formatMessage({ id: 'form.factoryTopology.barrowFields' })}
      candidates={props.current.props.barrowFieldsCandidates}
      domainId={props.current.props.barrowFieldsDomainId}
      modelId={props.current.props.barrowFieldsModelId}
      onDomainChange={(d) => change('barrowFieldsDomainId', d)}
      onModelChange={(m) => change('barrowFieldsModelId', m)}
      onPointsChange={(p) => change('barrowFieldsCandidates', p)} /> */}
    <PointCandidatesForm name={intl.formatMessage({ id: 'form.factoryTopology.padFields' })}
      candidates={props.current.props.padFieldsCandidates}
      domainId={props.current.props.padFieldsDomainId}
      modelId={props.current.props.padFieldsModelId}
      onDomainChange={(d) => {
        change('padFieldsDomainId', d)
        change('padFieldsCandidates', [])
      }}
      onModelChange={m => {
        change('padFieldsModelId', m)
        change('padFieldsCandidates', [])
      }}
      onPointsChange={p => change('padFieldsCandidates', p)} />
    <PointCandidatesForm name={intl.formatMessage({ id: 'form.factoryTopology.subRelated' })} pointTypes={['YX']}
      candidates={props.current.props.subRelatePointCandidates}
      domainId={props.current.props.subRelatePointDomainId}
      modelId={props.current.props.subRelatePointModelId}
      onDomainChange={(d) => {
        change('subRelatePointDomainId', d)
        change('subRelatePointCandidates', [])
      }}
      onModelChange={(m) => {
        change('subRelatePointModelId', m)
        change('subRelatePointCandidates', [])
      }}
      onPointsChange={p => change('subRelatePointCandidates', p)} />
    <PointCandidatesForm name={intl.formatMessage({ id: 'form.factoryTopology.subFields' })}
      candidates={props.current.props.subFieldsCandidates}
      domainId={props.current.props.subFieldsDomainId}
      modelId={props.current.props.subFieldsModelId}
      onDomainChange={(d) => {
        change('subFieldsDomainId', d)
        change('subFieldsCandidates', [])
      }}
      onModelChange={(m) => {
        change('subFieldsModelId', m)
        change('subFieldsCandidates', [])
      }}
      onPointsChange={p => change('subFieldsCandidates', p)} />
    <PadPointForm {...props} outerIsEMS={isEMS}/>
  </BaseInfo>
})

export default FactoryTopologyDiagramForm;