import React from 'react'
import styles from './index.module.scss'
import { Collapse, CollapsePanelProps, CollapseProps } from 'antd'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'

export type StyledCollapseProps = CollapseProps

const StyledCollapse: React.FC<StyledCollapseProps> = (props) => {
    return <Collapse className={styles.collapse}
        expandIcon={(ps) => ps.isActive ? <FontIcon type={iconsMap.DIRECT_DOWN} /> : <FontIcon type={iconsMap.DIRECT_RIGHT} />}
        {...props}>
        {props.children}
    </Collapse>
}

export type StyledCollapsePanelProps = CollapsePanelProps

export const StyledCollapsePanel: React.FC<StyledCollapsePanelProps> = ({ children, ...rest }) => {
    return <Collapse.Panel className={styles.panel} {...rest}>
        {children}
    </Collapse.Panel>
}

export default StyledCollapse