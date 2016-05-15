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
	this.submitConfiguration = function(id) {
		socket.emit('configure', {"id":id, "moduleConfig": self.modules[id]});
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
				console.log(self.modules[id]);
				if (arguments.length) {
					try {
						self.modules[id] = JSON.parse(newStr)
						return self.modules[id];
					} catch (err) {
						self.parseErr(err);
						return
					}
				} else {
					return JSON.stringify(self.modules[id],undefined,2)
				}
			}
		}
	}
	this.setTextareaDims = function(id) {
		if (typeof id == 'undefined') {
			return;
		}
		self.textCols = JSON.stringify(self.modules[id]).length/2;
		self.textRows = self.textCols/6;
		// for (var key in self.modules[id]) {
		// 	if (self.modules[id].hasOwnProperty(key)) {
		// 		self.textRows++;
		// 		self.textCols = Math.max(self.textCols, self.modules[id][key].length);
		// 	}
		// }
		console.log(self.textCols,self.textRows);
	}

	$http.get('/api/config')
		.then(function(response) {
			self.menus = [];
			self.modules = {};
			self.routes = {};
			self.data = {};
			self.config = response.data;
			for (var index = 0; index < self.config.modules.length; index++) {
				self.menus.push({"label":self.config.modules[index].label,"id":self.config.modules[index].id});
				self.modules[self.config.modules[index].id] = self.config.modules[index];
				self.data[self.config.modules[index].id] = {};
			}
			self.setGetters();
			self.setTextareaDims(self.moduleName);
			socket.on('data', function (id,data,type) {
				if (type == 'time') {
					self.data[id].last = data;
				} else {
					self.data[id].last = data;
				}
    			self.data[id].type = type;
    			console.log(id, data, type);
  			});
		}, function (err) {
			if (err) {
				console.error(err);
			}
		});
	console.log(self);

})

