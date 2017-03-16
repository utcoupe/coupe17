angular.module('app').controller('SimulateurCtrl', ['$rootScope', '$scope', 'Client', 'Simulateur',
	function($rootScope, $scope, Client, Simulateur) {
	$rootScope.act_page = 'simulateur';
    controllerSimu = new Controller("3dobjects.json", "../simulateur/");
    controllerSimu.createRenderer();
    controllerSimu.loadParameters();
	$scope.pos_gr = Simulateur.pos_gr;
	$scope.pos_pr = Simulateur.pos_pr;
	$scope.vueDeFace = function() { controllerSimu.selectView("front"); }
	$scope.vueDeDessus = function() { controllerSimu.selectView("top"); }
    $scope.vueDeDerriere = function() { controllerSimu.selectView("behind"); }
	$scope.vueDeGauche = function() { controllerSimu.selectView("left"); }
	$scope.vueDeDroite = function() { controllerSimu.selectView("right"); }
	$scope.iaJack = function() { Client.send("ia", "ia.jack"); }
	$scope.iaPlacerPr = function() { Client.send("ia", "pr.placer"); }
	$scope.iaCollisionPr = function() { Client.send("ia", "pr.collision"); }
	$scope.iaStop = function() { Client.send("ia", "ia.stop"); }
}]);

function convertPosNew(pos) {
	var act_pos = {};
	act_pos.x = pos.x + 1.5;
	act_pos.z = pos.y + 1; // oui c'est logique !!!
	return act_pos;
}

angular.module('app').service('Simulateur', ['$rootScope', 'Client', function($rootScope, Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'simulateur' && $rootScope.act_page == 'simulateur') {
				// Met à jour le pr (s'il existe)
				if(data.robots.pr.x && controllerSimu.objects3d.has("pr_jaune"))
				{
					act_pos = convertPosNew(data.robots.pr);
					position = new Position(act_pos.x, 0, act_pos.z);
					rotation = new Position(0, data.robots.pr.a, 0);
					controllerSimu.objects3d.get("pr_jaune").updateParams ({
						pos: position,
						rotation: rotation
					});
				}
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
