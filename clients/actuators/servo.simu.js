/**
 * Created by tfuhrman on 14/05/17.
 */

"use strict";

const Servo = require('./servo');

//serialPort is defined as /dev/ttyXx
class ServoSimu extends Servo {
    constructor() {
        super();
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

    moduleRotate(callback) {
        setTimeout(callback, 200);
    }

    stop() {
        this.logger.info("Servo simu stopped");
    }

}

// Exports an object to be sure to have a single instance in the system
module.exports = function() {
    return new ServoSimu();
};
