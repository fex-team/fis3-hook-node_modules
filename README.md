# fis3-hook-node_modules

fis3 对npm的node_modules模块的支持

[demo](/demo)

[![NPM version][npm-image]][npm-url]

[![NPM][nodei-image]][nodei-url]

# Install

```bash
npm install fis3-hook-node_modules -g
```

暂时`process`, `buffer`等node全局变量的兼容还需手动安装依赖模块(之后会升级fis3已实现自动安装)
请安装至你的项目目录下面
```bash
npm install process buffer is-buffer --save
```

安装插件的的时候务必要带上`--save`或者`--save-dev`, 否则会出现文件查找不到的问题

# Dependencies

+ fis3-hook-commonjs
+ mod.js

# Usage

添加commonjs支持 (需要先安装fis3-hook-commonjs)

```js
fis.hook('commonjs', {
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx']
})
```

为node_modules文件添加针对mod.js的转换
```js
fis.match('/{node_modules}/**.js', {
    isMod: true,
    useSameNameRequire: true
});
```

禁用fis3默认的`fis-hook-components`
```js
fis.unhook('components')
fis.hook('node_modules')
```

## Tips

`fis.hook('commonjs')` 一定要在 `fis.hook('node_modules')`之前, 否则会出现文件找不到的问题

### 如何使用私有npm模块
私有npm模块可以放在内网的git仓库,也可以直接使用http地址安装

直接安装tar包

```
npm install https://github.com/jashkenas/backbone/archive/1.3.1.tar.gz --save
```

从git仓库安装

```
npm install git+https://github.com/jashkenas/backbone --save
```

## Config

+ useDev  加载 devDependencies 的模块, 默认为`false`


# 如何像webpack那样开发
通过这个插件, fis3已经完整实现通过 `require`语法加载node_modules, css, js, image等资源文件, 并支持整个npm生态圈

### 需要的插件

+ fis3-hook-node_modules
+ fis3-hook-commonjs
+ fis3-postpackager-loader
+ fis3-preprocessor-js-require-css
+ fis3-preprocessor-js-require-file

### 基本的配置


```
fis.hook('commonjs', {
    baseUrl: './client',
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx']
});

// client为项目目录
fis.match('/{node_modules, client}/**.js', {
    isMod: true,
    useSameNameRequire: true
});

fis.match('{*.{es,jsx},/client/**.js}', {
    rExt: 'js',
    isMod: true,
    useSameNameRequire: true,
    parser: fis.plugin('babel-5.x', {}, {
        presets: ["es2015", "react", "stage-0"]
    })
});

// 用 node-sass 解析
fis.match('*.scss', {
    rExt: 'css',
    parser: [
        fis.plugin('node-sass', {
            include_paths: [
                'static/scss'
            ] || []
        })
    ],
    postprocessor: fis.plugin('autoprefixer')
});


// 添加css和image加载支持
fis.match('*.{js,jsx,ts,tsx,es}', {
    preprocessor: [
      fis.plugin('js-require-css'),
      fis.plugin('js-require-file', {
        useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
      })
    ]
})

fis.match('/client/static/**.js', {
  parser: null,
  isMod: false
});

// 用 loader 来自动引入资源。
fis.match('::package', {
    postpackager: fis.plugin('loader')
});

// 禁用components
fis.unhook('components')
fis.hook('node_modules')

fis.match('/client/index.jsx', {
  isMod: false
})

```

[npm-url]: https://www.npmjs.com/package/fis3-hook-node_modules
[npm-image]: https://img.shields.io/npm/v/fis3-hook-node_modules.svg
[nodei-image]: https://nodei.co/npm/fis3-hook-node_modules.png?downloads=true&downloadRank=true&stars=true
[nodei-url]: https://www.npmjs.com/package/fis3-hook-node_modules
