import React, {useState, ReactNode, useEffect, useRef} from 'react';
import _ from 'lodash';
import { DragDropContext, Droppable, Draggable,DragDropContextProps } from "react-beautiful-dnd";
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import {TreeSelect, Collapse, Input } from 'antd';
import { FontIcon, IconType } from 'Icon';
import PointSelector from 'PointSelector';
import Intl from '@/common/lang';

export const isZh = Intl.isZh;

import './style.scss';

const { Panel } = Collapse;

const prefixCls = 'point-select';

export interface BasicItem {
    title: string;
    value: string | number;
    key: string | number;
    id: string | number;
    pId?: string | number;
    needLabelShow?: boolean
}

export interface Item {
    title: string;
    key: string | number;
    dropDownContent?: ReactNode;
    /** ===false不可拖动 */
    dragabled?: boolean;
}

export interface PointSelectProps {
    // -1：不限制个数
    limitNum: number;    
    options: Array<BasicItem>;
    selectedData?:Array<Item>;
    /**
     * 显示列表
     */
    needList?: boolean;
    needDelete?: boolean;
    needSelect?:boolean;
    selectStyle?: React.CSSProperties;
    onChange?: Function;
    treeProps?: Object;
    dropDownStyle?: Object;
}

function useDeepCompareMemoize<T>(value: T) {
    const ref = React.useRef<T>(value);
    const signalRef = React.useRef<number>(0);
  
    if (!_.isEqual(value, ref.current)) {
      ref.current = value;
      signalRef.current += 1;
    }

    return React.useMemo(() => ref.current, [signalRef.current]);
}

/**
 * 下拉选框及列表控件
 * 可下拉选择选项, 下方显示被选择选项列表, 列表里自定义各种配置
 * 选框可有可无, 当只有列表时可不显示选择框
 * @param props 
 * @returns 
 * @see 本组件功能无法满足新的需求，后续使用可考虑组件 {@link PointSelector}
 */
