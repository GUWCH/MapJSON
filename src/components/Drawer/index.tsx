import React from 'react'
import styles from './index.module.scss'
import { Drawer, DrawerProps } from 'antd'

export type StyledDrawerProps = {} & DrawerProps

const StyledDrawer: React.FC<StyledDrawerProps> = (props) => {
    return <Drawer
        className={styles.drawer}
        placement="right"
        closable={false}
        width={'328px'}
        {...props}
    >
        {props.children}
    </Drawer>
}

export default StyledDrawer