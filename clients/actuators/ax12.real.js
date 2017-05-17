/**
 * Created by michelme on 14/05/17.
 */

"use strict";

class Ax12Real {
    /**
     * Creates an instance of Ax12.
     */
    constructor () {
        super();

        // this.actuatorCommands = defineParser(process.env.UTCOUPE_WORKSPACE + "/ax12/XXX");
    }

    parseCommand(receivedCommand) {
        // if (!this.serialPortConnected) {
        //     //todo robot+"_others"
        //     // If not connected, wait the ID of the arduino before doing something else
        //     if (receivedCommand.indexOf("pr_others") == 0) {
        //         //todo find a way to make it proper
        //         var order = [this.actuatorCommands.START,0].join(";")+";\n";
        //         this.logger.debug(order);
        //         this.serialPort.write(order);
        //     } else {
        //         this.logger.debug(receivedCommand.toString());
        //         // Trigger on reception of ack from arduino that it has started
        //         if (receivedCommand.indexOf("0;") == 0) {
        //             this.serialPortConnected = true;
        //             this.ordersSerial = require("../shared/orders.serial")(this.serialPort);
        //         }
        //     }
        // }

        this.logger.error("TODO: parse command")
    }

    openGrabber(callback) {
        if (false) {
            this.ordersSerial.sendOrder(this.actuatorCommands.OPEN_GRABBER, null, callback);
        } else {
            this.logger.error("TODO: AX12 real openGrabber()");
            // this.logger.error("Serial port not connected...");
        }
    }

    closeGrabber(callback) {
        if (false) {
            this.ordersSerial.sendOrder(this.actuatorCommands.CLOSE_GRABBER, null, callback);
        } else {
            this.logger.error("TODO: AX12 real closeGrabber()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyLeft(callback) {
        if (false) {
            this.ordersSerial.sendOrder(this.actuatorCommands.DUMMY_LEFT, null, callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyLeft()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyRight(callback) {
        if (false) {
            this.ordersSerial.sendOrder(this.actuatorCommands.DUMMY_RIGHT, null, callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyRight()");
            // this.logger.error("Serial port not connected...");
        }
    }

    sendDummyCenter(callback) {
        if (false) {
            this.ordersSerial.sendOrder(this.actuatorCommands.DUMMY_CENTER, null, callback);
        } else {
            this.logger.error("TODO: AX12 real sendDummyCenter()");
            // this.logger.error("Serial port not connected...");
        }
    }

    stop() {
        this.logger.error("TODO: AX12 real stop()");
        this.logger.info("AX12 real stopped");
    }
}

module.exports = Ax12Real;