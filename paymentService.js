var request = require('request');
var config = require('./config.json');

function acceptPost (req, res) {
	var incomingBody = '';

	req.on('data', function(data) {
		incomingBody += data;									//the incoming message is processed for raw data
	});

	req.on('end', function(){
		var parsedBody = JSON.parse(incomingBody);				//the data is then parsed into ready information
		var outgoingBody = {};
		
		debugToConsole("");
		debugToConsole("new message from: " + req.headers.origin);
		debugToConsole(parsedBody);

		if (parsedBody.vault_id) {
			outgoingBody = {
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"customer_id": config.customer_id,				//this variable is defined from a config file for demo purposes
				"payment_source_id": parsedBody.vault_id
			}
		} else {
			outgoingBody = {									//the relevant information is grabbed from the message
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"token": parsedBody.token
			}
		}

		sendCharge(outgoingBody, writeResponse, res);
	});
}

function sendCharge(outgoingBody, callback, res){    	  						//the destination and content for a new message is given to this module
	var SecretKey = config.SecretKey;	
	var target = config.target;									//the destination and authentication for a new message are loaded from the configuration file
	request({                                  					//a new message is initialised                
		url: target,
		method: 'POST',
		body: JSON.stringify(outgoingBody),
		headers: {
	      	'x-user-secret-key': SecretKey
	  	}
	}, function(error, response, body){
		debugToConsole("");
		debugToConsole("Response from PayDock");
		if(error) {
			debugToConsole(error);
			callback(response.statusCode, res);
		} else  if (response.statusCode >= 400){
			debugToConsole("Error in request");
			debugToConsole(response.statusCode + ', ' + body);
			callback(response.statusCode, res, body);
		} else {
			var parsedBody = JSON.parse(body);
			debugToConsole(parsedBody.resource.data.transactions[0]);
			callback(response.statusCode, res);
		}
	});
}

function writeResponse (messageStatusCode, res) {
	res.writeHead(messageStatusCode);
	res.end();
}

function debugToConsole(message){
	if (config.debugSwitch) {
		console.log(message);
	}
}

exports.acceptPost = acceptPost;