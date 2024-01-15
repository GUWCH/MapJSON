import { ILayoutEleContent } from "DrawLib/model"
import { point, wire } from "DrawLib/utils"
import Konva from "konva"

export const getDebugFillRect = (color?: string, key?: string, optRect?: { width?: number, height?: number }): ILayoutEleContent<void, void> => ({
    key,
    drawFunc: (props) => {
        const rect = optRect || props.rect
        const { height = 10, width = 10 } = rect

        console.log('rect,props', rect, props);

        return {
            origin: props.start[0],
            start: props.start,
            end: [],
            rect: {
                width,
                height
            },
            ele: new Konva.Rect({
                x: props.start[0].x,
                y: props.start[0].y,
                fill: color || ('#' + Math.floor(Math.random() * 16777215).toString(16)),
                width: width,
                height: height
            })
        }
    }
})

export const getFillRect = (optRect?: { width?: number, height?: number }): ILayoutEleContent<void, void> => ({
    drawFunc: (props) => {
        const rect = optRect || props.rect
        const { height = 10, width = 10 } = rect
        return {
            origin: props.start[0],
            start: props.start,
            end: [],
            rect: {
                width,
                height
            },
            ele: new Konva.Rect({
                x: props.start[0].x,
                y: props.start[0].y,
                width: width,
                height: height
            })
        }
    }
})

export const getFillPoint = (
    key: string,
    positionX: 'left' | 'right' | 'center' | number = 'center',
    positionY: 'top' | 'bottom' | 'center' | number = 'center'
): ILayoutEleContent<void, void> => ({
    key,
    drawFunc: (props) => {
        const { height = 0, width = 0 } = props.rect
        const originStart = props.start[0]
        let x: number = originStart.x
        let y: number = originStart.y
        if (positionX === 'left') {
            x = x
        } else if (positionX === 'right') {
            x += width
        } else if (positionX === 'center') {
            x += width / 2
        } else {
            x += positionX
        }

        if (positionY === 'top') {
            y = y
        } else if (positionY === 'bottom') {
            y += height
        } else if (positionY === 'center') {
            y += height / 2
        } else {
            y += positionY
        }

        const p = point(x, y)
        return {
            origin: props.start[0],
            start: [p],
            end: [p],
            rect: { width: 0, height: 0 },
            ele: new Konva.Group()
        }
    }
})
export const getFillWire = (
    key: string,
    direction: 'col' | 'row',
    position: 'start' | 'end' | 'center' | number = 'center',
    wireWidth?: number,
    wireColor?: string
): ILayoutEleContent<void, void> => ({
    key,
    drawFunc: (props) => {
        const { height = 0, width = 0 } = props.rect
        const origin = props.start[0]

        let offset: number = direction === 'col' ? width : height
        if (position === 'start') {
            offset = 0
        } else if (position === 'end') {
            offset = offset
        } else if (position === 'center') {
            offset = offset / 2
        } else {
            offset = position
        }

        const wireLength = direction === 'col' ? height : width
        const inP = point(
            origin.x + (direction === 'col' ? offset : 0),
            origin.y + (direction === 'row' ? offset : 0)
        )
        const outP = point(
            inP.x + (direction === 'row' ? wireLength : 0),
            inP.y + (direction === 'col' ? wireLength : 0)
        )

        return {
            origin: origin,
            start: [inP],
            end: [outP],
            rect: { width, height },
            ele: wire([inP, outP], wireWidth, wireColor)
        }
    }
})