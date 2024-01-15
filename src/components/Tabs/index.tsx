import { Tabs as AntTabs } from "antd";
import React from "react";
import styles from './index.module.scss';

export type TabsProps = React.ComponentProps<typeof AntTabs> & {
    defaultActiveKey?: string
    toolBar?: React.ReactElement
    extendsHeight?: boolean // 是否由父元素决定高度
}

const Tabs: React.FC<TabsProps> = ({ defaultActiveKey, children,extendsHeight, toolBar, ...rest }) => {
    const defaultKey = defaultActiveKey ? defaultActiveKey : children?.[0]?.key?.toString()

    return <AntTabs 
        className={`${styles.bar} 
        ${extendsHeight? styles.eh: ''}`} 
        defaultActiveKey={defaultKey} 
        tabBarExtraContent={toolBar} 
        {...rest}
    >
        {children}
    </AntTabs>
}

export const TabPane = AntTabs.TabPane
export default Tabs
