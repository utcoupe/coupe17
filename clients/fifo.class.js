/**
 * First In First Out module
 * 
 * @module clients/fifo
 */

"use strict";

/**
 * First In First Out class
 * 
 * @memberof module:clients/fifo
 */
class Fifo {

	/**
	 * Construit une nouvelle FiFo vide.
	 */
	constructor() {
		this.logger = require('log4js').getLogger('Fifo');
		this.clean();
	}

	/**
	 * Vide la file et remet order_in_progress à faux
	 */
	clean () {
		/** @type {Array<{callback: function, name: String}>} */
		this.fifo = [];
		/** @type {boolean} */
		this.order_in_progress = false;
	}

	/**
	 * Fonction à appeler lorsque un ordre est terminé. Cette fonction invoque directement l'ordre suivant (si il existe)
	 */
	orderFinished () {
		this.order_in_progress = false;
		this.nextOrder();
	}

	/**
	 * Ajoute un ordre à la file par le biais d'une fonction. Nommer l'ordre ne sert que pour le débuggage.
	 * La fonction invoque automatiquement nextOrder().
	 * 
	 * @param {Object} callback
	 * @param {string} [name]
	 */
	newOrder (callback, name) {
		if (name === undefined)
			name = "";
		this.fifo.push({callback: callback, name: name});
		this.nextOrder();
	}

	/**
	 * Si un ordre n'est pas déjà en cours et si la fifo n'est pas vide,
	 * cette fonction enlève et éxécute la prochaine fonction de la file.
	 */
	nextOrder () {
		if(!this.order_in_progress && this.fifo.length > 0) {
			// logger.debug(this.fifo.length);
			this.order_in_progress = true;
			var object = this.fifo.shift();
			// logger.debug("Calling : "+object.name);
			object.callback();
		}
	}
}

module.exports = Fifo;
