var path = require('path');
var resolve = require('resolve');
var moduleRoot;
var fs = require('fs');
var assign = require('object-assign');
var _ = require('lodash');
var componentsInfo = null;
var disabled = [];
var replaced = [];
var moduleVersion = {};
var moduleMaps = {};
var npmVersion = null;

var vars = {
  process: function () {
    return 'var process = require(\'process/browser\');';
  },
  global: function () {
    return 'var global = typeof global !== "undefined" ? global : '
        + 'typeof self !== "undefined" ? self : '
        + 'typeof window !== "undefined" ? window : {};'
        ;
  },
  'Buffer.isBuffer': function () {
    return 'Buffer.isBuffer = require("is-buffer");';
  },
  Buffer: function () {
    return 'var Buffer = require("buffer").Buffer;';
  }
};

var replaceVars = {
  __filename: function (file, basedir) {
    var filename = '/' + path.relative(basedir, file);
    return JSON.stringify(filename);
  },
  __dirname: function (file, basedir) {
    var dir = path.dirname('/' + path.relative(basedir, file));
    return JSON.stringify(dir);
  }
}

function checkNpmVersion (fis, opts) {
  moduleRoot = path.join(fis.project.getProjectPath(), opts.baseUrl || '.');

  var node_modules = fs.readdirSync(path.join(moduleRoot, 'node_modules')).map(function (val) {
    return path.join(moduleRoot, 'node_modules', val);
  }).filter(function (val) {
    var jsonPath = path.join(val, 'package.json');
    return fs.existsSync(jsonPath)
  })

  var rootJSON = getPackageJSON(moduleRoot);
  var specifiedDependencies = Object.keys(rootJSON.dependencies).concat(Object.keys(rootJSON.devDependencies));

  return _.uniq(specifiedDependencies).length === _.uniq(node_modules).length;
}

function indexOfCollection (arr, obj, name) {
  for (var i = 0,len = arr.length; i < len; i ++) {
    if (name) {
      if (_.isEqual(arr[i][name], obj[name])) {
        return i;
      }
    }
    else {
      if (_.isEqual(arr[i], obj)) {
        return i;
      }
    }
  }

  return -1;
}

function getComponentsInfo (fis, opts) {
  var rootDir = moduleRoot;

  var rootJson = getPackageJSON(rootDir);

  componentsInfo = {
    version: rootJson.version
  }

  function _find (root, dependencies, info) {
    var modules = dependencies.map(function (name) {
      return path.join(root, 'node_modules', name);
    });

    modules.forEach(function (val, index) {
      if (!checkPackageJSON(val)) {
        return;
      }

      var json = getPackageJSON(val);
      var version = json.version;
      var name = json.name;

      if (!info.dependencies) {
        info.dependencies = {};
      }

      // 如果moduleVersion中一个模块是空的, 那说明还没有这个模块,
      // 数组个数为一, 说明在root下面
      // 数组个数大于一, 说明还有一些其他版本分布在其他模块内部
      if (!moduleVersion[name]) {
        moduleVersion[name] = [];
      }

      if (!moduleMaps[name]) {
        moduleMaps[name] = [];
      }

      var versionObj = {
        version: version,
        name: name,
        modulePath: val
      }

      // 重复版本的模块直接忽略
      if (indexOfCollection(moduleVersion[name], versionObj, 'version') < 0) {
        info.dependencies[name] = {
          version: version,
          location: val,
          _dependencies: json.dependencies
        }
        moduleVersion[name].push(versionObj);
        moduleMaps[name].push(createPath(val));
      }

      // 查找模块内部依赖
      if (json.dependencies && Object.keys(json.dependencies).length > 0 && info.dependencies[name]) {
        var rawSubDependencies = Object.keys(json.dependencies);

        // 根据是否存在于moduleVerions来判断是否已经找到相关模块
        var rootDependencies = rawSubDependencies.filter(function (sname) {
          return !moduleVersion[sname] && !checkPackageJSON(path.join(moduleRoot, 'node_modules', sname));
        })

        var subDependencies = _.difference(rawSubDependencies, rootDependencies);

        if (npmVersion === '2') {
          _find(val, rootDependencies, componentsInfo);
        }
        else {
          _find(root, rootDependencies, componentsInfo);
        }

        _find(val, subDependencies, info.dependencies[name])
      }

    })
  }

  _find(rootDir, Object.keys(rootJson.dependencies), componentsInfo);

  return componentsInfo;
}

