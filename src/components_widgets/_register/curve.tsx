import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistCurve: WidgetRegistParameter = {
    order: 6,
    id: WidgetDef.CURVE,
    name: localText('WIDGET.CURVE'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.CurveForm,
    defaultOptions: Widgets.CurveDefaultOptions,
    renderConfigure: {
        props: Widgets.CurveDefaultCfg,
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
            <Widgets.Curve 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
                scale={config.getScaleState().value} 
            />
        </div>;
	}
}

export default RegistCurve;
