#include <SoftwareSerial.h> //Librería que permite establecer comunicación serie en otros pins
#include <NewPing.h>
#include "HX711.h"

/*Aqui se configuran los pines donde debemos conectar el sensor*/
#define TRIGGER_PIN  4
#define ECHO_PIN     3  
#define MAX_DISTANCE 200
#define DOUT  A1
#define CLK  A0
#define MAX_WEIGHT 40

#define RELAY_PIN_1 8
//#define RELAY_PIN_2 7
//#define RELAY_PIN_3 6
//Aquí conectamos los pins RXD,TDX del módulo Bluetooth.
SoftwareSerial BT(11,10); //11 RX, 10 TX.
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); // NewPing setup of pins and maximum distance.

HX711 scale;

void setup()
{
  BT.begin(9600); //Velocidad del puerto del módulo Bluetooth
  Serial.begin(9600); //Abrimos la comunicación serie con el PC y establecemos velocidad

  // setup de la balanza
  scale.begin(DOUT, CLK);
  scale.set_scale();
  scale.tare();

  long units = scale.get_units(10);
  long scale_units = units / 150;
  scale.set_scale(scale_units);
  
  
  pinMode(RELAY_PIN_1, OUTPUT);
  digitalWrite(RELAY_PIN_1, HIGH);
//  pinMode(RELAY_PIN_2, OUTPUT);
//  digitalWrite(RELAY_PIN_2, HIGH);
//  pinMode(RELAY_PIN_3, OUTPUT);
//  digitalWrite(RELAY_PIN_3, HIGH);

}
 
void loop()
{
//  delay(50);
//  long duration; //timepo que demora en llegar el eco
//  long distance; //distancia en centimetros
//  digitalWrite(RELAY_PIN_2, LOW);
//  digitalWrite(RELAY_PIN_3, LOW);
//  delay(1000);
//  digitalWrite(RELAY_PIN_2, HIGH);
//  digitalWrite(RELAY_PIN_3, HIGH);
//  delay(3000);
//  digitalWrite(RELAY_PIN_1, HIGH);
//  duration = sonar.ping();
//  distance = (duration / 2) * 0.0343;
//  char buf[50];

 if (scale.is_ready()) {
    long reading = scale.read_average();
    Serial.println("HX711 reading: ");
//    Serial.println(scale.get_units(), 1);
    long value = scale.get_value(5)/ -1000;
    Serial.println(value);
    if(value > MAX_WEIGHT) {
      digitalWrite(RELAY_PIN_1, HIGH);
    } else {
      digitalWrite(RELAY_PIN_1, LOW);
    }
  } else {
    Serial.println("HX711 not found.");
  }
//
//  if(BT.available())
//  {
//    Serial.write(BT.read());
//    if(distance > 15) {
//      sprintf(buf, "detected|false");  
//    } else {
//      sprintf(buf, "detected|true");  
//    }
//    Serial.println(buf);
//    Serial.println(distance);
//    
//    BT.println(buf);
//  }
//
//  if(Serial.available())
//  {   
//     BT.write(Serial.read());
//  }
//  
}
