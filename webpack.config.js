const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const LessPluginCss = require('./lessPluginCss');

var ROOT_PATH = path.resolve(__dirname);
var SOURCE_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
var AssetsDir = 'assets2';
var mapAssetsDir = `${AssetsDir}/maps`;
var isDevelopment = process.env.NODE_ENV === 'development';

let analyzer = false;
process.argv.forEach((val, index) => {
    //console.log(`${index}: ${val}`);
    if(val === '--analyzer'){
        analyzer = true;
    }    
});

var localConfig;
try {
    localConfig = require('./webpack.config.local.js') 
} catch (error) {
    isDevelopment && console.warn('local config not found, use dev config')
}

var devConfig = localConfig || require('./webpack.config.dev.js');
var localServer = 'http://localhost:' + (devConfig.serverPort || 8887);
var routers = Object.keys(devConfig.router)
    .filter(key => devConfig.router[key].enabled)
    .map((key) => {
        let pathRewrite = {};
        pathRewrite[key] = devConfig.router[key].source.replace('./', '/');
        
        return {
            context: [key],
            target: devConfig.router[key].target || localServer,
            secure: true,
            pathRewrite: devConfig.router[key].pathRewrite || pathRewrite
        };
    });

var config = {
    context: SOURCE_PATH,
    //devtool: isDevelopment ? 'source-map' : false,
    /**
     * @see https://webpack.docschina.org/configuration/devtool/
     */
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : false,
    mode: isDevelopment ? 'development' : 'production',
    entry: Object.assign({}, isDevelopment ? {
        index: ['./index.tsx']
    } : {}),
    output: isDevelopment ? {libraryTarget: 'umd'} : {
        libraryTarget: 'umd',
        path: BUILD_PATH,
        //publicPath: `${AssetsDir}`,
        filename: isDevelopment ? `${AssetsDir}/[name].bundle.js` : `${AssetsDir}/[name].js`,
        chunkFilename: isDevelopment ? `${AssetsDir}/[name].chunk.js` : `${AssetsDir}/[name].js`,
        jsonpFunction: 'webpackEnvUscadaJsonp'
    },
    resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules', 'components', 'components_utils', 'components_widgets', '.'],
        alias: {
            // webpack导入formily里react错误
            react: 'node_modules/react/',
            // webpack导入formily里react错误
            antd: 'node_modules/antd/',
            jquery: 'jquery/dist/jquery.min.js',
            //rc-picker moment error
            moment: 'moment/moment.js',
            //rc-picker raf error
            raf: 'node_modules/raf/',
            '@':path.resolve('src')
        }
    },
    module: {
        rules: [{
                test: /\.(raw)\.(.)+$/,
                use: 'raw-loader',
        },{
            test: /\.(js|jsx|ts|tsx)$/,
            use: [{ 
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    plugins: [
                        'react-hot-loader/babel'
                    ]
                }
            }],
            include: [SOURCE_PATH]
        },{
            // modules css文件, 调试模式时不编译, 发布模式时编译
            test: /\.(mcss|mscss)$/,
            use: [
                {
                    loader: "style-loader",
                    options: { 
                        //injectType: "singletonStyleTag" 
                    }
                },
                { 
                    loader: 'css-loader',
                    options: {
                        sourceMap: !!isDevelopment,
                        modules: !isDevelopment ? true : {
                            mode: 'local',
                            localIdentName: '[path][name]__[local]'
                        }
                    } 
                },
                'postcss-loader',
                {
                    loader: "sass-loader",
                    options: {
                      sourceMap: !!isDevelopment,
                      sassOptions: !!isDevelopment ? {
                        // nested styles refer to top-level parent in sourcemap line number
                        outputStyle: 'compressed'
                      } : undefined
                    }
                }
            ]
        },{
            test: /\.css$/,
            use: [{
                loader: "style-loader",
                options: { 
                    //injectType: "singletonStyleTag" 
                }
            },'css-loader','postcss-loader']
        },{
            test: /\.scss$/,
            use: [{
                loader: "style-loader",
                options: { 
                    //injectType: "singletonStyleTag" 
                }
            },{ 
                loader: 'css-loader',
                options: { 
                    sourceMap: !!isDevelopment,
                    modules:{
                        auto: true,
                        localIdentName: '[path][name]__[local]'
                    }
                } 
            },{ 
                loader: 'postcss-loader'
            },{ 
                loader: 'sass-loader',
                options: {
                    sourceMap: !!isDevelopment,
                    additionalData: '$env: ' + process.env.NODE_ENV + ';'
                } 
            }]
        }, {
            test: /\.less$/,
            use: [{
                loader: "style-loader",
                options: { 
                    //injectType: "singletonStyleTag"
                }
            },{ 
                loader: 'css-loader',
                options: {
                    sourceMap: !!isDevelopment,
                    modules:{
                        auto: true,
                        localIdentName: '[path][name]__[local]'
                    }
                } 
            },{ 
                loader: 'postcss-loader'
            },{ 
                loader: 'less-loader',
                options: {
                    lessOptions: {
                        //antd theme
                        modifyVars: require('./.antdtheme.js'),
                        javascriptEnabled: true,
                        plugins: [new LessPluginCss({rmAntd4Global: false})],
                    },
                    sourceMap: !!isDevelopment
                } 
            }],
            include: [/node_modules/, /IMA/]
        }, {
            test: /\.(png|jpg|gif|woff|woff2|svg|ttf|eot)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 28192,
                    fallback: 'file-loader',
                    name: `${AssetsDir}/images/[name].[hash].[ext]`,
                    publicPath: isDevelopment ? './' : '../'
                }
            }]
        },{
            // map json reference build
            type: 'javascript/auto',
            test: function (filePath) {
                const isMapJson = filePath.indexOf(`src${path.sep}common${path.sep}maps`) > -1;
                return isMapJson;
            },
            use: [{
                loader: 'file-loader',
                options: {
                    name: (resourcePath, resourceQuery) => {
                        if(!resourcePath) return resourcePath;

                        let sep = path.sep;
                        let jsonPaths = resourcePath.split(['','src','common','maps',''].join(sep));
                        return `${mapAssetsDir}/${jsonPaths[1]}`
                    },
                    publicPath: isDevelopment ? './' : '../'
                }
            }]
        }]
    },
    optimization: isDevelopment ? {} : {
        minimize: !isDevelopment,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    }
                },
                extractComments: false
            })
        ],
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: 7,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]((react|@babel|babel-polyfill).*)[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    priority: 10
                },
                antd: {
                    test: /[\\/]node_modules[\\/]((antd|@ant-design|rc-).*)[\\/]/,
                    name: 'antd',
                    chunks: 'all',
                    priority: 8
                },
                echarts: {
                    test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
                    name: 'echarts',
                    chunks: 'all',
                    priority: 8
                },
                plugins: {
                    test: /[\\/]node_modules[\\/]((?!(react|@babel|babel-polyfill|echarts|zrender|antd|@ant-design|rc-)).*)[\\/]/,
                    name: 'plugins',
                    chunks: 'all',
                    priority: 9
                },
                common: {
                    test: /[\\/]src[\\/](common|components|components_utils)[\\/]/,
                    name: "common",
                    chunks: "all",
                    priority: 7
                },
                widgets: {
                    test: /[\\/]src[\\/](components_widgets)[\\/]/,
                    name: "widgets",
                    chunks: "all",
                    priority: 5
                },
                default: false
            }
        }
    },
    plugins: (isDevelopment ? [] : [
        new CleanWebpackPlugin(),

        new webpack.LoaderOptionsPlugin({
            options: {
            }
        }),

        //https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019#25426019
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
        //new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]).concat(
        // map json copy
        new CopyWebpackPlugin({
            patterns:[{
                from: './common/maps/**/*',
                to: (pathData) => {
                    const {context, absoluteFilename} = pathData;
                    if(!absoluteFilename) return absoluteFilename;

                    let sep = path.sep;
                    let jsonPaths = absoluteFilename.split(['','src','common','maps',''].join(sep));
                    return `${mapAssetsDir}/${jsonPaths[1]}`
                }
            }]
        }),

        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),

        new webpack.DefinePlugin({
            'MAPS_PATH': JSON.stringify(mapAssetsDir)
        })
    ).concat(analyzer ? [
        new BundleAnalyzerPlugin()
    ] : [])
    .concat(isDevelopment ? [
        new HtmlWebpackPlugin({
            title: 'index',
            template: './index.html',
            filename: './index.html',
            chunks: ['vendors', 'index'],
            inject: 'body'
        })
    ]: []),
    devServer: {
        //host: '0.0.0.0',
        //useLocalIp: true,
        compress: true,
        publicPath: '/build/',
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
        port: devConfig.port || 8888,
        open: 'Google Chrome',
        openPage: devConfig.openPage || 'build/index.html',
        stats: "errors-only",
        proxy: routers.concat([{
            context: [
                '/scadaweb/', '/mrweb/', '/checklog/', '/downtime/', 
                '/webcal/', '/reportserver/', '/controlplatform/','/storage'
            ],
            target: devConfig.target || "http://172.16.33.60:8701",
            secure: true,
            bypass: function(req, res, proxyOptions) {

            }
        }])
    },
    watchOptions: {
        ignored: /node_modules/
    }
};

