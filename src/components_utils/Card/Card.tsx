import React, { CSSProperties, ReactNode } from "react";
import msg from "@/common/lang";
import {defaultCardProps} from './form';
import styles from './style.mscss';

export interface PageCardConfig {
    title?: string, 
    title_en?: string, 
    // TODO 零散配置聚合起来防止和其它配置字段有重叠冲突
    styleDefine?: {
        needTitleSign?: boolean,
        titleSignColor?:string,
        bg_enable?: boolean,
        bg_color?: string,
        divide_enable?: boolean,
        divide_color?: string,
        divide_loc?: ('top' | 'right' | 'bottom' | 'left')[]
    },
    needTitleSign?: boolean,
    titleSignColor?:string,
    bg_enable?: boolean,
    bg_color?: string,
    divide_enable?: boolean,
    divide_color?: string,
    divide_loc?: ('top' | 'right' | 'bottom' | 'left')[]
}

interface IPageCard extends PageCardConfig {
    className?: string;
    headerClassName?: string
    style?: CSSProperties;
    extra?: ReactNode;
    children?: ReactNode;
} 

function PageCard(props: IPageCard, ref: React.LegacyRef<HTMLDivElement>) {
    const { 
        className = '', 
        headerClassName = '',
        style = {}, 
        extra, 
        children, 
        bg_enable,
        bg_color,
        divide_enable,
        divide_color,
        divide_loc = [],
        needTitleSign,
        titleSignColor
    } = Object.assign({}, defaultCardProps, props);

    const title = msg.isZh ? props.title: props.title_en

    const finalStyle = {
        ...style,
        ...(bg_enable ? {
            backgroundColor: bg_color
        } : {
            backgroundColor: 'transparent', boxShadow: 'none'
        })
    }

    const dividelightStyle = {
        width: '20px', 
        height: '2px', 
        backgroundColor: divide_color, 
        boxShadow: `0px 0px 6px 0px ${divide_color}, 0px 0px 2px 0px rgb(255 255 255 / 20%)`
    }

    const divideHorizontal = <div className={styles.divide_horizontal}>
        <div style={dividelightStyle}></div>
        <div style={{width: 'calc(100% - 40px)', height: '1px', backgroundColor: divide_color, opacity: 0.2}}></div>
        <div style={dividelightStyle}></div>
    </div>

    const VerticallightStyle = {
        width: '2px', 
        height: '20px', 
        backgroundColor: divide_color, 
        boxShadow: `0px 0px 6px 0px ${divide_color}, 0px 0px 2px 0px rgb(255 255 255 / 20%)`
    }

    const divideVertical = <div className={styles.divide_vertical}>
        <div style={VerticallightStyle}></div>
        <div style={{height: 'calc(100% - 40px)', width: '1px', backgroundColor: divide_color, opacity: 0.2}}></div>
        <div style={VerticallightStyle}></div>
    </div>

    return <div className={`${styles.page_card} ${className}`} style={finalStyle} ref={ref}>
        {divide_enable && divide_loc.indexOf('left') > -1 ? divideVertical : null}
        <div className={styles.card_middle}>
            {divide_enable && divide_loc.indexOf('top') > -1 ? divideHorizontal : null}
            {(title || extra) && <div className={`${styles.card_header} ${headerClassName}`}>
                <div className={styles.card_header_wrap}>
                    {title && <div className={styles.header_title}>
                        {needTitleSign ? <div className={styles.header_title_sign} style={{backgroundColor: titleSignColor}}/> : null}
                        <div className={styles.header_text}>{title}</div>
                    </div>}
                    {extra && <div className={styles.header_extra}>{extra}</div>}
                </div>
            </div>}
            <div className={styles.card_body}>
                {children}
            </div>
            {divide_enable && divide_loc.indexOf('bottom') > -1 ? divideHorizontal : null}
        </div>
        {divide_enable && divide_loc.indexOf('right') > -1 ? divideVertical : null}
    </div>
}

export default React.forwardRef(PageCard);