import React, { useMemo } from "react";
import { Button } from "antd";
import { ButtonProps } from "antd/lib/button/button";
import styles from "./index.module.scss";
import { FontIcon, IconType } from "Icon";
import { confirm } from "Modal";
import { msgTag } from "@/common/lang";
const i18n = msgTag('common')

export type Size = 'small' | 'middle' | 'large'

export type BtnProps = Omit<ButtonProps, 'type' | 'size' | 'block'> & {
    size?: Size
}

const wrap = (El: React.ReactElement, opt?: {
    size?: Size
    bordered?: boolean
}) => {
    return <div className={`${styles[opt?.size ?? 'middle']} ${opt?.bordered ? styles.bordered : ''}`} >
        {El}
    </div>
}

export const PrimaryButton: React.FC<BtnProps> = (props) => {
    const { icon, children, ...rest } = props
    return wrap(<Button type="primary" block={true} {...rest} size="middle">
        {icon ? <div className={styles['btn-with-icon']}>
            {icon}{children}
        </div> : children}
    </Button>, { size: props.size, bordered: true })
}

export const DefaultButton: React.FC<BtnProps> = (props) => {
    const { icon, children, ...rest } = props
    return wrap(<Button block={true} {...rest} size="middle" >
        {icon ? <div className={styles['btn-with-icon']}>
            {icon}{children}
        </div> : children}
    </Button>, { size: props.size, bordered: true })
}

export const ResetButton: <T = any>(args: {
    originData?: T
    onReset: (d?: T) => void
    text?: {
        content?: string
        confirmTitle?: string
        confirmContent?: string
    }
}) => any = ({ originData, onReset, text }) => {
    const origin = useMemo(() => originData, [originData])

    return <div className={styles.reset} onClick={() => {
        confirm({
            title: text?.confirmTitle ?? i18n('reset_warning'),
            content: text?.confirmContent ?? i18n('reset_content'),
            onOk: () => onReset(origin)
        })
    }}>
        <FontIcon type={IconType.RESET} style={{ marginRight: 5 }} />
        {i18n('reset')}
    </div>
}

type TDoubleButtons = BtnProps & {
    className?: string;
    style?: React.CSSProperties;
    onCancle?: React.MouseEventHandler<HTMLElement>;
    cancleText?: string;
    onConfirmed?: React.MouseEventHandler<HTMLElement>;
    confirmText?: string;
}
export const DoubleButtons: React.FC<TDoubleButtons> = (props) => {
    const {
        className,
        style = {},
        onCancle,
        cancleText,
        onConfirmed,
        confirmText,
        ...restProps
    } = props;
    const cancle = cancleText || i18n('cancel');
    const confirm = confirmText || i18n('save');

    return <div className={`${styles.double}${className ? ` ${className}` : ''}`} style={style}>
        <DefaultButton
            onClick={onCancle}
            {...restProps}
        >{cancle}</DefaultButton>
        <PrimaryButton
            onClick={onConfirmed}
            {...restProps}
        >{confirm}</PrimaryButton>
    </div>
}

