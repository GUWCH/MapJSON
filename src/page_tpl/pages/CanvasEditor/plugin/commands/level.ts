import deepcopy from 'deepcopy';
import { CommanderItemFactory } from 'dooringx-lib';
import { IStoreData, IBlockType } from 'dooringx-lib/dist/core/store/storetype';

const bottom = new CommanderItemFactory(
	'bottom',
	'',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
        const selectedBlock: IBlockType[] = [];
        const restBlock: IBlockType[] = [];
        clonedata.block.forEach((v, i) => {
            if(v.focus){
                selectedBlock.push(v);
                return;
            }
            restBlock.push(v);
        });

        clonedata.block = selectedBlock.concat(restBlock);
		store.setData(clonedata);
	},
	'置底'
);

const top = new CommanderItemFactory(
	'top',
	'',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
        const selectedBlock: IBlockType[] = [];
        const restBlock: IBlockType[] = [];
        clonedata.block.forEach((v, i) => {
            if(v.focus){
                selectedBlock.push(v);
                return;
            }
            restBlock.push(v);
        });

        clonedata.block = restBlock.concat(selectedBlock);
		store.setData(clonedata);
	},
	'置顶'
);

export default {
    top,
    bottom
};
