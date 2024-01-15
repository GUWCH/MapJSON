import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistFactoryTopologyDiagram: WidgetRegistParameter = {
    order: 13,
    id: WidgetDef.FACTORY_TOPOLOGY_DIAGRAM,
    name: localText('WIDGET.FACTORY_TOPOLOGY_DIAGRAM'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.FactoryTopologyDiagramForm,
    defaultOptions: Widgets.FactoryTopologyDiagramDefaultOptions,
    renderConfigure: {
        props: Widgets.FactoryTopologyDiagramFormDefaultCfg,
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
            <Widgets.FactoryTopologyDiagramWidget
                isDemo={true}
                id={data.id}
                configure={{ ...data.props }}
            />
        </div>;
    }
}

export default RegistFactoryTopologyDiagram;