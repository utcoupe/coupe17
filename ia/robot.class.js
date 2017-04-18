/**
 * Module de component robot générique de l'IA
 *
 * @module ia/robot
 */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('ia.robot');

/**
 * Robot générique de l'IA
 *
 * @class Robot
 * @memberof module:ia/robot
 */
class Robot{
	constructor(ia, color){
		/** IA */
		this.ia = ia;

		/** Robot name (pr or gr) */
		this.name = "";

		/** Position */
		this.pos = { // if we are yellow, default, left side of the table
			x: 0,
			y: 0,
			a: 0
		};

		/** Initial position */
		this.initialPos = {
			x: 0,
			y: 0,
			a: 0,
		}

		/** Size of the robot, to be initialized */
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};

		/** Current action */
		this.current_action = null;

		/** Path */
		this.path = [];

		/** Content, to be initialized */
		this.content = {};

		/** We have hats on the top */
		this.we_have_hats = false;
		
		/** Team color */
		this.color = color;

		/** Robot actions */
		this.actions = null;
		this.Actions = require('./actions.class.js');
	}

	detectCollision(){
		let collision = false;
		
		logger.debug("TODO: detect collision");
		// var pf = this.path;
		// var minDist;
		// // for each path segment
		// var complete_path = [this.pos].concat(this.path);
		// for (var i = 0; i < complete_path.length-1 && !collision; (i++) ) {
		// 	var segment = [complete_path[i], complete_path[i+1]]; // so segment[0][0] is the x value of the beginning of the segment
		// 	var segLength = this.getDistance({x:segment[0].x , y:segment[0].y }, {x:segment[1].x , y:segment[1].y });
		// 	var nthX = (segment[1].x-segment[0].x)*SEGMENT_DELTA_D/segLength; // segment X axis length nth 
		// 	var nthY = (segment[1].y-segment[0].y)*SEGMENT_DELTA_D/segLength;

		// 	// for each X cm of the segment
		// 	for (var j = 0; (j*SEGMENT_DELTA_D) < segLength && !collision; (j++)) {

		// 		var segPoint = {
		// 			x: segment[0].x + nthX*j,
		// 			y: segment[0].y + nthY*j
		// 		};

		// 		// distance to each estimated position of the ennemi robots
		// 		minDist = 10000;//this.getDistance(dots[0], segPoint);

		// 		for(var k = 0; k < dots.length; k++) {
		// 			var tmp = this.getDistance(dots[k], segPoint);
		// 			if (tmp < minDist) {
		// 				minDist = tmp;
		// 			}
		// 		}

		// 		// if one of the dist < security diameter, there will be a collision
		// 		if (minDist < 450) {
		// 			collision = true;
		// 		}
				
		// 	}
		// }

		if (collision) {
			this.onCollision();
		}
	}

	onCollision() {
		logger.debug("TODO: collision handler");

		logger.info('Collision');
		this.path = [];
		this.ia.client.send(this.name, "collision");

		this.actions.collision();
		this.loop();
	}

	/**
	 * Start
	 */
	start () {
		// this.ia.client.send(this.name, "ouvrir_ax12");
		this.loop();
	}

	/**
	 * Loop
	 */
	loop () {
		// Called every time we have finished an action
		logger.debug(this.name + ' doing next action');
		this.actions.doNextAction(function() {
			this.loop();
		}.bind(this));
	}

	/**
	 * Pause
	 */
	pause () {
		logger.debug("TODO: pause robots (collision OR stop order ???)");
		this.path = [];
		this.ia.client.send(this.name, "collision");
		this.actions.collision();
	}

	/**
	 * Resume
	 */
	resume () {
		logger.debug("TODO: resume robots");
		this.loop();
	}

	/**
	 * Stop
	 */
	stop () {
		// logger.debug("Closing " + this.name);
		this.ia.client.send(this.name, 'stop');
	}


	/**
	 * Send initial position
	 */
	sendInitialPos () {
		this.ia.client.send(this.name, "setpos", {
			x: this.initialPos.x,
			y: this.initialPos.y,
			a: this.initialPos.a,
			color: this.color
		});

		logger.debug("TODO: send init sequence of movements");
	};


	/**
	 * Update the received position
	 */
	onPos (params) {

		function borne(x, min, max) {
			return x > max ? max : x < min ? min : x;
		}

		params.x = borne(params.x, 0, 3000);
		params.y = borne(params.y, 0, 2000);
		this.pos = params;
	};


	/**
	 * On message, try to treat it. If not possible, let the child class deal with it
	 */
	parseOrder (from, name, params) {
		var orderNameParts = name.split('.');
		var name = orderNameParts.shift();
		var orderSubname = orderNameParts.join('.');

		switch(name) {
			case 'collision':
				// Manual collision
				this.collision();
			break;
			case 'pos':
				// Asserv told us our position
				this.onPos(params);
			break;
			case 'getinitpos':
				// Robot si asking its initial position
				this.sendInitialPos();
			break;
			// case 'placer':
			// 	this.place();
			// break;
			case 'actions':
				this.actions.parseOrder(from, orderSubname, params);
			break;
			default:
				return false; // we have treated this message, let the child class deal with it
			break;
		}

		return true; // we correctly treated this message
	};
}

module.exports = Robot;