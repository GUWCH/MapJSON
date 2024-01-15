import React from 'react';
import { Collapse } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import type { CollapseProps, CollapsePanelProps } from 'antd';
import styles from './style.mscss';

function SingleCollapse(props: CollapseProps & {children?: React.ReactNode}){
    return <Collapse
        {...props}
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
        className={styles.base}
    >{props.children}</Collapse>
}

export const CollapsePanel = (props: CollapsePanelProps & {children?: React.ReactNode}) => {
    return <Collapse.Panel
    {...props}
    className={styles.panel}
    >
        {props.children}
    </Collapse.Panel>
}

export default SingleCollapse;