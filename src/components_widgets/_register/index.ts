
const modulesFiles = (require as any).context('./', true, /\.(js|ts|tsx)$/);
const RegistedWidgets: Record<string, WidgetRegistParameter> =
	modulesFiles.keys()
    .filter(key => {
        return !(/^\.\/index.ts$/.test(key)) && key.split('/').length === 2;
    })
    .reduce((modules: any, modulePath: any) => {
		const tmp = modulePath.split('.');
		const name = tmp[tmp.length - 2].slice(1);
		const value = modulesFiles(modulePath);
		modules[value.default.id] = value.default;
		return modules;
	}, {});

if (process.env.NODE_ENV !== 'development') {
	delete RegistedWidgets.demo;
}

export {RegistedWidgets};