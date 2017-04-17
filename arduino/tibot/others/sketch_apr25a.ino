 
#include <Servo.h> 
 
Servo myservo1, myservo2,myservo3,myservo4,myservo5;  // create servo object to control a servo 
 
void setup() 
{ 
  Serial.begin(115200);
  myservo1.attach(7);
  myservo2.attach(9);  
  myservo3.attach(4);
  myservo4.attach(5);  
  myservo5.attach(2);  
} 
  
void loop() 
{ 
  int order;
  if (Serial.available()){
    delay(100);
    while(Serial.available()>0){
      order=Serial.read();     //reads the value sent from Visual Basic  
      if(order=='0') // Ouvrir haur
      {
          myservo1.write(61);
          myservo2.write(70);
      }
      else if(order=='1') // Fermer haut
      {
          myservo1.write(137);
          myservo2.write(5);
      }
          else if(order=='2') // Ouvrir milieu moyen
      {
          myservo3.write(120);
          myservo4.write(70);
      }
          else if(order=='3') // Fermer milieu
      {
          myservo3.write(140);
          myservo4.write(50);
      }
         else if(order=='4') // Ouvrir gobelet
      {
          myservo5.write(120);
      }
         else if(order=='5') // Fermer gobelet
      {
          myservo5.write(70);
      }
        else if(order=='6') // Ouvrir milieu
      {
          myservo3.write(80);
          myservo4.write(110);
      }
    }
  } 
} 

