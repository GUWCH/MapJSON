import { Modal, Space } from 'antd'
import { DefaultButton, PrimaryButton } from 'Button'
import { notify } from 'Notify'
import React, { CSSProperties, useMemo, useState } from 'react'
import WidgetContext from '../common/context'
import { useWidgetMemory } from '../common/hooks'
import styles from './Picture.module.scss'
import Uploader from './Uploader'
import { i18n } from './utils'

/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type IPictureFormCfg = {
    content?: string
    fillType?: 'fill' | 'contain'
}

export const PictureDefaultCfg: IPictureFormCfg = {
    fillType: 'contain'
}

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type IPictureOptions = IPictureFormCfg

export const PictureDefaultOptions: IPictureOptions = PictureDefaultCfg

export const PictureWidget: WidgetElement<IPictureFormCfg> = (props) => {
    const { configure, isDemo, pageId, width, tplContainerWidth, id } = props
    const {
        content,
        fillType
    } = configure

    // const [showEdit, setShowEdit] = useState(false)
    // const [tempPic, setTempPic] = useState('')
    // const defaultMemo = useMemo(() => ({ img: content }), [content])
    // const { content: memoryContent, save } = useWidgetMemory(defaultMemo, { pageId, componentId: id })
    // const imgSrc = memoryContent?.img || content

    return <WidgetContext.Provider
        value={{
            componentId: props.id!,
            isDemo: !!isDemo,
            widgetName: 'Picture',
            pageId: pageId
        }}
    >
        <div className={styles.container} >
            <img className={fillType === 'contain' ? styles.pic_contain : styles.pic_fill}
                src={content} alt={'img'}
                // onDoubleClick={e => setShowEdit(true)}
            />
            {/* {showEdit && <Modal
                closable={false}
                destroyOnClose={true}
                centered={true}
                visible={true}
                width={300}
                title={i18n.edit}
                footer={<Space size={'small'} direction={'horizontal'}>
                    <DefaultButton onClick={() => {
                        setShowEdit(false)
                        setTempPic('')
                    }}>{i18n.cancel}</DefaultButton>
                    <PrimaryButton onClick={() => {
                        save({ img: tempPic })
                            .then(() => {
                                setTempPic('')
                                setShowEdit(false)
                            }).catch((e) => {
                                notify(i18n.saveError)
                                console.error(e);
                            })
                    }}>{i18n.save}</PrimaryButton>
                </Space>}
            >
                <Uploader onload={(b) => setTempPic(b)} />
            </Modal>} */}
        </div>
    </WidgetContext.Provider>
}