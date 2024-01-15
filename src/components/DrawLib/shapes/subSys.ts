import { DEFAULT_COLOR } from "DrawLib/constant";
import { ColorMap, ShapeElement, ShapeProps } from "DrawLib/model";
import { calcCusEventProps, fireCustomEvent, mapRunStateToFillColor } from "DrawLib/utils";
import { bindClick } from "DrawLib/wrapper/eventHandlerWrapper";
import Konva from "konva";

export type SubSysOptions = {
    colorMap?: ColorMap
}

export enum SubSysType {
    sys,
    turbine,
    matric
}

export type SubSysState = {
    type: SubSysType
    name: string
    state: string | number
}

const subSys = (props: ShapeProps<SubSysState, SubSysOptions>): ShapeElement<undefined> => {
    const designRect = {
        height: 26
    }

    const _state = props.state
    const { name } = _state
    const { key, stateConsumerRegister } = props.options
    const wireWidth = props.options.wireWidth || 2
    const scale = (props.rect.height ?? 0) / designRect.height
    const size = {
        height: designRect.height * scale,
        fontSize: 10 * scale,
        iconSize: 10 * scale,
        paddingLR: 6 * scale,
        iconMarginTop: 8 * scale,
        maxWidth: 120 * scale
    }

    const start = props.start[0]

    const g = new Konva.Group()

    const text = new Konva.Text({
        perfectDrawEnabled: false,
        text: name,
        height: size.height,
        verticalAlign: 'middle',
        fontSize: size.fontSize,
        wrap: 'none'
    })
    g.add(text)
    let textW: number
    const textActualW = text.measureSize(name).width
    const textMaxW = size.maxWidth - 2 * size.paddingLR - (size.iconSize + size.paddingLR)
    if (textActualW > textMaxW) {
        text.width(textMaxW)
        text.ellipsis(true)
        textW = textMaxW
    } else {
        textW = textActualW
    }

    const rectWidth = size.paddingLR * 2 + size.iconSize + size.paddingLR + textW
    const rectOrigin = {
        x: start.x + ((props.rect.width ?? 0) - rectWidth) / 2,
        y: start.y
    }
    const rect = new Konva.Rect({
        ...rectOrigin,
        perfectDrawEnabled: false,
        width: rectWidth,
        height: size.height,
        strokeWidth: wireWidth
    })
    g.add(rect)

    const path = new Konva.Path({
        perfectDrawEnabled: false,
        x: rect.x() + size.paddingLR,
        y: rect.y() + size.iconMarginTop,
        scale: { x: scale, y: scale }
    })
    g.add(path)

    text.x(path.x() + size.iconSize + size.paddingLR)
    text.y(rect.y() + wireWidth / 2)

    bindClick(g, {
        movein: (key, evt) => {
            g.opacity(0.8)
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...cusEvtProps,
                data: {
                    name
                }
            })
        },
        moveout: (key, evt) => {
            g.opacity(1)
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: undefined
            })
        }
    }, props.options)

    g.add(path)

    const updateState = (newState: SubSysState | ((old: SubSysState) => SubSysState)) => {
        const _newState = typeof newState === 'function' ? newState(_state) : newState
        const color = props.options?.colorMap?.[_newState.state] ?? DEFAULT_COLOR.MISSING
        text.fill(color)
        rect.stroke(color)
        path.fill(color)
        switch (_newState.type) {
            case SubSysType.matric: {
                path.data('M9.95372914,0.666666667 C10.1187279,0.666666667 10.2588986,0.787379863 10.2833746,0.950553182 L11.3833746,8.28388652 C11.4106833,8.46594467 11.2852341,8.63567006 11.103176,8.66297878 C11.0868081,8.66543396 11.0702801,8.66666667 11.0537291,8.66666667 L6.66593753,8.66666667 L6.66593753,9.99966667 L9,10 C9.16108305,10 9.2954791,10.1142607 9.32656118,10.266155 L9.33333333,10.3333333 L9.33333333,11 C9.33333333,11.1840949 9.18409492,11.3333333 9,11.3333333 L9,11.3333333 L3,11.3333333 C2.81590508,11.3333333 2.66666667,11.1840949 2.66666667,11 L2.66666667,11 L2.66666667,10.3333333 C2.66666667,10.1492384 2.81590508,10 3,10 L3,10 L5.33293753,9.99966667 L5.33293753,8.66666667 L0.94627086,8.66666667 C0.762175943,8.66666667 0.612937526,8.51742825 0.612937526,8.33333333 C0.612937526,8.31678236 0.61417023,8.30025437 0.616625409,8.28388652 L1.71662541,0.950553182 C1.74110141,0.787379863 1.88127205,0.666666667 2.04627086,0.666666667 L9.95372914,0.666666667 Z M9.09254172,2 L2.90745828,2 L2.10745828,7.33333333 L9.89254172,7.33333333 L9.09254172,2 Z M5.66633333,4.99966667 L5.66633333,6.66666667 L2.93333333,6.66666667 L3.15533333,4.99966667 L5.66633333,4.99966667 Z M8.84433333,4.99966667 L9.06666667,6.66666667 L6.33233333,6.66666667 L6.33233333,4.99966667 L8.84433333,4.99966667 Z M5.66633333,2.66666667 L5.66633333,4.33266667 L3.24433333,4.33266667 L3.46666667,2.66666667 L5.66633333,2.66666667 Z M8.53333333,2.66666667 L8.75533333,4.33266667 L6.33233333,4.33266667 L6.33233333,2.66666667 L8.53333333,2.66666667 Z')
                break;
            }
            case SubSysType.turbine: {
                path.data('M6.29166667,0.666666667 C6.49877345,0.666666667 6.66666667,0.834559885 6.66666667,1.04166667 L6.66713165,4.11396822 C7.44368367,4.38865707 8,5.12936121 8,6 C8,6.12499261 7.98853393,6.24730717 7.96659625,6.36594924 L11.2047262,8.23514973 C11.384086,8.33870312 11.4455391,8.56804952 11.3419858,8.74740926 L11.0503191,9.25259074 C10.9467657,9.43195048 10.7174193,9.49340366 10.5380596,9.38985027 L7.29953508,7.52031504 C7.11481899,7.67835614 6.90095942,7.80332016 6.66713165,7.88603178 L6.66571115,10.6666667 L8.29166667,10.6666667 C8.49877345,10.6666667 8.66666667,10.8345599 8.66666667,11.0416667 L8.66666667,11.625 C8.66666667,11.8321068 8.49877345,12 8.29166667,12 L3.70833333,12 C3.50122655,12 3.33333333,11.8321068 3.33333333,11.625 L3.33333333,11.0416667 C3.33333333,10.8345599 3.50122655,10.6666667 3.70833333,10.6666667 L5.33271115,10.6666667 L5.33286835,7.88603178 C5.09909004,7.80333765 4.88527147,7.678409 4.70058212,7.52041531 L1.46194044,9.38985027 C1.2825807,9.49340366 1.0532343,9.43195048 0.949680911,9.25259074 L0.658014244,8.74740926 C0.554460853,8.56804952 0.615914037,8.33870312 0.79527377,8.23514973 L4.03340375,6.36594924 C4.01146607,6.24730717 4,6.12499261 4,6 C4,5.12936121 4.55631633,4.38865707 5.33286835,4.11396822 L5.33333333,1.04166667 C5.33333333,0.834559885 5.50122655,0.666666667 5.70833333,0.666666667 L6.29166667,0.666666667 Z M6,5.33333333 C5.63181017,5.33333333 5.33333333,5.63181017 5.33333333,6 C5.33333333,6.36818983 5.63181017,6.66666667 6,6.66666667 C6.36818983,6.66666667 6.66666667,6.36818983 6.66666667,6 C6.66666667,5.63181017 6.36818983,5.33333333 6,5.33333333 Z')
                break;
            }
            default: {
                path.data('M0.333333333,11.3333333 C0.149238417,11.3333333 2.2545125e-17,11.1840949 0,11 L0,11 L0,10.3333333 C1.43988329e-16,10.1492384 0.149238417,10 0.333333333,10 L0.333333333,10 L0.666,9.99997935 L0.666666667,1 C0.666666667,0.815905083 0.815905083,0.666666667 1,0.666666667 L7,0.666666667 C7.18409492,0.666666667 7.33333333,0.815905083 7.33333333,1 L7.333,4.66597935 L9,4.66666667 C9.16108305,4.66666667 9.2954791,4.78092733 9.32656118,4.93282171 L9.33333333,5 L9.33333333,8.66666667 L10,8.66666667 L10,4 C9.44771525,4 9,3.55228475 9,3 C9,2.75031726 9.09150669,2.52200705 9.24281307,2.34677637 L8.49595083,1.72554232 C8.35452519,1.60768763 8.33541717,1.39749939 8.45327187,1.25607376 L8.45327187,1.25607376 L8.88006147,0.74392624 C8.99791616,0.602500608 9.20810439,0.583392586 9.34953003,0.70124728 L9.34953003,0.70124728 L11.2133948,2.25446792 C11.2893923,2.3177992 11.3333333,2.41161507 11.3333333,2.51054168 L11.3333333,2.51054168 L11.3333333,9.66666667 C11.3333333,9.85076158 11.1840949,10 11,10 L11,10 L8.33333333,10 C8.14923842,10 8,9.85076158 8,9.66666667 L8,9.66666667 L8,6 L7.333,5.99997935 L7.333,9.99997935 L7.66666667,10 C7.82774972,10 7.96214576,10.1142607 7.99322785,10.266155 L8,10.3333333 L8,11 C8,11.1840949 7.85076158,11.3333333 7.66666667,11.3333333 L7.66666667,11.3333333 Z M6,2 L2,2 L2,10 L6,10 L6,2 Z M4.30986288,5.4045368 C4.39032165,5.46773039 4.43730406,5.56437233 4.43730406,5.6666809 L4.43730406,6.70262046 L5.13468187,6.70262046 C5.31877679,6.70262046 5.4680152,6.85185887 5.4680152,7.03595379 C5.4680152,7.10372089 5.44736016,7.16987832 5.4088033,7.22560756 L4.37051435,8.72632775 C4.26577146,8.87772084 4.05813223,8.91553829 3.90673914,8.8107954 C3.81675829,8.74854121 3.76305959,8.64609125 3.76305959,8.53667398 L3.76305959,7.6272091 L2.82996761,7.61778601 C2.64588208,7.61592697 2.49815832,7.46518911 2.50001736,7.28110358 C2.50075972,7.20759367 2.52578193,7.13639104 2.57118959,7.07857752 L3.84182662,5.46078875 C3.95553772,5.31601056 4.16508469,5.2908257 4.30986288,5.4045368 Z M5,3.33333333 C5.18409492,3.33333333 5.33333333,3.48257175 5.33333333,3.66666667 L5.33333333,3.66666667 L5.33333333,4.33333333 C5.33333333,4.51742825 5.18409492,4.66666667 5,4.66666667 L5,4.66666667 L3,4.66666667 C2.81590508,4.66666667 2.66666667,4.51742825 2.66666667,4.33333333 L2.66666667,4.33333333 L2.66666667,3.66666667 C2.66666667,3.48257175 2.81590508,3.33333333 3,3.33333333 L3,3.33333333 Z')
            }
        }

        _state.name = _newState.name
        _state.state = _newState.state
        _state.type = _newState.type
    }

    updateState(_state)
    key && stateConsumerRegister && stateConsumerRegister(key, (newState: SubSysState | ((old: SubSysState) => SubSysState)) => {
        updateState(newState)
    })

    return {
        origin: rectOrigin,
        start: [start],
        end: [],
        ele: g,
        rect: {
            width: 0,
            height: size.height
        }
    }
}

export default subSys