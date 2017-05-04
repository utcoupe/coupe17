/**
 * Module permettant de ramacer les modules
 * 
 * @module clients/Extension/unitgrabber
 * @requires module:clients/Extension/extension
 */

"use strict";

const Extension = require('./extension.class.js');
var servos = require('./Actuators/servo.class.js');

/**
 * Extension permettant de ramasser les modules lunaires
 * 
 * @class UnitGrabber
 * @memberof module:clients/Extension/unitgrabber
 * @extends {clients/Extension/extension.Extension}
 */
class UnitGrabber extends Extension {
    constructor(){
        super("unit_grabber");
        this.servos = servos;
    }

    processFifoOrder (name, param) {
        this.logger.info("Order received : " + name);
        switch (name) {
            case "open":
                this.servos.moduleArmOpen();
                break;
            case "close":
                this.servos.moduleArmClose();
                break;
            case "take_1":
                //add a mechanism to process some functions in sequential order, waiting the first has finished before
                //processing the next one
                //-> doing it in callback back and in easy to understand style !
                //2015 way is to use an other internal fifo, but not really understandable...
                // Order :
                // - open grabber
                // - close arms
                // - up grabber
                // - open arms
                break;
            
            case "take_4":
                // Order : same thing but 4 times
                break;

                break;
            
            default:
                this.logger.error("Order " + name + " does not exist !");
        }
    }
}

/* new way to work :
    IA is sending an order from the action.json orders list
    Extension has to store this in a FIFO, because IA sends the order and next ask the extension to ack
    In the Extension, call the corresponding Actuator (with an order ID ?), add manage callbacks in order
    to go to the next order
 */

module.exports = UnitGrabber;