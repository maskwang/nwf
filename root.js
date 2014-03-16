/**
 * NodeJs Web Framework
 * @author: maskwang
 * @email: mask.wang.cn@gmail.com
 * application entry point
 */
var rootDirectory = require('path').dirname(module.filename);

require('httpserver.maskwang').runServer(rootDirectory);
