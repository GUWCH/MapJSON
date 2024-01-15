import React, { Component } from "react";
import propTypes from "prop-types";
import "./style.scss";
import msg from "../../../common/lang";
export default class RadioSwitch extends Component {
	constructor(props) {
		super(props);
	}

	static propTypes = {
		onChange: propTypes.func,
		checked: propTypes.oneOfType([propTypes.number, propTypes.string, propTypes.bool]),
		disabled: propTypes.oneOfType([propTypes.number, propTypes.string, propTypes.bool]),
	};

	change = (e, enabled) => {
		const { onChange } = this.props;
		onChange && onChange(enabled ? 1 : 0);
	};

	render() {
		const { disabled, id, checked, options=[] } = this.props;
		return (
			<form className={`enable-switch${disabled ? '-disabled' : ''}`}>
				<label>
					<input
						id={id + '-disable'}
						checked={checked == 0}
						disabled={disabled}
						onChange={(e) => this.change(e, false)}
						name="switch"
						type="radio"
					/>
					<span>{(msg.isZh ? options[0]?.nameCn : options[0]?.nameEn) || msg("disable")}</span>
				</label>
				<label>
					<input
						id={id + '-enable'}
						disabled={disabled}
						checked={checked == 1}
						onChange={(e) => this.change(e, true)}
						name="switch"
						type="radio"
					/>
					<span>{(msg.isZh ? options[1]?.nameCn : options[1]?.nameEn) || msg("enable")}</span>
				</label>
			</form>
		);
	}
}
