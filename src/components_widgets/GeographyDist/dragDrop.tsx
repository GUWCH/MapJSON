import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import _ from "lodash";
import Konva from 'konva';
import KonvaWrap from 'KonvaWrap';
import { calcCusEventProps, fireCustomEvent } from "DrawLib/utils";
import CommonDynData from "DynData";
import { uuid } from '@/common/utils';
import { navTo } from '@/common/util-scada';
import { useNavigate } from 'react-router-dom';
import { getIconCode } from 'Icon';
import { isZh, FONT_FAMILY } from "./constants";
import styles from './style.module.scss';
import { useCompareDeps } from "@/common/utils/debug";
import { default as getUnionCounts } from "./shapes/unionCounts";
import { default as getTypeIcon } from './shapes/typeIcon'
import { default as getStatusIcon } from './shapes/statusIcon'
import { default as getName } from './shapes/name'
import { getPropertyIfExist } from "@/common/utils/object";
import DeviceTooltip, { DeviceTooltipProps, NameTooltipInfo } from "./tooltips/DeviceTooltip";
import UnionTooltip, { UnionTooltipProps } from "./tooltips/UnionTooltip";
import { Vector2d } from "konva/lib/types";

export interface Positions {
    scaleX: number,
    scaleY: number
}

type LabelConfig = {
    positions?: Positions
    zIndex?: number
    editNameCn?: string
    editNameEn?: string
}

type DeviceConfig = LabelConfig & {
    belongingUnionKey?: string
}

type UnionConfig = LabelConfig & {
    childrenKeys: string[]
}

export type ConfigContent = DeviceConfig | UnionConfig
export type Config = Record<string, ConfigContent | undefined>


type DrawParams = {
    meta: DragDropData;
    key: string;
    name: string;
    type: string
    typeIcon: string
    typeIconCode: string
    position?: Positions
    status?: {
        icon?: string
        iconCode?: string
        color?: string
        name: string
    };
    backgroundColor?: string;
    tooltipData?: DeviceTooltipProps
    unionInfos?: Omit<DrawParams, 'unionInfos'>[]
}

export type DragDropData = {
    type: string,
    jumpable?: boolean,
    jumpToTpl?: boolean,
    toSwitchPage?: boolean,
    needStatus?: boolean,
    needQuotas?: boolean,
    needName?: boolean,
    typeIconCode: string,
    deviceTypeName: string,
    prefixName: string,
    aliasList: string[]
}

interface DragDropProps {
    bgUrl: string;
    isEdit: boolean;
    data: Array<DragDropData>,
    valData: Record<string, NameTooltipInfo[] | undefined>
    config: Config,
    onConfigChange: (cfg: Config) => void,
}

const deviceHeight = 38;
const deviceMaxWidth = 250;
const deviceMinWidth = 125;
const size = {
    deviHeight: 12 + deviceHeight,
    deviWidth: 40 + deviceMaxWidth,
}

