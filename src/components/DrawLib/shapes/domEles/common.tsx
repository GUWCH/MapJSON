import React from "react";
import { DomEleCommonProps, ShapeElement, ShapeProps } from "../../model";
import Konva from "konva";

export const eleContainer = <T extends DomEleCommonProps>(Wrapped: React.ComponentType<T>) => (props: T) => <div style={{
    position: 'absolute',
    width: props.width + 'px',
    height: props.height + 'px',
    top: props.top + 'px',
    left: props.left + 'px'
}}>
    {
        // @ts-ignore
        <Wrapped {...props} />
    }
</div>

export const domEleWrapper = <T extends DomEleCommonProps> (C: React.ComponentType<T>) => {
    return (props: ShapeProps<undefined, undefined>): ShapeElement => {
        const { domEleRegister: register } = props.options
    
        const { width = 10, height = 10 } = props.rect
        register && register(
            props.options.key ?? (Math.random() * 6).toFixed(0), {
            rect: { width, height },
            origin: props.start[0]
        }, C)
    
        return {
            origin: props.start[0],
            start: props.start,
            end: [],
            ele: new Konva.Rect({
                x: props.start[0].x,
                y: props.start[0].y,
                width, height,
            }),
            rect: {
                width,
                height
            }
        }
    }
}