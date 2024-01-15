import Intl from '@/common/lang';
import { DownOutlined } from '@ant-design/icons';
import { FontIcon, IconType } from 'Icon';
import { Input, TreeSelect } from 'antd';
import _ from 'lodash';
import { DataNode } from 'rc-tree-select/lib/interface';
import React, { useEffect, useMemo, useState } from 'react';
export const isZh = Intl.isZh;

import { POINT_TABLE } from '@/common/constants/point';
import { combinePointKey } from '@/common/utils/model';
import styles from './Selector.module.scss';
import { i18n } from './utils';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export type Option = TPoint & {
    /* 选中后不在列表中展示 */
    hideInList?: boolean
}

type DataNodeCfg = {
    disabled?: boolean
    disableCheckbox?: boolean
    checkable?: boolean
}

const pointToDataNode = (p: TPoint, cfg?: DataNodeCfg): DataNode => {
    return {
        title: isZh ? p.nameCn : p.nameEn,
        key: combinePointKey(p),
        value: combinePointKey(p),
        ...cfg,
    }
}

const toTreeData = (originPoints: TPoint[], groupMode: NonNullable<SelectorProps['groupMode']>, opt?: {
    searchValue?: string,
    selected?: string[],
    limit?: number
}): {
    points: TPoint[]
    visibleSelected: string[]
    hiddenSelected: string[]
    data: DataNode[]
} => {
    const visibleSelected: string[] = []
    const hiddenSelected: string[] = []
    let points: TPoint[] = []
    originPoints.forEach(p => {
        const title = (isZh ? p.nameCn : p.nameEn) ?? p.name ?? ''
        const visible = !opt?.searchValue || title.indexOf(opt?.searchValue) >= 0

        const addPoint = (p: TPoint) => {
            visible && points.push(p)
            if (opt?.selected?.includes(combinePointKey(p))) {
                if (visible) {
                    visibleSelected.push(combinePointKey(p))
                } else {
                    hiddenSelected.push(combinePointKey(p))
                }
            }
        }

        if (p.ifStandard) {
            addPoint(p)
        } else {
            const typeArr = p.type?.split(',') ?? ['']
            typeArr.forEach(t => {
                const splitPoint = {
                    ...p,
                    type: t
                }
                addPoint(splitPoint)
            })
        }
    })

    const shouldLimit = !!(opt?.limit && opt.limit > 0 && opt.selected && opt.selected.length >= opt.limit)

    const getPointNodeProps = (p: TPoint) => {
        const isSelected = !!(combinePointKey(p) && opt?.selected?.includes(combinePointKey(p)))
        const disableCheckbox = shouldLimit && !isSelected
        return { isSelected, disableCheckbox }
    }

    if (groupMode === 'standardType') {
        const standardGroup: DataNode = {
            title: i18n('standard'),
            key: 'standard',
            selectable: false,
            value: 'standard',
            children: [],
            disableCheckbox: shouldLimit
        }
        const nonStandardGroup: DataNode = {
            title: i18n('nonStandard'),
            key: 'nonStandard',
            selectable: false,
            value: 'nonStandard',
            children: [],
            disableCheckbox: shouldLimit
        }

        const groupByStandard = _.groupBy(points, (p) => p.ifStandard ? 'standard' : 'nonStandard');
        (groupByStandard['standard'] ?? []).forEach(p => {
            const { isSelected, disableCheckbox } = getPointNodeProps(p)
            isSelected && (standardGroup.disableCheckbox = false)
            standardGroup.children?.push(pointToDataNode(p, { disableCheckbox }))
        })
        const groupByModel = _.groupBy((groupByStandard['nonStandard'] ?? []), (p) => p.type ?? '')

        Object.entries(groupByModel).forEach(([model, points]) => {
            const newChildren: DataNode[] = []
            let hasSelected = false
            points.forEach(p => {
                const { isSelected, disableCheckbox } = getPointNodeProps(p)
                hasSelected = hasSelected || isSelected
                newChildren.push(pointToDataNode(p, { disableCheckbox }))
            })

            if (hasSelected) {
                nonStandardGroup.disableCheckbox = false
            }

            if (!model) {
                nonStandardGroup.children!.push(...newChildren)
            } else {
                nonStandardGroup.children!.unshift({
                    title: model,
                    key: model,
                    selectable: false,
                    value: model,
                    disableCheckbox: shouldLimit && !hasSelected,
                    children: newChildren
                })
            }
        })

        return {
            hiddenSelected, visibleSelected, points,
            data: [standardGroup, nonStandardGroup]
        }
    } else {
        const ycGroup: DataNode = {
            title: i18n('yc'),
            key: 'YC',
            selectable: false,
            value: 'YC',
            children: [],
            disableCheckbox: shouldLimit
        }
        const yxGroup: DataNode = {
            title: i18n('yx'),
            key: 'YX',
            selectable: false,
            value: 'YX',
            children: [],
            disableCheckbox: shouldLimit
        }
        const dlGroup: DataNode = {
            title: i18n('dl'),
            key: 'DL',
            selectable: false,
            value: 'DL',
            children: [],
            disableCheckbox: shouldLimit
        }
        const otherGroup: DataNode = {
            title: i18n('other'),
            key: 'OTHER',
            value: 'OTHER',
            selectable: false,
            children: [],
            disableCheckbox: shouldLimit
        }

        const resArr: DataNode[] = [];

        points.forEach(p => {
            const { isSelected, disableCheckbox } = getPointNodeProps(p)

            switch (String(p.tableNo)) {
                case String(POINT_TABLE.YC): {
                    ycGroup.children!.push(pointToDataNode(p, { disableCheckbox }))
                    isSelected && (ycGroup.disableCheckbox = false)
                    break
                }
                case String(POINT_TABLE.YX): {
                    yxGroup.children!.push(pointToDataNode(p, { disableCheckbox }))
                    isSelected && (yxGroup.disableCheckbox = false)
                    break
                }
                case String(POINT_TABLE.PROD): {
                    dlGroup.children!.push(pointToDataNode(p, { disableCheckbox }))
                    isSelected && (dlGroup.disableCheckbox = false)
                    break;
                }
                default: {
                    otherGroup.children!.push(pointToDataNode(p, { disableCheckbox }))
                    isSelected && (otherGroup.disableCheckbox = false)
                }
            }
        })
        if (ycGroup.children!.length > 0) {
            resArr.push(ycGroup);
        }
        if (yxGroup.children!.length > 0) {
            resArr.push(yxGroup);
        }
        if (dlGroup.children!.length > 0) {
            resArr.push(dlGroup);
        }
        if (otherGroup.children!.length > 0) {
            resArr.push(otherGroup)
        }

        return {
            hiddenSelected, visibleSelected, points,
            data: resArr
        }
    }
}

