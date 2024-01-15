import React, { useEffect, useState, useRef } from "react"
import { useDeepCompareEffect } from "react-use";
import _ from "lodash";
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import { Observer } from 'mobx-react';
import ResizeObserver from 'rc-resize-observer';
import { getAssetAlias } from '@/common/utils';
import { LegalData, _dao } from '@/common/dao';
import { getPointKey } from '@/common/constants';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import {TimerInterval} from '@/common/const-scada';
import { Col, Row } from "antd";
import DynData, {CommonDynLayout} from 'DynData';
import SetModal from 'SetModal';
import { FontIcon, Icon2, IconType } from "Icon";
import {DropDown} from '@/components';
import {useMemoryStateCallback} from '@/common/util-memory';
import {GridForm, GridItem, gridDefault} from './form';
import {PointModel} from '../../components_utils/models';
import {defaultCardProps} from '@/components_utils/Card/form';
import {
    DEFAULT_MEMORY_CFG,
    DEFAULT_GRID_ITEM_CFG,
    TEXT_SET,
    WIDGET_SET,
    TYPE_SET,
    ALIGN_SET,
    getPointType,
    getPointDropDown, 
    msg,
    isZh
} from './constants';

import styles from './style.mscss';

export {default as GridForm} from './form';

const isDev: boolean = process.env.NODE_ENV === 'development';

export const GridDefaultOptions = {}
export const GridDefaultCfg = {}
// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项

export interface IGridCfg extends CommonConfigure {
    GridProps?: GridForm
}

type AssetList = (Omit<GridItem, 'model'> & {
    points: PointModel[]
})[]

type UniGridProjectCfg = Omit<GridForm, 'assetList'> & {
    assetList?: AssetList
} 

type AlignMode = 'left' | 'center' | 'right';

type Grid = {
    type?: 'text' | 'point',
    textEn?: string,
    textCn?: string,
    icon?: string,
    color?: string,
    unit?: string,
    quota?: PointModel,
    fontSize?:number|string,
    fontWeight?:string,
    align?: AlignMode
};

interface GridItemProps extends Grid {
    finalAssetAlias?: string,
    text?: string,
    optionPoints?: PointModel[],
    dynValObj?: any
};

type Cfg = {
    titleEnable?: boolean,
    titleTextEn?: string,
    titleTextCn?: string,
    grid?: Grid[][]
} | null

type CurGridItem = {
    isConfiguring?: boolean,
    row?: number, 
    col?: number,
    gridStyle?:string,
    fontWeight?:string
}

type MemoryTitle = {
    titleEnable?: boolean,
    titleTextEn?: string,
    titleTextCn?: string,
}

let firstRender =false

const labelPoints = (type, select, onChange) => {

    const keyStr = type === 'YX' ? 'key' : '__uId__';

    const handleAttriChange = (id, attri) => {
        let newSelect = JSON.parse(JSON.stringify(select));
        Object.assign(newSelect.find(s => (s[keyStr]) === id) || {} , attri)

        onChange(newSelect);
    }

    return select.map(s => {
        let {
            edictNameCn, 
            edictNameEn, 
            icon,
            color, 
            ycCondition,
            convert,
        } = s;

        return {
            title: isZh ? s.name_cn : s.name_en,
            key: s.__uId__,
            dropDownContent: <DropDown 
                data = {{
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    convert: convert,
                    icon,
                    color, 
                    ycCondition,
                }}
                content = {getPointDropDown(type)}
                onChange = {(attri) => handleAttriChange(s[keyStr], attri)}
            />
        };
    })
}

