var fs = require('fs');
var config = require('./config.json');

function createPage(req, res){
	
	if (req.url == '/') {
		filename = config.homepage;
	} else {
		filename = req.url;
	}

	fs.readFile("." + filename, (err, data) => {
		if (err) {										//If the specified page isn't available, an error is created
			res.writeHead(404, {'Content-Type': 'text/html'});
			return res.end("404 Not Found");
		} 
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(data);									//The page is given to the user
	});
}

function createWidget(res){
	res.writeHead(200, {
		'Content-Type': 'text/javascript'
	});
	for (foo = 0; foo < config.gateway_config.length; foo++) {
		var div_id = foo + 1;
		if (config.gateway_config[foo].gateway_id.length == 24) {
			res.write("var widget" + foo + " = new paydock.HtmlWidget('#widget" + div_id + "', '" + config.PublicKey + "', '" + config.gateway_config[foo].gateway_id + "', '" + config.gateway_config[foo].payment_type + "');\n");
			for (i = 0; i < config.gateway_config[foo].form_fields.length; i++) {
				res.write("widget" + foo + ".setFormFields(['" + config.gateway_config[foo].form_fields[i] + "']);\n");
			}
			res.write("widget" + foo + ".onFinishInsert('[name=\"token\"]', 'payment_source'); \nwidget" + foo + ".load();\n");
			res.write("widget" + foo + ".on('finish', function () { \n document.getElementById('vault_id').value = '';\n});\n");
		} else {
			res.write("//no valid gateway id found for payment source " + foo + "\n");
		}
	}
	res.end();
}
exports.createWidget = createWidget;
exports.createPage = createPage;