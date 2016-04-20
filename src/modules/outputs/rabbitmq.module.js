var amqp = require('amqp');

function rabbitOutput() {
	var self = this;
	this.config = {};
	this.ready = false;
	this.queue = [];
}
rabbitOutput.prototype.init = function(config,callback) {
	if (typeof config === 'undefined') {
		console.error("rabbitMQ.module.js: Undefined config");
	}
	if (typeof config.serverConnection === 'undefined') {
		console.error("rabbitMQ.module.js: RabbitMQ serverConnection is undefined config");
	}
	this.config = config;
	if (typeof config.exchangeOptions === 'undefined') {
		this.config.exchangeOptions = {};
	}
	this.connection = amqp.createConnection(this.config.serverConnection);
	this.connection.on('ready', function () {
		this.exchange = this.connection.exchange('carPi', {type: 'topic'}, function(e) {
			console.log("Connection to rabbitMQ successfull." + e.name);
			this.ready = true;
			console.log("Cleaning queue:")
			for (var index = 0; index < this.queue.length; index++) {
				var item = this.queue.pop();
				this.exchange.publish("/"+item.inputModule.name, item.data, this.config.exchangeOptions)
			}
		});
	});
}
rabbitOutput.prototype.close = function (callback) {
	this.exchange.destroy();
	this.connection.disconnect();
	callback();
	return
}
rabbitOutput.prototype.send = function (data,inputModule,callback) {
	if (this.ready) {
		this.exchange.publish("/"+inputModule.name, data, this.config.exchangeOptions, callback)
	} else {
		console.log(this.connection);
		this.queue.push({"data": data, "inputModule":  inputModule});
	}
}
module.exports = new rabbitOutput();