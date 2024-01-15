import { FunctionCenterType } from 'dooringx-lib/dist/core/functionCenter';

export const functionMap: FunctionCenterType = {
	上下文转对象: {
		fn: (ctx, next, _config, args) => {
			const arr = args['_sk'];
			const key = args['_r'];
			const param: Record<string, any> = {};
			arr.forEach((v: string) => {
				param[v] = ctx[v];
			});
			ctx[key] = param;
			console.log(ctx);
			next();
		},
		config: [
			{
				name: '输入要获取的上下文',
				data: ['ctx'],
				options: {
					receive: '_sk',
					multi: true,
				},
			},
			{
				name: '输入要生成的上下文',
				data: ['ctx'],
				options: {
					receive: '_r',
					multi: false,
				},
			},
		],
		name: '上下文转对象',
	},
};
