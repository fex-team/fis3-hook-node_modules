var fs = require('fs');
var path = require('path');
var cachePkgs = {};
var cachePkg = {};

function resolvePkg(pkgName, basedir, root) {
    var dir = basedir;
    var resolved = null;

    while (dir.indexOf(root) === 0) {
        var npmDir = path.join(dir, 'node_modules');
        var pkgs = cachePkgs[npmDir];

        if (!pkgs && fis.util.isDir(npmDir)) {
            pkgs = cachePkgs[npmDir] = {};
            fs.readdirSync(npmDir).forEach(function(folderName) {
                if (folderName[0] === '.') {
                    return null;
                }

                var jsonPath = path.join(npmDir, folderName, 'package.json');
                if (!fis.util.exists(jsonPath)) {
                    return null;
                }

                var json = fis.util.readJSON(jsonPath);
                cachePkg[path.join(npmDir, folderName)] = pkgs[json.name] = {
                    name: json.name,
                    json: json,
                    dirname: path.join(npmDir, folderName)
                };
            });
        }

        if (pkgs && pkgs[pkgName]) {
            resolved = pkgs[pkgName];
            break;
        }

        dir = path.dirname(dir);
    }

    return resolved;
}

function resolveSelf(basedir, root) {
    var dir = basedir;
    var resolved = null;

    while (dir.indexOf(root) === 0) {

        var pkg = cachePkg[dir];
        var jsonPath = path.join(dir, 'package.json');

        if (!pkg && fis.util.exists(jsonPath)) {
            var json = fis.util.readJSON(jsonPath);
            pkg = cachePkg[dir] = {
                name: json.name,
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

exports.resolvePkg = resolvePkg;
exports.resolveSelf = resolveSelf;