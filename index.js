var path = require('path');
var execSync = require('child_process').execSync;
var resolve = require('resolve');
var moduleMap = {};
var moduleRoot;
var fs = require('fs');
var assign = require('object-assign');
var _ = require('lodash');
var componentsInfo = null;
//var componentsInfo = JSON.parse(execSync('npm list --json --production'));

function getComponentsInfo (fis, opts) {
  var rootDir = moduleRoot = path.join(fis.project.getProjectPath(), opts.baseUrl || '.');
  var rootJson = getPackageJSON(rootDir);

  var componentsInfo = {
    version: rootJson.version
  }

  function find (root, dependencies, info) {
    var modules = dependencies.map(function (name) {
      return path.join(root, 'node_modules', name);
    })

    // 尝试内部搜索
    modules.forEach(function (val, index) {
      if (!checkPackageJSON(val)) {
        return;
      }

      var json = getPackageJSON(val);
      var version = json.version;
      var name = json.name;

      if (!info.dependencies) {
        info.dependencies = {}
      }

      info.dependencies[name] = {
        version: version,
        location: val
      }

      if (json.dependencies && Object.keys(json.dependencies).length > 0) {
        // 查找依赖的姿势:
        // 1. 当前目录下node_modules查找
        // 2. 回到根目录node_modules查找
        var subDependencies = Object.keys(json.dependencies)
        var installedDepencies = subDependencies.filter(function (name) {
          var subModulePackage = path.join(val, 'node_modules', name, 'package.json');

          return fs.existsSync(subModulePackage);
        })
        var rootDependencies = _.difference(installedDepencies, subDependencies);

        find(root, rootDependencies, info.dependencies[name]);
        find(val, installedDepencies, info.dependencies[name]);
      }
    })

  }

  find(rootDir, Object.keys(rootJson.dependencies), componentsInfo);

  return componentsInfo;
}


function getPackageJSON(basedir) {
  var jsonPath = path.join(basedir, 'package.json');
  return JSON.parse(fs.readFileSync(jsonPath));
}

function findModuleDir(name, basedir) {
  return path.join(basedir, 'node_modules', name);
}

function onReleaseStart(fis, opts) {
  // 读取组件信息, 这是项目路径
  componentsInfo = getComponentsInfo(fis, opts);

  var packages = {};

  function findResource(root, parent, parentPath, pathMap) {
    if (!root.packages) {
      root.packages = [];
    }

    for (var name in parent.dependencies) {
      if (parent.dependencies.hasOwnProperty(name)) {
        var moduleAbsolutePath = findModuleDir(name, parentPath);
        var modulePath = path.relative(moduleRoot, moduleAbsolutePath);
        var mainFile = moduleAbsolutePath.split('/').pop();
        var packagesIndex = root.packages.length;

        var version = parent.dependencies[name].version;
        var indexStr = name + '@' + version;
        var mapStr = pathMap + '/' + indexStr;

        // 基于项目的绝对路径
        parent.dependencies[name].modulePath = path.join('/', modulePath);

        if (!moduleMap[name]) {
          moduleMap[name] = [];
        }

        if (moduleMap[name].indexOf(mapStr) < 0) {
          moduleMap[name].push(mapStr);
        }

        root.packages.push({
          name: name,
          main: mainFile,
          location: modulePath
        });

        if (parent.dependencies[name].dependencies) {
          findResource(root.packages[packagesIndex], parent.dependencies[name], path.join(parentPath, 'node_modules', name), mapStr);
        }
      }
    }
  }

  findResource(packages, componentsInfo, fis.project.getProjectPath(), "root@" + componentsInfo.version);

  fis.emit('node_modules:info', packages);
}

function followPath(path) {
  var paths = path.split('/')
  var target = null
  var root = paths.shift()

  function find(root, next) {
    var module = next.shift()
    var name = module.split('@')[0]

    var findOne = root[name]

    if (next.length == 0) {
      if (findOne) {
        target = findOne
      }

      return;
    }

    find(findOne.dependencies, next)
  }

  find(componentsInfo.dependencies, paths)

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
      var module = root[moduleName];
      var moduleVersion = module.version;

      target = moduleName + '@' + moduleVersion;

      if (next.length > 0) {
        find(root[moduleName].dependencies, next);
      }
    }

    find(componentsInfo.dependencies, mPath)

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

//function findNodeModules (info, file, opts) {
//  var packages = opts.packages;
//
//  var rest = info.rest;
//  var dirname = info.dirname;
//
//  if (/^[^\.\/]+$/.test(rest)) {
//
//  }
//}


function onFileLookUp(info, file) {
  // 如果已经找到了，没必要再找了。
  if (info.file || file && file.useShortPath === false) {
    return;
  }

  var m = /^([0-9a-zA-Z\.\-_]+)(?:\/(.+))?$/.exec(info.rest);
  if (m) {
    var cName = m[1];
    var subpath = m[2];
    var resolved;
    var filePath;

    if (moduleMap[cName]) {
      var relaDir = info.dirname.split('/');
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

      var maps = moduleMap[cName].filter(function (val) {
        return val.replace(rleaModulePath, '') !== val;
      })

      if (maps.length > 0) {
        targetPath = maps.shift();
      }
      else {
        targetPath = moduleMap[cName][0];
      }

      var moduleInfo = followPath(targetPath);
      var modulePath = moduleInfo.modulePath;

      if (!subpath) {
        var json = getPackageJSON(path.join(moduleRoot, modulePath));
        filePath = path.join(modulePath, json.main || 'index')
      }
      else {
        filePath = path.join(modulePath, subpath)
      }
    }

    resolved = _findResource(filePath)

    // 根据规则找到了。
    if (resolved.file) {
      info.id = resolved.file.getId();
      info.file = resolved.file;
    }
  }
}

module.exports = function (fis, opts) {
  fis.on('release:start', onReleaseStart.bind(null, fis, opts));
  fis.on('lookup:file', onFileLookUp);

  fis.set('component.type', 'node_modules');
};
