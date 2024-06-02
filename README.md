# webpack学习笔记
* 参考文档：
  [Webpack官网中文文档](https://www.webpackjs.com/concepts/)
* 学习视频：
  [Webpack原理与实践](https://www.bilibili.com/video/BV1kP41177wp/?vd_source=4046650f4b6e75ab86067f7a5a418626)
> 温故webpack打包知识,忘记了就回头看看~ 根据学习视频学习整理，不为一一对应笔记，主要是根据对学习视频知识的梳理~
> PS:上学习视频是基于webpack4的，我这边运行时基于webpack5的，不对的地方已经按照官方文档进行定义配置


## 初始化项目
环境要求：node+npm+webpack

1. 初始化 npm 项目
```shell
npm init -y 
```
2. 安装 webpack 和 webpack-cli：
```shell
npm install --save-dev webpack webpack-cli
```

3. 创建项目
* 建立webpack.config.js文件
* 新建src文件夹，新建打包入口文件main.js
  webpack.config.js
```javascript
const path = require('path');
module.exports = {
    //定义入口文件
    entry: './src/main.js',
  // 定义输出文件名
  output:{
        //定义输出名称
        filename:'bundle.js',
        //定义输出路径
       path: path.join(__dirname, "/dist"),
  }
}
```
main.js
```javascript
alert('Hello world!')
```
4. 定义打包命令package.json中script
* 运行npm run build 则打包文件,默认根据webpack.config.js配置打包
```json
  "scripts": {
    "build": "webpack"
  }
```
5. 在根目录建立index.html文件，通过script标签引入打包的文件(后面通过插件htlm-webpack-plugin自动生成，则删除此文件，直接自动打包到dist文件夹中，并会自动引入打包.js文件)
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Webpack Plugin Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="dist/bundle.js"></script>
    </head>
  <body>
  </body>
</html>
```
6. 安装server运行静态服务器
> 运行serve则打开当前目录，若有index.html默认运行index.html文件
```shell
npm install -g serve
```
运行
* 当前开始时运行的自定义的index.html看效果，
```shell
serve .
```
* 后续运行dist文件夹的自动生成的index.html看效果
```shell
serve dist
```

## 模块化标准规范
*  浏览器：ES Module (主流的打包方案)
*  Nodejs: Commonjs(内置的环境系统)

## Entry（入口）：

Webpack 的打包过程从入口文件开始。入口文件可以是一个或多个，指定了应用程序的起点。
```javascript
// webpack.config.js
module.exports = {
entry: './src/index.js'
};
```

## Output（输出）：
配置打包后的文件输出位置和文件名。
```javascript
// webpack.config.js
module.exports = {
entry: './src/index.js',
output: {
filename: 'bundle.js',
path: __dirname + '/dist'
}
};
```

## Loaders（加载器）：
> Loaders 让 Webpack 能够处理非 JavaScript 文件!!! 如 CSS、图片、字体等。通过配置 loaders，Webpack 可以将这些文件转换为可以被应用程序使用的模块。
> 具体每个loader作用以及更多loader查看官网，在这里配置最常见的loader

常见loader如下：
* style-loader & css-loader
* file-loader & url-loader
* html-loader
* babel-loader
* 自制loader
* ...
1. 安装依赖
```shell
npm i style-loader css-loader file-loader url-loader html-loader babel-loader
```
2. 配置应用
```javascript
const webpack = require('webpack');
const path = require("path");
module.exports = {
  mode: "none",
  entry: "./src/main.js",
  output: {
    filename: "[name]-[chunkhash:8]-bundle.js",
    path: path.join(__dirname, "/dist"),
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
      }
    ]
  }
}
```
### 自制loader详解
> 自制markdown-loader为了解析引入.md文件

1. 安装markdown-it(webpack5用这个解析.md文件）
```shell
npm i markdown-it
```
2. 新建markdown-loader.js
```javascript
const markdownIt = require('markdown-it')();

