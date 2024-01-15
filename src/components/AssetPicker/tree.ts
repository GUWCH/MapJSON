import _ from 'lodash'
import { TAsset } from './type'
import { DataNode as SelectDataNode } from 'rc-tree-select/lib/interface'
import { DataNode as TreeDataNode } from 'rc-tree/lib/interface'


export class LinkedAssetNode {
    constructor(key: string, name: string, modelId?: string, model?: string, parentKey?: string) {
        this.key = key
        this.name = name
        this.modelId = modelId
        this.model = model
        this.parentKey = parentKey
    }

    key: string
    name: string
    modelId?: string
    model?: string
    children: LinkedAssetNode[] = []

    parentKey?: string
    parent: LinkedAssetNode | null = null
    // 在同种设备类型中的序号
    indexInModelIdGroup: number | null = null

    toAsset(): TAsset {
        return {
            key: this.key,
            name: this.name,
            modelId: this.modelId,
            model: this.model,
            parentKey: this.parentKey
        }
    }

    shallowClone(): LinkedAssetNode {
        const node = new LinkedAssetNode(this.key, this.name, this.modelId, this.model, this.parentKey)
        node.children = this.children
        node.parent = this.parent
        node.indexInModelIdGroup = this.indexInModelIdGroup
        return node
    }

    linkChildrenNodes(cArr: LinkedAssetNode[]) {
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

    toTreeDataNode(options?: { checkableKeys?: string[] }): TreeDataNode {
        return {
            key: this.key,
            title: this.name,
            disableCheckbox: !!options?.checkableKeys && !options.checkableKeys.includes(this.key),
            children: this.children.length > 0 ? this.children.map(n => n.toTreeDataNode(options)) : undefined
        }
    }

    filter(fn: (n: LinkedAssetNode) => boolean): LinkedAssetNode[] {
        if (!this.modelId) { //本节点为分组根节点
            const filtered = this.children.flatMap(c => {
                return c.filter(fn)
            })
            const node = this.shallowClone()
            node.children = filtered
            return [node]
        } else {
            const shouldKeep = fn(this)
            if (shouldKeep) {
                const node = this.shallowClone()
                node.children = []
                return [
                    node, ...this.children.flatMap(c => c.filter(fn))
                ]
            } else {
                return this.children.flatMap(c => c.filter(fn))
            }
        }
    }
}

export class AssetTree {
    constructor(arr: TAsset[]) {
        const groupByModelId: Record<string, LinkedAssetNode[] | undefined> = {}
        const groupByParentKey: Record<string, LinkedAssetNode[] | undefined> = {}
        const nodeByKey: Record<string, LinkedAssetNode | undefined> = {}
        arr.forEach(asset => {
            const node = new LinkedAssetNode(asset.key, asset.name, asset.modelId, asset.model, asset.parentKey)

            nodeByKey[node.key] = node

            const modelIdGroup = groupByModelId[node.modelId ?? '']
            if (modelIdGroup) {
                const index = modelIdGroup.push(node) - 1
                node.indexInModelIdGroup = index
            } else {
                groupByModelId[node.modelId ?? ''] = [node]
                node.indexInModelIdGroup = 0
            }

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

        this.modelIdMap = groupByModelId
        this.root = groupByParentKey[''] ?? []
        this.keyMap = nodeByKey
    }

    modelIdMap: Record<string, LinkedAssetNode[] | undefined>
    keyMap: Record<string, LinkedAssetNode | undefined>
    root: LinkedAssetNode[]

    fillter(fn: (n: LinkedAssetNode) => boolean) {
        return this.root.flatMap(n => n.filter(fn))
    }

    toSelectDataNode(options?: {
        checkableKeys?: string[],
        filterFn?: (n: LinkedAssetNode) => boolean
    }): SelectDataNode[] {
        return (options?.filterFn ? this.fillter(options.filterFn) : this.root)
            .map(n => n.toSelectDataNode(options))
    }

    toTreeDataNode(options?: {
        checkableKeys?: string[],
        filterFn?: (n: LinkedAssetNode) => boolean
    }): TreeDataNode[] {
        return (options?.filterFn ? this.fillter(options.filterFn) : this.root)
            .map(n => n.toTreeDataNode(options))
    }

}