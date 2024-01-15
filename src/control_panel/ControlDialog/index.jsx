import React, { useRef } from 'react';
import msg from '../../common/lang';
import Dialog from '../../components/Dialog';
import './index.scss';

export default function ControlDialog(props) {
    const { 
        title, 
        content, 
        classes = {}, 
        handleClass = 'env-draggable-dialog-title', 
        visible, 
        hasAction = false, 
        hasCancel = true, 
        onOk, 
        onCancel, 
        ...otherProps 
    } = props;

    return (
        <Dialog
            //保证在按钮和loading之间
            style={{ zIndex: 900000 }}
            handleClass={handleClass}
            disableTypography
            classes={{
                paperScrollPaper: 'control-modal-pager-scroll',
                ...classes
            }} 
            draggable 
            titleClasses={{
                root: 'control-modal-title-class',
            }} 
            maxWidth='lg' 
            contentClasses={{
                root: 'control-modal-content-class'
            }} 
            action={hasAction ? <div>
                <button
                    onClick={(e) => {
                        onOk && onOk(e);
                    }}
                >{msg('ok')}</button>
                {hasCancel && <button
                    onClick={(e) => {
                        onCancel && onCancel();
                    }}
                >{msg('cancel')}</button>}
            </div> : null
            } 
            actionsClasses={{
                root: hasAction ? 'control-modal-action-class' : 'control-modal-action-class-disabled'
            }} 
            open={visible} 
            title={
                <div>
                    {title}
                    <span 
                        className={'control-panel-close-icon'} 
                        onClick={() => onCancel && onCancel()}
                    ></span>
                </div>
            }
            content={content} 
            {...otherProps}
        ></Dialog>
    )
}
