import React from 'react'
import styles from './TreeSelect.module.scss'
import { Select } from 'antd'
import { Tree, TreeProps } from './Tree'

export type TreeSelectProps = {
    customCls?: string
    selectValue?: string
    treeProps: TreeProps
}

const TreeSelect: React.FC<TreeSelectProps> = ({
    customCls: selectCustomCls, selectValue, treeProps: { customCls, ...rest }
}) => {
    return <Select className={`${styles.select} ${selectCustomCls ?? ''}`} dropdownClassName={styles.dropdown} placeholder={'请选择'}
        dropdownMatchSelectWidth={false} value={selectValue}
        dropdownRender={() => {
            return <Tree {...rest} customCls={{ ...customCls, tree: `${styles.tree} ${customCls?.tree ?? ''}` }} />
        }} />
}

export default TreeSelect