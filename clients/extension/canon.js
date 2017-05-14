/**
 * Module du canon à balles
 * 
 * @module clients/Extension/canon
 * @requires module:clients/Extension/extension
 * @requires module:clients/Extension/Actuators/servo
 */

"use strict";

const Extension = require('./extension');
var servos = require('../actuators/servo');

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

    takeOrder(from, name, params) {
        this.logger.info ("Order received: " + name);
        switch (name) {
            case "throw_balls":
                this.fifo.order (() => {
                    this.processFifoOrder("turn_on", params);
                });
                setTimeout(() => {
                    this.fifo.order_in_progress (() => {
                        this.processFifoOrder("turn_off", params);
                    });
                });
                break;

            case "engage_ball":
            case "turn_off":
            case "turn_on":
                this.fifo.newOrder(() => {
                    this.processFifoOrder (name, params);
                });
                break;
            
            default:
                this.logger.error ("Order " + name + "does not exist!");
        }
    }

    processFifoOrder (name, param) {
        this.logger.info ("Executing order: " + name);
        switch (name) {
            case "turn_on":
                // TODO turn on motors
                this.fifo.orderFinished();
                break;
            case "turn_off":
                // TODO turn off motors
                this.fifo.orderFinished();
                break;
            
            case "engage_ball":
                // TODO something
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