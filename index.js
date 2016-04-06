var path = require('path');
var lookup = fis.require('hook-commonjs/lookup.js');
var resolver = require('./lib/resolver.js');
var browserify = require('./lib/browserify.js');

function tryNpmLookUp(info, file, opts) {
    var id = info.rest;

    if (/^([a-zA-Z0-9@][a-zA-Z0-9@\.\-_]*)(?:\/([a-zA-Z0-9@\/\.\-_]*))?$/.test(id)) {
        var prefix = RegExp.$1;
        var subpath = RegExp.$2;

        if (prefix[0] === '.') {
            return info;
        }

        var currentPkg = resolver.resolveSelf(file.dirname);
        var pkg = resolver.resolvePkg(prefix, currentPkg && currentPkg.json.dependencies && currentPkg.json.dependencies[prefix] ? currentPkg.json.dependencies[prefix] : '*', file.dirname);
        if (!pkg) {
            opts.shutup || fis.log.warn('Can\'t resolve `%s` in file [%s], did you miss `npm install %s`?', prefix, file.subpath, prefix);
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
                        name = key === false ? 'this_should_be_null' : redirectTo;
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
    var pkg = resolver.resolveSelf(file.dirname);
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
                newname = key === false ? 'this_should_be_null' : redirectTo;
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


function onPreprocess(file) {
    if (!file.isJsLike || !file.isMod || file.skipBrowserify) {
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
    fis.on('process:start', onPreprocess);
    fis.on('release:end', function() {
        resolver.clearCache();
    });

    fis.set('component.type', 'node_modules');
};


entry.defaultOptions = {
    // 0 只 merge 版本相同的，
    // 1 merge 第三位版本相同的 1.1.x
    // 2 merge 第二位版本相同的 1.x
    // 3 只要包同名就会被 merge
    mergeLevel: 1
};
