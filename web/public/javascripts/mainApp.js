'use strict'
var app = angular.module('mainApp', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider,$locationProvider){
	$routeProvider
		//the home display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | Home'
		})
		.when('/about', {
			templateUrl: 'about.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | About'
		})
		.when('/thesis', {
			templateUrl: 'thesis.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | Thesis'
		})
		.when('/sources', {
			templateUrl: 'sources.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | Sources'
		})
		.when('/timeline', {
			templateUrl: 'timeline.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | Timeline'
		})
		.when('/journal', {
			templateUrl: 'journal.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | Journal'
		})
		.when('/files', {
			templateUrl: 'files.html',
			controller: 'MainController',
			controllerAs: 'mainController',
			title : 'dejwoo | About'
		})
		.when('/404', {
			templateUrl: '404.html'
		})
		.otherwise ({
			redirectTo: '/404'
		});
		$locationProvider.html5Mode(true);
});
app.controller('MainController', function ($location) {
	let self = this;
	self.viewBackground = () => {
		switch($location.path()) {
			case '/':
				return 'index-background'
			case '/about':
				return 'about-background'
			case '/thesis':
				return 'thesis-background'
			case '/sources':
				return 'sources-background'
			case '/timeline':
				return 'timeline-background'
			case '/journal':
				return 'journal-background'
			case '/files':
				return 'files-background'
			case '/404':
				return 'error-background'
		}
		
	}
})
app.controller('MenuController', function(){
	let self = this;
	self.showingMenu = false;
	self.pushMenu = "";
	self.showMenu = () => { 
		self.showingMenu = !self.showingMenu;
		if (self.pushMenu === ""){
			self.pushMenu = "pushMenu";
		}
		else {
			self.pushMenu = "";
		}
	};
angular.module('app').controller 'AppCtrl', ($rootScope) ->
  $rootScope.$on '$routeChangeSuccess', (event, current, previous) =>
    $rootScope.pageTitle = $route.current.title
	
});
