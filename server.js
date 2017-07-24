var url = require("url");
var fs = require('fs');
var config = require('./config.json');
var createWidget = require('./createWidget.js');

function createPage(req, res){
	var q = url.parse(req.url, true);
	var filename = q.pathname;
	var regextest = "";
	
	if (filename.match(/\/widget\d\.js/g)) {		//This IF statement is used to avoid type errors, not execute
		regextest = filename.match(/\/widget\d\.js/g)[0];
	}
	
	switch (filename) {
		case regextest:								//If the server detects a request for a widget...
			var matchtest = filename.match(/\d(?=\.js)/g)[0];
			createWidget.example(res, matchtest);	//...then a function is called to serve the code for that widget
		break;
		case '/':
			var filename = config.homepage;			//the default page is chosen from the configuration file
		break;
		default:
			var filename = q.pathname;				//or, a specified page is chosen instead
		break;
	}

	fs.readFile("." + filename, (err, data) => {
		if (err) {								//If the specified page isn't available, an error is created
			res.writeHead(404, {'Content-Type': 'text/html'});
			return res.end("404 Not Found");
		} 
		res.end(data);							//The page is given to the user
	});
}
exports.createPage = createPage;