var qs = require('querystring');
var config = require('./config.json');
var request = require('request');
// TODO: customer id not sent tru its serverside only
// TODO: choose which process to follow based on which fields are sent through
// TODO: move sendcharge function call outside the switch

function acceptPost (req, res) {
	var incomingBody = '';
	req.on('data', function(data) {
		incomingBody += data;							//the incoming message is processed for raw data
	});
	req.on('end', function(){
		res.write('data received \n');
		var parsedBody = JSON.parse(incomingBody);		//the data is then parsed into ready information
		console.log(parsedBody);

		var outgoingBody = {};

		if (parsedBody.vault_id != null && parsedBody.vault_id != '') {
			var outgoingBody = {							//the relevant information is grabbed from the message
				"amount": parsedBody.amount,
				"currency": parsedBody.currency,
				"customer_id": config.customer_id,
				"payment_source_id": parsedBody.token
			}
		} else if (parsedBody.token != null && parsedBody.token != ''){
			var outgoingBody = {							//the relevant information is grabbed from the message
					"amount": parsedBody.amount,
					"currency": parsedBody.currency,
					"token": parsedBody.token
				}
		} else {
			console.log("payment type could not be identified");
			res.write('payment type could not be identified \n');
			res.end();
			return;
		}

		sendCharge(outgoingBody);

		res.write('payment has been processed \n');
		res.end();
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