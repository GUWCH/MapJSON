import React, { useEffect, useRef, useState } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistTextArea: WidgetRegistParameter = {
    order: 13,
    id: WidgetDef.TEXTAREA,
    name: localText('WIDGET.TEXTAREA'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.TextAreaForm,
    defaultOptions: Widgets.TextAreaDefaultOptions,
    renderConfigure: {
        props: Widgets.TextAreaDefaultCfg,
        width: 150,
        height: 50,
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
            <Widgets.TextAreaWidget
                isDemo={true}
                id={data.id}
                configure={{
                    ...data.props
                }}
            />
        </div>;
    }
}

export default RegistTextArea;