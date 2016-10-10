(function () {
	"use strict";

	// Modules nodejs
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	var color = process.argv[2];
	if(!color) color = null;
	var nb_erobots = process.argv[3];
	if(!nb_erobots) nb_erobots = null;
	var EGR_d = process.argv[4];
	if(!EGR_d) EGR_d = null;
	var EPR_d = process.argv[5];
	if(!EPR_d) EPR_d = null;

	var ia = new (require('./ia.class.js'))(color, nb_erobots, EGR_d, EPR_d);
})();