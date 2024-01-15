import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import { confirm } from 'Modal'
import { notify } from 'Notify'
import { ComponentContext } from 'ParamsGenerator/utils'
import { Button, Select, Tooltip } from 'antd'
import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import empty from '../../../common/image/empty.svg'
import { templateService } from '../services'
import { Template, TemplateType } from '../types'
import styles from './index.module.scss'

export type TemplateSelectorProps = {
    type: TemplateType
    currentTplKey?: string
    onSelect: (tpl?: Template) => void
    onEdit: (tpl: Template) => void
    onCreate: () => void
    titleRender?: () => ReactNode
    addBtnText?: string // 新建模板按钮文字
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    currentTplKey, type, onSelect, titleRender, onEdit, onCreate,
    addBtnText,
}) => {
    const { locale } = useContext(ComponentContext)
    const { templateSelector: i18n, common: commonI18n } = locale
    const [open, setOpen] = useState(false)
    const { tplList: list, updateTplList: refreshTemplate } = useContext(ComponentContext)
    const keyMap = useMemo(() => list.reduce((p, c) => ({ ...p, [c.key]: c }), {} as Record<string, Template | undefined>), [list])

    return <div className={styles.container}>
        <div className={styles.title}>
            {titleRender ?
                titleRender() :
                <>
                    <FontIcon className={styles.icon} type={iconsMap.TEMPLATE} />
                    {i18n.title}
                </>
            }
        </div>
        <Select className={styles.select} placeholder={commonI18n.selectPlaceholder} bordered={false}
            open={open} value={currentTplKey}
            dropdownMatchSelectWidth={200}
            onDropdownVisibleChange={(o) => setOpen(o)}
            dropdownClassName={styles.select__dropdown}
            notFoundContent={<div className={styles.empty}>
                <img src={empty} width={68} height={68} />
                <div>
                    {i18n.noTpl}
                </div>
            </div>}
            dropdownRender={(menu) => {
                return <>
                    {menu}
                    <div className={styles.add}>
                        <Button type='text' onClick={() => {
                            onCreate()
                        }}>
                            <FontIcon type={iconsMap.PLUS} />
                            {addBtnText ?? i18n.defaultAdd}
                        </Button>
                    </div>
                </>
            }}
            onChange={(k) => {
                const tpl = keyMap[k]
                if (tpl) {
                    onSelect(tpl)
                }
            }}
        >
            {list.map(tpl => {
                return <Select.Option key={tpl.key} value={tpl.key} label={tpl.name}>
                    <div className={styles.option}>
                        <div className={styles.tplName} title={tpl.name}>
                            {tpl.name}
                        </div>
                        <div className={styles.operation}>
                            <Tooltip title={i18n.edit}>
                                <FontIcon type={iconsMap.EDITOR} onClick={e => {
                                    e.stopPropagation()
                                    onEdit(tpl)
                                }} />
                            </Tooltip>
                            <Tooltip title={i18n.delete}>
                                <FontIcon type={iconsMap.DELETE} onClick={e => {
                                    e.stopPropagation()
                                    setOpen(false)
                                    confirm({
                                        title: i18n.deleteTitle,
                                        content: <span style={{
                                            whiteSpace: 'break-spaces'
                                        }}>
                                            {i18n.deleteContent(tpl.name)}
                                        </span>,
                                        onOk: () => {
                                            templateService.delete(tpl.key, type)
                                                .then((isSuc) => {
                                                    if (isSuc) {
                                                        notify(commonI18n.removeSuc)
                                                        currentTplKey === tpl.key && onSelect()
                                                    } else {
                                                        notify(commonI18n.removeFail)
                                                    }
                                                    refreshTemplate()
                                                })
                                        },
                                    })
                                }} />
                            </Tooltip>
                        </div>
                    </div>
                </Select.Option>
            })}
        </Select>
    </div>
}

export default TemplateSelector