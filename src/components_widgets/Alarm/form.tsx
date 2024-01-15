import { daoIsOk, _dao } from '@/common/dao';
import {
    MenuOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space, Switch, Tooltip } from 'antd';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import React, { memo, useEffect, useState } from 'react';
import { useIntl } from "react-intl";
import { ReactSortable } from 'react-sortablejs';
import { AlarmTab, defaultAlarmTabs } from '.';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import { HISTORY_SC, isZh, MAX_RECORDS, PageSizeOption, PAGE_SIZE, TYPE_LIST } from './constant';

export interface AlarmFormPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const Alarm = (props: AlarmFormPropsType) => {
    const intl = useIntl();
    const store = props.config.getStore();
    const { maxRecords, historySc, pageSize, alarmTypes, hideBarOnOne } = props.current.props;
    const [alarmCondition, setAlarmContion] = useState<{
        type?: {
            id?: string | number;
            name_zh: string;
            name_en: string;
            value: string | number,
        }[]
    }>({});

    const onChange = (values: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = { ...v.props, ...values };
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    useEffect(() => {
        const fetchAlarmCondition = async () => {
            let alarmCondition: { [key: string]: any } = {};

            const resT = await _dao.getAlarmType();
            if (daoIsOk(resT)) {
                alarmCondition.type = resT.data;
            }

            setAlarmContion(alarmCondition);
        }

        fetchAlarmCondition();
    }, []);

    const handleAlarmTypeChange = (values: Array<string>) => {
        onChange({ alarmTypes: (alarmCondition.type ?? []).filter(f => values.indexOf(String(f.value)) > -1) })
    };

    const handleMaxRecordsChange = (e) => {
        onChange({ maxRecords: parseInt(e.target.value) });
    };

    const handleHistoryScChange = (e) => {
        onChange({ historySc: parseInt(e.target.value) });
    };

    const handlePageSizeChange = (values) => {
        onChange({ pageSize: parseInt(values) });
    };


    const handleTabsChange = (tabs: AlarmTab[]) => {
        onChange({ tabs: tabs })
    }
    // 指定默认值兼容老模板
    const tabs: AlarmTab[] = props.current.props.tabs || defaultAlarmTabs

    const getTabNameDom = (tab: AlarmTab) => {
        switch (tab.type) {
            case TYPE_LIST.ALARM:
                return <>
                    {intl.formatMessage({ id: 'form.alarm.tabs.majorStatusCode' })}
                </>
            case TYPE_LIST.ACTIVE_SC:
                return <Space>
                    {intl.formatMessage({ id: 'form.alarm.tabs.activeStatusCode' })}
                    <Tooltip title={intl.formatMessage({ id: 'form.alarm.tabs.useWarn' })}>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            default:
                return <Space>
                    {intl.formatMessage({ id: 'form.alarm.tabs.healthStatusCode' })}
                    <Tooltip title={<div>
                        {intl.formatMessage({ id: 'form.alarm.tabs.useWarn' })}<br/>
                        {intl.formatMessage({ id: 'form.alarm.tabs.permWarn' })}
                    </div>}>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
        }
    }

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({ id: 'form.alarm.tabs' })} key="1">
                <Space direction='vertical' size={'large'} style={{width: '100%'}}>
                    <div>
                        <Row align='middle'>
                            <Col span={12}>{intl.formatMessage({ id: 'form.alarm.tabs.hideOnOne' })}</Col>
                            <Col span={12}>
                                <Switch checked={hideBarOnOne} onChange={e => onChange({ hideBarOnOne: e })} />
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <ReactSortable list={tabs} setList={(newState) => {
                            handleTabsChange(newState)
                        }}>
                            {tabs.map((t, i) => <div
                                key={t.id}
                                style={{
                                    borderRadius: '5px',
                                    padding: '1em',
                                    marginBottom: '1em',
                                    background: '#fff',
                                    border: '1px solid #8c8c8c',
                                }}
                            >
                                <Space direction='vertical' style={{width: '100%'}}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '5px 0',
                                    }}>
                                        <Col span={6} >
                                            <MenuOutlined
                                                style={{ marginRight: 5, cursor: 'move' }}
                                            />
                                        </Col>
                                        <Col span={18}>
                                            {getTabNameDom(t)}
                                        </Col>
                                    </div>
                                    <Row align='middle'>
                                        <Col span={6}>
                                            名称
                                        </Col>
                                        <Col span={18}>
                                            <Input
                                                placeholder={'请输入名称'}
                                                style={{ width: '100%' }}
                                                value={t.name}
                                                onChange={e => {
                                                    const newTabs = tabs.map((old, index) => ({
                                                        ...old,
                                                        name: index === i ? e.target.value : old.name
                                                    }))
                                                    handleTabsChange(newTabs)
                                                }}
                                                allowClear={true}
                                            />
                                        </Col>
                                    </Row>
                                    <Row align='middle'>
                                        <Col span={6}>Name</Col>
                                        <Col span={18}>
                                            <Input
                                                placeholder={'Please Input Name'}
                                                style={{ width: '100%', marginTop: '5px' }}
                                                value={t.name_en}
                                                onChange={e => {
                                                    const newTabs = tabs.map((old, index) => ({
                                                        ...old,
                                                        name_en: index === i ? e.target.value : old.name_en
                                                    }))
                                                    handleTabsChange(newTabs)
                                                }}
                                                allowClear={true}
                                            />
                                        </Col>
                                    </Row>
                                    <Row align='middle'>
                                        <Col span={6}>{intl.formatMessage({ id: 'form.alarm.tabs.show' })}</Col>
                                        <Col span={18}>
                                            <Switch checked={t.show}
                                                onChange={v => {
                                                    const newTabs = tabs.map((old, index) => ({
                                                        ...old,
                                                        show: index === i ? v : old.show
                                                    }))
                                                    handleTabsChange(newTabs)
                                                }} />
                                        </Col>
                                    </Row>
                                </Space>
                            </div>)}
                        </ReactSortable>
                    </div>
                </Space>
            </CollapsePanel>
        </SingleCollapse>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({ id: 'form.alarm.alarmSet' })} key="1">
                <Row style={{ padding: '5px 0' }} align="middle">
                    <Col span={8}><span>{intl.formatMessage({ id: 'form.alarm.types' })}</span></Col>
                    <Col span={16}>
                        <Select
                            mode="multiple"
                            showArrow
                            showSearch={false}
                            placeholder={intl.formatMessage({ id: 'form.alarm.select' })}
                            maxTagCount={0}
                            style={{ width: '100%' }}
                            value={alarmTypes.map((ele) => ele.value)}
                            options={(alarmCondition.type || []).map(f => ({
                                label: isZh ? f.name_zh : f.name_en,
                                value: f.value
                            }))}
                            onChange={handleAlarmTypeChange}
                        >
                        </Select>
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }} align="middle">
                    <Col span={8}><span>{intl.formatMessage({ id: 'form.alarm.maxRecords' })}</span></Col>
                    <Col span={8}>
                        <Input
                            min={0}
                            max={1000}
                            step={'10'}
                            type={'number'}
                            value={maxRecords}
                            style={{ width: '90%' }}
                            onChange={handleMaxRecordsChange}
                        />
                    </Col>
                    <Col span={8}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                                onChange({ maxRecords: MAX_RECORDS });
                            }}
                        >
                            {intl.formatMessage({ id: 'form.alarm.reset' })}
                        </Button>
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }} align="middle">
                    <Col span={8}><span>{intl.formatMessage({ id: 'form.alarm.historySc' })}</span></Col>
                    <Col span={8}>
                        <Input
                            type={'number'}
                            min={0}
                            max={50}
                            step={'10'}
                            value={historySc}
                            style={{ width: '90%' }}
                            onChange={handleHistoryScChange}
                        />
                    </Col>
                    <Col span={8}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                                onChange({ historySc: HISTORY_SC });
                            }}
                        >
                            {intl.formatMessage({ id: 'form.alarm.reset' })}
                        </Button>
                    </Col>
                </Row>
                <Row style={{ padding: '5px 0' }} align="middle">
                    <Col span={8}><span>{intl.formatMessage({ id: 'form.alarm.pageSize' })}</span></Col>
                    <Col span={16}>
                        <Select
                            showArrow
                            showSearch={false}
                            style={{ width: '100%' }}
                            defaultValue={[PAGE_SIZE.toString()]}
                            value={[pageSize.toString()]}
                            options={PageSizeOption}
                            onChange={handlePageSizeChange}
                        >
                        </Select>
                    </Col>
                </Row>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo >;
}

export default memo(Alarm);