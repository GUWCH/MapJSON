import React, { useState, useContext, useMemo } from 'react';
import { TreeSelect } from 'antd';
import './style.scss';
import { GlobalContext } from '../context';

const searchSelectPrefix = "env-tree-multi-select";

const areEqual = (prevProps, nextProps) => {
    if(prevProps.selected.length !== nextProps.selected.length){
        return false;
    };

    let equalFlag = true;
    (nextProps.length > prevProps.length ? nextProps : prevProps).selected.map((item, index) => {
        if(!prevProps.selected[index] || item !== prevProps.selected[index]){
            equalFlag = false;
        }
    });

    return equalFlag;  
}

const RenderTree = React.memo((props) => {

    let {handleChange, selected, data = {}} = props;

    const { limitNum = -1, options = []} = data;

    let selectedData = selected;

    const [currentOptions, setCurrentOptions] = useState(options);

    // 每次外部更新(删除)已选测点后执行
    useMemo(() => {
        if(limitNum !== -1){
            let newCurrentOptions = options.map((option) => {
                return Object.assign({},
                    option,
                    (!!!(selectedData.indexOf(option.value) > -1)) && selectedData.length >= limitNum && limitNum !== -1 ? {
                        disableCheckbox: true
                    } : {disableCheckbox: false}
                )
            })
            setCurrentOptions(newCurrentOptions);
        }
    }, [selectedData]);

    let searchElem = undefined;

    const handleNameChange = (e) => {
        setCurrentOptions(
            options.filter((option) => {
                return option.title.search(e.target.value.toString()) > -1
            })
        ) 
    }

    const handleSearchFocus = (e) => {
        searchElem.focus();
    }

    return <TreeSelect
        treeData = {currentOptions}
        defaultValue = {selectedData}
        value = {selectedData}
        treeCheckable = {true}
        onChange={(value) => handleChange(value)}
        style={{width: '100%'}}
        showSearch = {false}
        placeholder = { limitNum > -1 ? 
            `${selectedData.length}/${limitNum || '-'} Items Selected`
            : `${selectedData.length} Items Selected`
        }
        maxTagPlaceholder = { limitNum > -1 ? 
            `${selectedData.length}/${limitNum || '-'} Items Selected`
            : `${selectedData.length} Items Selected`
        }
        maxTagCount = {0}
        dropdownRender={(originNode) => {
            return (
                <div className={`${searchSelectPrefix}`}>
                    <div className={`${searchSelectPrefix}-search`}>
                        <input 
                            className={`${searchSelectPrefix}-search-input`}
                            ref={(ref) => {searchElem = ref}}
                            placeholder="Search"
                            onChange={handleNameChange}
                            onClick={handleSearchFocus}
                        />
                    </div>
                    <div className={`${searchSelectPrefix}-content`}>
                        {originNode}
                    </div>
                </div>
            );
        }}
        >
    </TreeSelect>
}, areEqual)

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