var commonChunks = ['vendors', 'plugins', 'antd', 'echarts', 'common', 'widgets'];
//自定义chunk
var chunks = {
};

let dirs = [];

// 所有目录中包含以下目录时都会过滤
let EX = ['.svn', 'components', 'common', 'htmltemplate', '@types', 'components_utils', 'components_widgets'];
!isDevelopment && EX.push('dev_test')

let secondaryDir = ['solar', 'center'];

fs.readdirSync(SOURCE_PATH)
    .filter(entry => fs.statSync(path.join(SOURCE_PATH, entry)).isDirectory())
    .filter(entry => fs.readdirSync(path.join(SOURCE_PATH, entry)).length > 0)
    .map(entry => {
        if(EX.concat(secondaryDir).indexOf(entry) < 0){
            dirs.push(entry);
        }

        secondaryDir.forEach(dir => {
            let PARENT_DIR = path.join(SOURCE_PATH, dir);
            if(!fs.existsSync(PARENT_DIR) || !fs.statSync(PARENT_DIR).isDirectory())return;
            fs.readdirSync(PARENT_DIR)
                .filter(child => fs.statSync(path.join(PARENT_DIR, child)).isDirectory())
                .filter(child => fs.readdirSync(path.join(PARENT_DIR,child)).length > 0)
                .map(child => {
                    if(EX.indexOf(child) < 0){
                        dirs.push(`${dir}/${child}`);
                    }
                });
        });
    });
