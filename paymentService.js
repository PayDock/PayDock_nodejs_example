var qs = require('querystring');
var config = require('./config.json');
var request = require('request');

function acceptPost (req, res) {
	var incomingBody = '';
	req.on('data', function(data) {
		incomingBody += data;							//the incoming message is processed for raw data
	});
	req.on('end', function(){

		var parsedBody = qs.parse(incomingBody);		//the data is then parsed into ready information

		var outgoingBody = {							//the relevant information is grabbed from the message
			"amount": parsedBody.amount,
			"currency": parsedBody.currency,
			"token": parsedBody.ps
		}
					
		sendCharge(outgoingBody);						//the information is then sent off in another message

		res.write('data received \n');
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
	}, function(error, response){      					//once the message is sent, the response is displayed
		if(error) {
			console.log(error);
		} else {
			console.log(response.statusCode);
		}
	});
}

exports.acceptPost = acceptPost;