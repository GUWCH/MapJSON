import React, { useMemo, memo } from 'react';
import { FormattedMessage, useIntl } from "react-intl";
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { Input, Row, Col, Tooltip } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { InputTextSize } from '@/common/constants';
import styles from './style.mscss';
import { CardProfile } from '../Card/form';

export interface BasePropsType {
	data: {};
	current: IBlockType;
	config: UserConfig;
    children?: React.ReactNode | null;
    hasCard?: boolean;
};

const BaseInfo = (props: BasePropsType) => {
    const intl = useIntl();
    const {left, top, width, height} = props.current;
    const change = (field, e) => {
        const value = e.target.value;
        const store = props.config.getStore();
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v[field] = value ? Number(value) : 0;
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    }

    const rows = [
        [
            {name: 'width', label: intl.formatMessage({id: 'form.layout.width'}), value: width}, 
            {name: 'height', label: intl.formatMessage({id: 'form.layout.height'}), value: height}
        ], 
        [
            {name: 'left', label: intl.formatMessage({id: 'form.layout.left'}), value: left}, 
            {name: 'top', label: intl.formatMessage({id: 'form.layout.top'}), value: top}
        ]
    ];

    return <div>
        <div style={{
            textAlign: 'center',
            fontSize: 16,
            padding: '0 5px'
        }}>{props.config.componentCache[props.current.name].component.display}</div>
        {props.children}
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.layout.headline'})} key="1">
                {
                    rows.map((row, ind1) => 
                        <Row style={{ padding: '5px 0' }} key={ind1}>
                            {
                                row.map((ele, ind2) => 
                                    <Col className={styles.nowrap} key={ind2}>
                                        <span>{ele.label}</span>
                                        <Input 
                                            min={0}
                                            max={2000}
                                            style={{width: 100}} 
                                            type={'number'} 
                                            onChange={(e) => change(ele.name, e)} 
                                            value={ele.value} 
                                        /> px
                                    </Col>
                                )
                            }
                        </Row>
                    )
                }
            </CollapsePanel>
        </SingleCollapse>
    </div>
}

export default memo(BaseInfo);

export const BaseProfile = memo((props: BasePropsType) => {
    const intl = useIntl();
    const { title='', customAssetAlias='' } = props.current.props;
    const change = (field, e) => {
        const value = e.target.value;
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

    return <>
        <SingleCollapse>
            <CollapsePanel header={<FormattedMessage id='form.base.headline'/>} key="1">
                {(typeof props.hasCard === 'undefined' || props.hasCard) ? <CardProfile {...props}/> : null}
                <Row style={{ padding: '5px 0' }}>
                    <Col span={12}>
                        <div style={{
                            display: 'flex',
                            height: '100%',
                            alignItems: 'center'
                        }}>
                            <span><FormattedMessage id='form.base.asset' /></span>
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
                                <QuestionCircleFilled 
                                    style={{cursor: 'help'}}
                                />
                            </Tooltip>                            
                        </div>                        
                    </Col>
                    <Col span={12}>
                        <Input 
                            type={'text'} 
                            onChange={(e) => change('customAssetAlias', e)} 
                            value={customAssetAlias} 
                            maxLength={InputTextSize.Alias}
                        />
                    </Col>
                </Row>
                {props.children}
            </CollapsePanel>
        </SingleCollapse>
    </>
});