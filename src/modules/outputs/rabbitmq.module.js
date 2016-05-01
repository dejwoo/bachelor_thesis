var amqp = require('amqplib/callback_api')
const _ = require('lodash');

function rabbitOutput() {
	var self = this;
	this.ready = false;
	this.queue = [];
}
rabbitOutput.prototype.configure = function(outputConfig) {
	var self = this;

	if (typeof outputConfig === 'undefined') {
		console.error("rabbitMQ.module.js: Undefined outputConfig");
	}
	this.config = outputConfig;
	if (typeof this.config.serverConnection === 'undefined') {
		console.error("rabbitMQ.module.js: RabbitMQ serverConnection is undefined in outputConfig");
	}
	this.amqpURI = "amqp://"
	// authentication details
	this.amqpURI += this.config.serverConnection.login + ":" + this.config.serverConnection.password + "@"
	//  url:port
	this.amqpURI += this.config.serverConnection.host + ":" + this.config.serverConnection.port;
}
rabbitOutput.prototype.init = function(config,callback) {
	if (typeof this.config === 'undefined') {
		this.configure(config);
	}
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
					self.send(self.queue[index]);
				}
				self.queue = [];
			});
		}
    });
}
rabbitOutput.prototype.close = function (callback) {
	if (_.isUndefined(this.connection)) {
		return;
	}
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
rabbitOutput.prototype.send = function (data) {
	if (this.ready) {
		this.channel.assertQueue(data.header.name, {durable: true});
		this.channel.sendToQueue(data.header.name, new Buffer( JSON.stringify( data ) ));
	} else {
		this.queue.push(data);
	}
}
module.exports = rabbitOutput;
