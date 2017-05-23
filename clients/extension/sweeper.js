/**
 * Module de la balayeuse
 * 
 * @module clients/Extension/sweeper
 * @requires module:clients/Extension/extension
 * @requires module:clients/Extension/Actuators/servo
 */

"use strict";

const Extension = require('./extension');

class Sweeper extends Extension {
    constructor(){
        super("sweeper");
        this.servos = null;
    }

    takeOrder (from, name, param) {
        this.logger.info ("Order received: " + name);
        switch (name) {
            case "send_message":
            case "swallow_balls":
            case "turn_on":
            case "turn_off":
                this.fifo.newOrder (() => {
                    this.processFifoOrder(name, param);
                }, name);
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist!");
        }
    }

    processFifoOrder (name, param) {
        this.logger.info("Executing order " + name);
        switch (name) {
            case "turn_on":
                this.servos.turnOnSweeper(() => {
                    this.fifo.orderFinished();
                });
                break;
            case "turn_off":
                this.servos.turnOffSweeper(() => {
                    this.fifo.orderFinished();
                });
                break;
            case "swallow_balls":
                //TODO
                this.logger.warn("TODO: make swallow_balls work");
                this.fifo.orderFinished();
                break;
            case "send_message":
                this.sendDataToIA(param.name, param || {});
                this.fifo.orderFinished();
                break;
            default:
                this.logger.error("Order " + name + " does not exist!");
                this.fifo.orderFinished();
        }
    }

    start(actuators) {
        super.start();
        if (!!actuators.servos) {
            this.servos = actuators.servos;
        } else {
            this.logger.error("Servos must be provided to Sweeper");
        }
    }

    stop () {
        if (!!this.servos) {
            this.servos.stop();
        }
        super.stop();
    }
}

module.exports = Sweeper;