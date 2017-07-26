var config = require('./config.json');

function example(res){
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
			res.write("widget" + foo + ".onFinishInsert('[name=\"ps\"]', 'payment_source'); \nwidget" + foo + ".load();\n");
		} else {
			res.write("//no valid gateway id found for payment source\n" + foo);
		}
	}
	res.end();
}
exports.example = example;


