var qs = require('querystring');
var config = require('./config.json');
var SendPost = require('./sendpost');

function acceptPost (req, res) {
	var incomingBody = '';
	req.on('data', function(data) {
		incomingBody += data;							//the incoming message is processed for raw data
	});
	req.on('end', function(){

		var parsedBody = qs.parse(incomingBody);		//the data is then parsed into ready information

		var sendBody = {								//the relevant information is grabbed from the message
			"amount": parsedBody.amount,
			"currency": parsedBody.currency,
			"token": parsedBody.ps
		}

		var target = config.target;						//the destination and authentication for a new message are loaded from the configuration file
		var SecretKey = config.SecretKey;						
		SendPost.example(target, sendBody, SecretKey);		//the information is then sent off in another message

		res.write('data received \n');
		res.end();
	});
}

exports.acceptPost = acceptPost;