module.exports = function markdownLoader(source) {
    const html = markdownIt.render(source);
    return `module.exports = ${JSON.stringify(html)}`;
};
```
3. 配置使用
```javascript

const webpack = require('webpack');
const path = require("path");
module.exports = {
  mode: "none",
  entry: "./src/main.js",
  output: {
    filename: "[name]-[chunkhash:8]-bundle.js",
    path: path.join(__dirname, "/dist"),
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: './markdown-loader'
      }
    ]
  }
}
```
### style-loader 和 css-loader
> 这两个 Loaders 通常一起使用，用于处理 CSS 文件并将其引入到 JavaScript 模块中。

* css-loader：
> 解析 CSS 文件中的 @import 和 url() 语法，并将 CSS 转换为 JavaScript 模块。
允许你在 JavaScript 文件中通过 import 或 require 引入 CSS 文件。

* style-loader：
> 将 CSS 以 <style> 标签的形式插入到 HTML 文档的 <head> 中，从而在浏览器中生效。

示例配置：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

```
###  file-loader 和 url-loader
> 这两个 Loaders 用于处理文件资源，如图片、字体等。

* file-loader：
> 将文件解析为 import 或 require 语句，并返回一个相应的 URL。
将文件复制到输出目录，并根据配置返回相对 URL 或绝对 URL。

* url-loader：
> 功能类似于 file-loader，但如果文件小于设定的阈值（以字节为单位），它会将文件内容转换为 Base64 编码的 Data URL，嵌入到生成的 JavaScript 文件中。
超过阈值的文件仍然会使用 file-loader 处理

示例配置：
```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192, // 8KB 以下的文件会被转为 Base64
                            name: '[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    }
};
```
### html-loader
* html-loader：
>解析 HTML 文件中的 <img> 标签、<link> 标签和其他资源引用，将它们转换为 import 或 require 语句，从而使得这些资源能够被 Webpack 打包。
处理 HTML 文件中的资源依赖，生成正确的资源路径。
示例配置
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  }
};

```
### babel-loader
> babel-loader：
使用 Babel 将 ES6/ES7/ES8 等现代 JavaScript 语法转换为 ES5，从而兼容更多的浏览器环境。
支持 Babel 插件和预设（presets），如 @babel/preset-env，以便使用最新的 JavaScript 特性和语法。

示例配置：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```
> 总结
* style-loader & css-loader：处理 CSS 文件，解析并注入到 HTML 中。
* file-loader & url-loader：处理文件资源（如图片、字体），将文件复制到输出目录并生成相应的 URL，url-loader 可以将小文件内联到 JavaScript 中。
* html-loader：解析 HTML 文件中的资源引用，生成正确的资源路径。
* babel-loader：使用 Babel 将现代 JavaScript 语法转换为 ES5，以兼容更多浏览器环境。
  通过使用这些 Loaders，Webpack 可以处理多种类型的文件资源，并将它们整合到打包输出中，提高开发效率和代码兼容性。

## Plugins（插件）：
> 插件用于执行更广泛的任务，如优化打包结果、资源管理和环境变量注入。插件比 loaders 更强大，提供了更多功能。
> 具体每个plugins作用以及更多plugins查看官网，在这里配置最常见的plugins

常见plugins如下：
* clean-webpack-plugin
* html-webpack-plugin
* copy-webpack-plugin
* mini-css-extract-plugin
* css-minimizer-webpack-plugin
* terser-webpack-plugin
* 自制plugins
* ...更多plugins详见官网

