/**
 * Startard service handler
 * Address -- http(s)://[host]/[service name]/[ver]/[api].[fmt](?cb=...&...)
 */
var url = require("url"),
    http = require("http"),
    formidable = require("formidable"),
    util = require("./util"),
    serviceCache = {};
    
// common
// pass it to ctx
var common = require("common");

//
// handle http request
//
exports.onHandle = function (ctx) {
    var regex = /\/([a-z0-9]+)\/([a-z0-9\.]+)\/([a-z0-9]+)\.([a-z0-9]+)/i;
    var infos = regex.exec(ctx.request.url);
    if (!infos || infos.length < 5) {
        module.onError(ctx, 404, 'Service Not Found');
    } else {
        module.processHandle(ctx, infos[1], infos[2], infos[3], infos[4]);
    }
};

//
// 
//
exports.serve = function (ctx, serviceFn, format, versionNumber) {
    //simply extend it
    //ctx as a namespace
    var serveCtx = common.jqueryUtils.extend(ctx, {
        // parsing url
        getParsedUrl:function () {
            if (!serveCtx.parsedUrl) {
                parsedUrl = url.parse(ctx.request.url, true);
                serveCtx.parsedUrl = parsedUrl || {};
            }

            return serveCtx.parsedUrl;
        },
        //
        //     Get querystring
        //
        getQueryString:function (name) {
            if (!serveCtx.requestQs) {
                requestQs = serveCtx.getParsedUrl().query;
                serveCtx.requestQs = requestQs || {};
            }
            return serveCtx.requestQs[name];
        },

        getQuery:function () {
            if (!serveCtx.requestQs) {
                requestQs = serveCtx.getParsedUrl().query;
                serveCtx.requestQs = requestQs || {};
            }

            return serveCtx.requestQs;
        },

        //
        //  This function will be called by serve implementation to provider serve
        //	ctx parameters. Such as: querystrings & post form
        //
        getRequestArgs:function (cb) {
            if (serveCtx.requestArgs) {
                return cb(0, serveCtx.requestArgs, serveCtx.Files);
            }

            if (!serveCtx.requestQs) {
                requestQs = serveCtx.getParsedUrl().query;
                serveCtx.requestQs = requestQs || {};
            }

            if (serveCtx.request.method === 'POST') {

                // Get post parameters. Only support form urlencode format here for now.

                // Set default submit mode.
                if (!serveCtx.request.headers['content-type']) {
                    serveCtx.request.headers['content-type'] = 'application/x-www-form-urlencoded';
                }

                var form = new formidable.IncomingForm();
                form.parse(serveCtx.request, function (err, fields, files) {
                    if (err) {
                        cb(err, 'Failed To Read Request Form');
                    }

                    for (var key in serveCtx.requestQs) {
                        fields[key] = fields[key] || serveCtx.requestQs[key];
                    }
                    cb(0, serveCtx.requestArgs = fields, serveCtx.requestFiles = files);
                });
            } else {
                cb(0, serveCtx.requestArgs = serveCtx.requestQs);
            }
        },

        //
        //	This function will be called by serve implement when finished(must).
        //
        responseData:function (err, data) {
            var retData = {
                err:err || 0,
                data:data
            };
            switch (format || 'json') {
                case 'json':
                    module.responseJsonData(serveCtx, retData);
                    break;

                case 'xml':
                    module.responseXmlData(serveCtx, retData);
                    break;
                    
                case 'html':
                	module.responseHtmlData(serveCtx, retData);
                	break;
            }
        },

        //common
        common:common,

        //authorizing
        //callee side
        authorize:function () {
            var ticket = serveCtx.getQueryString('_t');

            if (common.cryption.authTicket(ticket, serveCtx.service)) {
                return true;
            }

            serveCtx.response.writeHead(401, 'Unauthorized Request');
            serveCtx.response.end();

            return false;
        },
        //caller side
        authorizedGet:function (_url, cb) {
            //encrypt
            var rpass = common.cryption.getDefaultRpass('base64');

            var urlObj = url.parse(_url, true);

            //path name for service name
            var regex = /\/([a-z0-9]+)\/([a-z0-9\.]+)\/([a-z0-9]+)\.([a-z0-9]+)/i;
            var infos = regex.exec(urlObj.pathname);
            if (!infos || infos.length < 5) {
                cb(new Error('No Such Service'), null);

                return;
            }
            var serviceName = infos[1];

            //query string
            urlObj.query = urlObj.query || {};
            urlObj.query._t = common.cryption.getRequestTicket(serviceName);

            var req = http.request(url.format(urlObj), function (response) {
                var str = ''
                response.on('data',function (chunk) {
                    str += chunk;
                }).on('end',function () {
                        if (response.statusCode != 200) {
                            cb(new Error('Error Getting Response, HttpStatusCode:' + response.statusCode), null);
                        }
                        else {
                            var resp = JSON.parse(str);
                            cb(resp.err, resp.data);
                        }
                    }).on('error', function (e) {
                        console.log(e);
                        cb(e, null);
                    });
            });
            req.write('');
            req.end();
        }
    });

    serviceFn(serveCtx);
};

