/**
 * Servos module
 * 
 * @module clients/gr/servos
 * @see {@link clients/gr/servos.Servos}
 * @see module:clients/gr/servos-simu
 */

module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.servos');
	var five = require("johnny-five");
	/** @type {Object} */
	var board = null;
	/** @type {Object} */
	var servo_gauche, servo_droit;

	/**
	 * Servos Constructors
	 * 
	 * @exports clients/gr/servos.Servos
	 * @constructor
	 * @param {string} sp Server port
	 * @param {Object} sendStatus
	 */
	function Servos(sp, sendStatus) {
		/** @type {boolean} */
		this.ready = false;
		/** @type {Object} */
		this.sendStatus = sendStatus;
		this.connect(sp);
	}

	/**
	 * Connect
	 * 
	 * @param {string} sp Server port
	 */
	Servos.prototype.connect = function(sp) {
		board = new five.Board({
			port: sp,
			repl: false
		});

		board.on("ready", function() {
			logger.info("Board servos Ready");
			servo_gauche = new five.Servo(2);
			servo_droit = new five.Servo(3);
			this.ready = true;
			this.sendStatus();
			this.acheter();
		}.bind(this));
	};

	/**
	 * Acheter
	 * 
	 * @param {Object} callback
	 */
	Servos.prototype.acheter = function(callback) {
		servo_gauche.to(170);
		servo_droit.to(0);
		setTimeout(callback, 500);
	};
	/**
	 * Vendre
	 * 
	 * @param {Object} callback
	 */
	Servos.prototype.vendre = function(callback) {
		servo_gauche.to(50);
		servo_droit.to(120);
		setTimeout(function(){ // remontée lente
			servo_gauche.to(100, 1000);
			servo_droit.to(70, 1000);
		}, 500);
		setTimeout(function(){
			servo_gauche.to(50);
			servo_droit.to(120);
		}, 2000);
		setTimeout(function(){ // remontée lente
			servo_gauche.to(100, 1000);
			servo_droit.to(70, 1000);
		}, 2500);
		setTimeout(function(){
			servo_gauche.to(50);
			servo_droit.to(120);
		}, 4000);
		setTimeout(callback, 6000);
	};

	return Servos;
})();