import React, { useEffect, useState } from "react";
import { Modal, ModalProps, ModalFuncProps } from "antd";
import Intl from '@/common/lang';
import { FontIcon, IconType } from 'Icon';
import { PointSelect, PointSelectProps, StyledModal, SetSelect as Select } from "@/components";
import styles from './style.mscss';

export const isZh = Intl.isZh;

const IntlDesc = isZh ? {
    reset: '重置',
    save: '保存',
    cancel: '取消',
    modalConfirm: "确认恢复原有设置？",
    modalInfo: "此操作将撤回未保存的所有设置。",
    ok: '确定'

} : {
    reset: 'Reset',
    save: 'Save',
    cancel: 'Cancel',
    modalConfirm: "Confirm to restore the original settings?",
    modalInfo: "This action will not save all settings.",
    ok: 'OK'
}

export interface ContentItem {
    key: string,
    keyName?: string,
    nameShow?: boolean,
    describe?: string,
    type?: 'points' | 'yxSelect' | 'customize',
    itemProps?: PointSelectProps;
    selectProps?: {};
    aboveExtra?: React.ReactNode | (() => React.ReactNode);
    belowExtra?: React.ReactNode | (() => React.ReactNode);
    customizeDom?: React.ReactNode | (() => React.ReactNode);
}

type SetModal = ModalProps & Omit<ModalFuncProps, 'onOk' | 'onCancel'> & {
    isDoubleFold?: boolean,
    title: string;
    memorySave: () => void;
    handleReset: () => void;
    content: ContentItem[];
    customizeChildren?: any;
    // childrenRender: (curTplContent: any) => React.ReactElement;
}


const TplSet: React.FC<SetModal> = ({
    isDoubleFold = false,
    visible,
    title,
    memorySave,
    handleReset,
    content,
    // childrenRender,
    ...restProps
}: SetModal) => {


    const [isModalVisible, setIsModalVisible] = useState(visible);
    const [isConfirm, setIsConfirm] = useState(false);

    useEffect(() => {
        setIsModalVisible(visible)
    }, [visible])


    const handleSave = () => {
        memorySave && memorySave();
        setIsModalVisible(false)
    }

    const renderContent = (content: ContentItem[]) => {
        return content.map((contentItem, index) => {
            const { key, keyName, aboveExtra, belowExtra, nameShow, describe, type, itemProps={}, selectProps, customizeDom } = contentItem;
                switch(type) {
                    case 'points':
                        return <div className={styles.contentContainer} key={index} >
                            {nameShow ? <div className={styles.contentTitle}>{keyName}</div> : null}
                            {typeof aboveExtra === 'function' ? aboveExtra() : aboveExtra}
                            <PointSelect 
                                treeProps = {{style: {width: '100%', height: '36px', marginBottom: '10px'}}}
                                dropDownStyle = {{width: '100%'}}
                                {...itemProps}
                            />
                            {typeof belowExtra === 'function' ? belowExtra() : belowExtra}
                        </div>

                    case 'yxSelect':
                        return <div className={styles.contentContainer} key={index}>
                            {nameShow ? <div className={styles.contentTitle}>{keyName}</div> : null}
                            {typeof aboveExtra === 'function' ? aboveExtra() : aboveExtra}
                            <div className={styles.contentSelect}>
                                <span>{describe}</span>
                                <Select
                                    {...selectProps}
                                />
                            </div>
                            <PointSelect 
                                dropDownStyle = {{width: '100%'}}
                                {...itemProps}
                            />
                            {typeof belowExtra === 'function' ? belowExtra() : belowExtra}
                        </div>
                    case 'customize':
                        return <div className={styles.contentContainer} key={index}>
                            {typeof aboveExtra === 'function' ? aboveExtra() : aboveExtra}
                            {typeof customizeDom === 'function' ? customizeDom() : customizeDom}
                            {typeof belowExtra === 'function' ? belowExtra() : belowExtra}
                        </div>

                    default:
                        return null;

                }        
        })
    }

    const renderDoubleContent = () => {
        return <PointSelect 
            treeProps = {{style: {width: '100%', height: '36px', marginBottom: '10px'}}}
            dropDownStyle = {{width: '100%'}}
            needDelete = {false}
            needSelect = {false}
            selectedData = {content.map(c => {
                const {title, key, secondContent, ...restProps} = c;
                return {
                    ...restProps,
                    title: title,
                    key: key,
                    dropDownContent: renderContent(secondContent)
                }
            })}
        />
    }


    const modalBodyHeight = window.innerHeight - 200;

    return <Modal 
        wrapClassName = {styles.tplSetContainer}
        visible={isModalVisible} 
        closable={false}
        footer={null}
        width={300}
        bodyStyle={{height: `${modalBodyHeight}px`}}
        // onOk={() => {setIsModalVisible(false)}
        onCancel={() => {setIsModalVisible(false)}}  //点击蒙层关闭
        destroyOnClose={true}                        //关闭配置后销毁
        {...restProps}
    >
        <div className={styles.head}>
            <div className={styles.curTplName}>{title}</div>
            <div className={styles.reset} onClick = {() => setIsConfirm(true)}>
                <FontIcon type = {IconType.RESET}/>
            {IntlDesc.reset}</div>
        </div>
        <div className={styles.content}>
            {isDoubleFold ? renderDoubleContent() : renderContent(content)}
        </div>
        <div className={styles.footer}>
            <button className={styles.cancel} onClick = {() => {setIsModalVisible(false); handleReset();}}>{IntlDesc.cancel}</button>
            <button className={styles.save} onClick = {handleSave}>{IntlDesc.save}</button>
        </div>
        <StyledModal //重置二次确认
            wrapClassName = {styles.confirmModal}
            visible = {isConfirm}
            mask = {true}
            maskClosable = {true}
            closable = {false}
            onOk = {() => {handleReset(); setIsConfirm(false)}}
            onCancel = {() => {setIsConfirm(false)}}
            okText = {IntlDesc.ok}
            cancelText = {IntlDesc.cancel}

        >
            <div className= {styles.confirmOK}>
                <FontIcon type = {IconType.QUESTION_CIRCLE_BOLD}/>
                <span>{IntlDesc.modalConfirm}</span>
            </div>
            <div className= {styles.confirmInfo}>{IntlDesc.modalInfo}</div>
        </StyledModal>
    </Modal>
}

export default TplSet;