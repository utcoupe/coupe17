/**
 * Created by tfuhrman on 13/05/17.
 */

"use strict";

const Log4js = require('log4js');

class Servo {
    constructor (robot) {
        // This is an abstract class, throw an error if it is directly instantiated or if missing virtual functions
        if (this.constructor === Servo) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.logger = Log4js.getLogger("servo");
    }

    moduleArmClose(callback) {}

    moduleArmOpen(callback) {}

    moduleEngage(callback) {}

    moduleDrop(callback) {}

    moduleRotate(callback, params) {}

    turnOn(callback) {}

    turnoff(callback) {}

    openTruck(callback) {}

    stop() {}

}

module.exports = Servo;