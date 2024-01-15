import { CommanderItemFactory } from 'dooringx-lib';
const undo = new CommanderItemFactory(
	'redo',
	'Control+Shift+z',
	(store) => {
		store.redo();
	},
	'重做'
);

export default undo;
