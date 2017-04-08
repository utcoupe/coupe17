/**
 * Classe implémentant l'asservissement en mode réel.
 * 
 * @module clients/Asserv/AsservReal
 * @requires module:clients/Asserv/Asserv
 */

const Asserv = require('Asserv.class.js');

/**
 * Classe implémentant l'asservissement en mode réel
 * 
 * @memberof module:clients/Asserv/AsservReal
 * @extends {clients/Asserv/Asserv.Asserv}
 */
class AsservReal extends Asserv{
	constructor(sp, client, who, sendStatus, fifo){
		super(client, who, fifo);
		this.COMMANDS = require('./defineParser.js')('./arduino/asserv/protocol.h');
		this.DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable
		this.ready = true;
		this.sendStatus = sendStatus;
		this.currentId = 0;
		this.color = "yellow";

		this.sp.on("data", function(data){
			if(this.ready === false){
				this.ready = true;
				this.sendStatus();
			}
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			this.ready = false;
			this.sendStatus();
			logger.debug("error", data.toString());
		}.bind(this));
		this.sp.on("close", function(data){
			this.ready = false;
			this.sendStatus();
			logger.error("Serial port close");
		}.bind(this));

		setTimeout(function() {
			this.getPos();
		}.bind(this), 2000);
	}
}

module.exports = AsservReal;