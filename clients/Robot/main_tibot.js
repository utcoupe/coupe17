/**
 * Main module
 *
 * @module clients/pr/main
 * @requires server/socket_client
 * @requires config
 * @requires clients/pr/actuators
 * @requires clients/pr/detect
 * @requires tibot.class.js
 */

 //In previous version, this "main" was encapsulated by a function (function () {})();

(function () {
	"use strict";

	var Tibot = (require('./tibot.class.js'));

	var tibot = new Tibot('pr');
	//tibot.sendChildren(tibot.lastStatus);
	tibot.start();
//	tibot.logger('Started tibot');

	// On message
	tibot.client.order(function (from, name, params){
		// logger.info("Recieved an order "+name);
		switch (name){
			case "collision":
				tibot.queue = [];
				tibot.acts.clean();
				tibot.orderInProgress = false;
			break;
			case "stop":
				tibot.acts.clean();
				tibot.logger.fatal("Stop " + tibot.robotName);
				process.exit();
			break;

			// useless //
			case "start":
				tibot.queue = [];
				tibot.start();
			break;
			default:
				tibot.addOrder2Queue(from, name, params);
		}
	});

	//tibot.logger('ENDED tibot');
})();
