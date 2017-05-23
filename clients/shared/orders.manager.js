/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const Log4js = require('log4js');

class OrdersManager {
    constructor (communicationLine) {
        // This is an abstract class, throw an error if it is directly instantiated or if missing virtual functions
        if (this.constructor === OrdersManager) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.logger = Log4js.getLogger("orders_manager");
        this.currentId = 1;
        this.ordersCallback = [];
        this.comLine = communicationLine;
        // ComLine connected means that we can send orders
        // Connected by default if comLine is defined
        this.comLineConnected = false;
        if (communicationLine !== undefined){
            this.comLineConnected = true;
        }
    }

    //call the callback corresponding to the received order id, stored in ordersCallback
    callOrderCallback(orderId, params) {
        for (var index = 0; index < this.ordersCallback.length; index++) {
            if (this.ordersCallback[index][0] == orderId) {
                // Call the callback
                if (this.ordersCallback[index][1] != null) {
                    this.logger.debug("Callback for order " + orderId);
                    this.ordersCallback[index][1](params);
                } else {
                    this.logger.error("Callback for order " + orderId + " is null...");
                }
                // Remove the line from the array
                this.ordersCallback.splice(index, 1);
            }
        }
    }

    sendOrder(orderType, args, callback) {
        if (this.comLineConnected) {
            this.logger.debug("args = " + args);
            args = args || [];
            var order = [orderType, this.currentId].concat(args).join(";")+";\n";
            this.ordersCallback.push([this.currentId, callback]);
            this.logger.debug("Send order : " + order);
            this.comLineSend(order);
            this.currentId++;
        } else {
            this.logger.error("Communication line is not connected...");
        }
    }

    // Automatically called by the super class
    //todo find a way to reboot arduino if it doesn't send its ID (previously started)
    parseCommand(receivedCommand) {
        // Check if the received command is a debug string or a response from an order
        // As the received command is a string, the ; index is depending on the number of digits of the order id received
        if (receivedCommand.indexOf(";") != -1) {
            // It's an order response
            var splittedCommand = receivedCommand.split(";");
            // Do not remove, mandatory to debug asserv
            this.logger.debug("splitted command : " + splittedCommand);
            this.callOrderCallback(parseInt(splittedCommand[0]), splittedCommand.slice(0, 2));
        } else {
            // It's a debug string
            this.logger.debug(receivedCommand.toString());
        }
    }

    comLineSend(order) {}
}

module.exports = OrdersManager;
