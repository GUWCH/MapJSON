import React, { useEffect, useRef, useState } from "react";
import { Checkbox, Drawer, InputNumber, Select } from "antd";
import PointSelect from 'PointSelect';
import {
    pointTypes,
    timeOptions,
    CHART_LIMIT_NUM,
    TIME_LIMIT_NUM,
    pointDropDown,
    timeDropDown,
    isZh,
    msg,
    defaultAxisProps,
    getDefaultValue,
    DATE_TYPE,
    TITLE_SET
} from './constant';
import lodash from 'lodash';
import {groupByTableNo} from '@/common/util-scada';
import { FontIcon, IconType } from 'Icon';
import {PrimaryButton, DefaultButton} from 'Button';
import { DropDown, StyledModal } from '@/components'; 
import styles from './style.mscss';

interface Point {
    key: string;
    name: string;
    table_no: number | string;
}

interface Item {
    timeGran: string;
    interval: string;
    points: Array<Point>;
    yLeftMin: string; 
    yLeftMax: string;
    yRightMin: string;
    yRightMax: string;
}

interface SetProps {
    visible: boolean;
    timeSelectEnable: boolean;
    contentData: Array<Point>;
    cacheCfg:{
        titleEnable: boolean,
        titleTextEn: string,
        titleTextCn: string,
        userConfig: Array<Item>;
    }
    
    // resetUserConfig: Array<Item>;
    onVisitableChange: Function;
    onSave: Function;
}

const getChartOptions = (ele) => {
    const {tplPoints, otherModelList = []} = ele;

    let chartOptions = [];
    let temp = groupByTableNo((tplPoints || []).map((point) => {
        const {name_cn, name_en, key, table_no} = point;
        return {
            name: isZh ? name_cn : name_en,
            key : key,
            tableNo: table_no
        }
    }), pointTypes, false, false);

    const typeKeyList = pointTypes.map(t => t.typeKey);
    temp.map(t => {
        if(typeKeyList.indexOf(t.key) > -1){
            return t.pId = 'self';
        }
    })
    chartOptions = [...temp];
    chartOptions.push({
        id: "self",
        key: "self",
        title: msg('CURVE.self'),
        value: "self"
    });

    let uniqueKeyList = [];

    otherModelList.map(item => {
        const {customAssetAlias, tplDomainId, tplModelId, tplModelName, tplModelNameCn, tplPoints = [], key:categoryKey} = item;
        if(customAssetAlias && tplDomainId && tplModelId && tplPoints.length > 0){
            // const categoryKey = customAssetAlias + '-' + tplDomainId + '-' + tplModelId;

            if(uniqueKeyList.indexOf(categoryKey) === -1){
                uniqueKeyList.push(categoryKey);
                const typeKeyList = pointTypes.map(t => categoryKey + '-' + t.typeKey);
                const newPointTypes = pointTypes.map(t => {
                    return Object.assign({}, t, {typeKey: categoryKey + '-' + t.typeKey})
                });

                let temp = groupByTableNo(tplPoints.map((point) => {
                    const {name_cn, name_en, key, table_no} = point;
                    return {
                        name: isZh ? name_cn : name_en,
                        key : categoryKey + '-' + key,
                        tableNo: table_no
                    }
                }), newPointTypes, false, false);

                temp.map(t => {
                    if(typeKeyList.indexOf(t.key) > -1){
                        return t.pId = categoryKey;
                    }
                })
                chartOptions = chartOptions.concat(temp);
                chartOptions.push({
                    id: categoryKey,
                    key: categoryKey,
                    title: isZh && tplModelNameCn ? tplModelNameCn : tplModelName,
                    value: categoryKey
                });
            }
        }
    })

    return chartOptions;
}

const labelTimes = (data = [], contentData = [], onAttriChange, handlePointsChange, handleAttriChange ) => {
    return data.map((itemObj, ind) => {
        const {interval, points, timeGran } = itemObj;
        const ele = contentData.find(d => d.tplTimeGran === timeGran) || {};
        const {tplTimeGran, tplInterval, tplMax, tplPoints} = ele;
        const timeItem = timeOptions.find(option => option.key === tplTimeGran);
        const includeDd = points?.filter(p => p.table_no == '35').length > 0 || false;
        const chartOptions = getChartOptions(ele);
        const intervalContent = timeDropDown(tplTimeGran, tplInterval || [], includeDd);
        return {
            title: timeItem?.title || tplTimeGran,
            key: tplTimeGran,
            dropDownContent: <div key ={ind} ><div className={styles.interval}>
                <span>{intervalContent[0].name}</span>
                <Select 
                    style={{width: '164px', height: '28px'}}
                    value = {interval}
                    onChange = {(value) => onAttriChange(tplTimeGran, {'interval': value})}
                    options = {intervalContent[0]?.members[0]?.options?.map(ele => {
                        const {value, name, ...rest} = ele;
                        return {
                            value: value, 
                            label: name,
                            ...rest
                        }}) || []} 
                />
            </div>
            <PointSelect 
                limitNum={tplMax || CHART_LIMIT_NUM} 
                selectedData = {labelPoints(data, tplTimeGran, (pointKey, attri) => handleAttriChange(tplTimeGran, pointKey, attri))} 
                options = {chartOptions} 
                onChange = {(valList) => handlePointsChange(valList, tplTimeGran)}
                treeProps = {{
                    treeDefaultExpandAll: true
                }}
            />
            <div className={styles.axisContainer}>
            {['yLeft', 'yRight'].map((position) => {
                return <div key = {position} className={styles.axisItem}>
                    <span>{msg(`CURVE.${position}`)}</span>
                    <div>
                    {
                        ['Min', 'Max'].map((keyStr, index) => {
                            const extreme = {min: -10e15, max: 10e15};
                            const fulKey = position + keyStr;
                            return <InputNumber 
                                key={index} 
                                style = {{width: '80px'}}
                                size = 'small' 
                                value={itemObj[fulKey]} 
                                onChange={(value) => onAttriChange(tplTimeGran, {[fulKey]: value})}
                                {...extreme}
                            />
                        })
                    }
            </div>
                </div>}
            )}
            </div>
            </div>
        };
    })
}

