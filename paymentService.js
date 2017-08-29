var request = require('request');
var config = require('./config.json');

function acceptPost (req, res) {
	var incomingBody = '';

	req.on('data', function(data) {
		incomingBody += data;									//the incoming message is processed for raw data
	});

	req.on('end', function(){
		if ( checkJSON(incomingBody) ) {
			debugToConsole("new message from: " + req.headers.origin, 1);
			debugToConsole(parsedBody, 1);

			var parsedBody = JSON.parse(incomingBody);				//the data is then parsed into ready information
			var outgoingBody = {};
			
			Object.keys(parsedBody).forEach(function(item, index){
				if ( config.validFields.includes(item) != true ) {
					debugToConsole("request body has incorrect data, discarding request", 1);
					writeResponse(400,res);
					return '';
				}
			});
			
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
		} else {
			debugToConsole('body json format is invalid/broken, discarding request', 1);
			writeResponse(400,res);
			return '';
		}
	});
}

function checkJSON (Data){
    try {
        var parsedData = JSON.parse(Data);
        if (parsedData && typeof parsedData === "object") {
            return true;
        }
    }
    catch (e) {}
    return false;
};

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
		var parsedBody = JSON.parse(body);
		debugToConsole("Response from PayDock", 1);
		if(error) {
			debugToConsole(error);
		} else  if (response.statusCode >= 400){
			parsedBody = JSON.parse(body);
			debugToConsole("Error in request");
			debugToConsole(response.statusCode);
			debugToConsole(parsedBody.error);
		} else {
			debugToConsole(parsedBody.resource.data.transactions[0]);
		}
		debugToConsole('');
		callback(response.statusCode, res);
	});
}

function writeResponse (messageStatusCode, res) {
	res.writeHead(messageStatusCode);
	res.end();
}

function debugToConsole(message, lines){
	if (config.debugSwitch && (typeof message != 'undefined')) {
		console.log(message);
	}
	for (i = 0; i < lines; i++) { 
	    console.log('');
	}
}

exports.acceptPost = acceptPost;