const getContent = (isWidgetSet, itemRow, itemCol, projectItem, curSetCfg,fontSize,fontWeight,  onAttriChange) => {
    if(!curSetCfg) return [];
    if(isWidgetSet){
        const {titleEnable, titleTextEn, titleTextCn} = curSetCfg;
        return [{
            key: 'gridWidgetSet',
            type: 'customize',
            customizeDom: <DropDown 
                size={"large"}
                className={styles.dropDown}
                data = {{titleEnable, titleTextEn, titleTextCn}}
                content = {WIDGET_SET}
                onChange = {(attri) => onAttriChange(attri)}
            />
        }]
    }else{
        const {grid} = curSetCfg;
        if(!grid) return [];
        
        const getNewGridData = (valObj: {[keyStr: string]: any}) => {
            let newGrid = JSON.parse(JSON.stringify(grid));
            Object.assign(newGrid[itemRow][itemCol], valObj)
            return newGrid;
        }
        const gridItem = grid[itemRow][itemCol];

        const {type} = gridItem;
        switch(type){
            case 'text': 
            if((!gridItem.fontSize||!gridItem.fontWeight) && !firstRender){
                if(!gridItem.fontSize){
                    gridItem.fontSize = fontSize
                }
                if(!gridItem.fontWeight){
                    gridItem.fontWeight =fontWeight
                }
            }
                return [{
                    key: 'gridTextSet',
                    type: 'customize',
                    customizeDom: <DropDown 
                        size={"large"}
                        className={styles.dropDown}
                        data = {gridItem}
                        content = {TEXT_SET}
                        onChange = {(attri) => onAttriChange({'grid': getNewGridData(attri)})}
                    />
                }]
            case 'point':
                // const {quota, align,fontSize,fontWeight} = gridItem;
                const {quota, align,fontSize:pointFontSize,fontWeight:pointFontWeight} = gridItem;
                const {points = []} = projectItem;
                const constList = (quota?.const_name_list || []).map(ele => {
                    const {value, name, name_en, ...rest} = ele;
            
                    return {
                       key: String(value),
                       name_cn: name,
                       name_en: name_en,
                       ...rest
                    }
                })
                return [
                    {
                        key: 'point',
                        keyName: msg('GRID.showInfo'),
                        nameShow: true,
                        aboveExtra: <DropDown 
                            size={"large"}
                            className={styles.dropDown}
                            data = {{type,fontSize:pointFontSize,fontWeight:pointFontWeight}}
                            content = {TYPE_SET}
                            onChange = {(attri) => onAttriChange({'grid': getNewGridData(attri)})}
                        />,
                        belowExtra: <DropDown 
                            size={"large"}
                            className={styles.dropDown}
                            data = {{align,fontSize:pointFontSize,fontWeight:pointFontWeight}}
                            content = {ALIGN_SET}
                            onChange = {(attri) => onAttriChange({'grid': getNewGridData(attri)})}
                        />,
                        type: 'yxSelect',
                        describe: msg('GRID.selectPoint'),
                        selectProps: {
                            isShowSearch:true,
                            incluedNo: true,
                            options: points.map(p => {return {value: p.__uId__, name: isZh ? p.name_cn : p.name_en}}),
                            value: quota?.__uId__ || '',
                            onChange: (quotaId) => onAttriChange({'grid': getNewGridData({quota: points.find(p => p.__uId__ === quotaId) || null})})
                        },
                        itemProps: {  
                            needDelete: false,
                            needSelect: false, 
                            options: [],
                            selectedData: getPointType(quota?.table_no) === 'YX' ? 
                                labelPoints('YX', constList, (newSelect) => onAttriChange({
                                    'grid': getNewGridData({quota: Object.assign(
                                        {}, 
                                        quota, 
                                        {const_name_list: newSelect}
                                    )})
                                })) 
                                : 
                                labelPoints(getPointType(quota?.table_no), quota ? [quota] : [], (newSelect) => onAttriChange({
                                    'grid': getNewGridData({quota: newSelect[0]})
                                })),
                        }
                    },
                ]
        }
    }
} 

