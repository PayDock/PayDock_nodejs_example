var http = require('http');
var fs = require('fs');

var server = require('./server');
var paymentService = require('./paymentService');
var config = require('./config.json');

var serverport = config.serverport; //loads the serverport variable from the configuration file

http.createServer(function (req, res) {
	switch (req.method) {
		case "GET":
			server.createPage(req, res);	//The Node server will create a webpage using the server module
		break;
		case "POST":
			paymentService.acceptPost(req, res); 	//The Node server will receive a message using the receiver module
		break;
	}
}).listen(serverport);


fs.readFile('./PDlogo.txt', (err, data) => {
	if (err) throw err;
	console.log(data.toString('utf8'));
	console.log("server running on port " + serverport);	//the server is opened, ready for use
});
