/**
 * Module de component lidar de l'IA
 *
 * @module ia/lidar
 */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('ia.lidar');
const EventEmitter = require('events');

const SILENCE_TIMEOUT = 500;					// ms

/**
 * Lidar mng de l'IA
 *
 * @class Lidar
 * @memberof module:ia/lidar
 */
class Lidar {

	constructor(ia, we_have_hats) {
		class Events extends EventEmitter{}
		this.events = new Events();

		/** IA */
		this.ia = ia;
		/** We have */
		this.we_have_hats = we_have_hats;
		/** Number of hokuyo */
		this.nb_hokuyo = 0;
		/** Status of Lidar */
		this.lidar_status = "";
		/** Dernier timestamp où on a update (changé à la fin de l'update) */
		this.last_lidar_data = 0;
		/** */
		this.status_timer = null;

		/** nb d'itération depuis laquelle on a perdu un robot */
		this.nb_lost = 0;

		logger.debug("TODO: hokuyo, adapt to LiDAR data");
		logger.debug("TODO: hokuyo, adapt to new robot inheritance");

		// Status loop
		this.updateStatus();
	}

	updateStatus() {
		clearTimeout(this.status_timer);

		let deltaT = this.ia.timer.get() - this.last_lidar_data;
		if (deltaT > SILENCE_TIMEOUT) {
			this.mayday("Haven't heard Lidar since " + deltaT + "ms", "all");
			// Caution, will spam every 200ms !
		}

		this.status_timer = setTimeout( function(){
			this.updateStatus();
		}.bind(this), 200);
	}

	/**
	 * Starts the hokuyo
	 */
	start() {
		logger.info("La classe hokuyo a besoin de données de LiDAR...");
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

	mayday(reason, who = "all"){
		logger.warn("TODO Lidar: throw status using events");
		logger.error("Mayday called, the given reason is :");
		logger.error(reason);
		switch (who){
			case "gr":
				this.emit("stopGr", reason);
			break;
			case "pr":
				this.emit("stopPr", reason);
			break;
			default:
				this.emit("stopAll", reason);
			break;
		}
	}

	deleteOurRobots(robots){
		logger.debug("TODO: deleteOurRobots");
		
	}

	onAllSpot(dots){
		var robots = dots.robotsSpots;

		if (this.we_have_hats) {
			robots = this.deleteOurRobots(robots);
		}

		if (this.ia.pr.detectCollision(robots)) {
			mayday("Pr detected collision", "pr");
		}

		if (this.ia.gr.detectCollision(robots)) {
			mayday("Gr detected collision", "gr");
		}
		
		logger.debug("TODO: update last_lidar_data");
		this.last_lidar_data = this.ia.timer.get();

		// Status loop
		this.updateStatus();
	}

	onLidarStatus(params){
		/** Number of hokuyo */
		this.nb_hokuyo = params.nb;
		/** Status of Lidar */
		this.lidar_status = params.status;

		if (this.nb_hokuyo == 0
			|| (this.lidar_status != "ok"
				&& this.lidar_status != "everythingIsAwesome"))
		{
			var reason = "LiDAR status " + this.lidar_status + " with " + this.nb_hokuyo + " active hokuyo(s) doesn't allow us to continue";
			mayday(reason, "all");
		}
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
				this.onAllSpot(params.dots);
				// this.updatePos(params.dots);
				break;
			case "status":
				this.onLidarStatus(params);
				// this.updateNumberOfRobots(params.nb);
				break;
			default:
				logger.warn("Message name " + name + " not understood");
		}
	};
}

module.exports = Lidar;