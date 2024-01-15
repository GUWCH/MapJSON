import BaseInfo from '@/components_utils/base';
import {
    MenuOutlined,
    MinusCircleOutlined, PlusOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { FontIcon, IconType } from 'Icon';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { Button, Checkbox, Input, Select, Tooltip } from 'antd';
import { UserConfig, deepCopy } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import React, { memo } from 'react';
import { useIntl } from "react-intl";
import { ReactSortable } from "react-sortablejs";
import { INavBreadCrumbCfg } from './index';

const { Option } = Select;

export interface PropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const NavBreadCrumbForm = (props: PropsType) => {
    const intl = useIntl();
    const configure: INavBreadCrumbCfg = JSON.parse(JSON.stringify(props.current.props));
    if(!configure.breads){
        configure.breads = [];
    }

    const store = props.config.getStore();

    const onChange = (value: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = { ...v.props, ...value };
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    const remove = (index) => {
        configure.breads!.splice(index, 1);
        onChange(configure);
    };

    const add = () => {
        configure.breads!.push({
            id: '',
            name: '',
            name_en: '',
            target: '',
            icon: '',
            localSwitch: undefined
        });
        onChange(configure);
    }

    const onValuesChange = (field, index, e) => {
        configure.breads![index][field] = e.target.value;
        onChange(configure);
    };

    const onSelectChange = (field, index, value) => {
        configure.breads![index][field] = value;
        onChange(configure);
    }

    const onCheckChange = (e) => {
        configure.isDevice = e.target.checked;
        onChange(configure);
    }

    const sortChange = (values) => {
        configure.breads = values.map(v => deepCopy(v));
        onChange(configure);
    }

    return <BaseInfo {...props}>
        <SingleCollapse>
            <CollapsePanel 
                header={intl.formatMessage({id: 'form.nav.headline'})} 
                key="1"
                extra={<QuestionCircleOutlined title={intl.formatMessage({id: 'form.nav.help'})}/>}
            >
                <div style={{padding: '10px 0'}}>
                    <Checkbox onChange={e => onCheckChange(e)} checked={configure.isDevice}>
                        {intl.formatMessage({id: 'form.nav.device'})}
                    </Checkbox>
                    <QuestionCircleOutlined title={intl.formatMessage({id: 'form.nav.device.help'})}/>
                </div>
                <div style={{
                    maxHeight: 450, 
                    overflow: 'auto',
                    border: '1px solid #eee',
                    borderRadius: 2,
                    background: '#eee',
                    padding: 5,
                    userSelect: 'none'
                }}
                >
                <ReactSortable 
                    list={configure.breads.map(t => ({...t}))}
                    setList={(breads) => sortChange(breads)}
                    handle='span.anticon'
                    filter='.disable_item'
                    animation={200}
                >
                {
                    configure.breads.map((bread, index) => {
                        const { name, name_en, id, target='', icon='', localSwitch, assetAlias } = bread;
                        return <div 
                            key={id} 
                            style={{
                                padding: '5px 0'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: '#cbc5c5',
                                padding: '5px 5px',
                                marginBottom: '5px'
                            }}>
                                <MenuOutlined 
                                    style={{marginRight: 5, cursor: 'move'}}
                                />
                                <MinusCircleOutlined
                                    className="dynamic-delete-button"
                                    onClick={() => remove(index)}
                                />
                            </div>
                            <div>
                                <Input 
                                    placeholder={intl.formatMessage({id: 'form.nav.zhName'})}
                                    style={{ width: '100%' }}
                                    value={name}
                                    onChange={e => onValuesChange('name', index, e)}
                                    allowClear={true}
                                    maxLength={64}
                                />
                            </div>
                            <div>
                                <Input 
                                    placeholder={intl.formatMessage({id: 'form.nav.enName'})}
                                    style={{ width: '100%',marginTop: '5px' }}
                                    value={name_en}
                                    onChange={e => onValuesChange('name_en', index, e)}
                                    allowClear={true}
                                    maxLength={64}
                                />
                            </div>
                            <div>
                                <Input 
                                    placeholder={intl.formatMessage({id: 'form.nav.target'})}
                                    style={{ 
                                        width: '100%',
                                        marginTop: '5px'
                                    }}
                                    value={target}
                                    onChange={e => onValuesChange('target', index, e)}
                                    disabled={configure.isDevice}
                                    allowClear={true}
                                    maxLength={200}
                                />
                            </div>
                            <div>
                                <Select
                                    allowClear={true}
                                    placeholder={intl.formatMessage({id: 'form.nav.icon'})}
                                    style={{ 
                                        width: '100%',
                                        marginTop: '5px'
                                    }}
                                    value={icon || undefined}
                                    onChange={(value, options) => onSelectChange('icon', index, value)}
                                >
                                    {
                                        Object.keys(IconType).map((key, ind) => {
                                            return <Option value={IconType[key]} key={ind}>
                                                <FontIcon type={IconType[key]}/>
                                            </Option>;
                                        })
                                    }
                                </Select>
                            </div>
                            <div>
                                <Select
                                    allowClear={false}
                                    placeholder={intl.formatMessage({id: 'form.nav.switch'})}
                                    style={{ 
                                        width: '100%',
                                        marginTop: '5px'
                                    }}
                                    value={localSwitch}
                                    onChange={(value, options) => onSelectChange('localSwitch', index, value)}
                                    disabled={configure.isDevice}
                                >
                                    <>
                                    <Option value={'0'} key={0}>
                                    {intl.formatMessage({id: 'form.nav.switch.new'})}
                                    </Option>
                                    <Option value={'1'} key={1}>
                                    {intl.formatMessage({id: 'form.nav.switch.internal'})}
                                    </Option>
                                    </>
                                </Select>
                            </div> 
                            <div>
                                <Tooltip 
                                    placement="top" 
                                    title={
                                        <div dangerouslySetInnerHTML={{
                                            __html:intl.formatMessage({id: 'form.base.assetDesc'}) 
                                        }}></div>
                                    }
                                    overlayStyle={{
                                        maxWidth: 500,
                                        fontSize: 12
                                    }}
                                >
                                    <Input 
                                        placeholder={intl.formatMessage({id: 'form.nav.asset'})}
                                        style={{ 
                                            width: '100%',
                                            marginTop: '5px'
                                        }}
                                        value={assetAlias}
                                        onChange={e => onValuesChange('assetAlias', index, e)}
                                        disabled={configure.isDevice}
                                        allowClear={true}
                                        />
                                </Tooltip>
                            </div>
                        </div>
                    })
                }
                </ReactSortable>
                </div>
                <Button onClick={() => add()} block icon={<PlusOutlined />}>
                    {intl.formatMessage({id: 'form.nav.add'})}
                </Button>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(NavBreadCrumbForm);