const DragDrop = ({
    bgUrl,
    isEdit,
    data,
    valData,
    config: curConfig,
    onConfigChange
}: DragDropProps) => {

    const navigator = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [bg, setBg] = useState(bgUrl);
    const collisionInfoMap = useRef<
        Record<string, {
            type: string
            isUnion: boolean
            group: Konva.Group
            children: (Konva.Rect | Konva.Line)[]
        } | undefined>
    >({})
    const collidedGroupKey = useRef<string | undefined>()

    const uId = useMemo(() => {
        return {
            containerId: uuid(8),
            iconContainerId: uuid(8)
        }
    }, [])

    useEffect(() => {
        setBg(bgUrl);
    }, [bgUrl])

    const reorderZIndex = (key: string, otherCfg?: ConfigContent) => {
        const oldZIndex = curConfig[key]?.zIndex;
        const newConfig = Object.entries(curConfig).reduce((pre, [k, cfg], _, arr) => {
            const content: ConfigContent = Object.assign({}, cfg, k === key ? otherCfg : undefined)

            if (k === key) {
                content.zIndex = arr.length
            } else if (cfg?.zIndex !== undefined && oldZIndex !== undefined && cfg.zIndex > oldZIndex) {
                content.zIndex = cfg.zIndex - 1
            }

            return {
                ...pre,
                [k]: content
            }
        }, {} as Config)

        if (!_.isEqual(newConfig, curConfig)) {
            onConfigChange(newConfig);
        }
    }

    const handleMove = (key: string, positions: Positions) => {
        const originCfg = curConfig[key]
        onConfigChange({
            ...curConfig,
            [key]: {
                ...originCfg,
                positions: positions
            }
        })
    }

    const handleUnite = (targetKey: string, sourceKey: string, sourcePosition: Positions) => {
        const childrenKeys: string[] = []
        const originTargetCfg = curConfig[targetKey]
        const newConfig = _.cloneDeep(curConfig)
        const newUnionKey = originTargetCfg && 'childrenKeys' in originTargetCfg ?
            targetKey : 'random' + (Math.random() * 100000).toFixed(0)

        const handleKey = (k: string) => {
            const originCfg = curConfig[k]
            if (originCfg && 'childrenKeys' in originCfg) {
                childrenKeys.push(...originCfg.childrenKeys)
                delete newConfig[k]
            } else {
                childrenKeys.push(k)
            }
        }
        handleKey(targetKey)
        handleKey(sourceKey)

        const newUnionCfg: UnionConfig = {
            ...originTargetCfg,
            positions: originTargetCfg?.positions ?? sourcePosition,
            childrenKeys
        }
        newConfig[newUnionKey] = newUnionCfg
        childrenKeys.forEach(ck => {
            const originChildCfg = curConfig[ck]
            newConfig[ck] = {
                ...originChildCfg,
                belongingUnionKey: newUnionKey
            }
        })

        onConfigChange(newConfig)
    }

    const handleEditUnion = (childrenKeys: string[], unitKey: string, removedKeys: string[]) => {
        const newConfig = _.cloneDeep(curConfig)

        removedKeys.forEach(targetKey => {
            const targetCfg = newConfig[targetKey]
            if (targetCfg && 'belongingUnionKey' in targetCfg) {
                targetCfg.belongingUnionKey = undefined
            }
        })

        const unitCfg = newConfig[unitKey]
        if (unitCfg && 'childrenKeys' in unitCfg) {
            if (childrenKeys.length === 0) {
                delete newConfig[unitKey]
            } else {
                unitCfg.childrenKeys = childrenKeys
            }
        }
        onConfigChange(newConfig)
    }

    const getLabel = ({
        meta: {
            jumpable,
            jumpToTpl,
            toSwitchPage,
            needQuotas,
        },
        key,
        name,
        type,
        typeIcon,
        typeIconCode,
        position,
        defaultX, defaultY,
        status,
        backgroundColor,
        tooltipData,
        unionInfos
    }: DrawParams & {
        defaultX: number,
        defaultY: number
    }): Konva.Group => {
        const containerEle = containerRef.current
        const containerWidth = containerEle!.clientWidth
        const containerHeight = containerEle!.clientHeight

        const statusIcon = status?.icon;
        const statusIconColor = status?.color;

        const group = new Konva.Group({ draggable: isEdit })

        const typeIconContent = typeIcon ? getTypeIcon({
            x: 0, y: 0, width: 32, height: deviceHeight - 6, code: typeIcon
        }) : undefined
        const typeIconRect = typeIconContent ? new Konva.Rect({
            x: 0,
            y: 0,
            width: 32,
            height: deviceHeight - 6,
            fill: '#254F61',
            cornerRadius: 2,
        }) : undefined
        typeIconRect && group.add(typeIconRect)
        typeIconContent && group.add(typeIconContent);

        const statusIconContent = statusIcon ? getStatusIcon({
            x: 4,
            y: 0,
            width: 33,
            height: deviceHeight - 6,
            code: statusIcon,
            iconColor: statusIconColor
        }) : undefined

        const nameContent = getName({
            x: (statusIconContent?.x() ?? 4) + (statusIconContent?.width() ?? 0),
            y: 0,
            height: deviceHeight - 6,
            text: name,
            onRename: isEdit ? (newName) => {
                const newConfig = Object.assign({}, curConfig)
                const currentCfg = newConfig[key]
                newConfig[key] = {
                    ...currentCfg,
                    [isZh ? 'editNameCn' : 'editNameEn']: newName
                }
                onConfigChange(newConfig)
            } : undefined
        })

        const unionCountsContent = unionInfos ? getUnionCounts({
            count: unionInfos.length,
            x: nameContent.x() + nameContent.width(),
            y: 0,
            height: deviceHeight - 6,
            color: statusIconColor
        }) : undefined

        const otherContentGroup = new Konva.Group({
            x: (typeIconRect?.width() ?? 0) + 1,
            y: 0,
        })

        const otherRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: 8 + (statusIconContent?.width() ?? 0) + nameContent.width() + (unionCountsContent?.width() ?? 0),
            height: deviceHeight - 6,
            fill: backgroundColor || '#254F61',
            cornerRadius: 2,
        })
        otherContentGroup.add(otherRect)
        otherContentGroup.add(nameContent)
        unionCountsContent && otherContentGroup.add(unionCountsContent)
        statusIconContent && otherContentGroup.add(statusIconContent)

        const totalWidth = (typeIconRect?.width() ?? 0) + otherRect.width() + 1
        group.width(totalWidth)

        const arrowPath = [
            totalWidth / 2 - 6, deviceHeight - 6,
            totalWidth / 2, deviceHeight,
            totalWidth / 2 + 6, deviceHeight - 6,
        ]

        const arrow = bg ? new Konva.Line({
            points: arrowPath,
            fill: '#254F61',
            closed: true
        }) : undefined

        const border = new Konva.Line({
            points: [
                0, 0,
                0, deviceHeight - 6
            ].concat(bg ? arrowPath : []).concat([
                totalWidth, deviceHeight - 6,
                totalWidth, 0,
                0, 0
            ]),
            stroke: '#00A7DB',
            strokeWidth: 1,
            closed: false,
            opacity: 0,
        })

        /**react click会拦截dblclick, 编译后正常 */
        group.on('click', function (evt) {
            if (evt.evt.detail === 2 || unionInfos) return;
            if (isEdit) {
                // 重新排序
                reorderZIndex(key);
            } else if (jumpable) {
                if (jumpToTpl) {
                    navTo(key);
                } else if (toSwitchPage) {
                    let keyArr = key.split('.');
                    navTo(key, { compatible: keyArr.length === 1 });
                } else {
                    navigator(`/${key}`, { replace: true });
                }
                document.body.style.cursor = 'auto';
            }
        })

        group.on('mouseenter', function (evt) {
            border.opacity(1)
            group.zIndex(1)
            document.body.style.cursor = isEdit ? 'move' : 'pointer';
            const cusEvtProps = calcCusEventProps(evt, key);

            const hover = unionInfos ? {
                tooltipData: {
                    type: 'union',
                    typeIconCode: typeIconCode,
                    name: name,
                    edittable: isEdit,
                    titleColor: statusIconColor,
                    members: unionInfos.map(info => ({
                        name: info.name,
                        status: info.status ? {
                            iconCode: info.status.iconCode,
                            color: info.status.color,
                            displayValue: info.status.name
                        } : undefined,
                        key: info.key,
                        deviceTooltipProps: info.tooltipData!
                    })),
                    onRemove: (ks, removed) => handleEditUnion(ks, key, removed),
                    onClickName: (k) => navigator(`/${k}`, { replace: true })
                },
                tooltipOverlayClassName: styles.antdTooltip
            } : (isEdit || !needQuotas ? undefined : {
                tooltipData: tooltipData,
                tooltipOverlayClassName: styles.antdTooltip
            })

            hover && cusEvtProps && fireCustomEvent('showCustomNode', {
                ...Object.assign({}, cusEvtProps),
                data: hover.tooltipData,
                tooltipProps: {
                    placement: 'bottomLeft',
                    overlayClassName: hover.tooltipOverlayClassName
                }
            })
        })

        group.on('mouseleave', function (evt) {
            border.opacity(0)
            group.zIndex(0)
            document.body.style.cursor = 'default';
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: undefined
            })
        })

        group.on('dragstart', function (evt) {
            group.zIndex(1)
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: undefined,
                tooltipProps: undefined
            })
        })

        group.on('dragmove', (evt) => {
            const currentGroup = evt.target
            const currentRect = currentGroup.getClientRect()
            const collidedEntries = Object.entries(collisionInfoMap.current).filter(([k, v]) => {
                if (!v || k === key) {
                    return false
                }

                const targetRect = v.group.getClientRect()
                if (!(
                    currentRect.x > targetRect.x + targetRect.width ||
                    currentRect.x + currentRect.width < targetRect.x ||
                    currentRect.y > targetRect.y + targetRect.height ||
                    currentRect.y + currentRect.height < targetRect.y
                )) {
                    return true
                }
            })

            const currentCollidedKey = collidedGroupKey.current

            if (currentCollidedKey && (collidedEntries.length === 0 || currentCollidedKey !== key)) {
                collisionInfoMap.current?.[currentCollidedKey]?.children.forEach(shape => shape.fill('#254F61'))
            }

            if (collidedEntries.length !== 0) {
                collidedEntries.forEach(collidedEntry => {
                    const [key, obj] = collidedEntry
                    obj?.group.zIndex(0)
                })

                const collidedEntry = collidedEntries.find(([key, obj]) => obj?.type === type)
                if (collidedEntry) {
                    const [key, obj] = collidedEntry
                    obj?.children.forEach(shape => shape.fill('#00A7DB'))
                    collidedGroupKey.current = key
                }
            } else {
                collidedGroupKey.current = undefined
            }
        })

        group.on('dragend', function (e) {
            const currentCollidedKey = collidedGroupKey.current
            const { x, y } = this.getAbsolutePosition();
            const position: Positions = {
                scaleX: (x + totalWidth / 2) / containerWidth,
                scaleY: (y + deviceHeight) / containerHeight
            }
            if (currentCollidedKey) {
                handleUnite(currentCollidedKey, key, position)
            } else {
                handleMove(key, position)
            }
        })

        group.add(otherContentGroup);
        arrow && group.add(arrow);
        group.add(border)
        collisionInfoMap.current = {
            ...collisionInfoMap.current,
            [key]: {
                group: group,
                type: type,
                isUnion: !!unionInfos,
                children: ([otherRect] as (Konva.Rect | Konva.Line)[])
                    .concat(typeIconRect ? [typeIconRect] : [])
                    .concat(arrow ? [arrow] : [])
            }
        }

        const dragBoundFunc = (pos: Vector2d): Vector2d => {
            const newX = pos.x < 1 ? 1 : (pos.x > (containerWidth - totalWidth - 1) ? (containerWidth - totalWidth - 1) : pos.x);
            const newY = pos.y < 1 ? 1 : (pos.y > (containerHeight - deviceHeight - 1) ? (containerHeight - deviceHeight - 1) : pos.y);
            return {
                x: newX,
                y: newY
            };
        }

        group.dragBoundFunc(dragBoundFunc)

        const labelWidth = group.width()
        const { clientWidth, clientHeight } = containerRef.current!;
        const x = position?.scaleX ? position.scaleX * clientWidth - labelWidth / 2 : defaultX
        const y = position?.scaleY ? position.scaleY * clientHeight - deviceHeight : defaultY
        const finalPos = dragBoundFunc({ x, y })

        group.x(finalPos.x)
        group.y(finalPos.y)

        return group;
    }

    const draw = useCallback((stage: Konva.Stage) => {
        if (!stage || !containerRef.current || data.length === 0) return;
        const layer = new Konva.Layer()
        stage.destroyChildren();
        stage.clear();
        collisionInfoMap.current = {}
        collidedGroupKey.current = undefined
        stage.add(layer)

        const { clientWidth, clientHeight } = containerRef.current;

        if (!clientHeight || !clientHeight) {
            return;
        }

        const deviWidth = Math.min(size.deviWidth, clientWidth / (data.length || 1));

        data.forEach((d, typeIndex) => {
            const {
                typeIconCode,
                deviceTypeName,
                prefixName = '',
                aliasList,
                type
            } = d;

            const typeIcon = typeIconCode ? getIconCode(typeIconCode, uId.iconContainerId) : '';
            const deviHeight = Math.min(size.deviHeight, (clientHeight - deviceHeight) / (aliasList.length || 1));

            const labelParamsList: {
                key: string
                isUnion: boolean
                cfg?: ConfigContent
            }[] = []

            /**
             * 固化原始接口返回的序号，使未配置过的卡片位置和默认名字也能固定
             */
            const originIndexMap: Record<string, number> = {}

            aliasList.forEach((alias, i) => {
                originIndexMap[alias] = i
                const cfg = curConfig?.[alias]
                if (cfg && 'belongingUnionKey' in cfg && cfg.belongingUnionKey) {
                    !labelParamsList.find(l => l.key === cfg.belongingUnionKey) && labelParamsList.push({
                        key: cfg.belongingUnionKey,
                        cfg: curConfig?.[cfg.belongingUnionKey],
                        isUnion: true
                    })
                } else {
                    labelParamsList.push({
                        key: alias, cfg, isUnion: false
                    })
                }
            })

            labelParamsList.sort((a, b) => {
                return (a.cfg?.zIndex ?? 0) - (b.cfg?.zIndex ?? 0)
            }).forEach((param) => {
                const originDeviceIndex = originIndexMap[param.key]
                const getLabelParams = (key: string, cfg?: ConfigContent): DrawParams => {
                    let defaultName = '';
                    let tooltipData: DrawParams['tooltipData'] = undefined
                    let bgPoint: NameTooltipInfo | undefined = undefined
                    let statusData: { code?: string, color?: string, displayValue: string, rawValue: string } | undefined

                    if (cfg && 'childrenKeys' in cfg) {
                        defaultName = deviceTypeName + (isZh ? '聚合' : ' Union')
                    } else {
                        const res = /(\d+)$/g.exec(key.split('.')[2] || '') || /(\d+)$/g.exec(key.split('.')[1] || '')
                        const No = res ? res[1] : ''
                        defaultName = key;
                        if (No && prefixName) {
                            defaultName = `${prefixName + No}`
                        } else {
                            if (aliasList.length === 1) {
                                defaultName = deviceTypeName
                            } else {
                                defaultName = `${deviceTypeName + (originDeviceIndex + 1)}`;
                            }
                        }

                        bgPoint = valData[key]?.find(v => v.isBg)

                        tooltipData = {
                            type: 'device',
                            title: `${prefixName + No}`,
                            infos: valData[key] ?? []
                        }
                    }

                    // let currentStatusValue: string | undefined = undefined;
                    (cfg && 'childrenKeys' in cfg ? cfg.childrenKeys : [key]).every(k => {
                        const statusPointValue = (valData[k] ?? [])?.find(v => v.isStatus)
                        if (!statusPointValue) {
                            return true
                        }

                        const { icon, value, color, rawValue } = statusPointValue

                        if (statusData?.rawValue === '1') {
                            if (statusData.code && statusData.color) {
                                return false
                            }

                            if (rawValue === '1') {
                                if (icon) {
                                    statusData.code = icon
                                }
                                if (color) {
                                    statusData.color = color
                                }
                            }
                            return true
                        }

                        if (rawValue !== undefined && rawValue === statusData?.rawValue) {
                            if (icon) {
                                statusData.code = icon
                            }
                            if (color) {
                                statusData.color = color
                            }
                        } else if (rawValue && value) {
                            statusData = {
                                code: icon,
                                color: color,
                                rawValue: rawValue,
                                displayValue: value
                            }
                        }
                        return true
                    })
                    const { editNameCn, editNameEn } = cfg ?? {}

                    return {
                        meta: d,
                        key: key,
                        name: (isZh ? editNameCn : editNameEn) || defaultName,
                        type,
                        typeIcon: typeIcon,
                        typeIconCode: typeIconCode,
                        tooltipData: tooltipData,
                        position: cfg?.positions,
                        status: statusData ? {
                            icon: statusData.code ? getIconCode(statusData.code, uId.iconContainerId) : '',
                            iconCode: statusData.code,
                            color: statusData.color,
                            name: statusData.displayValue ?? ''
                        } : undefined,
                        backgroundColor: bgPoint?.color,
                        unionInfos: cfg && 'childrenKeys' in cfg ? cfg.childrenKeys.map(ck => getLabelParams(ck, curConfig[ck])) : undefined
                    }
                }

                const label = getLabel(Object.assign(
                    { defaultX: typeIndex * (deviWidth), defaultY: originDeviceIndex * (deviHeight) },
                    getLabelParams(param.key, param.cfg)
                ))

                layer.add(label);
            })
        })
    }, [data, isEdit, curConfig, valData]);

    const cusTooltipNodeProvider = useCallback((evt) => {
        const data = evt.data as UnionTooltipProps | DeviceTooltipProps
        if (data.type === 'device') {
            return <DeviceTooltip {...data} />
        } else {
            return <UnionTooltip {...data} />
        }
    }, []);

    return <div
        className={styles.dragDropContainer}
        ref={containerRef}
        id={uId.containerId}
        style={{
            backgroundImage: "url(" + bg + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%"
        }}
    >
        <KonvaWrap
            width={containerRef.current?.clientWidth ?? 1 - 1}
            height={containerRef.current?.clientHeight ?? 1 - 1}
            draw={draw}
            cusTooltipNodeProvider={cusTooltipNodeProvider}
        />
    </div>
}

export default DragDrop;