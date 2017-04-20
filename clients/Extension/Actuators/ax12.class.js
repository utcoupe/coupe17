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
 * @class Ax12
 * @memberof clients/Extension/Actuators/ax12
 * @extends {clients/Extension/Actuators/actuator.Actuator}
 */
class Ax12 extends Actuator {
    constructor (){
        //
    }
}

module.exports = Ax12;