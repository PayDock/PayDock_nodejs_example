var config = require('./config.json');

function example(res, div_num){
	if (config.gateway_id[div_num].length == 24) {
		res.writeHead(200, {
			'Content-Type': 'text/javascript'
		});
		res.write("var widget = new paydock.HtmlWidget('#widget" + div_num + "', '" + config.PublicKey + "', '" + config.gateway_id[div_num] + "');");
		res.write("\nwidget.onFinishInsert('[name=\"ps\"]', 'payment_source'); \nwidget.load();");
		res.end();
	} else {
		res.write("//no gateway id found");
		res.end();
	}
}
exports.example = example;