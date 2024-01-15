import React, { Component } from 'react';
import _ from 'lodash';
import Tooltip from '@/components/Tooltip';
import Intl, { msgTag } from '@/common/lang';
import ScadaCfg from '@/common/const-scada';
import { getMidNumber, over30Percent } from '@/common/util-scada';
import { DiffUtil } from '@/common/utils';
import {getTheme} from '@/common/theme';
import  {_dao}  from "@/common/dao";
import {StyledModal} from 'Modal'
import {Popover} from 'antd';
import { notify } from 'Notify';
import {PureIcon, IconType} from 'Icon';

import './style.scss';

const msg = msgTag('pagetpl');
const curentMsg = (str) => {
    return msg('CURRENT.' + str);
}
const theme = getTheme();
const NORMAL_NO = 0;
const prefixCls = 'current';

export const UNUSED_NO = 4;

/**
 * @typedef {Object} DYNDATA
 * @property {String} key 1:tableno:alias:fieldno
 * @property {String} display_value
 * @property {String=?} raw_value
 * @property {String} status
 * @property {String} status_value
 */

class StringCurrent extends React.Component{

    static defaultProps = {

        /**@type {DYNDATA[]} */
        data: [],
        beforeChange: () =>{},
        afterChange: () =>{},
        isSetStatus: false,
    }

    constructor(props){
        super(props)

        this.state = {
            isSet: false,
            showTooltip: false,
            showTooltip1: false,
            openDialog: false,
            toolTipInfo: '',

            enableKeys: [],
            disableKeys: []
        }
    }

    componentWillMount(){
    }

