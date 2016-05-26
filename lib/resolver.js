var fs = require('fs');
var path = require('path');

// node 6 的一个 bug, 由于 fis3-hook-node_modules 这个包的名字有 node_modules，导致
// 模块查找机制错误。
try {
    var semver = require('semver');
} catch (e) {
    var semver = require('../node_modules/semver');
}

var cachePkgs = {};
var cachePkg = {};
var cachePkgsByVersions = {};
var ROOT, opts;

// 根据 merge 的级别来生成缓存 key.
function makeVersion(raw) {
    if (!opts.mergeLevel) {
        return raw;
    }

    if (!semver.valid(raw)) {
        throw new Error('The version is not valid. `' + raw + '`');
    }

    switch(opts.mergeLevel) {
        case 1:
            return semver.major(raw) + '.' + semver.minor(raw) + '.x';

        case 2:
            return semver.major(raw) + '.x';

        case 3:
            return '*';
    }
}

function collectPkgs(npmDir) {
    var pending = [npmDir];
    var currentDir, list;

    while (pending.length) {
        currentDir = pending.shift();

        if (cachePkgs[currentDir]) {
            continue;
        }

        var hostJsonPath = path.join(currentDir, '../package.json');
        var hostJson = {};
        if (fis.util.exists(hostJsonPath)) {
            hostJson = fis.util.readJSON(hostJsonPath);
        }

        list = cachePkgs[currentDir] = {};
        fs.readdirSync(currentDir).forEach(function(folderName) {
            if (
                folderName[0] === '.' ||
                opts.ignoreDevDependencies && hostJson.devDependencies && hostJson.devDependencies[folderName] && !hostJson.dependencies[folderName]
            ) {
                return null;
            }

            if (folderName[0] === '@') {
                fs.readdirSync(path.join(currentDir, folderName)).forEach(function(subfolder) {
                    var pkgname = folderName + '/' + subfolder;

                    if (
                        subfolder[0] === '.' ||
                        opts.ignoreDevDependencies && hostJson.devDependencies && hostJson.devDependencies[pkgname] && !hostJson.dependencies[pkgname]
                    ) {
                        return null;
                    }

                    var jsonPath = path.join(currentDir, folderName, subfolder, 'package.json');
                    if (!fis.util.exists(jsonPath)) {
                        return null;
                    }

                    var json = fis.util.readJSON(jsonPath);
                    var dirname = path.join(currentDir, folderName, subfolder);
                    var info = cachePkg[dirname] = list[pkgname] = {
                        name: json.name,
                        json: json,
                        dirname: dirname,
                        version: json.version
                    };

                    var host = cachePkgsByVersions[pkgname] || (cachePkgsByVersions[pkgname] = {});
                    var key = makeVersion(json.version);
                    if (
                        host[key] && semver.gt(info.version, host[key].version) ||
                        !host[key]
                    ) {
                        host[key] = info;
                    }

                    // 只有 npm 包去重才会去遍历所有子 node_moudules
                    // 一般 node >= 5 是不需要这个功能的。
                    // 可以通过 options.mergeLevel 去配置这个行为。
                    var subdir = path.join(dirname, 'node_modules');
                    if (opts.mergeLevel && fis.util.isDir(subdir)) {
                        pending.push(subdir);
                    }
                });
            }

            var jsonPath = path.join(currentDir, folderName, 'package.json');
            if (!fis.util.exists(jsonPath)) {
                return null;
            }

            var json = fis.util.readJSON(jsonPath);
            var dirname = path.join(currentDir, folderName);
            var info = cachePkg[dirname] = list[folderName] = {
                name: folderName,
                json: json,
                dirname: dirname,
                version: json.version
            };

            var host = cachePkgsByVersions[folderName] || (cachePkgsByVersions[folderName] = {});
            var key = makeVersion(json.version);
            if (
                host[key] && semver.gt(info.version, host[key].version) ||
                !host[key]
            ) {
                host[key] = info;
            }

            // 只有 npm 包去重才会去遍历所有子 node_moudules
            // 一般 node >= 5 是不需要这个功能的。
            // 可以通过 options.mergeLevel 去配置这个行为。
            var subdir = path.join(dirname, 'node_modules');
            if (opts.mergeLevel && fis.util.isDir(subdir)) {
                pending.push(subdir);
            }
        });
    }
}

function resolvePkg(pkgName, version, basedir, root) {
    var dir = basedir;
    var resolved = null;
    root = root || ROOT;

    while (dir.indexOf(root) === 0) {
        var npmDir = path.join(dir, 'node_modules');

        if (!cachePkgs[npmDir] && fis.util.isDir(npmDir)) {
            collectPkgs(npmDir);
        }

        if (cachePkgs[npmDir] && cachePkgs[npmDir][pkgName]) {
            resolved = cachePkgs[npmDir][pkgName];
            break;
        }

        dir = path.dirname(dir);
    }

    // 如果开启了 merge npm 包功能。
    if (opts.mergeLevel && cachePkgsByVersions[pkgName]) {
        // 根据版本号倒序对比。
        var versions = Object.keys(cachePkgsByVersions[pkgName]).sort().reverse();

        versions.every(function(key) {
            var info = cachePkgsByVersions[pkgName][key];

            if (version === '*' || semver.satisfies(info.version, version)) {
                resolved = info;
                return false;
            }

            return true;
        });
    }

    return resolved;
}

function resolveSelf(basedir, root) {
    var dir = basedir;
    var resolved = null;
    root = root || ROOT;

    while (dir.indexOf(root) === 0) {

        var pkg = cachePkg[dir];
        var jsonPath = path.join(dir, 'package.json');

        if (!pkg && fis.util.exists(jsonPath)) {
            var json = fis.util.readJSON(jsonPath);
            var folderName = path.basename(dir);
            pkg = cachePkg[dir] = {
                name: folderName,
                json: json,
                dirname: dir
            };
        }

        if (pkg) {
            resolved = pkg;
            break;
        }

        dir = path.dirname(dir);
    }

    return resolved;
};

function init(options) {
    opts = options;
    ROOT = fis.project.getProjectPath();
}

function clearCache() {
    cachePkgs = {};
    cachePkg = {};
    cachePkgsByVersions = {};
}

exports.resolvePkg = resolvePkg;
exports.resolveSelf = resolveSelf;
exports.init = init;
exports.clearCache = clearCache;
