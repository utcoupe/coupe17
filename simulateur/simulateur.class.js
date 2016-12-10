/**
 * Simulateur module
 * 
 * @module simulateur/simulateur
 * @requires log4js
 * @see {@link simulateur/simulateur.Simulateur}
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('simulateur');

	/**
	 * Simulateur constructor
	 * 
	 * @exports simulateur/simulateur.Simulateur
	 * @constructor
	 */
	function Simulateur() {
		/**
		 * Toutes les données sur la position/rotation des différents robots/objets<br/>
		 * préfixé par "e" pour tout ce qui concerne l'ennemi
		 * 
		 * @type {{color: string, ecolor: string, pr: Array, gr: Array, epr: Array, egr: array, plots: Array, eplot: Array}}
		 */
		this.data = {
			color: "yellow",
			ecolor: "green",
			pr: {}, gr: {},
			epr: {}, egr: {},
			plots: {}, eplots: {},
			gobelets: {},
			popcorn: {}
		};
	}

	/**
	 * foo
	 */
	Simulateur.prototype.foo = function () {

	};
	
	return Gr;
})();