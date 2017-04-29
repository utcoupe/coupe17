/**
 * Module implémentant un actuator pour l'AX12
 * 
 * @module clients/Extension/Actuators/ax12
 * @requires module:clients/Extension/Actuators/actuator
 */

"use strict";

const Actuator = require('actuator.class.js');

/**
 * Classe implémentant un actuator pour l'AX12
 * 
 * @memberof clients/Extension/Actuators/ax12
 * @extends module:clients/Extension/Actuators/actuator.Actuator
 */
class Ax12 extends Actuator {
    /**
     * Creates an instance of Ax12.
     */
    constructor (){
        //
    }
}

module.exports = Ax12;