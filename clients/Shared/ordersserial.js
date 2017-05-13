/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const OrdersManager = require('./ordersmanager.js');

class OrdersSerial extends OrdersManager {
    constructor(communicationLine) {
        super(communicationLine);

        // We replace the callback set by the Servo class
        this.comLine.on("data", function(data){
            this.parseCommand(data.toString());
        }.bind(this));
    }

    comLineSend(order) {
        this.comLine.write(order);
    }
}

// Exports an object to be sure to have a single instance in the system
module.exports = function(communicationLine) {
    return new OrdersSerial(communicationLine);
};