const GridEle = (props: GridItemProps) => {
    const {type, text, textCn, textEn, color, icon, quota, unit, dynValObj, finalAssetAlias, align,fontSize,fontWeight} = props;
    if(type === 'text'){
        const titleText = `${(isZh ? textCn : textEn) || text}${unit ? '(' + unit + ')' : ''}`;
        return <div style={{color: color, fontSize:`${fontSize}px` ,fontWeight}} className={styles.text} title={titleText}>
            {icon ? <FontIcon type={IconType[icon]} style = {{marginRight: '4px'}}/> : null}
            <span style={{'whiteSpace':'pre'}}>{(isZh ? textCn : textEn) || text }</span>
            {unit ? <span className={styles.unit} style={{color: color}}>({unit})</span> : null}
        </div>
    }else if(type === 'point'){
        if(!quota) return null;
        const {name_cn, name_en, table_no, field_no, edictNameCn, edictNameEn, convert, ycCondition, const_name_list = []} = quota;
        let valueMap = {};
        const_name_list.map(c => {
            valueMap[String(c.key)] = {
                ...c,
                iconColor: c.color
            }
        })
        return <DynData
            showName = {false} 
            showUnit = {false}
            valueDefaultColor = {'rgba(230,244,255,.7)'}
            wrapperStyle={{width: '100%'}}
            containerStyle = {{justifyContent: align,fontSize:`${fontSize}px`,fontWeight}}
            valueContainerCls={styles.dynItem}
            valueCls={styles.value}
            point = {{
                aliasKey: getPointKey(quota, finalAssetAlias),
                tableNo: table_no || '',
                fieldNo: field_no || '',
                nameCn: name_cn || '',
                nameEn: name_en || '',
                unit: quota?.unit || ''
            }} 
            transform = {{
                conditions: ycCondition,
                convert: convert,
                valueMap: valueMap
            }}
            value = {dynValObj[getPointKey(quota, finalAssetAlias)]}
        />
    }
    return null;
}

const Table = (props) => {
    const {data, onRawDoubleClick, firstColWidth,gridStyle,fontWeight, curGridItem} = props;
    return <>{
        data.map((rowD: GridItemProps[], i) => {
            return <Row className={styles.row} key={i}>
                {
                    rowD.map((colD: GridItemProps, j) => {
                        const {align} = colD;
                        return <Col 
                            key={j}
                            className={`${styles.col} ${j === 0 ? styles.firstCol : ''}`}
                            style={{
                                justifyContent: align, 
                                width: j > 0 && rowD.length > 1 ? `${(100 - firstColWidth)/(rowD.length - 1)}%` : 
                                    j === 0 ? `${firstColWidth}%` : '',
                                fontSize:`${gridStyle}px`,
                                fontWeight,
                                border: curGridItem.isConfiguring && i === curGridItem.row && j === curGridItem.col ? '2px dashed #00A7DB' : ''
                            }}
                            onDoubleClick={() => {
                                setTimeout(()=>{
                                    firstRender = true
                                },100)
                                onRawDoubleClick(i, j)
                            }}
                        >
                            <GridEle {...colD} />
                        </Col>
                    })
                }
            </Row>
        })
    }</>
}

const VerticalGrid = (props: {
    curNodeAlias: string,
    uniCustomAssetAlias: string,
    quotaNum: number,
    gridCfg: Grid[][],
    assetList: AssetList,
    dynValueMap: {[key: string]: any},
    firstColWidth : number,
    gridStyle: number,
    fontWeight: string,
    curGridItem: CurGridItem,
    onDoubleClick: (row: number, col: number) => void,
}) => {
    const {
        curNodeAlias,
        uniCustomAssetAlias,
        quotaNum,
        gridCfg,
        assetList,
        dynValueMap,
        firstColWidth,
        gridStyle,
        fontWeight,
        curGridItem,
        onDoubleClick
    } = props;
    let data = []

    for(let i = 0; i < quotaNum + 1; i++){
        let tempRowData: GridItemProps[] = [];

        tempRowData.push({
            ...DEFAULT_GRID_ITEM_CFG,  
            finalAssetAlias: getAssetAlias(curNodeAlias, uniCustomAssetAlias),
            ...(gridCfg[0] ? gridCfg[0][i] || {} : {})
        })

        assetList.map((l, j) => {
            const {assetName, assetAlias, points} = l;
            const finalAssetAlias = getAssetAlias(curNodeAlias, assetAlias || uniCustomAssetAlias);
            tempRowData.push({
                ...DEFAULT_GRID_ITEM_CFG,
                text: assetName,
                finalAssetAlias: finalAssetAlias,
                ...(gridCfg[j+1] ? gridCfg[j+1][i] || {} : {}),
                dynValObj: dynValueMap
            })
        })
        data.push(tempRowData);
    }

    return <Table
        firstColWidth = {firstColWidth}
        gridStyle={gridStyle}
        fontWeight={fontWeight}
        data = {data}
        curGridItem = {{isConfiguring: curGridItem.isConfiguring, row: curGridItem.col, col: curGridItem.row}}
        onRawDoubleClick = {(i, j) => {
            onDoubleClick(j, i)}
        }
    />;
}

