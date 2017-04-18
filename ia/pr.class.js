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
		if (super.parseOrder(from, name, params)) { return; }
		var orderNameParts = name.split('.');
		var name = orderNameParts.shift();
		var orderSubname = orderNameParts.join('.');

		switch(name) {
			case 'module++':
				this.content.nb_modules += 1;
			break;
			case 'module--':
				this.content.nb_modules -= 1;
			break;
			default:
				logger.warn('Unknown order in ia.pr: '+name);
			break;
		}
	};
}

module.exports = Pr;