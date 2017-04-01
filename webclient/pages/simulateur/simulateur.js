/**
 * @file Fichier permettant de faire le lien entre le webclient et le simulateur
 */
//"use strict"; Utile ?

angular.module('app').controller('SimulateurCtrl', ['$rootScope', '$scope', 'Client', 'Simulateur',
	function ($rootScope, $scope, Client, Simulateur) {
		$rootScope.act_page = 'simulateur';
		Simulateur.controllerSimu = new Controller("3dobjects.json", "../simulateur/");
		Simulateur.controllerSimu.createRenderer();
		Simulateur.controllerSimu.loadParameters();
		$scope.pos_pr = new Position();
		$scope.rot_pr = new Position();
		$scope.pos_gr = new Position();
		$scope.rot_gr = new Position();
		$scope.vueDeFace = function () { Simulateur.controllerSimu.selectView("front"); }
		$scope.vueDeDessus = function () { Simulateur.controllerSimu.selectView("top"); }
		$scope.vueDeDerriere = function () { Simulateur.controllerSimu.selectView("behind"); }
		$scope.vueDeGauche = function () { Simulateur.controllerSimu.selectView("left"); }
		$scope.vueDeDroite = function () { Simulateur.controllerSimu.selectView("right"); }
		$scope.iaJack = function () { Client.send("ia", "ia.jack"); }
		$scope.iaPlacerPr = function () { Client.send("ia", "pr.placer"); }
		$scope.iaCollisionPr = function () { Client.send("ia", "pr.collision"); }
		$scope.iaStop = function () { Client.send("ia", "ia.stop"); }

		Simulateur.updateInterface = function () {
			$scope.pos_pr = Simulateur.controllerSimu.objects3d.get("pr_jaune").position;
			$scope.rot_pr = Simulateur.controllerSimu.objects3d.get("pr_jaune").rotation;
			$scope.pos_gr = Simulateur.controllerSimu.objects3d.get("gr_jaune").position;
			$scope.rot_gr = Simulateur.controllerSimu.objects3d.get("gr_jaune").rotation;
		}
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
 * @param {Object} data_robot Data for the PR sent by the IA
 * @param {Number} data_robot.x
 * @param {Number} data_robot.y
 * @param {Number} data_robot.a
 * @param {Array<Number>} data_robot.path
 * @param {Object} Simulateur
 * @param {String} type Type de Robot
 */
function updatePr(data_robot, Simulateur, type) {
	if (data_robot.x && Simulateur.controllerSimu.objects3d.has(type + "_jaune")) {
		act_pos = convertPosNew(data_robot);
		position = new Position(act_pos.x, 0, act_pos.z);
		position.roundAll(-3);
		rotation = new Position(0, data_robot.a, 0);
		rotation.roundAll(-2);
		Simulateur.controllerSimu.objects3d.get(type + "_jaune").updateParams({
			pos: position,
			rotation: rotation
		});
		if(data_robot.path)
			updatePath(data_robot.path, Simulateur, type + "_jaune");
		Simulateur.updateInterface();
	}
}
/**
 * Met à jour le chemin du robot
 * 
 * @param {Array<Number>} path 
 * @param {Object} Simulateur 
 * @param {String} robot 
 */
function updatePath(path, Simulateur, robot)
{
	if(path.length <= 1) // Impossible de tracer une ligne si on n'a pas au moins 2 points
		return;
	var PATH_HIGHT = 0.1;
	Simulateur.controllerSimu.objects3d.get(robot).showPath(
		path.map( (pos) => {
			act_pos = convertPosNew({x: pos[0], y: pos[1]});
			return new Position(act_pos.x, PATH_HIGHT, act_pos.z);
		})
	);
	Simulateur.controllerSimu.scene.add(Simulateur.controllerSimu.objects3d.get(robot).pathLine);
}

angular.module('app').service('Simulateur', ['$rootScope', 'Client', function ($rootScope, Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if (name == 'simulateur' && $rootScope.act_page == 'simulateur') {
				// Met à jour le pr (s'il existe)
				updatePr(data.robots.pr, this, "pr");
				// Met à jour le gr (s'il existe)
				updatePr(data.robots.gr, this, "gr");
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