const HorizontalGrid = (props : {
    curNodeAlias: string,
    uniCustomAssetAlias: string,
    quotaNum: number,
    gridCfg: Grid[][],
    assetList: AssetList,
    dynValueMap: {[key: string]: any},
    firstColWidth : number,
    gridStyle: number,
    fontWeight: string,
    curGridItem: CurGridItem,
    onDoubleClick: (row: number, col: number) => void
}) => {
    const {
        curNodeAlias,
        uniCustomAssetAlias,
        quotaNum,
        gridCfg,
        assetList,
        dynValueMap,
        firstColWidth,
        gridStyle,
        fontWeight,
        curGridItem,
        onDoubleClick
    } = props;

    let tempData = Array.from({length: assetList.length + 1}, () => Array.from({length: quotaNum + 1}));

    for(let i = 0; i < quotaNum + 1; i++){

        tempData[0][i] = {
            ...DEFAULT_GRID_ITEM_CFG,  
            finalAssetAlias: getAssetAlias(curNodeAlias, uniCustomAssetAlias),
            ...(gridCfg[0] ? gridCfg[0][i] || {} : {})
        }

        assetList.map((l, j) => {
            const {assetName, assetAlias, points} = l;
            const finalAssetAlias = getAssetAlias(curNodeAlias, assetAlias || uniCustomAssetAlias);
            tempData[j+1][i] = {
                ...DEFAULT_GRID_ITEM_CFG,
                text: assetName,
                finalAssetAlias: finalAssetAlias,
                ...(gridCfg[j+1] ? gridCfg[j+1][i] || {} : {}),
                dynValObj: dynValueMap
            }
        })
    }
    return <Table 
        firstColWidth = {firstColWidth}
        gridStyle = {gridStyle}
        fontWeight={fontWeight}
        data = {tempData}
        curGridItem={curGridItem}
        onRawDoubleClick = {(i, j) => {
            onDoubleClick(i, j)}
        }
    />
}

