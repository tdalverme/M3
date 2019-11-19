//Config pines relay
#define PIN_RELAY_FERNET 8
#define PIN_RELAY_COCA 7
#define MINIMO_SERVIDO_TIEMPO 2000
#define MINIMO_SERVIDO_GRAMOS 10
#define PESO_MAX 100
//Config pines bluetooth
#define PIN_BT_RX 10
#define PIN_BT_TX 11
#define BT_MSG_OK 1
#define BT_MSG_NOT_AVAILABLE 0
#define BT_MSG_PENDING 2
//Config celda de carga
#define PIN_BALANZA_DOUT  A1
#define PIN_BALANZA_CLK  A0
#define FACTOR_CALIBRACION -1060
//Config sensor de ultrasonido
#define PIN_ULTRASONIDO_INT 0
#define PIN_ULTRASONIDO_TRIG 4
#define PIN_ULTRASONIDO_ECHO 3
#define DISTANCIA_VASO_MAX 200
//Config sensor de temperatura
#define PIN_SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 10

//Estados posibles
#define STATE_ESPERANDO_INPUT 20
#define STATE_ESPERANDO_VASO 21
#define STATE_SIRVIENDO_BEBIDA 22
#define STATE_BEBIDA_FINALIZADA 23

#include <SoftwareSerial.h>
SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);
#include "HX711.h"
HX711 scale;

void initBalanza() {
  scale.begin(PIN_BALANZA_DOUT, PIN_BALANZA_CLK);
  scale.set_scale();
  scale.tare();
  scale.set_scale(FACTOR_CALIBRACION);
}

struct Trago {
  char bebida1[21];
  char bebida2[21];
  int bebida1Porcentaje;
  int bebida2Porcentaje;
};

typedef struct {
  int pinBebida1;
  int pinBebida2;
  int bebida1Porcentaje;
  int bebida2Porcentaje;
  int pinBebidaActual;
  float pesoObjetivo;
} ConfigTrago;


/****************************************/
String bluetoothMsg;
boolean msgStarted = false;
/****************************************/

void btFlush(){
  while(BT.available() > 0) {
    char t = BT.read();
  }
}  

int getBluetoothMsg() {
  if(BT.available()) {
    delay(50);
    char c = BT.read();
    
    if(c == '#'){
      msgStarted = true;
      return BT_MSG_PENDING;
    }
    if(msgStarted) {
      if (c != '@') {
        bluetoothMsg += c;
        return BT_MSG_PENDING;
      }
      else {
        Serial.print("[ESPERANDO_INPUT] ");
        Serial.println(bluetoothMsg);
        Serial.print("[BYTES_READ] ");
        Serial.println(bluetoothMsg.length());
        btFlush();
        msgStarted = false;
        return BT_MSG_OK;
      }
    }
    return BT_MSG_PENDING;
  }
  return BT_MSG_NOT_AVAILABLE;
}

void sendMessage(String message) {
  BT.println(message);
  btFlush();
}

Trago parseInput(String bluetoothMsg) {
  char* tokens[3];
  Trago tragoRecibido;

  char _bluetoothMsg[bluetoothMsg.length() + 1];
  bluetoothMsg.toCharArray(_bluetoothMsg, bluetoothMsg.length() + 1);
  
  tokens[0] = strtok(_bluetoothMsg,"|");
  for(int i = 1; i < 3; i++) {
    tokens[i] = strtok(NULL,"|");
  }
  
  strcpy(tragoRecibido.bebida1, tokens[0]);
  tragoRecibido.bebida1Porcentaje = atoi(tokens[1]);
  strcpy(tragoRecibido.bebida2, tokens[2]);
  tragoRecibido.bebida2Porcentaje = 100 - tragoRecibido.bebida1Porcentaje;

  Serial.println("[ESPERANDO_INPUT] Mensaje parseado");
  Serial.print("\tBebida1: ");
  Serial.print(tragoRecibido.bebida1);
  Serial.print(" Porcentaje: ");
  Serial.println(tragoRecibido.bebida1Porcentaje);
  Serial.print("\tBebida2: ");
  Serial.print(tragoRecibido.bebida2);
  Serial.print(" Porcentaje: ");
  Serial.println(tragoRecibido.bebida2Porcentaje);

  return tragoRecibido;
}

//Obtiene el pin que corresponde a esa bebida
int getPin(char* bebida) {
  if(strcmp(bebida, "FERNET") == 0)
  return PIN_RELAY_FERNET;
  else if(strcmp(bebida, "COCA") == 0)
  return PIN_RELAY_COCA;
}

//Setea pines x bebida y porcentajes de cada una
ConfigTrago getConfig(Trago trago) {
  ConfigTrago config;
  config.pinBebida1 = getPin(trago.bebida1);
  config.bebida1Porcentaje = trago.bebida1Porcentaje;
  config.pinBebida2 = getPin(trago.bebida2);
  config.bebida2Porcentaje = trago.bebida2Porcentaje;
  config.pesoObjetivo = PESO_MAX * trago.bebida1Porcentaje / 100;
  config.pinBebidaActual = config.pinBebida1;

  Serial.println("[ESPERANDO_INPUT] Config seteada");
  Serial.print("\tPin Bebida1: ");
  Serial.print(config.pinBebida1);
  Serial.print(" Porcentaje: ");
  Serial.println(config.bebida1Porcentaje);
  Serial.print("\tPin Bebida2: ");
  Serial.print(config.pinBebida2);
  Serial.print(" Porcentaje: ");
  Serial.println(config.bebida2Porcentaje);
  Serial.print("\tPeso objetivo: ");
  Serial.println(config.pesoObjetivo);
  Serial.print("\tPin bebida actual: ");
  Serial.println(config.pinBebidaActual);

  return config;
}

/*UTILS*/
/****************************************/
void encenderRelay(int pin) {
  digitalWrite(pin, LOW);
}

void apagarRelay(int pin) {
  digitalWrite(pin, HIGH);
}

void log_float(String msg, float n, String unit) {
  String now = "[" + String(millis() / 1000) + "s] ";
  Serial.print(now);
  Serial.print(msg);
  Serial.print(n);
  Serial.println(unit);
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
