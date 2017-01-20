angular.module('app').controller('HokuyoCtrl', ['$rootScope', '$scope', 'Hokuyo',
	function($rootScope, $scope, Hokuyo) {
	$rootScope.act_page = 'hokuyo';
	var displays = new HokuyoDisplay("mainHokDisp", "main");
	// $scope.logs = Hokuyo.logs;
	$scope.test = "Coucou !";
	$scope.test3 = 42;

}]);

angular.module('app').service('Hokuyo', ['$rootScope', '$sce', 'Client',
	function($rootScope, $sce, Client) {
	this.init = function () {

		Client.order(function (from, name, data) {
			if(name == 'hokuyo') {
				// Do something
			}
		}.bind(this));
	};
}]);