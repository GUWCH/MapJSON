import { CommonOptions, KonvaElement, Point, ShapeElement } from "DrawLib/model";
import label from "DrawLib/shapes/label";
import { point } from "DrawLib/utils";
import Konva from "konva";

export const withLabel = <T extends ShapeElement | Konva.Shape>(ele: T, opt: Pick<CommonOptions, 'key' | 'label' | 'stateConsumerRegister'>):
    T extends ShapeElement ? ShapeElement : Konva.Group => {
    const labelProps = opt.label
    const key = opt.key
    if (labelProps && key) {
        const { text, width, fontSize = 16, position = 'right', editable, margin = 2, positionProvider } = labelProps

        const isShapeElement = 'origin' in ele
        let shapeOrigin: Point
        let shapeHeight: number
        let shapeWidth: number
        if (isShapeElement) {
            shapeOrigin = ele.origin
            const { width, height } = ele.rect
            shapeHeight = height
            shapeWidth = width
        } else {
            shapeOrigin = point(ele.x(), ele.y())
            shapeHeight = ele.height()
            shapeWidth = ele.width()
        }

        let labelOrigin: Point
        let align: string = 'left'

        if (positionProvider) {
            labelOrigin = isShapeElement ? positionProvider(ele.ele) : positionProvider(ele)
        } else {
            switch (position) {
                case 'top': {
                    labelOrigin = point(shapeOrigin.x + shapeWidth / 2, shapeOrigin.y - fontSize - margin)
                    align = 'center'
                    break;
                }
                case 'bottom': {
                    labelOrigin = point(shapeOrigin.x + shapeWidth / 2, shapeOrigin.y + shapeHeight + fontSize + margin)
                    align = 'center'
                    break;
                }
                case 'left': {
                    labelOrigin = point(shapeOrigin.x - margin - text.length * fontSize, shapeOrigin.y + shapeHeight / 2 - fontSize / 2)
                    break;
                }
                default: //right
                    labelOrigin = point(shapeOrigin.x + shapeWidth + margin, shapeOrigin.y + shapeHeight / 2 - fontSize / 2)
                    break;
            }
        }

        const labelEle = label({
            start: [labelOrigin],
            rect: {
                width
            },
            state: text,
            options: {
                key,
                editable,
                fontSize,
                align,
                stateConsumerRegister: opt.stateConsumerRegister
            }
        })

        const wrapper = new Konva.Group()
        wrapper.add(labelEle.ele)
        if (isShapeElement) {
            wrapper.add(ele.ele)
            return {
                ...ele,
                ele: wrapper
            } as unknown as T extends ShapeElement ? ShapeElement : Konva.Group
        } else {
            wrapper.add(ele)
            return wrapper as T extends ShapeElement ? ShapeElement : Konva.Group
        }
    }
    return ele as unknown as T extends ShapeElement ? ShapeElement : Konva.Group
}