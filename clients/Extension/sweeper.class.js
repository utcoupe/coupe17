/**
 * Module de la balayeuse
 * 
 * @module clients/Extension/sweeper
 * @requires module:clients/Extension/extension
 * @requires module:clients/Extension/Actuators/servo
 */

"use strict";

const Extension = require('./extension.class.js');
var servos = require('./Actuators/servo.class.js');

/**
 * Classe définissant la balayeuse
 * 
 * @class Sweeper
 * @memberof module:clients/Extension/sweeper
 * @extends {clients/Extension/extension.Extension}
 */
class Sweeper extends Extension {
    constructor(){
        super ("sweeper");
        this.servos = servos;
    }

    processFifoOrder (name, param) {
        this.logger.info("Order received: " + name);
        switch (name) {
            default:
                this.logger.error("Order " + name + " does not exist!");
        }
    }

    stop () {
        this.servos.stop();
        super.stop();
    }
}

module.exports = Sweeper;