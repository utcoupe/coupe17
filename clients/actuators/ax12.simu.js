/**
 * Created by michelme on 14/05/17.
 */

"use strict";

const Ax12 = require('./ax12');

class Ax12Simu extends Ax12 {
    /**
     * Creates an instance of Ax12.
     */
    constructor (robot) {
        super(robot);
    }

    openGrabber(callback) {
        setTimeout(callback, 200);
    }

    closeGrabber(callback) {
        setTimeout(callback, 200);
    }

    sendDummyLeft(callback) {
        setTimeout(callback, 200);
    }

    sendDummyRight(callback) {
        setTimeout(callback, 200);
    }

    sendDummyCenter(callback) {
        setTimeout(callback, 200);
    }

    stop() {
        this.logger.info("AX12 simu stopped");
    }
}

// Exports an object to be sure to have a single instance in the system
module.exports = function() {
    return new Ax12Simu();
};