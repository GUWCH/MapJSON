import WidgetContext from '../common/context';
import React, { useState } from 'react'
import styles from './TextArea.module.scss'
import { CommonDefaultCfg, i18n, ICommonFormCfg } from './common';
import EditModal from './EditModal';
import { notify } from 'Notify';
import msg from '@/common/lang';
const isZh = msg.isZh

/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type ITextAreaFormCfg = ICommonFormCfg & {
    fontSize?: number
    lineHeight?: number
}

export const TextAreaDefaultCfg: ITextAreaFormCfg = Object.assign({}, CommonDefaultCfg, { fontSize: 14, lineHeight: 16 })

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type ITextAreaOptions = ITextAreaFormCfg

export const TextAreaDefaultOptions: ITextAreaOptions = TextAreaDefaultCfg

export const TextAreaWidget: WidgetElement<ITextAreaFormCfg> = (props) => {
    const { configure, isDemo, pageId, id } = props
    const {
        content = '',
        contentEn = '',
        fontSize = 14,
        lineHeight = 16,
        bold,
        fontFamily,
        color,
        letterSpacing
    } = configure

    const finalContent = isZh ? content : contentEn

    return <WidgetContext.Provider
        value={{
            componentId: props.id!,
            isDemo: !!isDemo,
            widgetName: 'Text',
            pageId: pageId
        }}
    >
        <div className={styles.text} style={{
            fontWeight: bold ? 'bold' : undefined,
            color: color,
            fontFamily,
            fontSize: fontSize ? `${fontSize}px` : undefined,
            lineHeight: lineHeight ? `${lineHeight}px` : undefined,
            letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined
        }}>
            {finalContent}
        </div>
    </WidgetContext.Provider>
}