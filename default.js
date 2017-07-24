var http = require('http');
var fs = require('fs');
var paymentService = require('./paymentService');
var config = require('./config.json');

var serverport = config.serverport; 						//loads the serverport variable from the configuration file
var filename = config.homepage;								//the default page is chosen from the configuration file

http.createServer(function (req, res) {
	switch (req.method) {
		case "GET":
			server(req, res);								//The Node server will create a webpage using the server function
		break;
		case "POST":
			paymentService.acceptPost(req, res); 			//The Node server will receive a message using the receiver module
		break;
	}
}).listen(serverport);
console.log("server running on port " + serverport);		//the server is opened, ready for use

function server(req, res){
	fs.readFile(filename, (err, data) => {
		if (err) {											//If the specified page isn't available, an error is created
			res.writeHead(404, {'Content-Type': 'text/html'});
			return res.end("404 Not Found");
		} 
		res.end(data);										//The page is given to the user
	});
}