const GridApp = ({
    setTitle, 
    isWidgetConfiguring, 
    projectCfg, 
    curNodeAlias, 
    uniCustomAssetAlias, 
    id, 
    pageId, 
    afterWidgetClose,
    onMemoryTitleChange
}) => {

    const {quotaNum, direction, assetList, firstColWidth,gridStyle,fontWeight} = Object.assign({}, gridDefault, projectCfg || {});
    const [cacheCfg, setCacheCfg] = useMemoryStateCallback<Cfg>(null, pageId, id);
    const [curSetCfg, setCurSetCfg] = useState<Cfg>(null);
    const [curContentCfg, setCurContentCfg] = useState<Cfg>(null);
    const [curGridItem, setCurGridItem] = useState <CurGridItem>({});
    const [dynValueMap, setDynValueMap] = useState({});
    const [actuaAssetList, setActuaAssetList] = useState([]);
    useEffect(() => {
        if(isDev){
            if(!_.isEqual(assetList, actuaAssetList)){
                setActuaAssetList(assetList);
            }

            return;
        }

        // 判定资产是否存在
        _dao.getAssetInfo(assetList.map(a => getAssetAlias(curNodeAlias, a.assetAlias || uniCustomAssetAlias)))
        .then((res) => {
            let newAssetList = [];
            if(LegalData(res)){
                let data = res.data;
                newAssetList = assetList.filter(a => {
                    const {is_exist} = data.find(d => d.alias === getAssetAlias(curNodeAlias, a.assetAlias || uniCustomAssetAlias)) || {};
                    return is_exist;
                })
            }

            if(!_.isEqual(newAssetList, actuaAssetList)){
                setActuaAssetList(newAssetList);
            }
        })
    }, [assetList])

    const MergeCfg = () => {
        // 合并工程配置和后台配置
        const defaultGrid = Array.from({length: actuaAssetList.length + 1}, () => Array.from(
            {length: quotaNum + 1}, 
            () => DEFAULT_GRID_ITEM_CFG
        )).map((l, i) => {
            return l.map((c, j) => {
                if(i === 0){
                    return c;
                }else{
                    const id = actuaAssetList[i-1]?.id;
                    return {id, ...c}
                }
            })
            
        });

        let newCurSetCfg = Object.assign({}, DEFAULT_MEMORY_CFG, cacheCfg || {}, {
            grid: defaultGrid.map((gArr, i) => {
                return gArr.map((g, j) => {
                    // if(!g.fontSize&&g.fontSize!=''&&g.fontSize!=0){
                    //     g.fontSize=gridStyle
                    // }
                    // if(!g.fontWeight&&g.fontWeight!=''){
                    //     g.fontWeight=fontWeight
                    // }  
                    if(i === 0){
                        return Object.assign(
                            {}, 
                            g, 
                            cacheCfg?.grid && cacheCfg?.grid[i] ? (cacheCfg?.grid[i][j] || {}) : {}
                        )
                    }else{
                        const sameIdArr = (cacheCfg?.grid || []).find(ele => g.id && (ele[0]?.id === g.id));
                        if(sameIdArr){
                            return Object.assign(
                                {}, 
                                g, 
                                sameIdArr[j] || {}
                            )
                        }else{
                            return g;
                        }
                    }
                })
            })
        });
        if(!_.isEqual(newCurSetCfg, curSetCfg)){
            setCurSetCfg(JSON.parse(JSON.stringify(newCurSetCfg)))
        }

        if(!_.isEqual(newCurSetCfg, curContentCfg)){
            setCurContentCfg(JSON.parse(JSON.stringify(newCurSetCfg)))
        }
    }

    useDeepCompareEffect(() => {
        MergeCfg();
    }, [actuaAssetList, cacheCfg])

    useRecursiveTimeoutEffect(
        () => {
            let req: {
                id: string,
                decimal: number,
                key: string
            }[] = [];

            (actuaAssetList || []).forEach((l, i) => {
                const {assetAlias = ''} = l;
                const finalAssetAlias = getAssetAlias(curNodeAlias, assetAlias || uniCustomAssetAlias);
                const {grid = []} = curContentCfg || {};
                if(grid[i+1]){
                    for(let j = 0; j < grid[i+1].length; j++){
                        const {quota} = grid[i+1][j];
                        
                        if(quota){
                            req.push({
                                id: '', 
                                decimal: 3, 
                                key: getPointKey(quota, finalAssetAlias)
                            })
                        }
                    }
                }
            })
            
            if(req.length === 0){
                return;
            }

            return [
                () => {
                    return _dao.getDynData(req);
                },
                (res) => {
                    const valueMap = {};
                    if (LegalData(res)) {
                        const data = res.data || [];
                        data.forEach(o => {
                            valueMap[o.key] = o;
                        });

                        setDynValueMap(valueMap);                    
                    }else{
                        setDynValueMap(valueMap);
                    }
                }
            ]
        },
        TimerInterval,
        [curContentCfg, actuaAssetList]
    )

    useEffect(() => {
        const {titleEnable, titleTextCn, titleTextEn} = Object.assign({}, DEFAULT_MEMORY_CFG, cacheCfg || {});
        
        onMemoryTitleChange({titleEnable, titleTextCn, titleTextEn})
    }, [cacheCfg])

    const handleAttriChange = (attri: {[key: string]: any}) => {
        let newData = Object.assign({}, curSetCfg, attri);
        setCurSetCfg(newData);
    }
    const commonProps = {
        curNodeAlias,
        uniCustomAssetAlias,
        quotaNum,
        firstColWidth,
        gridStyle,
        fontWeight,
        assetList: actuaAssetList,
        dynValueMap,
        gridCfg: curContentCfg?.grid || [],
        curGridItem: curGridItem,
        onDoubleClick: (row, col) => setCurGridItem({isConfiguring: true, row, col, gridStyle,fontWeight})
    }
    return <div className={styles.container}>
        <div className={styles.content}>
            {direction === 'vertical' ? <VerticalGrid
                {...commonProps}
            /> : <HorizontalGrid 
                {...commonProps}
            />}
        </div>
        <SetModal 
            visible = {isWidgetConfiguring || curGridItem.isConfiguring}
            title = {msg('GRID.set')}
            content = {isWidgetConfiguring || curGridItem.isConfiguring ? getContent(
                isWidgetConfiguring, 
                curGridItem.row,
                curGridItem.col,
                actuaAssetList[(curGridItem.row ?? -1) - 1] || {}, 
                curSetCfg,
                curGridItem.gridStyle,
                curGridItem.fontWeight, 
                handleAttriChange
            ): []}
            memorySave = {() => {
                // 避免设置font-size为空
                const fontSizeItem = curSetCfg.grid.map(el=>{
                    el.map(aEL=>{
                        if(aEL.fontSize == ''){
                            aEL.fontSize = 0
                        }
                    })
                })
                setCacheCfg(JSON.parse(JSON.stringify(curSetCfg)), () => {});
                // setCacheCfg(null, () => {})
            }}
            handleReset = {() => MergeCfg()}
            afterClose= {isWidgetConfiguring ? afterWidgetClose : () => {
                firstRender = false
                setCurGridItem({})}}
        />
    </div>;
}