export interface SelectorProps {
    /* 名称标签 */
    name?: string
    /* 候选测点 */
    candidates: Option[]
    /* 默认选中的key */
    defaultSelectedKeys?: string[]
    /* 选中的key（受控） */
    selectedKeys?: string[]
    onChange?: (items: Option[]) => void
    /* 是否多选 */
    multiple?: boolean
    /* 可选数量限制 */
    limit?: number
    /* 
     * 分组展示的方式 
     * pointType 测点类型
     * standardType 是否为标准点
     */
    groupMode?: 'pointType' | 'standardType'
    size?: SizeType
}

const Selector = ({
    name,
    candidates = [],
    defaultSelectedKeys = [],
    selectedKeys,
    onChange,
    multiple = true,
    limit = -1,
    groupMode = 'pointType',
    size
}: SelectorProps) => {
    const [selected, setSelected] = useState(defaultSelectedKeys)
    const [searchValue, setSearchValue] = useState<string | undefined>()
    const { hiddenSelected, visibleSelected, data, points: actualPoints } = useMemo(() => toTreeData(candidates, groupMode, {
        searchValue, selected, limit: multiple ? limit : undefined
    }), [candidates, searchValue, selected, limit, multiple])

    useEffect(() => {
        if (selectedKeys) {
            setSelected(selectedKeys)
        }
    }, [selectedKeys])

    const handleSelectedChange = (keys: string | string[]) => {
        let auctalKeys: string[]
        if (!Array.isArray(keys)) {
            auctalKeys = [keys]
        } else if (limit >= 0 && keys.length > limit) {
            auctalKeys = keys.slice(0, limit)
        } else {
            auctalKeys = keys
        }

        setSelected(auctalKeys)
        const selectedOptions: Option[] = []
        auctalKeys.forEach(k => {
            const o = candidates.find(o => combinePointKey(o) === k)
            o && selectedOptions.push(o)
        })
        onChange && onChange(selectedOptions)
    }

    const dropDownRender = (originNode: React.ReactNode) => <div className={styles.search__container}>
        <Input
            autoFocus
            className={styles.search__input}
            prefix={<FontIcon type={IconType.SEARCH} />}
            placeholder={isZh ? "搜索" : "Search"}
            onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className={styles.content}>
            {originNode}
        </div>
    </div>

    return <div className={styles.select__container} onKeyDownCapture={(e) => {
        // 组织树组件内部的监听，rc-tree 监听了backspace触发已选项删除
        e.stopPropagation()
    }}>
        {name && <div className={styles.select__name}>{name}</div>}
        <TreeSelect
            allowClear={true}
            showArrow={true}
            className={styles.selector}
            size={size ?? 'middle'}
            showSearch={false}
            treeData={data}
            dropdownMatchSelectWidth={false}
            value={multiple ? visibleSelected : visibleSelected[0]}
            treeCheckable={multiple}
            multiple={multiple}
            onChange={(ks) => {
                if (!ks) {
                    handleSelectedChange(hiddenSelected)
                } else {
                    handleSelectedChange((Array.isArray(ks) ? ks : [ks]).concat(...hiddenSelected))
                }
            }}
            treeNodeFilterProp={'title'}
            dropdownRender={dropDownRender}
        />
    </div>
}

export default Selector