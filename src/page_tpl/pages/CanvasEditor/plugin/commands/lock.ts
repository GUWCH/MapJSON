import deepcopy from 'deepcopy';
import { CommanderItemFactory } from 'dooringx-lib';
import { IStoreData } from 'dooringx-lib/dist/core/store/storetype';

const lock = new CommanderItemFactory(
	'lock',
	'',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		clonedata.block.forEach((v) => {
			if (v.focus) {
				v.canDrag = false;
			}
		});
		store.setData(clonedata);
	},
	'锁定'
);

export default lock;
