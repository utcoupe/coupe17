/**
 * Created by michelme on 14/05/17.
 * Create a simulated AX12 singleton
 * 
 * @module clients/actuators/ax12simu
 * @requires clients/actuators/ax12
 */

"use strict";

const Ax12 = require('./ax12');

/**
 * Defines a simulated AX12. Does not need to be a singleton.
 * 
 * @extends module:clients/actuators/ax12.Ax12
 */
class Ax12Simu extends Ax12 {
    /**
     * Creates an instance of  simulated Ax12.
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