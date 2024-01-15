import { CommanderItemFactory } from 'dooringx-lib';

const undo = new CommanderItemFactory(
	'undo',
	'Control+z',
	(store) => {
		store.undo();
	},
	'撤销'
);

export default undo;
