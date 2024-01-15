import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Input, Tabs } from 'antd';
import { ComponentItemFactory, createPannelOptions, UserConfig, deepCopy } from 'dooringx-lib';
import { FormMap } from '../formTypes';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import Store from 'dooringx-lib/dist/core/store';
import Sortable from 'react-sortablejs';
import uniqueId from 'lodash/uniqueId';

const { TabPane } = Tabs;

interface TabProps {
	data: IBlockType;
	context: string;
	store: Store;
	config: UserConfig;
}

const TabCo = (pr: TabProps) => {
    const { config } = pr;
	const { props={} } = pr.data;
	const { tabs=[] } = props;
	const data = pr.data;
    const scale = pr.config.getScaleState().value;

    useEffect(() => {

    }, [data.width, data.height, scale]);
    const defaultData = {
    };
  
    const store = config.getStore();

	const sortableOption = {
		animation: 150,
		fallbackOnBody: true,
		swapThreshold: 0.65,
		group: {
			name: 'formItem',
			pull: true,
			put: true,
		},
	}

	return (
		<div
			style={{
				display: 'inline-block',
				zIndex: data.zIndex,
				width: data.width,
				height: data.height,
				overflow: 'hidden',
				background: '#01443A',
				borderRadius: 5
			}}
		>
            {tabs.length > 0 ? <Tabs onChange={(key) => {console.log(key)}} style={{height: '100%'}} >
				{
					tabs.map((tab, index) => {
						const { id, name } = tab;
						return <TabPane tab={name} key={index} style={{height: '100%'}}>
								<div
									style={{height: '100%'}}
									onDragStart={() => {}}
									onDragOver={(e) => {
										e.preventDefault();
									}}
									onDrop={(e) => {
										console.log(e);
									}}
									onDragEnd={() => {}}
								>
									test
								</div>
						</TabPane>
					})
				}
			</Tabs> : null}
		</div>
	);
};

const TabReg = new ComponentItemFactory(
	'tab',
	'选项卡',
	{
		style: [
			createPannelOptions<FormMap, 'tab'>('tab', {
				type: 'line'
			}),
		]
	},
	{
		props: {
			type: 'line'
		},
		width: 300,
		height: 200,
        rotate: {
			canRotate: false,
			value: 0,
		},
	},
	(data, context, store, config) => {
		return <TabCo data={data} context={context} store={store} config={config}></TabCo>;
	},
	true
);

export default TabReg;
