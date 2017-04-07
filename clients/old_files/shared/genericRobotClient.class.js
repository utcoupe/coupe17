module.exports = (function () {
	"use strict";

	function GenericRobotClient(robotName) {
		// Requires

		this.logger = require('log4js').getLogger(robotName);

		// logger.info("Started NodeJS client with pid " + process.pid);


		this.SocketClient = require('../../server/socket_client.class.js');
		this.server = require('../../config.js').server;

		this.client = new SocketClient({
			server_ip: server;
			type: robotName;
		});

		sendChildren(lastStatus);

		this.acts = new (require('./actuators.class.js'))(client, sendChildren);
		this.detect = null;

		this.queue = [];
		this.orderInProgress = false;

		start();

		// On message
		this.client.order(function (from, name, params){
			switch (name){
			case "collision":
				this.queue = [];
				this.acts.clean();
				this.orderInProgress = false;
			break;
			case "stop":
				this.acts.clean();
				this.logger.fatal("Stop Robot");
				process.exit();
			break;

			// useless //
			case "start":
				this.queue = [];
				start();
			break;
			default:
				addOrder2Queue(from, name, params);
		}
		});
	}

	/**
	 * Start the Robot
	 */
	GenericRobotClient.prototype.start = function(){
		this.logger.info("Starting  :)");
		sendChildren({
			status: "starting", 
			children:[]
		});
		this.detect = new (require('./detect.class.js'))(devicesDetected);
	}

	/**
	 * Stops the robot
	 */
	GenericRobotClient.prototype.stop = function(){
		this.acts.quit();

		// Send struct to server
		sendChildren({
			status: "waiting", 
			children:[]
		});
	}

	return GenericRobotClient;
})();