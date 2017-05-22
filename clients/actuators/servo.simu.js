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

    stop() {
        this.logger.info("Servo simu stopped");
    }

    ////////////////////////////////
    //          PR ORDERS         //
    ////////////////////////////////

    moduleArmClose(callback) {
        setTimeout(callback, 200);
    }

    moduleArmOpen(callback) {
        setTimeout(callback, 200);
    }

    moduleArmInit(callback) {
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

    ////////////////////////////////
    //          GR ORDERS         //
    ////////////////////////////////

    turnOnCanon(callback) {
        setTimeout(callback, 200);
    }

    turnOffCanon(callback) {
        setTimeout(callback, 200);
    }

    turnOnSweeper(callback) {
        setTimeout(callback, 200);
    }

    turnOffSweeper(callback) {
        setTimeout(callback, 200);
    }

    launchRocket(callback) {
        setTimeout(callback, 200);
    }

    openTrunk(callback) {
        setTimeout(callback, 200);
    }

    closeTrunk(callback) {
        setTimeout(callback, 200);
    }

}

// Exports an object to be sure to have a single instance in the system
module.exports = function(robot) {
    return new ServoSimu(robot);
};
