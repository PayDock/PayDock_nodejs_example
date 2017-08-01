var qs = require('querystring');
var request = require('request');
var url = require('url');
var async = require('async');
var config = require('./config.json');

function acceptPost (req, res) {
	var incomingBody = '';

	req.on('data', function(data) {
		incomingBody += data;									//the incoming message is processed for raw data
	});

	req.on('end', function(){
		var parsedBody = JSON.parse(incomingBody);				//the data is then parsed into ready information
		var outgoingBody = {};

		debugIntoConsole("new message from: " + req.headers.origin);
		debugIntoConsole(parsedBody);

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

		sendCharge(outgoingBody);
	});

	function sendCharge(outgoingBody){    	  						//the destination and content for a new message is given to this module
		var SecretKey = config.SecretKey;	
		var target = config.target;									//the destination and authentication for a new message are loaded from the configuration file
		debugIntoConsole("sendCharge called");
		request({                                  					//a new message is initialised                
			url: target,
			method: 'POST',
			body: JSON.stringify(outgoingBody),
			headers: {
		      	'x-user-secret-key': SecretKey
		  	}
		}, function(error, response, body){      					//once the message is sent, the response is displayed
			if(error) {
				debugIntoConsole(error);
			} else {
				debugIntoConsole(response.statusCode, body);
				return endResponse(response.statusCode);
			}
		});
	}

	function endResponse (messageStatusCode) {
		debugIntoConsole(messageStatusCode);
		res.writeHead(messageStatusCode, {'Content-Type': 'application/json'});
		res.end();
	}
}



function debugIntoConsole(){
	if (config.debugSwitch) {
		for (var i = 0; i < arguments.length; i++) {
    		console.log(arguments[i]);
  		}
	}
}

exports.acceptPost = acceptPost;