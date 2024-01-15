import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'Dialog';
import { RadioGroup } from 'Radio';
import { FILE_TYPE, msg } from '../Constant';
import './style.scss';

const prefixClsDialog = `export-dialog`;
const prefixClsDialogPaper = `${prefixClsDialog}-paper`;
const prefixClsDialogContainer = `${prefixClsDialog}-container`;
const prefixClsDialogTitle = `${prefixClsDialog}-title`;
const prefixClsDialogContent = `${prefixClsDialog}-content`;
const prefixClsDialogAction = `${prefixClsDialog}-action`;
const prefixClsDialogDel = `${prefixClsDialog}-del`;

export default class ExportDialog extends Component {

    constructor(props) {
        super(props);
        this.value = FILE_TYPE[0].value;
    }

    renderDialogContent() {

        return (
            <div className={`${prefixClsDialog}-diviation-content`}>

                <RadioGroup 
                    data = {FILE_TYPE}
                    value = {this.value}
                    onChange = {(obj)=>{this.value = obj.value}}
                    prefixCls = {`${prefixClsDialog}-RadioGroup`}
                ></RadioGroup>
            </div>
        )
    }

    render() {
        const { display, onOk, onCancel } = this.props;
        this.value = FILE_TYPE[0].value;
        let dialogMaxWidth = parseInt(window.innerWidth * 0.8);
        let dialogMaxHeight = parseInt(window.innerHeight * 0.7);
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
                draggable={true}
                open={display}
                fullWidth={false}
                maxWidth={'md'}
                title={() => {
                    return (
                        <div>
                            {msg('exportType')}
                            <span className={prefixClsDialogDel} onClick={() => {
                                onCancel?.();
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
                                onClick={() => {
                                    onOk?.(this.value);
                                }}
                            >{msg('ok')}</button>
                            <button
                                onClick={() => {
                                    onCancel?.();
                                }}
                            >{msg('cancel')}</button>
                        </div>
                    );
                }}
            ></Dialog>
        )
    }
}

ExportDialog.propTypes = {
    display: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
}
