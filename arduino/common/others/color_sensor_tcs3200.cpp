//
// Created by tfuhrman on 27/04/17.
// Based on Arduino Color Sensing Tutorial
// by Dejan Nedelkovski, www.HowToMechatronics.com
//

#include "color_sensor_tcs3200.h"
#include <Arduino.h>
#include "sender.h"

#define S0 4
#define S1 5
#define S2 6
#define S3 7
#define LED 12
#define sensorOut 3

#define WHITE_COLOR_THRESHOLD   650
#define YELLOW_COLOR_THRESHOLD  270

//red, green, blue
uint8_t rgbValues[3];

//used to map rawFrequency read from sensor to a RGB value on 8 bytes
//those data have to be calibrated to be optimal
//the index is rgbValuesName
uint8_t rgbMinMaxFrequency[3][2] = {
        {25, 54},
        {15, 100},
        {10, 90}
};

void setupColorSensor() {
    pinMode(S0, OUTPUT);
    pinMode(S1, OUTPUT);
    pinMode(S2, OUTPUT);
    pinMode(S3, OUTPUT);
    pinMode(LED, OUTPUT);
    pinMode(sensorOut, INPUT);

    // Setting frequency-scaling to 20%
    digitalWrite(S0,HIGH);
    digitalWrite(S1,LOW);

    //todo power on the led when needed and power it off
    digitalWrite(LED, HIGH);

    //todo power on color sensor when needed otherwise power it off
}

void colorSensorValuesCapture() {
    //todo IR filter ?
    uint8_t rawFrequency = 0;
    for (uint8_t color_id = 0; color_id < 3; color_id++) {
        colorSensorFilterApply((rgbValuesName)color_id);
        rawFrequency = pulseIn(sensorOut, LOW);
        rgbValues[color_id] = constrain(map(rawFrequency, rgbMinMaxFrequency[color_id][0], rgbMinMaxFrequency[color_id][1], 255, 0), 0, 255);
    }
    SerialSender::SerialSend(SERIAL_INFO, "RED : %d, GREEN : %d, BLUE : %d", rgbValues[RGB_RED], rgbValues[RGB_GREEN], rgbValues[RGB_BLUE]);
}

void computeColor() {
    // First update the sensor values
    colorSensorValuesCapture();
    //todo accumulate on #define values
    // Activate the LED
    uint16_t yellowColor = rgbValues[RGB_RED] + rgbValues[RGB_GREEN];
    uint16_t colorSum = yellowColor + rgbValues[RGB_BLUE];
    String color;
    if (colorSum > WHITE_COLOR_THRESHOLD) {
        color = String("white");
    } else {
        if (yellowColor > YELLOW_COLOR_THRESHOLD) {
            color = String("yellow");
        } else if ((yellowColor >> 2) < rgbValues[RGB_BLUE]) {
            color = String("blue");
        } else {
            color = String("undefined");
        }
    }
    SerialSender::SerialSend(SERIAL_INFO, color);
}

void colorSensorFilterApply(rgbValuesName color) {
    switch (color) {
        case RGB_RED:
            digitalWrite(S2,LOW);
            digitalWrite(S3,LOW);
            break;
        case RGB_GREEN:
            digitalWrite(S2,HIGH);
            digitalWrite(S3,HIGH);
            break;
        case RGB_BLUE:
            digitalWrite(S2,LOW);
            digitalWrite(S3,HIGH);
            break;
        default:
            break;
    }
}
