import React from 'react';
import { observer } from 'mobx-react';
import { Form, Input, Modal } from 'antd';
import { _pageDao, daoIsOk } from '@/common/dao';
import { notify } from 'Notify';
import { useStores } from '../../../stores';
import { ITplState } from '../../../stores/tplStore';
import { localText } from '@/common/util-scada';
import { TEMPLATE_MODAL } from '@/common/constants';

type TProForm = {
    containerCls: string;
}

function ProForm(props: TProForm){
    const tplStore: ITplState = useStores().tplStore;
    const { modalState } = tplStore;
    const [form] = Form.useForm();
    const isUpdate = modalState.type === TEMPLATE_MODAL.CATEGORY_UPDATE;

    const validateProjectName = (rule, value, callback): any => {
        const isRepeat = tplStore.pageTpls
            .filter(tpl => tpl.id !== modalState.record?.id)
            .find(tpl => tpl.name === value);
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
        const res = await _pageDao.savePageCategory(Object.assign({}, ids, values));
        if(daoIsOk(res)){
            tplStore.getPageTpls().then(() => {
                if(props.containerCls){
                    const target = document.getElementsByClassName(props.containerCls)[0];
                    if(target){
                        target.scrollTop = target.scrollHeight;
                    }
                }
            });
        }else{
            notify(isUpdate 
                ? localText('COMMON.MSG_UPDATE_FAILED') 
                : localText('COMMON.MSG_CREATE_FAILED')
            );
        }
        tplStore.setModalState({});
        tplStore.setLoading(false);
    }

    const title = isUpdate
        ? localText('CATEGORY.TITLE_UPDATE')
        : localText('CATEGORY.TITLE_NEW');

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
                initialValue={tplStore.modalState.record?.name || ''}
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
                    validator: validateProjectName
                }]}
            >
                <Input maxLength={64}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default observer(ProForm);