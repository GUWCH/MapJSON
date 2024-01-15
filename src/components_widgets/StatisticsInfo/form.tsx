import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import { Divider, Input} from 'antd';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels, {PointModel} from '@/components_utils/models';
import {FontIcon, IconType} from 'Icon';
import {uuid} from '@/common/utils';
import styles from './style.mscss';

export interface StatisticsPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const StatisticsForm = (props: StatisticsPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();

    const {
        statisticsProps = {title: {name: null, left: null, right: null}, devices: []} 
    } = props.current.props;

    const {title = {}, devices = []} = statisticsProps;

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

    const addDevice = () => {
        let temp = Array.from(devices, x => x);

        temp.push({
            key: uuid(8),
            name_cn: '',
            name_en: '',
            count: null,
            total: null
        });

        onChange({statisticsProps: Object.assign({}, statisticsProps, {devices: temp})});
    }

    const delDevice = (key) => {
        let temp = Array.from(devices, x => x);

        const delInd = temp.findIndex(t => temp.key === key);

        temp.splice(delInd, 1);

        onChange({statisticsProps: Object.assign({}, statisticsProps, {devices: temp})});
    }

    const handleTitleChange = (filed: string, value: {[key: string]: any}) => {
        let temp = Object.assign({}, title);
        if(temp[filed]){
            Object.assign(temp[filed], value);
        }else{
            temp[filed] = Object.assign({}, value);
        }
        
        onChange({statisticsProps: Object.assign({}, statisticsProps, {title: temp})})
    }

    const handleDevicesChange = (key, value) => {
        let temp = Array.from(devices, x => x);

        temp.forEach(t => {
            if(t.key === key){
                Object.assign(t, value);
            }
        });

        onChange({statisticsProps: Object.assign({}, statisticsProps, {devices: temp})})

    }

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.statisticsInfo.contentCfg'})} key="1">
                <div className={styles.form}>
                    {['name', 'left', 'right'].map((keyStr, index) => {
                        return <div key={index} className={styles.item}>
                            <span>{intl.formatMessage({id: `form.statisticsInfo.${keyStr}`})}</span>
                            <BaseModels 
                                selectedDomain={title[keyStr]?.selectedDomain}
                                selectedObject={title[keyStr]?.selectedObject}
                                objectMode={undefined}
                                needSelectPoint={true}
                                onChange={val => {handleTitleChange(keyStr, val)}}
                            />
                        </div>
                    })}
                    <div style={{ padding: '5px 0'}}>
                        <span 
                            style={{ cursor: 'pointer', color: '#39e5ea'}} 
                            onClick={addDevice}
                        >{intl.formatMessage({id: 'form.statisticsInfo.addDevice'})}</span>
                    </div>
                    {devices.map((ele, index) => {
                        return <div className={styles.itemBox}>
                            <div className={styles.delete}>
                                <FontIcon type={IconType.WRONG_S} onClick = {() => delDevice(ele.key)}/>
                            </div>
                            <Divider style={{margin: '5px 0'}}/>
                            <div key={index} className={styles.itemInput}>
                                <span>{intl.formatMessage({id: `form.statisticsInfo.nameZh`})}</span>
                                <Input 
                                    style={{width: '225px'}}
                                    value={ele.name_cn}
                                    onChange={e => {handleDevicesChange(ele.key, {name_cn: e.target.value})}}
                                />
                            </div>
                            <div key={index} className={styles.itemInput}>
                                <span>{intl.formatMessage({id: `form.statisticsInfo.nameEn`})}</span>
                                <Input 
                                    style={{width: '225px'}}
                                    value={ele.name_en}
                                    onChange={e => {handleDevicesChange(ele.key, {name_en: e.target.value})}}
                                />
                            </div>
                            <div key={index} className={styles.item}>
                                <span>{intl.formatMessage({id: `form.statisticsInfo.count`})}</span>
                                <BaseModels 
                                    selectedDomain={ele['count']?.selectedDomain}
                                    selectedObject={ele['count']?.selectedObject}
                                    objectMode={undefined}
                                    needSelectPoint={true}
                                    onChange={val => {handleDevicesChange(ele.key, {count: val})}}
                                />
                            </div>
                            <div key={index} className={styles.item}>
                                <span>{intl.formatMessage({id: `form.statisticsInfo.total`})}</span>
                                <BaseModels 
                                    selectedDomain={ele['total']?.selectedDomain}
                                    selectedObject={ele['total']?.selectedObject}
                                    objectMode={undefined}
                                    needSelectPoint={true}
                                    onChange={val => {handleDevicesChange(ele.key, {total: val})}}
                                />
                            </div>
                        </div>
                    })}
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(StatisticsForm);