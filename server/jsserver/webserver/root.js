/**
 * application entry point 
 */
 var rootDirectory = require('path').dirname(module.filename);
 
 require('httpserver').runServer(rootDirectory);
