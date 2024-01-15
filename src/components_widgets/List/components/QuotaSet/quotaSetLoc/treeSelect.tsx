import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { TreeSelect, Input } from 'antd';
import { FontIcon, IconType } from 'Icon';
import './style.scss';
import { GlobalContext } from '../context';
import { isZh } from "../../../constants";

const searchSelectPrefix = "env-tree-multi-select";
const dropDownPrefix = `${searchSelectPrefix}-dropDown`;

const RenderTree = (props) => {
    let {handleChange, selected, data = {}} = props;
    const { limitNum = -1, options = []} = data;
    
    const [searchValue, setSearchValue] = useState('');
    const containerElement = useRef();
    const searchElem = useRef();

    // 每次外部更新(删除)已选测点后执行
    useEffect(() => {
        let antdSearch = containerElement.current.getElementsByClassName('ant-select-selector');
        if(antdSearch.length > 0){
            let placeholderEle = antdSearch[0].getElementsByClassName('ant-select-selection-placeholder')[0];
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
    }, [limitNum, selected]);

    let treeData = useMemo(() => {
        return limitNum === -1 ? options : options.map((option) => {
            return Object.assign({},
                option,
                (!!!(selected.indexOf(option.value) > -1)) && selected.length >= limitNum && limitNum !== -1 ? {
                    disableCheckbox: true
                } : {disableCheckbox: false}
            )
        })
    }, [options, limitNum, selected]);

    const handleNameChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchFocus = (e) => {
        searchElem.current && searchElem.current.focus();
    }

    return <div className={searchSelectPrefix} ref = {containerElement}>
        <TreeSelect
            treeData = {treeData}
            defaultValue = {selected}
            value = {selected}
            treeCheckable = {true}
            onChange={(value) => handleChange(value)}
            style={{width: '100%', height: '36px'}}
            showSearch = {true}
            searchValue = {searchValue}
            treeNodeFilterProp = {'title'}
            dropdownRender={(originNode) => {
                return (
                    <div className={`${dropDownPrefix}`}>
                        <div className={`${dropDownPrefix}-search`}>
                            <Input 
                                className={`${dropDownPrefix}-search-input`}
                                ref={searchElem}
                                prefix={<FontIcon type={IconType.SEARCH}/>}
                                placeholder={isZh ? "搜索" : "Search"}
                                onChange={handleNameChange}
                                onClick={handleSearchFocus}
                            />
                        </div>
                        <div className={`${dropDownPrefix}-content`}>
                            {originNode}
                        </div>
                    </div>
                );
            }}
        />
    </div>
}

function TreeMultiSelect(props){

    let { state, dispatch } = useContext(GlobalContext);

    let {quotaData, functionData} = state;

    let {selected = [], data = {}, location, model} = props;

    if(!location) return null;

    let showType = (functionData[model])[location]?.type;

    let selectedData = selected;

    const handleChange = (value) => {

        let newQuotaData = Object.assign({}, quotaData);
        let order = 0;

        Object.keys(quotaData).map((alias) => {
            let point = quotaData[alias];

            if(selectedData.indexOf(alias) > -1){
                if(value.indexOf(alias) === -1){
                    // delete
                    let temp = Object.assign({}, point[model]);
                    order = (temp[location]).order
                    delete temp[location];
                    newQuotaData[alias] = Object.assign({},
                        point,
                        {[model]: Object.assign({}, temp)}
                    ) 
                }else{
                    // 原本和当前都选中的，先不更新，最后更新order
                    newQuotaData[alias] = Object.assign({}, point) 
                    
                }
            }else{
                if(value.indexOf(alias) > -1){
                    // add
                    newQuotaData[alias] = Object.assign({},
                        point,
                        {[model]: Object.assign({}, 
                                point[model], 
                                {[location]:Object.assign(
                                    {enable: true, order: value.length},
                                    showType ? {type: showType}: {}
                                    )}  // 之前设置的测点样式在取消勾选和删除后清除
                            )
                        }
                    )
                }else{
                    // 原本和当前都没有选中的，不更新
                    newQuotaData[alias] = Object.assign({}, point) 
                }
            }
        })

        if(order > 0){
            // 删除测点时，原本和当前都选中的测点更新order
            Object.keys(quotaData).map((alias) => {
                if(selectedData.indexOf(alias) > -1){

                    let point = quotaData[alias];
                    let currentPointOrder = (point[model])[location].order;
                    if(currentPointOrder < order){
                        newQuotaData[alias] = Object.assign({}, point) 
                    }
                    if(currentPointOrder > order){
                        newQuotaData[alias] = Object.assign({},
                            point,
                            {[model]: Object.assign({}, 
                                point[model],
                                {[location]: Object.assign({}, 
                                    (point[model])[location], 
                                    {order: currentPointOrder - 1}
                                )}, 
                            )}
                        ) 
                    }
                }
            })
        }
        
        dispatch({type:'SET_STATE', quotaData: newQuotaData })
    }

    return (
        <RenderTree {...props} handleChange = {handleChange}/>
    );
};

export default TreeMultiSelect;
