import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import RcSelect, {Option, OptGroup} from 'rc-select';
import { DiffUtil } from '../../common/utils';
import './style.scss';
import msg from "../../common/lang";

class Select extends Component {
    static propTypes = {
        prefixCls: PropTypes.string,
        noBorder: PropTypes.bool
    };

    static defaultProps = {
        prefixCls: 'env-rc-select',
        noBorder: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        if(!DiffUtil.isEqual(this.state, nextState)){
            return true;
        }
        if(!DiffUtil.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))){
            return true;
        }
        return false;
    }

    render() {
        const { prefixCls, ...restProps } = this.props;
        return (
            <RcSelect 
                prefixCls={prefixCls}
                {...restProps}
            />
        );
    }
};

export class NewSelect extends Component {
    static propTypes = {
        prefixCls: PropTypes.string,
        disabled: PropTypes.bool,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onChange: PropTypes.func,
        keysMap: PropTypes.object,
        noBorder: PropTypes.bool,
        autoWidth: PropTypes.bool
    };

    static defaultProps = {
        prefixCls: 'env-rc-select',
        disabled: false,
        value: '',
        onChange: () => {},
        keysMap: {
            name: 'name',
            value: 'value'
        },
        noBorder: false,
        autoWidth: false
    };

    constructor(props){
        super(props);

        this.state = {
            disabled: false,
            value: ''
        };
    }

    componentWillMount(){
        const { value, disabled } = this.props;
        this.setState({
            disabled: disabled,
            value: value
        });
    }

    componentWillReceiveProps(nextProps){
        const { value,disabled } = nextProps;
        this.setState({
            disabled: disabled,
            value: value
        });
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

    handleChange = (value) => {
        this.setState({
            value: value
        }, () => {
            const {onChange} = this.props;
            onChange(value);
        });
    };

    render() {
        const { 
            prefixCls, 
            data, 
            onChange, 
            onSelect, 
            value, 
            disabled,
            optionLabelProp, 
            keysMap,
            className='',
            noBorder,
            autoWidth,
            ...restProps 
        } = this.props;
        return (
            <RcSelect 
                className={`${noBorder?`${prefixCls}-no-border`:''} ${autoWidth?`${prefixCls}-auto`:'' } ${className}`}
                prefixCls={prefixCls}
                value={this.state.value}
                disabled={this.state.disabled}
                onChange={this.handleChange}
                onSelect={()=>{}}
                notFoundContent={msg('nodata')}
                optionLabelProp={'children'}
                {...restProps}
            >
                {
                    data.map((d, ind) => {
                        return <Option key={ind} value={d[keysMap.value]}>{d[keysMap.name]}</Option>;
                    })
                }
            </RcSelect>
        );
    }
};

export {Option, OptGroup};
export default Select;