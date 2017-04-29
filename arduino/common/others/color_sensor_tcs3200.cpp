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

#define COLOR_ACCUMULATE_NB     3

#define WHITE_COLOR_THRESHOLD   600
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
}

MODULE_COLOR computeColor() {
    MODULE_COLOR returnValue = WHATEVER;
    uint16_t rgbColorAccumulator[3] = {0, 0, 0};
    uint8_t rgbMeanValues[3] = {0, 0, 0};
    // First accumulate color sensor values to be more accurate
    for (uint8_t accumulator_nb = 0; accumulator_nb < COLOR_ACCUMULATE_NB; accumulator_nb++) {
        colorSensorValuesCapture();
        rgbColorAccumulator[RGB_RED] += rgbValues[RGB_RED];
        rgbColorAccumulator[RGB_GREEN] += rgbValues[RGB_GREEN];
        rgbColorAccumulator[RGB_BLUE] += rgbValues[RGB_BLUE];
    }
    // Get the mean of the accumulated rgb data
    rgbMeanValues[RGB_RED] = rgbColorAccumulator[RGB_RED] / COLOR_ACCUMULATE_NB;
    rgbMeanValues[RGB_GREEN] = rgbColorAccumulator[RGB_GREEN] / COLOR_ACCUMULATE_NB;
    rgbMeanValues[RGB_BLUE] = rgbColorAccumulator[RGB_BLUE] / COLOR_ACCUMULATE_NB;
    SerialSender::SerialSend(SERIAL_DEBUG, "RED : %d, GREEN : %d, BLUE : %d", rgbMeanValues[RGB_RED], rgbMeanValues[RGB_GREEN], rgbMeanValues[RGB_BLUE]);
    // Compute the non rgb colors
    uint16_t yellowColor = rgbMeanValues[RGB_RED] + rgbMeanValues[RGB_GREEN];
    uint16_t colorSum = yellowColor + rgbMeanValues[RGB_BLUE];
    String color;
    //todo return the color corresponding to the protocol
    if (colorSum > WHITE_COLOR_THRESHOLD) {
        color = String("white");
    } else {
        //todo find a way to avoid blue -> white turning in yellow...
        if (yellowColor > YELLOW_COLOR_THRESHOLD) {
            color = String("yellow");
            returnValue = YELLOW;
        } else if ((yellowColor >> 2) < rgbMeanValues[RGB_BLUE]) {
            color = String("blue");
            returnValue = BLUE;
        } else {
            color = String("undefined");
        }
    }
    SerialSender::SerialSend(SERIAL_INFO, color);
    return returnValue;
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
