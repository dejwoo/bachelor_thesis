const InputStream = require('./inputStreamWrapper.js');
const _ = require('lodash');


function DataLogger (configJSON) {
	var self = this;
	this.modules = {};
	this.types = {};
	this.routes = {};
	if (typeof configJSON !== 'undefined') {
		this.configure(configJSON);
	}
}
DataLogger.prototype.configure = function (configJSON) {
	var self = this;
	// console.log(configJSON);
	if (_.isUndefined(configJSON)) {
		return
	}
	if (!_.isUndefined(configJSON.modules)) {
		for (var index = 0; index < configJSON.modules.length; index++) {
			this.addModule(configJSON.modules[index], function (err) {
				if (err) {
					console.error(err);
				}
			});
		}
	} else {
		console.error("DataLogger.configure: No modules defined in config.json");
	}
	if (!_.isUndefined(configJSON.routes)) {
		_.forOwn(configJSON.routes, function(value,key) {
			self.addRoute(key,value);
		})
	}
}
DataLogger.prototype.addModule = function (config, callback) {
	var self = this;
	if (_.isUndefined(config.id)) {
		callback("DataLogger.addModule: id is not defined for ["+config+"]");
		return;
	}
	if (_.isUndefined(config.modulePath)) {
		callback("DataLogger.addModule: modulePath is not defined for ["+config.id+"]");
		return;
	}
	try {
		var factory = require("../" + config.modulePath);
		var module = new factory(config.moduleOptions);
	} catch(err) {
		callback(err);
		return;
	}
	if (! _.isUndefined(this.types)) {
		if (_.isUndefined(this.types[config.type])) {
			this.types[config.type] = [config.id];
		} else {
			try {
				this.types[config.type].push(config.id);
			} catch(err) {
				console.error(err);
				return;
			}
		}
	} else {
		this.types = {};
		this.types[config.type] = [config.id];
	}
	this.modules[config.id] = module;
	this.modules[config.id].id = config.id;
	this.modules[config.id].config = config;
}
// "gpsModule": ["db","rabbitmqModule"],
// "accModule": ["redisModule", "rabbitmqModule"],
// "all": "console"
DataLogger.prototype.addRoute = function (routeFrom, routeTo) {
	var self = this;
	var source,sink;
	console.log("addRoute",routeFrom,routeTo);
	if (_.has(this.modules, routeFrom)) {
		// source is defined directly by id
		source = this.modules[routeFrom];
		source.init();
		if (_.isUndefined(source.stream)) {
			source.stream = new InputStream(source, source.config);
		}
		for (var index = 0; index < routeTo.length; index++) {
			console.log("routeTo[index]", routeTo[index]);
			console.log("types", this.types);
			if (_.has(this.modules, routeTo[index])) {
				// sink is defined directly by id
				sink = this.modules[routeTo[index]];
				sink.init();
				if( _.isUndefined(this.routes[source.id])) {
					this.routes[source.id] = [sink.id];
				} else {
					try {
						this.routes[source.id].push(sink.id)
					} catch (err) {
					console.error(err);
					}
				}
				// actual data route, through stream piping
				source.stream.pipe(sink);

			} else if (_.has(this.types, routeTo[index])) {
			//sink is defined by type of data
				_.map(this.types[routeTo[index]], (id) => {
					self.modules[id].init();
					if( _.isUndefined(this.routes[source.id])) {
						this.routes[source.id] = [id];
					} else {
						try {
							this.routes[source.id].push(id)
						} catch (err) {
							console.error(err);
						}
					}
					return source.stream.pipe(self.modules[id]);
				});
			} else {
			console.error("DataLogger.addRoute: sink["+routeTo[index]+"] not found in modules");
			}
		}
	}
	// did not found valid id => source defined by type
	if (_.has(this.types, routeFrom)) {
		//route is defined by type of data
		source = this.types[routeFrom];
		for (var index = 0; index < source.length; index++) {
			this.addRoute(source[index], routeTo);
		}
	}
}
DataLogger.prototype.deleteModule = function(id) {
	var self = this;
	if (_.has(this.modules, id)) {
		var module = this.modules[id];
		if (_.has(module, "stream")) {
			module.stream.unpipe();
		}
		module.close();
		try {
			delete this.modules[id];
		} catch (err) {
			console.error(err);
		}
	} else {
		console.error("DataLogger.deleteModule: Module["+id+"] is not defined!");
	}
}
DataLogger.prototype.configureModule = function (id,config) {
	var self = this;
	var newConfig = this.modules[id].config;
	_.forIn(config, function(value, key) {
		newConfig[key] = value;
	})
	if (_.has(this.modules, id)) {
		this.deleteModule(id);
	}
	if (id != newConfig.id) {
		console.warn("DataLogger.configureModule: id["+id+"] is not the same as in proided config");
	}
	this.addModule(newConfig);
	console.log(this.routes);
	if (_.has(this.routes, id)) {
		// this.addRoute(id, this.routes[id]);
	}
}


DataLogger.prototype.shutdown = function() {
	var self = this;
	console.info("DataLogger shutting down!");
	_.forOwn(this.modules, function(value,key) {
		console.log("Closing module " + key + "!");
		self.deleteModule(key);
	});
	process.exit();
}

module.exports = new DataLogger();
