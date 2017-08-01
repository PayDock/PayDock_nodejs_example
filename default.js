var http = require('http');
var fs = require('fs');

var server = require('./server');
var paymentService = require('./paymentService');
var config = require('./config.json');

var serverport = config.serverport; 				//loads the serverport variable from the configuration file

http.createServer(function (req, res) {
/* 	if (req.method == "GET") {
		server.createPage(req, res);			//The Node server will create a webpage using the server module
		if (req.url == '/widget.js') {
			server.createWidget(res); 			//The Node server will receive a message using the receiver module
		} else {
			server.createPage(req, res);
		}
	} else if (req.method == "POST") {
		if (req.url == '/payment') {
			paymentService.acceptPost(req, res); 			//The Node server will receive a message using the receiver module
		} else if (req.url == '/vault') {
			paymentService.acceptVault(req, res);
		} else {
			console.log("post destination not found");
		}
	} */
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
	console.log("server running on port " + serverport);	//the server is opened, ready for use
});
