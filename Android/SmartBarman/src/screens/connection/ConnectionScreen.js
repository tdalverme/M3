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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 24,
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
    message: 'No estas conectado al Smart Barman'
  };

  async componentDidMount() {
    this.events = this.props.events;

    this.findDevices();

    this.events.on("bluetoothEnabled", () => {
      ToastAndroid.show("Bluetooth enabled", ToastAndroid.SHORT);
      this.setState({ isEnabled: true });
    });

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth disabled", ToastAndroid.SHORT);
      this.setState({ isEnabled: false });
    });

    this.events.on("connectionSuccess", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          '¡Conectado al SmartBarman!',
          ToastAndroid.SHORT
        );
      }
    });

    this.events.on("connectionFailed", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          `Failed to connect with device ${device.name}<${device.id}>`,
          ToastAndroid.SHORT
        );
      }
    });

    this.events.on("connectionLost", ({ device }) => {
      if (device) {
        ToastAndroid.show(
          `Device ${device.name}<${device.id}> connection has been lost`,
          ToastAndroid.SHORT
        );
      }
    });

    this.events.on("data", result => {
      if (result) {
        const { id, data } = result;
        console.log(`Data from device ${id} : ${data}`);
        this.setState({data})
      }
    });

    this.events.on("error", e => {
      if (e) {
        console.log(`Error: ${e.message}`);
        ToastAndroid.show(e.message, ToastAndroid.SHORT);
      }
    });
  }

  findDevices = async () => {
    try {
      this.setState({ processing: true, message: 'Buscando al SmartBarman' });
      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ]);

      const arduinoBluetooth = devices.filter((device) => device.name === 'HC-05')[0];

      if(arduinoBluetooth) {
        this.setState({device: arduinoBluetooth});
        this.connect(arduinoBluetooth.id);

      } else {
        ToastAndroid.show('No se encontró el arduino, asegurese que el smartbarman esté conectado.');
      }
    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
    }
  }

  connect = async id => {
    this.setState({ processing: true, message: 'Conectandose al SmartBarman' });

    try {
      const connected = await BluetoothSerial.device(id).connect();

      if (connected) {
        this.setState({ processing: false, connected });

        BluetoothSerial.read(
          (data, intervalId) => {
            console.log(data);

            if (intervalId) {
              clearInterval(intervalId);
            }
          },
          "\r\n"
        );
      } else {
        ToastAndroid.show('No se pudo conectar al SmartBarman.', ToastAndroid.SHORT);
        this.setState({ processing: false, connected });
      }
    } catch (e) {
      ToastAndroid.show('Ocurrió un error al intentar conectarse al SmartBarman.', ToastAndroid.SHORT);
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
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
    const { processing, connected, message } = this.state;
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
          connected && !processing &&
          <TouchableOpacity
            style={{backgroundColor: 'green', margin: 20}}
            onPress={() => navigation.navigate('Home')}>
            <Text style={{color: 'white', padding: 10}}> COMENZAR </Text>
          </TouchableOpacity>
        }
        {
          !connected && !processing &&
          <TouchableOpacity
            style={{backgroundColor: 'blue', margin: 20}}
            onPress={() => this.findDevices()}>
            <Text style={{color: 'white', padding: 10}}> CONECTAR AL ARDUINO </Text>
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
