import React, { MouseEventHandler } from 'react'
import { DragDropContext, Droppable, Draggable, DragDropContextProps, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import styles from './List.module.scss'
import { i18n } from './utils';
import { Collapse } from 'antd';
const { Panel } = Collapse;
import { FontIcon, IconType } from 'Icon';
import DropDown, { DropDownComponentType, DropDownProps, Member } from 'DropDown';
import msg from '@/common/lang';
import { POINT_TABLE } from '@/common/constants/point';
import Selector from './Selector';
import { combinePointKey } from '@/common/utils/model';
const isZh = msg.isZh

export type ConfigKeys = keyof ConfigContentParams
export type ConfigContentParams = Partial<{
    showTitle: undefined
    /* 条件格式 */
    condition: undefined
    yxCondition: undefined
    /* 值转换 */
    convert: undefined
    /* 颜色映射 */
    colorSet: undefined
    /* 是否置顶 */
    isTop: undefined
    /* axis相关配置 */
    axis: undefined
    /* 是否为累计值 */
    isAccumulate: undefined
    /* 折线图配置 */
    lineChart: undefined
    /* 遥信值数据源测点 */
    yxValueDatasource: {
        candidates: TPoint[]
    }
    /* 遥信值icon */
    yxValueIcon: {
        withColor?: boolean
    }
    yxValueEnable?: undefined
}>

export type ListProps<T extends TPointWithCfg = TPointWithCfg> = {
    data: T[]

    /* 列表类型，该字段预留用于扩展渲染方式 */
    type?: 'config'
    configContentParams?: ConfigContentParams
    /* 开启指定配置功能 */
    enableConfigs?: ConfigKeys[]
    /* 是否只展示单个条目 */
    single?: boolean
    /* 是否可删除 */
    removeable?: boolean
    onChange: (item: T[]) => void
    /* 自定义渲染 */
    customRender?: (item: T) => React.ReactNode
}

export const configContent = (
    p: TPointWithCfg,
    onChange: (p: TPointConfiguration) => void,
    enableConfigs: ListProps['enableConfigs'] = [
        'showTitle',
        'condition',
        'convert',
        'colorSet',
        'isTop',
        'axis',
        'isAccumulate',
        'lineChart',
    ],
    configContentParams: ListProps['configContentParams']
) => {
    const contents: DropDownProps['content'] = [];

    enableConfigs.forEach(configKey => {
        if (configKey === 'showTitle') {
            contents.push({
                name: i18n('showName'),
                members: [{
                    component: DropDownComponentType.INPUT,
                    key: isZh ? 'showTitleCn' : 'showTitleEn'
                }]
            });
        }

        if ([String(POINT_TABLE.YC), String(POINT_TABLE.PROD)].includes(String(p.tableNo))) {
            if (configKey === 'condition') {
                contents.push({
                    members: [{
                        component: DropDownComponentType.CONDITION,
                        key: 'conditions',
                        type: 'ycCondition'
                    }]
                })
            }

            if (configKey === 'convert') {
                contents.push({
                    members: [{
                        component: DropDownComponentType.CONDITION,
                        type: 'convert',
                        key: 'convert'
                    }]
                })
            }

            if (configKey === 'axis') {
                contents.push({
                    members: [
                        {
                            component: DropDownComponentType.AXIS,
                            key: 'axis',
                        }
                    ]
                })
            }

            if (configKey === 'isAccumulate') {
                contents.push({
                    name: i18n('isAccumulate'),
                    members: [
                        {
                            component: DropDownComponentType.SELECT_NEW,
                            key: 'isAccumulate',
                            options: [{
                                value: true,
                                label: i18n('yes')
                                // name: i18n('yes')
                            }, {
                                value: false,
                                label: i18n('no'),
                                // name: i18n('no')
                            }]
                        }
                    ]
                })
            }

            if (configKey === 'lineChart') {
                contents.push({
                    name: i18n('lineChart'),
                    members: [
                        {
                            key: 'lineChartColor',
                            component: 'colorPick',
                        }
                    ]
                });
            }
        }

        if (configKey === 'isTop') {
            contents.push({
                name: i18n('isTop'),
                members: [
                    {
                        component: 'select',
                        key: 'isTop',
                        type: '',
                        options: [{
                            value: '1',
                            name: i18n('yes')
                        }, {
                            value: '0',
                            name: i18n('no')
                        }]
                    }
                ]
            })
        }
    })

    if (String(p.tableNo) === String(POINT_TABLE.YX)) {
        const getYXConfigContents = (c: YXConst): DropDownProps['content'] => {
            const yxConfigContents: DropDownProps['content'] = []
            enableConfigs.forEach(configKey => {
                if (configKey === 'colorSet') {
                    yxConfigContents.push({
                        name: i18n('colorSet'),
                        members: [{
                            key: 'color',
                            component: 'colorPick',
                        }]
                    })
                }
                if (configKey === 'yxValueIcon') {
                    const members: Member[] = []
                    members.push({
                        key: 'icon',
                        component: DropDownComponentType.ICON
                    })
                    configContentParams?.yxValueIcon?.withColor && members.push({
                        key: 'color',
                        component: DropDownComponentType.COLOR_PICK
                    })
                    yxConfigContents.push({
                        name: i18n('icon'),
                        members: members
                    })
                }
                if (configKey === 'yxValueDatasource') {
                    const oldcfg = p.conf?.valueMap?.[c.value]
                    yxConfigContents.push({
                        name: i18n('datasource'),
                        members: [{
                            key: 'datasource',
                            component: DropDownComponentType.CUSTOM,
                            customRender: <div key={c.value} className={styles.config_custom}>
                                <div className={styles.select}>
                                    <Selector size='small' multiple={false}
                                        selectedKeys={oldcfg?.dataSource ? [combinePointKey(oldcfg.dataSource)] : []}
                                        candidates={configContentParams?.yxValueDatasource?.candidates ?? []}
                                        onChange={(ps) => {
                                            const point = ps[0]
                                            const newMap = Object.assign({}, p.conf?.valueMap, {
                                                [c.value]: {
                                                    ...oldcfg, dataSource: point ? { ...point } : undefined
                                                }
                                            })
                                            onChange({ ...p.conf, valueMap: newMap })
                                        }} />
                                </div>
                            </div>
                        }]
                    })
                }
                if (configKey === 'yxValueEnable') {
                    yxConfigContents.push({
                        name: i18n('enable'),
                        members: [{
                            key: 'enable',
                            component: 'check'
                        }]
                    })
                }
            })
            return yxConfigContents
        }

        const constNames = (p.constNameList || []).map((item, i) => {
            const index = p.conf?.valueMap?.[item.value]?.orderIndex ?? i
            return {
                ...item,
                index
            }
        }).sort((a, b) => a.index - b.index)

        contents.push({
            members: [{
                key: '',
                component: DropDownComponentType.CUSTOM,
                // @ts-ignore react和ts版本不匹配导致误报错
                customRender: <DragDropContext onDragEnd={(result, prov) => {
                    if (result.destination) {
                        const value = parseInt(result.draggableId)
                        const from = result.source.index
                        const to = result.destination.index

                        const valueMap = JSON.parse(JSON.stringify(Object.assign({}, p.conf?.valueMap)))
                        const tempArr = constNames.map(item => item.value).filter((_, i) => i !== from)
                        const newArr = tempArr.slice(0, to).concat(value).concat(tempArr.slice(to))
                        newArr.forEach((v, i) => {
                            valueMap[v].orderIndex = i
                        })

                        onChange({ ...p.conf, valueMap: valueMap })
                    }
                }}>
                    {/* @ts-ignore react和ts版本不匹配导致误报错 */}
                    <Droppable droppableId="yxConst">
                        {(provided) => <div {...provided.droppableProps}
                            style={{ width: '100%' }}
                            ref={provided.innerRef}>

                            {constNames.map((c, i) => {
                                const cfg = p.conf?.valueMap?.[c.value]
                                const data = {
                                    color: cfg?.color?.[0],
                                    isTop: cfg?.isTop,
                                    icon: cfg?.icon,
                                    enable: cfg?.enable,
                                    dataSource: cfg?.dataSource
                                }
                                {/* @ts-ignore react和ts版本不匹配导致误报错 */ }
                                return <Draggable
                                    key={c.value}
                                    draggableId={String(c.value)}
                                    index={i}
                                >
                                    {(provided) => <div
                                        key={c.value}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <Collapse style={{ width: '100%' }}>
                                            <Panel style={{ marginBottom: '0.5em' }} key={combinePointKey(p) + c.value}
                                                header={<div className={styles.item__container}>
                                                    <span className={styles.item__title}>
                                                        <EllipsisToolTip>{isZh ? c.name : c.name_en}</EllipsisToolTip>
                                                    </span>
                                                </div>}
                                                extra={<FontIcon {...provided.dragHandleProps} className={styles.icon} type={IconType.DRAG} />}
                                            >

                                                <DropDown
                                                    data={data}
                                                    content={getYXConfigContents(c)}
                                                    onChange={({ color, isTop, icon, enable, dataSource }) => {
                                                        const cfg: ValueConfig = {
                                                            color: [color],
                                                            isTop: isTop,
                                                            icon: icon,
                                                            enable: enable,
                                                            dataSource
                                                        }
                                                        const oldCfg = p.conf?.valueMap?.[c.value]
                                                        const newMap = Object.assign({}, p.conf?.valueMap, { [c.value]: { ...oldCfg, ...cfg } })
                                                        onChange({ ...p.conf, valueMap: newMap })
                                                    }}
                                                />
                                            </Panel>
                                        </Collapse>
                                    </div>
                                    }
                                </Draggable>
                            })}

                            {provided.placeholder}
                        </div>}
                    </Droppable>
                </DragDropContext>
            }]
        });
    }

    return <DropDown
        key={combinePointKey(p)}
        data={p.conf || {}}
        content={contents}
        onChange={(args) => {
            const newCfg = Object.assign({}, p.conf, args)
            onChange(newCfg)
        }}
    />
}


const List = <T extends TPointWithCfg & { key?: string }>({
    data = [], type = 'config', removeable, enableConfigs, configContentParams, single, customRender, onChange
}: ListProps<T>) => {

    const getContent = (p: T) => {
        if (type === 'config') {
            return configContent(p, (newCfg) => {
                const newData = Array.from(data, (v) => {
                    const vKey = v.key ?? combinePointKey(v)
                    const pKey = p.key ?? combinePointKey(p)
                    if (vKey === pKey) {
                        return Object.assign({}, p, { conf: newCfg })
                    }
                    return v
                })
                onChange(newData)
            }, enableConfigs, configContentParams)
        } else if (customRender) {
            return customRender(p)
        }
    }

    const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
        if (!result.destination) {
            return;
        }
        const newData = Array.from(data);
        const [removed] = newData.splice(result.source.index, 1);
        newData.splice(result.destination.index, 0, removed);
        onChange(newData)
    }


    const singleContent = <div className={styles.list__container}>
        <div className={styles.list__item}>
            <div>
                {data[0] && getContent(data[0])}
            </div>
        </div>
    </div>
    // @ts-ignore react和ts版本不匹配导致误报错
    const multipleContent = <DragDropContext onDragEnd={onDragEnd}>
        {/* @ts-ignore react和ts版本不匹配导致误报错 */}
        <Droppable droppableId="droppable">
            {(provided) => (
                <div
                    className={styles.list__container}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    {data.map((item, index) => {
                        const pointKey = combinePointKey(item)
                        // @ts-ignore react和ts版本不匹配导致误报错
                        return <Draggable
                            key={pointKey}
                            draggableId={pointKey}
                            index={index}
                        >
                            {(provided) => (
                                <div
                                    key={pointKey}
                                    className={styles.list__item}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                >
                                    <ListItem item={item} content={getContent(item)} options={{
                                        key: pointKey, removeable, draggableHandleProps: provided.dragHandleProps,
                                        onRemove: (e) => {
                                            e.stopPropagation();
                                            const newArr = data.filter(d => combinePointKey(d) !== combinePointKey(item))
                                            onChange && onChange(newArr)
                                        }
                                    }} />
                                </div>
                            )}
                        </Draggable>
                    })}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </DragDropContext>

    const content = single ? singleContent : multipleContent

    return content
}

const ListItem = ({ item, content, options }: {
    item: TPointWithCfg, content: React.ReactNode, options: {
        draggableHandleProps?: DraggableProvidedDragHandleProps
        key?: string,
        removeable?: boolean,
        hideHeader?: boolean,
        onRemove?: MouseEventHandler,
    }
}) => {
    return <Collapse key={options.key ?? combinePointKey(item)}>
        <Panel key={options.key ?? combinePointKey(item)} header={options.hideHeader ? undefined :
            <div className={styles.item__container}>
                <div className={styles.item__title}>
                    <EllipsisToolTip>{isZh ? item.nameCn : item.nameEn}</EllipsisToolTip>
                </div>
                {options.removeable && <span className={styles.item__delete} onClick={options.onRemove}                >
                    <FontIcon type={IconType.WRONG} />
                </span>}
            </div>}
            extra={<FontIcon {...options.draggableHandleProps} className={styles.icon} type={IconType.DRAG} />}
        >
            {content}
        </Panel>
    </Collapse>
}

export default List