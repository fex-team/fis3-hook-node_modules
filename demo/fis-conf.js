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
fis.hook('node_modules', {
  useDev: true
})

fis.match('/client/index.jsx', {
  isMod: false
})
