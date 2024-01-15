import React, { CSSProperties, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { InitConfig, UserConfig, deepCopy, rgba2Obj } from 'dooringx-lib';
import { Row, Col, Input, InputNumber, Select } from 'antd';
import { THEME_UI, THEME_BG } from '@/common/constants';
import ColorPicker from '../ColorPicker';

export const rightGlobalState = {
	theme: THEME_UI.DEFAULT,
    containerColor: THEME_BG[THEME_UI.DEFAULT],
    title: '',
    bodyColor: 'rgba(255,255,255,1)',
    script: [],
    customAnimate: [],
    customStr: '',
};

const colStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
};

const rightGlobalCustom = (config: UserConfig) => {
    const initColor = rgba2Obj(config.getStore().getData().globalState.containerColor);
	const theme = config.getStore().getData().globalState.theme;


	return (
		<div style={{ padding: '10px' }}>
			<Row style={{ padding: '10px 0 20px 0', fontWeight: 'bold', userSelect: 'none' }}>
			全局设置
			</Row>
			{/* <Row style={{ padding: '10px 0' }}>
				<Col span={6} style={{ userSelect: 'none' }}>
				标题
				</Col>
				<Col span={18} style={colStyle}>
					<Input
						value={config.getStore().getData().globalState.title}
						onChange={(e) => {
							const val = e.target.value;
							const originData = deepCopy(config.getStore().getData());
							originData.globalState.title = val;
							config.getStore().setData(originData);
						}}
					/>
				</Col>
			</Row> */}
            <Row style={{ padding: '10px 0' }}>
				<Col span={6} style={{ userSelect: 'none' }}>
				容器宽度
				</Col>
				<Col span={18} style={colStyle}>
					<InputNumber
                        disabled={true}
						min={800}
						value={config.getStore().getData().container.width}
						onChange={(e) => {
							const val = e;
							const originData = deepCopy(config.getStore().getData());
							originData.container.width = val;
							config.getStore().setData(originData);
						}}
					/> px
				</Col>
			</Row>
			<Row style={{ padding: '10px 0' }}>
				<Col span={6} style={{ userSelect: 'none' }}>
				容器高度
				</Col>
				<Col span={18} style={colStyle}>
					<InputNumber
                        disabled={true}
						min={600}
						value={config.getStore().getData().container.height}
						onChange={(e) => {
							const val = e;
							const originData = deepCopy(config.getStore().getData());
							originData.container.height = val;
							config.getStore().setData(originData);
						}}
					/> px
				</Col>
			</Row>
			<Row style={{ padding: '10px 0' }}>
				<Col span={6} style={{ userSelect: 'none' }}>
				主题
				</Col>
				<Col span={18} style={colStyle}>
					<Select
						onChange={(value) => {
							const originData = deepCopy(config.getStore().getData());
							originData.globalState.theme = value;
							originData.globalState.containerColor = THEME_BG[value];
							config.getStore().setData(originData);
						}}
						defaultValue={theme}
					>
						<Select.Option value={THEME_UI.DEFAULT}>
							默认
						</Select.Option>
					</Select>
				</Col>
			</Row>
			{/* <Row style={{ padding: '10px 0' }}>
				<Col span={6} style={{ userSelect: 'none' }}>
				容器底色
				</Col>
				<Col span={18} style={colStyle}>
					<ColorPicker
						initColor={initColor}
						onChange={(newcolor) => {
							const originData = deepCopy(config.getStore().getData());
							originData.globalState.containerColor = `rgba(${newcolor.r}, ${newcolor.g}, ${newcolor.b}, ${newcolor.a})`;
							config.getStore().setData(originData);
						}}
					></ColorPicker>
				</Col>
			</Row> */}
		</div>
	);
}

export default rightGlobalCustom;