import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistValueDistributor: WidgetRegistParameter = {
    order: 4,
    id: WidgetDef.VALUE_DISTRIBUTOR,
    name: localText('WIDGET.VALUE_DISTRIBUTOR'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.ValueDistributorForm,
    defaultOptions: Widgets.ValueDistributorDefaultOptions,
    renderConfigure: {
        props: Widgets.ValueDistributorDefaultCfg,
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
            <Widgets.ValueDistributor 
                isDemo = {true} 
                id = {data.id} 
                configure={{...data.props}} 
            />
        </div>;
	}
}

export default RegistValueDistributor;