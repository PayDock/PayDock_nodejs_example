var qs = require('querystring');
var config = require('./config.json');
var request = require('request');

function acceptPost (req, res) {
	//console.log(req.url);
	if (req.url == '/payment') {
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
	} else {
		var incomingBody = '';
		req.on('data', function(data) {
			incomingBody += data;							//the incoming message is processed for raw data
			//console.log("data found");
		});
		req.on('end', function(){
			var parsedBody = JSON.parse(incomingBody);

			var SecKey = config.SecKey;	
			var target = "https://api-sandbox.paydock.com/v1/customers?id=" + parsedBody.customer_id;

			var carName = "Volvo";
			var vaultpaymentID = "first";

			request(
				{                                  			//a new message is initialised                
					url: target,
					method: 'GET',
					headers: {
				      	'x-user-secret-key': SecKey
				  	}
				},
				console.log('test write console'),
				function(error, response, body){      					//once the message is sent, the response is displayed
					if(error) {
						console.log(error);
					} else {
						var carName2 = "googoo car";
						var parsedResponse = JSON.parse(body);						
						for (var counter in parsedResponse.resource.data[0].payment_sources) {
							//console.log(parsedResponse.resource.data[0].payment_sources[counter]._id);
							vaultpaymentID = parsedResponse.resource.data[0].payment_sources[counter]._id;
							res.write(vaultpaymentID + "\n");
						};
						//console.log("mark vaultpaymentID");
						res.end();
					}
				}
			);
			//console.log(vaultpaymentID);

			//res.write('data received for vault\n');
			//res.end();
		});
	}
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