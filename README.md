# fis3-hook-node_modules

fis3 对npm的node_modules模块的支持

[demo]()

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
// 添加commonjs支持
fis.hook('commonjs', {
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx']
});

// client为项目目录
fis.match('/{node_modules, client}/**.js', {
    isMod: true,
    useSameNameRequire: true
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

// 用 loader 来自动引入资源。
fis.match('::package', {
    postpackager: fis.plugin('loader')
});

// 禁用components
fis.unhook('components')
fis.hook('node_modules')

```
