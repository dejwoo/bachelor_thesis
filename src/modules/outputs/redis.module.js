const redis = require('redis');
const _ = require('lodash');

function RedisOutput() {
	var self = this;
}
RedisOutput.prototype.configure = function (outputConfig) {
	if (! _.isUndefined(outputConfig) ) {
		if (! _.isUndefined(outputConfig.hostname)) {
			this.hostname = outputConfig.hostname
		}
		if (! _.isUndefined(outputConfig.port)) {
			this.port = outputConfig.port;
		}
		if (! _.isUndefined(outputConfig.password)) {
			this.password = outputConfig.password;
		}
		if (! _.isUndefined(outputConfig.snapshot)) {
			this.snapshot = snapshot;
		} else {
			this.snapshot = {};
			this.snapshot.keysChanged = 1000;
			this.snapshot.secsPassed = 60;
		}
	}
	this.ready = false;
	this.queue = [];

}
RedisOutput.prototype.init = function (outputConfig) {
	var self = this;
	this.configure(outputConfig);
	this.client =  redis.createClient(this.port, this.hostname, {no_ready_check: true});
	this.client.auth(this.password, function (err) {
		if (err) {
			throw err;
		}
	});
	this.client.on('connect', function() {
		self.ready = true;
		console.log("Connection to redisDB successfull.");
		for (var index = 0; index < self.queue.length; index++) {
			var item = self.queue[index];
			self.send(item.data, item.inputModule);
		}
		self.queue = [];
	});
}
RedisOutput.prototype.send = function (data,callback) {
	var self = this;
	if (this.ready === false) {
		if (! _.isUndefined(this.queue)) {
			try {
				self.queue.push(data);
			} catch(err) {
				console.error(err);
			}
		}
	} else {
		self.client.exists(data.header.name, function(err, reply) {
			if (err) {
				console.error(err);
			}
			if (reply === 1) { //kluc uz existuje
				var outputString = JSON.stringify(data);
				self.client.incr(data.header.name, function(err, reply) {
					if (err) {
						console.error(err);
					}
        			self.client.set("" + data.header.name + reply , outputString);
   				 });
			} else { //vytvaram kluc
				self.client.set(data.header.name, 0, function() {
					self.client.set("" + data.header.name + 0 , outputString);
				});
			}
		});
	}
}
RedisOutput.prototype.close = function() {
	var self = this;
	if (! _.isUndefined(this.client)) {
		this.client.quit()
	}
}

module.exports = RedisOutput;