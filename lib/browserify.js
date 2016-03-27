var rRequireNull = /\brequire\s*\(\s*('|")this_should_be_null\1\s*\)/ig;
var rComment = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))/;

var vars = {
    process          : function () {
        return 'var process = require(\'process/browser\');';
    },
    global           : function () {
        return 'var global = typeof global !== "undefined" ? global : '
            + 'typeof self !== "undefined" ? self : '
            + 'typeof window !== "undefined" ? window : {};'
            ;
    },
    Buffer           : function () {
        return 'var Buffer = require("buffer").Buffer;';
    },
    'Buffer.isBuffer': function () {
        return 'Buffer.isBuffer = require("is-buffer");';
    }
};

var replaceVars = {
    __filename: function (file, basedir) {
        var filename = file.subpath;
        return JSON.stringify(filename);
    },
    __dirname : function (file, basedir) {
        var dir = file.subdirname;
        return JSON.stringify(dir);
    },
    'process.env.NODE_ENV': function() {
        return '\'' + (fis.project.currentMedia() === 'dev' ? 'development': 'production') + '\'';
    }
}

module.exports = function(content, file) {
    content = content.replace(rRequireNull, 'null');
    var pushContent = [];

    Object.keys(replaceVars).forEach(function (name) {
        content = content.replace(name, replaceVars[name](file));
    });

    Object.keys(vars).forEach(function (name) {
        var reg = new RegExp(rComment.source + '|\\b(' + name + ')\\b', 'g');
        var attched = false;

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