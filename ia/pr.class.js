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
	}
}

module.exports = Pr;