var request = require('request');
var config = require('./config.json');
var Validator = require('jsonschema').Validator;

function acceptPost (req, res) {
	var incomingBody = '';

	req.on('data', function(data) {
		incomingBody += data;									//the incoming message is processed for raw data
	});

req.on('end', function(){
		debugToConsole("new message from: " + req.headers.origin, 1);
		if ( checkJSON(incomingBody) ) {
			debugToConsole(parsedBody, 1);
			var parsedBody = JSON.parse(incomingBody);				//the data is then parsed into ready information
			var outgoingbody = {};

			if ( checkPayload(parsedBody, 'vault_id') ) {
				outgoingbody["vault_id"] = parsedBody.vault_id;
				outgoingbody["customer_id"] = config.customer_id;
			} else if ( checkPayload(parsedBody, 'token') ) {
				outgoingbody["token"] = parsedBody.token;
			} else {
				debugToConsole("failed payload");
				writeResponse(400, res);
				return '';
			}

			outgoingbody["amount"] = parsedBody.amount;
			outgoingbody["currency"] = parsedBody.currency;
			
			sendCharge(outgoingbody, writeResponse, res);
		} else {
			debugToConsole("invalid JSON");
			writeResponse(400, res);
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

function checkPayload (payload, target){
	var v = new Validator();
    var vault_id_length = 0;
    var token_length = 0;
    
    if (target == "token"){
        token_length = 36;
    } else if (target == 'vault_id'){
        vault_id_length = 24;
    } else {
        return false;
    }
    
    var schema = {
        "title": "Person",
        "type": "object",
        "properties": {
            "amount": {
                "type": ["string", "number"]
            },
            "currency": {
                "type": "string",
                "pattern": "^[a-zA-Z]{3}$"
            },
            "token": {
                "type": "string",
                "pattern": "^[0-9a-fA-F]{"+token_length+"}$"
            },
            "vault_id": {
                "type": "string",
                "pattern": "^[0-9a-fA-F]{"+vault_id_length+"}$"
            }
        },
        "required": ["amount", "currency", "token", "vault_id"]
    }
    if (v.validate(payload, schema).errors.length > 0) {
        return false;
    }

    if ( !(parseInt(payload.amount) > 0) ) {
    	return false;
    }
    return true;
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