var path = require('path');
var lookup = fis.require('hook-commonjs/lookup.js');
var resolver = require('./lib/resolver.js');
var browserify = require('./lib/browserify.js');
var notified = {};
var rRequireNull = /\brequire\s*\(\s*('|")this_should_be_null\1\s*\)/ig;


function tryNpmLookUp(info, file, opts) {
    var id = info.rest;

    if (/^([a-zA-Z0-9@][a-zA-Z0-9@\.\-_]*)(?:\/([a-zA-Z0-9@\/\.\-_]*))?$/.test(id)) {
        var prefix = RegExp.$1;
        var subpath = RegExp.$2;

        if (prefix[0] === '@') {
            var idx = subpath.indexOf('/');
            if (~idx) {
                prefix += '/' + subpath.substring(0, idx);
                subpath = subpath.substring(idx + 1);
            } else {
                prefix += '/' + subpath;
                subpath = '';
            }
        }

        var currentPkg = file ? resolver.resolveSelf(file.dirname) : null;
        var pkg = resolver.resolvePkg(prefix, currentPkg && currentPkg.json.dependencies && currentPkg.json.dependencies[prefix] ? currentPkg.json.dependencies[prefix] : '*', file.dirname);
        if (!pkg) {
            return info;
        }

        var json = pkg.json;
        var name = subpath || json.main || 'index.js';

        if (json.browser) {
            if (typeof json.browser === 'string' && !subpath) {
                name = json.browser;
            } else if (typeof json.browser === 'object') {
                Object.keys(json.browser).every(function(key) {
                    var redirectTo = json.browser[key];

                    if (
                        name === key ||
                        path.join(name) === path.join(key) ||
                        path.join(name + '.js') === path.join(key) ||
                        path.join(name) === path.join(key + '.js')
                    ) {
                        name = redirectTo === false ? 'this_should_be_null' : redirectTo;
                        return false;
                    }

                    return true;
                });
            }
        }

        if (name === 'this_should_be_null') {
            info.id = 'this_should_be_null';
            info.skipLoopUp = true;
            return info;
        } else {
            return lookup.findResource(name, pkg.dirname, opts.extList);
        }
    }
}

// npm browser 为 object,
// 包内部的相对引用
function onFileLookUp(info, file) {
    var pkg = file ? resolver.resolveSelf(file.dirname) : null;
    if (pkg && pkg.json.browser && typeof pkg.json.browser === 'object') {
        var name = info.rest;
        name = name[0] === '.' ? path.join(path.relative(pkg.dirname, file.dirname), name) : name;
        var newname;
        var browser = pkg.json.browser;

        Object.keys(browser).every(function(key) {
            var redirectTo = browser[key];

            if (
                name === key ||
                path.join(name) === path.join(key) ||
                path.join(name + '.js') === path.join(key) ||
                path.join(name) === path.join(key + '.js')
            ) {
                newname = redirectTo === false ? 'this_should_be_null' : redirectTo;
                return false;
            }

            return true;
        });

        if (newname === 'this_should_be_null') {
            info.id = 'this_should_be_null';
            info.skipLoopUp = true;
            delete info.file;
            return info;
        } else if (newname) {
            delete info.file;
            var f = fis.file(path.join(pkg.dirname, 'package.json'));
            var result = fis.project.lookup(newname, f);
            // var result = lookup.findResource(newname, pkg.dirname, ['.js']);

            if (result.file) {
                info.file = result.file;
                info.id = result.file.getId();
            }
        }
    }
};

// 最后一个响应函数。
function onFileLookUp2(info, file, silent) {
    var id = info.rest;

    if (!silent && /^([a-zA-Z0-9@][a-zA-Z0-9@\.\-_]*)(?:\/([a-zA-Z0-9@\/\.\-_]*))?$/.test(id) && !info.file && !info.isFISID) {
        var prefix = RegExp.$1;
        if (prefix[0] === '@') {
            prefix = id.split('/').slice(0, 2).join('/');
        }

        var key = file.subpath + id;
        if (!notified[key]) {
            notified[key] = true;
            fis.log.warn('Can\'t resolve `%s` in file [%s], did you miss `npm install %s`?', id, file.subpath, prefix);
        }
    }
}

function onJsStandard(file) {
    if (!file.isText() || !file.isJsLike || !file.isMod || file.skipBrowserify) {
        return;
    }

    // 如果不是 npm 包,那就直接跳过.
    var pkg = resolver.resolveSelf(file.dirname);
    if (!pkg) {
        return;
    }

    file.setContent(browserify(file.getContent(), file));
}



var entry = module.exports = function (fis, opts) {
    resolver.init(opts);
    browserify.init(opts);

    lookup.lookupList = [
        lookup.tryFisIdLookUp,
        lookup.tryPathsLookUp,
        lookup.tryPackagesLookUp,
        tryNpmLookUp,
        lookup.tryFolderLookUp,
        lookup.tryNoExtLookUp,
        lookup.tryBaseUrlLookUp,
        lookup.tryRootLookUp
    ];

    fis.on('lookup:file', onFileLookUp);
    fis.on('compile:standard', onJsStandard);
    fis.on('compile:postprocessor', function(file) {
        if (!file.isText() || !file.isJsLike) {
            return;
        }

        file.setContent(file.getContent().replace(rRequireNull, '{}'));
    });
    fis.on('release:end', function() {
        resolver.clearCache();
    });

    // 在编译之前才注册事件，应该比所有的 hook 都注册得晚。
    opts.shutup || fis.on('release:start', function() {
        notified = {};
        fis.removeListener('lookup:file', onFileLookUp2);
        fis.on('lookup:file', onFileLookUp2);
    });

    fis.set('component.type', 'node_modules');
};


entry.defaultOptions = {
    // 0 只 merge 版本相同的，
    // 1 merge 第三位版本相同的 1.1.x
    // 2 merge 第二位版本相同的 1.x
    // 3 只要包同名就会被 merge
    mergeLevel: parseInt(process.versions.node) < 5 ? 1 : 0,
    ignoreDevDependencies: false,
    shimBuffer: true,
    shimProcess: true,
    shimGlobal: true,
    shutup: false
};
