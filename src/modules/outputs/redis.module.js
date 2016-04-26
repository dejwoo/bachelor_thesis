const redis = require('redis');
const _ = require('lodash');

function RedisOutput() {
	var self = this;
}
RedisOutput.prototype.configure = function (configJSON) {
	if (! _.isUndefined(config) ) {
		if (! _.isUndefined(config.hostname)) {
			this.hostname = config.hostname
		}
		if (! _.isUndefined(config.port)) {
			this.port = config.port;
		}
		if (! _.isUndefined(config.password)) {
			this.password;
		}
		if (! _.isUndefined(config.snapshot)) {
			this.snapshot = snapshot;
		} else {
			this.snapshot = {};
			this.snapshot.keys_changed = 1000;
			this.snapshow.secs_passed = 60;
		}
	}
	this.ready = false;
	this.queue = [];
}
RedisOutput.prototype.init = function (config) {
	var self = this;
	this.configure(config);
	this.client =  redis.createClient(this.port, this.hostname, {no_ready_check: true});
	this.client.auth(this.passowrd, function (err) {
		if (err) {
			throw err;
		}
	});
	client.on('connect', function() {
		self.ready = true;
		for (var index = 0; index < self.queue.length; index++) {
			var item = self.queue[index];
			self.send(item.data, item.inputModule);
		}
		self.queue = [];
	});
}
RedisOutput.prototype.send = function (data,inputModule,callback) {
	var self = this;
	if (this.ready === false) {
		if (! _.isUndefined(this.queue)) {
			try {
				self.queue.push({"data":data,"inputModule":inputModule});
			} catch(err) {
				console.error(err);
			}
		}
	} else {
		client.exists(inputModule.name, function(err, reply) {
			if (err) {
				console.error(err);
			}
			if (reply === 1) { //kluc uz existuje
				self.client.incr(inputModule.name, function(err, reply) {
					if (err) {
						console.error(err);
					}
        			self.client.hmset("" + inputModule.name + reply , data);
   				 });
			} else { //vytvaram kluc
				self.client.set(inputModule.name, 0, fucntion() {
					self.client.hmset("" + inputModule.name + 0 , data);
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

