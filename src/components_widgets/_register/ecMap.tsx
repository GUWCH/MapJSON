import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistEcMap: WidgetRegistParameter = {
    order: 17,
    id: WidgetDef.EC_MAP,
    name: localText('WIDGET.EC_MAP'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.EcMapForm,
    defaultOptions: Widgets.EcMapDefaultOptions,
    renderConfigure: {
        props: Widgets.EcMapDefaultCfg,
		width: 1920,
		height: 1080,
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
            <Widgets.EcMap 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
                scale={config.getScaleState().value} 
            />
        </div>;
	}
}

export default RegistEcMap;