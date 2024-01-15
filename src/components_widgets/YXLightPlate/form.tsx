import React, { memo } from 'react';
import { UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { POINT_TABLE } from '@/common/constants';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import ConfigPanel from '../common/components/PointTplConfiguration/configPanel';

export interface YXLightPlatePropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const YXLightPlateForm = (props: YXLightPlatePropsType) => {
    return <BaseInfo {...props}>
        <BaseProfile {...props} />
        <ConfigPanel {...props} pointTypes={[POINT_TABLE.YX]} key={props.current.id}/>
    </BaseInfo>
}

export default memo(YXLightPlateForm);