/**
 * Others module
 * 
 * @module clients/pr/others
 * @see {@link clients/pr/others.Others}
 */

module.exports = (function () {
	var logger = require('log4js').getLogger('Others');

	/**
	 * Others Constructor
	 * 
	 * @exports clients/pr/others.Others
	 * @constructor
	 * @param {Object} sp Server port
	 * @param {Object} sendStatus
	 * @param {clients/shared/fifo.Fifo}
	 */
	function Others(sp, sendStatus, fifo) {
		/** @type {Object} */
		this.sp = sp;
		// this.client = client;
		/** @type {boolean} */
		this.ready = true;
			logger.debug(sendStatus);
		/** @type {Object} */
		this.sendStatus = sendStatus;
		/** @type {clients/shared/fifo.Fifo} */
		this.fifo = fifo;

		this.sp.on("data", function(data){
			if(this.ready === false){
				this.ready = true;
				this.sendStatus();
			}
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			logger.debug(data.toString());
		});
		this.sp.on("close", function(){
			this.ready = false;
			this.sendStatus();
			logger.error("Serial port close");
		}.bind(this));
	}

	/**
	 * Parse command
	 * 
	 * @param {string} data
	 */
	Others.prototype.parseCommand = function(data) {
		if(this.order_sent == data) {
			this.order_sent = '';
			setTimeout(function() {
				this.callback();
				this.fifo.orderFinished();
			}.bind(this), this.callback_delay);
		} else {
			logger.warn("Arduino others unknown: "+data+" (order_sent : "+this.order_sent+")");
		}
	};

	/**
	 * Send command
	 * 
	 * @param {Object} [callback]
	 * @param {string} cmd
	 * @param {string} args
	 * @param {int} callback_delay
	 */
	Others.prototype.sendCommand = function(callback, cmd, args, callback_delay){
		if(callback === undefined) {
			callback = function(){};
		}

		this.fifo.newOrder(function() {
			this.callback = callback;
			this.callback_delay = callback_delay;
			this.order_sent = cmd;

			//logger.debug([cmd].concat(args).join(";"));
			this.sp.write([cmd].concat(args).join(";")+"\n");
		}.bind(this), 'sendCommandOther('+cmd+':'+args+')');
	};

	/**
	 * Fermer stabilisateur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.fermerStabilisateur = function(callback, time) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'H', [100, 23], time);
	};

	/**
	 * Ouvrir stabilisateur moyen
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.ouvrirStabilisateurMoyen = function(callback, time) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'H', [90, 30], time);
	};

	/**
	 * Ouvrir stabilisateur grand
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.ouvrirStabilisateurGrand = function(callback, time) {
		if (time === undefined) {
			time = 400;
		}
		this.sendCommand(callback, 'H', [40, 80], time);
	};

	/**
	 * Fermer bloqueur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.fermerBloqueur = function(callback, time) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'M', [32, 68], time);
	};

	/**
	 * Ouvrir bloqueur moyen
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.ouvrirBloqueurMoyen = function(callback, time) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'M', [66, 29], time);
	};

	/**
	 * Ouvrir stabilisateur grand
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.ouvrirBloqueurGrand = function(callback, time) {
		if (time === undefined) {
			time = 400;
		}
		this.sendCommand(callback, 'M', [106, 1], time);
	};

	/**
	 * Prendre gobelet
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.prendreGobelet = function(callback, time) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'G', [115], time);
	};

	/**
	 * Lacher gobelet
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.lacherGobelet = function(callback, time) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'G', [50], time);
	};

	/**
	 * Sortir Clap
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.sortirClap = function(callback, time) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'C', [130], time);
	};

	/**
	 * Ranger Clap
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.rangerClap = function(callback, time) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'C', [40], time);
	};

	/**
	 * Monter ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.monterAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-250], time);
	};

	/**
	 * Monter un peu ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.monterUnPeuAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-30], time);
	};

	/**
	 * Descendre un peu ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.descendreUnPeuAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [30], time);
	};

	/**
	 * Monter moyen ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.monterMoyenAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-60], time);
	};

	/**
	 * Descendre un peu ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.descendreMoyenAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [60], time);
	};

	/**
	 * Relacher ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.relacherAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [0], time);
	};

	/**
	 * Descendre ascenseur
	 * 
	 * @param {Object} callback
	 * @param {int} [time]
	 */
	Others.prototype.descendreAscenseur = function(callback, time) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(function() {
		this.relacherAscenseur(callback);
		}.bind(this), 'S', [250], time);
	};

	return Others;
})();
