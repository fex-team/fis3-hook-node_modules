var fs = require('fs');
var path = require('path');
var semver = require('semver');
var cachePkgs = {};
var cachePkg = {};
var cachePkgsByVersions = {};
var ROOT, opts;

// 根据 merge 的级别来生成缓存 key.
function makeVersion(raw) {
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

        default:
            return raw;
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

            var subdir = path.join(dirname, 'node_modules');
            if (fis.util.isDir(subdir)) {
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

    if (cachePkgsByVersions[pkgName]) {
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
