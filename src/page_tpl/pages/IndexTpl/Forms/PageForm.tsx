import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useNavigate } from "react-router-dom";
import { nanoid } from 'nanoid';
import { Form, Input, Modal, Select } from 'antd';
import { _pageDao, daoIsOk } from '@/common/dao';
import { notify } from 'Notify';
import { useStores } from '../../../stores';
import { ITplState } from '../../../stores/tplStore';
import { localText } from '@/common/util-scada';
import { TEMPLATE_MODAL } from '@/common/constants';

const { Option } = Select;

function PageForm(){
    const nav = useNavigate();
    const tplStore: ITplState = useStores().tplStore;
    const { modalState, categories } = tplStore;
    const [form] = Form.useForm();
    const modalType = modalState.type;
    const isCopy = modalType === TEMPLATE_MODAL.TPL_COPY;
    const isUpdate = modalType === TEMPLATE_MODAL.TPL_UPDATE;

    useEffect(() => {
        tplStore.getCategories();
    }, []);

    useEffect(() => {
        let pageCate = tplStore.modalState.record?.category_id || '';
        if(!pageCate && categories && categories.length > 0){
            form.setFieldsValue({category_id: categories[0].id})
        }
    }, [categories]);

    const validateTplName = (rule, value, callback): any => {
        const isRepeat = tplStore.allPages
        .filter(tpl => isCopy || tpl.id !== modalState.record?.id)
        .find(tpl => tpl.name === value);
        if (value && isRepeat) {
            callback(localText('COMMON.MSG_REPEATED'));
        } else {
            callback();
        }
    };

    const validateSignName = (rule, value, callback): any => {
        const isRepeat = tplStore.allPages
        .filter(tpl => isCopy || tpl.id !== modalState.record?.id)
        .find(tpl => tpl.sign === value);
        if (value && isRepeat) {
            callback(localText('COMMON.MSG_REPEATED'));
        } else {
            callback();
        }
    };

    const submitForm = async (values) => {
        form.resetFields();
        tplStore.setLoading(true);

        const ids = tplStore.modalState.record ? {id: tplStore.modalState.record.id} : {};
        const res = await _pageDao.savePageTpl(Object.assign({}, ids, values));
        if(daoIsOk(res)){
            if(isUpdate){
                tplStore.getPageTpls();
            }else{
                // template_id不置空会认为是新复制
                nav('/editor', {
                    replace: true, 
                    state: Object.assign({}, values, {id: res.data, template_id: null})
                });
            }
        }else{
            notify(isUpdate 
                ? localText('COMMON.MSG_UPDATE_FAILED') 
                : localText('COMMON.MSG_CREATE_FAILED')
            );
        }
        tplStore.setModalState({});
        tplStore.setLoading(false);
    }

    let title = '';
    switch(modalType){
        case TEMPLATE_MODAL.TPL_NEW:
            title = localText('TPL.TITLE_NEW')
            break;
        case TEMPLATE_MODAL.TPL_UPDATE:
            title = localText('COMMON.TXT_CONFIG')
            break;
        case TEMPLATE_MODAL.TPL_COPY:
            title = localText('TPL.TITLE_CREATE')
            break;
    }
    
    const pageId = tplStore.modalState.record?.id || '';
    let pageName = tplStore.modalState.record?.name || '';
    if(isCopy){
        pageName = '';
    }
    let pageSign = tplStore.modalState.record?.sign || nanoid();
    if(isCopy){
        pageSign = nanoid();
    }
    const pageCate = tplStore.modalState.record?.category_id || '';
    const pageTag = tplStore.modalState.record?.tag || '';

    return <Modal
        title={title}
        visible={!!modalState.type}
        onOk={() => {
            form
            .validateFields()
            .then(values => {
                submitForm(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
        }}
        onCancel={() => {tplStore.setModalState({})}}
        keyboard={false}
        maskClosable={false}
        width={500}
        destroyOnClose
    >
        <Form
            form={form}
            layout="horizontal"
            initialValues={{}}
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
        >
            <Form.Item
                initialValue={pageName}
                name="name"
                label={localText('COMMON.TXT_NAME')}
                rules={[{
                    required: true,
                    message: localText('COMMON.MSG_REQUIRED_NAME')
                },{
                    pattern: /^[a-zA-z0-9\_\s\-\u4e00-\u9fa5]+$/,
                    message: localText('COMMON.MSG_REQUIRED_RULE')
                },{
                    pattern: /^\S*$/,
                    message: localText('COMMON.MSG_REQUIRED_SIMPLE_RULE')
                },{
                    validator: validateTplName
                }]}
            >
                <Input maxLength={64}/>
            </Form.Item>
            <Form.Item
                name="sign"
                label={localText('COMMON.TXT_SIGN')}
                initialValue={pageSign}
                tooltip={localText('TPL.PROMPT_SIGN')}
                rules={[{
                    required: true,
                    message: localText('TPL.MSG_REQUIRED_SIGN')
                },{
                    pattern: /^[a-zA-z0-9\_\-]+$/,
                    message: localText('COMMON.MSG_REQUIRED_SIMPLE_RULE')
                },{
                    validator: validateSignName
                }]}
            >
                <Input maxLength={64} type='string'/>
            </Form.Item>
            <Form.Item
                name="category_id"
                label={localText('CATEGORY.NAME')}
                initialValue={pageCate}
                rules={[{
                    required: true,
                    message: localText('TPL.MSG_REQUIRED_CATEGORY')
                }]}
            >
                <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {
                        categories.map((category) => {
                            return <Option 
                                key={category.id} 
                                value={category.id}
                            >{category.name}</Option>;
                        })
                    }
                </Select>
            </Form.Item>
            <Form.Item
                initialValue={pageTag}
                name="tag"
                label={localText('COMMON.TXT_TAG')}
                rules={[{
                    pattern: /^[a-zA-z0-9\_\-]+$/,
                    message: localText('COMMON.MSG_REQUIRED_SIMPLE_RULE')
                }]}
            >
                <Input maxLength={64} type='string'/>
            </Form.Item>
            {isCopy && <Form.Item
                name="template_id"
                label={localText('COMMON.TXT_TEMPLATE')}
                initialValue={pageId}
                rules={[]}
            >
                <Select 
                    allowClear={true}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {
                        tplStore.allPages.map((page) => {
                            return <Option 
                                key={page.id} 
                                value={page.id as string}
                            >{page.name}</Option>;
                        })
                    }
                </Select>
            </Form.Item>}
        </Form>
    </Modal>
}

export default observer(PageForm);