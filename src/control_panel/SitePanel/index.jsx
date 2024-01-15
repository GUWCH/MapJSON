import React, { useState, useEffect, useRef } from "react";
import './index.scss';
import Intl from '../../common/lang';
import { renderInput, replaceTemplate } from "../Constant";
import { RadioSwitch } from "../../components";
import { NumberUtil } from "../../common/utils";
import { InputNumber } from "../../components";
import { Popover } from 'antd';

const isZh = (Intl.locale || "").toLowerCase().indexOf("cn") > -1;

export default function SitePanel(props) {
	const {
		config = {},
		optionsMap,
		allDisabled,
		facBayAlias,
		data = [],
		onChanged,
		onSubmit,
		privilege = {},
		socDisabled
	} = props;
	const titleTag = isZh ? "titleCN" : "title";
	const subTitleTag = isZh ? "subTitleCN" : "subTitle";
	const tipsTag = isZh ? "tipsCN" : "tips";
	const [disableMap, setDisabledMap] = useState({});
	const [inputValue, setInputValue] = useState({});
	const [changedArray, setChangedArray] = useState([]);
	const [changedInputValue, setChangedInputValue] = useState({});
	const [multiFirstRender, setMultiFirstRender] = useState({});
	const [multiValueMap, setMultiValueMap] = useState({});

	useEffect(() => {
	}, []);

	useEffect(() => {
		data.forEach(o => {
			let keyArr = o && o.key && o.key.split(":");
			let valueKey = 'display_value';
			if (keyArr[1] == 61) {
				valueKey = 'raw_value';
				setDisabledMap(i => ({
					...i,
					[o.key]: o[valueKey]
				}))
			}
			setInputValue(x => ({
				...x,
				[o.key]: o[valueKey]
			}))
		})
	}, [data]);

	useEffect(() => {
		onChanged && onChanged(changedArray);
	}, [changedArray]);

	useEffect(() => {
		onSubmit && onSubmit(changedInputValue);
	}, [changedInputValue]);

	/**
	 * 适合两层级输入模型, 不适合递归层级
	 * @param {*} module 
	 * @param {*} topAlias 
	 * @returns 
	 */
	const renderModule = (module, topAlias, topTitle, parentAlias) => {
		let {
			alias,
			maxAlias,
			minAlias,
			privilege: privilegeStr,
			type,
			step,
			subControls = [],
			related,
			optionsRelated,
			relatedValue,
			associOptions
		} = module;
		let pointAlias = replaceTemplate(alias, facBayAlias);
		let moduleTitle = module[titleTag];
		let moduleTip = module[tipsTag];
		let localValue = inputValue[pointAlias];
		let relatedCurrentValue = inputValue[replaceTemplate(related, facBayAlias)];
		const options = optionsMap[pointAlias] || [];

		const [storageOperator, setStorageOperator] = useState('discharge');
		const isFirstTime = useRef(true);

		useEffect(() => {
			if (type === "number&classicBool" && isFirstTime.current && (localValue < 0 || localValue > 0)) {
				setStorageOperator(localValue < 0 ? 'charge' : 'discharge');
			}
		}, [localValue])

		let minValue, maxValue;
		if (maxAlias) {
			maxValue = inputValue[replaceTemplate(maxAlias, facBayAlias)];
		}
		if (minAlias) {
			minValue = inputValue[replaceTemplate(minAlias, facBayAlias)];
			if (maxAlias == minAlias && !isNaN(maxValue)) {
				minValue = - maxValue;
			}
		}

		let changedList = JSON.parse(JSON.stringify(changedArray));
		let curIndex = changedList.findIndex(x => x.key === pointAlias);
		const pri = privilegeStr && privilege[privilegeStr];
		let disabled = allDisabled || pri == 0;
		if (topAlias) {
			disabled = disabled || disableMap[topAlias] == 0 || (related && relatedCurrentValue != relatedValue);
		}
		//Task #173968
		if (alias.indexOf('socBalCalibEnable') !== -1) {
			disabled = socDisabled
		}
		if (parentAlias && parentAlias.indexOf('socBalCalibEnable') !== -1 && topAlias && socDisabled) {
			disabled = true
		}
		// 目前第一级为bool类型输入
		if (!topAlias) {
			localValue = disableMap[pointAlias];
		}

		const change = (name, multiVal) => {
			return (value) => {
				const optionsValue = options && options.find(x => x.value == value);

				let changeObj = {
					name: moduleTitle,
					text: optionsValue ? optionsValue.name || value : value,
					value,
					key: pointAlias
				};

				if (type == "bool") {
					changeObj = Object.assign({}, changeObj, {
						name: moduleTitle,
						text: value ? Intl('enable') : Intl('disable'),
						value: value ? 1 : 0,
						key: pointAlias
					});

					setDisabledMap(x => ({ ...x, [pointAlias]: value }));
				} else if (type == "multi") {
					changeObj = Object.assign({}, changeObj, {
						name: name
					});

					setMultiValueMap(s => ({ ...multiValueMap, [`${pointAlias}_${multiVal}`]: value }));
				}

				changeObj = { [pointAlias]: changeObj };
				let newValue = {
					[pointAlias]: value
				};
				// 联动multi里值改变
				let multiAlias = multiFirstRender[pointAlias];
				let hasMulti = typeof multiAlias === 'string';
				if (hasMulti) {
					let multiKey = `${multiAlias}_${value}`;
					let multiAliasObj = multiFirstRender[multiAlias];
					let multiKeyVal = '';
					if (multiKey in multiValueMap) {
						multiKeyVal = multiValueMap[multiKey];
					} else if (multiAliasObj && multiAliasObj.init == value) {
						multiKeyVal = multiAliasObj.value;
					}
					newValue[multiAlias] = multiKeyVal;
					changeObj[multiAlias] = {
						originalName: multiAliasObj.originalName,
						name: optionsValue ? optionsValue.name : multiAliasObj.originalName,
						text: multiKeyVal,
						value: multiKeyVal,
						key: multiAlias
					};
				}

				setInputValue(x => ({
					...x,
					...newValue
				}));
				setChangedInputValue(x => ({
					...x,
					...newValue
				}));

				let topChangeObj;
				if (topAlias) {
					topChangeObj = changedList.find(x => x.key == topAlias);
					if (!topChangeObj) {
						topChangeObj = {
							name: topTitle,
							key: topAlias
						};
						changedList = changedList.concat(topChangeObj);
					}
				}

				if (topChangeObj) {
					topChangeObj.children = topChangeObj.children || [];
					Object.keys(newValue).map((key) => {
						let childIndex = topChangeObj.children.findIndex(x => x.key === key);
						if (childIndex > -1) {
							topChangeObj.children[childIndex] = {
								...topChangeObj.children[childIndex],
								...changeObj[key]
							};
						} else {
							// TODO 名称改变
							topChangeObj.children = topChangeObj.children.concat(Object.assign({}, changeObj[key], {

							}));
						}
					});

				} else {
					Object.keys(newValue).map((key) => {
						curIndex = changedList.findIndex(x => x.key === key);
						if (curIndex > -1) {
							changedList[curIndex] = {
								...changedList[curIndex],
								...changeObj[key]
							};
						} else {
							// TODO 名称改变
							changedList = changedList.concat(Object.assign({}, changeObj[key], {

							}));
						}
					});
				}

				setChangedArray(JSON.parse(JSON.stringify(changedList)));
			}
		};

		const renderForm = () => {
			switch (type) {
				case 'multi':
					if (!optionsRelated) return null;
					let optionRelatedAlias = replaceTemplate(optionsRelated, facBayAlias);
					let multiOptValue = inputValue[optionRelatedAlias];

					if (!(pointAlias in multiFirstRender) && optionRelatedAlias in inputValue) {
						let opt = (optionsMap[optionRelatedAlias] || []).find(ele => String(ele.value) === String(multiOptValue));
						setMultiFirstRender({
							//字符串,联动使用
							[optionRelatedAlias]: pointAlias,
							//object
							[pointAlias]: {
								init: multiOptValue,
								value: localValue,
								originalName: opt ? opt.name : ''
							}
						});
					}

					return (optionsMap[optionRelatedAlias] || []).map((j, index) => {
						let { name, value } = j;

						let curDisabled = disabled || multiOptValue != value;
						let curValue = '';

						// 多值项处理
						let key = `${pointAlias}_${value}`;
						if (key in multiValueMap) {
							curValue = multiValueMap[key];
						} else if (multiFirstRender[pointAlias] && multiFirstRender[pointAlias].init == value) {
							curValue = multiFirstRender[pointAlias].value;
						}

						return <div
							className="item-right-block-child"
							key={value}>
							<span title={name}>{name}</span>
							{renderInput(
								'number',
								`${pointAlias}_${value}`,
								curDisabled,
								options,
								curValue,
								change(name, value),
								minValue,
								maxValue,
								step
							)}
						</div>;
					});
				case "number&classicBool":
					return (
						<div className="item-right-number-classicBool">
							<RadioSwitch
								options={associOptions}
								checked={storageOperator == 'discharge' ? 0 : 1}
								disabled={disabled}
								onChange={(checked) => {
									if (checked == 0) {
										isFirstTime.current = false;
										if (localValue < 0) {
											(change())(0)
										}
										setStorageOperator('discharge');
									} else {
										isFirstTime.current = false;
										if (localValue > 0) {
											(change())(0)
										}
										setStorageOperator('charge');
									}
								}}
							></RadioSwitch>
							<InputNumber
								style={{
									background: disabled ? '#7a8789' : '#333',
									width: '100px',
									height: '26px',
									lineHeight: '26px',
									border: 'none',
									borderRadius: 0,
									flex: 1
								}}
								value={NumberUtil.removeCommas(localValue)}
								step={step}
								min={storageOperator === 'discharge' ? (minValue === undefined ? 0 : Math.max(0, minValue)) : minValue}
								max={storageOperator === 'charge' ? (maxValue === undefined ? 0 : Math.min(0, maxValue)) : maxValue}
								disabled={disabled}
								onChange={(val) => { (change())(val) }}
							/>
						</div>
					);
				default:
					return renderInput(
						type,
						pointAlias,
						disabled,
						options,
						localValue,
						change(),
						minValue,
						maxValue,
						step
					);
			}
		};

		return <div key={pointAlias}>
			<div className={topAlias ? 'item-child' : 'item-header'}>
				<span>
					<span
						className={"item-header-title"}
						title={moduleTitle}
					>{moduleTitle}</span>
					{
						moduleTip ? <Popover
							overlayClassName={'tips_info_div'}
							content={moduleTip}
							trigger='hover'
							placement='bottomLeft'
						>
							<div className={'site-point-item-tips'}></div>
						</Popover> : null
					}
				</span>
				<div>
					<div className={`item-right ${type === 'multi' ? 'item-right-block' : ''}`}>{
						renderForm()
					}</div>
					{topAlias && moduleTip ? <div className={'site-point-tag'}>{moduleTip}</div> : null}
				</div>
			</div>
			{
				subControls.length > 0 ?
					subControls.map(subModule => {
						return renderModule(subModule, topAlias || pointAlias, topTitle || moduleTitle, alias);
					}) : null
			}
		</div>;
	};

	let { controls = [] } = config;
	let title = config[subTitleTag];

	return (
		<div className="site-panel">
			<h4 className='control-right-title'>{title}</h4>
			<div className="site-panel-main">{
				controls.map(o => renderModule(o))
			}</div>
		</div>
	);
}