const PointSelect: React.FC<PointSelectProps> = (props: PointSelectProps) => {

    const {
        limitNum = -1,
        selectedData = [], 
        options = [], 
        onChange = ()=>{}, 
        needList=true,
        needDelete = true,
        needSelect = true,
        selectStyle={},
        treeProps = {},
        dropDownStyle = {}
    } = props;

    const [selected, setSelected] = useState(selectedData);

    const [labels, setLabels] = useState(selectedData);

    const [currentOptions, setCurrentOptions] = useState(JSON.parse(JSON.stringify(options)) as BasicItem[]);

    const [searchValue, setSearchValue] = useState('');

    const containerElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        handleLimit(selectedData.map(d => d.key));
    }, useDeepCompareMemoize([options, limitNum]))

    useEffect(() => {
        handleLimit(selectedData.map(d => d.key));
        setSelected(selectedData);
        setLabels(selectedData);
    }, useDeepCompareMemoize([selectedData]))

    useEffect(() => {
        if(containerElement.current){
            let antdSearch = containerElement.current.getElementsByClassName('ant-select-selector');
            if(antdSearch.length > 0){
                let placeholderEle = antdSearch[0].getElementsByClassName('ant-select-selection-placeholder')[0] as HTMLSpanElement;
                let text = (limitNum > -1 ? `${selected.length}/${limitNum || '-'}`: `${selected.length}`) +  (isZh ? '测点选择' : ' Items Selected');
                if(placeholderEle){
                    placeholderEle.innerText = text;
                }else{
                    let textEle = document.createElement("span");
                    textEle.innerText = text;
                    textEle.className = "ant-select-selection-placeholder";
                    antdSearch[0].appendChild(textEle);
                }
            }
        }
    }, [limitNum, selected.length])

    const handleLimit = (validLabels) => {
        let newCurrentOptions = options.map((option) => {
            return Object.assign({},
                option,
                option.needLabelShow 
                && (!!!(validLabels.indexOf(option.key) > -1)) 
                && validLabels.length >= limitNum 
                && limitNum !== -1 ? {disableCheckbox: true} : {disableCheckbox: false}
            )
        })

        setCurrentOptions(newCurrentOptions);
    }

    const handleChange = (value: (string | number)[]) => {

        let validNodes = value.filter(f => {
            let option = options.find(o => o.key === f)
            return option?.needLabelShow
        });

        let validLabels = JSON.parse(JSON.stringify(validNodes)) as (string | number)[];
        let ex: (string | number)[] = [];
        
        if(limitNum > -1){
            validLabels = validNodes.splice(0, limitNum);
            ex = validNodes;
        }

        handleLimit(validLabels);

        let newLabels = labels.map(l => l);
        const labelKeys = labels.map(l => l.key);
        // add
        validLabels.map(ele => {
            if(labelKeys.indexOf(ele) === -1){
                const result = options.find(o => o.key === ele)
                result && newLabels.push(result);
            }

        });
        // delete
        setLabels(newLabels.filter(ele => validLabels.indexOf(ele.key) > -1));

        const newSelected = value.map(f => {
                const result = options.find(o => f === o.key)
                if(ex.indexOf(f) === -1){
                    return result
                }
            }).filter(v => v) as BasicItem[]
        setSelected(newSelected);
        
        onChange(validLabels.map(labelkey => {
            let {title, key} = newLabels.find(f => f.key === labelkey) ?? {};
            return {
                title: title,
                key: key
            }
        }));
    }

    const handleDelete = (item) => {
        let newSelected = selected.map(ele => ele);
        let targetIndex = newSelected.map(ele => ele.key).indexOf(item.key);
        newSelected.splice(targetIndex, 1);
        setSelected(newSelected);

        let newLabels = labels.map(l => l);
        let labelIndex = newLabels.map(ele => ele.key).indexOf(item.key);
        newLabels.splice(labelIndex, 1);
        setLabels(newLabels);

        handleLimit(newSelected.map(ele => ele.key));

        onChange(newLabels.map(label => {return {
                title: label.title,
                key: label.key
            }}
        ));
    }

    const reorder = (list: Item[], startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
	
		return result;
	};

    const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
		if (!result.destination) {
			return;
		}
		const newitems = reorder(
			labels,
			result.source.index,
			result.destination.index
		)

        setLabels(newitems);

        onChange(newitems.map(label => {return {
            title: label.title,
            key: label.key
        }}));
    }

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        margin: `0 0 8px 0`,
        ...draggableStyle
    });

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    }

    let searchElem;
    const handleSearchFocus = (e) => {
        searchElem && searchElem.focus();
    }

    return <div className={`${prefixCls}-container`} ref = {containerElement}>
        {needSelect ? 
            <TreeSelect
                showSearch = {true}
                treeData = {currentOptions}
                value = {selected.map(ele => ele.key)}
                treeCheckable = {true}
                onChange={handleChange}
                searchValue = {searchValue}
                treeNodeFilterProp = {'title'}
                treeDataSimpleMode = {true}
                style={Object.assign({}, {width: 268, height: 36, marginBottom: 10}, selectStyle)}
                dropdownRender={(originNode) => {
                    return (
                        <div className={`${prefixCls}-search`}>
                            <Input
                                    style={{height: '34px'}} 
                                    className={`${prefixCls}-search-input`}
                                    ref={(ref) => {searchElem = ref}}
                                    prefix={<FontIcon type={IconType.SEARCH}/>}
                                    placeholder= {isZh ? "搜索" : "Search"}
                                    onChange={handleInputChange}
                                    onClick={handleSearchFocus}
                            />
                            <div className={`${prefixCls}-content`}>
                                {originNode}
                            </div>
                        </div>
                    );
                }}
                {...treeProps}
                >
            </TreeSelect>
            :
            null
        }
        {// @ts-ignore react和ts版本不匹配导致误报错
            needList && <DragDropContext onDragEnd={onDragEnd}>
                {/* @ts-ignore react和ts版本不匹配导致误报错 */}
                <Droppable droppableId="droppable">
                    {
                        (provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref = {provided.innerRef}
                                style = {Object.assign({
                                    padding: "0 0 10px 0",
                                    width: "268px",
                                    minWidth: '250px'
                                }, dropDownStyle)}
                            >
                                {labels.map((item, index) => {
                                    // @ts-ignore react和ts版本不匹配导致误报错
                                    return <Draggable 
                                        key={index.toString()}
                                        draggableId = {index.toString()}
                                        index = {index}
                                        isDragDisabled={item.dragabled === false}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref = {provided.innerRef}
                                                {...provided.draggableProps}
                                                style = {
                                                    getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )
                                                }
                                            >
                                                <Collapse >
                                                    <Panel key = {index} header = {
                                                        <div className={`${prefixCls}-label`} >
                                                            <span className={`${prefixCls}-label-title`}><EllipsisToolTip>{item.title}</EllipsisToolTip></span>
                                                            {needDelete ? <span className={`${prefixCls}-label-delete`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleDelete(item)
                                                                }}
                                                            ><FontIcon type = {IconType.WRONG}/></span> : null}
                                                        </div>
                                                    }
                                                    extra = { item.dragabled === false ? null : <FontIcon {...provided.dragHandleProps} type = {IconType.DRAG}/>}
                                                >
                                                    {item?.dropDownContent || null}
                                                    </Panel>
                                                </Collapse>
                                            </div>
                                        )}
                                    </Draggable>
                                })}
                                {provided.placeholder}
                            </div>
                        )
                    }
                </Droppable>
            </DragDropContext>
        }
        
    </div>
}

export default PointSelect