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
	}
}

module.exports = Gr;