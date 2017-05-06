/**
 * Module du canon à balles
 * 
 * @module clients/Extension/canon
 * @requires module:clients/Extension/extension
 * @requires module:clients/Extension/Actuators/servo
 */

"use strict";

const Extension = require('./extension.class.js');
var servos = require ("./Actuators/servo.class.js");

/**
 * Classe définissant le canon
 * 
 * @class Canon
 * @memberof module:clients/Extension/canon
 * @extends {clients/Extension/extension.Extension}
 */
class Canon extends Extension {
    constructor(){
        super ("canon");
        this.servos = servos;
    }

    processFifoOrder (name, param) {
        this.logger.info ("Order received: " + name);
        switch (name) {
            case "turn_on":
                this.fifo.orderFinished();
                break;
            case "turn_off":
                this.fifo.orderFinished();
                break;

            default:
                this.logger.error ("Order " + name + " does not exist!");
                this.fifo.orderFinished();
        }
    }

    stop () {
        this.servos.stop();
        super.stop();
    }
}

module.exports = Canon;