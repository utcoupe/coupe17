"use strict";

class GrobotDisplay extends RobotDisplay {
    constructor (name, client) {
        super(name, client);

        // Specific to grobot
        // example : this.PID_P = 0.5
    }

    turnOnCanon () {
        this.client.send("canon", "turn_on");
    }

    turnOffCanon () {
        this.client.send("canon", "turn_off");
    }

    turnOnSweeper () {
        this.client.send("sweeper", "turn_on");
    }

    turnOffSweeper () {
        this.client.send("sweeper", "turn_off");
    }
}