var amqp = require('amqplib/callback_api')


function rabbitOutput() {
	var self = this;
	this.config = {};
	this.ready = false;
	this.queue = [];
}
rabbitOutput.prototype.init = function(config,callback) {
	var self = this;
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
	var amqpURI = "amqp://"
	// authentication details
	amqpURI += this.config.serverConnection.login + ":" + this.config.serverConnection.password + "@"
	//  url:port
	amqpURI += this.config.serverConnection.host + ":" + this.config.serverConnection.port
	console.log(amqpURI);
    amqp.connect(amqpURI,function (err, con) {
		if (err) {
			throw err;
		}
		self.connection = con;
		console.log("Connection to rabbitMQ successfull.");
		if (typeof self.channel === 'undefined') {
			self.connection.createChannel(function(err,ch) {
				if (err) {
					console.error(err);
				}
				self.channel = ch
				self.ready = true;
				console.log("Cleaning queue:")
				console.log(self.queue);
				for (var index = 0; index < self.queue.length; index++) {
					var item = self.queue[index];
					self.channel.assertQueue(item.inputModule.name, {durable: true});
					self.channel.sendToQueue(item.inputModule.name, new Buffer(JSON.stringify(item.data)));
				}
				self.queue = [];
			});
		}
    });
}
rabbitOutput.prototype.close = function (callback) {
	this.connection.close(function(err) {
		if (err) {
			if (typeof callback !== undefined) {
				callback(err);
			} else {
			   	console.error(err);
			}
		}
	});
	return;
}
rabbitOutput.prototype.send = function (data,inputModule,callback) {
	if (this.ready) {
		this.channel.assertQueue(inputModule.name, {durable: true});
		this.channel.sendToQueue(inputModule.name, new Buffer( JSON.stringify( data ) ));
	} else {
		this.queue.push({"data": data, "inputModule":  inputModule});
	}
}
module.exports = new rabbitOutput();
