import deepcopy from 'deepcopy';
import { CommanderItemFactory } from 'dooringx-lib';
import { IStoreData } from 'dooringx-lib/dist/core/store/storetype';

const clear = new CommanderItemFactory(
	'clear',
	'',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
        if(clonedata.block.length > 0){
            clonedata.block = [];
		    store.setData(clonedata);
        }		
	},
	'清除'
);

export default clear;
