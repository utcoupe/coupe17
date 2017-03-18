/**
 * @file Fichier permettant de faire le lien entre le webclient et le simulateur
 */
//"use strict"; Utile ?

angular.module('app').controller('SimulateurCtrl', ['$rootScope', '$scope', 'Client', 'Simulateur',
	function($rootScope, $scope, Client, Simulateur) {
	$rootScope.act_page = 'simulateur';
    Simulateur.controllerSimu = new Controller("3dobjects.json", "../simulateur/");
    Simulateur.controllerSimu.createRenderer();
    Simulateur.controllerSimu.loadParameters();
	//$scope.pos_gr = controllerSimu.get("gr_jaune").position;
	//$scope.rot_gr = controllerSimu.get("gr_jaune").rotation.y/Math.PI*180;
	Simulateur.pos_pr = new Position();
	Simulateur.rot_pr = new Position();
	$scope.pos_gr = Simulateur.pos_pr;
	$scope.rot_gr = Simulateur.rot_pr;
	$scope.vueDeFace = function() { Simulateur.controllerSimu.selectView("front"); }
	$scope.vueDeDessus = function() { Simulateur.controllerSimu.selectView("top"); }
    $scope.vueDeDerriere = function() { Simulateur.controllerSimu.selectView("behind"); }
	$scope.vueDeGauche = function() { Simulateur.controllerSimu.selectView("left"); }
	$scope.vueDeDroite = function() { Simulateur.controllerSimu.selectView("right"); }
	$scope.iaJack = function() { Client.send("ia", "ia.jack"); }
	$scope.iaPlacerPr = function() { Client.send("ia", "pr.placer"); }
	$scope.iaCollisionPr = function() { Client.send("ia", "pr.collision"); }
	$scope.iaStop = function() { Client.send("ia", "ia.stop"); }
}]);

/**
 * Convertit la position indiquée par l'ia en celle du simulateur
 * 
 * @param {Object} pos Position sent by the IA
 * @param {Number} pos.x
 * @param {Number} pos.y
 * @returns {{x: Number, z: Number}}
 */
function convertPosNew(pos) {
	var act_pos = {};
	act_pos.x = pos.x + 1.5;
	act_pos.z = pos.y + 1; // oui c'est logique !!!
	return act_pos;
}

/**
 * Met à jour les paramètres du PR avec les données envoyées par l'IA
 * 
 * @param {Object} data_pr Data for the PR sent by the IA
 * @param {Number} data_pr.x
 * @param {Number} data_pr.y
 * @param {Number} data_pr.a
 */
function updatePr(data_pr, Simulateur)
{
	if(data_pr.x && Simulateur.controllerSimu.objects3d.has("pr_jaune"))
	{
		act_pos = convertPosNew(data_pr);
		position = new Position(act_pos.x, 0, act_pos.z);
		rotation = new Position(0, data_pr.a, 0);
		Simulateur.controllerSimu.objects3d.get("pr_jaune").updateParams ({
			pos: position,
			rotation: rotation
		});
		
		Simulateur.pos_pr = Simulateur.controllerSimu.objects3d.get("pr_jaune").position;
		Simulateur.rot_pr = Simulateur.controllerSimu.objects3d.get("pr_jaune").rotation;
	}
}

angular.module('app').service('Simulateur', ['$rootScope', 'Client', function($rootScope, Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'simulateur' && $rootScope.act_page == 'simulateur') {
				// Met à jour le pr (s'il existe)
				updatePr(data.robots.pr, this);
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
