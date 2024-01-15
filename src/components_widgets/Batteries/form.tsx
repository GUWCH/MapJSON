import React, { useMemo, memo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import { Radio, Checkbox, InputNumber, Divider} from 'antd';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels, {PointModel} from '@/components_utils/models';
import ColorPick from 'ColorPick';
import {MODE_LIST, VOL_TEMP, DIRECTIONS, DEFAULT_FULL_CONTENT} from './constant';

import styles from './style.mscss';

export interface BatteriesPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

export interface BatteriesItem {
    mode: string;
    ContentTypes: Array<{
        type: string;
        point: PointModel;
        colNum: number;
        direction: string;
        textColor: string;
        minMaxColor: Array<string>;
    }>;
}

const BatteriesForm = (props: BatteriesPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();

    const {
        batteriesProps = {}
    } = props.current.props;

    const {pack = null, modes = []} = batteriesProps;
    const fullMode = modes.find(m => m.mode === 'full');

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

    const handleModesChange = (modeStrs:Array<string>) => {
        onChange({batteriesProps: Object.assign({}, batteriesProps, {
        }, {modes: modeStrs.map((modeStr) => {
            const {modes = []} = batteriesProps;
            const oldMode = modes.find(ele => ele.mode === modeStr);
            if(modeStr === 'full'){
                return oldMode || {
                    mode: modeStr,
                    contentTypes: DEFAULT_FULL_CONTENT
                }
            }else{
                // 预留极值模式
                return oldMode || {
                    mode: modeStr,
                }
            }
        })})});
    }

    const handlePackChange = (value) => {
        onChange({batteriesProps: Object.assign({}, batteriesProps, {
        }, {pack: value})});

    } 

    const handleContentTypesChange = (types) => {
        let newBatteriesProps = Object.assign({}, batteriesProps);
        let {pack = null, modes = []} = newBatteriesProps;
        let fullMode = modes.find(m => m.mode === 'full');
        fullMode.contentTypes = types.map((typeStr) => {
            const oldTypeEle = fullMode.contentTypes.find(ele => ele.type === typeStr);
            return oldTypeEle || DEFAULT_FULL_CONTENT.find(ele => ele.type === typeStr);
        })

        onChange({batteriesProps: newBatteriesProps});
    }

    const handleFullTypeItemChange = (type, prop) => {
        let newBatteriesProps = Object.assign({}, batteriesProps);
        let {pack = null, modes = []} = newBatteriesProps;
        let fullMode = modes.find(m => m.mode === 'full');
        fullMode.contentTypes = fullMode.contentTypes.map((content) => {
            if(content.type === type){
                return Object.assign({}, content, prop);
            }else{
                return content;
            }
        })

        onChange({batteriesProps: newBatteriesProps});
    }

    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.batteries.contentCfg'})} key="1">
                <div className={styles.form}>
                    <div className={styles.item}>
                        <span>{intl.formatMessage({id: 'form.batteries.modeSelect'})}</span>
                        <div className={styles.action}>{
                            <Checkbox.Group 
                                options = {MODE_LIST}
                                value = {modes.map(item => item.mode)}
                                onChange = {handleModesChange}
                            />
                        }</div>
                        
                    </div>
                    <div className={styles.modelSelect}>
                        <span>{intl.formatMessage({id: 'form.batteries.packNum'})}</span>
                        <BaseModels 
                            selectedDomain={pack?.selectedDomain}
                            selectedObject={pack?.selectedObject}
                            objectMode={undefined}
                            needSelectPoint={true}
                            onChange={handlePackChange}
                        />
                    </div>
                    {fullMode ? <div className={styles.full}>
                        <Divider orientation="left" plain>{intl.formatMessage({id: 'form.batteries.full'})}</Divider>
                        <div className={styles.typeSelect}>
                            {
                                <Checkbox.Group 
                                    options = {VOL_TEMP.map(e => {return {label: e.name, value: e.value}})}
                                    value = {fullMode.contentTypes.map(item => item.type)}
                                    onChange = {handleContentTypesChange}
                                />
                            }
                        </div>
                        {
                            fullMode.contentTypes.map((contentType, index) => {

                                return <div key = {index} className={styles.fullType}>
                                    <span>{VOL_TEMP.find(ele => ele.value === contentType.type)?.name || ''}</span>
                                    <BaseModels 
                                        selectedDomain={contentType?.point?.selectedDomain}
                                        selectedObject={contentType?.point?.selectedObject}
                                        objectMode={undefined}
                                        needSelectPoint={true}
                                        onChange={(value) => handleFullTypeItemChange(contentType.type, {point: value})}
                                    />
                                    <div className={styles.fullItem}>
                                        <span>{intl.formatMessage({id: 'form.batteries.unitNum'})}</span>
                                        <InputNumber 
                                            value={contentType.colNum} 
                                            onChange={(value) => handleFullTypeItemChange(contentType.type, {colNum: value})}
                                        />
                                    </div>
                                    <div className={styles.fullItem}>
                                        <span>{intl.formatMessage({id: 'form.batteries.direction'})}</span>
                                        <Radio.Group 
                                            options = {DIRECTIONS} 
                                            value = {contentType.direction}
                                            onChange={(e) => handleFullTypeItemChange(contentType.type, {direction:e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.fullItem}>
                                        <span>{intl.formatMessage({id: 'form.batteries.textColor'})}</span>
                                        <div>
                                            <ColorPick 
                                                value = {contentType.textColor}
                                                onColorChange={(value) => handleFullTypeItemChange(contentType.type, {textColor: value})}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.fullItem}>
                                        <span>{intl.formatMessage({id: 'form.batteries.minMaxColor'})}</span>
                                        <div>
                                            <ColorPick 
                                                value = {contentType.minMaxColor[0]}
                                                onColorChange = {(value) => handleFullTypeItemChange(contentType.type, {minMaxColor: [value, contentType.minMaxColor[1]]})}
                                            />
                                            <span>&nbsp;-&nbsp;</span>
                                            <ColorPick 
                                                value = {contentType.minMaxColor[1]}
                                                onColorChange = {(value) => handleFullTypeItemChange(contentType.type, {minMaxColor: [contentType.minMaxColor[0], value]})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div> : null}
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(BatteriesForm);