dirs.forEach(entry => {
    let entries = entry.split('/');
    let entryName = entries[entries.length - 1];
    let entryKey = entries.join('_');

    config.entry[entryKey] = ['./' + entry]; 

    config.plugins.push(new HtmlWebpackPlugin({
        title: 'page.' + entryName,
        template: './index.html',
        filename: entryName + '.html',
        favicon: 'common/image/envision.ico',
        chunks: (chunks[entryKey]||commonChunks).concat([entryKey]),
        chunksSortMode: function (chunk1, chunk2) {
            var order = (chunks[entryKey]||commonChunks).concat([entryKey]);
            var order1 = order.indexOf(chunk1);
            var order2 = order.indexOf(chunk2);
            return order1 - order2;  
        },
        inject: 'body',
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        }
    }));
}
);

// 兼容老模式控件,需要把控件单独打出
if(!isDevelopment){
    config.entry['widgetsModules'] = './widgets.modules.tsx';
    config.entry['widgetsUtils'] = './widgets.utils.tsx';
}

// 列表多页面
if(isDevelopment){
    config.plugins.push(
        new webpack.DefinePlugin({
            'MULTI_PAGES': JSON.stringify(config.entry)
        })
    );
}

if(isDevelopment){
    //eslint
    // config.plugins.push(
    //     new ESLintPlugin({
    //         overrideConfigFile: '.eslintrc.js',
    //         useEslintrc: true
    //     })
    // );

    var express = require('express')();
    express.all("/mock/:key", (req, res) => {
        res.sendFile(__dirname + '/mock/' + req.params.key);
    });
    express.listen(devConfig.serverPort || 8887);

    process.on('SIGTERM', () => {
        console.info('SIGTERM signal received.');
        console.log('Closing http server.');
        server.close(() => {
          console.log('Http server closed.');
        });
    });
}

module.exports = config;
