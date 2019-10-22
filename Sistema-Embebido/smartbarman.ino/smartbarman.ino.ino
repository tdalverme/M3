#include "HX711.h"

/*Aqui se configuran los pines donde debemos conectar el sensor*/
#define DOUT  A1
#define CLK  A0
#define PESO_MAX 200

#define RELAY_PIN_1 8
#define RELAY_PIN_2 7

#define ESPERANDO_INPUT 20
#define SIRVIENDO_BEBIDA 21
#define BEBIDA_FINALIZADA 22

int estadoActual;

HX711 scale;

void setup()
{
  Serial.begin(9600); //Abrimos la comunicación serie con el PC y establecemos velocidad

  // setup de la balanza
  scale.begin(DOUT, CLK);
  scale.set_scale();
  scale.tare();

  scale.set_scale(1);
  //scale.set_scale(-1060);


  pinMode(RELAY_PIN_1, OUTPUT);
  digitalWrite(RELAY_PIN_1, HIGH);
  pinMode(RELAY_PIN_2, OUTPUT);
  digitalWrite(RELAY_PIN_2, HIGH);
  
  estadoActual = ESPERANDO_INPUT;
}

String input;
int bebida1;
int bebida2;
int porcentajeBebida1;
int porcentajeBebida2;

int bebidaActual;
float pesoObjetivo;
float pesoActual;

void loop() {
  switch(estadoActual) {
    case ESPERANDO_INPUT:
      //Serial.print("PESO ACTUAL: ");
      //Serial.println(pesoActual);
      if(getInput() == 1) {
        parseInput();
        bebidaActual = bebida1;
        pesoObjetivo = PESO_MAX * porcentajeBebida1 / 100; 
        estadoActual = SIRVIENDO_BEBIDA;
        delay(1000);
      }
      break;
      
    case SIRVIENDO_BEBIDA:
      pesoActual = scale.get_units(10);
      Serial.print("PESO ACTUAL: ");
      Serial.println(pesoActual);
      
      if(pesoActual >= pesoObjetivo) {
        //Serial.println("MAYOR");
        if(bebidaActual == bebida2) {
          estadoActual = BEBIDA_FINALIZADA;
        }
        else {
          digitalWrite(bebidaActual, HIGH);
          bebidaActual = bebida2;
          pesoObjetivo = PESO_MAX - pesoActual;
        }
      }
      else {
        //Serial.println("MENOR");
        digitalWrite(bebidaActual, LOW);
      }
      break;
      
    case BEBIDA_FINALIZADA:
      digitalWrite(bebidaActual, HIGH);
      Serial.println("TERMINO");
      estadoActual = ESPERANDO_INPUT;
      break;

    default:
      break;
  }
}

int getInput() {
  if (Serial.available() > 0) {
    char caracter = Serial.read();
    
    if (caracter != '\n') {
      input += caracter;
      return 0;
    }
    else {
      //estadoActual = SIRVIENDO_BEBIDA;
      return 1;
    }
  }
}

void parseInput() {
  char aux[input.length() + 1];
  input.toCharArray(aux, input.length()+ 1);
  
  char *token = strtok(aux, "|");

  if(strcmp(token, "FERNET")) {
    bebida1 = RELAY_PIN_1;
  }
  else if(strcmp(token, "COCA")) {
    bebida1 = RELAY_PIN_2;
  }
  
   
  for(int i = 0; i < 2; i++) {
    token = strtok(NULL, "|");
     
    if(i == 0) {
      porcentajeBebida1 = atoi(token);
    }
    else if(i == 1) {
      if(strcmp(token, "FERNET")) {
        bebida2 = RELAY_PIN_1;
      }
      else if(strcmp(token, "COCA")) {
        bebida2 = RELAY_PIN_2;
      }
    }
  }

  porcentajeBebida2 = 100 - porcentajeBebida1;
}
