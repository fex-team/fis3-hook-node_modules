var rComment = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))/;
var resolver = require('./resolver.js');
var opts = {};

var vars = {};

var replaceVars = {
    __filename: function (file, basedir) {
        var filename = file.subpath;
        return JSON.stringify(filename);
    },

    __dirname : function (file, basedir) {
        var dir = file.subdirname;
        return JSON.stringify(dir);
    },

    'typeof process ': function() {
        return '"undefined" ';
    },

    'typeof process.env ': function() {
        return '"undefined" ';
    }
}

module.exports = function(content, file) {
    var pushContent = [];

    Object.keys(replaceVars).forEach(function (name) {
        var reg = new RegExp(fis.util.escapeReg(name), 'g');
        content = content.replace(reg, typeof replaceVars[name] === 'function' ? replaceVars[name](file) : replaceVars[name]);
    });

    Object.keys(vars).forEach(function (name) {
        var reg = new RegExp(rComment.source + '|\\b(' + name + ')\\b', 'g');
        var attched = false;

        // 避免 buffer 模块内部自己 require 自己
        if (name === 'Buffer' || name === 'Buffer.isBuffer') {
            var pkg = resolver.resolveSelf(file.dirname);
            if (pkg.name === 'buffer' || pkg.name === 'is-buffer') {
                return;
            }
        } else if (name === 'process') {
            var pkg = resolver.resolveSelf(file.dirname);
            if (pkg.name === 'process') {
                return;
            }
        }

        // 过滤掉在注释中的情况.
        content.replace(reg, function(_, comment, matched) {
            if (matched && !attched) {
                pushContent.push(vars[name](file));
                attched = true;
            }
        });

        //if (reg.test(content) && !(file.fullname.indexOf(name.toLowerCase()) >= 0)) {
        //    pushContent.push(vars[name](file))
        //}
    });

    if (pushContent.length) {
        content = pushContent.join('\n') + '\n' + content;
    }

    return content;
}

module.exports.init = function(options) {
    opts = options || {};

    if (opts.shimProcess) {
        vars['process'] = function () {
            return 'var process = require(\'process/browser\');';
        };
    }

    if (opts.shimGlobal) {
        vars['global'] = function () {
            return 'var global = typeof global !== "undefined" ? global : '
                + 'typeof self !== "undefined" ? self : '
                + 'typeof window !== "undefined" ? window : {};'
                ;
        }
    }

    if (opts.shimBuffer) {

        vars['Buffer'] = function () {
            return 'var Buffer = require("buffer").Buffer;';
        };

        vars['Buffer.isBuffer'] =function () {
            return 'Buffer.isBuffer = require("is-buffer");';
        };
    }

    replaceVars['process.env.NODE_ENV'] = options.env || function(file) {
        return '\'' + (file.optimizer ? 'production' : 'development') + '\'';
    };
}
