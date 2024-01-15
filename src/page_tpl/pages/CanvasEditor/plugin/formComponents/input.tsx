import React, { memo, useMemo } from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { Col, Input, Row } from 'antd';
import { FormMap } from '../formTypes';
import { CreateOptionsRes } from 'dooringx-lib/dist/core/components/formTypes';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';

interface MInputProps {
	data: CreateOptionsRes<FormMap, 'input'>;
	current: IBlockType;
	config: UserConfig;
}

function MInput(props: MInputProps) {
	const option = useMemo(() => {
		return props.data.option || {};
	}, [props.data]);
	const store = props.config.getStore();
	return (
		<Row style={{ padding: '10px' }}>
			<Col span={6} style={{ lineHeight: '30px' }}>
				{option.label || '文字'}：
			</Col>
			<Col span={18}>
				<Input
					value={props.current.props[option.receive!] || ''}
					onChange={(e) => {
						const receive = (option as any).receive;
						const clonedata = deepCopy(store.getData());
						const newblock = clonedata.block.map((v: IBlockType) => {
							if (v.id === props.current.id) {
								v.props[receive] = e.target.value;
							}
							return v;
						});
						store.setData({ ...clonedata, block: [...newblock] });
					}}
				></Input>
			</Col>
		</Row>
	);
}

export default memo(MInput);
