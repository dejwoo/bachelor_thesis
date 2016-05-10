const redis = require('redis');
const Writable = require('stream').Writable;
const util = require('util');
const _ = require('lodash');

function RedisOutput(moduleConfig) {
	var self = this;
    this.ready = false;
    this.moduleConfig = moduleConfig;
    this.queue = [];
    if (_.isUndefined(this.moduleConfig)) {
        console.error("redis.module.js: Undefined moduleConfig");
    }
    this.configure();
}
util.inherits(RedisOutput, Writable);

RedisOutput.prototype.configure = function () {
	if (_.isUndefined(this.moduleConfig.streamOptions)) {
        var streamOptions = {};
    } else {
        var streamOptions = this.moduleConfig.streamOptions;
    }
    //this settings must be always set to this value
    streamOptions.objectMode = true;
    Writable.call(this, streamOptions);

	if (_.isUndefined(this.moduleConfig.hostname)) {
		console.error("redis.module.js: Undefined hostname!");
	}
	if (_.isUndefined(this.moduleConfig.port)) {
		console.error("redis.module.js: Undefined port!");
	}
	if (_.isUndefined(this.moduleConfig.password)) {
		console.error("redis.module.js: Undefined password!");
	}
	if (_.isUndefined(this.moduleConfig.configSet)) {
		this.configSet = "CONFIG SET SAVE \"900 1 300 10\"";
	}
	this.ready = false;
	this.queue = [];

}
RedisOutput.prototype.init = function () {
	var self = this;
	this.client =  redis.createClient(this.moduleConfig.port, this.moduleConfig.hostname, {no_ready_check: true});
	this.client.auth(this.moduleConfig.password, function (err) {
		if (err) {
			console.error(err);
		}
	});
	this.client.on('connect', function() {
		self.ready = true;
		console.log("redis.module.js: Connection to redisDB successfull.");
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
		self.client.exists(data.header.id, function(err, reply) {
			if (err) {
				console.error(err);
			}
			var outputString = JSON.stringify(data);
			if (reply === 1) { //kluc uz existuje
				self.client.incr(data.header.id, function(err, reply) {
					if (err) {
						console.error(err);
					}
        			self.client.set("" + data.header.id + reply , outputString);
   				 });
			} else { //vytvaram kluc
				console.log(data);
				self.client.set(data.header.id, 0, function() {
					console.log("" + data.header.id + 0 , outputString);
					self.client.set("" + data.header.id + "0" , outputString);
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
RedisOutput.prototype._write = function(chunk, encoding, cb) {
    //ConsoleOutput writable stream is in object mode we can igonore encoding;
    this.send(chunk);
    cb();
}
module.exports = RedisOutput;