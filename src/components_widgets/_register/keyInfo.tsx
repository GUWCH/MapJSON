import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistKeyInfo: WidgetRegistParameter = {
    order: 8,
    id: WidgetDef.KEY_INFO,
    name: localText('WIDGET.KEY_INFO'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.KeyInfoForm,
    defaultOptions: Widgets.KeyInfoDefaultOptions,
    renderConfigure: {
        props: Widgets.KeyInfoDefaultCfg,
		width: 1800,
		height: 45,
        resize: false,
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
            <Widgets.KeyInfo 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistKeyInfo;