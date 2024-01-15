import React, { useEffect, useRef, useState } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistPicture: WidgetRegistParameter = {
    order: 13,
    id: WidgetDef.PICTURE,
    name: localText('WIDGET.PICTURE'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.PictureForm,
    defaultOptions: Widgets.PictureDefaultOptions,
    renderConfigure: {
        props: Widgets.PictureDefaultCfg,
        width: 300,
        height: 300,
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
            <Widgets.PictureWidget
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

export default RegistPicture;