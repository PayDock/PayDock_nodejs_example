var qs = require('querystring');
var config = require('./config.json');
var request = require('request');

function acceptPost (req, res) {
	var incomingBody = '';
	req.on('data', function(data) {
		incomingBody += data;							//the incoming message is processed for raw data
	});
	req.on('end', function(){
		var parsedBody = JSON.parse(incomingBody);		//the data is then parsed into ready information

		switch (parsedBody.payment_type){
			case "vault":
				var outgoingBody = {							//the relevant information is grabbed from the message
					"amount": parsedBody.amount,
					"currency": parsedBody.currency,
					"customer_id": parsedBody.customer_id,
					"payment_source_id": parsedBody.token
				}
				console.log('payment type is vault');			
				sendCharge(outgoingBody);
				break;
			case "token":
				var outgoingBody = {							//the relevant information is grabbed from the message
					"amount": parsedBody.amount,
					"currency": parsedBody.currency,
					"token": parsedBody.token
				}
				console.log('payment type is token');			
				sendCharge(outgoingBody);
				break;
			default:
				console.log("error in payment type");
				break;
		}

		res.write('data received \n');
		res.end();
	});
}

function acceptVault(req, res) {
	var incomingBody = '';
		req.on('data', function(data) {
			incomingBody += data;							//the incoming message is processed for raw data
			//console.log("data found");
		});
		req.on('end', function(){
			var parsedBody = JSON.parse(incomingBody);

			var SecKey = config.SecKey;	
			var target = "https://api-sandbox.paydock.com/v1/customers?id=" + parsedBody.customer_id;

			var vaultsource = [{_id : "", schemeType : ""}];

			request(
				{                                  			//a new message is initialised                
					url: target,
					method: 'GET',
					headers: {
				      	'x-user-secret-key': SecKey
				  	}
				},
				function(error, response, body){      					//once the message is sent, the response is displayed
					if(error) {
						console.log(error);
					} else {
						var parsedResponse = JSON.parse(body);
						for (var counter in parsedResponse.resource.data[0].payment_sources) {
							vaultsource[counter]._id.push (parsedResponse.resource.data[0].payment_sources[counter]._id);
							try {
								vaultsource[counter].schemeType.push (parsedResponse.resource.data[0].payment_sources[counter].card_scheme);
							} catch(err) {
								try {
									vaultsource[counter].schemeType.push (parsedResponse.resource.data[0].payment_sources[counter].type);
								}
								catch(err) {
									console.log("too many errors");
									throw (err);
								}
							}
							console.log(vaultsource[counter]._id);
							console.log(vaultsource[counter].schemeType);
							res.write(vaultsource[counter]);
						};
						res.end();
					}
				}
			);
		});
}

function sendCharge(outgoingBody){    	  				//the destination and content for a new message is given to this module
	var SecKey = config.SecKey;	
	var target = config.target;							//the destination and authentication for a new message are loaded from the configuration file
	request({                                  			//a new message is initialised                
		url: target,
		method: 'POST',
		body: JSON.stringify(outgoingBody),
		headers: {
	      	'x-user-secret-key': SecKey
	  	}
	}, function(error, response, body){      					//once the message is sent, the response is displayed
		if(error) {
			console.log(error);
		} else {
			console.log(response.statusCode);
		}
	});
}

exports.acceptPost = acceptPost;
exports.acceptVault = acceptVault;