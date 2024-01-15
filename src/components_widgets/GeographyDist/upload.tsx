import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { StyledModal } from 'Modal';
import { LegalData, _dao } from '@/common/dao';
import { BgCache } from './index';
import { geoMsg } from './constants';

import styles from './style.module.scss';
import _ from 'lodash';
import { notify } from 'Notify';

export type ImageFile = {
    uid: number,
    name: string,
    status: string,
    url: string,
    uName: string,
    rawName?: string
} | UploadFile & { uName: string, rawName: string }

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    }
    );

const UploadWrap: React.FC<{
    initFileList: ImageFile[]
    bgCacheConfig: BgCache
    setBgCacheConfig: (data: BgCache) => void
    isSetBackground: boolean
    afterClose: () => void
}> = ({ initFileList, bgCacheConfig, setBgCacheConfig, isSetBackground, afterClose }) => {

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<ImageFile[]>([]);

    useEffect(() => {
        if (!_.isEqual(initFileList, fileList)) {
            fileList.length === 0 && setFileList(initFileList)
        }

    }, [initFileList])

    const handlePreviewCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(decodeURI(file.name) || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    }

    const handleUpload = (props) => {
        const formData = new FormData();
        const arr = props.file.name.split('.');
        const encodeName = encodeURI(arr.slice(0, arr.length - 1).join('.')) + '.' + arr[arr.length - 1];
        const encodeFile = new File([props.file], encodeName)
        formData.append('files', encodeFile);

        _dao.backgroundImgUpload(formData).then((res) => {
            if (LegalData(res)) {
                const newFileList = fileList.map(f => {
                    if (f.uid === props.file.uid) {
                        f.status = 'done';
                        f.uName = res.data.uploadedMap[props.file.name];
                        f.rawName = props.file.name;
                    }

                    return f;
                })
                setFileList(newFileList);
            } else {
                if (res.message) {
                    const newFileList = fileList.map(f => {
                        if (f.uid === props.file.uid) {
                            f.status = 'error';
                        }

                        return f;
                    })
                    setFileList(newFileList);
                    notify(res.message)

                } else {
                    notify(`${geoMsg('uploadFail')}`)
                }
            }
        })
    }

    const handleRemove = (file: File & { uName: string } | { uName: string }, isFromOk = false) => {
        if (!isFromOk && file.uName === bgCacheConfig?.uName) {
            return true;
        } else {
            _dao.backgroundImgDelete([file.uName])
        }

        return true
    }

    const handleSave = () => {
        if (fileList.length > 0) {
            if (fileList[0].uName !== bgCacheConfig?.uName) {
                bgCacheConfig?.uName && handleRemove({ uName: bgCacheConfig?.uName }, true)
            }
            setBgCacheConfig({
                uName: fileList[0].uName,
                rawName: fileList[0].rawName
            })
        } else {
            bgCacheConfig?.uName && handleRemove({ uName: bgCacheConfig.uName }, true)
            setBgCacheConfig(null)
        }

        afterClose();
    }

    const handleCancel = () => {
        setFileList(initFileList);

        if (fileList.length > 0) {
            if (fileList[0].uName !== bgCacheConfig?.uName) {
                bgCacheConfig?.uName && handleRemove({ uName: bgCacheConfig?.uName }, true)
            }
        }
        afterClose();
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{geoMsg('upload')}</div>
        </div>
    );
    return (
        <StyledModal
            wrapClassName={styles.edictBg}
            visible={isSetBackground}
            mask={true}
            maskClosable={true}
            afterClose={afterClose}
            onOk={handleSave}
            onCancel={handleCancel}
            destroyOnClose={true}
            okText={geoMsg('ok')}
            cancelText={geoMsg('cancel')}
            closable={false}
        >
            <div className={styles.title}>{geoMsg('editBg')}</div>
            <div className={styles.upload}>
                <div>{geoMsg('bgImage')}</div>
                <Upload
                    accept='.jpg,.png,.svg'
                    className={styles.uploadBox}
                    customRequest={handleUpload}
                    listType="picture-card"
                    fileList={fileList}
                    maxCount={1}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    onRemove={handleRemove}
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <div className={styles.bgTips}>{geoMsg('bgTips')}</div>
            </div>
            <Modal
                visible={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handlePreviewCancel}
            >
                <img style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </StyledModal>
    );
};

export default UploadWrap