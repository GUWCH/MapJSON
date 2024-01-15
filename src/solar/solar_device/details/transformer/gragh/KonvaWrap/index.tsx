import Konva from "konva"
import React, { useLayoutEffect, useRef } from "react"
import styles from "./index.module.scss"

export type KonvaDrawFunc = (stage: Konva.Stage) => void
export type KonvaWrapProps = {
    width?: number // 坐标系宽
    height?: number // 坐标系高
    draw: KonvaDrawFunc
}

const KonvaWrap = ({ width = 260, height = 266, draw }) => {

    const containerRef = useRef<HTMLDivElement>(null)

    const id = Array.from({ length: 12 }, (_, __) => {
        return Math.floor(Math.random() * 36).toString(36)
    }).join("")

    useLayoutEffect(() => {
        const containerEle = containerRef.current
        if (containerEle) {
            const stage = new Konva.Stage({
                container: id,
                width: width,
                height: height,
            });

            draw(stage)

            const updateScale = () => {
                const parentWidth = containerRef.current!.clientWidth;
                const parentHeight = containerRef.current!.clientHeight;
                const WHRatio = width / height
                if (WHRatio > (parentWidth / parentHeight)) {
                    stage.width(parentWidth)
                    stage.height(parentWidth / WHRatio)
                    const scale = parentWidth / width
                    stage.scale({ x: scale, y: scale })
                } else {
                    stage.width(parentHeight * WHRatio)
                    stage.height(parentHeight)
                    const scale = parentHeight / height
                    stage.scale({ x: scale, y: scale })
                }
            }

            updateScale()
            window.addEventListener("resize", updateScale)

            return () => {
                window.removeEventListener("resize", updateScale)
            }
        }
    })

    return <div id={id} ref={containerRef} className={styles.container} />
}

export default KonvaWrap