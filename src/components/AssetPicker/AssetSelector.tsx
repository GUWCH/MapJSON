import { msgTag } from "@/common/lang"
import { FontIcon, IconType } from "Icon"
import iconsMap from "Icon/iconsMap"
import { Tabs, Input, TreeSelect } from "antd"
import _ from "lodash"
import React, { useState, useEffect, useMemo, useRef } from "react"
import { AssetTree } from "./tree"
import { TAsset, AssetGroup } from "./type"
import { useAssetGroup } from "./utils"
import styles from './AssetSelector.module.scss'
import { isZh } from "@/common/util-scada"

const i18n = msgTag('assetPicker')

type ValueType = { value: string, label: string, halfChecked?: boolean }
const valueTypeToAsset = (values: ValueType | ValueType[], keyMap: AssetTree['keyMap'], opt?: {
    limit?: number
    modelIds?: string[]
}) => {
    const { limit = -1, modelIds } = opt ?? {}
    let actualValues: ValueType[]
    if (!Array.isArray(values)) {
        actualValues = [values]
    } else if (limit >= 0 && values.length > limit) {
        actualValues = values.slice(0, limit)
    } else {
        actualValues = values
    }

    const selectedValues: ValueType[] = []
    const selectedOptions: TAsset[] = []
    actualValues.forEach(v => {
        const node = keyMap[v.value]
        if (node && ((modelIds?.length ?? 0) > 1 || modelIds?.includes(node.modelId ?? ''))) {
            selectedOptions.push(node)
            selectedValues.push(v)
        }
    })

    return {
        selectedValues, selectedOptions
    }
}

export type AssetSelectorProps = {
    /*  */
    modelIds?: string[]
    /* 打开左右快捷切换 */
    quickSwitch?: boolean
    /* 默认选中的key */
    defaultSelectedKeys?: string[]
    /* 选中的key（受控） */
    selectedKeys?: string[]
    onChange?: (items: TAsset[]) => void
    /* 是否多选 */
    multiple?: boolean
    /* 可选数量限制 */
    limit?: number
    // enabledGroups?: AssetGroup[]
    // /* 根据当前节点过滤 */
    // filterByNode?: boolean
    loading?: boolean
    assetGroups?: { [key in AssetGroup]?: AssetTree | undefined }
}

