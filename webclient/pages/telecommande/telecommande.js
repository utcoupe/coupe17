angular.module('app').controller('TelecommandeCtrl', ['$rootScope', '$scope', 'Client',
	function($rootScope, $scope, Client) {
	$rootScope.act_page = 'telecommande';

	// ********************************* GIT *********************************
	$scope.prSyncGit = function() {
		Client.send("pr", "sync_git");
	}

	$scope.hokSyncGit = function() {
		Client.send("hokuyo", "sync_git");
	}

	$scope.serverSyncAllGit = function() {
		Client.send("server", "server.sync_all_git");
	}

	$scope.serverFlashArduinos = function() {
		Client.send("server", "server.flash_arduinos");
	}

	// ******************************** Match ********************************
	$scope.iaJack = function() {
		Client.send("ia", "ia.jack");
	}

	$scope.iaStop = function() {
		Client.send("ia", "ia.stop");
	}

	// ******************************** Tibot ********************************
	if (!$scope.tibot)
		$scope.tibot = new TibotDisplay("pr", Client);

	// ******************************** Grobot ********************************
	if (!$scope.grobot)
		$scope.grobot = new GrobotDisplay("gr", Client);

	// ******************************** Hokuyo ********************************
	$scope.hokuyo = {};

	$scope.hokuyo.nbRobots = 4;
	$scope.hokuyo.couleur = "green";
	
	$scope.hokuyo.start = function() {
		Client.send("hokuyo", "start", {
			"color": $scope.hokuyo.couleur,
			"nbrobots": $scope.hokuyo.nbRobots
		});
		console.log("Message `start` sent");
	};

	$scope.hokuyo.stop =  function() {
		Client.send("hokuyo", "stop", {});
		console.log("Message `stop` sent");
	}
}]);