1. 安装依赖
```shell
npm i --save-dev clean-webpack-plugin  html-webpack-plugin  copy-webpack-plugin mini-css-extract-plugin css-minimizer-webpack-plugin terser-webpack-plugin
```
2. 配置应用
```javascript
// clean-webpack-plugin 清除上次生成的dist目录 避免遗留文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
// html-webpack-plugin 通过webpack输出html文件  index.html中的script路径引用 是否正常
const HTMLWebpackPlugin = require("html-webpack-plugin");
// copy-webpack-plugin 拷贝不需要打包的目录
const CopyWebpackPlugin = require("copy-webpack-plugin");
//提取css文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//js压缩插件
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require("path");

module.exports = {
  mode: "none",
  entry: "./src/main.js",
  output: {
    filename: "[name]-[chunkhash:8]-bundle.js",
    path: path.join(__dirname, "/dist"),
  },
  //相当于tree shaking:集中配置webpack当中优化功能
  optimization: {
    // 压缩代码 负责【摇掉】他们 开发环境一般不压缩
    minimize: false,
    //minimizer默认压缩，配置为数组方式则为自定义配置打包压缩，CssMinimizerPlugin压缩css,TerserPlugin压缩js
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin()
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
    new CssMinimizerPlugin()
  ]
}
```
### 自制plugins详解
> 自制my-plugins插件,用于清除js文件中的注释！
* 通在webpack生命周期的钩子中挂载函数实现扩展  ！！！ 类似事件 webpack给每个环节埋下钩子 挂载不同任务 就可扩展webpack能力。
* webpack要求我们钩子必须是一个函数或者是一个包含apply方法的对象

配置如下：
```javascript
const path = require("path");
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
    filename: "[name]-[chunkhash:8]-bundle.js",
    path: path.join(__dirname, "/dist"),
  },
  plugins: [
    // 自制插件 用于清除js文件中的注释
    new MyPlugin(),
  ]
}
```
3. 配置使用
```javascript

const webpack = require('webpack');
const path = require("path");
module.exports = {
  mode: "none",
  entry: "./src/main.js",
  output: {
    filename: "[name]-[chunkhash:8]-bundle.js",
    path: path.join(__dirname, "/dist"),
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: './markdown-loader'
      }
    ]
  }
}
```
### clean-webpack-plugin
* 作用：在每次构建之前清理 /dist 文件夹，确保输出目录中只有构建过程中生成的文件。
* 主要功能：
    - 删除旧的文件，防止冗余文件堆积，保持输出目录整洁。
      安装依赖
```shell
npm i --save-dev clean-webpack-plugin
```
配置
```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
};
```
### html-webpack-plugin
* 作用：生成 HTML 文件，并自动注入打包生成的 JavaScript 和 CSS 文件。
* 主要功能：
    - 根据模板或默认生成 HTML 文件。
    - 自动注入所有打包生成的资源（例如 JS、CSS 文件）。
    - 支持设置模板、文件名、标题等选项。

  安装依赖
```shell
npm i --save-dev html-webpack-plugin
```
配置
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            title: 'My App'
        })
    ]
};
```
### copy-webpack-plugin
* 作用：将文件或文件夹从一个位置复制到另一个位置（通常是复制静态资源到输出目录）。
* 主要功能：
    - 复制不需要进行编译处理的文件，如图片、字体、静态 HTML 等。

  安装依赖
```shell
npm i --save-dev copy-webpack-plugin
```
配置
```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: 'dist' }
            ]
        })
    ]
};

```

### mini-css-extract-plugin
> 通过MiniCssExtractPlugin插件实现css文件的按需加载。建议css文件超过150kb才考虑是否提取到文件当中，会单独生成一个文件。
* 作用：将 CSS 提取到单独的文件，而不是嵌入到 JavaScript 中。
* 主要功能：
    - 提高 CSS 加载速度，减少 JavaScript 文件的体积。
    - 支持按需加载 CSS。

  安装依赖
```shell
npm i --save-dev mini-css-extract-plugin
```
配置
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        })
    ]
};

```

### css-minimizer-webpack-plugin
> * optimize-css-assets-webpack-plugin
  * css-minimizer-webpack-plugin
> PS:由于 optimize-css-assets-webpack-plugin 版本与 webpack 版本之间的兼容性问题。
> 具体来说，optimize-css-assets-webpack-plugin@6.0.1 需要 webpack@^4.0.0，而我当前的项目中使用的是 webpack@5.91.0。
> 则不适用安装此，我将安装css-minimizer-webpack-plugin代替。
> 当然，你也可以使用 --legacy-peer-deps 参数来忽略兼容性检查，但这可能会导致其他问题。

