var path = require('path');
var lookup = require('fis3-hook-commonjs/lookup.js');
var resolver = require('./lib/resolver.js');
var browserify = require('./lib/browserify.js');
var root;

function tryNpmLookUp(info, file, opts) {
    var id = info.rest;

    if (/^([^\/]+)(?:\/(.*))?$/.test(id)) {
        var prefix = RegExp.$1;
        var subpath = RegExp.$2;
        var pkg = resolver.resolvePkg(prefix, file.dirname, root);
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
    if (info.rest[0] !== '.') {
        return;
    }

    var pkg = resolver.resolveSelf(file.dirname, root);
    if (pkg && pkg.json.browser && typeof pkg.json.browser === 'object') {
        var name = path.join(path.relative(pkg.dirname, file.dirname), info.rest);
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
            var result = lookup.findResource(newname, pkg.dirname, []);

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
    var pkg = resolver.resolveSelf(file.dirname, root);
    if (!pkg) {
        return;
    }

    file.setContent(browserify(file.getContent(), file));
}

var entry = module.exports = function (fis, opts) {
    root = fis.project.getProjectPath();

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

    fis.set('component.type', 'node_modules');
};


entry.defaultOptions = {

};
