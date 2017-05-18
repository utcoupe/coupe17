/**
 * Module permettant de ramacer les modules
 * 
 * @module clients/Extension/unitgrabber
 * @requires module:clients/Extension/extension
 */

"use strict";

const Extension = require('./extension');
var servos = require('../actuators/servo');

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
        // this.servos = servos;
    }

    takeOrder (from, name, param) {
        this.logger.info("Order received " + name);


        if (!this.started) {
            this.logger.error("BaseConstructor isn't started");
            return;
        }

        switch (name) {
            case "take_module":
                this.takeModule();
                break;
            
            // **************** tests only ************
            case "openArm":
            case "closeArm":
            case "upGrabber":
            case "downGrabber":
                this.fifo.newOrder(() => {
                    this.processFifoOrder(name);
                }, name);
                break;

            case "send_message":
                this.fifo.newOrder(() => {
                    this.processFifoOrder(name, param);
                }, name);
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


        if (!this.started) {
            this.logger.error("BaseConstructor isn't started");
            return;
        }

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
                this.logger.error("TODO: do AX12 upGrabber action");
                setTimeout(() => {
                    this.fifo.orderFinished();
                }, 200);
                break;
            case "downGrabber":
                // TODO AX12 down
                setTimeout(() => {
                    this.fifo.orderFinished();
                }, 200);
                break;
            case "send_message":
                this.sendDataToIA(param.name, param || {});
                this.fifo.orderFinished();
                break;
            default:
                this.logger.error("Order " + name + " does not exist !");
                this.fifo.orderFinished();
        }
    }

    start(actuators) {
        super.start();
        if (!!actuators.servos) {
            this.servos = actuators.servos;
        } else {
            this.logger.error("Servos must be provided to UnitGrabber");
        }
    }

    // Inherited from client
    stop() {
        if (!!this.servos) {
            this.servos.stop();
        }
        super.stop();
    }

    takeModule () {
        this.fifo.newOrder(() => {
            this.processFifoOrder("openArm");
        }, "openArm");
        this.fifo.newOrder(() => {
            this.processFifoOrder("downGrabber");
        }, "openGrabber");
        this.fifo.newOrder(() => {
            this.processFifoOrder("closeArm");
        }, "closeArm");
        this.fifo.newOrder(() => {
            this.processFifoOrder("openArm");
        }, "openArm");
        this.fifo.newOrder(() => {
            this.processFifoOrder("upGrabber");
        }, "closeGrabber");
        this.fifo.newOrder(() => {
            this.processFifoOrder("closeArm");
        }, "closeArm");
        this.fifo.newOrder(() => {
            this.sendDataToIA("pr.module++", {});
            this.fifo.orderFinished();
        }, "sendModule++");
    }
}

/* new way to work :
    IA is sending an order from the action.json orders list
    Extension has to store this in a FIFO, because IA sends the order and next ask the extension to ack
    In the Extension, call the corresponding Actuator (with an order ID ?), add manage callbacks in order
    to go to the next order
 */

module.exports = UnitGrabber;