* 作用：压缩和优化 CSS 文件，减少文件体积，提高加载速度。
* 主要功能：
    - 使用 cssnano 库进行 CSS 的压缩优化。
    - 通常与 mini-css-extract-plugin 配合使用。
    - 通常与 terser-webpack-plugin配合使用，压缩js文件。

1. 安装依赖
 - 压缩css
```shell
npm i --save-dev css-minimizer-webpack-plugin
```
- 压缩js
> 为了区分环境，使用optimization中minimizer进行，一般默认压缩，配置为数组方式则为自定义配置打包压缩，CssMinimizerPlugin压缩css,则需要安装TerserPlugin压缩js)
```shell
npm install --save-dev terser-webpack-plugin
```
2. 引入并使用
```javascript
// 引入依赖压缩css
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//js压缩插件
const TerserPlugin = require('terser-webpack-plugin');

module.exports={
    // 压缩建议在生产环境才输出，建议放在optimization中minimize统一配置
  optimization:{
      //可以由这里控制是否压缩，开发环境设置为false则不压缩，生产环境设置为true开启压缩
      minimize:true,
      //minimizer默认压缩，配置为数组方式则为自定义配置打包压缩，CssMinimizerPlugin压缩css,TerserPlugin压缩js
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin()
      ]
    },
   //这里配置直接压缩不区分环境
    // plugins:[
    //   // 压缩css
    //   new CssMinimizerPlugin()
    // ]
}
```

### terser-webpack-plugin
* 作用：压缩和优化 JavaScript 文件，减少文件体积，提高加载速度。
* 主要功能：
    - 使用 Terser 库进行 JavaScript 的压缩优化。
    - 替代 Webpack 4 之前的 UglifyJS 插件。

  安装依赖
```shell
npm i --save-dev terser-webpack-plugin
```
配置
```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    }
};
```
> 总结
* clean-webpack-plugin：在每次构建之前清理输出目录，保持目录整洁。
* html-webpack-plugin：生成 HTML 文件并自动注入打包生成的资源。
* copy-webpack-plugin：复制文件或文件夹到输出目录。
* mini-css-extract-plugin：将 CSS 提取到单独的文件，提高加载速度。
* css-minimizer-webpack-plugin：压缩和优化 CSS 文件，减少文件体积。
* terser-webpack-plugin：压缩和优化 JavaScript 文件，减少文件体积。
  通过使用这些插件，Webpack 可以更高效地处理和优化各种资源，提高构建和加载性能。

