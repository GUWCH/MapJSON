import React, { useState, useEffect, ReactNode, useRef } from 'react'
import styles from './ButtonRadioGroup.module.scss'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'

export type RadioOption = {
    label: ReactNode
    value: string
}
export type ButtonRadioProps = {
    containerCls?: string
    options: RadioOption[]
    defaultValue?: string
    value?: string | null
    noWrap?: boolean
    onChange: (v: string | null) => void
}

const ButtonRadio: React.FC<ButtonRadioProps> = ({
    containerCls, defaultValue, value, options, noWrap, onChange
}) => {
    const [current, setCurrent] = useState<string | null>(null)

    useEffect(() => {
        if (value !== undefined) {
            setCurrent(value)
        }
    }, [value])

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined) {
            setCurrent(defaultValue)
            onChange(defaultValue)
        }
    }, [options])

    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollInfo, setScrollInfo] = useState<{
        width: number,
        scrollWidth: number
    }>()
    const [scrollLength, setScrollLength] = useState(0)
    const showLeftArrow = scrollLength > 0
    const showRightArrow = scrollInfo &&
        scrollInfo.scrollWidth > scrollInfo.width &&
        Math.floor(scrollLength) < Math.floor(scrollInfo.scrollWidth - scrollInfo.width)

    useEffect(() => {
        const scrollEle = scrollRef.current
        if (scrollEle) {
            const initScrollInfo = (ele: Element) => {
                setScrollInfo({
                    width: ele.getBoundingClientRect().width,
                    scrollWidth: ele.scrollWidth
                })
                setScrollLength(0)
            }

            const ob = new ResizeObserver((entries) => {
                const e = entries[0]
                if (e) {
                    initScrollInfo(e.target)
                }
            })

            ob.observe(scrollEle)
            return () => ob.disconnect()
        }
    }, [noWrap])

    const handleScrollChange = (delta: number) => {
        setScrollLength(l => {
            if (scrollInfo) {
                const newL = Math.floor(Math.max(l + delta, 0))
                const maxL = scrollInfo.scrollWidth - scrollInfo.width
                return Math.min(Math.floor(maxL), newL)
            }
            return 0
        })
    }

    const [triggerMove, setTrigger] = useState<'left' | 'right' | null>(null)
    useEffect(() => {
        const moveToLeft = () => {
            handleScrollChange(-10)
        }
        const moveToRight = () => {
            handleScrollChange(10)
        }
        let moveTimer: number | undefined = undefined

        if (triggerMove === 'left') {
            moveTimer = window.setInterval(moveToLeft, 100)
        }

        if (triggerMove === 'right') {
            moveTimer = window.setInterval(moveToRight, 100)
        }

        if (triggerMove === null) {
            window.clearInterval(moveTimer)
            moveTimer = undefined
        }

        return () => window.clearInterval(moveTimer)
    }, [triggerMove])

    return <div ref={scrollRef} className={`${styles.wrapper} ${containerCls ?? ''} ` +
        ` ${showLeftArrow ? styles['overflow-left'] : ''} ${showRightArrow ? styles['overflow-right'] : ''}`}
        onWheel={e => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            handleScrollChange(delta)
        }}
    >
        <div className={styles['arrow-left']} onMouseDownCapture={() => setTrigger('left')} onMouseUpCapture={() => setTrigger(null)}>
            <FontIcon type={iconsMap.CARET_LEFT} />
        </div>
        <div className={styles.container} style={{
            flexWrap: noWrap ? 'nowrap' : 'wrap',
            transform: `translateX(${-scrollLength}px)`
        }}>
            {options.map(o => <div key={o.value}
                className={`${styles.option} ${o.value === current ? styles.checked : ''}`}
                onClick={() => {
                    setCurrent(o.value)
                    onChange(o.value)
                }}>
                <div>
                    {o.label}
                </div>
            </div>)}
        </div>
        <div className={styles['arrow-right']} onMouseDownCapture={() => setTrigger('right')} onMouseUpCapture={() => setTrigger(null)}>
            <FontIcon type={iconsMap.CARET_RIGHT} />
        </div>
    </div>
}

export default ButtonRadio