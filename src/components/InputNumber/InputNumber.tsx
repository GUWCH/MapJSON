import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import RcInputNumber from 'rc-input-number';
import './style.scss';

class InputNumber extends Component {
    static propTypes = {
        prefixCls: PropTypes.string,
        disabled: PropTypes.bool,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
    };

    static defaultProps = {
        prefixCls: 'env-input-number',
        disabled: false,
        value: '',
    };

    constructor(props){
        super(props);

        this.state = {
            disabled: false,
            v: ''
        };
    }

    componentWillMount(){
        const { value,disabled } = this.props;
        this.setState({
            disabled: disabled,
            v: value
        });
    }

    componentWillReceiveProps(nextProps){
        const { value,disabled } = nextProps;
        this.setState({
            disabled: disabled,
            v: value
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) 
            || !_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }

    handleChange = (v) => {
        const { onChange } = this.props;
        this.setState({
            v: v
        }, ()=>{
            onChange && onChange(v);
        });
    };

    handleBlur = (e) => {
        const { onBlur } = this.props;
        onBlur && onBlur(e.target.value);
    };

    render() {
        const { prefixCls, onChange, onBlur, value, disabled, hideManualBtn, ...restProps } = this.props;
        return (
            <RcInputNumber 
                className={`${hideManualBtn ? `${prefixCls}-no-manual-btn` : ''}`}
                prefixCls={prefixCls}
                value={this.state.v}
                disabled={this.state.disabled}
                defaultValue={value}
                onChange={this.handleChange}
                onBlur={this.handleBlur} 
                {...restProps}
            />
        );
    }
}

export default InputNumber;