/**
 * Detect module
 * 
 * @module clients/pr/detect
 * @see {@link clients/pr/detect.Detect}
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
	 * @exports clients/pr/detect.Detect
	 * @constructor
	 * @param {Object} callback
	 */
	function Detect(callback) {
		/** @type {Object} */
		this.devicesFound = {
			asserv: null,
			others: null,
			ax12: null
		};
		/** @type {Object} */
		this.callback = callback;
		this.searchArduinos();
	}

	/**
	 * Sends Server port
	 */
	Detect.prototype.sendSP = function (){
		// Close opened ports & detect other devices
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				if(ports[i].comName.indexOf('ttyUSB') >= 0) {
					this.devicesFound.asserv = ports[i].comName;
				} else if((ports[i].comName.indexOf('ttyACM') >= 0) && ports[i].comName != this.devicesFound.others) {
					// logger.debug(ports[i].comName);
					this.devicesFound.ax12 = ports[i].comName;
				}
				if(sp[i].readable){
					logger.info("Closing  "+ports[i].comName);
					// this.devicesFound.ax12 = ports[i].comName;
					sp[i].close();
				}
			}

			// Sent to acts
			this.callback(this.devicesFound);
		}.bind(this));
	};

	/**
	 * Searches Arduino
	 */
	Detect.prototype.searchArduinos = function() {
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			var nb_found = 0;
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName, { baudrate: 57600 });
				sp[i].on('open', function (i) {
					sp[i].write('O\n');
				}.bind(this, i));

				sp[i].on("data", function (i, data) {
					data = data.toString();
					console.log(ports[i].comName, data);
					if (data == 'O' && !this.devicesFound.others){ // Stepper
						this.devicesFound.others = ports[i].comName;
						clearTimeout(timeout);
						this.sendSP();
					}
					sp[i].close();
				}.bind(this, i));

				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));

		// On check tous les ports qui ne sont pas enregistrés
		timeout = setTimeout(function(){this.sendSP(); }.bind(this), 3000);
	};

	return Detect;
})();