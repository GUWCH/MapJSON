import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistDemo: WidgetRegistParameter = {
    order: 2,
    id: WidgetDef.LIST,
    name: localText('WIDGET.LIST'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.ListForm,
    defaultOptions: Widgets.ListDefaultOptions,
    renderConfigure: {
        props: JSON.parse(JSON.stringify(Widgets.ListDefaultCfg)),
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
            <Widgets.List 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistDemo;
