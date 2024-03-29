'use strict'
angular.module('mainApp').config(function($routeProvider,$locationProvider){
	$routeProvider
		//the home display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Home'
		})
		.when('/routes', {
			templateUrl: 'route.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Route'
		})
		.when('/module/:id', {
			templateUrl: 'module.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'carPi | Module'
		})
		.when('/404', {
			templateUrl: '404.html'
		})
		.otherwise ({
			redirectTo: '/404'
		});
		$locationProvider.html5Mode(true);
});
