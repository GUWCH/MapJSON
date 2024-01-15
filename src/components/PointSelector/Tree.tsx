import { POINT_TABLE } from "@/common/constants"
import React, { ReactNode, useMemo } from "react"
import styles from './Tree.module.scss'
import _ from "lodash"
import { msgTag } from "@/common/lang"
import { Checkbox, Collapse } from "antd"
import { FontIcon } from "Icon"
import iconsMap from "Icon/iconsMap"
import { isZh } from "@/common/util-scada"
import { combinePointKey } from "@/common/utils/model"
const commonI18n = msgTag('common')

const convertTableNoToName = (no: number) => {
    switch (no) {
        case POINT_TABLE.YX: return commonI18n('yx')
        case POINT_TABLE.YC: return commonI18n('yc')
        case POINT_TABLE.PROD: return commonI18n('dl')
        default: return commonI18n('other')
    }
}

export type PointTreeProps = {
    candidates: TPoint[]
    selectedKeys?: string[]
    onChange: (ps: TPoint[]) => void
    customCls?: {
        container?: string
    }
}

export const PointTree = ({
    candidates, selectedKeys, customCls, onChange
}: PointTreeProps) => {
    const { groups, mark } = useMemo(() => ({
        groups: _.groupBy(candidates, 'tableNo'),
        mark: Date.now() // 测点重复会导致渲染异常，使用该标识避免
    }), [candidates])

    return <div className={`${styles.container} ${customCls?.container ?? ''}`}>
        {Object.entries(groups).map(([k, arr]) => {
            let hasCheckedItem = false
            let hasUnCheckedItem = false

            const gridItems: ReactNode[] = []
            arr.forEach(p => {
                const pName = isZh ? p.nameCn : p.nameEn
                const checked = !!selectedKeys?.includes(combinePointKey(p))
                hasCheckedItem = hasCheckedItem || checked
                hasUnCheckedItem = hasUnCheckedItem || !checked
                const itemKey = combinePointKey(p)

                gridItems.push(<div key={itemKey} className={styles.grid_item}>
                    <Checkbox className={styles.checkbox} checked={checked}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                            const checked = e.target.checked
                            onChange(candidates.filter(c => {
                                const pKey = combinePointKey(c)
                                if (checked) {
                                    return pKey === itemKey || selectedKeys?.includes(pKey)
                                } else {
                                    return pKey !== itemKey && selectedKeys?.includes(pKey)
                                }
                            }))
                        }} />
                    <span title={pName}>{pName}</span>
                </div>)
            })

            return <Collapse key={mark} defaultActiveKey={mark} className={styles.group} ghost expandIcon={info => {
                return info.isActive ? <FontIcon type={iconsMap.CARET_DOWN} /> : <FontIcon type={iconsMap.CARET_RIGHT} />
            }}>
                <Collapse.Panel key={mark} header={<span>
                    <Checkbox className={styles.checkbox}
                        checked={hasCheckedItem && !hasUnCheckedItem}
                        indeterminate={hasCheckedItem && hasUnCheckedItem}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                            const checked = e.target.checked
                            onChange(candidates.filter(c => {
                                const pKey = combinePointKey(c)
                                if (checked) {
                                    return arr.find(p => combinePointKey(p) === pKey) || selectedKeys?.includes(pKey)
                                } else {
                                    return !arr.find(p => combinePointKey(p) === pKey) && selectedKeys?.includes(pKey)
                                }
                            }))
                        }}
                    />
                    {convertTableNoToName(parseInt(k))}
                </span>}>
                    <div className={styles.grid}>
                        {gridItems}
                    </div>
                </Collapse.Panel>
            </Collapse >
        })}
    </div>
}