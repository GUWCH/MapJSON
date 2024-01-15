import { ComponentClass, FunctionComponent } from 'react';

const modulesFiles = (require as any).context('./', true, /\.(js|tsx)$/);
export const Formmodules: Record<string, FunctionComponent<any> | ComponentClass<any, any>> =
	modulesFiles.keys()
    .filter(key => {
        return !(/^\.\/index.ts$/.test(key)) && key.split('/').length === 2;
    })
    .reduce((modules: any, modulePath: any) => {
		const tmp = modulePath.split('.');
		const name = tmp[tmp.length - 2].slice(1);
		const value = modulesFiles(modulePath);
		modules[name] = value.default;
		return modules;
	}, {});
