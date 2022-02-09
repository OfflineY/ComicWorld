
console.log("\n   ___                _      __                     ");
console.log("  / __\\___  _ __ ___ (_) ___/ _\\ ___ _ ____   _____ ");
console.log(" / /  / _ \\| '_ ` _ \\| |/ __\\ \\ / _ \\ '__\\ \\ / / _ \\");
console.log("/ /__| (_) | | | | | | | (___\\ \\  __/ |   \\ V /  __/");
console.log("\\____/\\___/|_| |_| |_|_|\\___\\__/\\___|_|    \\_/ \\___|\n");

                        
console.log(" YUAN Web Comic @ NODE Project.\n Powered by Node.js.\n Author: YuanYuBo\n Build time: 2022-1-14 15:26:14\n Environment: production\n Version: 1.10.1\n Pro version: none\n\n======================================================\n               #  Carry Your World  #");
console.log("======================================================\n\n[INFO] 初始化...");

var express = require('express');
var fs = require("fs");

var app = express();

var HOST = "127.0.0.1"; // 如果不是在本机上使用，请改成实际的ip地址
                        // 后面的图片的URL会使用这个变量来构造
var PORT = 3000;

/**
 * 错误提示
 */
var ErrorHelper = {
    'internal_error': function () {
        return {
            'msg': 'something wrong with server',
            'code': 1
        };
    },
    'missing_param': function (param) {
        return {
            'msg': 'missing param: ' + param,
            'code': 2
        };
    },
    'error_param': function (param, data) {
        return {
            'msg': 'the param ' + param + '(' + data + ') is illegal',
            'code': 3
        }
    },
    'not_found': function (param) {
        return {
            'msg': 'cannot find ' + param,
            'code': 4
        };
    }
};

/**
 * 检查参数格式
 */
function checkParam(param) {
    return /^[^\.\\\/]+$/.test(param);
}


app.use('/', express.static('public'));

/**
 * 获取漫画列表
 */
app.get('/get_cartoon_list', function (req, res) {
    fs.readdir(__dirname + '/public/store', function (err , files) {
        if (err) {
            res.jsonp(ErrorHelper.internal_error());
        }
        res.jsonp({'cartoon': files, 'code': 0});
        console.log("[INFO] Get Comic List ==> success");
    });
});
/**
 * 获取章节信息
 */
app.get('/get_chapter_list', function (req, res) {

    var cartoon = req.query.cartoon;
    if (!cartoon) {
        res.jsonp(ErrorHelper.missing_param('cartoon'));
        return;
    }

    if (!checkParam(cartoon)) {
        res.jsonp(ErrorHelper.error_param('cartoon', cartoon));
        return;
    }
    var cartoon_dir = __dirname + '/public/store/' + cartoon;
    fs.exists(cartoon_dir + '/index', function (exists) {
        if (!exists) {
            res.jsonp(ErrorHelper.not_found(cartoon));
            return;
        }
        fs.readFile(cartoon_dir + '/index', function (err, data) {
            if (err) {
                res.jsonp(ErrorHelper.internal_error());
                return;
            }

            var chapter_list = data.toString().split('\n').filter(function (d) {
                return d.length > 0;
            });

            res.jsonp({'chapter': chapter_list, 'code': 0});
            console.log("[INFO] Get Comic Chapter ==> success");
        });
    });
});
/**
 * 获取图片
 */
app.get('/get_img_list', function (req, res) {

    var cartoon = req.query.cartoon;
    if (!cartoon) {
        res.jsonp(ErrorHelper.missing_param('cartoon'));
        return;
    }
    if (!checkParam(cartoon)) {
        res.jsonp(ErrorHelper.error_param('cartoon', cartoon));
        return;
    }
    var chapter = req.query.chapter;
    if (!chapter) {
        res.jsonp(ErrorHelper.missing_param('chapter'));
        return;
    }
    if (!checkParam(chapter)) {
        res.jsonp(ErrorHelper.error_param('chapter', chapter));
        return;
    }

    var cartoon_dir = __dirname + '/public/store/' + cartoon;
    fs.exists(cartoon_dir + '/index', function (exists) {
        if (!exists) {
            res.jsonp(ErrorHelper.not_found(cartoon));
            return;
        }
        fs.readdir(cartoon_dir + '/' + chapter, function (err, images) {
            if (err) {
                res.jsonp(ErrorHelper.error_param('chapter', chapter));
                return;
            }
            // 按名字排序
            images.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });

            var urls = images.map(function (image) {
                return '/store/' + cartoon + '/' + chapter + '/' + image;
            });
            res.jsonp({'img': urls, 'code': 0});
            console.log("[INFO] Get Comic Img List ==> success");
        });
    });
});

var server = app.listen(PORT, function () {

    console.info("[INFO] 开始运行！本地端口： http://%s:%s", HOST, PORT);
    console.info("[INFO] 提示：更改端口在 Main.js 内更改即可。\n");
});
