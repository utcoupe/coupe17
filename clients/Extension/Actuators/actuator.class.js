/**
 * Module définissant un actuator abstrait
 * 
 * @module clients/Extension/Actuators/actuator
 */

"use strict";

/**
 * Classe abstraite représentant un actuator
 * 
 * @memberof module:clients/Extension/Actuators/actuator
 */
class Actuator {
    /**
     * Creates an instance of Actuator.
     */
    constructor () {
        //
    }
    
    /**
     * 
     */
    send () {
        //
    }

    /**
     * 
     */
    receive () {
        //
    }

    /**
     * 
     */
    getInstance () {
        //
    }

    /**
     * 
     */
    subscribe () {
        //
    }

    /**
     * 
     */
    callCallback () {
        //
    }

    /**
     * 
     */
    sendCommand () {
        Console.fatal("Actuator.sendCommand est virtuelle pure !");
    }

    /**
     * 
     */
    sendOrderToArduino () {
        //
    }
}

module.exports = Actuator;