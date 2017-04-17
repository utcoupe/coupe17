/**
 * Module du petit robot de l'IA
 *
 * @module ia/pr
 * @requires module:ia/robot
 */

"use strict";

const Robot = require('./robot.class.js');

const log4js = require('log4js');
const logger = log4js.getLogger('ia.pr');

/**
 * Petit Robot dans l'IA
 *
 * @class Pr
 * @memberof module:ia/pr
 * @extends {ia/robot.Robot}
 */
class Pr extends Robot{

	constructor(ia, color){
		super(ia, color);

		/** Robot name */
		this.name = "pr";

		/** Size of the robot */
		this.size = {
			l: 170,
			L: 220,
			d: 280
		};

		/** Initial position */
		this.initialPos = {
			x: 142,
			y: 1000,
			a: 0,
		}

		/** This robot content */
		this.content = {
			nb_modules: 0
		};

		/** Robot actions */
		this.actions = new (this.Actions)(this.ia, this);
	}

	// /**
	//  * Place
	//  */
	// place  () {
	// 	// logger.debug('place');
	// 	this.sendInitialPos();
	// 	this.ia.client.send('pr', 'placer');
	// };


	parseOrder (from, name, params) {
		var orderNameParts = name.split('.');
		var name = orderNameParts.shift();
		var orderSubname = orderNameParts.join('.');

		function borne(x, min, max) {
			return x > max ? max : x < min ? min : x;
		}

		switch(name) {
			case 'collision':
				// Manual collision
				this.collision();
			break;
			// Asserv
			case 'pos':
				params.x = borne(params.x, 0, 3000);
				params.y = borne(params.y, 0, 2000);
				this.pos = params;
			break;
			case 'getinitpos':
				this.sendInitialPos();
			break;
			// case 'placer':
			// 	this.place();
			// break;
			case 'module++':
				this.content.nb_modules += 1;
			break;
			case 'module--':
				this.content.nb_modules -= 1;
			break;
			case 'actions':
				this.actions.parseOrder(from, orderSubname, params);
			break;
			default:
				logger.warn('Unknown order in ia.pr: '+name);
		}
	};
}

module.exports = Pr;