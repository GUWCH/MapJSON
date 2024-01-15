import { msgTag } from '@/common/lang';
import { withLabel } from 'DrawLib/wrapper/additionalEleWrapper';
import { bindClick, bindHover } from 'DrawLib/wrapper/eventHandlerWrapper';
import Konva from "konva";
import { CONTROL_STATE, SWITCH_STATE } from "../constant";
import { Point, ShapeElement, ShapeProps, SwitchColors } from "../model";
import { calcCusEventProps, calcEleActualRect, fireCustomEvent, mapIDynToControlState, mapIDynToSwitchState, mapSwitchStateToFillColor, mapSwitchStateToHoverColor, point, wire } from "../utils";
const i18n = msgTag('WiringDiagram') as (code: 'remote' | 'local' | 'yk' | 'yk_warn') => string

const DEFAULT_COLOR = {
    BREAKER_BTN: {
        TEXT: '#FFFFFF',
        ON: {
            FILL: 'rgba(30, 83, 102, 0.7)',
            STROKE: '#2D5F75'
        },
        OFF: {
            GRADIENT_START: '#3295AB',
            GRADIENT_END: '#124B5C'
        },
        MISSING: {
            FILL: '#3F6D85',
            STROKE: '#6A8CA3'
        }
    }
}

export type BreakerColors = {
    fill: SwitchColors,
    hover: SwitchColors,
    button: Partial<{
        text: string
        on: {
            fill: string
            stroke: string
        },
        off: {
            gradientStart: string
            gradientEnd: string
        },
        missing: {
            fill: string
            stroke: string
        }
    }>
}

export type BreakerOptions = {
    buttonPosition: 'left' | 'right'
    colors?: BreakerColors
    hoverMark?: {
        breaker: string
        btn: string
    }
}

export type BreakerState = {
    breaker: {
        key: string
        state: SWITCH_STATE
    }
    control?: {
        key: string
        state: CONTROL_STATE
    }
}

