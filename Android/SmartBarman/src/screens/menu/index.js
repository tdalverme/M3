import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  DeviceEventEmitter ,
  Alert
} from 'react-native';
import TouchID from 'react-native-touch-id';
import { SensorManager } from 'NativeModules';
import ButtonMenu from '../../utils/ButtonMenu';
import { NavigationEvents } from 'react-navigation';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 10,
  },
  containerHorizontal: {

    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  containerVertical: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'italic',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },

});

const config = {
  title: 'Autenticación requerida', // Android
  imageColor: '#efb810', // Android
  imageErrorColor: '#D8000C', // Android
  sensorDescription: 'Posicione su huella en el lector', // Android
  sensorErrorDescription: 'No autorizado', // Android
  cancelText: 'Cancelar', // Android
  unifiedErrors: true, // use unified error messages (default false)
};

const authenticate = (navigation, page) => {
  TouchID.isSupported(config)
    .then((supported) => {
      if (supported) {
        TouchID.authenticate('Es necesario autenticarse para continuar', config)
          .then((success) => {
            navigation.navigate(page);
          })
          .catch(() => {
            console.warn('Error al autenticarse');
          });
      } else {
        navigation.navigate(page);
      }
    })
    .catch((error) => {
      // Failure code
      console.log(error);
      navigation.navigate(page);
    });
};


const subscribeAcelerometer = (navigation )=> {
  const sensibility = 20
  SensorManager.startAccelerometer(100); // To start the accelerometer with a minimum delay of 100ms between events.
  DeviceEventEmitter.addListener('Accelerometer', function (data) {
    let aceleracion = Math.sqrt(Math.pow(data.x,2)+Math.pow(data.y,2)+Math.pow(data.z,2))
    if(aceleracion > sensibility ){
      SensorManager.stopAccelerometer()
      Alert.alert("¿Querés un fernet ya?", 
      "",
      [
      {text: "Ahora no" },
      {text: "See", onPress: () => {
        unSubscribeAcelerometer()
        navigation.navigate('Connection',{tragoAuto:true})

      }}
      ])
      setTimeout(()=>SensorManager.startAccelerometer(100),1000)
    }
  });
}
const unSubscribeAcelerometer = (navigation )=> {
  DeviceEventEmitter.removeListener('Accelerometer')
  SensorManager.stopAccelerometer();
}
const Menu = ({ navigation }) => {
  realm = new Realm({ path: 'UserDatabase.realm' });
  realm.write(() => {
    if (
      realm.objects('Drink').filter((aux) => aux.name === 'Fernet con COCA')
        .length == 0
    ) {
      realm.create('Drink', {
        name: 'Fernet con Coca',
        ingredient1: 'FERNET',
        ingredient1Percentage: 30,
        ingredient2: 'COCA',
        graduacionAlc: 39,
      });
    }
    if (
      realm.objects('Drink').filter((aux) => aux.name === 'Gancia con Sprite')
        .length == 0
    ) {
      realm.create('Drink', {
        name: 'Gancia con Sprite',
        ingredient1: 'GANCIA',
        ingredient1Percentage: 30,
        ingredient2: 'SPRITE',
        graduacionAlc: 39,
      });
    }
  });


  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>

      <ImageBackground
        style={{
          flex: 1,
          alignItems: 'center',
        }}
        source={require('../../../assets/menu_principal.jpg')}
      >
        <NavigationEvents
          onDidFocus={()=>subscribeAcelerometer(navigation)}
          onWillBlur={()=>unSubscribeAcelerometer(navigation)}
        />
        <View style={{ flex: 0.7 }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            <Text style={styles.title}>SmartBarman</Text>
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            <ButtonMenu
              title="Preparar un trago"
              onPress={() => { navigation.navigate('Home'); }}
            />

            <ButtonMenu
              title="Ver mi estado alcohólico"
              onPress={() => { navigation.navigate('Records') }}
            />
            <ButtonMenu
              title="Editar mis Datos"
              onPress={() => { navigation.navigate('Register',{editarDatos}); }}
            />

          </View>
        </View>
      </ImageBackground>

    </View>

  );
};
Menu.navigationOptions = ({ navigation }) => ({
  header: null,
});

export default Menu;
