#include "HX711.h"

#define BALANZA_DOUT  A1
#define BALANZA_CLK  A0

#define FACTOR_CALIBRACION -1060
#define PESO_MAX 200

HX711 scale;
unsigned long previousMillis;

void setup() {
  Serial.begin(9600); //Abrimos la comunicación serie con el PC y establecemos velocidad
  initBalanza(&scale, BALANZA_DOUT, BALANZA_CLK, FACTOR_CALIBRACION);
  previousMillis = millis();
}

void loop() {
  if(millis() - previousMillis > 1000){
    log_float("Time since last measure: ", millis() - previousMillis);    
    float pesoActual = scale.get_units(3);
    log_float("Peso actual: ", pesoActual);
    previousMillis = millis();
  }
}

void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();
  scale->set_scale(factor);  
}

void log_float(String msg, float n) {
  Serial.print(msg);
  Serial.println(n);
}
