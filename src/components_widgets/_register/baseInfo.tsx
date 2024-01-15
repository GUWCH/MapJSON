import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const defaultCfg = Widgets.BaseInfoDefaultCfg

const RegistBaseInfo: WidgetRegistParameter = {
    order: 4,
    id: WidgetDef.YC_ELECTRIC_INFO,
    name: localText('WIDGET.YC_ELECTRIC_INFO'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.BaseInfoForm,
    defaultOptions: Widgets.BaseInfoDefaultOptions,
    renderConfigure: {
        props: defaultCfg,
		width: 500,
        height: 400,
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
            <Widgets.BaseInfo 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistBaseInfo;