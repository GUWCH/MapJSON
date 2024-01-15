import React, { memo, useCallback } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import { PadPointForm } from '../PADWiringDiagram/form';

export interface PropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
};

const PCSTopologyDiagramForm = (props: PropsType) => {

  return <BaseInfo {...props}>
    <BaseProfile {...props}></BaseProfile>
    <PadPointForm {...props}/>
  </BaseInfo>
}

export default memo(PCSTopologyDiagramForm);