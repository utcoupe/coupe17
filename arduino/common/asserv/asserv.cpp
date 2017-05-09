/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
  
#include <Arduino.h>
#include "block.h"
#include "compat.h"
#include "parameters.h"
#include "protocol.h"
#include "control.h"
#include "pins.h"
#include "emergency.h"

#include "sender.h"
#include <Timer.h>

void asservLoop();

Timer asservLoopTimer = Timer(100, &asservLoop);

//TODO make it proper with others
// Flag to know if a computer is connected to the arduino
static unsigned char flagConnected = 0;
//static unsigned char flagArduinoConnected = 0;

//todo debug level as a parameter

void serialRead() {
//    static char receivedCommand[20];
    String receivedString;
    //readString has a default timeout of 1s
//    receivedString = Serial.readString();
    receivedString = Serial.readStringUntil('\n');
    receivedString.replace("\n", "");
    if (receivedString != "") {
//        if (receivedString == "S") {
//            flagConnected = true;
//        } else {
        parseAndExecuteOrder(receivedString);
//        }
//            SerialSender::SerialSend(SERIAL_INFO, receivedString);
//            Serial.println(receivedString);
//            Serial.flush();
//            delay(1000);
    }
//        delay(50);
}

unsigned long nextTime = 0;

#ifdef PIN_JACK
int JackCheck(void) {
	static int last_jack_status = 1;
	int i, jack_status, sent_bytes = 0;
	jack_status = digitalRead(PIN_JACK);
	digitalWrite(LED_JACK, !jack_status);
	if (last_jack_status == 0 && jack_status == 1) {
		for (i=0; i<JACK_SEND_NR; i++) {
			Serial.write(JACK);
			Serial.write('\n');
			sent_bytes += 2;
		}
	}
	last_jack_status = jack_status;
	return sent_bytes;
}
#endif

void setup() {
	SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
    Serial.setTimeout(50);
#ifdef __AVR_ATmega2560__
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#else
#ifdef __AVR_ATmega328P__
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();
//	SERIAL_MAIN.write(ARDUINO_ID);
	nextTime = micros();
	ControlInit();
}

void loop() {
    serialRead();
    if (!flagArduinoConnected) {
        SerialSender::SerialSend(SERIAL_INFO, "%s", ARDUINO_ID);
        delay(1000);
    } else {
        asservLoopTimer.Update();
    }
    SerialSender::SerialSendTask();
}

void asservLoop(){
	int available, sent_bytes;
#if DEBUG_MAINLOOP
	static unsigned long start_overtime = micros();
	unsigned long now;
#endif

	nextTime = nextTime + DT*1000000;
	sent_bytes = 0;
	digitalWrite(LED_MAINLOOP, HIGH);

//#ifdef PIN_JACK
//	sent_bytes += JackCheck();
//#endif

	//Action asserv
	ComputeEmergency();
	ComputeIsBlocked();
	ControlCompute();

//	// Flush serial every time to stay in time
//	Serial.flush();
//	// zone programmation libre
//	available = SERIAL_MAIN.available();
//	for(int i = 0; i < available; i++) {
//		// recuperer l'octet courant
//		sent_bytes += ProtocolExecuteCmd(generic_serial_read());
//	}
	// Auto send status if necessary
//	ProtocolAutoSendStatus(MAX_BYTES_PER_IT - sent_bytes);
    ProtocolAutoSendStatus();

	digitalWrite(LED_MAINLOOP, LOW);

#if DEBUG_MAINLOOP
	now = micros();
	if (now - start_overtime > 10000000) {
		digitalWrite(LED_DEBUG, LOW);
	}
	if (now >= nextTime) {
		start_overtime = micros();
		digitalWrite(LED_DEBUG, HIGH);
	}
#endif
//	while (micros() < nextTime);
}
