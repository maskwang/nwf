exports.onRequests = function (ctx) {
    ctx.response.writeHead(200, {
        'Content-Type' : 'text/html'
    });
    ctx.response.write('Hello World');
    ctx.response.end();
};