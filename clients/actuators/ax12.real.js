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

        this.logger.error("TODO: ")
    }

    openGrabber(callback) {
        this.logger.error("TODO: AX12 real openGrabber()");
    }

    closeGrabber(callback) {
        this.logger.error("TODO: AX12 real closeGrabber()");
    }

    sendDummyLeft(callback) {
        this.logger.error("TODO: AX12 real sendDummyLeft()");
    }

    sendDummyRight(callback) {
        this.logger.error("TODO: AX12 real sendDummyRight()");
    }

    sendDummyCenter(callback) {
        this.logger.error("TODO: AX12 real sendDummyCenter()");
    }

    stop() {
        this.logger.error("TODO: AX12 real stop()");
        this.logger.info("AX12 real stopped");
    }
}

module.exports = Ax12Real;