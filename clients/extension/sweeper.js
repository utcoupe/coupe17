/**
 * Module de la balayeuse
 * 
 * @module clients/Extension/sweeper
 * @requires module:clients/Extension/extension
 * @requires module:clients/Extension/Actuators/servo
 */

"use strict";

const Extension = require('./extension');
var servos = require('../actuators/servo');

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

    takeOrder (from, name, param) {
        this.logger.info ("Order received: " + name);
        switch (name) {
            case "smallow_ball":
                this.fifo.newOrder (() => {
                    this.processFifoOrder("smallow_ball", param);
                });
                break;
                
            case "turn_on":
            case "turn_off":
                this.fifo.newOrder (() => {
                    this.processFifoOrder(name, param);
                });
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist!");
        }
    }

    processFifoOrder (name, param) {
        this.logger.info("Executing order " + name);
        switch (name) {
            case "turn_on":
                this.fifo.orderFinished();
                break;
            case "turn_off":
                this.fifo.orderFinished();
                break;
            default:
                this.logger.error("Order " + name + " does not exist!");
                this.fifo.orderFinished();
        }
    }

    stop () {
        this.servos.stop();
        super.stop();
    }
}

module.exports = Sweeper;