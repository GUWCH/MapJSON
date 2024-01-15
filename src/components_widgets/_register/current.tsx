import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistDemo: WidgetRegistParameter = {
    order: 8,
    id: WidgetDef.CURRENT,
    name: localText('WIDGET.CURRENT'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.CurrentForm,
    defaultOptions: Widgets.CurrentDefaultOptions,
    renderConfigure: {
        props: Widgets.CurrentDefaultCfg,
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
            <Widgets.Current 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
                scale={config.getScaleState().value} 
            />
        </div>;
	}
}

export default RegistDemo;