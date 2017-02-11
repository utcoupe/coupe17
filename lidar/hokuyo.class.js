/**
 * Hokuyo module
 * 
 * @module ia/hokuyo
 * @see ia/hokuyo.Hokuyo
 */

module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	// var gaussian = require('gaussian');
	var logger = log4js.getLogger('lidar.hokuyo');

	var CONST = 0; // 

	/**
	 * Hokuyo Constructor
	 * 
	 * @exports ia/hokuyo.Hokuyo
	 * @constructor
	 * @param {Object} ia IA
	 * @param {Object} [params] Parameters
	 */
	function Hokuyo() {
	}

	/**
	 * Starts the hokuyo
	 */
	Hokuyo.prototype.test = function () {
	};

	return Hokuyo;
})();