const breaker: (props: ShapeProps<BreakerState, BreakerOptions>) => ShapeElement = (props) => {
    const cState = props.state.control?.state
    const cKey = props.state.control?.key
    const bState = props.state.breaker.state
    const bKey = props.state.breaker.key
    const { colors, buttonPosition, wireWidth, wireColor, stateConsumerRegister } = props.options

    const remoteText = i18n('remote')
    const localText = i18n('local')

    const isBigBtn = remoteText.length > 2 || localText.length > 2
    // 图形尺寸计算 
    const designRect = {
        width: 14 + (isBigBtn ? 48 : 32) + 11, // rectWidth + btnWidth + btnMargin
        height: 34
    }
    const {
        scaleX: transfromScale,
        actualEleWidth,
        actualEleHeight,
        containerWidth,
        containerHeight
    } = calcEleActualRect(designRect, props.rect, { ratioLimitType: 'infi-height' })

    const size = {
        rectWidth: transfromScale * 14,
        rectHeight: transfromScale * 34,
        cornerRadius: transfromScale * 3,
        button: {
            marginLR: transfromScale * 11, // 左右间距
            marginTB: transfromScale * 2, // 上下间距
            fontSize: transfromScale * 12,
            width: isBigBtn ? transfromScale * 48 : transfromScale * 32,
            textWidth: isBigBtn ? transfromScale * 52 : transfromScale * 36,
            height: transfromScale * 16,
            cornerRadius: transfromScale * 2,
            innerBorderWidth: transfromScale * 1
        }
    }

    const originStart = props.start[0]

    let inP: Point
    if (props.options.startType === 'origin') {
        let inPx: number = originStart.x
        const btnAreaW = size.button.width + size.button.marginLR
        switch (props.options.contentPosition?.x) {
            case 'start': {
                inPx += size.rectWidth / 2 + (buttonPosition === 'left' ? btnAreaW : 0)
                break;
            }
            case 'end': {
                inPx += containerWidth - (size.rectWidth / 2 + (buttonPosition === 'right' ? btnAreaW : 0))
                break;
            }
            default: {
                inPx += containerWidth / 2
            }
        }
        inP = point(inPx, originStart.y)
    } else {
        inP = originStart
    }
    const extendWireLength = Math.max((containerHeight - size.rectHeight) / 2, 0)
    const start = point(inP.x, inP.y + extendWireLength)

    // 图形绘制
    const button = (o: Point, text: string, btnState: 'on' | 'off' | 'missing') => {
        const commonCfg = {
            id: 'test' + Math.random,
            name: 'testname',
            x: o.x,
            y: o.y,
            width: size.button.width,
            height: size.button.height,
            perfectDrawEnabled: false,
            cornerRadius: size.button.cornerRadius,
        }
        const g = new Konva.Group()

        switch (btnState) {
            case 'on': {
                g.add(
                    new Konva.Rect({
                        ...commonCfg,
                        x: commonCfg.x + size.button.innerBorderWidth / 2,
                        width: commonCfg.width - size.button.innerBorderWidth,
                        height: commonCfg.height - size.button.innerBorderWidth / 2,
                        fill: colors?.button?.on?.fill || DEFAULT_COLOR.BREAKER_BTN.ON.FILL,
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: size.button.innerBorderWidth,
                        perfectDrawEnabled: false,
                    }), new Konva.Line({ // 人造内阴影，Konva不支持内阴影
                        points: [o.x, o.y + size.button.innerBorderWidth, o.x, o.y + (size.button.height - size.button.innerBorderWidth)],
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: size.button.innerBorderWidth / 2,
                        lineCap: 'round',
                        lineJoin: 'round',
                        shadowOffsetX: size.button.innerBorderWidth,
                        shadowColor: 'black',
                        shadowBlur: size.button.innerBorderWidth * 4,
                        perfectDrawEnabled: false,
                    }), new Konva.Line({
                        points: [o.x + size.button.innerBorderWidth, o.y,
                        o.x + size.button.width - size.button.innerBorderWidth, o.y],
                        stroke: colors?.button?.on?.stroke || DEFAULT_COLOR.BREAKER_BTN.ON.STROKE,
                        strokeWidth: size.button.innerBorderWidth / 2,
                        lineCap: 'round',
                        lineJoin: 'round',
                        shadowOffsetY: size.button.innerBorderWidth,
                        shadowColor: 'black',
                        perfectDrawEnabled: false,
                        shadowBlur: size.button.innerBorderWidth * 4
                    })
                )
                break;
            }
            case 'off': {
                g.add(new Konva.Rect({
                    ...commonCfg,
                    fillLinearGradientStartPoint: { x: 0, y: 0 },
                    fillLinearGradientEndPoint: { x: 0, y: size.button.height },
                    fillLinearGradientColorStops: [
                        0, colors?.button?.off?.gradientStart || DEFAULT_COLOR.BREAKER_BTN.OFF.GRADIENT_START,
                        1, colors?.button?.off?.gradientEnd || DEFAULT_COLOR.BREAKER_BTN.OFF.GRADIENT_END
                    ]
                }))
                break;
            }
            default: {
                g.add(new Konva.Rect({
                    ...commonCfg,
                    fill: colors?.button?.missing?.fill || DEFAULT_COLOR.BREAKER_BTN.MISSING.FILL,
                    stroke: colors?.button?.missing?.stroke || DEFAULT_COLOR.BREAKER_BTN.MISSING.STROKE,
                    strokeWidth: 1
                }))
            }
        }

        const textOffsetX = (size.button.textWidth - size.button.width) / 2

        const t = new Konva.Text({
            x: o.x - textOffsetX,
            y: o.y,
            width: size.button.textWidth,
            height: size.button.height,
            fontSize: size.button.fontSize,
            fontFamily: 'PingFangSC-Medium, PingFang SC',
            text: text,
            align: 'center',
            verticalAlign: 'middle',
            perfectDrawEnabled: false,
            fill: colors?.button?.text || DEFAULT_COLOR.BREAKER_BTN.TEXT
        })

        g.add(t)

        bindHover(g, {
            movein(key, evt) {
                const cusEvtProps = calcCusEventProps(evt, key)
                cusEvtProps && fireCustomEvent('showCustomNode', {
                    ...cusEvtProps,
                    data: {
                        hoverMark: props.options.hoverMark?.btn
                    }
                })
            },
            moveout(key, evt) {
                const cusEvtProps = calcCusEventProps(evt, key)
                cusEvtProps && fireCustomEvent('hideCustomNode', {
                    ...cusEvtProps,
                    data: {
                        hoverMark: props.options.hoverMark?.btn
                    }
                })
            }
        }, {
            ...props.options,
            key: cKey,
        })

        return g
    }

    const group = new Konva.Group()
    if (extendWireLength > 0) {
        group.add(wire([
            inP, { x: inP.x, y: inP.y + extendWireLength }
        ], wireWidth, wireColor))
        group.add(wire([
            { x: inP.x, y: inP.y + extendWireLength + size.rectHeight },
            { x: inP.x, y: inP.y + extendWireLength * 2 + size.rectHeight }
        ], wireWidth, wireColor))
    }

    const _fillAndHoverColor = {
        fill: mapSwitchStateToFillColor(bState, colors?.fill),
        hoverFill: mapSwitchStateToHoverColor(bState, colors?.hover)
    }
    const { fill } = _fillAndHoverColor
    const rect = new Konva.Rect({
        x: start.x - size.rectWidth / 2,
        y: start.y,
        width: size.rectWidth,
        height: size.rectHeight,
        fill: fill,
        perfectDrawEnabled: false,
        cornerRadius: size.cornerRadius,
    })

    bindClick(rect, {
        movein: () => rect.fill(_fillAndHoverColor.hoverFill),
        moveout: () => rect.fill(_fillAndHoverColor.fill)
    }, {
        ...props.options,
        key: bKey
    })

    bindHover(rect, {
        movein: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.breaker
                }
            })
        },
        moveout: (key, evt) => {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: {
                    hoverMark: props.options.hoverMark?.breaker
                }
            })
        }
    }, {
        ...props.options,
        key: bKey
    })

    stateConsumerRegister && stateConsumerRegister(bKey, (newState: IDyn | undefined) => {
        const state = mapIDynToSwitchState(newState)
        _fillAndHoverColor.fill = mapSwitchStateToFillColor(state, colors?.fill)
        _fillAndHoverColor.hoverFill = mapSwitchStateToHoverColor(state, colors?.hover)
        rect.fill(_fillAndHoverColor.fill)
    })

    const buttonOriginX = start.x + (buttonPosition === 'left' ?
        -(size.button.width + size.rectWidth / 2 + size.button.marginLR) :
        size.rectWidth / 2 + size.button.marginLR)

    const remoteOnBtn = button(point(buttonOriginX, start.y), remoteText, 'on')
    const remoteOffBtn = button(point(buttonOriginX, start.y), remoteText, 'off')
    const remoteMissingBtn = button(point(buttonOriginX, start.y), remoteText, 'missing')
    const localOnBtn = button(point(buttonOriginX, start.y + size.button.height + size.button.marginTB), localText, 'on')
    const localOffBtn = button(point(buttonOriginX, start.y + size.button.height + size.button.marginTB), localText, 'off')
    const localMissingBtn = button(point(buttonOriginX, start.y + size.button.height + size.button.marginTB), localText, 'missing')

    const changeBtnState = (state?: CONTROL_STATE) => {
        const isRemote = state === CONTROL_STATE.REMOTE
        const isLocal = state === CONTROL_STATE.LOCAL
        const isMissing = state === CONTROL_STATE.BROKEN

        remoteOnBtn.opacity(isRemote ? 1 : 0)
        remoteOffBtn.opacity(isLocal ? 1 : 0)
        remoteMissingBtn.opacity(isMissing ? 1 : 0)
        localOnBtn.opacity(isLocal ? 1 : 0)
        localOffBtn.opacity(isRemote ? 1 : 0)
        localMissingBtn.opacity(isMissing ? 1 : 0)
    }
    changeBtnState(cState)
    group.add(rect, remoteOnBtn, remoteOffBtn, remoteMissingBtn, localOnBtn, localOffBtn, localMissingBtn)

    cKey && stateConsumerRegister && stateConsumerRegister(cKey, (newState: IDyn | undefined) => {
        const state = mapIDynToControlState(newState)
        changeBtnState(state)
    })

    return withLabel({
        origin: point(inP.x - size.rectWidth / 2 - (buttonPosition === 'left' ? size.button.marginLR + size.button.width : 0), inP.y),
        start: [inP],
        end: [point(inP.x, inP.y + containerHeight)],
        ele: group,
        rect: {
            width: actualEleWidth,
            height: size.rectHeight
        }
    }, Object.assign({ key: bKey }, props.options))
}

export default breaker