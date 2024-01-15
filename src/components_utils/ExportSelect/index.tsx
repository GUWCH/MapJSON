import React, { useCallback, useState } from 'react';
import { Button, ButtonProps, ModalProps, Radio, RadioChangeEvent } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { msgTag } from "@/common/lang";
import { StyledModal } from 'Modal';
import styles from './style.module.scss';

const localText = msgTag('common');

type ExportGroupProps = {
    exportText?: string;
    exportButtonProps?: ButtonProps;
    onChange?: Function;
} & ModalProps;

const DEFAULT_FILE_TYPE = 'csv';

const ExportGroup: React.FC<ExportGroupProps> = (props) => {
    const { onChange, exportText, exportButtonProps={}, ...rest } = props;
    const [visible, setVisible] = useState(false);
    const [fileType, setFileType] = useState(DEFAULT_FILE_TYPE);

    const selectFile = useCallback((e: RadioChangeEvent) => {
        setFileType(e.target.value);
    }, [setFileType]);

    const onOk = useCallback(() => {
        setVisible(false);
        onChange && onChange(fileType);
        setFileType(DEFAULT_FILE_TYPE);
    }, [fileType, setVisible, setFileType, onChange]);

    const onCancel = useCallback(() => {
        setVisible(false);
        setFileType(DEFAULT_FILE_TYPE);
    }, [setVisible, setFileType]);

    return <>
        <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={() => {setVisible(true)}}
            {...exportButtonProps}
        >
            {exportText || '导出'}
        </Button>
        <StyledModal
            title={localText('fileType')}
            centered
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={350}
            destroyOnClose={true}
            closable={true}
            okText={localText('ok')}
            {...rest}
        >
            <div>
                <Radio.Group onChange={selectFile} value={fileType} className={styles.radioGroup}>
                    <Radio value={'csv'}>CSV</Radio>
                    <Radio value={'xls'}>XLS</Radio>
                    <Radio value={'pdf'}>PDF</Radio>
                </Radio.Group>
            </div>
        </StyledModal>
    </>;
};

export default ExportGroup;