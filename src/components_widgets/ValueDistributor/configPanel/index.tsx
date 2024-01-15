import React, { memo, useCallback } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import styles from './index.module.scss';
import { useIntl } from 'react-intl';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseModels, { ObjectModel, uIdKey } from '@/components_utils/models';
import { IValueDistributorCfg } from '../ValueDistributor';
import _ from 'lodash';
import { combinePointKey } from '@/common/utils/model';
import { generatePointKey } from '@/components_utils/models/_util';

export interface PropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
};

type ModelCfg = ArrayElement<IValueDistributorCfg['models']>

const convertToObject = (m: ModelCfg): ObjectModel => {
  const obj: ObjectModel = {
    model_id: m.model_id,
    model_name: m.model_name,
    model_name_cn: m.model_name_cn,
    table_no: m.table_no,
    type: m.type,
    domain: {
      domain_id: m.domainId,
      domain_name: m.domainName,
      domain_name_cn: m.domainNameCn
    },
    selectedPoint: m.points.map(p => {
      return {
        alias: p.alias,
        const_name_list: p.constNameList ?? [],
        field_no: p.fieldNo,
        if_standard: !!p.ifStandard,
        name_cn: p.nameCn,
        name_en: p.nameEn,
        point_type: p.pointType ?? '',
        table_no: p.tableNo,
        type: p.type ?? '',
        unit: p.unit ?? '',
        [uIdKey]: generatePointKey({
          alias: p.alias, table_no: p.tableNo, field_no: p.fieldNo
        })
      }
    })
  }

  return obj
}

const convertToModel = (o: ObjectModel): ModelCfg => {
  const selectedPoint = Array.isArray(o.selectedPoint) ? o.selectedPoint : (o.selectedPoint ? [o.selectedPoint] : [])
  const cfg: ModelCfg = {
    model_id: o.model_id,
    model_name: o.model_name,
    model_name_cn: o.model_name_cn ?? '',
    table_no: _.isNumber(o.table_no) ? o.table_no : parseInt(o.table_no),
    type: _.isNumber(o.type) ? o.type : parseInt(o.type),
    domainId: o.domain?.domain_id ?? '',
    domainName: o.domain?.domain_name ?? '',
    domainNameCn: o.domain?.domain_name_cn ?? '',
    points: selectedPoint.map(p => {
      const tableNo = _.isNumber(p.table_no) ? p.table_no : parseInt(p.table_no)
      const fieldNo = _.isNumber(p.field_no) ? p.field_no : parseInt(p.field_no)
      return {
        key: combinePointKey({
          alias: p.alias,
          type: p.type,
          tableNo,
          fieldNo,
        }),
        nameCn: p.name_cn,
        nameEn: p.name_en,
        name: '',
        alias: p.alias,
        unit: p.unit,
        type: p.type,
        ifStandard: p.if_standard,
        pointType: p.point_type,
        tableNo,
        fieldNo,
        constNameList: p.const_name_list?.map(c => ({
          name: c.name, name_en: c.name_en, value: c.value
        }))
      } as TPoint
    })
  }
  return cfg
}

const Form = (props: PropsType) => {
  const intl = useIntl()
  const { current, config } = props

  const store = config.getStore();

  const updateModels = useCallback((value: ModelCfg[]) => {
    const cloneData = deepCopy(store.getData());
    const newblock = cloneData.block.map((v: IBlockType) => {
      if (v.id === current.id) {
        v.props.models = value
      }
      return v;
    });
    store.setData({ ...cloneData, block: [...newblock] });
  }, [store, current])

  const models: ModelCfg[] = current.props.models ?? []

  return <BaseInfo {...props}>
    <BaseProfile {...props} />
    <SingleCollapse>
      <CollapsePanel header={intl.formatMessage({ id: 'form.valueDistributor.points', defaultMessage: '' })} key={'1'}>
        <BaseModels
          multiple
          selectedObject={models.map(convertToObject)}
          needSelectPoint
          filterType={['62', '61']}
          onChange={(v) => {
            const selected = v.selectedObject
            if (Array.isArray(selected)) {
              updateModels(selected.map(convertToModel))
            }
          }}
        />
      </CollapsePanel>
    </SingleCollapse>
  </BaseInfo>
}

export default memo(Form);