// 生产环境打包配置
const common = require('./webpack.common');
//webpack.DefinePlugin使用定义变量
const webpack = require('webpack');
// v5之前
// const merge = require('webpack-merge');
//v5版本之后 webpack-merge v5 之后的导入方式有所不同，你需要从 webpack-merge 包中导入 merge 函数。
const {merge} = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//css压缩插件
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
//js压缩插件
const TerserPlugin = require('terser-webpack-plugin');
module.exports = merge(common, {
    mode: 'production',
    devtool: 'nosources-source-map',
    //相当于tree shaking:集中配置webpack当中优化功能
    optimization: {
        //只导出使用的模块   负责标记【枯树叶】
        usedExports: true,
        // 压缩代码 负责【摇掉】他们
        minimize: true,
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
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {from: "./public", to: "public"},
            ]
        }),
        new webpack.DefinePlugin({
            API_BASE_URL:`"https://api.example.com"`,
        })
    ]
})
