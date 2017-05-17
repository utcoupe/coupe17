#include "ax.h"


std::mutex ax::lockSerial;
std::mutex ax::lockCout;
using namespace std;
void ax::executeAction(int finalPos, int idOrder){

    std::lock_guard<std::mutex> lck (lockAction);
    killAction = false;
     //int finalPos = positions[pos];
     int currentPos[2], current =0;
     finalPos = toAxValue(finalPos);
     //std::cout << "ok thread, position =" << finalPos << ", id=" << id <<", reg=" << P_GOAL_POSITION_L<< std::endl;
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
         //std::cout << "Position actuelle: " << current  << std::endl;
         if(killAction == true){
             break;
         }
         std::this_thread::sleep_for(std::chrono::milliseconds(500));
             //to be continued
     }while(current < finalPos-3 || current > finalPos + 3);
     cout << idOrder << ";"  << endl;
     //string message = (string)idOrder + "action done";
     killAction = false;

 }

 void ax::goTo(int pos, int idOrder){

     killAction = true;
     actions.push_back(std::thread(&ax::executeAction, this, positions[pos], idOrder));
 }
