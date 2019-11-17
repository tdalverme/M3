import React, {PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity
} from 'react-native';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    margin: 10,
  },

  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

class ConnectionScreen extends PureComponent {
  static navigationOptions = {
    headerTitle:'Detalle Estado Alcohólico',
  }
  state = {
    devices: [],
    data: '',
    connected: false,
    processing: false,
    message: 'No estas conectado al Smart Barman',
    isEnabled: false,
  };

  constructor(props){
    super(props)
    this.navigation = props.navigation
  }

  async componentDidMount() {

    this.events = this.props.events;
    this.events.on("bluetoothEnabled", () => {
      ToastAndroid.show("Bluetooth activado.", ToastAndroid.SHORT);
      this.setState({ isEnabled: true });
    });

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
      this.setState({ isEnabled: false, connected: false });
    });

    this.events.on("connectionSuccess", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          '¡Conectado a SmartBarman!',
          ToastAndroid.SHORT
        );
      }
    });

    this.events.on("connectionFailed", ({ device }) => {
      if (device) {
        ToastAndroid.show('No se pudo conectar a SmartBarman.', ToastAndroid.SHORT);
      }
    });

    this.events.on("connectionLost", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          'Se perdió la conexión con SmartBarman',
          ToastAndroid.SHORT
        );
      }
    });
    
  }

  findDevices = async () => {
    try {
      this.setState({ processing: true, message: 'Buscando a SmartBarman' });

      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ]);

      this.setState({isEnabled, processing: isEnabled});
      if(isEnabled) {
        const arduinoBluetooth = devices.filter((device) => device.name === 'HC-05 ')[0];
        if(arduinoBluetooth) {
          this.setState({device: arduinoBluetooth});
          this.connect(arduinoBluetooth.id);

        } else {
          ToastAndroid.show('No se encontró el dispositivo, asegurese que SmartBarman esté conectado.',ToastAndroid.SHORT);
        }
      }

    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
    }
  }

  

  connect = async id => {

    this.setState({ processing: true, message: 'Conectandose a SmartBarman' });

    try {
      const isConnect = await BluetoothSerial.device(id).isConnected();
      let connected = isConnect;
      if(!connected){
        connected = await BluetoothSerial.device(id).connect();
      }

      if ( connected ) {
        this.setState({ processing: false, connected });
        this.navigation.navigate('Home')
      } else {
        ToastAndroid.show('No se pudo conectar a SmartBarman.', ToastAndroid.SHORT);
        this.setState({ processing: false, connected });
      }
    } catch (e) {
      ToastAndroid.show('Ocurrió un error al intentar conectarse a SmartBarman.', ToastAndroid.SHORT);
      this.setState({ processing: false, connected: false });
    }
  };

  askForPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Acceso a la ubicación',
          message:
            'Para poder conectar el bluetooth necesitamos acceso a la ubicación',
          buttonNegative: 'No quiero conectarme',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.scanAndConnect();
      } else {
        console.warn('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const { connected, processing,isEnabled,message } = this.state;
    return (
      <View style={styles.container}>
        <View style={{flex: 0.3}}>
          <Text style={styles.welcome}>Smart Barman</Text>
        </View>
          <View>
            
            <Text style={{padding: 10, color: 'black'}}>Bluetooth: {isEnabled?'Habilitado':'Deshabilitado'}</Text>
            <Text style={{padding: 10, color: 'black'}}>Vinculación:{connected?'Conectado':'Desconectado'} </Text>
          </View>
          {
            processing && 
            <ActivityIndicator size="large" color="#0000ff" />
          }
          {
            !processing &&  
            <TouchableOpacity
              style={{backgroundColor: 'blue', margin: 20}}
              onPress={() => this.findDevices()}>
              <Text style={{color: 'white', padding: 10}}>{connected?'Recargar':'Conectar'} </Text>
            </TouchableOpacity>
          }
      </View>
    );
  }
}



export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(ConnectionScreen);
