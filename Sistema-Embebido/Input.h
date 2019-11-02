#define RELAY_PIN_1 8
#define RELAY_PIN_2 7

struct Trago {
  int bebida1;
  int bebida2;
  int porcentajeBebida1;
  int porcentajeBebida2;
};

String input;

int getInput() {
  if (Serial.available() > 0) {
    char caracter = Serial.read();
    
    if (caracter != '\n') {
      input += caracter;
      return 0;
    }
    else {
      return 1;
    }
  }
}

Trago parseInput() {
  Trago trago;
  
  char aux[input.length() + 1];
  input.toCharArray(aux, input.length()+ 1);
  
  char *token = strtok(aux, "|");

  if(strcmp(token, "FERNET")) {
    trago.bebida1 = RELAY_PIN_1;
  }
  else if(strcmp(token, "COCA")) {
    trago.bebida1 = RELAY_PIN_2;
  }
   
  for(int i = 0; i < 2; i++) {
    token = strtok(NULL, "|");
     
    if(i == 0) {
      trago.porcentajeBebida1 = atoi(token);
    }
    else if(i == 1) {
      if(strcmp(token, "FERNET")) {
        trago.bebida2 = RELAY_PIN_1;
      }
      else if(strcmp(token, "COCA")) {
        trago.bebida2 = RELAY_PIN_2;
      }
    }
  }

  trago.porcentajeBebida2 = 100 - trago.porcentajeBebida1;

  return trago;
}