module.processHandle = function (ctx, serviceName, versionNumber, apiName, format) {
    var serviceFn = module.getService(serviceName, apiName);

    if (serviceFn) {
        //extend ctx
        ctx.service = serviceName;
        ctx.fn = apiName;
        ctx.version = versionNumber;
        ctx.format = format;

        exports.serve(ctx, serviceFn, format, versionNumber);
    } else {
        module.onError(ctx, 404, 'Service Not Found');
    }
};

//handle error request
module.onError = function (ctx, code, msg) {
    // Failed to handle the request.
    ctx.response.writeHead(code, msg);
    ctx.response.end();
};

module.responseJsonData = function (ctx, data) {
    //stringify
    var str = JSON.stringify(data);

    var callback = ctx.getQueryString('cb');
    var responseData = callback ? callback + '(' + str + ')' : str;
    var body = new Buffer(responseData, 'UTF-8');
    ctx.response.writeHead(200, {
        'Content-Length':body.length,
        'Content-Type':'text/html;charset=utf-8'
    });
    ctx.response.end(body);
};

module.responseXmlData = function (ctx, data) {
    var responseData = util.xmlstringify({ result:data });
    var body = new Buffer(responseData, 'UTF-8');
    ctx.response.writeHead(200, {
        'Content-Length':body.length,
        'Content-Type':'text/xml;charset=utf-8'
    });
    ctx.response.end(body);
};

module.responseHtmlData = function (ctx, data) {
    //stringify
    var str = JSON.stringify(data);

    var callback = ctx.getQueryString('cb');
    var responseData = callback ? callback + '(' + str + ')' : str;
    var responseData = '<script type="text/javascript">document.domain="pptv.com"; '+responseData+'</script>';
    var body = new Buffer(responseData, 'UTF-8');
    ctx.response.writeHead(200, {
        'Content-Length':body.length,
        'Content-Type':'text/html;charset=utf-8'
    });
    ctx.response.end(body);
};


// general interfaces here
var generalModuleExtentions = {
}

module.getService = function (serviceName, apiName) {

    // Search the service function in cache first.
    var key = (serviceName + '.' + apiName).toLowerCase();
    if (serviceCache[key]) {
        return serviceCache[key];
    }

    //
    // Load service module if failed to find service function in cache.
    //		Note: The service function name could be case sensitive but the url is case
    //	insensitive. So we must iterate service function and build the case insensitive cache.
    //
    var serviceModule = require(serviceName);

    if (serviceModule) {
        //something like $.extend();
        common.jqueryUtils.extend(serviceModule, generalModuleExtentions);
    }

    for (var fname in serviceModule) {
        var fn = serviceModule[fname];
        if (toString.call(fn) === '[object Function]' && fn.length === 1) {
            serviceCache[(serviceName + '.' + fname).toLowerCase()] = fn;
        }
    }

    if (serviceCache[key]) {
        return serviceCache[key];
    }
};

exports.setSettings = function (stgs) {
    settings = stgs;
    return module.exports;
};
