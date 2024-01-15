import React from "react";
import { RadioSwitch, Switch } from "../components";
import { NumberUtil } from "../common/utils";
import { InputNumber } from "../components";

export const renderInput = (type, id, disabled, data, value, callback, min, max, step) => {
	if (type == "multi") {
		return null;
	}
	switch (type) {
		case "bool":
		case 'classicBool':
			return (
				<RadioSwitch
					key={id}
					checked={value}
					id={id}
					disabled={disabled}
					onChange={(checked) => callback && callback(checked)}
				></RadioSwitch>
			);
		case "bool":
			const open = typeof value === 'string' ? value !== '0' && value !== '' : !!value;
			return (
				<Switch
					open={open}
					disabled={disabled}
					onChange={(open) => callback && callback(open ? 1 : 0)}
				></Switch>
			);
		case "select":
			return (
				<select className='env-control-panel-select'
					onChange={e => callback && callback(e.target.value)}
					disabled={disabled} id={id} value={value}>
					{data &&
						data.map(
							(o) =>
								o && (
									<option key={o.value} value={o.value}>
										{o.name}
									</option>
								)
						)}
				</select>
			);
		default:
			return (
				<InputNumber
					style={{
						background: disabled ? '#7a8789' : '#333',
						width: '100px',
						height: '26px',
						lineHeight: '26px',
						border: 'none',
						borderRadius: 0,
						flex:1,
					}}
					value={NumberUtil.removeCommas(value)}
					step={step}
					min={min}
					max={max}
					disabled={disabled}
					onChange={(val) => callback && callback(val)}
					key={id}
				/>
			);
	}
};

export const replaceTemplate = (alias, bayAlias) => {
	return alias && alias.replace('{0}', bayAlias);
}

