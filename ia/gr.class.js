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
		if (this.ia.color == "blue") {
			this.initialPos = {
				x: 175,
				y: 175,
				a: 0,
			}
		} else {
			this.initialPos = {
				x: 2825,
				y: 175,
				a: 3.1415,
			}
		}

		this.pos.x = this.initialPos.x;
		this.pos.y = this.initialPos.y;
		this.pos.a = this.initialPos.a;

		/** This robot content */
		this.content = {
			balls: false
		};

		/** Robot actions */
		this.actions = new (this.Actions)(this.ia, this);
	}

	funnyAction () {
		logger.info("Doing funny action, Mars, here we are ! Yeeaahh !");
		this.ia.client.send(this.name, 'collision');		// ask to stop + flush queues
		this.ia.client.send(this.name, "funny_action");
	}
	
	parseOrder (from, name, params) {
		if (super.parseOrder(from, name, params)) { return; }
		var orderNameParts = name.split('.');
		var name = orderNameParts.shift();
		var orderSubname = orderNameParts.join('.');

		switch(name) {
			// case 'module++':
			// 	this.content.nb_modules += 1;
			// break;
			// case 'module--':
			// 	this.content.nb_modules -= 1;
			// break;
			default:
				logger.warn('Unknown order in ia.pr: '+name);
			break;
		}
	};
}

module.exports = Gr;