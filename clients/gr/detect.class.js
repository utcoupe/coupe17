/**
 * Detect module
 * 
 * @module clients/gr/detect
 * @see {@link clients/gr/detect.Detect}
 */

module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.detect');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var sp = [];

	/**
	 * Detect constructor
	 * 
	 * @exports clients/gr/detect.Detect
	 * @constructor
	 * @param {Object} callback
	 */
	function Detect(callback) {
		/** @type {Object} */
		this.devicesFound = {
			asserv: null,
			servos: null
		};
		/** @type {Object} */
		this.callback = callback;
		this.searchArduinos();
	}

	/**
	 * Send SP
	 */
	Detect.prototype.sendSP = function (){
		// Sent to acts
		this.callback(this.devicesFound);
	};

	/**
	 * Searches Arduino
	 */
	Detect.prototype.searchArduinos = function() {
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				if(ports[i].comName.indexOf('ttyUSB') >= 0) {
					this.devicesFound.servos = ports[i].comName;
				} else if(ports[i].comName.indexOf('ttyACM') >= 0) {
					this.devicesFound.asserv = ports[i].comName;
				}
			}
			this.sendSP();
		}.bind(this));
	};

	return Detect;
})();