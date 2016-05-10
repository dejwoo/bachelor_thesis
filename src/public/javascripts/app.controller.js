'use strict'

angular.module('mainApp').controller('MainController', function ($http, $routeParams, socket) {
	var self = this;
	if (typeof $routeParams.id !== 'undefined') {
		self.moduleName = $routeParams.id;
	}
	socket.on('data', function (id,data) {
    	self.modules[id].lastData = data;
  	});
	$http.get('/api/config')
		.then(function(response) {
			self.menus = [];
			self.modules = {};
			self.routes = {};
			self.config = response.data;
			for (var index = 0; index < self.config.modules.length; index++) {
				self.menus.push({"label":self.config.modules[index].label,"id":self.config.modules[index].id});
				self.modules[self.config.modules[index].id] = self.config.modules[index];
			}
		}, function (err) {
			if (err) {
				console.error(err);
			}
		});

})

