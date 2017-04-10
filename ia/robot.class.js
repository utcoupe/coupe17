/**
 * Module de component robot générique de l'IA
 *
 * @module ia/robot
 */

"use strict";

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

		/** Position */
		this.pos = { // if we are yellow, default, left side of the table
			x: 0,
			y: 0,
			a: 0
		};

		/** Size of the robot */
		this.size = {
			l: 170,
			L: 220,
			d: 280
		};

		/** Current action */
		this.current_action = null;

		/** Path */
		this.path = [];

		/** Content */
		this.content = {
			nb_plots: 0,
			gobelet:false
		};

		/** We have hats on the top */
		this.we_have_hats = false;
		
		/** Team color */
		this.color = color;
	}
}

module.exports = Robot;