import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { localText } from '@/common/util-scada';
import { WidgetDef, WidgetMenuType } from '../define';
import * as Widgets from '../index';

const RegistRankList: WidgetRegistParameter = {
    order: 17,
    id: WidgetDef.RANK_LIST,
    name: localText('WIDGET.RANK_LIST'),
    menu: {
        type: WidgetMenuType.BASIC,
        imgCustom: <PlayCircleOutlined />
    },
    formRender: Widgets.RankListForm,
    defaultOptions: Widgets.RankListDefaultOptions,
    renderConfigure: {
        props: Widgets.RankListDefaultCfg,
        width: 300,
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
            <Widgets.RankList
                isDemo={true}
                id={data.id}
                configure={{
                    ...data.props
                }}
            />
        </div>;
    }
}

export default RegistRankList;