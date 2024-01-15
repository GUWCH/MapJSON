import React, { memo, useMemo } from 'react';
import { useIntl } from "react-intl";
import { Checkbox, Col, Input, Row } from 'antd';
import ColorPick from 'ColorPick';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { InputTextSize } from '@/common/constants';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';

interface BasePropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
    children?: React.ReactNode | null
};

export const defaultCardProps: Partial<CommonConfigure> = {
    title: '', 
    title_en: '', 
    needTitleSign: false, 
    titleSignColor: 'rgba(0, 181, 255, 1)',
    bg_enable: true, 
    bg_color: 'rgba(63, 109, 133, 0.22)', 
    divide_enable: false,
    divide_color: 'rgba(0, 179, 255, 1)',
    divide_loc: ['bottom']
}

const setItemStyle = {display: 'flex', justifyContent: 'right'};

export const CardProfile = memo((props: BasePropsType) => {
    const intl = useIntl();

    const { 
        title, 
        title_en, 
        needTitleSign, 
        titleSignColor,
        bg_enable, 
        divide_enable,
        divide_color,
        divide_loc,
    } = Object.assign({}, defaultCardProps, props.current.props);

    const locOptions = useMemo(() => [
        {
            label: intl.formatMessage({id: 'form.card.left'}),
            value: 'left'
        },
        {
            label: intl.formatMessage({id: 'form.card.top'}),
            value: 'top'
        },
        {
            label: intl.formatMessage({id: 'form.card.right'}),
            value: 'right'
        },
        {
            label: intl.formatMessage({id: 'form.card.bottom'}),
            value: 'bottom'
        }
    ], []);

    const change = (field, value) => {
        const store = props.config.getStore();
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props[field] = value;
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    }

    const backgroundRender = <>
        <Row style={{ padding: '5px 0' }}>
            <Col span={12}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.bgEnable'})}
                </div>
            </Col>
            <Col span={12} style={setItemStyle}>
                <Checkbox
                    onChange={(e) => change('bg_enable', e.target.checked)}
                    checked={bg_enable}
                />
            </Col>
        </Row>
    </>

    const divideRender = <>
        <Row style={{ padding: '5px 0' }}>
            <Col span={12}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.divideEnable'})}
                </div>
            </Col>
            <Col span={12} style={setItemStyle}>
                <Checkbox
                    onChange={(e) => change('divide_enable', e.target.checked)}
                    checked={divide_enable}
                />
            </Col>
        </Row>
        {divide_enable ? <>
            <Row style={{ padding: '5px 0' }}>
                <Col offset={2} span={10}>
                    <div style={{
                        display: 'flex',
                        height: '100%',
                        alignItems: 'center'
                    }}>
                        {intl.formatMessage({id: 'form.card.divideColor'})}
                    </div>
                </Col>
                <Col span={12} style={setItemStyle}>
                    <ColorPick
                        onColorChange={(val) => change('divide_color', val)}
                        value={divide_color}
                    />
                </Col>
            </Row>
            <Row style={{ padding: '5px 0' }}>
                <Col offset={2} span={6}>
                    <div style={{
                        display: 'flex',
                        height: '100%',
                        alignItems: 'center'
                    }}>
                        {intl.formatMessage({id: 'form.card.divideLoc'})}
                    </div>
                </Col>
                <Col span={16} style = {setItemStyle}>
                    <Checkbox.Group
                        options={locOptions}
                        onChange={(checkedValue) => change('divide_loc', checkedValue)}
                        value={divide_loc}
                    />
                </Col>
            </Row>
        </>: null}
    </>
    const changeTitle = (values) => {
        console.log(values);
    }
    return <>
        <Row style={{ padding: '5px 0' }}>
            <Col span={12}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.cnName'})}
                </div>
            </Col>
            <Col span={12}>
                <Input
                    type={'text'}
                    onChange={(e) => change('title', e.target.value)}
                    value={title}
                    maxLength={InputTextSize.Simple}
                />
            </Col>
        </Row>
        <Row style={{ padding: '5px 0' }}>
            <Col span={12}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.enName'})}
                </div>
            </Col>
            <Col span={12}>
                <Input
                    type={'text'}
                    onChange={(e) => change('title_en', e.target.value)}
                    value={title_en}
                    maxLength={InputTextSize.Simple}
                />
            </Col>
        </Row>
        <Row style={{ padding: '5px 0' }}>
            <Col span={12}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.needTitleSign'})}
                </div>
            </Col>
            <Col span={12} style={setItemStyle}>
                <Checkbox
                    onChange={(e) => change('needTitleSign', e.target.checked)}
                    checked={needTitleSign}
                />
            </Col>
        </Row>
        {needTitleSign ? <Row style={{ padding: '5px 0' }}>
            <Col offset={2} span={10}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center'
                }}>
                    {intl.formatMessage({id: 'form.card.titleSignColor'})}
                </div>
            </Col>
            <Col span={12} style={setItemStyle}>
                <ColorPick
                    onColorChange={(val) => change('titleSignColor', val)}
                    value={titleSignColor}
                />
            </Col>
        </Row>: null}
        {backgroundRender}
        {divideRender}
    </>
});