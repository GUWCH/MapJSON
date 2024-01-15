import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistDemo: WidgetRegistParameter = {
    order: 17,
    id: WidgetDef.GRID,
    name: localText('WIDGET.GRID'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.GridForm,
    defaultOptions: Widgets.GridDefaultOptions,
    renderConfigure: {
        props: Widgets.GridDefaultCfg,
		width: 300,
		height: 200,
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
            <Widgets.Grid 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
                scale={config.getScaleState().value} 
            />
        </div>;
	}
}

export default RegistDemo;