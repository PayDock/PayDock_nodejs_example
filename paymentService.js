var qs = require('querystring');
var request = require('request');
var url = require('url');
var config = require('./config.json');

function acceptPost (req, res) {
	var incomingBody = '';

	req.on('data', function(data) {
		incomingBody += data;
	});

	req.on('end', function(){

		var parsedBody = JSON.parse(incomingBody);
		var outgoingBody = {};

		debugToConsole("new message from: " + req.headers.origin);
		debugToConsole(parsedBody);

		if (parsedBody.vault_id) {
			outgoingBody = {
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"customer_id": parsedBody.customer_id,
				"payment_source_id": parsedBody.vault_id
			}
		} else {
			outgoingBody = {
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"token": parsedBody.token
			}
		}
		sendCharge(outgoingBody, endResponse, res);
	});
}

function sendCharge(outgoingBody, callback, res){
	var SecretKey = config.SecretKey;	
	var target = config.target;
	debugToConsole("sendCharge called");
	request({            
		url: target,
		method: 'POST',
		body: JSON.stringify(outgoingBody),
		headers: {
	      	'x-user-secret-key': SecretKey
	  	}
	}, function(error, response, body){
		if(error) {
			debugToConsole(error);
			callback(response.statusCode, res);
		} else {
			debugToConsole(response.statusCode + ', ' + body);
			callback(response.statusCode, res);
		}
	});
}

function endResponse (messageStatusCode, res, body) {
	res.writeHead(messageStatusCode, {'content-type':'text/html'});
	if (body) {
		res.write(JSON.stringify(body));
	}
	res.end();
}

function acceptVault(req, res) {
	var incomingBody = '';
	req.on('data', function(data) {
		incomingBody += data;
	});
	req.on('end', function(){
		var parsedBody = JSON.parse(incomingBody);

		var SecretKey = config.SecretKey;	
		var target = "https://api-sandbox.paydock.com/v1/customers?id=" + parsedBody.customer_id;

		request(
			{
				url: target,
				method: 'GET',
				headers: {
					'x-user-secret-key': SecretKey
				}
			},
			function(error, response, body){
				if(error) {
					debugToConsole(error);
					endResponse(response.statusCode, res);
				} else {
					returnVault(response, body, res);
				}
			}
		);
	});
}

function returnVault(response, body, res){
	var vaultsource = [];
	var parsedResponse = JSON.parse(body);
	for (var counter in parsedResponse.resource.data[0].payment_sources) {
		vaultsource.push ({
			_id : parsedResponse.resource.data[0].payment_sources[counter]._id,
			cardType : parsedResponse.resource.data[0].payment_sources[counter].card_scheme,
			isBank : parsedResponse.resource.data[0].payment_sources[counter].type
		});
	}
	endResponse(200, res, vaultsource);
}

function debugToConsole(message){
	if (config.debugSwitch) {
    	console.log(message);
	}
}

exports.acceptPost = acceptPost;
exports.acceptVault = acceptVault;