import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistPCSTopologyDiagram: WidgetRegistParameter = {
    order: 13,
    id: WidgetDef.PCS_TOPOLOGY_DIAGRAM,
    name: localText('WIDGET.PCS_TOPOLOGY_DIAGRAM'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.PCSTopologyDiagramForm,
    defaultOptions: Widgets.PCSTopologyDiagramDefaultOptions,
    renderConfigure: {
        props: Widgets.PCSTopologyDiagramDefaultCfg,
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
            <Widgets.PCSTopologyDiagram
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistPCSTopologyDiagram;