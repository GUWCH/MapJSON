import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import RcCheckbox from 'rc-checkbox';
import './style.scss';

export default class Checkbox extends Component {
    constructor(props){
        super(props);

        this.state = {
            checked : false
        }
    }

    static propTypes = {
        prefixCls: PropTypes.string,
        checked: PropTypes.bool
    };

    static defaultProps = {
        prefixCls: 'env-rc-checkbox',
        checked: false,
        type: 'checkbox'
    };

    componentWillMount (){
        var checked = this.props.checked;
        if(typeof checked !== 'undefined'){
            this.setState({
                checked: checked
            });
        }        
    }

    componentWillReceiveProps(nextProps){
        const { checked } = nextProps;
        this.setState({
            checked: checked
        });
    }

    componentDidMount(){
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) 
            || !_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }

    render() {
        const {...restProps} = this.props;
        return (
            <RcCheckbox 
                {...restProps}
                checked = {this.state.checked}
                onChange = {(e) => {
                    this.setState({
                        checked : e.target.checked
                    },()=>{
                        this.props.onChange(e.target.checked)
                    })}
                    
                }
                ref = "checkbox" 
            /> 
        );
    }
};