import {
    ExportOutlined,
    ImportOutlined
} from '@ant-design/icons';
import { _dao } from '@/common/dao';
import msg from '@/common/lang';
import { getI18nMap } from '@/common/util-scada';
import { Button, ConfigProvider, Select, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import { notify } from 'Notify';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './index.module.css';
const i18n = <T extends 'select' | 'export' | 'import' | 'success' | 'fail' | 'tooManyFiles' | 'errorGetTimezone' | 'errorFilename'>(k: T) => getI18nMap<T>('emsSchedule')(k)
const isZh = msg.isZh
const Option = Select.Option

const getPoints = () => _dao.emcScheduleGetPoints() as Promise<IEMCSchedulePoint[]>
const importFiles = (formData) => _dao.emcScheduleImport(formData) as Promise<void>
const exportFile = (alias: string) => _dao.emcScheduleExport(alias) as Promise<void>

type PointOption = {
    name: string,
    value: string
}
const Page = () => {

    const [options, setOptions] = useState<PointOption[]>([])
    const [selected, setSelected] = useState<string>()
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [run, setRun] = useState(false)

    useEffect(() => {
        getPoints()
            .then(data => {
                const newOpts = data.map(p => ({
                    name: p.ycName,
                    value: p.ycAlias
                }))
                if (newOpts && newOpts.length > 0) {
                    setOptions(newOpts)
                    setSelected(newOpts[0].value)
                }
            })
    }, [])

    useEffect(() => {
        if (run && fileList.length > 0) {
            handleUpload()
        }
    }, [run])

    const handleExport = () => {
        selected && exportFile(selected)
    }

    const handleUpload = () => {
        const formData = new FormData();
        
        fileList.forEach(file => {
            formData.append('files', file as RcFile);
        });
        
        setUploading(true)
        setRun(false)
        importFiles(formData)
            .then(() => {
                notify(i18n('success'))
            })
            .catch((e) => {
                if ((e.code + '') === '21001') {
                    notify(i18n('tooManyFiles'))
                } else if ((e.code + '') === '21002') {
                    notify(i18n('errorGetTimezone'))
                } else if ((e.code + '') === '21003') {
                    notify(i18n('errorFilename'))
                } else {
                    // console.error(e);
                    notify(e.message ?? i18n('fail'))
                }
            })
            .finally(() => {
                setFileList([])
                setUploading(false);
            });
    };

    return <div className={styles.container}>
        <span>{i18n('select')}</span>
        <Select value={selected} className={styles.select} onChange={(v) => setSelected(v?.toString())}>
            {options.map(o => <Option key={o.value} value={o.value}>{o.name}</Option>)}
        </Select>
        <Button className={styles.btn} onClick={handleExport}><ExportOutlined />{i18n('export')}</Button>
        <Upload
            multiple
            beforeUpload={file => {
                setFileList((list) => [...list, file]);
                return false;
            }}
            onChange={info => {
                if (info.file.uid === fileList[fileList.length - 1].uid) {
                    setRun(true)
                }
            }}
            showUploadList={false}
        >
            <Button className={styles.btn} loading={uploading}><ImportOutlined />{i18n('import')}</Button>
        </Upload>
    </div>
}

const App = () => {
    return <ConfigProvider locale={isZh ? zhCN : enUS}>
        <Page />
    </ConfigProvider>
}

ReactDOM.render(<App />, document.getElementById(process.env.NODE_ENV === 'development' ? 'center' : 'container'));