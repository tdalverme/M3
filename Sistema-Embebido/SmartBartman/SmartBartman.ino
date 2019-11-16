#include "header.h"

void setup() {
  Serial.begin(9600);           //Abrimos la comunicación serie con el PC y establecemos velocidad
  BT.begin(9600);               //Velocidad del puerto del módulo Bluetooth

  initBalanza(&scale, PIN_BALANZA_DOUT, PIN_BALANZA_CLK, FACTOR_CALIBRACION);
  pinMode(PIN_RELAY_FERNET, OUTPUT);
  pinMode(PIN_RELAY_COCA, OUTPUT);
  digitalWrite(PIN_RELAY_FERNET, HIGH);
  digitalWrite(PIN_RELAY_COCA, HIGH);

  estadoActual = STATE_ESPERANDO_INPUT;
}

void loop() {
  switch(estadoActual) {
    case STATE_ESPERANDO_INPUT:
      handleEsperandoInput();
      break;

    case STATE_ESPERANDO_VASO:
      handleEsperandoVaso();
      break;

    case STATE_SIRVIENDO_BEBIDA:
      handleSirviendoBebida();
      break;

    case STATE_BEBIDA_FINALIZADA:
      handleBebidaFinalizada();
      break;

    case STATE_VASO_AUSENTE:
      handleVasoAusente();
      break;

    default:
      break;
  }
}
