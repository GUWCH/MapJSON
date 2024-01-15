import React, { memo, useState } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { InputNumber, Select, Checkbox, Input } from 'antd';
import { useIntl } from "react-intl";
import Intl from '@/common/lang';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import BaseInfo, { BaseProfile } from '@/components_utils/base';
import { BaseExtractModels } from '@/components_utils/models';
import InputI18n, { INPUT_I18N } from 'InputI18n';
import { IEcMapCfg, EcMapFnTypes, EcMapBg } from './index';
import { countriesAreasProvinces } from './countries';
import styles from './form.mscss';

const isZh = Intl.isZh;
export interface PropsType {
	data: {};
	current: IBlockType;
	config: UserConfig;
};

const countrySubsMap = {};
countriesAreasProvinces.map(c => {
	countrySubsMap[c.iso_code] = c.subs || [];
});

const EcMapForm = (props: PropsType) => {
	const intl = useIntl();
	const configure: IEcMapCfg = JSON.parse(JSON.stringify(props.current.props));
	const { countryCode, subCodes = [], zoom = 1, thumbnail, bg='', title='' } = configure;

	const store = props.config.getStore();

	const onChange = (value: any) => {
		const cloneData = deepCopy(store.getData());
		const newblock = cloneData.block.map((v: IBlockType) => {
			if (v.id === props.current.id) {
				v.props = { ...v.props, ...value };
			}
			return v;
		});
		store.setData({ ...cloneData, block: [...newblock] });
	};

	const changeCountry = (countryCode) => {
		configure.countryCode = countryCode;
		configure.subCodes = [];
		configure.subEns = [];
		onChange(configure);
	};

	const changeSubs = (subs, options) => {
		configure.subEns = (options || []).map(p => p.eng);
		configure.subCodes = subs;
		onChange(configure);
	};

	const changeZoom = (zoom) => {
		configure.zoom = zoom;
		onChange(configure);
	};

	const changeThumbnail = (event) => {
		configure.thumbnail = event.target.checked;
		onChange(configure);
	};

	const changeBg = (bg) => {
		configure.bg = bg;
		onChange(configure);
	};

	const changeTitle = (data) => {
		configure.title = data;
		onChange(configure);
	};

	return <BaseInfo {...props}>
		<BaseProfile {...props} hasCard={false}>
			<div style={{
				display:'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<span>{intl.formatMessage({ id: 'form.map.bg' })}</span>
				<Select
					allowClear
					style={{minWidth: '100px'}}
					onChange={changeBg}
					value={bg}
					options={[{
						label: intl.formatMessage({ id: 'form.map.bgNo' }),
						value: ''
					},{
						label: intl.formatMessage({ id: 'form.map.bg1' }),
						value: EcMapBg.EARTH
					},{
						label: intl.formatMessage({ id: 'form.map.bg2' }),
						value: EcMapBg.HARF_EARTH
					}]}
					optionFilterProp="label"
				/>
			</div>
		</BaseProfile>
		<SingleCollapse>
			<CollapsePanel
				header={intl.formatMessage({ id: 'form.map.config' })}
				key="1"
			>
				<div className={styles.form}>
					<div>
						<div>{intl.formatMessage({ id: 'form.map.title' })}</div>
						<InputI18n i18n={isZh ? INPUT_I18N.ZH_CN : INPUT_I18N.EN_US} data={title} onChange={changeTitle}/>
					</div>
					<div>
						<div>{intl.formatMessage({ id: 'form.map.country' })}</div>
						<Select
							allowClear
							style={{ width: '100%' }}
							onChange={changeCountry}
							value={countryCode}
							options={countriesAreasProvinces.map((c) => ({
								label: isZh ? c.name_zh : c.name_en,
								value: c.iso_code
							}))}
							optionFilterProp="label"
							showSearch={true}
						/>
					</div>
					{
						['CHN'].indexOf(String(countryCode)) > -1 && subCodes.length === 0 ?
							<div>
								<span>{intl.formatMessage({ id: 'form.map.thumbnail' })}</span>
								<Checkbox
									checked={thumbnail}
									onChange={changeThumbnail}
								/>
							</div>
							: null
					}
					<div>
						<div>{intl.formatMessage({ id: 'form.map.subs' })}</div>
						<Select
							mode="multiple"
							maxTagCount={7}
							allowClear
							style={{ width: '100%' }}
							value={subCodes}
							onChange={changeSubs}
							options={countryCode ? countrySubsMap[countryCode].map((sub) => ({ 
								label: isZh ? sub.name_zh : sub.name_en, 
								value: sub.iso_code, 
								eng: sub.name_en 
							})) : []}
							optionFilterProp="label"
							showSearch={true}
						/>
					</div>
					<div>
						<div>{intl.formatMessage({ id: 'form.map.zoom' })}</div>
						<InputNumber
							style={{ width: '100%' }}
							min={0.1}
							step={0.1}
							value={zoom}
							onChange={changeZoom}
						/>
					</div>
				</div>
			</CollapsePanel>
		</SingleCollapse>
		<SingleCollapse>
			<CollapsePanel
				header={intl.formatMessage({ id: 'form.map.model' })}
				key="1"
			>
				<div className={styles.form}>
					<BaseExtractModels 
						needSelectPoint={true}
						selectMode={'multiple'}
						pointMode={'multiple'}
						selected={configure.selected}
						onChange={(args) => {
							configure.selected = args;
							onChange(configure);
						}}
						fns={[{
							name: intl.formatMessage({ id: 'form.map.status' }),
							id: EcMapFnTypes.STATUS,
							filterType: ['61']
						},{
							name: intl.formatMessage({ id: 'form.map.info' }),
							id: EcMapFnTypes.INFO
						},{
							name: intl.formatMessage({ id: 'form.map.quota' }),
							id: EcMapFnTypes.QUOTA
						},{
							name: intl.formatMessage({ id: 'form.map.overview' }),
							id: EcMapFnTypes.OVERVIEW,
							filterType: ['62', '35']
						},{
							name: intl.formatMessage({ id: 'form.map.statistics' }),
							id: EcMapFnTypes.STATISTICS,
							filterType: ['62', '35']
						}]}
						selectStyle={{background: '#ddd'}}
						fnStyle={{background: '#ccc', fontSize: 14}}
					/>
				</div>
			</CollapsePanel>
		</SingleCollapse>
	</BaseInfo>;
}

export default memo(EcMapForm);