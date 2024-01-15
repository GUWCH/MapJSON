import React, { memo, useCallback } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';

export interface PCSWiringDiagramPropsType {
  data: {};
  current: IBlockType;
  config: UserConfig;
};

const PCSWiringDiagramForm = (props: PCSWiringDiagramPropsType) => {
  return <BaseInfo {...props}>
    <BaseProfile {...props}></BaseProfile>
  </BaseInfo>
}

export default memo(PCSWiringDiagramForm);