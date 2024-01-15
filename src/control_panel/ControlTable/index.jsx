import React, { useEffect, useState } from 'react';
import './index.scss';
import Intl from '../../common/lang';
const isZh = (Intl.locale || "").toLowerCase().indexOf("cn") > -1;
import Table from 'rc-table';
import 'rc-table/assets/index.css';
import msg from '../../common/lang';
import _ from 'lodash';
import { useDeepCompareEffect } from 'react-use';

export default function ControlTable(props) {
    const { columns = [], dataSource = [], inputMap, onSetting, onSelected, optionsMap, curSelected } = props;
    const titleTag = isZh ? 'titleCN' : 'title';
    const [selectWTG, setSelectWTG] = useState([]);

    useDeepCompareEffect(() => {
        if(!_.isEqual(selectWTG, curSelected)){
            onSelected && onSelected(selectWTG);
        }
    }, [selectWTG])

    useDeepCompareEffect(() => {
        if(!_.isEqual(curSelected, selectWTG)){
            setSelectWTG(curSelected);
        }
    }, [curSelected])

    const curData = dataSource.map(d => {
        if(curSelected.filter(wtg => wtg.name.value === d.name.value).length > 0){
            return Object.assign({}, d, {checked: true});
        }else{
            return Object.assign({}, d, {checked: false});
        } 
    })

    return (
        <Table scroll={{ y: 'calc(100% - 80px)' }}
            className='control-table'
            data={curData}
            emptyText={msg('nodata')}
            rowKey={row => row.name.value}
            expandable={{
                expandIcon: (props) => 
                    <div 
                        onClick={e => props.onExpand(props.record, e)}
                        className={`control-table-expand-icon ${
                            props.expanded ? 'control-table-expand-icon-expand' : ''
                        }`}
                    ></div>
            }}
            columns={columns.map(x => ({
                ...x, 
                title: x[titleTag],
                dataIndex: x.key,
                render: (item, row) => {
                    let { value, text, key } = item || {};
                    
                    let backgroundColor = 'transparent';
                    let orignalValue = inputMap[key];
                    let newValue = value;

                    if (orignalValue != undefined) {
                        if(!isNaN(orignalValue)){
                            orignalValue = Number(orignalValue);
                            newValue = Number(value);
                        }

                        if(orignalValue != newValue){
                            text = orignalValue;
                            let option = (optionsMap[key] || []).find(i => i.value == orignalValue);
                            if(option){
                                text = option.name || text;
                            }
                            backgroundColor = '#e4b600';
                        }
                    }

                    return <span style={{
                        width: '100%',
                        height: '100%',
                        display: 'inline-block',
                        boxSizing: 'border-box',
                        padding: 4,
                        backgroundColor
                    }}>
                        <label>
                        {x.checkbox && value ? <span>
                            <input 
                                onChange={e => {
                                    if (e.target.checked) {
                                        setSelectWTG(o => o.concat(row))
                                    } else {
                                        setSelectWTG(o => o.filter(i => i[x.key].value != item.value))
                                    }
                                }} 
                                type='checkbox' 
                                checked={row.checked}
                            />&nbsp;</span> : <span></span>
                        }
                        <span 
                            className={x.key === 'setting' ? 'td-setting' : ''}
                            onClick={x.key === 'setting' ? () => onSetting && onSetting(row) : null}
                        >{
                            x.key === 'setting' ? <span>...</span> : <span>{text}</span>
                        }</span>
                        </label>
                    </span>
                }
            }))}
        />
    )
}
