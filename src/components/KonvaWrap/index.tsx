import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BStools } from '@/common/utils';
import { clearLabelCache } from "DrawLib/utils"
import Konva from "konva"
import styles from "./index.module.scss"
import { Input, Tooltip, TooltipProps } from "antd";
import { CommonOptions, CusEvent, CusEventName, DomEleCommonProps, ElementInfo, Point } from "DrawLib/model";
import { KonvaEventObject } from "konva/lib/Node";
import { useStateCenter } from "./StateCenter";

export type ActualStageInfo = {
    width: number, height: number, scaleX: number, scaleY: number
}

export type KonvaDrawFunc = (
    stage: Konva.Stage, actualOpt: ActualStageInfo, options: {
        stateConsumerRegister?: CommonOptions['stateConsumerRegister'],
        domEleRegister?: CommonOptions['domEleRegister']
    }
) => void
export type KonvaWrapProps = {
    width?: number // 坐标系宽
    height?: number // 坐标系高
    stateMap?: { [key: string]: any }
    disableResize?: boolean // 关闭容器大小监听
    readyToDraw?: boolean // 手动限制draw函数执行
    reDrawOnVisibleChange?: boolean // 页面可见发生变化时重新执行draw函数, state驱动渲染不需要该功能
    /**
     * @warning 所有的Konva元素必须添加到stage或手动销毁，否则会导致内存溢出
     */
    draw: KonvaDrawFunc
    onInputCommit?: (key: string, value: string) => void
    cusTooltipNodeProvider?: (evt: ElementInfo<'showCustomNode'>) => React.ReactNode
}

