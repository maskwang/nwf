/**
 * application entry point
 */
 var server = require('httpserver');
 
 server.setSettings({
    port : process.env.PORT,
    ip : process.env.IP,
    modules : [
        '../example/sayhello'
    ]
 });
 
 server.runServer();