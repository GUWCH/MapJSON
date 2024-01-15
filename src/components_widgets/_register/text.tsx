import React, { useEffect, useRef, useState } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistText: WidgetRegistParameter = {
    order: 13,
    id: WidgetDef.TEXT,
    name: localText('WIDGET.TEXT'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.TextForm,
    defaultOptions: Widgets.TextDefaultOptions,
    renderConfigure: {
        props: Widgets.TextDefaultCfg,
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
            <Widgets.TextWidget
                isDemo={true}
                id={data.id}
                width={data.width}
                tplContainerWidth={data.tplContainerWidth}
                configure={{
                    ...data.props
                }}
            />
        </div>;
    }
}

export default RegistText;