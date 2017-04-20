/**
 * Main module
 *
 * @module clients/pr/main
 * @requires server/socket_client
 * @requires config
 * @requires clients/pr/actuators
 * @requires clients/pr/detect
 * @requires grobot.class.js
 */
(function () {

	"use strict";

	var Grobot = (require('./grobot.class.js'));
  var grobot = new Grobot('gr');
  //grobot.sendChildren(tibot.grobot);

	grobot.start();
  grobot.logger.info('Started grobot');

  // On message
  grobot.client.order(function (from, name, params){
    grobot.logger.info("Recieved an order "+name);
    switch (name){
      case "collision":
        grobot.queue = [];
        grobot.acts.clean();
        grobot.orderInProgress = false;
      break;
      case "stop":
        grobot.acts.clean();
        grobot.logger.fatal("Stop " + grobot.robotName);
        process.exit();
      break;

      // useless //
      case "start":
        grobot.queue = [];
        grobot.start();
      break;
      default:
        grobot.addOrder2Queue(from, name, params);
    }
  });
  grobot.logger.info('Ending of init grobot');
})();
