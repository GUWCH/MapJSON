import React, { memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { Switch, Row, Col, Tag, InputNumber, Input } from 'antd';
import { 
    QuestionCircleOutlined 
} from '@ant-design/icons';
import { useIntl } from "react-intl";
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels from '@/components_utils/models';
import { IKeyInfoCfg } from './index';
import {uuid} from '@/common/utils';
import { SetSelect as Select } from "@/components";
import { PureIcon, IconType } from 'Icon';

export interface PropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const KeyInfoForm = (props: PropsType) => {
    const intl = useIntl();
    const configure: IKeyInfoCfg = JSON.parse(JSON.stringify(props.current.props));
    const { showName, showStatus, showSwitch, showToken, operateInfo } = configure;
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

    const onSwicthChange = (field, val) => {
        configure[field] = val;
        onChange(configure);
    }

    const onOperateChange = (field, val) => {
        configure.operateInfo[field] = val;
        onChange(configure);
    }

    const onOperateCustomizeChange = (index, keyStr, val) => {
        const {customize = []} = configure.operateInfo;
        let tempCustomize = Array.from(customize, x => x);

        let item = tempCustomize[index];

        if(keyStr){
            item[keyStr] = val;
        }else{
            Object.assign(item, val);
        }

        onOperateChange('customize', tempCustomize);
    }

    const addOperateCustomize = () => {
        const {customize = []} = configure.operateInfo;
        let tempCustomize = Array.from(customize);
        tempCustomize.push({key: uuid(8, undefined), operateVal: 0});

        onOperateChange('customize', tempCustomize);
    }

    const delOperateCustomize = (index) => {
        const {customize = []} = configure.operateInfo;
        let tempCustomize = Array.from(customize, x => x);
        tempCustomize.splice(index, 1);

        onOperateChange('customize', tempCustomize);
    }
    return <BaseInfo {...props}>
        <SingleCollapse>
            <CollapsePanel 
                header={intl.formatMessage({id: 'form.keyinfo.name'})} 
                key="1"
            >
                <Row>
                    {intl.formatMessage({id: 'form.keyinfo.device'})}
                </Row>
                <Row style={{ padding: '5px 0' }}>
                    <Col span={2}>
                    </Col>
                    <Col span={22}>
                        <BaseModels 
                            selectedDomain={(configure.switchInfo || {}).selectedDomain}
                            selectedObject={(configure.switchInfo || {}).selectedObject}
                            selectedModel={(configure.switchInfo || {}).selectedModel}
                            objectMode={undefined}
                            needSelectPoint={false}
                            pointMode={'multiple'}
                            onChange={(args) => {
                                configure.switchInfo = args as any;
                                onChange(configure);
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }}>
                    <Col span={18}>
                        {intl.formatMessage({id: 'form.keyinfo.name.show'})}
                    </Col>
                    <Col span={6} style={{textAlign: 'right'}}>
                        <Switch 
                            checked={showName} 
                            onChange={(checked, e)=> onSwicthChange('showName', checked)}
                        />
                    </Col>
                </Row>
                {showName && <div>
                    <Row style={{ padding: '5px 0' }}>
                        <Col span={18}>
                            {intl.formatMessage({id: 'form.keyinfo.name.switch'})}
                            {/* <QuestionCircleOutlined title={intl.formatMessage({id: 'form.keyinfo.name.switchhelp'})} /> */}
                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Switch 
                                checked={showSwitch} 
                                onChange={(checked, e)=> onSwicthChange('showSwitch', checked)}
                            />
                        </Col>
                    </Row>
                    <Row style={{ padding: '5px 0' }}>
                        <Col span={18}>
                            {intl.formatMessage({id: 'form.keyinfo.name.token'})}
                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Switch 
                                checked={showToken} 
                                onChange={(checked, e)=> onSwicthChange('showToken', checked)}
                            />
                        </Col>
                    </Row>
                    <Row style={{ padding: '5px 0' }}>
                        <Col span={18}>
                            {intl.formatMessage({id: 'form.keyinfo.name.status'})}
                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Switch 
                                checked={showStatus} 
                                onChange={(checked, e)=> onSwicthChange('showStatus', checked)}
                            />
                        </Col>
                    </Row>
                        {showStatus && <Row style={{ padding: '5px 0' }}>
                            <Col span={2}>
                            </Col>
                            <Col span={22}>
                                <BaseModels 
                                    selectedDomain={configure.statusInfo.selectedDomain}
                                    selectedObject={configure.statusInfo.selectedObject}
                                    selectedModel={configure.statusInfo.selectedModel}
                                    pointMode={'multiple'}
                                    objectMode={undefined}
                                    needSelectPoint={true}
                                    onChange={(args) => {
                                        configure.statusInfo = args as any;
                                        onChange(configure);
                                    }}
                                />
                            </Col>
                        </Row>
                    }
                </div>}
            </CollapsePanel>
        </SingleCollapse>
        <SingleCollapse>
            <CollapsePanel 
                header={intl.formatMessage({id: 'form.keyinfo.info'})} 
                key="1"
            >
                <BaseModels 
                    selectedDomain={configure.parameterInfo.selectedDomain}
                    selectedObject={configure.parameterInfo.selectedObject}
                    selectedModel={configure.parameterInfo.selectedModel}
                    pointMode={'multiple'}
                    objectMode={undefined}
                    needSelectPoint={true}
                    onChange={(args) => {
                        configure.parameterInfo = args as any;
                        onChange(configure);
                    }}
                />
            </CollapsePanel>
        </SingleCollapse>
        <SingleCollapse>
            <CollapsePanel 
                header={intl.formatMessage({id: 'form.keyinfo.operate'})} 
                key="1"
            >
                <Row style={{ padding: '5px 0' }}>
                    <Col span={18}>
                        {intl.formatMessage({id: 'form.keyinfo.operate.token'})}
                    </Col>
                    <Col span={6} style={{textAlign: 'right'}}>
                        <Switch 
                            checked={operateInfo.useToken} 
                            onChange={(checked, e)=> onOperateChange('useToken', checked)}
                        />
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }}>
                    <Col span={18}>
                        {intl.formatMessage({id: 'form.keyinfo.operate.wtg'})}
                        <QuestionCircleOutlined title={intl.formatMessage({id: 'form.keyinfo.operate.wtghelp'})} />
                    </Col>
                    <Col span={6} style={{textAlign: 'right'}}>
                        <Switch 
                            checked={operateInfo.isWtg} 
                            onChange={(checked, e)=> onOperateChange('isWtg', checked)}
                        />
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }}>
                    <Col span={18}>
                        {intl.formatMessage({id: 'form.keyinfo.operate.start'})}
                    </Col>
                    <Col span={6} style={{textAlign: 'right'}}>
                        <Switch 
                            checked={operateInfo.useStart} 
                            onChange={(checked, e)=> onOperateChange('useStart', checked)}
                        />
                    </Col>
                </Row>
                {
                    (!operateInfo.isWtg && operateInfo.useStart) && <div style={{border: '1px solid #bbb'}}>
                        <div>
                            <div>
                            <Tag color="blue">
                                {intl.formatMessage({id: 'form.keyinfo.operate.link'})}
                            </Tag>
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <BaseModels 
                                        selectedDomain={operateInfo.startInfo?.selectedDomain}
                                        selectedObject={operateInfo.startInfo?.selectedObject}
                                        selectedModel={operateInfo.startInfo?.selectedModel}
                                        pointMode={undefined}
                                        objectMode={undefined}
                                        needSelectPoint={true}
                                        onChange={(args) => {
                                            onOperateChange('startInfo', args)
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <div>
                                <Tag color="blue">
                                    {intl.formatMessage({id: 'form.keyinfo.operate.linkvalue'})}
                                </Tag>                                
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <InputNumber 
                                        style={{width: '100%'}}
                                        value={operateInfo.startValue}
                                        min={0} 
                                        onChange={(val) => {
                                            onOperateChange('startValue', val)
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                }
                <Row style={{ padding: '5px 0' }}>
                    <Col span={18}>
                        {intl.formatMessage({id: 'form.keyinfo.operate.stop'})}
                    </Col>
                    <Col span={6} style={{textAlign: 'right'}}>
                        <Switch 
                            checked={operateInfo.useStop} 
                            onChange={(checked, e)=> onOperateChange('useStop', checked)}
                        />
                    </Col>
                </Row>
                {
                    (!operateInfo.isWtg && operateInfo.useStop) && <div style={{border: '1px solid #bbb'}}>
                        <div>
                            <div>
                            <Tag color="blue">
                                {intl.formatMessage({id: 'form.keyinfo.operate.link'})}
                            </Tag>
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <BaseModels 
                                        selectedDomain={operateInfo.stopInfo?.selectedDomain}
                                        selectedObject={operateInfo.stopInfo?.selectedObject}
                                        selectedModel={operateInfo.stopInfo?.selectedModel}
                                        pointMode={undefined}
                                        objectMode={undefined}
                                        needSelectPoint={true}
                                        onChange={(args) => {
                                            onOperateChange('stopInfo', args)
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <div>
                                <Tag color="blue">
                                    {intl.formatMessage({id: 'form.keyinfo.operate.linkvalue'})}
                                </Tag>                                
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <InputNumber 
                                        style={{width: '100%'}}
                                        value={operateInfo.stopValue}
                                        min={0} 
                                        onChange={(val) => {
                                            onOperateChange('stopValue', val)
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                }
                {
                    operateInfo.isWtg && <Row style={{ padding: '5px 0' }}>
                        <Col span={18}>
                            {intl.formatMessage({id: 'form.keyinfo.operate.reset'})}
                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Switch 
                                checked={operateInfo.useReset} 
                                onChange={(checked, e)=> onOperateChange('useReset', checked)}
                            />
                        </Col>
                    </Row>
                }
                <div style={{ padding: '5px 0'}}>
                    <span 
                        style={{ cursor: 'pointer', color: '#39e5ea'}} 
                        onClick={addOperateCustomize}
                    >{intl.formatMessage({id: 'form.keyinfo.operate.addCustomize'})}</span>
                </div>
                {(operateInfo.customize || []).map((l, index) => {
                    return <div key = {index} style={{border: '1px solid #bbb'}}>
                        <Row style={{ padding: '5px 0' }}>
                            <Col span={22}></Col>
                            <Col span={2} >
                                <span onClick={() => delOperateCustomize(index)}>
                                    <PureIcon type={IconType.WRONG_S}/>
                                </span>
                            </Col>
                        </Row>
                        <Row style={{ padding: '5px 0' }}>
                            <Col span={2}></Col>
                            <Col span={6} style={{alignSelf: 'center'}}>{intl.formatMessage({id: 'form.keyinfo.operate.nameZh'})}</Col>
                            <Col span={16}>
                               <Input 
                                    value={l.name}
                                    onChange={(e) => {onOperateCustomizeChange(index, 'name', e.target.value)}}
                                /> 
                            </Col>
                        </Row>
                        <Row style={{ padding: '5px 0' }}>
                            <Col span={2}></Col>
                            <Col span={6} style={{alignSelf: 'center'}}>{intl.formatMessage({id: 'form.keyinfo.operate.nameEn'})}</Col>
                            <Col span={16}>
                                <Input 
                                    value={l.name_en}
                                    onChange={(e) => {onOperateCustomizeChange(index, 'name_en', e.target.value)}}
                                />
                            </Col>
                        </Row>
                        <Row style={{ padding: '5px 0' }}>
                            <Col span={2}></Col>
                            <Col span={6} style={{alignSelf: 'center'}}>{intl.formatMessage({id: 'form.keyinfo.operate.icon'})}</Col>
                            <Col span={16}>
                                <Select 
                                    type = {'icon'} 
                                    style = {{width: '100%'}}
                                    incluedNo = {true}
                                    value = {l.icon}
                                    onChange = {(value) => {onOperateCustomizeChange(index, 'icon', value)}}
                                />
                            </Col>
                        </Row>
                        <div>
                            <div>
                                <Tag color="blue">
                                    {intl.formatMessage({id: 'form.keyinfo.operate.link'})}
                                </Tag>
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <BaseModels 
                                        selectedDomain={l.selectedDomain}
                                        selectedObject={l.selectedObject}
                                        selectedModel={l.selectedModel}
                                        pointMode={undefined}
                                        objectMode={undefined}
                                        needSelectPoint={true}
                                        onChange={(args) => {
                                            onOperateCustomizeChange(index, '', args);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <div>
                                <Tag color="blue">
                                    {intl.formatMessage({id: 'form.keyinfo.operate.linkvalue'})}
                                </Tag>                                
                            </div>
                            <Row style={{ padding: '5px 0' }}>
                                <Col span={2}>
                                </Col>
                                <Col span={22}>
                                    <InputNumber 
                                        style={{width: '100%'}}
                                        value={l.operateVal}
                                        min={0} 
                                        onChange={(val) => {
                                            onOperateCustomizeChange(index, 'operateVal', val)
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                })}
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(KeyInfoForm);