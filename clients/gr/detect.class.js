module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.detect');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var sp = [];

	function Detect(callback) {
		this.devicesFound = {
			asserv: null,
			servos: null
		};
		this.callback = callback;
		this.searchArduinos();
	}

	Detect.prototype.sendSP = function (){
		// Sent to acts
		this.callback(this.devicesFound);
	};

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