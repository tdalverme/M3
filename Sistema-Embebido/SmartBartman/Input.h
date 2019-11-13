#define PIN_RELAY_FERNET 8
#define PIN_RELAY_COCA 7
#define PIN_BT_RX 10
#define PIN_BT_TX 11

#include <SoftwareSerial.h>
SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);

typedef struct  {
  int bebida1;
  int bebida2;
  int porcentajeBebida1;
  int porcentajeBebida2;
} Trago;

String input;
char buf[50];
char caracter;

int getInput() {

  if(BT.available())
   {
      caracter = BT.read();
     if (caracter != '@') {
      input += caracter;
      return 0;
     }
     else {
      Serial.println(input);
      return 1;
     }

   } else{
    return 0;
   }
}

void sendMessage(String message) {
  BT.println(message);
}

Trago parseInput() {
  Trago trago;

  char aux[input.length() + 1];
  input.toCharArray(aux, input.length()+ 1);

  char *token = strtok(aux, "|");

  if(strcmp(token, "FERNET") == 0) {
    trago.bebida1 = PIN_RELAY_FERNET;
    // trago.bebida2 = PIN_RELAY_COCA;
  }
  else if(strcmp(token, "COCA") == 0) {
    trago.bebida1 = PIN_RELAY_COCA;
  }

  for(int i = 0; i < 2; i++) {
    token = strtok(NULL, "|");
    Serial.print("token: ");
    Serial.println(token);
    if(i == 0) {
      trago.porcentajeBebida1 = atoi(token);
    }
    else if(i == 1) {
      if(strcmp(token, "FERNET") == 0) {
        trago.bebida2 = PIN_RELAY_FERNET;
      }
      else if(strcmp(token, "COCA") == 0) {
        Serial.println("entro acaaa");
        trago.bebida2 = PIN_RELAY_COCA;
      }
    }
  }
  Serial.print("trago 1:");
  Serial.println(trago.bebida1);

  Serial.print("trago 2:");
  Serial.println(trago.bebida2);

  trago.porcentajeBebida2 = 100 - trago.porcentajeBebida1;

  return trago;
}
