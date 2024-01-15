
import { Input, Modal, Space } from 'antd'
import { DefaultButton, PrimaryButton } from 'Button'
import React, { useState } from 'react'
import { i18n } from './common'
import styles from './EditModal.module.scss'

export type EditModalProps = {
    defaultContent: string
    type: 'text' | 'textArea'
    onSave: (text: string) => void
    onCancel: () => void
}

const EditModal: React.FC<EditModalProps> = ({ defaultContent, type, onSave, onCancel }) => {
    const [content, setContent] = useState(defaultContent)
    return <Modal
        closable={false}
        destroyOnClose={true}
        centered={true}
        visible={true}
        width={300}
        title={i18n.edit}
        footer={<Space size={'small'} direction={'horizontal'}>
            <DefaultButton onClick={onCancel}>{i18n.cancel}</DefaultButton>
            <PrimaryButton onClick={() => onSave(content)}>{i18n.save}</PrimaryButton>
        </Space>}
    >
        {
            type === 'textArea' ?
                <Input.TextArea value={content} onChange={e => setContent(e.target.value)} /> :
                <Input value={content} onChange={e => setContent(e.target.value)} />
        }
    </Modal>
}

export default EditModal