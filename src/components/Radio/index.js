import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Checkbox from 'rc-checkbox';
import {default as NewRadioGroup} from './RadioGroup';
import './style.scss';

/**
 * @deprecated 后续考虑统一在 {@link NewRadioGroup} 中扩展
 */
export default class Radio extends Component {
    static propTypes = {
        prefixCls: PropTypes.string
    };

    static defaultProps = {
      prefixCls: 'env-rc-radio',
      type: 'radio'
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) 
            || !_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }
  
    render() {
      return <Checkbox {...this.props} ref="checkbox"/>;
    }
};

export class RadioGroup extends Component {
    constructor(props){
        super(props)
        this.state = {
            r: ''
        };
    }

    static propTypes = {
        prefixCls: PropTypes.string,
        data: PropTypes.array,
        onChange: PropTypes.func,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        data: [],
        onChange: null,
        disabled: false,
        prefixCls: 'env-rc-radio-group',
        type: 'radio'
    };

    handleChange = (e) => {
        let value = e.target.value;
        let {data, onChange} = this.props;

        let o = data.filter((d) => d.value === value)[0];
        if(o && typeof onChange === 'function'){
            onChange(o);
        }

        this.setState({
            r: value
        });
    };

    componentWillMount (){
        var value = this.props.value;
        if(typeof value !== 'undefined'){
            this.setState({
                r: value
            });
        }        
    }

    componentWillReceiveProps(nextProps){
        const { value } = nextProps;
        this.setState({
            r: value
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) 
            || !_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }
  
    render() {
        const {prefixCls, style, data, value, onChange, disabled, ...restProps} = this.props;
        return (
            <div className={`${prefixCls} ${disabled ? `${prefixCls}-disabled` : ''}`} style={style}>
                {data.map((r, ind) => {
                    return (
                        <label key={ind}>
                            <Radio 
                                disabled={disabled}
                                checked={this.state.r == r.value}
                                value={r.value}
                                onChange={this.handleChange}
                                {...restProps}
                                ref="checkbox"
                            />
                            <span>{r.name}</span>
                        </label>
                    );
                })}
            </div>
        );
    }
};