var request = require('request');

function example(target, body, SecretKey){      //the destination and content for a new message is given to this module
  request({                                  //a new message is initialised                
      url: target,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
          'x-user-secret-key': SecretKey
      }
  }, function(error, response, body){       //once the message is sent, the response is displayed
      if(error) {
          console.log(error);
      } else {
          console.log(response.statusCode, body);
      }
  });
}

exports.example = example;