import { CommanderItem } from 'dooringx-lib/dist/core/command/commanderType';
import { CommanderItemFactory } from 'dooringx-lib';

const modulesFiles = (require as any).context('./', true, /\.(js|ts)$/);
const commandModules: CommanderItem[] = modulesFiles
	.keys()
    .filter(key => {
        return !(/^\.\/index.ts$/.test(key));
    })
	.reduce((modules: any, modulePath: any) => {
		const value = modulesFiles(modulePath);
		const df = value.default;
		if(df instanceof CommanderItemFactory){
			modules.push(df);
		}else{
			Object.keys(df).map(key => {
				modules.push(df[key]);
			})
		}
		
		return modules;
	}, []);

export default commandModules;
