const InputStream = require('./inputStreamWrapper.js');
const _ = require('lodash');
const fs = require('fs');

function DataLogger (configJSON) {
	var self = this;
	this.modules = {};
	this.types = {};
	this.routes = {};
	this.configRoutes = {};
	if (typeof configJSON !== 'undefined') {
		this.configure(configJSON);
	}
}
DataLogger.prototype.reset = function() {
	this.modules = {};
	this.types = {};
	this.routes = {};
	this.configRoutes = {};
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
					return;
				}
			});
		}
	} else {
		console.error("data-logger.module.configure: No modules defined in config.json");
	}
	if (!_.isUndefined(configJSON.routes)) {
		_.forOwn(configJSON.routes, function(value,key) {
			self.addRoute(key,value);
			self.configRoutes[key] = value;
		})
	}
}
DataLogger.prototype.addModule = function (config, callback) {
	var self = this;
	if (_.isUndefined(config.id)) {
		callback("data-logger.module.addModule: id is not defined for ["+config+"]");
		return;
	}
	if (_.isUndefined(config.modulePath)) {
		callback("data-logger.module.addModule: modulePath is not defined for ["+config.id+"]");
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
	this.modules[config.id].initialized = false;
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
		console.log("1");
		source = this.modules[routeFrom];
		if (source.initialized == false) {
			source.init();
			source.initialized = true;
		}
		if (_.isUndefined(source.stream)) {
			source.stream = new InputStream(source, source.config);
		}
		for (var index = 0; index < routeTo.length; index++) {
			console.log(index,routeTo.length,"routeTo[index]", routeTo[index]);
			if (_.has(this.modules, routeTo[index])) {
				//kontrola viacnasobneho routovania, zatial nie je dovolene
				if (_.has(this.routes, routeFrom)) {
					var findValue = _.findIndex(this.routes[source.id], function(id) {
						return id == routeTo[index];
					});
					if (findValue != -1) {
						console.error("data-logger.module.addRoute: double defined route!");
						continue;
					}
				}
				// sink is defined directly by id
				console.log("2");

				sink = this.modules[routeTo[index]];
				if (sink.initialized == false) {
					sink.init();
					sink.initialized = true;
				}
				if( _.isUndefined(this.routes[source.id])) {
					this.routes[source.id] = [sink.id];
				} else {
					try {
						var findValue = _.findIndex(this.routes[source.id], function(id) {
							return id == sink.id;
						});
						if (findValue == -1) {
							this.routes[source.id].push(sink.id);
						}
					} catch (err) {
						console.error(err);
					}
				}
				// actual data route, through stream piping
				source.stream.pipe(sink);
				continue;

			} else if (_.has(this.types, routeTo[index])) {
			//sink is defined by type of data
			_.map(this.types[routeTo[index]], (id) => {
				if (_.has(this.routes, routeFrom)) {
					var findValue = _.findIndex(this.routes[source.id], function(moduleId) {
						return moduleId == id;
					});
					if (findValue != -1) {
						console.error("data-logger.module.addRoute: double defined route T!");
						return;
					}
				}
				sink = self.modules[id];
				if (sink.initialized == false) {
					sink.init();
					sink.initialized = true;
				}
				if( _.isUndefined(this.routes[source.id])) {
					this.routes[source.id] = [sink.id];
				} else {
					try {
						var findValue = _.findIndex(this.routes[source.id], function(index) {
							return index == sink.id;
						});
						if (findValue == -1) {
							this.routes[source.id].push(sink.id);
						}
					} catch (err) {
						console.error(err);
					}
				}
				return source.stream.pipe(self.modules[id]);
			});
			continue;
		} else {
			console.error("data-logger.module.addRoute: sink["+routeTo[index]+"] not found in modules");
		}
	}
}
	// did not found valid id => source defined by type
	if (_.has(this.types, routeFrom)) {
		console.log("3");
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
	});
	this.modules[id].config = newConfig;
	var outputModuleConfig = [];
	_.forIn(this.modules, function(module, id){
		try {
			outputModuleConfig.push(module.config);
		} catch (err) {
			console.error(err);
		}
	});
	var outputRouteConfig = {};
	_.forIn(this.configRoutes, function(route, id){
		outputRouteConfig[id] = route;
	});
	var outputConfig = {"modules":outputModuleConfig, "routes":outputRouteConfig};
	fs.writeFile("configNew.json", JSON.stringify(outputConfig,undefined,2),function (err) {
		if (err) {
			console.error(err);
		}
		self.shutdown();
		self.reset();
		self.configure(outputConfig);
	})
	// if (_.has(this.modules, id)) {
	// 	this.deleteModule(id);
	// }
	// if (id != newConfig.id) {
	// 	console.warn("DataLogger.configureModule: id["+id+"] is not the same as in proided config");
	// }
	// console.log(newConfig);
	// this.addModule(newConfig);
	// if (_.has(this.routes, id)) {
	// 	var sinks = this.routes[id];
	// 	try {
	// 		delete this.routes[id];
	// 	} catch (err) {
	// 		console.error(err);
	// 	}
	// 	this.addRoute(id, sinks);
	// }
}


DataLogger.prototype.shutdown = function() {
	var self = this;
	console.info("DataLogger shutting down!");
	_.forOwn(this.modules, function(value,key) {
		console.log("Closing module " + key + "!");
		self.deleteModule(key);
	});

}

module.exports = new DataLogger();
