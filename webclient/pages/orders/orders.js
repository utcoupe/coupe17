angular.module('app').controller('OrdersCtrl', ['$rootScope', '$scope', 'Orders',
	function($rootScope, $scope, Orders) {
	$rootScope.act_page = 'orders';
	$scope.orders = Orders.orders;
}]);

angular.module('app').service('Orders', ['$rootScope', 'Client', function($rootScope, Client) {
	this.orders = [];
	this.init = function () {
		Client.order(function (from, name, data, to) {
			if(	   name != 'logger'
				&& name != 'utcoupe'
				&& name != 'simulateur'
				&& name != 'gr.pos'
				&& name != 'pr.pos') {
				this.orders.unshift({
					from: from,
					name: name,
					data: JSON.stringify(data),
					to: to,
				});
				if(this.orders.length > 500)
					this.orders.pop();
				if($rootScope.act_page == 'orders') {
					$rootScope.$apply();
				}
			}
		}.bind(this));
	};
}]);
