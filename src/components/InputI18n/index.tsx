import React, { useCallback, useState } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import { Input, Modal, Form } from 'antd';
import { InputTextSize } from '@/common/constants';

export enum INPUT_I18N {
    ZH_CN='zh-CN',
    EN_US='en-US'
}

export const INPUT_I18N_DEFAULT_KEY = 'default';

const i18nText = {
    [INPUT_I18N.ZH_CN]: {
        title: '国际化',
        default: '默认值',
        [INPUT_I18N.ZH_CN]: '中文',
        [INPUT_I18N.EN_US]: '英文'
    },
    [INPUT_I18N.EN_US]: {
        title: 'Internationalization',
        default: 'Default',
        [INPUT_I18N.ZH_CN]: 'Chinese',
        [INPUT_I18N.EN_US]: 'English'
    }
};

type InputI18nData = {
    default: any
} & {
    [k in INPUT_I18N]: any
};

type InputI18nProps = {
    i18n: INPUT_I18N;
    data: InputI18nData;
    onChange: (values: InputI18nData) => {}
}

function InputI18n(props?: InputI18nProps){
    const { i18n=INPUT_I18N.ZH_CN, data={}, onChange } = props || {};
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const text = i18nText[i18n];

    const onOk = useCallback((e) => {
        form
        .validateFields()
        .then(values => {            
            typeof onChange === 'function' && onChange(values);
            form.resetFields();
            setIsModalOpen(false);
        })
        .catch(info => {
            console.log('InputI18n Validate Failed:', info);
        })
        .finally(() => {

        });
    }, [form, setIsModalOpen, onChange]);

    const onCancel = useCallback((e) => {
        form.resetFields();
        setIsModalOpen(false);
    }, [form, setIsModalOpen]);

    const onInputChange = useCallback((e) => {
        let newData = {};
        if(typeof data === 'string'){
            newData[INPUT_I18N_DEFAULT_KEY] = e.target.value;
        }else{
            data[INPUT_I18N_DEFAULT_KEY] = e.target.value;
            newData = {...data};
        }
        
        typeof onChange === 'function' && onChange(newData as InputI18nData);
        form.resetFields();
    }, [onChange, data]);

    return <>
        <Input 
            value={typeof data === 'string' ? data : data[INPUT_I18N_DEFAULT_KEY] || ''}
            onChange={onInputChange}
            addonAfter={
                <GlobalOutlined 
                    title={text.title}
                    style={{
                        color: typeof data === 'object' && Object.keys(data).filter(k => k !== INPUT_I18N_DEFAULT_KEY && data[k]).length ? '#0a6efa' : '#a4a5b3'
                    }} 
                    onClick={() => {setIsModalOpen(true)}} 
                />
            } 
            maxLength={InputTextSize.Simple}
        />
        <Modal 
            title={text.title} 
            visible={isModalOpen}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                style={{ maxWidth: 1900 }}
            >
                {
                    [INPUT_I18N_DEFAULT_KEY].concat((Object.keys(INPUT_I18N) as Array<keyof typeof INPUT_I18N>).map(k => INPUT_I18N[k])).map((key) => {
                        return <Form.Item 
                            key={key}
                            label={text[key]} 
                            name={key}
                            // 兼容之前字符串格式
                            initialValue={typeof data === 'string' ? (key === INPUT_I18N_DEFAULT_KEY ? data : '') : data[key] || ''}
                        >
                            <Input 
                                maxLength={InputTextSize.Simple}
                            />
                        </Form.Item>
                    })
                }
            </Form>
        </Modal>
    </>;
}

export default InputI18n;