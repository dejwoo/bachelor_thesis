var amqp = require('amqplib/callback_api')


function rabbitOutput() {
	var self = this;
	this.config = {};
	this.ready = false;
	this.queue = [];
}
rabbitOutput.prototype.configure = function(configJSON) {
	var self = this;
	if (typeof configJSON === 'undefined') {
		console.error("rabbitMQ.module.js: Undefined configJSON");
	}
	if (typeof configJSON.serverConnection === 'undefined') {
		console.error("rabbitMQ.module.js: RabbitMQ serverConnection is undefined configJSON");
	}
	this.config = configJSON;
	if (typeof configJSON.exchangeOptions === 'undefined') {
		this.configJSON.exchangeOptions = {};
	}
	this.amqpURI = "amqp://"
	// authentication details
	this.amqpURI += this.configJSON.serverConnection.login + ":" + this.configJSON.serverConnection.password + "@"
	//  url:port
	this.amqpURI += this.configJSON.serverConnection.host + ":" + this.configJSON.serverConnection.port;
}
rabbitOutput.prototype.init = function(config,callback) {
	var self = this;
    amqp.connect(this.amqpURI,function (err, con) {
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
