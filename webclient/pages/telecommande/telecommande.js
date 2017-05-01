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
	$scope.tibot = {};

	$scope.tibot.pwm_gauche = 50;
	$scope.tibot.pwm_droite = 50;
	$scope.tibot.pwm_ms = 1000;
	$scope.tibot.a = 0;
	$scope.tibot.x = 0;
	$scope.tibot.y = 0;
	$scope.tibot.set_x = 0;
	$scope.tibot.set_y = 0;
	$scope.tibot.set_a = 0;
	$scope.tibot.v = 1500;
	$scope.tibot.r = 0.4;
	$scope.tibot.PID_P = 0.5;
	$scope.tibot.PID_I = 50;
	$scope.tibot.PID_D = 10;
	$scope.tibot.acc = 750;

	$scope.tibot.selectedServo = "";
	$scope.tibot.posServo = 90;

	$scope.tibot.prendreModule = function() {
		Client.send("pr", "prendre_module");
	}

	$scope.tibot.monterModule = function() {
		Client.send("pr", "monter_module");
	}

	$scope.tibot.deposerModule = function() {
		Client.send("pr", "deposer_module");
	}

	$scope.tibot.resetNbModules = function() {
		Client.send("pr", "reset_nb_modules");
	}

	$scope.tibot.fermerTout = function() {
		Client.send("unit_grabber", "close");
	}

	$scope.tibot.ouvrirTout = function() {
		Client.send("unit_grabber", "open");
	}

	$scope.tibot.clean = function() {
		Client.send("pr", "clean");
	}

	$scope.tibot.stop = function() {
		Client.send("pr", "stop");
	}

	// -------- Asserv --------
	$scope.tibot.PWM = function() {
		Client.send("pr", "pwm", {
			left: $scope.tibot.pwm_droite,
			right: $scope.tibot.pwm_gauche,
			ms: $scope.tibot.pwm_ms
		});
	}

	$scope.tibot.goPos = function() {
		Client.send("pr", "goxy", {
			x: parseInt($scope.tibot.x),
			y: parseInt($scope.tibot.y)
		});
	}

	$scope.tibot.goAngle = function() {
		Client.send("gr", "goa", {
			a: parseFloat($scope.tibot.a)*Math.PI/180
		});
	}

	$scope.tibot.goPosAngle = function() {
		$scope.tibot.goPos();
		$scope.tibot.goAngle();
	}

	$scope.tibot.setVit = function() {
		Client.send("pr", "setvit",{
				v: parseInt($scope.tibot.v),
				r: parseFloat($scope.tibot.r)
		});
	}

	$scope.tibot.setAcc = function() {
		Client.send("pr", "setacc", {
			acc: parseInt($scope.tibot.acc)
		});
	}

	$scope.tibot.setPos = function() {
		Client.send("pr", "setpos", {
			x: parseInt($scope.tibot.set_x),
			y: parseInt($scope.tibot.set_y), 
			a: parseFloat($scope.tibot.set_a)*Math.PI/180
		});
	}

	$scope.tibot.setPID = function() {
		Client.send("pr", "setpid", {
			p: parseFloat($scope.tibot.PID_P),
			i: parseFloat($scope.tibot.PID_I), 
			d: parseFloat($scope.tibot.PID_D)
		});
	}

	// ------ Actuators ------
	$scope.tibot.updateSelectedServo = function () {
		if ($scope.tibot.selectedServo != "") {
			Client.send("pr", "servo_goto", {
				"servo": $scope.tibot.selectedServo,
				"position": $scope.tibot.posServo
			});
		}
	}

	$scope.tibot.fermerStabilisateurs = function () {
		Client.send("pr", "stabs_close", {
		});
	}

	$scope.tibot.ouvrirUnPeuStabilisateurs = function () {
		Client.send("pr", "stabs_open_chouilla", {
		})
	}

	$scope.tibot.ouvrirStabilisateurs = function () {
		Client.send("pr", "stabs_open", {
		});
	}

	$scope.tibot.closeArm = function () {
		Client.send("pr", "arm_close", {
		});
	}

	$scope.tibot.ouvrirUnPeuArm = function () {
		Client.send("pr", "arm_open_chouilla", {
		});
	}

	$scope.tibot.ouvrirArm = function () {
		Client.send("pr", "arm_open", {
		});
	}

	$scope.tibot.closeAx12 = function () {
		Client.send("pr", "AX12_close", {
		});
	}

	$scope.tibot.ouvrirAx12 = function () {
		Client.send("pr", "AX12_open", {
		});
	}

	// ******************************** Grobot ********************************
	$scope.gr_pwm_gauche = 50;
	$scope.gr_pwm_droite = 50;
	$scope.gr_pwm_ms = 1000;
	$scope.gr_a = 0;
	$scope.gr_x = 0;
	$scope.gr_y = 0;
	$scope.gr_v = 500;
	$scope.gr_r = 0.3;
	$scope.grAcheter = function() {
		Client.send("gr", "acheter", {});
	};
	$scope.grVendre = function() {
		Client.send("gr", "vendre", {});
	};
	$scope.grPWM = function() {
		Client.send("gr", "pwm", {
			left: $scope.gr_pwm_droite,
			right: $scope.gr_pwm_gauche,
			ms: $scope.gr_pwm_ms
		});
	};
	$scope.grGoa = function() {
		Client.send("gr", "goa", {a: parseFloat($scope.gr_a)*Math.PI/180});
	};
	$scope.grGoxy = function() {
		Client.send("gr", "goxy", {x: parseFloat($scope.gr_x), y: parseFloat($scope.gr_y)});
	};
	$scope.grGoxya = function() {
		$scope.grGoxy();
		$scope.grGoa();
	};
	$scope.grSetVit = function() {
		Client.send("gr", "setvit", {v: parseInt($scope.gr_v), r: parseFloat($scope.gr_r) });
	};

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


	/*$scope.rc_pr_pos_value = 0.5;
	$scope.rc_pr_AX12_pos = 500;
	$scope.rc_pr_servo1_min = 63;
	$scope.rc_pr_servo1_max = 90;
	$scope.rc_pr_servo2_min = 63;
	$scope.rc_pr_servo2_max = 90;
	$scope.rc_pr_steppers_move = 0;



	$scope.updatePosValue = function (value){
		Client.send("pr", "servo_goto", {
			"servo": $("#rc_pr_numservo").val(),
			"position": parseFloat(value)
		});
		// console.log("Message `servo_goto` " + value + " sent to PR.");
	}

	$scope.prServoClose1 = function (servo1_min, servo2_min){
		Client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_min/180
		});
		Client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_min/180
		});
	}

	$scope.prServoOpen1 = function (servo1_max, servo2_max){
		Client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_max/180
		});
		Client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_max/180
		});
	}

	$scope.prServoClose2 = function (){
		Client.send("pr", "servo_close", {});
	}

	$scope.prServoOpen2 = function (){
		Client.send("pr", "servo_open", {});
	}


	$scope.updateAX12PosValue = function (value){
		Client.send("pr", "AX12_goto", {
			"position": $scope.rc_pr_AX12_pos
		});
	}

	$scope.prAX12Close = function (value){
		Client.send("pr", "AX12_close", {});
	}

	$scope.prAX12Open = function (value){
		Client.send("pr", "AX12_open", {});
	}

	$scope.updateSteppersMoveValue = function (rc_pr_steppers_move){
		var direction = rc_pr_steppers_move<0?"clockwise":"counterclockwise";

		Client.send("pr", "steppers_move", {
			move: Math.abs(rc_pr_steppers_move),
			direction: direction
		});

		$scope.rc_pr_steppers_move = 0;
	};

	$scope.prSteppersToogle = function (){
		Client.send("pr", "steppers_toogle", {});
	};

	$scope.prSteppersSetBottom = function (){
		Client.send("pr", "steppers_set_bottom", {});
	};*/
}]);
