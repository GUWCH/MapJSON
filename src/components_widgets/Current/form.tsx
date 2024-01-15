import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import { Select, Checkbox, Input, InputNumber, Divider, Tooltip } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels from '@/components_utils/models';

import {TYPE_LIST, actionWidth, DEFAULT_DISPERSE} from './constant';
import styles from './style.mscss';

export interface CurrentPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const ChartLine = (props: CurrentPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();

    const {
        types = [],
        curAlias = '',
        disperseProps = {}
    } = props.current.props;

    const {threshold = DEFAULT_DISPERSE} = disperseProps;

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

    const handleTypesChange = (types) => {

        onChange({types: types});
    }

    const handleDispersePropsChange = (value) => {
        onChange({disperseProps: Object.assign({}, disperseProps, {
    }, value)});
    }

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.current.contentCfg'})} key="1">
                <div className={styles.form}>
                    <div className={styles.item}>
                        <span>{intl.formatMessage({id: 'form.current.type'})}</span>
                        <div className={styles.action}>{
                            <Checkbox.Group 
                                options = {TYPE_LIST}
                                value = {types}
                                onChange = {handleTypesChange}
                            />
                        }</div>
                        
                    </div>
                    <div className={styles.item}>
                        <span>{intl.formatMessage({id: 'form.current.currentQuota'})}</span>
                        <Tooltip 
                            placement="top" 
                            title={
                                <div dangerouslySetInnerHTML={{
                                    __html:intl.formatMessage({id: 'form.current.currentQuotaInfo'}) 
                                }}></div>
                            }
                            overlayStyle={{
                                maxWidth: 500,
                                fontSize: 12
                            }}
                        >
                            &nbsp;<QuestionCircleFilled 
                                style={{cursor: 'help'}}
                            />
                        </Tooltip>
                        <div className={styles.action}>
                            <Input 
                                placeholder={intl.formatMessage({id: 'form.current.inputQuota'})}
                                style={{ width: actionWidth}}
                                value = {curAlias}
                                onChange = {(e) => {
                                    onChange({curAlias: e.target.value})
                                }}
                            />
                        </div>
                    </div>
                    {types.indexOf('disperse') > -1 ? <>
                        <Divider orientation="left" plain>{intl.formatMessage({id: 'form.current.disperse'})}</Divider>
                        
                        {/* <div className={styles.item}>
                            <span>{intl.formatMessage({id: 'form.current.disperseThreshold'})}</span>
                            <div className={styles.action}>
                                <Input
                                    style={{width: 200}}
                                    suffix = '%'
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        ((!isNaN(value)) || value === '') && onChange({
                                            disperseProps: Object.assign({}, 
                                                disperseProps, 
                                                {threshold: value === '' ? DEFAULT_DISPERSE : value}
                                            )
                                        })}}
                                    value={threshold}
                                />
                            </div>
                        </div> */}
                        <BaseModels 
                            selectedDomain={disperseProps.selectedDomain}
                            selectedObject={disperseProps.selectedObject}
                            objectMode={undefined}
                            needSelectPoint={true}
                            onChange={handleDispersePropsChange}
                        />
                    </> : null}
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(ChartLine);