function getEntrance (json, rest) {
  var main = json.main;

  if (json.browser) {
    var browser = json.browser;

    if (typeof browser === 'string') {
      return browser
    }

    if (_.isObject(browser)) {

      for (var key in browser) {
        if (browser.hasOwnProperty(key)) {
          if (key === main) {
            main = browser[key];
            continue;
          }

          var obj = {};

          obj[key] = browser[key];

          if (!browser[key] && indexOfCollection(disabled, obj) < 0) {
            disabled.push(obj);
          }
          else if (indexOfCollection(replaced, obj) < 0){
            replaced.push(obj);
          }
        }
      }
    }
  }

  return main;
}

function getPackageJSON(basedir) {
  var jsonPath = path.join(basedir, 'package.json');
  return JSON.parse(fs.readFileSync(jsonPath));
}

function getProjectRelativePath (dirname) {
  return '/' + path.relative(moduleRoot, dirname);
}

function onReleaseStart(fis, opts) {
  // 读取组件信息, 这是项目路径
  npmVersion = checkNpmVersion(fis, opts) ? '2' : '3';

  console.log('detect your installed node_modules type: ', 'npm v' + npmVersion + '.x');

  disabled = [];
  replaced = [];
  moduleVersion = {};
  moduleMaps = {};

  componentsInfo = getComponentsInfo(fis, opts);

  var packages = {};

  function findResource(root, parent) {
    if (!root.packages) {
      root.packages = [];
    }

    var dependencies = {};

    for (var subdep in parent.dependencies) {
      if (parent.dependencies.hasOwnProperty(subdep)) {
        dependencies[subdep] = parent.dependencies[subdep];
      }
    }

    for (var rootdep in parent._dependencies) {
      if (parent._dependencies.hasOwnProperty(rootdep)) {
        if (!dependencies[rootdep]) {
          dependencies[rootdep] = componentsInfo.dependencies[rootdep];
        }
      }
    }

    for (var name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        var moduleAbsolutePath = dependencies[name].location;
        var modulePath = path.relative(moduleRoot, moduleAbsolutePath);
        resolve(name, {basedir: moduleAbsolutePath}, function (err, moduleIndexPath) {
          if (err) {
            return false;
          }

          var mainFile = moduleIndexPath.split('/').pop();
          var packagesIndex = root.packages.length;

          root.packages.push({
            name: name,
            main: mainFile,
            location: modulePath
          });

          if (dependencies[name]._dependencies) {
            findResource(root.packages[packagesIndex], dependencies[name]);
          }
        });
      }
    }
  }

  findResource(packages, componentsInfo, fis.project.getProjectPath());

  fis.emit('node_modules:info', packages);
}

function followPath(path) {
  var paths = path.split('/')
  var target = null

  paths.shift();

  function find(root, next) {
    var module = next.shift();
    var name = module.split('@')[0];
    var version = module.split('@')[1];
    var findOne;

    if (root.dependencies && root.dependencies[name]) {
      findOne = root.dependencies[name]
    }
    else {
      findOne = componentsInfo.dependencies[name];
    }

    if (next.length == 0) {
      if (findOne) {
        target = findOne
      }

      return;
    }

    find(findOne, next)
  }

  find(componentsInfo, paths)

  return target
}

function createPath (dirname) {
  var relaPath = path.join('/', path.relative(moduleRoot, dirname));

  var modulePath = relaPath.split('/node_modules/');
  var root = 'root@' + componentsInfo.version;

  modulePath.shift();

  var pathMaps = modulePath.map(function (val, index) {
    var mPath = modulePath.slice(0, index + 1);
    var target = '';

    function find (root, next) {
      var moduleName = next.shift();
      var module;

      if (root.dependencies && root.dependencies[moduleName]) {
        module = root.dependencies[moduleName];
      }
      else {
        module = componentsInfo.dependencies[moduleName];
      }

      var moduleVersion = module.version;

      target = moduleName + '@' + moduleVersion;

      if (next.length > 0) {
        find(module, next);
      }
    }

    find(componentsInfo, mPath)

    return target;
  }).join('/');

  if (pathMaps.length === 0) {
    return root;
  }
  else {
    return root + '/' + pathMaps
  }
}

