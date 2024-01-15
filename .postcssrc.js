var isPublish = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'release';

module.exports = (ctx) => {
    return {
        hideNothingWarning: true, // 屏蔽开发模式下不使用插件时的warning
        //parser: 'sugarss',
        map: !isPublish,
        //stringifier: 'midas',
        plugins: [
            //isPublish ? require('postcss-plugin')() : false,
            isPublish ? require('autoprefixer')('last 2 versions', 'ie >= 9') : false,
            isPublish ? require('cssnano')({
                /**@see {@link https://cssnano.co/docs/what-are-optimisations/} */
                preset: 'default'
            }): false
        ]
    };
};