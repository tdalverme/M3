#include "HX711.h"

#define BALANZA_DOUT  A1
#define BALANZA_CLK  A0

#define FACTOR_CALIBRACION -1060
#define PESO_MAX 200

#define PIN_RELAY_1 7
#define PIN_RELAY_2 8

HX711 scale;

unsigned long previousMillis;
unsigned long globalMillis;


boolean done1 = false;
boolean done2 = false;

void setup() {
  Serial.begin(9600);
  initBalanza(&scale, BALANZA_DOUT, BALANZA_CLK, FACTOR_CALIBRACION);
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);
  encenderRelay(PIN_RELAY_1);
  apagarRelay(PIN_RELAY_2);
  previousMillis = millis();
  log_float("[RELE_ON] Time since last measure: ", millis() - previousMillis, "ms");
  
}


//firstTop 40   secondTop 100
int incremental = 5000;
int count = 1;
void loop() {
  
    if(millisPassed(incremental) && !done1) {
      log_float("[RELE_OFF] Worked for: ", millis() - previousMillis, "ms");
      apagarRelay(PIN_RELAY_1);
      done1 = true;
    }
    if(millisPassed(2500 + incremental) && !done2) {
      log_float("[MIDO] Waited to measure till: ", millis() - previousMillis, "ms");
      getWeight();
      done2 = true;
    }
    if(millisPassed(5000 + incremental)){
      log_float("[RELE_ON] Time since last measure: ", millis() - previousMillis, "ms");
      encenderRelay(PIN_RELAY_1);      
      done1 = false;
      done2 = false;
      resetMillis();
      Serial.print("\tCount: ");
      Serial.println(count);
      if(count == 2 && incremental > 500)
        incremental /= 2;
      if(count == 5 && incremental > 500)
        incremental /= 2;
      count ++;
    }
}

float getWeight() {
  float pesoActual;
  for(int i = 0; i < 10; i++){
    pesoActual = scale.get_units(3);
    if( pesoActual >= 0)
      break;
    else
      pesoActual = -999;
  }
  log_float("\t\tPeso actual: ", pesoActual, "g");
  return pesoActual;
}

void initBalanza(HX711 * scale, int dout, int clk, float factor) {
  scale->begin(dout, clk);
  scale->set_scale();
  scale->tare();
  scale->set_scale(factor);  
}

void log_float(String msg, float n, String unit) {
  String now = "[" + String(millis() / 1000) + "s] ";
  Serial.print(now);
  Serial.print(msg);
  Serial.print(n);
  Serial.println(unit);
}

boolean millisPassed(long n) {
  return millis() - previousMillis >= n;
}

void resetMillis() {
  previousMillis = millis();
}

void encenderRelay(int pin){
  digitalWrite(pin, LOW);
}

void apagarRelay(int pin){
  digitalWrite(pin, HIGH);
}
