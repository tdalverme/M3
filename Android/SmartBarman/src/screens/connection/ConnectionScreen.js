import React, {PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ActivityIndicator,
  ToastAndroid,
  FlatList,
  TouchableOpacity
} from 'react-native';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";

import { findDevices } from '../../utils/Bluetooth';

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
    headerMode: 'none',
    header: null,
  }

  state = {
    devices: [],
    data: '',
    connected: false,
    processing: false,
    message: 'No estas conectado al Smart Barman',
    isEnabled: false,
  };

  async componentDidMount() {
    this.events = this.props.events;

    this.findDevices();

    this.events.on("bluetoothEnabled", () => {
      ToastAndroid.show("Bluetooth activado.", ToastAndroid.SHORT);
      this.findDevices();
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
          console.warn(arduinoBluetooth)  
        if(arduinoBluetooth) {
          this.setState({device: arduinoBluetooth});
          this.connect(arduinoBluetooth.id);

        } else {
          ToastAndroid.show('No se encontró el dispositivo, asegurese que SmartBarman esté conectado.');
        }
      }

    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
    }
  }

  connect = async id => {
    this.setState({ processing: true, message: 'Conectandose a SmartBarman' });

    try {
      const connected = await BluetoothSerial.device(id).connect();

      if (connected) {
        this.setState({ processing: false, connected });
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
    const { processing, connected, message, isEnabled } = this.state;
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={{flex: 0.3}}>
          <Text style={styles.welcome}>Smart Barman</Text>
        </View>
        {
          processing &&
          <View>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{padding: 10, color: 'black'}}>{message}</Text>
          </View>
        }

        {
          isEnabled && connected && !processing &&
          <TouchableOpacity
            style={{backgroundColor: 'green', margin: 20}}
            onPress={() => navigation.navigate('Register')}>
            <Text style={{color: 'white', padding: 10}}> COMENZAR </Text>
          </TouchableOpacity>
        }
        {
          isEnabled && !connected && !processing &&
          <TouchableOpacity
            style={{backgroundColor: 'blue', margin: 20}}
            onPress={() => this.findDevices()}>
            <Text style={{color: 'white', padding: 10}}> CONECTARSE </Text>
          </TouchableOpacity>
        }

        {
          !isEnabled &&
          <Text style={{padding: 10, color: 'black'}}>Debe activar el bluetooth para comenzar.</Text>
        }

      </View>
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(ConnectionScreen);
