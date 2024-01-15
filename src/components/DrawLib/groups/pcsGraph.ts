import { bindClick } from "DrawLib/wrapper/eventHandlerWrapper"
import Konva from "konva"
import { DEFAULT_COLOR, HEALTH_STATE, SWITCH_STATE } from "../constant"
import { GroupElement, GroupProps, Point, ShapeEventHandler } from "../model"
import { bank, coupledSwitch, fuse, pcs } from "../shapes"
import { calcEleActualRect, label, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils"


export type PCSGraphState = {
    acBreakerState: {
        key?: string,
        state: SWITCH_STATE
    },
    dcCoupledSwitchState: {
        key?: string,
        state: SWITCH_STATE
    },
    leftFuse: {
        key?: string,
        state: SWITCH_STATE
    },
    rightFuse: {
        key?: string,
        state: SWITCH_STATE
    }
    pcsStatus?: {
        key?: string,
        state: HEALTH_STATE
    }
    batteryStatus?: {
        key?: string,
        state: HEALTH_STATE
    }
}

export const PCSGraphShapeType = {
    PCS: 'pcs',
    BATTERY_GROUP: 'battery_group'
}

export enum PCS_GRAPH_TYPE {
    /* 类型1. 电池组正负极都有熔丝*/
    TYPE1 = 0,
    /* 类型2. 电池组负极有熔丝 */
    TYPE2 = 1
}

export type PCSGraphOptions = {
    onClick?: ShapeEventHandler<'click'>
    withTopBreaker?: boolean  // 是否为pcs单设备控件接线图
    pcsLabel?: string
    rankLabel?: string
    type: PCS_GRAPH_TYPE
}

export type PCSGraphOutOptions = {
    pcsOrigin: Point
    rankOrigin: Point
}

export const stateColorMap = (name: 'ACBREAKER' | 'COUPLED_SWITCH' | 'FUSE', state: SWITCH_STATE): string => {
    let color: string
    switch (state) {
        case SWITCH_STATE.SEPARATED:
            color = DEFAULT_COLOR[name].SEPARATE;
            break;
        case SWITCH_STATE.CONNECTED:
            color = DEFAULT_COLOR[name].CONNECT;
            break;
        default:
            color = DEFAULT_COLOR[name].DEFAULT;
            break;
    }
    return color
}

const pcsGraph = (props: GroupProps<PCSGraphState, PCSGraphOptions>): GroupElement<PCSGraphOutOptions> => {
    if (props.start.length <= 0) {
        throw new Error("No start point!");
    }

    const { withTopBreaker, type } = props.options
    const { acBreakerState, dcCoupledSwitchState, leftFuse, rightFuse, pcsStatus, batteryStatus } = props.state
    const wireWidth = props.options.wireWidth || 2

    const pcsLabel = props.options.pcsLabel
    const rankLabel = props.options.rankLabel
    const constant = {
        // width: 72 + (pcsLabel || rankLabel ? 10 + 110 : 0),
        width: 72, // 为保证图形居中目前没有加label所需空间
        height: 271,
        acBreakerLineLength: 68,
        acBreakerTopLineLength: 8,
        dcCoubledSwitchWireLength: 30,
        acBreaker: {
            width: 14,
            height: 34,
            cornerRadius: 3
        },
        pcs: {
            width: 72,
            height: 42
        },
        coupledSwitch: {
            width: 72,
            height: 43
        },
        fuse: {
            height: 32,
            width: 8
        },
        bank: {
            height: 46,
            width: 72,
        },
        labelFont: 20,
        labelWidth: 35,
        labelMargin: 5
    }

    const eleRect = {
        width: constant.width,
        height: constant.height
    }

    const {
        scaleX: scale,
        containerHeight,
        containerWidth,
        actualEleWidth,
        actualEleHeight
    } = calcEleActualRect(eleRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        width: constant.width * scale,
        height: constant.height * scale,
        acBreakerLineLength: constant.acBreakerLineLength * scale,
        acBreakerTopLineLength: constant.acBreakerTopLineLength * scale,
        dcCoubledSwitchWireLength: constant.dcCoubledSwitchWireLength * scale,
        acBreaker: {
            width: constant.acBreaker.width * scale,
            height: constant.acBreaker.height * scale,
            cornerRadius: constant.acBreaker.cornerRadius * scale,
        },
        pcs: {
            width: constant.pcs.width * scale,
            height: constant.pcs.height * scale,
        },
        coupledSwitch: {
            width: constant.coupledSwitch.width * scale,
            height: constant.coupledSwitch.height * scale,
        },
        fuse: {
            width: constant.fuse.width * scale,
            height: constant.fuse.height * scale
        },
        bank: {
            width: constant.bank.width * scale,
            height: constant.bank.height * scale
        },
        labelFont: constant.labelFont * scale,
        labelWidth: constant.labelWidth * scale,
        labelMargin: constant.labelMargin * scale
    }

    const extendWireLength = (containerHeight - size.height) / 2

    const start = props.start[0]
    const inPoint = props.options.startType === 'origin' ? point(start.x + containerWidth / 2, start.y) : start
    const origin = point(inPoint.x - actualEleWidth / 2, inPoint.y)
    const graphStart = { x: inPoint.x, y: inPoint.y + extendWireLength }

    const group = new Konva.Group()

    const pcsStart = point(graphStart.x, graphStart.y + size.acBreakerLineLength)
    group.add(wire([point(graphStart.x, graphStart.y), pcsStart]))

    if (withTopBreaker) {
        const acBreakerStart = point(graphStart.x, graphStart.y + size.acBreakerTopLineLength)
        const fill = mapSwitchStateToFillColor(acBreakerState.state)
        const hoverFill = mapSwitchStateToHoverColor(acBreakerState.state)
        const rect = new Konva.Rect({
            x: acBreakerStart.x - size.acBreaker.width / 2,
            y: acBreakerStart.y,
            width: size.acBreaker.width,
            height: size.acBreaker.height,
            fill: fill,
            cornerRadius: size.acBreaker.cornerRadius
        })
        bindClick(rect, {
            movein: () => rect.fill(hoverFill),
            moveout: () => rect.fill(fill),
        }, {
            key: acBreakerState.key,
            eventHandlers: props.options.eventHandlers ? {
                ...props.options.eventHandlers
            } : undefined
        })
        group.add(rect)
    }

    // pcs
    const pcsIcon = pcs({
        state: pcsStatus?.state,
        start: [pcsStart],
        options: {
            ...props.options,
            startType: 'default',
            key: pcsStatus?.key,
            eventHandlers: {
                click: props.options.eventHandlers?.click
            },
            shapeType: PCSGraphShapeType.PCS
        },
        rect: size.pcs
    })
    group.add(pcsIcon.ele)
    if (pcsLabel) {
        group.add(
            label(pcsLabel, point(origin.x - size.labelMargin - size.labelWidth, pcsStart.y + size.pcs.height / 2 - size.labelFont / 2),
                size.labelFont, size.labelWidth)
        )
    }

    // dcCoubledSwitch
    const dcCoubledSwitchStart = point(pcsIcon.end[0].x, pcsIcon.end[0].y + size.dcCoubledSwitchWireLength)
    group.add(wire([pcsIcon.end[0], dcCoubledSwitchStart]))

    const dcCoubledSwitchProps = {
        state: dcCoupledSwitchState.state,
        start: [dcCoubledSwitchStart],
        options: {
            ...props.options,
            color: stateColorMap('COUPLED_SWITCH', dcCoupledSwitchState.state),
            key: dcCoupledSwitchState.key,
            eventHandlers: {
                click: props.options.eventHandlers?.click
            }
        },
        rect: size.coupledSwitch
    }
    const dcCoubledSwitch = coupledSwitch(dcCoubledSwitchProps)
    group.add(dcCoubledSwitch.ele)

    // fuse
    const leftFuseProps = {
        state: leftFuse.state,
        start: [dcCoubledSwitch.end[0]],
        options: {
            color: stateColorMap('FUSE', leftFuse.state),
            scale: scale,
            key: leftFuse.key,
            eventHandlers: {
                click: props.options.eventHandlers?.click
            }
        },
        rect: size.fuse
    }
    const rightFuseProps = {
        state: rightFuse.state,
        start: [dcCoubledSwitch.end[1]],
        options: {
            color: stateColorMap('FUSE', rightFuse.state),
            scale: scale,
            key: rightFuse.key,
            eventHandlers: {
                click: props.options.eventHandlers?.click
            }
        },
        rect: size.fuse
    }

    const curLeftFuse = fuse(leftFuseProps)
    const curRightFuse = fuse(rightFuseProps)
    if (type == PCS_GRAPH_TYPE.TYPE1) {
        group.add(curLeftFuse.ele, curRightFuse.ele)
    } else if (type == PCS_GRAPH_TYPE.TYPE2) {
        curLeftFuse.ele.destroy()
        group.add(
            wire([
                point(dcCoubledSwitch.end[0].x, dcCoubledSwitch.end[0].y),
                point(dcCoubledSwitch.end[0].x, dcCoubledSwitch.end[0].y + size.fuse.height)
            ]),
            curRightFuse.ele
        )
    } else {// 兜底销毁
        curRightFuse.ele.destroy()
        curLeftFuse.ele.destroy()
    }

    // bank
    const bankStart = [curLeftFuse.end[0], curRightFuse.end[0]]
    const curBank = bank({
        start: bankStart,
        rect: size.bank,
        state: batteryStatus?.state,
        options: {
            ...props.options,
            key: batteryStatus?.key,
            eventHandlers: {
                click: props.options.eventHandlers?.click
            },
            shapeType: PCSGraphShapeType.BATTERY_GROUP
        }
    })
    group.add(curBank.ele)

    if (rankLabel) {
        group.add(
            label(rankLabel, point(origin.x - size.labelMargin - size.labelWidth, bankStart[0].y + size.bank.height / 2 - size.labelFont / 2),
                size.labelFont, size.labelWidth)
        )
    }

    if (extendWireLength > 0) {
        const extendLine = wire([inPoint, graphStart], wireWidth, props.options.wireColor)
        group.add(extendLine)
    }

    return {
        origin: origin,
        start: [inPoint],
        end: [curBank.end[0]],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: actualEleHeight
        },
        otherInfo: {
            pcsOrigin: pcsIcon.origin,
            rankOrigin: curBank.origin
        }
    }
}

export default pcsGraph