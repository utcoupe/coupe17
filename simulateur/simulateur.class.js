module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('simulateur');

	function Simulateur() {
		// Toutes les données sur la position/rotation des différents robots/objets
		// préfixé par "e" pour tout ce qui concerne l'ennemi
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

	Simulateur.prototype.foo = function () {

	};
	
	return Gr;
})();