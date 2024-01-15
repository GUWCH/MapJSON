import React, { HTMLAttributes, useMemo } from 'react'
import styles from './index.module.scss'

export type HighlightTextProps = {
    highlight?: string
    customHighlightCls?: string
    children: string
} & HTMLAttributes<HTMLSpanElement>

const HighlightText: React.FC<HighlightTextProps> = ({
    highlight, customHighlightCls, children, ...rest
}) => {
    const textArr = useMemo(() => {
        if (highlight) {
            const arr = children.split(highlight)
            return arr.flatMap((v, i) => {
                return [v].concat(i === arr.length - 1 ? [] : [highlight])
            })
        }
        return [children]
    }, [children, highlight, customHighlightCls])

    return <span {...rest}>
        {textArr.map((t, i) => <React.Fragment key={i}>{
            t === highlight ?
                <span className={`${styles.highlight} ${customHighlightCls ?? ''}`}>{t}</span> : t
        }</React.Fragment>)}
    </span>
}

export default HighlightText