/**
 * Module définissant un actuator abstrait
 * 
 * @module clients/Extension/Actuators/actuator
 */

"use strict";

const fs = require('fs');
const sp = require('serialport');

/**
 * Abstract class Actuator, which goal is to be an interface between the whole Node system and the code controlling the actuators.
 * 
 * @memberof module:clients/Extension/Actuators/actuator
 */
class Actuator {
    /**
     * Creates an instance of Actuator.
     */
    constructor () {
        // This is an abstract class, throw an error if it is directly instantiated or if missing virtual functions
        if (new.target === Abstract) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        if (this.parseCommand === undefined) {
            throw new TypeError("Must override parseCommand");
        }

        this.logger = this.Log4js.getLogger(actuator);
        this.ordersCallback = [];
        this.currentOrderId = 0;
        this.actuatorCommands = [];

        //todo AX12 use a serial ?
        //todo adapt serialport name to actuator
        // Serial port stuff, creation and binding callbacks
        this.serialPortReady = false;
        this.serialPort = new SerialPort("/dev/ttyUSB0", {
            baudrate: 57600,
            parser:sp.parsers.readline('\n')
        });
        this.serialPort.on("data", function(data){
            if(this.serialPortReady === false){
                this.serialPortReady = true;
                this.sendStatus();
            }
            this.parseCommand(data.toString());
        }.bind(this));
        this.serialPort.on("error", function(data){
            this.logger.debug("Serial port error : " + data.toString());
        });
        this.serialPort.on("close", function(){
            this.serialPortReady = false;
            // this.sendStatus();
            this.logger.error("Serial port close");
        }.bind(this));

        //add the id at the second position, orderToSend is the string to send to the actuator
        function addOrderId(orderToSend) {
            this.currentOrderId++;
            return (orderToSend.slice(0, 1) + this.currentOrderId + ';' + orderToSend.slice(2))
        }

        //call the callback corresponding to the received order id, stored in ordersCallback
        function callOrderCallback(orderId, params) {
            for (var index = 0; index < this.ordersCallback; index++) {
                if (this.ordersCallback[index][0] == orderId) {
                    // Call the callback
                    this.ordersCallback[index][1](params);
                    // Remove the line from the array
                    this.ordersCallback.splice(index, 1);
                }
            }
        }
    }

    sendOrder(orderType, servoId, callback) {
        //todo ';' as protocol separator
        var order = orderType + ';' + servoId + ';\n';
        order = addOrderId(order);
        this.ordersCallback.push([this.currentOrderId, callback]);
        this.serialPort.write(order);
    }

    //filename is the name + the path of the file
    parseParameterFile(filename) {
        fs.stat(filename, function(err) {
            if(err == null) {
                this.actuatorCommands = require('../../Shared/defineParser.js')(filename);
            } else {
                this.logger.error('Try to parse parameter file ' + filename + ', but an error ocured : ' + err.code);
            }
        })
    }

    // Pure virtual method to implement in children
    //parseCommand(receivedcommand);
}

module.exports = Actuator;