// 开发环境打包配置
const common = require('./webpack.common');
const HTMLWebpackPlugin = require('html-webpack-plugin');
// v5之前
// const merge = require('webpack-merge');
//v5版本之后 webpack-merge v5 之后的导入方式有所不同，你需要从 webpack-merge 包中导入 merge 函数。
const {merge} = require('webpack-merge');
const path = require("node:path");
//css压缩插件
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
//js压缩插件
const TerserPlugin = require('terser-webpack-plugin');
module.exports = merge(common, {
    // 1-定义多个入口
    entry: {
        main: './src/main.js',
        hello: './src/hello.js'
    },
    //2-修改输出名称
    output: {
        filename: '[name]-[chunkhash:8]-bundle.js',
        path: path.join(__dirname, "/dist"),
    },
    //3-定义输出多个不同名称index.html
    plugins: [
        new HTMLWebpackPlugin({
            title: 'webpack main',
            filename: 'main.html',
            chunks: ['main']
        }),
        new HTMLWebpackPlugin({
            title: 'webpack hello',
            filename: 'hello.html',
            chunks: ['hello']
        })
    ],
    mode: 'development',
    devtool: 'cheap-module-source-map',
    //相当于tree shaking:集中配置webpack当中优化功能
    optimization: {
        //只导出使用的模块   负责标记【枯树叶】
        usedExports: true,
        // 压缩代码 负责【摇掉】他们 开发环境一般不压缩
        minimize: false,
        //这里：合并模块!!
        concatenateModules: true,
        //副作用，开启了之后没有用到的模块就不再会打包。
        sideEffects: true,
        //提取公共部分
        splitChunks: {
            chunks: 'all',
        },
        //minimizer默认压缩，配置为数组方式则为自定义配置打包压缩，CssMinimizerPlugin压缩css,TerserPlugin压缩js
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ]
    }
})
