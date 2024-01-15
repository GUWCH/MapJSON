import React from 'react';
import * as Widgets from './index';

/** 组件按钮分组类型 */
export enum WidgetMenuType {
    BASIC = 'basic'
}

/**
 * @requires 组件ID定义
 */
export const WidgetDef = {
    DEMO: 'demo',
    WIRING_DIAGRAM: 'wiringDiagram',
    LIST: 'list',
    CURVE: 'curve',
    YC_ELECTRIC_INFO: 'YCElectricInfo',
    ALARM: 'alarm',
    NAV_BREAD_CRUMB: 'NAV_BREAD_CRUMB',
    CURRENT: 'current',
    KEY_INFO: 'key_info',
    YX_LIGHT_PLATE: 'YXLightPlate',
    PCS_WIRING_DIAGRAM: 'PCSWiringDiagram',
    BATTERIES: 'Batteries',
    PCS_TOPOLOGY_DIAGRAM: 'PCSTopologyDiagram',
    FACTORY_TOPOLOGY_DIAGRAM: 'FactoryTopologyDiagram',
    LIGHT_CARD: 'LightCard',
    STATISTICS_INFO: 'StatisticsInfo',
    OVERVIEW: 'Overview',
    EC_MAP: 'ec_map',
    GRID: 'Grid',
    TEXT: 'text',
    TEXTAREA: 'textArea',
    PICTURE: 'picture',
    RANK_LIST: 'rankList',
    VALUE_DISTRIBUTOR: 'ValueDistributor'
};

/**
 * @requires 组件定义
 */
export default {
    [WidgetDef.DEMO]: Widgets.Demo,
    [WidgetDef.WIRING_DIAGRAM]: Widgets.WiringDiagram,
    [WidgetDef.LIST]: Widgets.List,
    [WidgetDef.CURVE]: Widgets.Curve,
    [WidgetDef.YC_ELECTRIC_INFO]: Widgets.BaseInfo,
    [WidgetDef.ALARM]: Widgets.Alarm,
    [WidgetDef.NAV_BREAD_CRUMB]: Widgets.NavBreadCrumb,
    [WidgetDef.CURRENT]: Widgets.Current,
    [WidgetDef.KEY_INFO]: Widgets.KeyInfo,
    [WidgetDef.YX_LIGHT_PLATE]: Widgets.YXLightPlate,
    [WidgetDef.PCS_WIRING_DIAGRAM]: Widgets.PCSWiringDiagram,
    [WidgetDef.BATTERIES]: Widgets.Batteries,
    [WidgetDef.PCS_TOPOLOGY_DIAGRAM]: Widgets.PCSTopologyDiagram,
    [WidgetDef.FACTORY_TOPOLOGY_DIAGRAM]: Widgets.FactoryTopologyDiagramWidget,
    [WidgetDef.LIGHT_CARD]: Widgets.LightCard,
    [WidgetDef.STATISTICS_INFO]: Widgets.StatisticsInfo,
    [WidgetDef.OVERVIEW]: Widgets.Overview,
    [WidgetDef.EC_MAP]: Widgets.EcMap,
    [WidgetDef.GRID]: Widgets.Grid,
    [WidgetDef.TEXT]: Widgets.TextWidget,
    [WidgetDef.TEXTAREA]: Widgets.TextAreaWidget,
    [WidgetDef.PICTURE]: Widgets.PictureWidget,
    [WidgetDef.RANK_LIST]: Widgets.RankList,
    [WidgetDef.VALUE_DISTRIBUTOR]: Widgets.ValueDistributor
};