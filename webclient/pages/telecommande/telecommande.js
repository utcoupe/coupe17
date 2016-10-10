angular.module('app').controller('TelecommandeCtrl', ['$rootScope', '$scope', 'Client',
	function($rootScope, $scope, Client) {
	$rootScope.act_page = 'telecommande';

	// GIT
	$scope.prSyncGit = function() {
		Client.send("pr", "sync_git");
	}

	$scope.hokSyncGit = function() {
		Client.send("hokuyo", "sync_git");
	}

	$scope.serverSyncAllGit = function() {
		Client.send("server", "server.sync_all_git");
	}

	// Arduinos
	$scope.serverFlashArduinos = function() {
		Client.send("server", "server.flash_arduinos");
	}

	// PR Luc
	$scope.prPrendrePlot = function() {
		Client.send("pr", "prendre_plot2");
	}
	$scope.prMonterPlot = function() {
		Client.send("pr", "monter_plot2");
	}
	$scope.prFermerTout = function() {
		Client.send("pr", "fermer_tout");
	}
	$scope.prResetNbPlots = function() {
		Client.send("pr", "reset_nb_plots");
	}

	// IA
	$scope.iaJack = function() {
		Client.send("ia", "ia.jack");
	}

	// GR
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
	// PR
	$scope.pr_pwm_gauche = 50;
	$scope.pr_pwm_droite = 50;
	$scope.pr_pwm_ms = 1000;
	$scope.pr_a = 0;
	$scope.pr_x = 0;
	$scope.pr_y = 0;
	$scope.pr_set_x = 0;
	$scope.pr_set_y = 0;
	$scope.pr_set_a = 0;
	$scope.pr_v = 1500;
	$scope.pr_r = 0.4;
	$scope.pr_PID_P = 0.5;
	$scope.pr_PID_I = 50;
	$scope.pr_PID_D = 10;
	$scope.pr_acc = 750;
	$scope.prPWM = function() {
		Client.send("pr", "pwm", {
			left: $scope.pr_pwm_droite,
			right: $scope.pr_pwm_gauche,
			ms: $scope.pr_pwm_ms
		});
	};
	$scope.prGoa = function() {
		Client.send("pr", "goa", {a: parseFloat($scope.pr_a)*Math.PI/180});
	};
	$scope.prGoxy = function() {
		Client.send("pr", "goxy", {x: parseInt($scope.pr_x), y: parseInt($scope.pr_y)});
	};
	$scope.prGoxya = function() {
		$scope.prGoxy();
		$scope.prGoa();
	};
	$scope.prSetVit = function() {
		Client.send("pr", "setvit", {v: parseInt($scope.pr_v), r: parseFloat($scope.pr_r) });
	};
	$scope.prClean = function() {
		Client.send("pr", "clean");
	};
	$scope.prSetPos = function() {
		Client.send("pr", "setpos", {
			x: parseInt($scope.pr_set_x),
			y: parseInt($scope.pr_set_y), 
			a: parseFloat($scope.pr_set_a)*Math.PI/180
		});
	};
	$scope.prSetPID = function() {
		Client.send("pr", "setpid", {
			p: parseFloat($scope.pr_PID_P),
			i: parseFloat($scope.pr_PID_I), 
			d: parseFloat($scope.pr_PID_D)
		});
	};
	$scope.prSetAcc = function() {
		Client.send("pr", "setacc", { acc: parseInt($scope.pr_acc) });
	};


	$(document).on("click", "#rc_pr_servo", function(e) {
		Client.send("pr", "servo_goto", {
			"servo": $("#rc_pr_numservo").val(),
			"position": parseInt($("#rc_pr_servo_pos").val())});
	});



	$(document).on("click", "#rc_pr_stab_close", function(e) {
		Client.send("pr", "stabs_close", {});
	});

	$(document).on("click", "#rc_pr_stab_chouilla", function(e) {
		Client.send("pr", "stabs_open_chouilla", {});
	});

	$(document).on("click", "#rc_pr_stab_open", function(e) {
		Client.send("pr", "stabs_open", {});
	});

	$(document).on("click", "#rc_pr_arm_close", function(e) {
		Client.send("pr", "arm_close", {});
	});

	$(document).on("click", "#rc_pr_arm_chouilla", function(e) {
		Client.send("pr", "arm_open_chouilla", {});
	});

	$(document).on("click", "#rc_pr_arm_open", function(e) {
		Client.send("pr", "arm_open", {});
	});

	$(document).on("click", "#rc_pr_AX12_close", function(e) {
		Client.send("pr", "AX12_close", {});
	});

	$(document).on("click", "#rc_pr_AX12_open", function(e) {
		Client.send("pr", "AX12_open", {});
	});


	$(document).on("click", "#rc_hok_start", function(e) {
		Client.send("hokuyo", "start", {
			"color": $("#rc_hok_color").val(),
			"nbrobots": parseInt($("#rc_hok_nbrobots").val())});
		console.log("Message `start` sent");
	});

	$(document).on("click", "#rc_hok_stop", function(e) {
		Client.send("hokuyo", "stop", {});
		console.log("Message `stop` sent");
	});


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
