import { CommonOptions, KonvaElement, ShapeElement } from "DrawLib/model";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";

export const bindClick = (
    ele: KonvaElement,
    handler: {
        click?: (key: string, ev: KonvaEventObject<MouseEvent>, opt?: any) => void,
        movein?: (key: string, ev: KonvaEventObject<MouseEvent>) => void,
        moveout?: (key: string, ev: KonvaEventObject<MouseEvent>) => void
    },
    opt?: CommonOptions
) => {
    const click = handler.click || opt?.eventHandlers?.click
    const key = opt?.key
    if (key && click) {
        const removeHoverFn = bindHover(ele, {
            movein: (key, ev) => {
                const container = ev?.target?.getStage()?.container();
                container && (container.style.cursor = "pointer")
                handler.movein && handler.movein(key, ev)
            },
            moveout: (key, ev) => {
                const container = ev?.target?.getStage()?.container();
                container && (container.style.cursor = "default")
                handler.moveout && handler.moveout(key, ev)
            }
        }, opt)
        ele.on('click', (ev: KonvaEventObject<MouseEvent>) => click(key, ev, opt))
        return () => {
            ele.removeEventListener('click')
            removeHoverFn && removeHoverFn()
        }
    }
}

/**
 * Konva 事件无法有效冒泡，事件触发矩形绘制在原图形下层，默认同时在图形上绑定事件
 */
export const clickable = (
    shape: ShapeElement,
    handler: {
        click?: (key: string, ev: KonvaEventObject<MouseEvent>, opt?: any) => void,
        movein?: (key: string, ev: KonvaEventObject<MouseEvent>) => void,
        moveout?: (key: string, ev: KonvaEventObject<MouseEvent>) => void
    },
    opt?: CommonOptions & {
        preventTriggerByShape?: boolean // 阻止图形本身触发点击 default false
    }
): ShapeElement => {
    const click = handler.click || opt?.eventHandlers?.click
    const key = opt?.key

    if (click && key) {
        const wrapper = new Konva.Group()
        const hitZone = new Konva.Rect({
            x: shape.origin.x,
            y: shape.origin.y,
            width: shape.rect.width,
            height: shape.rect.height,
        })
        bindClick(hitZone, handler, opt)

        if (!opt.preventTriggerByShape) {
            bindClick(shape.ele, handler, opt)
        }

        wrapper.add(hitZone)
        wrapper.add(shape.ele)
        return {
            ...shape,
            ele: wrapper
        }
    }
    return shape
}

export const bindHover = (
    ele: KonvaElement,
    handler: {
        movein?: (key: string, ev: KonvaEventObject<MouseEvent>) => void,
        moveout?: (key: string, ev: KonvaEventObject<MouseEvent>) => void
    },
    opt?: CommonOptions
) => {
    const over = handler.movein || opt?.eventHandlers?.mouseover
    const out = handler.moveout || opt?.eventHandlers?.mouseout
    const key = opt?.key

    if (key && over && out) {
        ele.on("mouseover", (ev: KonvaEventObject<MouseEvent>) => {
            handler.movein && handler.movein(key, ev)
        })
        ele.on("mouseleave", (ev: KonvaEventObject<MouseEvent>) => {
            handler.moveout && handler.moveout(key, ev)
        })

        return () => {
            ele.removeEventListener('mouseover').removeEventListener('mouseleave')
        }
    }
    return () => {};
}

export const hoverable = (
    shape: ShapeElement,
    handler: {
        movein?: (key: string, ev: KonvaEventObject<MouseEvent>) => void,
        moveout?: (key: string, ev: KonvaEventObject<MouseEvent>) => void
    },
    opt?: CommonOptions & {
        preventTriggerByShape?: boolean // 阻止图形本身触发点击 default false
    }
): ShapeElement => {
    const over = handler.movein || opt?.eventHandlers?.mouseover
    const out = handler.moveout || opt?.eventHandlers?.mouseout
    const key = opt?.key

    if (over && out && key) {
        const wrapper = new Konva.Group()
        const hitZone = new Konva.Rect({
            x: shape.origin.x,
            y: shape.origin.y,
            width: shape.rect.width,
            height: shape.rect.height,
        })
        bindHover(hitZone, handler, opt)

        if (!opt.preventTriggerByShape) {
            bindHover(shape.ele, handler, opt)
        }

        wrapper.add(hitZone)
        wrapper.add(shape.ele)
        return {
            ...shape,
            ele: wrapper
        }
    }
    return shape
}