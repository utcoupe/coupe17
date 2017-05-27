/**
 * Module that defines an abstract AX12
 * 
 * @module clients/actuators/ax12
 * @requires module:Log4js
 */

"use strict";

const Log4js = require('log4js');

/**
 * Defines an abstract AX12
 * 
 * @memberof module:clients/actuators/ax12
 */
class Ax12 {
    /**
     * Creates an instance of Ax12.
     * 
     * @param {any} robot not usefull at all
     */
    constructor (robot) {
        // This is an abstract class, throw an error if it is directly instantiated or if missing virtual functions
        if (this.constructor === Ax12) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.logger = Log4js.getLogger("ax12");
    }

    /**
     * Opens the grabber
     * 
     * @param {function} callback
     */
    openGrabber(callback) {}

    /**
     * Closes the grabber
     * 
     * @param {function} callback
     */
    closeGrabber(callback) {}

    /**
     * Sends the dummy to left
     * 
     * @param {any} callback
     */
    sendDummyLeft(callback) {}

    /**
     * Sends the dummy to right
     * 
     * @param {any} callback
     */
    sendDummyRight(callback) {}

    /**
     * Sends the dummy to center
     * 
     * @param {any} callback
     */
    sendDummyCenter(callback) {}

    /**
     * Stops the AX12 (turns it off)
     */
    stop() {}
}

module.exports = Ax12;