import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistYXLightPlate: WidgetRegistParameter = {
    order: 10,
    id: WidgetDef.YX_LIGHT_PLATE,
    name: localText('WIDGET.YX_LIGHT_PLATE'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.YXLightPlateForm,
    defaultOptions: Widgets.YXLightPlateDefaultOptions,
    renderConfigure: {
        props: Widgets.YXLightPlateDefaultCfg,
		width: 300,
		height: 250,
		rotate: {
			canRotate: false,
			value: 0,
		}
    },
    render: (data, context, store, config) => {
		return <div style={{
            display: 'inline-block',
			zIndex: data.zIndex,
			width: data.width,
			height: data.height,
			overflow: 'hidden'
        }}>
            <Widgets.YXLightPlate 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistYXLightPlate;