angular.module('app', [
	'ngRoute'
]);

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	// $locationProvider.html5Mode(true);
	$routeProvider
		.when('/', {templateUrl: 'index.tpl.html'})
		.when('/orders', {templateUrl: 'pages/orders/orders.tpl.html'})
		.when('/logger', {templateUrl: 'pages/logger/logger.tpl.html'})
		.when('/reseau', {templateUrl: 'pages/reseau/reseau.tpl.html'})
		.when('/simulateurold', {templateUrl: 'pages/simulateurold/simulateurold.tpl.html'})
		.when('/simulateur', {templateUrl: 'pages/simulateur/simulateur.tpl.html'})
		.when('/hokuyo', {templateUrl: 'pages/hokuyo/hokuyo.tpl.html'})
		.when('/telecommande', {templateUrl: 'pages/telecommande/telecommande.tpl.html'})
		.otherwise({redirectTo:'/'});
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'UTCoupe', 'Orders', 'Logger', 'Reseau', 'Simulateurold', 'Simulateur', 'Hokuyo',
	function($scope, UTCoupe, Orders, Logger, Reseau, Simulateurold, Simulateur, Hokuyo) {
	UTCoupe.init();
	Orders.init();
	Logger.init();
	Reseau.init();
	Simulateurold.init();
	Hokuyo.init();
	Simulateur.init();
}]);

angular.module('app').controller('MenuCtrl', ['$scope', function($scope) {
	
}]);

angular.module('app').service('Client', SocketWebclient);
