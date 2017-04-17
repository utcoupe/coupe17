/**
 * Module du grand robot de l'IA
 *
 * @module ia/gr
 * @requires module:ia/robot
 */

"use strict";

const Robot = require('./robot.class.js');

const log4js = require('log4js');
const logger = log4js.getLogger('ia.gr');

/**
 * Grand Robot dans l'IA
 *
 * @class Gr
 * @memberof module:ia/gr
 * @extends {ia/robot.Robot}
 */
class Gr extends Robot{

	constructor(ia, color){
		super(ia, color);
		
		/** Robot name */
		this.name = "gr";

		/** Size of the robot */
		this.size = {
			l: 290,
			L: 290,
			d: 420
		};

		/** Initial position */
		this.initialPos = {
			x: 142,
			y: 1000,
			a: 0,
		}

		/** This robot content */
		this.content = {
			balls: false
		};

		/** Robot actions */
		this.actions = new (this.Actions)(this.ia, this);
	}

	funnyAction () {
		logger.debug("TODO: funny action");
	}
}

module.exports = Gr;