    componentDidMount(){
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.isSetStatus){
            this.setState({
                isSet: true
            });
            this.startAnimation();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!DiffUtil.isEqual(this.state, nextState)){
            return true;
        }
        if(!DiffUtil.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))){
            return true;
        }
        
        return false;
    }

    startAnimation(){
        const div = document.getElementById('solar-string-current-wrap');
        div.className = 'string-current-div-flip';
    }

    stopAnimation(){
        const div = document.getElementById('solar-string-current-wrap');
        div.className = 'string-current-div-reset';
    }

    renderSet(){
        let { enableKeys, disableKeys } = this.state;
        const { data=[] } = this.props;

        return(
            <div className = {`${prefixCls}-Show`}>
                {data.map((ele, index) => {
                    const { key, status_value } = ele;
                    const disabled = String(status_value) === String(UNUSED_NO);
                    const manualDisabled = disableKeys.indexOf(key) > -1;
                    const info = disabled ? '' : manualDisabled ? curentMsg('Turn_on_String') : curentMsg('Turn_off_String');

                    return(
                        <div key = {index} className = {`${prefixCls}-Show-Unit`}>
                            <div className = {`${prefixCls}-Show-No`}>
                                {index + 1}
                            </div>
                            <div 
                                className = {
                                    disabled ? 
                                    `${prefixCls}-Show-Border` :
                                    manualDisabled ? `${prefixCls}-Show-Border` : `${prefixCls}-Show-Full`
                                } 
                                style = {{'cursor':'pointer'}}
                                onMouseMove = {(o)=> {this.toolTipAct(o, info)}}
                                onMouseLeave = {() => {this.setState({
                                    showTooltip: false
                                })}}
                                onClick = {() => {

                                    // 停用支路不可启用
                                    if(disabled){
                                        return;
                                    }

                                    const temp = disableKeys.filter(k => k !== key);
                                    if(!manualDisabled){
                                        temp.push(key);
                                    }                                    

                                    this.setState({
                                        disableKeys: temp
                                    });
                                }}
                            >{ disabled ? curentMsg('on') : manualDisabled ? curentMsg('on') : curentMsg('off')}</div>
                        </div>
                    )
                })}
            </div>
        )
    }

    toolTipAct(o, info){
        if(!info)return;

        let { clientX: left, clientY: top } = o.nativeEvent;
        this.setState({
            showTooltip: true,
            toolTipInfo: info || '',
            top: top,
            left: left
        })
    }

    toolTipShow(o, info){
        let { clientX: left, clientY: top } = o.nativeEvent;
        this.setState({
            showTooltip: true,
            toolTipInfo: info,
            top: top,
            left: left
        })
    }

    renderCard(){
        let { data = [] } = this.props;
        const usedBranchData = [];
        let midVal;

        data.forEach((ele) => {
            const { status, status_value, display_value} = ele;
            const disabled = String(status_value) === String(UNUSED_NO);
            if(!disabled){
                usedBranchData.push(display_value);
            }
        });

        if(usedBranchData.length > 0){
            midVal = getMidNumber(usedBranchData);
        }

        return(
            <div className = {`${prefixCls}-Show`}>
                {data.map((ele, index) => {
                    const { status, status_value, display_value} = ele;
                    const disabled = String(status_value) === String(UNUSED_NO);
                    const desc = disabled ? curentMsg('unused') : status;
                    let style={};
                    if(!disabled && over30Percent(midVal, display_value)){
                        style = {
                            color: theme.red
                        };
                    }

                    return(
                        <div key = {index} className = {`${prefixCls}-Show-Unit`}>
                            <div className = {`${prefixCls}-Show-No`}>
                                {index + 1}
                            </div>
                            <div 
                                className = {
                                    disabled ? 
                                    `${prefixCls}-Show-Border` :
                                    `${prefixCls}-Show-Full`
                                } 
                                onMouseMove = {(o)=> {this.toolTipShow(o, desc)}}
                                onMouseLeave = {() => {this.setState({
                                    showTooltip: false
                                })}}
                                style={style}
                            >{ disabled ? desc : display_value}</div>
                        </div>
                    )
                })}
            </div>
        )
        
    }

    async disableBranchCurrent(disabledBranchCurrentKey=[]){
        typeof this.props.beforeChange === 'function' && this.props.beforeChange();

        let optStr = "PopupMenu 23";
        disabledBranchCurrentKey.forEach(key => {
            optStr += ` ${key.split(":")[2]}`;
        });

        const res = await _dao.doOperation(optStr, ScadaCfg.getUser());

        let ok = false;
        if(res && String(res.code) === '10000'){
            notify(curentMsg('set_success'));
            this.stopAnimation();
            this.setState({
                isSet: false,
                disableKeys: [],
                
            });
            this.props.closeSet();
            ok = true;
        }else{
            notify(curentMsg('set_failed'));
        }

        typeof this.props.afterChange === 'function' && this.props.afterChange(ok);
    }

    onOK(){
        if(this.state.disableKeys.length === 0)return;
        this.disableBranchCurrent(this.state.disableKeys);
    }

    renderDialog(){
        return(
            <StyledModal 
                wrapClassName = {`${prefixCls}-modalContainer`}
                closable = {false}
                visible={this.state.openDialog}
                onOk={() => {
                    this.onOK();
                    this.setState({
                        openDialog: false
                    });
                }}
                onCancel={() => {
                    this.setState({
                        openDialog: false
                    });
                }}
            >
                <div className = {`${prefixCls}-modalContainer-body`}>
                    <span className = {`${prefixCls}-modalContainer-body-icon`}><PureIcon type={IconType.QUESTION_CIRCLE_BOLD}/></span>
                    <span>{curentMsg('confirmChang')}</span>
                </div>
            </StyledModal>
        )
    }

    render(){

        let { isSet } = this.state;
        let { data=[] } = this.props;

        const total = data.length;
        const usedData = data.filter(d => String(d.status_value) !== String(UNUSED_NO));
        const used = usedData.length;
        const fault = usedData.filter(d => String(d.status_value) !== String(NORMAL_NO)).length;
        
        return(
            <div id={'solar-string-current-wrap'} className = {`${prefixCls}`}>
                <div id={'solar-string-current'}>
                <div className = {`${prefixCls}-Tag`}>
                    <span className = {`${prefixCls}-Separate`}/>
                    <span className = {`${prefixCls}-Name`}>{`${curentMsg('abnormal')}  `}</span>
                    <span>{`${fault}/${used}`}</span>
                    <span className = {`${prefixCls}-Separate`}/>
                    <span className = {`${prefixCls}-Name`}>{`${curentMsg('inUse')}  `}</span>
                    <span>{`${used}/${total}`}</span>
                    {
                       isSet ? 
                       <div>
                            <button 
                                className = {`${prefixCls}-Cancel`} 
                                onClick = {() => {
                                    this.setState({
                                        isSet: false,
                                        disableKeys: []
                                    })
                                    this.props.closeSet();
                                    this.stopAnimation();
                                }}
                            >{`${curentMsg('cancel')}`}</button>
                            <button 
                                disabled={this.state.disableKeys.length === 0}
                                className = {`${prefixCls}-OK`} 
                                onClick = {() => {
                                    this.setState({
                                        openDialog: true
                                    });
                                }}
                            >{`${curentMsg('ok')}`}</button>
                            
                        </div>
                        :
                        <div>
                            <Popover
                                color = {'#021E25'}
                                visible={this.state.showTooltip1}
                                onVisibleChange={showTip => {
                                    this.setState({
                                        showTooltip1: showTip
                                    })
                                }}
                                trigger='hover'
                                placement='bottomRight'
                                content={
                                    <div>{curentMsg('currentTip')}</div>
                                }
                            >
                                <span className = {`${prefixCls}-Info`}><PureIcon type = {IconType.INFO_CIRCLE}/></span>
                            </Popover>
                        </div> 
                        
                    }
                </div>
                {
                    isSet ? this.renderSet(): this.renderCard()
                }
                </div>
                <Tooltip
                    style = {{top: this.state.top, left: this.state.left}} 
                    visible = {this.state.showTooltip}
                >
                    <span>{this.state.toolTipInfo}</span>
                </Tooltip>
                {
                    this.renderDialog()
                }
            </div>
            
        )
    }
}

export default StringCurrent;