import { Input, Tree, TreeProps } from "antd"
import React, { useState, useMemo, useEffect } from "react"
import { AssetTree, LinkedAssetNode } from "./tree"
import { TAsset } from "./type"
import { SearchOutlined } from '@ant-design/icons';
import { useAssetGroup } from "./utils";
import styles from './AssetTree.module.scss'
import Empty from "Empty";

export type AssetTreeSelectorProps = {
    multiple?: boolean
    limit?: number
    loading?: boolean
    assetTree?: AssetTree
    /* 选中的key（受控） */
    selectedKeys?: string[]
    onChange?: (items: TAsset[]) => void
    customCls?: {
        container?: string
        search?: string
        tree?: string
    }
}
export const AssetTreeSelector = ({
    multiple, limit = -1, selectedKeys, loading, assetTree, customCls, onChange
}: AssetTreeSelectorProps) => {
    const [searchValue, setSearchValue] = useState<string | undefined>()
    const { options, hiddenSelectedNodes } = useMemo(() => {
        if (!assetTree) return { options: [], hiddenSelectedNodes: [] }

        const selected = (selectedKeys ?? []).map(k => assetTree.keyMap[k]).filter(a => a) as LinkedAssetNode[]

        const shouldLimit = multiple && limit >= 0 && selected.length >= limit
        const nodes = assetTree?.toTreeDataNode({
            checkableKeys: shouldLimit ? selected.map(n => n.key) : undefined,
            filterFn: searchValue ? (n) => n.name.includes(searchValue) : undefined
        }) ?? []
        const hiddenSelectedNodes = searchValue && selectedKeys ?
            selected.filter((n) => !n.name.includes(searchValue) && selectedKeys.includes(n.key)) : []
        return {
            options: nodes, hiddenSelectedNodes
        }
    }, [selectedKeys, assetTree, searchValue, multiple, limit])

    const handleChange = (selected: LinkedAssetNode[]) => {
        onChange && onChange(selected.concat(...hiddenSelectedNodes).map(n => n.toAsset()))
    }

    useEffect(() => {
        if (selectedKeys && !loading && assetTree) {
            const newSelected = selectedKeys.map(k => {
                const assetNode = assetTree.keyMap[k]
                return assetNode
            }).filter(a => a) as LinkedAssetNode[]
            if (newSelected.length !== selectedKeys.length) {
                handleChange(newSelected)
            }
        }
    }, [selectedKeys, assetTree, limit, loading])

    return <div className={`${styles.container} ${customCls?.container ?? ''}`}>
        {options.length > 0 ? <>
            <div className={`${styles.search} ${customCls?.search ?? ''}`}>
                <Input value={searchValue} onChange={v => setSearchValue(v.target.value)} prefix={<SearchOutlined />} />
            </div>
            <Tree className={`${styles.tree} ${customCls?.tree ?? ''}`}
                multiple={multiple} checkable={multiple} selectable={!multiple}
                treeData={options} checkedKeys={multiple ? selectedKeys : []} selectedKeys={!multiple ? selectedKeys : []}
                onSelect={(keys, info) => {
                    const keyMap = assetTree?.keyMap ?? {}
                    let selectedAssets = info.selectedNodes.map(n => keyMap[n.key]).filter(a => a && a.modelId) as LinkedAssetNode[]
                    if (limit > 0) {
                        selectedAssets = selectedAssets.slice(0, limit)
                    }
                    handleChange(selectedAssets)
                }}
                onCheck={(keys, info) => {
                    const keyMap = assetTree?.keyMap ?? {}
                    let selectedAssets = info.checkedNodes.map(n => keyMap[n.key]).filter(a => a && a.modelId) as LinkedAssetNode[]
                    if (limit > 0) {
                        selectedAssets = selectedAssets.slice(0, limit)
                    }
                    handleChange(selectedAssets)
                }} />
        </> : <Empty />}
    </div>
}
export const AssetTreeSelectorWithReq = ({
    modelId, filterByNode, deviceModel, ...rest
}: Omit<AssetTreeSelectorProps, 'loading' | 'assetTree'> & {
    modelId?: string
    deviceModel?: string
    /* 根据当前节点过滤 */
    filterByNode?: boolean
}) => {
    const { assetGroups, loadingAssets } = useAssetGroup({
        modelIds: modelId,
        deviceModel: deviceModel,
        enabledGroups: ['FAC'], filterByNode
    })
    return <AssetTreeSelector {...rest} loading={loadingAssets} assetTree={assetGroups?.FAC} />
}