const labelPoints = (data = [], curGrain, onAttriChange) => {
    return (data.filter(ele => ele.timeGran === curGrain)[0]?.points || []).map((point, index) => {
        let {
            edictNameCn, 
            edictNameEn, 
            chartType, 
            color, 
            convert, 
            subtract, 
            table_no, 
            axisProps
        } = Object.assign({}, point);
        return {
            title: isZh ? point.name_cn : point.name_en,
            key: point.key,
            dropDownContent: <DropDown 
                key = {index}
                data = {{
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    chartType: chartType,
                    color: color,
                    convert: convert,
                    subtract: subtract,
                    axisProps: axisProps,
                }}
                content = {pointDropDown(table_no == '35' && curGrain !== DATE_TYPE.REALTIME)}
                onChange = {(attri) => onAttriChange(point.key, attri)}
             />
        };
    })
}

const Set: React.FC<SetProps> = (props: SetProps) => {

    const {
        visible, 
        timeSelectEnable,
        onVisitableChange,
        contentData = [], 
        cacheCfg = {},
        onSave
    } = props;


    const resetUserConfig = JSON.parse(JSON.stringify(cacheCfg));

    const [data, setData] = useState(JSON.parse(JSON.stringify(cacheCfg)));
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        setData(JSON.parse(JSON.stringify(cacheCfg)));
    }, [cacheCfg])

    const handlePointsChange = (valList: Array<{key: string, title: string}>, tplTimeGran) => {
        let newUserConfig = data.userConfig.map(ele => ele);
        let item = newUserConfig.find(ele => ele.timeGran === tplTimeGran) || {};
        let {points = [], interval} = item;

        const curContent = contentData.find(ele => ele.tplTimeGran === tplTimeGran) || {};

        const {tplPoints, otherModelList = []} = curContent;

        let fullPoints = JSON.parse(JSON.stringify(tplPoints));

        otherModelList.map(l => {
            const {customAssetAlias, tplDomainId, tplModelId, tplPoints = [], key:categoryKey} = l;
            
            if(customAssetAlias && tplDomainId && tplDomainId){
                // const categoryKey = customAssetAlias + '-' + tplDomainId + '-' + tplModelId;  
                tplPoints.map(p => {
                    const fullKey = categoryKey + '-' + p.key;
                    fullPoints.push({...p, ...{
                        customAssetAlias: customAssetAlias,
                        key: fullKey, 
                        categoryKey: categoryKey
                    }})
                })
            }
        })

        // add
        valList.map(val => {
            if(points.map(point => point.key).indexOf(val.key) === -1){
                const rawPoint = fullPoints.find(option => option.key === val.key);
                let {table_no} = rawPoint;
                points.push(Object.assign({}, getDefaultValue(points.length), rawPoint, {
                    key: val.key,
                    name: val.title,
                    axisProps: Object.assign(
                        {}, 
                        defaultAxisProps, 
                        points.length % 2 === 0 ? {position: 'left'} : {position: 'right'}
                    )
                }))

                // 电量时间间隔校验
                if(points.map(p => String(p.table_no)).indexOf('35') > -1 && interval === '1_min'){
                    item.interval = curContent.tplInterval[1] || '';
                }
            }
        })

        // delete
        item.points = points.filter(point => {
            return valList.map(ele => ele.key).indexOf(point.key) > -1
        })

        const valKeys = valList.map(val => val.key)

        // reorder
        item.points.sort((a,b)=>{
            return valKeys.indexOf(a.key) - valKeys.indexOf(b.key);
        });

        setData(Object.assign({}, data, {userConfig: newUserConfig}));
    }

    const handleGrainChange = (Grains) => {

        let newUserConfig = data.userConfig.map(ele => ele);

        // add
        Grains.map(Grain => {
            if(newUserConfig.map(ele => ele.timeGran).indexOf(Grain.key) === -1){
                newUserConfig.push({
                    timeGran: Grain.key,
                    interval: contentData.find(ele => ele.tplTimeGran === Grain.key)?.tplInterval[0] || '',
                    points: []
                })
            }
        })

        const GrainKeys = Grains.map(ele => ele.key);

        // delete
        newUserConfig = newUserConfig.filter(item => {
            return GrainKeys.indexOf(item.timeGran) > -1
        })

        // reorder
        newUserConfig.sort((a,b)=>{
            return GrainKeys.indexOf(a.timeGran) - GrainKeys.indexOf(b.timeGran);
        });

        setData(Object.assign({}, data, {userConfig: newUserConfig}));
    }

    const handleGranAttriChange = (timeGran, attri) => {
        let newUserConfig = data.userConfig.map(ele => ele);

        let item = newUserConfig.find(ele => ele.timeGran === timeGran);

        if(item) {
            Object.assign(item, attri);
            setData(Object.assign({}, data, {userConfig: newUserConfig}));
        }
    }

    const handleAttriChange = (grain, pointKey, attri) => {
        let newUserConfig = data.userConfig.map(ele => ele);

        let item = newUserConfig.find(ele => ele.timeGran === grain);

        if(item){
            let point = item.points.find(ele => ele.key === pointKey);
            if(point){
                Object.assign(point, attri);

                setData(Object.assign({}, data, {userConfig: newUserConfig}));
            }
        }
    }

    const handleOtherAttriChange = (attri) => {
        setData(Object.assign({}, data, attri));
    }

    const onClose = () => {
        onVisitableChange(false);
    }

    return <><Drawer 
        className={styles.drawer}
        placement="right"
        closable = {false} 
        width={'328px'}
        onClose={onClose} 
        destroyOnClose={true}
        visible={visible}
    >
        <div className={styles.header}>
            <span className={styles.setDes}>{msg('CURVE.set')}</span> 
            <span className={styles.resetDes} onClick = {() => {
                setIsModalVisible(true)
            }}>
                <FontIcon type = {IconType.RESET} />{msg('CURVE.reset')}
            </span>
        </div>
        <div className={styles.content} style = {{height: `${window.innerHeight - 122}px`}}>
            <div className={styles.block}>
                <DropDown 
                    size={"large"}
                    className={styles.dropDown}
                    data = {{
                        titleEnable: data.titleEnable,
                        titleTextEn: data.titleTextEn, 
                        titleTextCn: data.titleTextCn
                    }}
                    content = {TITLE_SET}
                    onChange = {(attri) => handleOtherAttriChange(attri)}
                />
            </div>
            <div className={styles.block}>
                <div className={styles.title}>{msg('CURVE.timeGranSet')}</div>
                <PointSelect 
                    limitNum={TIME_LIMIT_NUM} 
                    selectedData = {labelTimes(
                        data.userConfig, 
                        contentData,  
                        (timeGran, attri) => handleGranAttriChange(timeGran, attri),
                        handlePointsChange,
                        handleAttriChange
                    )} 
                    options = {timeOptions.filter(option => {
                        return contentData.map(ele => ele.tplTimeGran).indexOf(option.key) > -1;
                    })} 
                    onChange = {handleGrainChange}
                    needDelete = {false}
                    needSelect = {false}
                    treeProps = {{
                        treeDefaultExpandAll: true,
                    }}

                    dropDownStyle = {{width: "100%"}}
                />
            </div>
        </div>
        <div className={styles.footer}>
            <DefaultButton onClick={() => {setData(JSON.parse(JSON.stringify(resetUserConfig))); onVisitableChange(false)}}>{msg('CURVE.cancel')}</DefaultButton>
            <PrimaryButton onClick={() => {onSave(data); onVisitableChange(false);}}>{msg('CURVE.save')}</PrimaryButton>
        </div>
    </Drawer>
    <StyledModal 
        className = {styles.modalContainer}
        visible = {isModalVisible}
        mask = {true}
        maskClosable = {true}
        closable = {false}
        zIndex = {2000}
        maskStyle = {{zIndex: 1500}}
        onOk = {() => {
            setData(JSON.parse(JSON.stringify(resetUserConfig))); 
            setIsModalVisible(false)
        }}
        onCancel = {() => setIsModalVisible(false)}
    >
        <div className= {styles.modalConfirm}>
            <FontIcon type = {IconType.QUESTION_CIRCLE_BOLD}/>
            <span>{msg('CURVE.modalConfirm')}</span>
        </div>
        <div className= {styles.modalInfo}>{msg('CURVE.modalInfo')}</div>
    </StyledModal></>
}

const areEqual = (prevProps, nextProps) => {
    if (lodash.isEqual(prevProps.visible, nextProps.visible)
    && lodash.isEqual(prevProps.contentData, nextProps.contentData)
    && lodash.isEqual(prevProps.cacheCfg, nextProps.cacheCfg)){
        return true;

    }else{
        return false;
    }
}

export default React.memo(Set, areEqual) ;