import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { notify } from 'Notify';
import Dialog from 'Dialog';
import { msgTag } from '@/common/lang';
import { LegalData, _dao } from '@/common/dao';
import { NumberFactor } from '@/common/util-scada';

import './index.scss';

const prefixClsDialog = `env-deviation-dialog`;
const prefixClsDialogPaper = `${prefixClsDialog}-paper`;
const prefixClsDialogContainer = `${prefixClsDialog}-container`;
const prefixClsDialogTitle = `${prefixClsDialog}-title`;
const prefixClsDialogContent = `${prefixClsDialog}-content`;
const prefixClsDialogAction = `${prefixClsDialog}-action`;
const prefixClsDialogDel = `${prefixClsDialog}-del`;

const msg = msgTag('solar');
const DEFAULT_DEVIATION = 0.1;

/**
 * 
 * @typedef {Object} RET 
 * @property {Map} updateAttrs
 * @property {String} valueField: 'field_val'
 * @property {String|Number} value
 * @property {bool} valid
 */

/**
 * 获取离散率限值及属性
 * @param {String} alias 
 * @returns {RET|null}
 */
export const getDisperseAttrs = async (alias) => {
    const res = await _dao.getDeviationThresold({
        points: [{
            alias,
            function:'func_yc_limit'
        }]
    });

    if(LegalData(res) && Array.isArray(res.points)){
        const attrs = (res.points[0]?.attribute || []);
        for(let i = 0; i < attrs.length; i++){
            const {field_name, field_val, is_valid, field_no, table_no} = attrs[i] || {};

            if(field_name === 'up_limit'){
                return {
                    updateAttrs: {field_name, field_no, table_no, field_val: ''},
                    valueField: 'field_val',
                    value: field_val, 
                    valid: !!is_valid
                };
            }
        }
    }

    return null;
};

export default class DeviationDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disperseLimitValue: ''
        }
    }

    componentWillReceiveProps(nextProps) {
    }

    onClose(){
        const { onCancel } = this.props;

        this.setState({
            disperseLimitValue: ''
        }, () => {
            typeof onCancel === 'function' && onCancel();
        });
    }

    async update(){
        const {alias, attrs, beforeUpdate, afterUpdate} = this.props;
        const {updateAttrs, valueField} = attrs || {};

        typeof beforeUpdate === 'function' && beforeUpdate();

        const res = await _dao.updateDeviationThresold(
            alias, 
            [Object.assign({}, updateAttrs, {
                [valueField]: String(this.state.disperseLimitValue) // 接口需要字符串
            })]
        );

        const isOk = LegalData(res);

        if(isOk){
            notify(msg('disperse.success'));
        }else{
            notify(msg('disperse.failed'));
        }

        typeof afterUpdate === 'function' && afterUpdate(isOk, this.state.disperseLimitValue);
        this.setState({
            disperseLimitValue: ''
        });        
    }

    renderDialogContent() {
        const { disperseLimitValue } = this.state;
        return (
            <div className={`${prefixClsDialog}-diviation-content`}>
                <div className={`${prefixClsDialog}-diviation-now`}>
                    <span>{msg('disperse.tip', NumberFactor(this.props.disperseLimitValue, 100))}</span>
                    <button onClick={() => {
                        this.setState({
                            disperseLimitValue: DEFAULT_DEVIATION
                        })
                    }}>{msg('reset')}</button>
                </div>
                <div className={`${prefixClsDialog}-diviation-name`}>
                    <span>{`${msg('deviation')}`}</span><span style={{ color: 'red' }}>{' *'}</span>
                    <input
                        type='text'
                        placeholder={msg('disperse.placeholder')}
                        className={`${prefixClsDialog}-diviation-input`}
                        autoFocus
                        // 100显示
                        value={NumberFactor(disperseLimitValue, 100)}
                        onChange={(e) => {
                            const { value } = e.target;
                            this.setState({
                                // 100处理
                                disperseLimitValue: NumberFactor(value, 0.01)
                            })
                        }}
                    /><span>{' %'}</span>
                </div>
                <div className={`${prefixClsDialog}-diviation-tips`}>
                    <span>{msg('message_1')}</span>
                    {/* <span>{msg('message_2')}</span> */}
                </div>
            </div>
        )
    }

    render() {
        const { show } = this.props;
        let dialogMaxWidth = parseInt(window.innerWidth * 0.8);
        let dialogMaxHeight = parseInt(window.innerHeight * 0.7);
        const min = 0;
        const max = 200;
        return (
            <Dialog
                classes={{
                    root: prefixClsDialog,
                    paper: prefixClsDialogPaper,
                    container: prefixClsDialogContainer
                }}
                titleClasses={{
                    root: prefixClsDialogTitle
                }}
                contentClasses={{
                    root: prefixClsDialogContent
                }}
                actionsClasses={{
                    root: prefixClsDialogAction
                }}
                PaperProps={{
                    style: {
                        minWidth: 400,
                        maxWidth: '100%',
                        minHeight: 200,
                        maxHeight: '100%'
                    }
                }}
                draggable={false}
                open={show}
                fullWidth={false}
                maxWidth={'md'}
                title={() => {
                    return (
                        <div>
                            {msg('deviationSet')}
                            <span className={prefixClsDialogDel} onClick={() => {
                                this.onClose();
                            }}></span>
                        </div>
                    )
                }}
                content={() => {
                    return this.renderDialogContent();
                }}
                contentStyle={{
                    maxWidth: dialogMaxWidth,
                    maxHeight: dialogMaxHeight
                }}
                action={() => {
                    return (
                        <div>
                            <button
                                onClick={(e) => {
                                    const temp = this.state.disperseLimitValue;
                                    if (temp === '' || temp === null || temp === undefined || isNaN(temp)) {
                                        notify(msg('disperse.notNum'));
                                        return;
                                    }
                                    const value = Number(temp);
                                    if (value < min) {
                                        notify(msg('disperse.limitMin'));
                                        return;
                                    }
                                    if (value > max) {
                                        notify(msg('disperse.limitMax'));
                                        return;
                                    }

                                    this.update();
                                }}
                            >{msg('ok')}</button>
                            <button
                                onClick={() => {
                                    this.onClose();
                                }}
                            >{msg('cancel')}</button>
                        </div>
                    );
                }}
            ></Dialog>
        )
    }
}

DeviationDialog.propTypes = {
    alias: PropTypes.string,
    attrs: PropTypes.object,
    show: PropTypes.bool.isRequired,
    beforeUpdate: PropTypes.func,
    afterUpdate: PropTypes.func,
    onCancel: PropTypes.func,
    disperseLimitValue: PropTypes.oneOfType([PropTypes.number,PropTypes.string])
};

DeviationDialog.defaultProps = {
    alias: '',
    attrs: {},
    show: false,
    beforeUpdate: ()=>{},
    afterUpdate: ()=>{},
    onCancel: ()=>{},
    disperseLimitValue: ''
};
