/**
 * Module implémentant l'actuator pour le servo-moteur
 * 
 * @module clients/Extension/Actuators/servo
 * @requires clients/Extension/Actuators/actuator
 */

const Actuator = require('actuator.class.js');

/**
 * Classe implémentant l'actuator pour le servo-moteur
 * 
 * @class Servo
 * @memberof clients/Extension/Actuators/servo
 * @extends {clients/Extension/Actuators/actuator.Actuator}
 */
class Servo extends Actuator {
    constructor () {
        //
    }
}

module.exports = Servo;