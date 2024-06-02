const webpack = require('webpack');
const path = require("path");
// clean-webpack-plugin 清除上次生成的dist目录 避免遗留文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
// html-webpack-plugin 通过webpack输出html文件  index.html中的script路径引用 是否正常
const HTMLWebpackPlugin = require("html-webpack-plugin");
// copy-webpack-plugin 拷贝不需要打包的目录
const CopyWebpackPlugin = require("copy-webpack-plugin");
//提取css文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// 更多插件查看webpack官网 看具体使用plugin教程即可

// 自制插件 plugin 通在webpack生命周期的钩子中挂载函数实现扩展  ！！！ 类似事件 webpack给每个环节埋下钩子 挂载不同任务 就可扩展webpack能力
//webpack要求我们钩子必须是一个函数或者是一个包含apply方法的对象
//编写一个插件 去除js文件中的注释
class MyPlugin {
    apply(compiler) {
        compiler.hooks.emit.tap('MyPlugin', compilation => {
            //compilation 理解为此次打包的上下文
            for (const name in compilation.assets) {
                console.log(`Processing asset: ${name}`);
                if (name.endsWith(".js")) {
                    const content = compilation.assets[name].source();
                    console.log(`Original content: \n${content}`);
                    const withoutComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
                    console.log(`Content without comments: \n${withoutComments}`);
                    compilation.assets[name] = {
                        source: () => withoutComments,
                        //必须的方法
                        size: () => withoutComments.length,
                    };
                }
            }
        });
    }
}

module.exports = {
    mode: "none",
    entry: "./src/main.js",
    output: {
        //添加哈希值 缓存
        // :8指定长度 推荐使用chunkhash
        // * hash：项目中任何一个地方改动，打包都会造成全部文件变化
        // * chunkhash推荐: 根据修改代码处，打包只变化修改的代码处文件名
        // * contenthash：根据代码修改代码处，修改只变化内容的文件名

        // filename: "[name]-[hash]-bundle.js",
        filename: "[name]-[chunkhash:8]-bundle.js",
        // filename: "[name]-[contenthash]-bundle.js",
        path: path.join(__dirname, "/dist"),
        // 借助html-webpack-plugin自动生成的index.html不需手动配路径
        // publicPath: "dist/"
    },
    //代码映射
    // devtool: 'source-map',  大约12种 每种效果效果不同 是否适合生产环境也不同 效果最好则生成最慢
    // devtool: 'eval',
    //开发环境偏向选择cheap-module-source-map 转换过后差异过大 首次打包慢无所谓 重写打包就快了
    //生产环境 选择none 为了不暴露源代码 隐患 调试是开发阶段的事情 或者nosources-source-map
    devtool: 'cheap-module-source-map',
    //@符号代表从src文件夹下寻找
    resolve: {
        alias: {
            '@': path.resolve(__dirname, "src"),
        }
    },
    //定义开发服务器直接访问到的资源 copy-webpack-plugin是上线前的一次打包，其实作用就是没有打包静态文件 但是可以让你访问到此文件
    devServer: {
        //开启HMR热更新
        // hot: true,
        //使用了热更新是否被处理了模块热替换 都不会自动刷新 可以看到上次错误
        hotOnly: true,
        //webpack5 将contentBase换成了static  输入http://localhost:8080/images/test.png 就能访问public目录 开发环境无需打包
        static: {
            directory: path.join(__dirname, 'public'),
        },
        //代理跨域
        proxy: [
            {
                context: ['/api'],
                changeOrigin: true,
                target: 'https://api.github.com',
                pathRewrite: {'^/api': ''}
            },
        ],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        //将ES Modules转换为CommonJS
                        presets: [
                            ['@babel/preset-env', {
                                //默认是auto自动，写了commonjs是强制转换为commonjs,此时usedExports无法生效，即tree shaking无法生效
                                modules: 'commonjs'
                            }]
                        ],
                    }
                }
            },
            {
                test: /\.html$/,
                use: 'html-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader']
            },
            {
                test: /\.png$/,
                use: {
                    loader: "url-loader",
                    options: {
                        name: '[name].[hash:8].[ext]',
                        outputPath: 'images/',
                        publicPath: 'images/',
                        limit: 10 * 1024,
                    }
                }
            },
            {
                test: /\.md$/,
                use: './markdown-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        // 用于生成index.html
        new HTMLWebpackPlugin({
            title: "Webpack Plugin Demo",
            meta: {
                viewport: "width=device-width, initial-scale=1"
            },
            // 按照模版输出
            // template: "./src/index.html",
        }),
        // 用于生成about.html
        // new HTMLWebpackPlugin({
        //     filename: "about.html",
        // }),
        //开发阶段不使用这个插件 上线前才使用 开销大速度慢
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {from: "./public", to: "public"},
        //     ]
        // }),
        // 自制插件 用于清除js文件中的注释
        new MyPlugin(),
        //用于热更新
        new webpack.HotModuleReplacementPlugin(),
        //按需加载css文件
        new MiniCssExtractPlugin({
            // :8指定长度 推荐使用chunkhash
            // * hash：项目中任何一个地方改动，打包都会造成全部文件变化
            // * chunkhash推荐: 根据修改代码处，打包只变化修改的代码处文件名
            // * contenthash：根据代码修改代码处，修改只变化内容的文件名
            // filename:'[name]-[hash:8].bundle.css',
            filename: '[name]-[chunkhash:8].bundle.css',
            // filename:'[name]-[contenthash].bundle.css',
        }),
        // 压缩css
        // new CssMinimizerPlugin()
    ]
}
