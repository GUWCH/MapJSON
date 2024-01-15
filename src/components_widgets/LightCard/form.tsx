import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import {Input, InputNumber, Select, Switch, Tooltip} from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import {
    SET_CONTENT,
} from './constant';

import styles from './form.mscss';

export interface LightCardPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const LightCardForm = (props: LightCardPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();

    props.current.props['lightCardProps'] = Object.assign(
        {}, 
        props.current.props.lightCardProps
    );

    const {
        lightCardProps
    } = props.current.props;


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

    const handlePropsChange = (obj) => {
        onChange({lightCardProps: Object.assign({}, lightCardProps, obj)});
    } 

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.lightCard.contentCfg'})} key="1">
                {SET_CONTENT.map((item, index) => {
                    let {key, desc, tip, type, options = [], ...rest} = item;
                    let ele;
                    switch (type) {
                        case 'select':
                            ele = <Select 
                                options = {options}
                                value = {lightCardProps[key]}
                                onChange = {(value) => {handlePropsChange({[key]: value})}}
                                {...rest}
                            />
                            break;
                        case 'input': 
                            ele = <Input 
                                value = {lightCardProps[key]}
                                onChange = {(e) => {handlePropsChange({[key]: e.target.value})}}
                            />
                            break;
                        case 'inputNumber':
                            ele = <InputNumber 
                                value = {lightCardProps[key]}
                                onChange = {(value) => {handlePropsChange({[key]: value})}}
                                {...rest}
                            />
                            break;
                        case 'switch':
                            ele = <Switch 
                                checked = {lightCardProps[key]}
                                onChange={(value) => {handlePropsChange({[key]: value})}} 
                            />
                            break;
                    }

                    return <div key={key} className={styles.propsItem}>
                        <span>
                            <span>{intl.formatMessage({id: `form.lightCard.${desc}`})}</span>
                            {
                                tip && 
                                <Tooltip 
                                    placement="top" 
                                    title={
                                        <div dangerouslySetInnerHTML={{
                                            __html: tip
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
                            }                             
                        </span>                        
                        {ele}
                    </div>
                })}
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(LightCardForm);