import { msgTag } from '@/common/lang'
import { Upload } from 'antd'
import { PrimaryButton } from 'Button'
import { notify } from 'Notify'
import { UploadOutlined } from '@ant-design/icons';
import React from 'react'
import { i18n } from './utils';

export type UploaderProps = {
    onload: (b: string) => void
}

const maxSize = 1024 * 1024
const maxSizeStr = '1MB'
const Uploader: React.FC<UploaderProps> = ({ onload }) => {
    return <Upload maxCount={1} showUploadList={{showRemoveIcon: false}} beforeUpload={(file) => {
        if (file.size > maxSize) {
            notify(i18n.fileTooLarge)
            return false
        }

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            reader.result && onload(reader.result as string)
        }
        reader.onerror = (e) => {
            console.error('read file error', e);
            notify(i18n.uploadFail)
        }
        return false
    }}>
        <PrimaryButton icon={<UploadOutlined />} >
            {i18n.upload + `(<${maxSizeStr})`}
        </PrimaryButton>
    </Upload>
}

export default Uploader