# Proyecto SOA: Smart Barman
Sistema embebido que prepara tragos de forma automatizada.
## Presentación

**Materia:** *Sistemas Operativos Avanzados 2C2019*

**Integrantes:**
 - Dal Verme, Tomas (tdalverme)
 - De Arias, Axel (axeldearias)
 - Figueredo, Nicolas Leandro (nicofigueredo)
 - Quintero, Lucas (lucasq95)
 - Rodriguez, Maximiliano Pablo (maxiprodriguez)
 
 ## Descripción del Proyecto
 Este proyecto consiste en el desarrollo de un sistema embebido que prepara tragos manteniendo un perfil por cada usuario de acuerdo a sus preferencias.
 ## Objetivos del Sistema
 El trago ideal no existe, pero si existe el mejor trago para cada persona. El objetivo de Smart Barman es obtener las medidas del trago ideal del usuario y preparárselo. Para ello, el sistema contará con diferentes sensores y actuadores que le permitirá llevar a cabo sus funciones.
 El usuario contará con una aplicación Android en donde podrá elegir el trago a preparar e ingresar sus preferencias, para que el sistema pueda realizar la bebida a su gusto.
 ## Sensores y Actuadores
 Para cumplir con sus tareas, el sistema embebido poseerá los siguientes sensores y actuadores:
 ### Sensores
- **Celda de carga hasta 1kg. con amplificador HX711:** para realizar la medición de la cantidad de líquido.
- **Sensor de temperatura LM-35:** para medir si la bebida se encuentra fría o caliente.
- **Sensor de ultrasonido HC-SR04:** para sensar que haya un vaso antes de comenzar a servir la bebida.
### Actuadores
- **Bombas de agua sumergible 3-5V:** se encargarán de mover el líquido del recipiente conteniendo la bebida al vaso.
- **Módulo relé de 4 canales:** para poder encender y apagar las distintas bombas de agua.
- **Display 16x02:** para visualizar los tipos de bebidas que el sistema puede realizar y mostrar al usuario distintos mensajes.
- **Led:** para indicar los distintos estados del sistema (preparando trago, trago listo, etc.).
## Funcionamiento del sistema
El usuario deberá seleccionar en la aplicación Android el trago que desea tomar. A continuación, el sistema comenzará a preparar el trago de acuerdo a las preferencias del usuario (si es la primera vez, se hará con los valores por defecto). Una vez que el sistema terminó de preparar la bebida, avisará al usuario mediante la app y mediante el led que su trago está listo para retirar, notificándole si es necesario agregar hielo o no, de acuerdo a la temperatura de la bebida medida por el sistema. Posteriormente, en la aplicación se le realizarán al usuario distintas preguntas relacionadas a la preparación de la bebida (¿está frío?, ¿está muy fuerte/suave?, etc.). Luego de ingresadas las respuestas, el sistema actualizará las preferencias del usuario para la próxima vez y así obtener el trago perfecto para la persona.
## Diagramas de bloques
### Diagrama Funcional
![Diagrama Funcional](https://b.imge.to/2019/09/23/vTNCMH.jpg)
### Diagrama Físico
![Diagrama Físico](https://b.imge.to/2019/09/23/vTNsIH.jpg)
### Esquema Físico
#### Vista Frontal
![Vista Frontal](https://b.imge.to/2019/09/23/vTdidt.jpg)


#### Vista Lateral
![Vista Lateral](https://b.imge.to/2019/09/23/vTdDPy.jpg)
### Diagrama de Conexión
![Diagrama Físico](https://a.imge.to/2019/09/23/vTdWLx.jpg)
