import React, { Component,useRef,useState } from 'react';
import PropTypes from 'prop-types';
import G_Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import './style.scss';

const  PaperComponent = (options) => {
    return (props)=> {
        const ref = useRef(null);
        return (
            <Draggable
                ref={ref}
                bounds="parent"
                handle={`.${options.handleClass}`}
            >
                <Paper style={{margin:0}} {...props} />
            </Draggable>
        );
    };
};

const  PaperComponentNoDrag = (props)=> {
    return (
        <Paper {...props} />
    );
};

class Dialog extends Component {
    static propTypes = {
        prefixCls: PropTypes.string,
        draggable: PropTypes.bool,
        title: PropTypes.oneOfType([
            PropTypes.func, PropTypes.object, PropTypes.string
        ]),
        content: PropTypes.oneOfType([
            PropTypes.func, PropTypes.object, PropTypes.string
        ]),
        action: PropTypes.oneOfType([
            PropTypes.func, PropTypes.object, PropTypes.string
        ]),
        titleClasses: PropTypes.object,
        contentClasses: PropTypes.object,
        actionsClasses: PropTypes.object,
        disableTypography: PropTypes.bool,
        handleClass:PropTypes.string
    };

    static defaultProps = {
        prefixCls: 'env-rc-dialog',
        draggable: false,
        title: 'test',
        content: 'test',
        action: 'test',
        disableTypography: false,
        titleClasses: {},
        contentClasses: {},
        actionsClasses: {},
        handleClass:'env-draggable-dialog-title'
    };

    constructor(props){
        super(props);
    }

    componentWillMount(){
    }

    componentWillReceiveProps(nextProps){
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        const { 
            prefixCls, 
            draggable, 
            title, 
            content, 
            action, 
            titleClasses, 
            titleStyle,
            contentClasses, 
            contentStyle,
            actionsClasses, 
            actionsStyle,
            disableTypography,
            handleClass,
            ...restProps 
        } = this.props;
        return (
            <G_Dialog
                className={prefixCls}
                PaperComponent={draggable ? PaperComponent({handleClass}) : PaperComponentNoDrag}
                {...restProps}
            >
                <DialogTitle  disableTypography={disableTypography} className={handleClass} classes={titleClasses} style={titleStyle}>
                    {typeof title === 'function' ? title() : title}
                </DialogTitle>
                <DialogContent classes={contentClasses} style={contentStyle}>
                    {typeof content === 'function' ? content() : content}
                </DialogContent>
                <DialogActions classes={actionsClasses} style={actionsStyle}>
                    {typeof action === 'function' ? action() : action}
                </DialogActions>
            </G_Dialog>
        );
    }
}

export default Dialog;