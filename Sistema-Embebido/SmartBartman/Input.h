#define PIN_RELAY_FERNET 8
#define PIN_RELAY_COCA 7
#define PIN_BT_RX 10
#define PIN_BT_TX 11

#include <SoftwareSerial.h>
SoftwareSerial BT(PIN_BT_RX, PIN_BT_TX);

typedef struct {
    char bebida1[10];
    char bebida2[10];
    int bebida1Porcentaje;
    int bebida2Porcentaje;
} Trago;

String getMessage() {
  String readString = "";

  while (BT.available()) {
    delay(10);
    char c = Serial.read();
    if (c == '@') {
      break;
    }
    readString += c;
  }

  if (readString.length() > 0) {
    String log = "Recibe: " + readString;
    Serial.println(log);
    return readString;
  }
  Serial.println("Input no disponible");
  return readString;
}

void sendMessage(String message) {
  BT.println(message);
}

Trago parseInput(char* input){
    char* tokens[3];
    Trago tragoRecibido;

    tokens[0] = strtok(input,"|");
    for(int i = 1; i < 3; i++){
        tokens[i] = strtok(NULL,"|");
    }
    strcpy(tragoRecibido.bebida1, tokens[0]);
    tragoRecibido.bebida1Porcentaje = atoi(tokens[1]);
    strcpy(tragoRecibido.bebida2, tokens[2]);
    tragoRecibido.bebida2Porcentaje = 100 - tragoRecibido.bebida1Porcentaje;

    return tragoRecibido;
}
