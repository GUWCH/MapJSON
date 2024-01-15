import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistAlarm: WidgetRegistParameter = {
    order: 5,
    id: WidgetDef.ALARM,
    name: localText('WIDGET.ALARM'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.AlarmForm,
    defaultOptions: Widgets.AlarmDefaultOptions,
    renderConfigure: {
        props: Widgets.AlarmDefaultCfg,
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
            <Widgets.Alarm 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistAlarm;