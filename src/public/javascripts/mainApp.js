'use strict'
var app = angular.module('mainApp', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider,$locationProvider){
	$routeProvider
		//the home display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Home'
		})
		.when('/module/:name', {
			templateUrl: 'module.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Home'
		})
		.when('/404', {
			templateUrl: '404.html'
		})
		.otherwise ({
			redirectTo: '/404'
		});
		$locationProvider.html5Mode(true);
});
app.controller('MainController', function ($http, $routeParams) {
	let self = this;
	if (typeof $routeParams.name !== 'undefined') {
		self.moduleName = $routeParams.name;
	}
	$http.get('/api/config')
		.then(function(response) {
			self.menus = [];
			self.inputs = {};
			self.outputs = {};
			self.config = response.data;
			for (var inputIndex = 0; inputIndex < self.config.inputs.length; inputIndex++) {
				self.menus.push(self.config.inputs[inputIndex]);
				self.inputs[self.config.inputs[inputIndex].name] = self.config.inputs[inputIndex];
			}
			for (var outputIndex = 0; outputIndex < self.config.outputs.length; outputIndex++) {
				self.menus.push(self.config.outputs[outputIndex]);
				self.outputs[self.config.outputs[outputIndex].name] = self.config.outputs[outputIndex];
			}
		}, function (err) {
			if (err) {
				console.error(err);
			}
		});

})

