var qs = require('querystring');
var request = require('request');
var SendPost = require('./sendpost');
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
				"customer_id": parsedBody.customer_id,				//this variable is defined from a config file for demo purposes
				"payment_source_id": parsedBody.vault_id
			}
		} else {
			outgoingBody = {									//the relevant information is grabbed from the message
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"token": parsedBody.token
			}
		}
		//console.log(outgoingBody);
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

function acceptVault(req, res) {
	var incomingBody = '';
		req.on('data', function(data) {
			incomingBody += data;							//the incoming message is processed for raw data
			//console.log("data found");
		});
		req.on('end', function(){
			var parsedBody = JSON.parse(incomingBody);

			var SecretKey = config.SecretKey;	
			var target = "https://api-sandbox.paydock.com/v1/customers?id=" + parsedBody.customer_id;

			var vaultsource = [];
			//console.log(parsedBody.customer_id);

			request(
				{                                  			//a new message is initialised                
					url: target,
					method: 'GET',
					headers: {
				      	'x-user-secret-key': SecretKey
				  	}
				},
				function(error, response, body){      					//once the message is sent, the response is displayed
					if(error) {
						console.log(error);
					} else {
						//console.log(body);
						var parsedResponse = JSON.parse(body);
						//console.log(parsedResponse);
						for (var counter in parsedResponse.resource.data[0].payment_sources) {
							//vaultsource[counter]._id.push (parsedResponse.resource.data[0].payment_sources[counter]._id);
							try {
								vaultsource.push ({
									_id : parsedResponse.resource.data[0].payment_sources[counter]._id,
									cardType : parsedResponse.resource.data[0].payment_sources[counter].card_scheme,
									isBank : parsedResponse.resource.data[0].payment_sources[counter].type
								});
							} catch(err) {
								throw (err);
								console.log("too many errors");
							}
							// console.log(vaultsource[counter]);
							// console.log(vaultsource[counter].cardType);
							// console.log(vaultsource[counter].isBank);
							
						};
						//res.writeHead(200,{"Content-Type":"application/json"});
						res.write(JSON.stringify(vaultsource));
					}
					res.end();
				}
			);
		});
}

function sendCharge(outgoingBody){    	  						//the destination and content for a new message is given to this module
	var SecretKey = config.SecretKey;	
	var target = config.target;									//the destination and authentication for a new message are loaded from the configuration file
	request({                                  					//a new message is initialised                

		url: target,
		method: 'POST',
		body: JSON.stringify(outgoingBody),
		headers: {
	      	'x-user-secret-key': SecretKey
	  	}
	}, function(error, response, body){      					//once the message is sent, the response is displayed
		if(error) {
			console.log(error);
		} else {
			console.log(response.statusCode, body);
		}
	});

function debugIntoConsole(){
	if (config.debugSwitch) {
		for (var i = 0; i < arguments.length; i++) {
    		console.log(arguments[i]);
  		}
	}
}

exports.acceptPost = acceptPost;
exports.acceptVault = acceptVault;