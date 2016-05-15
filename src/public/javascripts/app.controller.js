'use strict'

angular.module('mainApp').controller('MainController', function ($http, $routeParams, socket,$filter) {
	var self = this;
	if (typeof $routeParams.id !== 'undefined') {
		self.moduleName = $routeParams.id;
	}
	this.editConfig = false;
	this.enableConfiguration = function() {
		self.editConfig = true;
	}
	socket.on('disconnect', function () {
		console.log("Socket.io disconnected");
	});
	this.submitModuleConfiguration = function(id) {
		socket.emit('configureModule', {"id":id, "moduleConfig": self.modules[id]});
		self.disableConfiguration();
		socket.on('data', function (id,data) {
			self.data[id].last = data;
		});
	}
	this.submitRouteConfiguration = function() {
		console.log("CONFIGURE ROUTE:", self.routes);
		socket.emit('configureRoute', {"routes": self.routes });
		self.disableConfiguration();
		socket.on('data', function (id,data) {
			self.data[id].last = data;
		});
	}
	this.disableConfiguration = function() {
		self.editConfig = false;
	}
	this.parseErr = function(err) {
		self.errorMsg = err;
		self.showError = true;
	}
	this.setGetters = function() {
		self.editModules = function (id) {
			return function(newStr) {
				if (arguments.length) {
					try {
						self.modules[id] = JSON.parse(newStr)
						return self.modules[id];
					} catch (err) {
						console.error(err);
						self.parseErr(err);
					}
				} else {
					return JSON.stringify(self.modules[id],undefined,2);
				}
			}
		}
		self.editRoutes = function() {
			return function(newStr) {
				if (arguments.length) {
					try {
						self.routes = JSON.parse(newStr)
						return self.routes;
					} catch (err) {
						console.error(err);
						self.parseErr(err);
					}
				} else {
					return JSON.stringify(self.routes,undefined,2);
				}
			}
		}
	}
	this.setModuleTextareaDims = function(id) {
		if (typeof id == 'undefined') {
			return;
		}
		self.textCols = JSON.stringify(self.modules[id]).length/2.5;
		self.textRows = self.textCols/6;

	}
	this.setRouteTextareaDims = function() {
		self.textCols = JSON.stringify(self.routes).length/2;
		self.textRows = self.textCols/2;
	}

	$http.get('/api/config')
	.then(function(response) {
		self.menus = [];
		self.modules = {};
		self.data = {};
		self.routes = {};
		self.config = response.data;
		self.routes = self.config.routes;
		console.log(response.data.routes);
		for (var index = 0; index < self.config.modules.length; index++) {
			self.menus.push({"label":self.config.modules[index].label,"id":self.config.modules[index].id});
			self.modules[self.config.modules[index].id] = self.config.modules[index];
			self.data[self.config.modules[index].id] = {};
		}
		self.setGetters();
		if (typeof self.moduleName == 'undefined') {
			self.setRouteTextareaDims();
		} else {
			self.setModuleTextareaDims(self.moduleName);
		}
		socket.on('data', function (id,data,type) {
			if (type == 'time') {
				self.data[id].last = data;
			} else {
				self.data[id].last = data;
			}
			self.data[id].type = type;
		});
	}, function (err) {
		if (err) {
			console.error(err);
		}
	});

})

