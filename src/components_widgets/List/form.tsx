import React from 'react';
import { deepCopy, UserConfig } from 'dooringx-lib';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import ListConfig from './ListForm/index';

export interface ListFormPropsType {
	data: {};
	current: IBlockType;
	config: UserConfig;
};

const List = (props: ListFormPropsType) => {
    const store = props.config.getStore();

    const onChange = (values: any) => {
        const cloneData = deepCopy(store.getData());
        const newblock = cloneData.block.map((v: IBlockType) => {
            if (v.id === props.current.id) {
                v.props = {...v.props, ...values};
            }
            return v;
        });
        store.setData({ ...cloneData, block: [...newblock] });
    };

    return <ListConfig {...props} onChange = {onChange}/>
}

export default List;