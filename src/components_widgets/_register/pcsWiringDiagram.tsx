import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistPCSWiringDiagram: WidgetRegistParameter = {
    order: 11,
    id: WidgetDef.PCS_WIRING_DIAGRAM,
    name: localText('WIDGET.PCS_WIRING_DIAGRAM'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.PCSWiringDiagramForm,
    defaultOptions: Widgets.PCSWiringDiagramDefaultOptions,
    renderConfigure: {
        props: Widgets.PCSWiringDiagramDefaultCfg,
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
            <Widgets.PCSWiringDiagram
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistPCSWiringDiagram;