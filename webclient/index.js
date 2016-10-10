angular.module('app').controller('IndexCtrl', ['$rootScope', '$scope', 'UTCoupe', 'Client',
	function($rootScope, $scope, UTCoupe, Client) {
	$rootScope.act_page = 'index';
	$scope.utcoupe = UTCoupe.utcoupe;

	// params
	$scope.our_color = 'yellow';
	$scope.nb_erobots = 2;
	$scope.EGR_d = 300;
	$scope.EPR_d = 150;

	$scope.launch = function(u) {
		Client.send('server', 'server.launch', {
			prog: u,
			color: $scope.our_color,
			nb_erobots: $scope.nb_erobots,
			EGR_d: $scope.EGR_d,
			EPR_d: $scope.EPR_d
		});
	}
	$scope.stop = function(u) {
		Client.send('server', 'server.stop', u);
	}
}]);

angular.module('app').service('UTCoupe', ['$rootScope', 'Client', function($rootScope, Client) {
	this.utcoupe = {
		'ia': false,
		'pr': false,
		'gr': false,
		'hokuyo': false
	};
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'utcoupe') {
				// console.log('[UTCoupe update]');
				this.utcoupe.ia = data.ia;
				this.utcoupe.gr = data.gr;
				this.utcoupe.pr = data.pr;
				this.utcoupe.hokuyo = data.hokuyo;
				if($rootScope.act_page == 'index') {
					$rootScope.$apply();
				}
			}
		}.bind(this));
	};
}]);
