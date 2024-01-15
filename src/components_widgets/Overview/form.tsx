import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl, FormattedMessage } from "react-intl";
import {Divider, InputNumber, Select, Tooltip, Input} from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels from '@/components_utils/models';
import { InputTextSize } from '@/common/constants';
import {TYPES, FONTS} from './constants';
import {FontIcon, IconType} from 'Icon';
import { OverviewItem } from './App';
import styles from './style.mscss';

interface OverviewPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const overviewItemDefault : OverviewItem = {
    type: 'droplet', 
    limitNum: 3, 
    colNum: 3, 
    model: undefined,
    otherModelList: []
}

const randomString = () => {    
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (let i = 0; i < 8; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

const OtherModels = (props) => {

    const intl = useIntl();

    const {list = [], onChange} = props;

    const handleAdd = () => {

        list.push({
            key: randomString(),
            customAssetAlias: '',
            selectedDomain: null,
            selectedObject: null
        })

        onChange(list)
    }

    const handleChange = (key, value) => {
        let item = list.find(l => l.key === key);
        Object.assign(item, value)
        onChange(list);
    }

    const handleDelete = (key) => {
        let newList = list.filter(l => l.key !== key);
        onChange(newList);
    }

    return <div className={styles.addModel}>
        <div className={styles.addModelDes}>
            <span onClick={handleAdd}>
                <FormattedMessage id='form.overview.addOtherModel' />
            </span>
        </div>
        {list.map((ele, index) => {
            let {key, customAssetAlias = '', selectedDomain, selectedObject} = ele;

            return <div key={index} className = {styles.modelItem}>
                <div className={styles.delete}>
                    <FontIcon type={IconType.WRONG_S} onClick = {() => handleDelete(key)}/>
                </div>
                <Divider style={{margin: '5px 0'}}/>
                <div className={styles.asset}>
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
                    <Input 
                        type={'text'} 
                        onChange={(e) => {
                            handleChange(key, {'customAssetAlias': e.target.value});
                        }}
                        value={customAssetAlias} 
                        maxLength={InputTextSize.Alias}
                    />
                </div>
                <div className={styles.modelSelect}>
                    <BaseModels 
                        selectedDomain={selectedDomain}
                        selectedObject={selectedObject}
                        pointMode={'multiple'}
                        needSelectPoint={true}
                        onChange={(val) => handleChange(key, val)}
                    />
                </div>
                {/* <PointsSet 
                    contentItem = {ele}
                    domains = {domains}
                    modelMap = {modelMap}
                    onChange = {(val) => {
                        handleChange(key, val)
                    }}
                    onModelChange = {onModelChange}
                /> */}
            </div>
        })}
    </div>

}

const OverviewForm = (props: OverviewPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();

    const {
        overviewProps = []
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

    const addOverview = () => {
        let newOverviewProps = [...overviewProps];
        newOverviewProps.push({...overviewItemDefault})
        onChange({overviewProps: newOverviewProps});
    }

    const handleDelete = (index) => {
        let newOverviewProps = [...overviewProps];
        newOverviewProps.splice(index, 1);
        onChange({overviewProps: newOverviewProps});
    }

    const handleTypeChange = (index, type:string) => {
        let newOverviewProps = [...overviewProps];
        newOverviewProps[index] = Object.assign(
            {}, 
            newOverviewProps[index], 
            {type: type}
        )
        onChange({overviewProps: newOverviewProps});
    }

    const handleCommonChange = (index, keyStr: string, val: any) => {
        let newOverviewProps = [...overviewProps];
        newOverviewProps[index] = Object.assign(
            {}, 
            newOverviewProps[index], 
            {[keyStr]: val}
        )
        onChange({overviewProps: newOverviewProps});
    }

    const handlePointsChange = (index, value) => {
        let newOverviewProps = [...overviewProps];
        newOverviewProps[index] = Object.assign(
            {}, 
            newOverviewProps[index], 
            {model: value}
        )
        onChange({overviewProps: newOverviewProps});
    }

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.overview.contentCfg'})} key="1">
                <div className={styles.form}>
                    <span className={styles.add} onClick={addOverview}>{intl.formatMessage({id: 'form.overview.add'})}</span>
                    {
                        overviewProps.map((o, index) => {
                            const {type = '', limitNum = 3, colNum = 3, model, numFont = 'defaultFont', otherModelList = []} = o;

                            return <div key = {index} className={styles.items}>
                                <div className={styles.delete} onClick = {() => handleDelete(index)}>X</div>
                                <Divider />
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.overview.typeSelect'})}</span>
                                    <div className={styles.action}>{
                                        <Select 
                                            style={{width: '225px'}}
                                            options={TYPES}
                                            value = {type}
                                            onChange = {(val) => handleTypeChange(index, val)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.overview.limitNumber'})}</span>
                                    <div className={styles.action}>{
                                        <InputNumber 
                                            min = {0}
                                            value = {limitNum}
                                            onChange = {(num) => handleCommonChange(index, 'limitNum', num)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.overview.colNum'})}</span>
                                    <div className={styles.action}>{
                                        <InputNumber 
                                            min = {0}
                                            value = {colNum}
                                            onChange = {(num) => handleCommonChange(index, 'colNum', num)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.overview.font'})}</span>
                                    <div className={styles.action}>{
                                        <Select 
                                            style={{width: '225px'}}
                                            options={FONTS}
                                            value = {numFont}
                                            onChange = {(val) => handleCommonChange(index, 'numFont', val)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.modelSelect}>
                                    <BaseModels 
                                        selectedDomain={model?.selectedDomain}
                                        selectedObject={model?.selectedObject}
                                        pointMode={'multiple'}
                                        needSelectPoint={true}
                                        onChange={(val) => handlePointsChange(index, val)}
                                    />
                                </div>
                                <OtherModels 
                                    list = {otherModelList}
                                    onChange = {(val) => handleCommonChange(index, 'otherModelList', val)}
                                />
                            </div>
                        })
                    }
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(OverviewForm);