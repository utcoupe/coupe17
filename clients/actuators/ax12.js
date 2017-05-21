

"use strict";

const Log4js = require('log4js');

class Ax12 {
    /**
     * Creates an instance of Ax12.
     */
    constructor () {
        // This is an abstract class, throw an error if it is directly instantiated or if missing virtual functions
        if (this.constructor === Ax12) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.logger = Log4js.getLogger("ax12");
    }

    openGrabber(callback) {}

    closeGrabber(callback) {}

    sendDummyLeft(callback) {}

    sendDummyRight(callback) {}

    sendDummyCenter(callback) {}

    stop() {}
}

module.exports = Ax12;