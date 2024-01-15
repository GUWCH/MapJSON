import React, { useMemo, memo,useState } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { useIntl } from "react-intl";
import {Divider, Input, InputNumber, Radio,Col, Row } from 'antd';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import BaseModels, {DomainModel, ObjectModel} from '@/components_utils/models';
import {DIRECTIONS} from './constants.js';
import { uuid } from '@/common/utils';
import {createFromIconfontCN,BoldOutlined} from '@ant-design/icons'
import styles from './style.mscss';

export interface GridPropsType {
    data: {};
    current: IBlockType;
    config: UserConfig;
};

const IconFont = createFromIconfontCN({
    scriptUrl: [
      '//at.alicdn.com/t/font_1788044_0dwu4guekcwr.js', // icon-javascript, icon-java, icon-shoppingcart (overridden)
      '//at.alicdn.com/t/font_1788592_a5xf2bdic3u.js', // icon-shoppingcart, icon-python
    ],
  });

export interface GridItem {
    uid: string;
    assetName: string;
    assetAlias: string;
    model?:{
        selectedDomain?: DomainModel;
        selectedObject?: ObjectModel;
        selectedModel?:string;
    }    
}

export interface GridForm {
    direction?: 'horizontal' | 'vertical',
    quotaNum?: number,
    firstColWidth?: number,
    assetList?: GridItem[],
    gridStyle?:number,
    fontWeight:'initial' | 'bold'
}

export const gridDefault: GridForm = {
    direction: 'horizontal',
    quotaNum: 4,
    firstColWidth: 40,
    assetList: [],
    gridStyle:14,
    fontWeight:'initial'
}

const gridItemDefault: GridItem = {
    assetName: '',
    assetAlias: '',
    model: undefined
}

const GridForm = (props: GridPropsType) => {
    const intl = useIntl();

    const store = props.config.getStore();
    const [boldState,setBoldState] = useState(false)
    const {
        gridProps = {}
    } = props.current.props;
    const {direction, quotaNum, firstColWidth,gridStyle,fontWeight, assetList} = Object.assign({}, gridDefault, gridProps);
    const onChange = (value: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = { ...v.props, ...value };
            }
            return v;
        });
        // console.log('change params',{ ...cloneData, block: [...newblock] })
        store.setData({ ...cloneData, block: [...newblock] });
    };

    const addItem = () => {
        let id = uuid(8);
        let newAssetList  = [...assetList];
        newAssetList.push({id, ...gridItemDefault})
        onChange({gridProps: Object.assign({}, gridProps, {assetList: newAssetList})});
    }

    const handleChange = (keyStr: string, val: any) => {
        onChange({gridProps: Object.assign({}, gridProps, {[keyStr]: val})});
    }

    const handleDelete = (index) => {
        let newAssetList = [...assetList];
        newAssetList.splice(index, 1);
        handleChange('assetList', newAssetList);
    }

    const handleAssetItemChange = (index, keyStr, value) => {
        let newAssetList = [...assetList];
        newAssetList[index] = Object.assign(
            {}, 
            newAssetList[index], 
            {[keyStr]: value}
        )
        handleChange('assetList', newAssetList);
    }
    const changeStyle = (param)=>{
        let value
        if(gridProps.fontWeight == 'bold'){
            value = 'initial'
            setBoldState(false)
        }else{
            value = 'bold'
            setBoldState(true)
        }
        onChange({gridProps: Object.assign({}, gridProps, {['fontWeight']: value})});
    }
    return <BaseInfo {...props}>
        <BaseProfile {...props}></BaseProfile>
        <SingleCollapse>
            <CollapsePanel header={intl.formatMessage({id: 'form.grid.contentCfg'})} key="1">
                <div className={styles.form}>
                    <Row className={styles.formRow}>
                    <Col  className={`${styles.formCol} ${styles.item}`} span={12}>
                        <span>{intl.formatMessage({id: 'form.grid.direction'})}</span>
                    </Col>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>
                    <div >{
                            <Radio.Group 
                                options = {DIRECTIONS}
                                value = {direction}
                                onChange = {(e) => handleChange('direction', e.target.value)}
                            />
                        }</div>
                    </Col>
                    </Row>
                    <Row>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>
                        <span>{intl.formatMessage({id: 'form.grid.quotaNum'})}</span>
                    </Col>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>    
                        <div >{
                            <InputNumber
                                min={0}
                                value = {quotaNum}
                                onChange = {(val) => handleChange('quotaNum', val)}
                            />
                        }</div>
                    </Col>
                    </Row>
                    <Row>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>
                        <span>{intl.formatMessage({id: 'form.grid.firstColWidth'})}</span>
                    </Col>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}> 
                        <div >{
                            <InputNumber
                                min={0}
                                max={100}
                                value = {firstColWidth}
                                onChange = {(val) => handleChange('firstColWidth', val)}
                            />
                        }%</div>
                    </Col>
                    </Row>
                    <Row>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>
                        <span>{intl.formatMessage({id: 'form.grid.style'})}</span>
                    </Col>
                    <Col className={`${styles.formCol} ${styles.item}`} span={12}>   
                     {/*className={styles.action}  */}
                        <div >{
                            <InputNumber
                                min={10}
                                // max={40}
                                value = {gridStyle}
                                onChange = {(val) => handleChange('gridStyle', val)}
                            />
                        }<BoldOutlined className={[styles.outline,boldState||fontWeight=='bold'?styles.outlineActive:''].join(' ')} onClick={()=>changeStyle('bold')}/></div>
                    </Col>
                    </Row>
                    <span className={styles.add} onClick={addItem}>{intl.formatMessage({id: 'form.grid.add'})}</span>
                    {
                        assetList.map((o, index) => {
                            const {
                                assetName,
                                assetAlias,
                                model
                            } = o;
                            return <div key = {index} className={styles.items}>
                                <div className={styles.delete} onClick = {() => handleDelete(index)}>X</div>
                                <Divider />
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.grid.assetName'})}</span>
                                    <div className={styles.action}>{
                                        <Input 
                                            style={{width: '225px'}}
                                            value = {assetName}
                                            onChange = {(e) => handleAssetItemChange(index, 'assetName', e.target.value)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.item}>
                                    <span>{intl.formatMessage({id: 'form.grid.assetAlias'})}</span>
                                    <div className={styles.action}>{
                                        <Input 
                                            style={{width: '225px'}}
                                            value = {assetAlias}
                                            onChange = {(e) => handleAssetItemChange(index, 'assetAlias', e.target.value)}
                                        />
                                    }</div>
                                </div>
                                <div className={styles.modelSelect}>
                                    <BaseModels 
                                        selectedDomain={model?.selectedDomain}
                                        selectedObject={model?.selectedObject}
                                        selectedModel={model?.selectedModel}
                                        pointMode={'multiple'}
                                        needSelectPoint={true}
                                        onChange={(val) => handleAssetItemChange(index,'model', val)}
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
            </CollapsePanel>
        </SingleCollapse>
    </BaseInfo>;
}

export default memo(GridForm);