function _findResource(name, path) {
  var extList = ['.js', '.jsx', '.coffee', '.css', '.sass', '.scss', '.less', '.html', '.tpl', '.vm', '.js', '.jsx', '.es', '.ts', '.tsx'];
  var info = fis.uri(name, path);

  for (var i = 0, len = extList.length; i < len && !info.file; i++) {
    info = fis.uri(name + extList[i], path);
  }

  return info;
}

function checkPackageJSON (dirname) {
  return fs.existsSync(path.join(dirname, 'package.json'));
}

function onFileLookUp(info, file) {
  // 如果已经找到了，没必要再找了。
  if (info.file || file && file.useShortPath === false) {
    return;
  }

  var rest = info.rest;

  replaced.forEach(function (val) {
    if (val[info.rest]) {
      rest = val[info.rest];
    }
  });

  var m = /^([0-9a-zA-Z\.\-_]+)(?:\/(.+))?$/.exec(rest);
  if (m) {
    var cName = m[1];
    var subpath = m[2];
    var resolved;
    var filePath;

    // 动态加载不支持
    if (cName === '.') {
      return;
    }

    if (moduleVersion[cName]) {
      var dirname = file.dirname;
      var relaDir = dirname.split('/');
      var moduleDir = null;

      do {
        var isModule = checkPackageJSON(relaDir.join('/'));
        if (isModule) {
          moduleDir = relaDir.join('/');
        }
        else {
          relaDir.pop();
        }
      }
      while (relaDir.length > 0 && !moduleDir);

      var rleaModulePath = createPath(moduleDir);
      var targetPath = null;

      var maps = moduleMaps[cName].map(function (val) {
        return val.replace(rleaModulePath, '');
      }).sort(function (pre, next) {
        return pre.length > next.length;
      })

      if (maps.length > 0) {
        targetPath = rleaModulePath + maps.shift();
      }
      else {
        targetPath = moduleMaps[cName][0];
      }

      var moduleInfo = followPath(targetPath);
      var modulePath = moduleInfo.location;

      if (!subpath) {
        var json = getPackageJSON(modulePath)

        var entrance = getEntrance(json, rest);
        if (!entrance) {
          disabled.push(rest);
        }

        filePath = path.join(modulePath, entrance || 'index')
      }
      else {
        filePath = path.join(modulePath, subpath)
      }
    }

    if (!filePath) {
      var errmsg = cName + (subpath ? '/' + subpath : '');

      throw new Error('\n missing file: ' + errmsg + '\n');
    }

    resolved = _findResource(getProjectRelativePath(filePath))

    // 根据规则找到了。
    if (resolved.file) {
      info.id = resolved.file.getId();
      info.file = resolved.file;
    }
  }
}

function onPreprocess (file) {
  var content = file.getContent().toString();
  var pushContent = [];
  var rest = file.rest;
  var basedir = moduleRoot;

  if (!file.isJsLike) {
    return;
  }

  Object.keys(vars).forEach(function (name) {
    if (RegExp('\\b' + name + '\\b').test(content) && !(file.fullname.indexOf(name.toLowerCase()) >= 0)) {
      pushContent.push(vars[name](rest, basedir))
    }
  })

  Object.keys(replaceVars).forEach(function (name) {
    content = content.replace(name, replaceVars[name](rest, basedir));
  })

  disabled.forEach(function (name) {
    content = content.replace(new RegExp("require\\(\\s?['\"]" + name.replace('.', '\\.') + "['\"]\\s?\\)", "g"), '{}');
  })

  content = pushContent.join('\n') + '\n' + content;

  file.setContent(content);
}

module.exports = function (fis, opts) {
  fis.on('release:start', onReleaseStart.bind(null, fis, opts));
  fis.on('lookup:file', onFileLookUp);
  fis.on('proccess:start', onPreprocess);

  fis.set('component.type', 'node_modules');
};
