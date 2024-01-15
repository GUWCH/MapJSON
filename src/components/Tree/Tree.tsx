import { Input, Tree as AntTree, TreeDataNode } from "antd"
import React, { useState, useMemo, useEffect, ReactNode } from "react"
import { Tree as TreeCls, LinkedNode, Node } from "./treeObj"
import { SearchOutlined } from '@ant-design/icons';
import styles from './Tree.module.scss'
import Empty from "Empty";
import HighlightText from "HighlightText";

export type TreeProps = {
    multiple?: boolean
    limit?: number
    loading?: boolean
    nodes?: Node[]
    onTitleRender?: (title: string, n: LinkedNode, originContent: ReactNode) => ReactNode
    /* 选中的key（受控） */
    selectedKeys?: string[]
    onChange?: (items: LinkedNode[]) => void
    searchOptions?: {
        disable?: boolean
        searchOnEnter?: boolean
    }
    customCls?: {
        container?: string
        search?: string
        tree?: string
    }
}
export const Tree = ({
    multiple, limit = -1, selectedKeys, loading, nodes = [], onTitleRender, searchOptions, customCls, onChange
}: TreeProps) => {
    const [searchValue, setSearchValue] = useState<string | undefined>()
    const [_searchValue, _setSearchValue] = useState<string | undefined>()
    const [treeData, setTreeData] = useState<TreeDataNode[]>([])
    const [hiddenSelectedNodes, setHiddenSelectedNodes] = useState<LinkedNode[]>([])
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])

    const originTree = useMemo(() => new TreeCls(nodes), [nodes])
    const shouldLimit = multiple && limit >= 0 && selectedKeys && selectedKeys.length >= limit
    useEffect(() => {
        let filteredTree = originTree
        const expandNodeKeys = new Set<string>()
        if (searchValue) {
            const filteredNodes = new Set<Node>()

            const addNodeWithParentsAndChildren = (n: LinkedNode) => {
                filteredNodes.add(n)

                let currentParent = n.parent
                while (currentParent) {
                    if (filteredNodes.has(currentParent)) {
                        break
                    }
                    expandNodeKeys.add(currentParent.key)
                    filteredNodes.add(currentParent)
                    currentParent = currentParent.parent
                }

                const childrenStack = [...n.children]
                let currentChild: LinkedNode | undefined = undefined
                while (currentChild = childrenStack.pop()) {
                    filteredNodes.add(currentChild)
                    childrenStack.push(...currentChild.children)
                }
            }


            const nStack = [...originTree.root]
            const loopMark: Record<string, boolean | undefined> = {}

            let current: LinkedNode | undefined = undefined
            while (current = nStack.pop()) {
                // 若存在符合筛选的子节点，本节点应该已经被加入
                if (filteredNodes.has(current)) {
                    continue
                }

                // 优先处理子节点
                if (current.children.length > 0 && !loopMark[current.key]) {
                    nStack.push(current, ...current.children)
                    loopMark[current.key] = true
                    continue
                }

                if (current.name.includes(searchValue)) {
                    addNodeWithParentsAndChildren(current)
                }
            }

            filteredTree = new TreeCls(Array.from(filteredNodes))
        }

        const selected = (selectedKeys ?? []).map(k => originTree.keyMap[k]).filter(a => a) as LinkedNode[]
        const shouldLimit = multiple && limit >= 0 && selected.length >= limit
        const options = filteredTree.toTreeDataNode({
            checkableKeys: shouldLimit ? selected.map(n => n.key) : undefined,
            onTitleRender: (title, node) => {
                const content = <HighlightText title={title} highlight={searchValue}>{title}</HighlightText>
                return onTitleRender ? onTitleRender(title, node, content) : content
            },
            onConvertToTreeDataNode: (origin, node) => {
                return Object.assign({}, origin, { selectable: node.children.length === 0 })
            }
        }) ?? []
        const hiddenSelectedNodes = searchValue && selectedKeys ?
            selected.filter((n) => !n.name.includes(searchValue) && selectedKeys.includes(n.key)) : []

        setTreeData(options)
        setExpandedKeys(Array.from(expandNodeKeys))
        setHiddenSelectedNodes(hiddenSelectedNodes)
    }, [originTree, shouldLimit, searchValue, multiple, onTitleRender])

    const handleChange = (selected: LinkedNode[]) => {
        onChange && onChange(selected.concat(...hiddenSelectedNodes))
    }

    useEffect(() => {
        if (selectedKeys && !loading && originTree) {
            const newSelected = selectedKeys.map(k => {
                const assetNode = originTree.keyMap[k]
                return assetNode
            }).filter(a => a) as LinkedNode[]
            if (newSelected.length !== selectedKeys.length) {
                handleChange(newSelected)
            }
        }
    }, [selectedKeys, originTree, limit, loading])

    return <div className={`${styles.container} ${customCls?.container ?? ''}`}>
        <div className={`${styles.search} ${customCls?.search ?? ''}`}>
            <Input value={_searchValue} onChange={v => {
                if (!searchOptions?.searchOnEnter) {
                    setSearchValue(v.target.value)
                }
                _setSearchValue(v.target.value)
            }} onKeyDownCapture={e => {
                if (searchOptions?.searchOnEnter && e.key === 'Enter') {
                    setSearchValue(_searchValue)
                    e.preventDefault()
                }
            }} prefix={<SearchOutlined />} />
        </div>
        {treeData.length > 0 ? <AntTree className={`${styles.tree} ${customCls?.tree ?? ''}`}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys.map(k => String(k)))}
            multiple={multiple} checkable={multiple} selectable={!multiple}
            treeData={treeData} checkedKeys={multiple ? selectedKeys : []} selectedKeys={!multiple ? selectedKeys : []}
            onSelect={(keys, info) => {
                const keyMap = originTree?.keyMap ?? {}
                let selected = info.selectedNodes.map(n => keyMap[n.key]) as LinkedNode[]
                if (limit > 0) {
                    selected = selected.slice(0, limit)
                }
                handleChange(selected)
            }}
            onCheck={(keys, info) => {
                const keyMap = originTree?.keyMap ?? {}
                let selected = info.checkedNodes.map(n => keyMap[n.key]) as LinkedNode[]
                if (limit > 0) {
                    selected = selected.slice(0, limit)
                }
                handleChange(selected)
            }} /> : <Empty />}
    </div>
}