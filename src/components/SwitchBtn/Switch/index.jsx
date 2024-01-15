import React, { Component } from "react";
import propTypes from "prop-types";
import _ from 'lodash';
import styles from "./style.mscss";

export default class Switch extends Component {
	constructor(props) {
		super(props);

        this.state = {
            open : false
        }
	}

	static propTypes = {
		onChange: propTypes.func,
		open: propTypes.bool,
		disabled: propTypes.bool
	};

    static defaultProps = {
        onChange: () => {},
		open: false,
		disabled: true
    };

    componentWillMount (){
        var open = this.props.open;
        if(typeof open !== 'undefined'){
            this.setState({
                open: open
            });
        }        
    }

    componentWillReceiveProps(nextProps){
        const { open } = nextProps;
        this.setState({
            open: open
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

	change = (e) => {
		const { disabled, onChange } = this.props;
        if(disabled) return;

        const open = !this.state.open;
        this.setState({open: open}, () => {
            onChange(open);
        });		
	};

	render() {
		const { disabled } = this.props;
        let closeCls = !this.state.open ? styles.btnClose : '';
        let disableCls = disabled ? styles.btnDisable : '';
		return (
			<div className={`${styles.btn} ${closeCls} ${disableCls}`} onClick={this.change}>
                <span className={styles.slide}></span>
            </div>
		);
	}
}
