import WidgetContext from '../common/context';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Text.module.scss'
import { CommonDefaultCfg, ICommonFormCfg } from './common';
import msg from '@/common/lang';
import _ from 'lodash';
const isZh = msg.isZh

/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type ITextFormCfg = ICommonFormCfg & {
    scaleWidth?: boolean
}

export const TextDefaultCfg: ITextFormCfg = Object.assign({}, CommonDefaultCfg)

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type ITextOptions = ITextFormCfg

export const TextDefaultOptions: ITextOptions = TextDefaultCfg

export const TextWidget: WidgetElement<ITextFormCfg> = (props) => {
    const { configure, isDemo, pageId, width, tplContainerWidth } = props
    const {
        content = '',
        contentEn = '',
    } = configure

    const finalContent = isZh ? content : contentEn

    const [fontSize, setFontSize] = useState<string>()
    const ref = useRef<HTMLDivElement>(null!)
    const updateFontSize = useCallback(_.debounce((size: string) => setFontSize(size), 300), [])

    useEffect(() => {
        const ob = new ResizeObserver(([ele]) => {
            const height = ele.contentRect.height
            updateFontSize((height * 0.6).toFixed(0) + 'px')
        })
        ob.observe(ref.current)
        return () => {
            ob.disconnect()
        }
    }, [])

    return <WidgetContext.Provider
        value={{
            componentId: props.id!,
            isDemo: !!isDemo,
            widgetName: 'Text',
            pageId: pageId
        }}
    >
        <div className={styles.container} ref={ref}>
            {fontSize && <div className={styles.text} style={{
                fontWeight: configure.bold ? 'bold' : undefined,
                color: configure.color,
                fontSize: fontSize,
                fontFamily: configure.fontFamily,
                letterSpacing: configure.letterSpacing ? `${configure.letterSpacing}px` : undefined
            }}>
                {finalContent}
            </div>}
        </div>
    </WidgetContext.Provider>
}