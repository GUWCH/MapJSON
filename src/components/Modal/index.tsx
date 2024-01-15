import { QuestionCircleOutlined } from '@ant-design/icons';
import { Modal, ModalFuncProps, ModalProps, Space } from "antd";
import React from "react";
import styles from "./index.module.scss";
import { msgTag } from '@/common/lang';
import { DefaultButton, PrimaryButton, ResetButton } from 'Button';
const i18n = msgTag('common')

export const StyledModal: React.FC<ModalProps & {
    paddingSize?: 'big' | 'small';
    customClassName?: string;
    headerBorder?: boolean;
    footerBorder?: boolean;
}> = (props) => {
    const cls = `${styles.container} ${!props.headerBorder ? styles.noHeaderBorder : ''} ${!props.footerBorder ? styles.noFooterBorder : ''}`
    const className = `${cls} ${styles[(props.paddingSize || 'small') + '-padding']} ${props.customClassName ? props.customClassName : ''}`
    return <Modal className={className} {...props}>
        {props.children}
    </Modal>
}

export const ConfigModal = <T,>({
    title, onCancel, onOk, okText, children, originData, onReset, resetText, ...rest
}: ModalProps & {
    children?: React.ReactNode
    title?: React.ReactNode 
    originData?: T
    onReset?: (d?: T) => void
    resetText?: {
        content?: string
        confirmTitle?: string
        confirmContent?: string
    }
}) => {
    return <StyledModal
        destroyOnClose={true}
        centered={true}
        visible={true}
        width={300}
        closable={false}
        onCancel={onCancel}
        footer={<Space size={'small'} direction={'horizontal'}>
            <DefaultButton
                onClick={onCancel}
            >{i18n('cancel')}</DefaultButton>
            <PrimaryButton
                onClick={onOk}
            >{okText || i18n('save')}</PrimaryButton>
        </Space>}
        title={<div className={styles.header}>
            {title ?? <div />}
            {onReset && <ResetButton originData={originData} onReset={onReset} text={resetText} />}
        </div>}
        {...rest}
    >
        {children}
    </StyledModal>
}

export const confirm = (props: ModalFuncProps) => Modal.confirm({
    className: styles.confirm,
    icon: <QuestionCircleOutlined color='#faae0a' />,
    okText: i18n('ok'),
    cancelText: i18n('cancel'),
    ...props
})