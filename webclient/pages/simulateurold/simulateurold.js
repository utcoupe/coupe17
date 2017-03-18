angular.module('app').controller('SimulateuroldCtrl', ['$rootScope', '$scope', 'Client', 'Simulateurold',
	function($rootScope, $scope, Client, Simulateurold) {
	$rootScope.act_page = 'simulateurold';
	Simu.init();
	$scope.pos_gr_old = Simulateurold.pos_gr;
	$scope.pos_pr_old = Simulateurold.pos_pr;
	$scope.vueDeFace = function() { Simu.vueDeFace(); }
	$scope.vueDeDessus = function() { Simu.vueDeDessus(); }
	$scope.vueDeDerriere = function() { Simu.vueDeDerriere(); }
	$scope.vueDeGauche = function() { Simu.vueDeGauche(); }
	$scope.vueDeDroite = function() { Simu.vueDeDroite(); }
	$scope.iaJack = function() { Client.send("ia", "ia.jack"); }
	$scope.iaPlacerPr = function() { Client.send("ia", "pr.placer"); }
	$scope.iaCollisionPr = function() { Client.send("ia", "pr.collision"); }
	$scope.iaStop = function() { Client.send("ia", "ia.stop"); }
}]);

function convertPos(act_pos, pos) {
	act_pos.x = parseInt(pos.x*1000+1500);
	act_pos.y = -parseInt(pos.y*1000-1000);
	act_pos.a = parseInt(pos.a/Math.PI*180);
}

angular.module('app').service('Simulateurold', ['$rootScope', 'Client', function($rootScope, Client) {
	this.pos_gr = {x:-1, y:-1, a:0};
	this.pos_pr = {x:-1, y:-1, a:0};
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'simulateur' && $rootScope.act_page == 'simulateurold') {
				Simu.update(data);
				convertPos(this.pos_gr, data.robots.gr);
				convertPos(this.pos_pr, data.robots.pr);
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
