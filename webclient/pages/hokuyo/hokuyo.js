angular.module('app').controller('HokuyoCtrl', ['$rootScope', '$scope', 'Hokuyo',
	function($rootScope, $scope, Hokuyo) {
	$rootScope.act_page = 'hokuyo';
	Hokuyo.displays.main = new HokuyoDisplay("mainHokDisp", "main");
	Hokuyo.displays.one = new HokuyoDisplay("hok1", "one");
	Hokuyo.displays.two = new HokuyoDisplay("hok2", "two");
	// $scope.test = "Coucou !";
	// $scope.test3 = 42;

	$scope.name = "hokuyo.polar_raw_data";
	$scope.from = "hokuyo";
	$scope.data = '{\n\
 	"hokuyo": "corner",\n\
	"polarSpots": [\n\
		[ -40, 235 ],\n\
		[ -30, 235 ],\n\
		[ -35, 230 ],\n\
		[ -25, 230 ],\n\
		[ -20, 100 ],\n\
		[ -15, 105 ],\n\
		[ -5, 120 ],\n\
		[ 0, 100 ],\n\
		[ 5, 90 ],\n\
		[ 10, 95 ],\n\
		[ 15, 100 ],\n\
		[ 20, 100 ],\n\
		[ 25, 230 ],\n\
		[ 30, 235 ]\n\
	]\n\
}';

	$scope.update = function() {
		Hokuyo.onOrder($scope.from, $scope.name, JSON.parse($scope.data));
	}

}]);

angular.module('app').service('Hokuyo', ['$rootScope', '$sce', 'Client',
	function($rootScope, $sce, Client) {
		this.displays = {
			main: null,
			one: null,
			two: null
		}

		this.init = function () {
			Client.order(this.onOrder);
		};

		this.onOrder = function (from, name, data) {
			if($rootScope.act_page == 'hokuyo') {
					if (name == 'hokuyo.polar_raw_data') {
						if (data.hokuyo == "corner" && !!this.displays.one) {
							this.displays.one.updatePolarSpots(data.polarSpots);
						} else if (data.hokuyo == "enemy" && !!this.displays.two) {
							this.displays.two.updatePolarSpots(data.polarSpots);
					}
				} else if (name == 'hokuyo.robots'
					&& !!this.displays.main) {
					this.displays.main.updateRobots(data.robots);
				}
			}
		}.bind(this);
}]);