var framework = require('partial.js');
var http = require('http');

var port = parseInt(process.env.PORT || '8000');
var debug = true;

framework.run(http, debug, port);