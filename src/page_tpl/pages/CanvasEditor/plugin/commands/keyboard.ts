import deepcopy from 'deepcopy';
import { CommanderItemFactory, createUid } from 'dooringx-lib';
import { IStoreData } from 'dooringx-lib/dist/core/store/storetype';

const arrowUp = new CommanderItemFactory(
	'arrowUp',
	'ArrowUp',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const {container: {height: conHeight}} = clonedata;
		let needUpdate = false;
		clonedata.block.forEach((v) => {
			const {focus, top, height} = v;
			if (focus) {
				let newTop = top - 1;
				if(newTop >= 0){
					v.top = newTop;
					needUpdate = true;
				}
			}
		});
		if(needUpdate){
			store.setData(clonedata);
		}		
	},
	'上移'
);

const arrowDown = new CommanderItemFactory(
	'arrowDown',
	'ArrowDown',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const {container: {height: conHeight}} = clonedata;
		let needUpdate = false;
		clonedata.block.forEach((v) => {
			const {focus, top, height} = v;
			if (focus) {
				let newTop = top + 1;
				if(newTop <= (conHeight - Number(height))){
					v.top = newTop;
					needUpdate = true;
				}
			}
		});
		if(needUpdate){
			store.setData(clonedata);
		}
	},
	'下移'
);

const arrowLeft = new CommanderItemFactory(
	'arrowLeft',
	'ArrowLeft',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const {container: {width: conWidth}} = clonedata;
		let needUpdate = false;
		clonedata.block.forEach((v) => {
			const {focus, left, width} = v;
			if (focus) {
				let newLeft = left - 1;
				if(newLeft >= 0){
					v.left = newLeft;
					needUpdate = true;
				}
			}
		});
		if(needUpdate){
			store.setData(clonedata);
		}
	},
	'左移'
);

const arrowRight = new CommanderItemFactory(
	'arrowRight',
	'ArrowRight',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const {container: {width: conWidth}} = clonedata;
		let needUpdate = false;
		clonedata.block.forEach((v) => {
			const {focus, left, width} = v;
			if (focus) {
				let newLeft = left + 1;
				if(newLeft <= (conWidth - Number(width))){
					v.left = newLeft;
					needUpdate = true;
				}
			}
		});
		if(needUpdate){
			store.setData(clonedata);
		}
	},
	'右移'
);

const deleteFocus = new CommanderItemFactory(
	'delete',
	'Delete',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const newBlock = clonedata.block.filter(v => !v.focus);
		if(newBlock.length !== clonedata.block.length){
			clonedata.block = newBlock;
			store.setData(clonedata);
		}
	},
	'删除所选'
);

/**
 * keyboard: Control+c
 */
const copyFocus = new CommanderItemFactory(
	'copy',
	'',
	(store) => {
		const clonedata: IStoreData = deepcopy(store.getData());
		const copyBlock = clonedata.block.filter(v => v.focus);
		clonedata.block = clonedata.block.concat(deepcopy(copyBlock).map(v => {
			v.id = createUid(v.name)
			return v;
		}));
		if(copyBlock.length > 0){
			store.setData(clonedata);
		}
	},
	'复制'
);

export default {
    arrowDown,
	arrowUp,
	arrowLeft,
	arrowRight,
	deleteFocus,
	copyFocus
};