## webpack-dev-server
> 自动刷新功能：将打包结果暂时存放在内存当中，没有进入磁盘读写，webpack-dev-server从内存当中将变化读取出来，发送到浏览器，添加--open默认自动打开我们的浏览器，这里添加到script命令里，我配置到dev,运行一次就可以看到一边编码一边预览的环境
* 跨域代理（前后台同源部署，没必要开启CORS,本地调试加代理--）
1. 安装依赖
```shell
npm install --save-dev webpack-dev-server
```
2. 配置运行命令在package.json中
```json
 "scripts": {
    "dev": "webpack-dev-server --open"
  }
```
运行
```shell
npm run dev
```
运行之后，在文件中修改浏览器内容在保存后便会直接变化，无需刷新方可更新
## devtools(source-map)
> 设置属性 devtool: 'source-map' 一般效果最好的生成的最慢，约为12种，每种方式效率和效果不同
* 开发环境偏向选择cheap-module-source-map 转换过后差异过大 首次打包慢无所谓 重写打包就快了
* 生产环境 选择none 为了不暴露源代码 隐患 调试是开发阶段的事情 或者nosources-source-map
```javascript
module.exports={
  devtool: 'cheap-module-source-map'
}
```
[点击查看更多source-map](https://www.webpackjs.com/configuration/devtool/#devtool)

## HMR热更新
> Hot Module Replacement 模块热替换或者叫模块热更新。
Webpack 的热更新（Hot Module Replacement, HMR）是一种允许在运行时替换、添加或删除模块，而无需重新加载整个页面的技术。HMR 的核心原理包括模块热替换、依赖管理以及状态保持。以下是 Webpack 热更新的详细实现原理

Webpack 热更新的工作流程
1. 检测变更：
- Webpack 使用文件系统监视工具（如 chokidar）监视源代码文件的变更。当开发者修改文件并保存时，Webpack 侦测到这些变化。
2. 编译模块：
- 一旦检测到变更，Webpack 重新编译受影响的模块（模块包括 JavaScript、CSS、模板文件等）。这一步只重新编译变更的部分，而不是整个应用。
3. 生成补丁： 
- 编译完成后，Webpack 生成更新的模块，并将这些模块打包成补丁（Hot Update Chunk），包含变更的模块和相应的依赖关系。
4. 通知客户端：
Webpack 开发服务器（Webpack Dev Server）通过 WebSocket 向客户端（浏览器）发送更新通知。通知内容包括更新的模块 ID 和哈希值等信息。
5. 应用更新：
- 客户端收到更新通知后，通过 WebSocket 从开发服务器请求补丁数据。
- 客户端运行 HMR 运行时逻辑，动态地将新的模块替换进运行中的应用。

### Webpack HMR 关键组件 
- Webpack Dev Server
   Webpack Dev Server 是一个开发服务器，提供静态文件服务、实时重载以及 HMR 支持。它在内存中保存最新的编译结果，减少文件系统 I/O 操作，提高性能。

- HMR Runtime
   HMR 运行时是注入到打包输出中的一段 JavaScript 代码，负责处理模块更新。它通过 WebSocket 与 Webpack Dev Server 通信，接收更新通知并应用补丁。

热更新的应用过程 
1. 更新检查：
- HMR Runtime 通过 WebSocket 接收来自 Webpack Dev Server 的更新通知。
2. 请求更新模块：
- HMR Runtime 发送请求获取更新模块的补丁数据（包含新的模块代码和更新的哈希值）。
3. 模块热替换：
- HMR Runtime 加载新的模块代码，调用模块的 accept 或 dispose 钩子函数，执行模块热替换逻辑。
accept 钩子函数允许模块在更新时执行自定义逻辑，例如重新渲染组件。
dispose 钩子函数允许模块在被替换前执行清理工作，例如移除事件监听器或保存状态。

例子：当然也可在本main.js中体会
```javascript
if (module.hot) {
module.hot.accept('./moduleA.js', function() {
console.log('moduleA updated');
// 处理更新后的逻辑
render();
});

module.hot.dispose(function() {
console.log('Cleaning up before module is replaced');
// 清理逻辑，例如移除事件监听器
});
}

function render() {
const content = require('./moduleA.js');
document.getElementById('app').innerHTML = content;
}

render();
```
在这个示例中，当 moduleA.js 被更新时，HMR Runtime 会调用 accept 钩子函数重新渲染内容，并在模块被替换前调用 dispose 钩子函数进行清理工作。

总结
> Webpack 的热更新机制通过监听文件变化、重新编译受影响模块、生成并应用补丁来实现模块的热替换。
> 关键组件包括 Webpack Dev Server 和 HMR Runtime，它们共同配合，使得开发者可以在不刷新整个页面的情况下高效地进行模块更新。
> 通过使用 HMR，开发者可以显著提升开发体验和效率。

开启热更新，配置package.json文件 配置--hot
```json
 "scripts": {
    "dev": "webpack-dev-server --open --hot"
}
```

## 不同环境中的配置
通过运行命令env区别：
打包命令 配置在script上
```shell
webpack --env production
```

实际操作 webpack.common.js 根据env判断环境做相应处理
```javascript module.exports = (env,argv)=>{
const config = {
}
//生产环境下的配置
   if(env==='production'){
   config.mode = 'prodution'
   config.devtool = false
   config.plugin =[
   ...config.plugins,
   new CleanWebpackPlugin(),
   new CopyWebpackPlugin(['public'])
   ]
   }
}
```
### 大型项目建议
不同环境对应不同配置文件
* webpack.common.js 通用配置
* webpack.dev.js  开发环境配置
* webpack.prod.js  生产环境配置

### webpack-merge合并逻辑
1. 安装依赖
```shell
npm i --save-dev webpack-merge
```
2. 配置使用，比如在生产环境配置 webpack.prod.js中：
```javascript
//通用配置
const common = require('./webpack.common');
//合并配置
const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = merge(common,{
    mode:'production',
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin(['public'])
    ]
})
```
打包命令构建,配置在package.json中的script命令
```shell
webpack --config webpack.prod.js
```
## definePlugin注入变量
> 通常用于不同环境的区别
1. 在webpack.prod.js定义
```javascript
const webpack = require('webpack');
module.exports={
    mode:'none',
    entry: "./src/main.js",
    output:{
        filename: 'bundle.js',
    },
    plugins:[
        new webpack.DefinePlugin({
            API_BASE_URL:`"https:''api/example.com"`
        })
    ]
}
```
2. 在main.js测试
```javascript
//可以看到结果https:''api/example.com
console.log(API_BASE_URL);
```
验证：执行打包npm run build:prod可以看到bundle.js有https://api.example.com

## Tree Shaking 摇树
> tree shaking:将枯树叶摇落：即意思为自动检测出代码中未引用的代码，移除未用的多余代码。
> 生产环境默认开启！生产模式默认开启tree shaking功能！
运用
### 自动开启
这里我在editor.js定义了一个未被引用的console.log
* 开发环境：运行npm run build:dev打包就打印出来了，未开启tree shaking功能
* 生产环境：运行npm run build:prod打包就没有打印出来，生产模式默认开启tree shaking功能
### 1-指定生产环境
或打包时候指定为生产环境：
* package.json script配置命令
```shell
webpack --mode prodution
```
或者配置中指定mode
```javascript
module.exports = {
    mode:'prodution'
}
```
运行命令
```shell
npm run build:prod
```
### 2-手动开启tree shaking
主要通过配置 optimization 比如在开发环境下配置
```javascript
 // 开发环境打包配置
const common = require('./webpack.common');
// v5之前
// const merge = require('webpack-merge');
//v5版本之后 webpack-merge v5 之后的导入方式有所不同，你需要从 webpack-merge 包中导入 merge 函数。
const {merge} = require('webpack-merge');
module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    //相当于tree shaking:集中配置webpack当中优化功能,下面二者缺一不可
    optimization: {
        //只导出使用的模块   负责标记【枯树叶】
        usedExports: true,
        //压缩代码 负责【摇掉】他们
        minimize: true,
    }
})

```
运行命令
```shell
npm run build:dev
```

## 合并模块ConcatenateModules
> 主要通过在optimization配置concatenateModules:true，同时为了更好地看到效果，关闭掉minimizee:true
> 作用：尽可能将所有模块合并输出到一个函数中，就不是一个模块对应一个函数了。又名 Scope Hoisting 作用域提升
```javascript
// 开发环境打包配置
const common = require('./webpack.common');
// v5之前
// const merge = require('webpack-merge');
//v5版本之后 webpack-merge v5 之后的导入方式有所不同，你需要从 webpack-merge 包中导入 merge 函数。
const {merge} = require('webpack-merge');
module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    //相当于tree shaking:集中配置webpack当中优化功能
    optimization: {
        //只导出使用的模块   负责标记【枯树叶】
        usedExports: true,
        //压缩代码 负责【摇掉】他们
        // minimize: true,
        //这里：合并模块!!
        concatenateModules: true,
    }
})

```
运行查看
```shell
npm run buil
```
## Tree Shaking & Babel
> webpack发展非常快，有人提出使用了babel-loader,tree shaking就会失效。
原因是 tree shaking使用的前提是ES Modules.交给Webpack打包的代码必须使用ES Modules.而babel-loader是将ES Modules转换成CommonJS。
* 情况一：babel-loader 会判断是否usedExport,如果有，就禁用ES Module的转换。tree shaking生效
* 情况二：babel-loader在presets里面配置了modules为commonjs则为强制转换，tree shaking不生效
  具体如下代码：
```javascript
const webpack = require('webpack');
const path = require("path");
module.exports = {
    mode: "none",
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "/dist"),
    },
    //生产环境 选择none 为了不暴露源代码 隐患 调试是开发阶段的事情 或者nosources-source-map
    devtool: 'cheap-module-source-map',
    optimization: {
        //！！！只导出使用的模块  负责标记【枯树叶】 但是使用了babel-loader就看具体情况，强制转换commonjs这次就失效
        usedExports: true,
        //压缩代码 负责【摇掉】他们
        minimize: true,
        //这里：合并模块!!
        concatenateModules: true,
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
            }
        ]
    }
}

```
## SideEffects副作用特性
> 适用前提：确保你的代码没有副作用!! sideEffects一般用于NPM包标记是否有副作用，生产环境下默认开启，开启了之后没有用到的模块就不再会打包。
在optimization中配置

### 标识是否有副作用
> 在 Webpack 中，“副作用”（side effects）这个术语也有特定的意义，通常用于描述模块是否对导入它的代码产生额外影响。具体来说，Webpack 会使用 sideEffects 字段来标记一个模块或包是否包含副作用，以便进行更好的优化，例如 Tree Shaking（移除未使用的代码）。

package.json中
```json
{
"name": "my-library",
"version": "1.0.0",
"sideEffects": false
}
```
在这个例子中，设置 "sideEffects": false 表示模块没有副作用，Webpack 可以安全地移除未使用的代码部分。如果某些文件确实有副作用，可以指定它们：
```json
{
"name": "my-library",
"version": "1.0.0",
"sideEffects": ["*.css", "*.scss"]
}
```
这告诉 Webpack 除了 .css 和 .scss 文件外，其他文件都没有副作用。

### 开启副作用功能
> 在编程中，“副作用”（side effect）指的是函数或表达式在计算结果之外，还会对程序的其他部分产生影响的情况。通俗一点说，副作用是指除了返回一个值以外，函数或表达式还做了其他事情，这些事情会影响到外部的状态或环境。比如说有个方法Number.propotype.pad = function(){}通过原型改变Number方法这也是副作用，开启了副作用将不再打包这段函数

webpack.dev.js:
```javascript
optimization:{
    //开启副作用，生产环境默认开启,没用到的模块不再打包
  sideEffects: true
}
```

## 多入门打包
> entry定义为一个对象，一个属性就是打包的一个路径，多个入口打包出多个结果，filename不直接定义为一个固定名称。
> 但是若是希望打包出来也为多个index.html就需要独立配置，都则将会打包到一个index.html中引入。则需在HtmlWebpackPlugin中定义chunks:['index']
实现步骤
1. 定义entry多个入口 对象方式
2. 修改输出多个文件名称区分
3. 定义输出多个不用名称index.html，多个引入代替一个index.html引入多个
```javascript
// 开发环境打包配置
const common = require('./webpack.common');
const HTMLWebpackPlugin = require('html-webpack-plugin');
// v5之前
// const merge = require('webpack-merge');
//v5版本之后 webpack-merge v5 之后的导入方式有所不同，你需要从 webpack-merge 包中导入 merge 函数。
const {merge} = require('webpack-merge');
const path = require("node:path");
module.exports = merge(common, {
  // 1-定义多个入口
  entry:{
    main: './src/main.js',
    hello:'./src/hello.js'
  },
  //2-修改输出名称
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, "/dist"),
  },
  //3-定义输出多个不同名称index.html
  plugins: [
    new HTMLWebpackPlugin({
      title: 'webpack main',
      filename: 'main.html',
      //定义chunks连接
      chunks:['main']
    }),
    new HTMLWebpackPlugin({
      title: 'webpack hello',
      filename: 'hello.html',
      //定义chunks连接
      chunks:['hello']
    })
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  //相当于tree shaking:集中配置webpack当中优化功能
  optimization: {
    //只导出使用的模块   负责标记【枯树叶】
    usedExports: true,
    //压缩代码 负责【摇掉】他们  仅仅对于js文件生效 css不生效
    minimize: true,
    //这里：合并模块!!
    concatenateModules: true,
    //副作用，开启了之后没有用到的模块就不再会打包。
    sideEffects: true,
  }
})
```
### 不同打包之提取公共模块
> 代码中会有相同的共用部分造成代码复用率低。
> 利用optimization中配置splitChunks代码分割为chunks:'all'开启提取打包公用模块
```javascript
    //相当于tree shaking:集中配置webpack当中优化功能
    optimization: {
        //提取公共部分
        splitChunks:{
            chunks: 'all'
        }
    }
```
打包查看
```shell
npm run build:dev
```
可看到dist文件中生成了多余的js文件名为二者合一公用模块

##  动态导入
> 动态导入按需加载极大节省我们的带宽以及流量，提高响应速度。
> 事例情况：就是比如点击菜单A显示A内容，菜单B显示B内容。而不是一开始就加载全部AB内容，而是做到按需加载。
> 具体原理：按照监听菜单瞄点，是什么瞄点加载什么内容

具体原理实现代码：
```javascript
const render = ()=>{
  const hash = window.location.hash || "#posts";
  const mainElements = document.querySelector('.main');
  mainElements.innerHTML = '';
  if(hash==='#posts'){
      import('./posts/post').then(({default:posts})=>{
        mainElements.appendChild(posts());
      })
  }else if(hash==='#album'){
    import('./posts/album').then(({default:album})=>{
      mainElements.appendChild(album());
    })
  }
}
render();
//监听改变
window.addEventListener('hashchange', render);
```

## 魔法注释
> 通过分包时候添加注释，相同的chunks name就会打包到一起

实现如下：
```javascript
const render = () => {
    const hash = window.location.hash || "#posts";
    const mainElements = document.querySelector('.main');
    mainElements.innerHTML = '';
    if (hash === '#posts') {
        //魔法注释
        import(/* webpackChunkname:'posts' */ './posts/post').then(({default: posts}) => {
            mainElements.appendChild(posts());
        })
    } else if (hash === '#album') {
        //魔法注释
        import(/* webpackChunkname:'album' */ './posts/album').then(({default: album}) => {
            mainElements.appendChild(album());
        })
    }
}
render();
//监听改变
window.addEventListener('hashchange', render);
```

## 输出文件名 Hash
> 启用静态资源，用户则不需要重复请求加载得到这些资源，整体响应速度就会有一个大幅度提升。
为了解决：
* 缓存失效时间设置的过短，效果则不明显
* 缓存失效时间设置的过长，没办法及时更新到客户端

> 生产模式下，文件名使用Hash哈希值，一旦资源文件发生改变，则会一起改变。
> 对于客户端而言，全新的文件名就是全新的请求，则没有缓存的问题。那缓存时间设置的非常长，也不担心更新问题。

hash模式
> 为了减少静态资源请求，设置缓存，则减少服务器的请求。
- 缓存时间设置的短，请求频繁。
- 缓存时间设置的长，用户不能及时更新

解决方式：设置hash哈希值
* hash：项目中任何一个地方改动，打包都会造成全部文件变化
* chunkhash推荐: 根据修改代码处，打包只变化修改的代码处文件名
* contenthash：根据代码修改代码处，修改只变化内容的文件名
> 通过:length指定哈希长度，默认是20位

```javascript
//提取css文件
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports={
    output:{
        filename:'[name]-[chunkhash:8].bundle.js',
        path: path.join(__dirname, "/dist"),
    },
  plugins:[
      new MiniCssExtractPlugin({
        filename:'[name]-[chunkhash:8].bundle.css'
      })
  ]
}
```

