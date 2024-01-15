import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DiffUtil } from '../../../common/utils';
import './style.scss';

class ComponentSwitch extends Component{

    constructor(props){
        super(props);
        this.inputRef = null;
        this.removeEdit = this.removeEdit.bind(this);

        this.state = {
            isEdit : false,
            value : ''
        }
    }

    componentWillMount(){
        const { value } = this.props;
        this.setState({
            value: value
        });
    }

    componentDidMount(){
        this.addListen();
    }

    componentWillReceiveProps(nextProps){
        const { value } = nextProps;
        this.setState({
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

    componentDidUpdate(){
        this.addListen();
    }

    removeEdit(e){
        if(e.target !== this.inputRef){
            this.setState({
                isEdit: false
            });
        }
        const { onChange, blur } = this.props;
        if(typeof blur === 'function'){
            let output = blur(this.state.value);
            this.setState({
                value: output 
            });
            onChange(output);
        }
    }

    addListen(){
        if(this.inputRef){
            document.documentElement.addEventListener('mousedown', this.removeEdit);
        }else{
            document.documentElement.removeEventListener('mousedown', this.removeEdit);
        }
    }

    handelChange(e){
        const { onChange, limit } = this.props;
        let output = e.target.value;
        if(typeof limit === 'function'){
            output = limit(e.target.value);
        }
        this.setState({
            value: output 
        });
        onChange(output);
    }

    render(){
        let {noValueTitle=null} = this.props;

        return(
            this.state.isEdit ?
            <input 
                ref={ele=>this.inputRef=ele}
                className = {`env-edit-input`}
                type= "number"
                value = {this.state.value}
                onChange = {this.handelChange.bind(this)}
            /> :
            <span
                title={this.state.value==='' ? noValueTitle : null}
                className = {`env-edit-span`}
                onClick = {e => {
                    this.setState({
                        isEdit: true
                    }, () => {this.inputRef.focus()});
                }}
            >{this.state.value}</span>
        )
    }
}

export default ComponentSwitch;