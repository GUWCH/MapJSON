import _ from 'lodash'
import { DataNode as SelectDataNode } from 'rc-tree-select/lib/interface'
import { DataNode as TreeDataNode } from 'rc-tree/lib/interface'
import { ReactNode } from 'react'

export interface Node {
    key: string
    name: string
    parentKey?: string
}

export class LinkedNode implements Node {
    constructor(key: string, name: string, parentKey?: string) {
        this.key = key
        this.name = name
        this.parentKey = parentKey
    }

    key: string
    name: string
    children: LinkedNode[] = []

    parentKey?: string
    parent: LinkedNode | null = null

    linkChildrenNodes(cArr: LinkedNode[]) {
        this.children.push(...cArr)
        cArr.forEach((n) => {
            n.parent = this
        })
    }

    toSelectDataNode(options?: { checkableKeys?: string[] }): SelectDataNode {
        return {
            key: this.key,
            title: this.name,
            value: this.key,
            disableCheckbox: !!options?.checkableKeys && !options.checkableKeys.includes(this.key),
            children: this.children.length > 0 ? this.children.map(n => n.toSelectDataNode(options)) : undefined
        }
    }

    toTreeDataNode(options?: {
        checkableKeys?: string[],
        onTitleRender?: (title: string, node: LinkedNode) => ReactNode,
        onConvertToTreeDataNode?: (origin: TreeDataNode, node: LinkedNode) => TreeDataNode
    }): TreeDataNode {
        const origin: TreeDataNode = {
            key: this.key,
            title: options?.onTitleRender ? options.onTitleRender(this.name, this) : this.name,
            disableCheckbox: !!options?.checkableKeys && !options.checkableKeys.includes(this.key),
            children: this.children.length > 0 ? this.children.map(n => n.toTreeDataNode(options)) : undefined
        }
        if (options?.onConvertToTreeDataNode) {
            return options.onConvertToTreeDataNode(origin, this)
        }
        return origin
    }
}

export class Tree {
    constructor(arr: Node[]) {
        const groupByParentKey: Record<string, LinkedNode[] | undefined> = {}
        const nodeByKey: Record<string, LinkedNode | undefined> = {}
        const allNodes: LinkedNode[] = []
        arr.forEach(n => {
            const node = new LinkedNode(n.key, n.name, n.parentKey)
            allNodes.push(node)
            nodeByKey[node.key] = node

            const parentKeyGroup = groupByParentKey[node.parentKey ?? '']
            if (parentKeyGroup) {
                parentKeyGroup.push(node)
            } else {
                groupByParentKey[node.parentKey ?? ''] = [node]
            }
        })
        _.each(_.omit(groupByParentKey, ''), (children, parentKey) => {
            const parentNode = nodeByKey[parentKey]
            if (parentNode && children) {
                parentNode.linkChildrenNodes(children)
            }
        })

        this.root = groupByParentKey[''] ?? []
        this.keyMap = nodeByKey
        this.allNodes = allNodes
    }

    keyMap: Record<string, LinkedNode | undefined>
    allNodes: LinkedNode[]
    root: LinkedNode[]

    toSelectDataNode(options?: {
        checkableKeys?: string[]
    }): SelectDataNode[] {
        return this.root.map(n => n.toSelectDataNode(options))
    }

    toTreeDataNode(options?: {
        checkableKeys?: string[]
        onTitleRender?: (title: string, node: LinkedNode) => ReactNode
        onConvertToTreeDataNode?: (origin: TreeDataNode, node: LinkedNode) => TreeDataNode
    }): TreeDataNode[] {
        return this.root.map(n => n.toTreeDataNode(options))
    }

}