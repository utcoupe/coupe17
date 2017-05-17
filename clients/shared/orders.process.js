/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const OrdersManager = require('./orders.manager.js');

//orders for inter process communication
class OrdersProcess extends OrdersManager {
    constructor(communicationLine) {
        super(communicationLine);

        // We replace the callback set by the Servo class
        this.comLine.out.on("data", function(data){
            this.parseCommand(data);
        }.bind(this));
    }

    comLineSend(order) {
        this.comLine.in.write(order);
    }
}

// Exports an object to be sure to have a single instance in the system
module.exports = function(communicationLine) {
    return new OrdersProcess(communicationLine);
};
