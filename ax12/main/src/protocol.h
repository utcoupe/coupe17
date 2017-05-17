//
// Created by tfuhrman on 20/04/17.
//

#ifndef OTHERS_PROTOCOL_H
#define OTHERS_PROTOCOL_H


#include <string>
#include <iostream>
#include <stdint.h>
#include <stdlib.h>
#include <dynamixel.h>
#include <time.h>
#include <unistd.h>
#include <fstream>

#include <thread>
#include <mutex>
#include <regex>
#include <chrono>
#include <future>
#include <map>
#include <vector>
//class String;
//todo ack format ?

// BEGIN_ORDERS - Do not remove this comment
#define START               'S'     //no args, start the program
#define HALT                'h'    //no args, halt the program
#define PARAMETER           'p'     //servo_id(int);position(int);value(int), respond TODO, position = open or close
#define AX12_ONE            'o'     //servo_id(int), respond ack when done
#define AX12_TWO            't'     //servo_id(int), respond ack when done
#define AX12_INIT           'i'
#define PR_MODULE_ARM       0       //servo controlling the arm which push the module
#define PR_MODULE_RISE      1       //servo controlling the shovel
//END_ORDERS - Do not remove this comment


const int INIT = 0;
const int ONE = 1;
const int TWO = 2;
const int NB_POS = 3;

#define MAX_UINT8_T_VALUE   (uint8_t)255

#define ORDER_INDEX 0
#define ID_INDEX    2

uint8_t getLog10(const uint16_t number);
using namespace std;
class ax{
    friend class axParser;
    static const int P_GOAL_POSITION_L = 30;
    static mutex lockSerial;
    static mutex lockCout;
    int id;
    std::atomic<bool> killAction;
    std::vector<int> positions;
    std::mutex lockAction;
    std::vector<std::thread> actions;
    int toAxValue(int val){
        return val*3.41;
    }
public:
    ax(int id, std::vector<int> pos):id(id), positions(std::vector<int> (NB_POS)){
        positions = pos;

    }
    void executeAction(int finalPos, int idOrder){

        std::lock_guard<std::mutex> lck (lockAction);
        killAction = false;
        std::cout << "thread\n";
         //int finalPos = positions[pos];
         int currentPos[2], current =0;
         finalPos = toAxValue(finalPos);
         std::cout << "ok thread, position =" << finalPos << ", id=" << id <<", reg=" << P_GOAL_POSITION_L<< std::endl;
         lockSerial.lock();
         dxl_write_word(id, P_GOAL_POSITION_L, finalPos);
         lockSerial.unlock();
         std::this_thread::sleep_for(std::chrono::milliseconds(500));

         do{
             lockSerial.lock();
             dxl_read_word(id, 36);
             currentPos[0] = dxl_get_rxpacket_parameter(0);
             currentPos[1] = dxl_get_rxpacket_parameter(1) << 8;
             current = currentPos[0] | currentPos[1];
             lockSerial.unlock();
             std::cout << "Position actuelle: " << current  << std::endl;
             if(killAction == true){
                 break;
             }
             std::this_thread::sleep_for(std::chrono::milliseconds(500));
                 //to be continued
         }while(current < finalPos-3 || current > finalPos + 3);
         //string message = (string)idOrder + "action done";
         killAction = false;

     }
    void goTo(int pos, int idOrder){

        killAction = true;

        std::cout << "ok goto\n";
        actions.push_back(std::thread(&ax::executeAction, this, positions[pos], idOrder));
    }
    void setPositions(int i, int value){
        positions[i] = value;
    }
};

class axParser{

    bool started;
    int baudnum, deviceIndex;
    int detection();
    void parseAndExecuteOrder(const std::string& order, bool startOnly = false);
    int getLog10(const uint16_t number);
    void waitStart();
    std::map <int, ax*> servos;
    bool changeParameter(int id, int parameter, int value );
    std::future<std::string> future;
    std::string checkOrder();
    bool checkMessage(const std::string& mes);
public:
    axParser();
};


#define ID_DETECTION 		1
// Control table address
#define P_GOAL_POSITION_H	31
#define P_GOAL_SPEED_L		32
#define P_GOAL_SPEED_H		33

#endif //OTHERS_PROTOCOL_H
