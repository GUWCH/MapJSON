import { KonvaElement, ShapeDrawFunc } from "DrawLib/model";
import { calcCusEventProps, fireCustomEvent } from "DrawLib/utils";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { TextConfig } from "konva/lib/shapes/Text";

export type LabelOptions = {
    editable?: boolean
    disableEcllipsis?: boolean,
} & TextConfig

const label: ShapeDrawFunc<string, LabelOptions> = (props) => {
    const origin = props.start[0]
    const opt = props.options
    const { key, stateConsumerRegister } = opt

    const t = new Konva.Text({
        x: origin.x,
        y: origin.y,
        height: props.rect.height,
        width: props.rect.width,
        fontSize: 14,
        fontFamily: 'Arial-Black, Arial',
        align: 'center',
        verticalAlign: 'middle',
        text: props.state,
        fill: 'white',
        wrap: opt.disableEcllipsis ? undefined : 'none',
        ellipsis: !opt.disableEcllipsis,
        ...opt
    })

    const _state = {
        text: props.state
    }
    if (opt.editable && key) {
        t.on('click', (ev) => {
            const cusEvt = calcCusEventProps(ev, key)
            cusEvt && fireCustomEvent('showInput', { ...cusEvt, data: _state.text })
        })
    }

    if (!opt.disableEcllipsis) {
        t.on('mouseover', (ev) => {
            const cusEvt = calcCusEventProps(ev, key)
            if(_state.text){
                cusEvt && fireCustomEvent('showFullText', { ...cusEvt, data: _state.text })
            }
        })
        t.on('mouseout', (ev) => {
            const cusEvt = calcCusEventProps(ev, key)
            cusEvt && fireCustomEvent('hideFullText', { ...cusEvt, data: undefined })
        })
    }

    if (key && stateConsumerRegister) {
        stateConsumerRegister(key, (newState: IDyn | undefined) => {
            const text = newState?.wf_name ?? ''
            t.text(text)
            _state.text = text
        })
    }

    return {
        origin: origin,
        start: [origin],
        end: [],
        ele: t,
        rect: {
            width: props.rect.width || t.fontSize() * props.state.length,
            height: props.rect.height || t.fontSize()
        }
    }
}

export default label