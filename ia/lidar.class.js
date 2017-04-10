/**
 * Module de component lidar de l'IA
 *
 * @module ia/lidar
 */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('ia.lidar');
const EventEmitter = require('events');

/**
 * Lidar mng de l'IA
 *
 * @class Lidar
 * @memberof module:ia/lidar
 */
class Lidar {

	constructor(ia, params) {
		class Events extends EventEmitter{}
		this.events = new Events();

		/** Parameters */
		this.params = params || {};
		/** Number of hokuyo */
		this.nb_hokuyo = 0;
		/** IA */
		this.ia = ia;
		/** Dernier timestamp où on a update (changé à la fin de l'update) */
		this.lastNow = 0;

		/** nb d'itération depuis laquelle on a perdu un robot */
		this.nb_lost = 0;

		logger.debug("TODO: hokuyo, adapt to LiDAR data");
		logger.debug("TODO: hokuyo, adapt to new robot inheritance");
	}

	/**
	 * Starts the hokuyo
	 */
	start() {
		logger.info("La classe hokuyo a besoin d'infos de LiDAR...");
		// this.ia.client.send("hokuyo", "start", {color:this.params.color}); // must have been already done

		logger.debug("TODO: hokuyo, keep track of living hokuyos according to data coming from LiDAR");
		// timeout = setTimeout(function() {this.timedOut(); }.bind(this) , LOST_TIMEOUT*1000);
	};

	/**
	 * Stops the Hokuyo
	 */
	stop() {
		this.ia.client.send("hokuyo", "stop", {});
		clearTimeout(timeout);
	};

	/**
	 * Timed out
	 */
	timedOut() {
		this.mayday("Hokuyo timed out");
	};

	mayday(reason){
		logger.warn("TODO Lidar: throw status using events");
		logger.error("Mayday called, the given reason is :");
		logger.error(reason);
		this.emit("stopAll", reason);
		this.emit("stopGr", reason);
		this.emit("stopPr", reason);
	}

	/**
	 * Parse Order
	 * 
	 * @param {string} from
	 * @param {string} name
	 * @param {Object} params
	 */
	parseOrder(from, name, params) {
		switch (name){
			case "all":
				this.updatePos(params.dots);
				break;
			case "status":
				this.updateNumberOfRobots(params.nb);
				break;
			default:
				logger.warn("Message name " + name + " not understood");
		}
	};
}

module.exports = Lidar;