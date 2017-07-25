var config = require('./config.json');

function example(res, div_num){
	if (config.gateway_config[div_num].gateway_id.length == 24) {
		res.writeHead(200, {
			'Content-Type': 'text/javascript'
		});
		res.write("var widget = new paydock.HtmlWidget('#widget" + div_num + "', '" + config.PublicKey + "', '" + config.gateway_config[div_num].gateway_id + "', '" + config.gateway_config[div_num].payment_type + "');");
		for (i = 0; i < config.gateway_config[div_num].form_fields.length; i++) {
			res.write("\nwidget.setFormFields(['" + config.gateway_config[div_num].form_fields[i] + "']);");
		}
		res.write("\nwidget.onFinishInsert('[name=\"ps\"]', 'payment_source'); \nwidget.load();");
		res.end();
	} else {
		res.write("//no gateway id found");
		res.end();
	}
}
exports.example = example;