export function Grid(props: Omit<WidgetProps, 'configure'> & {
    isExternal?: Boolean,         // 外部调用
    externalCfg?: IGridCfg,    // 外部传入配置
    configure?: IGridCfg, // 组件内部传入配置
}) {

    const {editable = true, id, pageId, assetAlias = '', configure, scale, isDemo, isExternal = false, externalCfg} = props;
    const {
        customAssetAlias = '',
        title, title_en, 
        ...cardProps
    } = Object.assign({}, defaultCardProps, isExternal ? externalCfg : configure);

    let commonCfg: UniGridProjectCfg = {};

    if(isExternal){
        commonCfg = externalCfg?.cfg || {};
    }else if(configure){
        const {gridProps} = configure;
        if(gridProps){
            const {assetList = [], ...others} = {...gridDefault, ...gridProps};
            let tempAssetList = [];
            assetList.forEach(o => {
                const {id, assetName, assetAlias, model} = o;
                tempAssetList.push({
                    id,
                    assetName,
                    assetAlias,
                    points: (model?.selectedObject?.selectedPoint ?? []) as PointModel[]
                })
            })
            commonCfg = {...others, assetList: tempAssetList }
        }
    }

    const [isConfiguring, setIsConfiguring] = useState(false);
    const [memoryTitle, setMemoryTitle] = useState<MemoryTitle>({});
    const ec = useRef(null);

    return <Observer>{() => {
        return <ResizeObserver
            onResize={() => {
                if(ec.current){
                    ec.current.resize();
                }
            }}
        >
            <PageCard 
                {...cardProps}
                title={memoryTitle.titleEnable ? memoryTitle.titleTextCn || title : (isDemo ? title : '')} 
                title_en={memoryTitle.titleEnable ? memoryTitle.titleTextEn || title_en : (isDemo ? title_en : '')}
                extra = {
                    <div 
                        className={styles.set} 
                        style = {!editable ? {visibility: 'hidden'} : {}} 
                        onClick = {() => {setIsConfiguring(!isConfiguring)}}
                    >
                        <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2> 
                    </div>
                }
            >
                {!isDemo && <GridApp 
                    isWidgetConfiguring = {isConfiguring}
                    projectCfg = {commonCfg} 
                    curNodeAlias = {assetAlias} 
                    uniCustomAssetAlias = {customAssetAlias}
                    id = {id}
                    pageId = {pageId}
                    afterWidgetClose = {() => {setIsConfiguring(false)}}
                    setTitle = {isZh ? title : title_en}
                    onMemoryTitleChange = {(titleObj) => {(!_.isEqual(titleObj, memoryTitle)) && setMemoryTitle(titleObj)}}
                />}
            </PageCard>
        </ResizeObserver>
    }}</Observer>
}

export default Grid;