var http = require('http');
var fs = require('fs');

var server = require('./server');
var paymentService = require('./paymentService');
var config = require('./config.json');

var serverport = config.serverport;

http.createServer(function (req, res) {
	switch (req.url) {
		case "/vault": paymentService.acceptVault(req, res); break;
		case "/payment": paymentService.acceptPost(req, res); break;
		case "/widget.js": server.createWidget(res); break;
		default: server.createPage(req, res); break;
	}
}).listen(serverport);


fs.readFile('./PDlogo.txt', (err, data) => {
	if (err) throw err;
	console.log(data.toString('utf8'));
	console.log("server running on port " + serverport);
});