type EvtInfo<T extends CusEventName> = {
    key?: string
    evt: ElementInfo<T>
    left: number
    top: number
    timestamp: number
    tooltipProps?: Partial<TooltipProps>;
} | null
const KonvaWrap: React.FC<KonvaWrapProps> = ({
    width = 260,
    height = 266,
    stateMap,
    readyToDraw = true,
    disableResize = false,
    reDrawOnVisibleChange = true,
    draw,
    onInputCommit,
    cusTooltipNodeProvider
}) => {

    const [mounted, setMounted] = useState(false);
    const [pageVisible, setPageVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<Konva.Stage>()

    const stateCenter = useStateCenter()
    const [domRenderFns, setDomRenderFns] = useState<ArgumentsType<CommonOptions['domEleRegister']>[]>([])

    const [inputEvtInfo, setInputEvtInfo] = useState<EvtInfo<'showInput'>>()
    const [fullTextEvtInfo, setFullTextEvtInfo] = useState<EvtInfo<'showFullText'>>()
    const [customNodeEvtInfo, setCustomNodeEvtInfo] = useState<EvtInfo<'showCustomNode'>>()
    const [hideCustomNodeTriggered, setHideTriggered] = useState(false)
    const hideTriggerTimerRef = useRef<number>()
    const [cursorInCustomNode, setInNode] = useState(false)
    const delayRef = useRef<any>();

    const id = useMemo(() => Array.from({ length: 12 }, (_, __) => {
        return Math.floor(Math.random() * 36).toString(36)
    }).join(""), [])

    const culcStageSize = (
        containerRect: { width: number, height: number },
        designRect: { width: number, height: number }
    ) => {
        const { width, height } = designRect
        const { width: parentWidth, height: parentHeight } = containerRect
        const WHRatio = width / height
        let canvasW: number;
        let canvasH: number;
        let scale: number;
        if (WHRatio > (parentWidth / parentHeight)) {
            canvasW = parentWidth
            canvasH = parentWidth / WHRatio
            scale = parentWidth / width
        } else {
            canvasW = parentHeight * WHRatio
            canvasH = parentHeight
            scale = parentHeight / height
        }

        return {
            width: canvasW,
            height: canvasH,
            scale: scale
        }
    }

    const calcEvtPosition = useCallback((evt: KonvaEventObject<any>) => {
        if (!containerRef.current) return
        const { left, top } = containerRef.current.getBoundingClientRect()
        const clientX = evt.evt.clientX
        const clientY = evt.evt.clientY
        return {
            left: clientX - left,
            top: clientY - top
        }
    }, []);

    // 初始化stage
    useEffect(() => {
        stageRef.current = new Konva.Stage({
            container: id,
            width: width,
            height: height,
        });
        setMounted(true);

        const pageVisibliltyChange = () => {
            setPageVisible(BStools.isVisible());
        }

        window.document.addEventListener('visibilitychange', pageVisibliltyChange);

        return () => {
            if (stageRef.current) {
                stageRef.current.destroyChildren();
                stageRef.current.clear()
                stageRef.current.width(0)
                stageRef.current.height(0)
                stageRef.current.destroy();
                stageRef.current = undefined;
            }
            window.document.removeEventListener('visibilitychange', pageVisibliltyChange);
        }
    }, [])

    // 注册容器大小监听
    useEffect(() => {
        if (!mounted || !containerRef.current || !stageRef.current || disableResize) return

        let lastResizeTimestamp = 0
        const observer = new ResizeObserver((entities) => {
            const ele = entities[0]
            const stage = stageRef.current
            if (stage) {
                const currentTimestamp = Date.now()
                lastResizeTimestamp = currentTimestamp
                window.setTimeout(() => {
                    if (currentTimestamp === lastResizeTimestamp) {
                        const size = culcStageSize(ele.contentRect, { width, height })
                        stage.width(size.width)
                        stage.height(size.height)
                        stage.scale({ x: size.scale, y: size.scale })
                        // 更新引用触发子元素渲染
                        setDomRenderFns(fns => Array.from(fns))
                    }
                }, 300)
            }
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
        }
    }, [mounted, width, height, disableResize])

    // 注册stage事件
    useEffect(() => {
        if (!mounted || !containerRef.current || !stageRef.current) return
        const stage = stageRef.current

        stage.on('showInput', (evt) => {
            const p = calcEvtPosition(evt)
            if (!p) return
            const { left, top } = p
            const cusEvt = evt as CusEvent<'showInput'>
            setInputEvtInfo({
                left: left - cusEvt.originOffsetX,
                top: top - cusEvt.originOffsetY,
                evt: cusEvt,
                timestamp: Date.now()
            })
        })

        stage.on('showFullText', (evt) => {
            const p = calcEvtPosition(evt)
            if (!p) return
            const { left, top } = p
            const cusEvt = evt as CusEvent<'showFullText'>
            cusEvt.eleActualWidth
            cusEvt.eleActualHeight
            setFullTextEvtInfo({
                left: left - cusEvt.originOffsetX + cusEvt.eleActualWidth / 2,
                top: top - cusEvt.originOffsetY,
                evt: cusEvt,
                timestamp: Date.now()
            })
        })
        stage.on('hideFullText', () => setFullTextEvtInfo(null))

        stage.on('showCustomNode', (evt) => {
            const p = calcEvtPosition(evt)
            if (!p) return
            const cusEvt = evt as CusEvent<'showCustomNode'>
            setCustomNodeEvtInfo({
                key: cusEvt.key,
                left: p.left - cusEvt.originOffsetX,
                top: p.top - cusEvt.originOffsetY,
                evt: cusEvt,
                tooltipProps: cusEvt.tooltipProps,
                timestamp: Date.now()
            })

            setHideTriggered(false)
            const timerId = hideTriggerTimerRef.current
            window.clearTimeout(timerId)
        })
        stage.on('hideCustomNode', () => {
            window.clearTimeout(hideTriggerTimerRef.current)
            hideTriggerTimerRef.current = window.setTimeout(() => {
                setHideTriggered(true)
            }, 500);
        })

        return () => {
            if (!mounted || !stageRef.current) return
            stage
                .removeEventListener('showInput')
                .removeEventListener('showFullText')
                .removeEventListener('hideFullText')
                .removeEventListener('showCustomNode')
                .removeEventListener('hideCustomNode')
                .removeEventListener('registerStateConsumer')
        }
    }, [mounted, stateCenter])

    // draw函数触发渲染
    useEffect(() => {
        /**后台绘制时GPU会不断增高, 不知是浏览器bug还是其机制使然 */
        if (!BStools.isVisible()) return;
        if (!mounted || !stageRef.current) return;
        if (!readyToDraw) return;
        stateCenter.changeReadyStatus(false)

        clearLabelCache()
        stageRef.current.destroyChildren()
        stageRef.current.getChildren().forEach(n => n.clear())
        stageRef.current.clearCache()
        stageRef.current.clear()
        stageRef.current.width(0)
        stageRef.current.height(0)

        const stage = stageRef.current

        stage.width(width)
        stage.height(height)
        stage.scale({ x: 1, y: 1 })

        const size = culcStageSize({
            width: containerRef.current!.clientWidth,
            height: containerRef.current!.clientHeight
        }, { width, height })

        const domBatch: typeof domRenderFns = []
        draw(stage, {
            width: size.width, height: size.height, scaleX: size.scale, scaleY: size.scale
        }, {
            stateConsumerRegister: (key, consumer) => {
                stateCenter.registerConsumer(key, consumer)
            },
            domEleRegister: (key, canvasProps, C) => {
                // @ts-ignore
                domBatch.push([key, canvasProps, C])
            }
        })
        stage.width(size.width)
        stage.height(size.height)
        stage.scale({ x: size.scale, y: size.scale })

        setDomRenderFns(domBatch)
        stateCenter.changeReadyStatus(true)
    }, [draw, stateCenter, mounted, reDrawOnVisibleChange && pageVisible, width, height, readyToDraw])

    // 触发state更新
    useEffect(() => {
        if (mounted && stateMap && BStools.isVisible()) {
            stateCenter.updateState(stateMap)
        }
    }, [mounted, stateMap, stateCenter, pageVisible])

    const handleInputCommit = () => {
        if (onInputCommit && inputEvtInfo && inputEvtInfo.evt.key) {
            onInputCommit(inputEvtInfo?.evt.key, inputEvtInfo?.evt.data)
            setInputEvtInfo(null)
        }
    }

    const transformLength = (l: number, direction: 'x' | 'y') => {
        const stage = stageRef.current
        if (!stage) return l
        if (direction === 'x') {
            return stage.scaleX() * l
        } else {
            return stage.scaleY() * l
        }
    }

    const transformPointToPosition = (p: Point) => {
        const containerEle = containerRef.current
        const canvasEle = document.getElementById(id)?.getElementsByTagName('div').item(0)

        if (!containerEle || !canvasEle) return { left: 0, top: 0 }

        const containerClientRect = containerEle.getBoundingClientRect()
        const canvasClientRect = canvasEle.getBoundingClientRect()
        return {
            top: canvasClientRect.top - containerClientRect.top + transformLength(p.y, 'y'),
            left: canvasClientRect.left - containerClientRect.left + transformLength(p.x, 'x')
        }
    }

    const clearDelay = () => {
        clearTimeout(delayRef.current);
    };

    const triggerOpen = (nextOpen: boolean, delay = 0) => {
        clearDelay();

        if (delay === 0) {
            setInNode(nextOpen);
        } else {
            delayRef.current = setTimeout(() => {
                setInNode(nextOpen);
            }, delay * 1000);
        }
    }

    /**delay保证popup上再有弹框展示等等 */
    const onPopupMouseLeave = () => {
        triggerOpen(false, 0.1);
    };

    const onPopupMouseEnter = () => {
        triggerOpen(true);
    };

    return <div className={styles.container}>
        <div id={id} ref={containerRef} className={styles.canvas_container} />
        {domRenderFns.map(([key, canvasProps, C]) => {
            const { origin, rect } = canvasProps
            const { top, left } = transformPointToPosition(origin)
            const commonProps: DomEleCommonProps = {
                width: transformLength(rect.width, 'x'),
                height: transformLength(rect.height, 'y'),
                top, left
            }
            const props = stateMap?.[key] ?? {}
            // @ts-ignore
            return <C key={key} {...commonProps} {...props} />
        })}
        {inputEvtInfo && onInputCommit && <Input className={styles.input}
            style={{
                left: inputEvtInfo.left,
                top: inputEvtInfo.top,
                width: Math.max(inputEvtInfo.evt.eleActualWidth, 50),
                height: Math.max(inputEvtInfo.evt.eleActualHeight, 20)
            }}
            width={20}
            value={inputEvtInfo.evt.data}
            autoFocus
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    handleInputCommit()
                }
            }}
            onBlur={handleInputCommit}
            onChange={(e) => setInputEvtInfo({
                ...inputEvtInfo,
                evt: {
                    ...inputEvtInfo.evt,
                    data: e.target.value
                }
            })} />}
        {fullTextEvtInfo && <Tooltip visible title={fullTextEvtInfo.evt.data}>
            <div className={styles.tooltips_holder} style={{
                left: fullTextEvtInfo.left,
                top: fullTextEvtInfo.top,
            }} />
        </Tooltip>}
        {customNodeEvtInfo && cusTooltipNodeProvider &&
            (!hideCustomNodeTriggered || cursorInCustomNode) &&
            <Tooltip
                key={customNodeEvtInfo.timestamp}
                visible
                title={<div onMouseEnter={onPopupMouseEnter} onMouseLeave={onPopupMouseLeave}>
                    {cusTooltipNodeProvider(customNodeEvtInfo.evt)}
                </div>}
                overlayStyle={{ maxWidth: 1000 }}
                {...(customNodeEvtInfo.tooltipProps || {})}
            >
                <div className={styles.tooltips_holder} style={{
                    left: customNodeEvtInfo.left,
                    top: customNodeEvtInfo.top,
                    width: customNodeEvtInfo.evt.eleActualWidth,
                    height: customNodeEvtInfo.evt.eleActualHeight,
                    pointerEvents: 'none',
                }} />
            </Tooltip>}
    </div>
}

export default KonvaWrap