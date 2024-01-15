import React, { memo, useCallback, useState } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import styles from './form.module.scss';
import { useIntl } from 'react-intl';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { Col, Input, InputNumber, Popover, Row, Select, Space, Switch, Tooltip } from 'antd';
import { ITextAreaFormCfg, ITextFormCfg } from '.';
import ColorPick from 'ColorPick';
import { FontIcon, IconType } from 'Icon';

export interface PropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const Form = (props: PropsType & { type: 'text' | 'textArea' }) => {
    const intl = useIntl()
    const { current, config } = props

    const store = config.getStore();
    const change = useCallback(<FieldName extends keyof (ITextFormCfg & ITextAreaFormCfg)>(field: FieldName, value: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === current.id) {
                v.props[field] = value
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    }, [store, current])

    return <BaseInfo {...props}>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({ id: 'form.text.config' })} key={'1'}>
                <Space direction='vertical' style={{ width: '100%' }}>
                    {props.type === 'text' ?
                        <>
                            <Row align='middle'>
                                <Col span={10}>{intl.formatMessage({ id: 'form.text.content' })}</Col>
                                <Col span={14}>
                                    <Input value={current.props.content} maxLength={100} onChange={e => change('content', e.target.value)} />
                                </Col>
                            </Row>
                            <Row align='middle'>
                                <Col span={10}>{intl.formatMessage({ id: 'form.text.contentEn' })}</Col>
                                <Col span={14}>
                                    <Input value={current.props.contentEn} maxLength={100} onChange={e => change('contentEn', e.target.value)} />
                                </Col>
                            </Row>
                        </>
                        :
                        <>
                            <Row align='middle'>
                                <Col span={10}>{intl.formatMessage({ id: 'form.text.content' })}</Col>
                                <Col span={14}>
                                    <Input.TextArea value={current.props.content} maxLength={400} onChange={e => change('content', e.target.value)} />
                                </Col>
                            </Row>
                            <Row align='middle'>
                                <Col span={10}>{intl.formatMessage({ id: 'form.text.contentEn' })}</Col>
                                <Col span={14}>
                                    <Input.TextArea value={current.props.contentEn} maxLength={400} onChange={e => change('contentEn', e.target.value)} />
                                </Col>
                            </Row>
                        </>}
                    {props.type === 'textArea' && <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.fontSize' })}</Col>
                        <Col span={12}>
                            <InputNumber style={{ width: '100%' }} value={current.props.fontSize} onChange={e => change('fontSize', e)} />
                        </Col>
                        <Col span={2} style={{ paddingLeft: '4px' }}>px</Col>
                    </Row>}
                    {props.type === 'textArea' && <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.lineHeight' })}</Col>
                        <Col span={12}>
                            <InputNumber style={{ width: '100%' }} value={current.props.lineHeight} onChange={e => change('lineHeight', e)} />
                        </Col>
                        <Col span={2} style={{ paddingLeft: '4px' }}>px</Col>
                    </Row>}
                    <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.letterSpace' })}</Col>
                        <Col span={12}>
                            <InputNumber style={{ width: '100%' }} value={current.props.letterSpacing} onChange={e => change('letterSpacing', e)} />
                        </Col>
                        <Col span={2} style={{ paddingLeft: '4px' }}>px</Col>
                    </Row>
                    <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.font' })}
                            <Tooltip
                                placement="top"
                                title={intl.formatMessage({ id: 'form.text.fontDesc' })}
                                overlayStyle={{
                                    maxWidth: 500,
                                    fontSize: 12
                                }}
                            >
                                <FontIcon className={styles.question} type={IconType.QUESTION} />
                            </Tooltip>
                        </Col>
                        <Col span={14}>
                            <Select value={current.props.fontFamily} style={{ width: '100%' }} placeholder={intl.formatMessage({ id: 'form.text.selectFont' })} options={[
                                {
                                    value: '华文仿宋',
                                }, {
                                    value: '微软雅黑',
                                }, {
                                    value: 'Arial',
                                }, {
                                    value: 'Rajdhani'
                                }
                            ]} onChange={(e) => change('fontFamily', e?.toString())} />
                        </Col>
                    </Row>
                    {/* {props.type === 'text' && <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.scaleWidth' })}</Col>
                        <Col span={14}>
                            <Switch checked={current.props.scaleWidth} onChange={e => change('scaleWidth', e)} />
                        </Col>
                    </Row>} */}
                    <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.bold' })}</Col>
                        <Col span={14}>
                            <Switch checked={current.props.bold} onChange={e => change('bold', e)} />
                        </Col>
                    </Row>
                    <Row align='middle'>
                        <Col span={10}>{intl.formatMessage({ id: 'form.text.color' })}</Col>
                        <Col span={14}>
                            <ColorPick value={current.props.color} onColorChange={e => change('color', e)} />
                        </Col>
                    </Row>
                </Space>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>
}

export const TextForm = memo((props: PropsType) => <Form {...props} type='text' />)
export const TextAreaForm = memo((props: PropsType) => <Form {...props} type='textArea' />)