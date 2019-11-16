#ifndef HEADER_H
#define HEADER_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "HX711.h"
#include "AsyncSonarLib.h"

/**************************************************/
//Config del relay
#define PIN_RELAY_FERNET 8
#define PIN_RELAY_COCA 7
#define PIN_BT_RX 10
#define PIN_BT_TX 11
/*Config de celda de carga*/
#define PIN_BALANZA_DOUT  A1
#define PIN_BALANZA_CLK  A0
#define FACTOR_CALIBRACION -1060
/*Config de sensor de ultrasonido*/
#define PIN_ULTRASONIDO_INT 0
#define PIN_ULTRASONIDO_TRIG 4
#define PIN_ULTRASONIDO_ECHO 3
/*Config de lm35*/
#define PIN_SENSOR_TEMP A2
#define CANT_MEDICIONES_TEMP 10
/*Config custom del artefacto*/
#define DISTANCIA_VASO_MAX 200
#define PESO_MAX 200
/*Estados posibles*/
#define STATE_ESPERANDO_INPUT 20
#define STATE_ESPERANDO_VASO 21
#define STATE_VASO_AUSENTE 22
#define STATE_SIRVIENDO_BEBIDA 23
#define STATE_BEBIDA_FINALIZADA 24
/**************************************************/
typedef struct {
  int pinBebida1;
  int pinBebida2;
  int bebida1Porcentaje;
  int bebida2Porcentaje;
  int pinBebidaActual;
  float pesoObjetivo1;
} ConfigTrago;

typedef struct {
    char bebida1[10];
    char bebida2[10];
    int bebida1Porcentaje;
    int bebida2Porcentaje;
} Trago;
/**************************************************/
/*VARIABLES GLOBALES*/
/**************************************************/
static SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);

static HX711 scale;

void sonarPingRecieved(AsyncSonar& sonar);
void sonarTimeOut(AsyncSonar& sonar);
static AsyncSonar sonar(PIN_ULTRASONIDO_TRIG, sonarPingRecieved, sonarTimeOut);

static int estadoActual;               //Variable que contiene el STATE actual

static Trago tragoSeleccionado;
static ConfigTrago config;
/**************************************************/

void handleEsperandoInput();
void handleEsperandoVaso();
void handleSirviendoBebida();
void handleVasoAusente();
void handleBebidaFinalizada();

void encenderRelay(int pin);
void apagarRelay(int pin);
void initBalanza(HX711 * scale, int dout, int clk, float factor);
ConfigTrago getConfig(Trago trago);
int getPin(char* bebida);
float getTemperatura();
float getTemperaturaDelSensor();

String getMessage();
void sendMessage(String message);
Trago parseInput(char* input);
/**************************************************/

#endif // HEADER_H_INCLUDED
