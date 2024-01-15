/** 组件注册配置参数 */
interface WidgetRegistParameter {
    order: number;
    id: string;
    name: string;
    menu: {
        type: WidgetMenuType;
        imgCustom: React.ReactNode;
    };
    formRender: React.ReactNode;
    defaultOptions: {};
    renderConfigure: {};
    render: React.ReactNode;
}

interface CommonConfigure {
    customAssetAlias?: string;
    title?: string,
    title_en?: string,
    needTitleSign?: boolean,
    titleSignColor?: string,
    bg_enable?: boolean,
    bg_color?: string,
    divide_enable?: boolean,
    divide_color?: string,
    divide_loc?: ('top' | 'right' | 'bottom' | 'left')[],
    [key: string]: any
}

/**
 * 所有组件属性
 */
interface WidgetProps {
    isDemo?: boolean;
    /** 页面当前节点别名  */
    nodeAlias?: string;
    /** 控件资产别名, 控件资产不一定是页面当前节点别名, 有可能是设备 */
    assetAlias?: string;
    pageId?: string;
    pageSign?: string;
    id?: string;
    configure?: CommonConfigure;
    scale?: number;
    /** 组件是否可编辑配置, 配置按钮是否可用 */
    editable?: boolean;
    /** 页面全局属性
     * mobx对象
     * 一般作为方法去修改属性, 属性采用基本变量, 然后通过属性传递给组件
     * 如果作为渲染驱动需要注意组件监听, 尽量不要使用, 否则增加维护成本
     */
    globalStores?: any;
    width?: number;
    height?: number;
    tplContainerWidth?: number;
    tplContainerHeight?: number;
}

/** 组件元素 */
type WidgetElement<T> = React.FC<Omit<WidgetProps, 'configure'> & { configure: T }>;