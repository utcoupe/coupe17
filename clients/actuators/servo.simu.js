/**
 * Created by tfuhrman on 14/05/17.
 */

"use strict";

const Servo = require('./servo');

//serialPort is defined as /dev/ttyXx
class ServoSimu extends Servo {
    constructor(robot) {
        super(robot);
    }

    moduleArmClose(callback) {
        setTimeout(callback, 200);
    }

    moduleArmOpen(callback) {
        setTimeout(callback, 200);
    }

    moduleEngage(callback) {
        setTimeout(callback, 200);
    }

    moduleDrop(callback) {
        setTimeout(callback, 200);
    }

    moduleRotate(callback, params) {
        setTimeout(callback, 200);
    }

    turnOn(callback) {
        setTimeout(callback, 200);
    }

    turnoff(callback) {
        setTimeout(callback, 200);
    }

    openTruck(callback) {
        setTimeout(callback, 200);
    }

    stop() {
        this.logger.info("Servo simu stopped");
    }

}

// Exports an object to be sure to have a single instance in the system
module.exports = function(robot) {
    return new ServoSimu(robot);
};