const AssetSelector = ({
    modelIds,
    quickSwitch,
    selectedKeys,
    onChange,
    multiple = true,
    limit = -1,
    loading,
    assetGroups
}: AssetSelectorProps) => {
    const groupKeys = Object.entries(assetGroups ?? {}).map(([k, v]) => k as AssetGroup)

    const [currentGroupKey, setCurrentGroupKey] = useState<AssetGroup>(groupKeys[0])
    useEffect(() => {
        setCurrentGroupKey(groupKeys[0])
    }, [assetGroups])

    const assetTree = currentGroupKey && assetGroups?.[currentGroupKey]

    const [selected, setSelected] = useState<ValueType[]>([])
    const [searchValue, setSearchValue] = useState<string | undefined>()
    const options = useMemo(() => {
        const shouldLimit = multiple && limit >= 0 && selected.length >= limit
        const nodes = assetTree?.toSelectDataNode({
            checkableKeys: shouldLimit ? selected.map(i => i.value) : undefined,
            filterFn: searchValue ? (n) => n.name.includes(searchValue) : undefined
        }) ?? []
        return nodes
    }, [selected, assetTree, searchValue, multiple, limit])

    useEffect(() => {
        if (selectedKeys && !loading) {
            const newSelected = selectedKeys.map(k => {
                const assetNode = assetTree?.keyMap[k]
                if (assetNode) {
                    return {
                        value: assetNode.key,
                        label: assetNode.name
                    }
                }
            }).filter(a => a) as typeof selected
            setSelected(newSelected)
            if (newSelected.length !== selectedKeys.length) {
                const { selectedOptions } = valueTypeToAsset(newSelected, assetTree?.keyMap ?? {}, { limit, modelIds })
                onChange && onChange(selectedOptions)
            }
        }
    }, [selectedKeys, assetTree, limit, loading])

    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (multiple && containerRef.current) {
            const antdSearch = containerRef.current.getElementsByClassName('ant-select-selector');
            if (antdSearch.length === 0) {
                return
            }
            let text = ''
            if (selected.length !== 0) {
                text = selected.length > 1 ?
                    `${selected.length}${limit > -1 ? `/${limit || '-'}` : i18n('selected')}` :
                    selected[0]?.label ?? ''
            }
            antdSearch[0].setAttribute('data-before', text)
            antdSearch[0].setAttribute('title', text)
        }
    }, [limit, multiple, selected])

    const move = (toPre?: boolean) => {
        if (!assetTree) return

        const { keyMap, modelIdMap } = assetTree
        const currentKey = selected[0].value
        const currentNode = keyMap[currentKey]
        const currentInx = currentNode?.indexInModelIdGroup
        const flatArr = modelIdMap[currentNode?.modelId ?? '']
        const step = toPre ? -1 : 1

        if (currentInx === null || currentInx === undefined || !flatArr) {
            return
        }

        const nextInx = currentInx + step
        const nextAsset: TAsset | undefined = flatArr[nextInx]
        nextAsset && onChange && onChange([nextAsset])
    }

    const handleSearchChange = _.debounce((v: string) => {
        setSearchValue(v)
    }, 500)

    const dropDownRender = (originNode: React.ReactNode) => <div className={styles.search__container}>
        {groupKeys.length > 1 && <Tabs onChange={t => {
            setCurrentGroupKey(t as AssetGroup)
        }}>
            {groupKeys.map(k => <Tabs.TabPane tab={i18n('group.' + k.toLocaleLowerCase())} key={k} />)}
        </Tabs>}
        <Input
            autoFocus
            className={styles.search__input}
            prefix={<FontIcon type={IconType.SEARCH} />}
            placeholder={isZh ? "搜索" : "Search"}
            onChange={(e) => { handleSearchChange(e.target.value) }}
        />
        <div className={styles.content}>
            {originNode}
        </div>
    </div>

    const switchConfig = (() => {
        const showSwitch = quickSwitch && selected.length === 1
        if (!showSwitch || !assetTree) {
            return
        }
        const { keyMap, modelIdMap } = assetTree

        const currentNode = keyMap[selected[0].value]
        const currentFlatArr = modelIdMap[currentNode?.modelId ?? '']

        if (!currentFlatArr || !currentNode || currentNode.indexInModelIdGroup === null) {
            return
        }

        return {
            hasNext: currentNode.indexInModelIdGroup < currentFlatArr.length - 1,
            hasPre: currentNode.indexInModelIdGroup > 0
        }
    })()

    return <div className={styles.select__container} ref={containerRef} onKeyDownCapture={(e) => {
        // 组织树组件内部的监听，rc-tree 监听了backspace触发已选项删除
        e.stopPropagation()
    }}>
        {switchConfig && <FontIcon className={`${styles.switchBtn} ${switchConfig.hasPre ? '' : styles.disable}`}
            type={iconsMap.DIRECT_LEFT} onClick={() => switchConfig.hasPre && move(true)} />}
        <TreeSelect
            showArrow
            placeholder={i18n('placeholder')}
            allowClear={true}
            className={styles.selector}
            size={'middle'}
            showSearch={false}
            treeData={options}
            treeCheckStrictly={(modelIds?.length ?? 0) > 1}
            labelInValue
            dropdownMatchSelectWidth={false}
            value={multiple ? selected : selected[0]}
            treeCheckable={multiple}
            multiple={multiple}
            onChange={(values: ValueType | ValueType[], _, extra) => {
                const { selectedValues, selectedOptions } = valueTypeToAsset(values, assetTree?.keyMap ?? {}, { limit, modelIds })
                setSelected(selectedValues)
                onChange && onChange(selectedOptions)
            }}
            treeNodeFilterProp={'title'}
            dropdownRender={dropDownRender}
        />
        {switchConfig && <FontIcon className={`${styles.switchBtn} ${switchConfig.hasNext ? '' : styles.disable}`}
            type={iconsMap.DIRECT_RIGHT} onClick={() => switchConfig.hasNext && move(false)} />}
    </div>
}

export const AssetSelectorWithReq = ({
    enabledGroups, filterByNode, deviceModel, ...rest
}: Omit<AssetSelectorProps, 'loading' | 'assetGroups'> & {
    deviceModel?: string
    enabledGroups?: AssetGroup[]
    /* 根据当前节点过滤 */
    filterByNode?: boolean
}) => {
    const { assetGroups, loadingAssets } = useAssetGroup({
        modelIds: rest.modelIds, deviceModel,
        enabledGroups, filterByNode
    })
    return <AssetSelector {...rest} loading={loadingAssets} assetGroups={assetGroups} />
}