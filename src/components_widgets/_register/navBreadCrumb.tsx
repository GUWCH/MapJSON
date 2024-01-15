import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistNavBreadCrumb: WidgetRegistParameter = {
    order: 7,
    id: WidgetDef.NAV_BREAD_CRUMB,
    name: localText('WIDGET.NAV_BREAD_CRUMB'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.NavBreadCrumbForm,
    defaultOptions: Widgets.NavBreadCrumbDefaultOptions,
    renderConfigure: {
        props: Widgets.NavBreadCrumbDefaultCfg,
		width: 350,
		height: 22,
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
            <Widgets.NavBreadCrumb 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistNavBreadCrumb;