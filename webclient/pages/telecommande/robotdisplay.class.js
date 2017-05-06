"use strict";

class RobotDisplay {
    constructor (name, client) {
        this.name = name;
		this.client = client;

        // Default for all robots
        this.pwm_gauche = 50;
        this.pwm_droite = 50;
        this.pwm_ms = 1000;
        this.a = 0;
        this.x = 0;
        this.y = 0;
        this.set_x = 0;
        this.set_y = 0;
        this.set_a = 0;
        this.v = 1500;
        this.r = 0.4;
        this.PID_P = 0.5;
        this.PID_I = 50;
        this.PID_D = 10;
        this.acc = 750;
    }



    // General
	clean () {
		this.client.send(this.name, "clean");
	}

	stop () {
		this.client.send(this.name, "stop");
	}

    // Asserv
    PWM () {
		this.client.send(this.name, "asserv.pwm", {
			left: this.pwm_droite,
			right: this.pwm_gauche,
			ms: this.pwm_ms
		});
	}

	goPos () {
		this.client.send(this.name, "asserv.goxy", {
			x: parseInt(this.x),
			y: parseInt(this.y)
		});
	}

	goAngle () {
		this.client.send("gr", "asserv.goa", {
			a: parseFloat(this.a)*Math.PI/180
		});
	}

	goPosAngle () {
		this.goPos();
		this.goAngle();
	}

	setVit () {
		this.client.send(this.name, "asserv.setvit",{
				v: parseInt(this.v),
				r: parseFloat(this.r)
		});
	}

	setAcc () {
		this.client.send(this.name, "asserv.setacc", {
			acc: parseInt(this.acc)
		});
	}

	setPos () {
		this.client.send(this.name, "asserv.setpos", {
			x: parseInt(this.set_x),
			y: parseInt(this.set_y), 
			a: parseFloat(this.set_a)*Math.PI/180
		});
	}

	setPID () {
		this.client.send(this.name, "asserv.setpid", {
			p: parseFloat(this.PID_P),
			i: parseFloat(this.PID_I), 
			d: parseFloat(this.PID_D)
		});
	}
}