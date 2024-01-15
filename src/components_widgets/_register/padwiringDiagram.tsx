import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistWiringDiagram: WidgetRegistParameter = {
    order: 3,
    id: WidgetDef.WIRING_DIAGRAM,
    name: localText('WIDGET.WIRING_DIAGRAM'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.DiagramForm,
    defaultOptions: Widgets.DiagramDefaultOptions,
    renderConfigure: {
        props: Widgets.DiagramDefaultCfg,
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
            <Widgets.WiringDiagram 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistWiringDiagram;