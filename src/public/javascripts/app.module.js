'use strict'
var app = angular.module('mainApp', ['ngRoute', 'ngAnimate']);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


app.config(function($routeProvider,$locationProvider){
	$routeProvider
		//the home display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Home'
		})
		.when('/module/:id', {
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
	var self = this;
	if (typeof $routeParams.id !== 'undefined') {
		self.moduleName = $routeParams.id;
	}
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

