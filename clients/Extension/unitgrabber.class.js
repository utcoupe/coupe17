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

    takeOrder (from, name, param) {
        this.logger.info("Order received " + name);
        switch (name) {
            case "take_module":
                this.takeModule();
                break;
            
            // **************** tests only ************
            case "openArm":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("openArm");
                }, "openArm");
                break;
            case "closeArm":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("closeArm");
                }, "closeArm");
                break;
            case "upGrabber":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("upGrabber");
                }, "upGrabber");
                break;
            case "downGrabber":
                this.fifo.newOrder(() => {
                    this.processFifoOrder("downGrabber");
                }, "downGrabber");
                break;
            
            case "stop":
                this.stot();
                break;
            case "clean":
                this.logger.debug("Cleaning Fifo...");
                this.fifo.clean();
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist !");
        }
    }

   processFifoOrder (name, param) {
        this.logger.info("Executing order : " + name);
        switch (name) {
            case "openArm":
                this.servos.moduleArmOpen(() => {
                    this.fifo.orderFinished();
                });
                break;
            case "closeArm":
                this.servos.moduleArmClose(() => {
                    this.fifo.orderFinished();
                });
                break;
            case "upGrabber":
                // TODO AX12 up
                this.fifo.orderFinished();
                break;
            case "downGrabber":
                // TODO AX12 down
                this.fifo.orderFinished();
                break;
            
            default:
                this.logger.error("Order " + name + " does not exist !");
                this.fifo.orderFinished();
        }
    }

    // Inherited from client
    stop() {
        this.servos.stop();
        super.stop();
    }

    takeModule () {
        this.fifo.newOrder(() => {
            this.processFifoOrder("openArms");
        }, "openArms");
        this.fifo.newOrder(() => {
            this.processFifoOrder("openGrabber");
        }, "openGrabber");
        this.fifo.newOrder(() => {
            this.processFifoOrder("closeArms");
        }, "closeArms");
        this.fifo.newOrder(() => {
            this.processFifoOrder("openArms");
        }, "openArms");
        this.fifo.newOrder(() => {
            this.processFifoOrder("closeGrabber");
        }, "closeGrabber");
        this.fifo.newOrder(() => {
            this.processFifoOrder("closeArms");
        }, "closeArms");
    }
}

/* new way to work :
    IA is sending an order from the action.json orders list
    Extension has to store this in a FIFO, because IA sends the order and next ask the extension to ack
    In the Extension, call the corresponding Actuator (with an order ID ?), add manage callbacks in order
    to go to the next order
 */

module.exports = UnitGrabber;