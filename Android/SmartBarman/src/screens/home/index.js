import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  FlatList,
  TouchableOpacity
} from 'react-native';

import BluetoothSerial, {
  withSubscription
} from "react-native-bluetooth-serial-next";

import HomeScreen from './HomeScreen';
import FillingGlassHOC from './FillingGlassHOC';


const HOCComponent = FillingGlassHOC(HomeScreen);

class Home extends Component {
  state = {
    glassDetected: false,
    filling: false
  };

  async componentDidMount() {
    this.events = this.props.events;

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
    });

    BluetoothSerial.read(
      (data, intervalId) => {
        const message = data.replace(/(\r\n|\n|\r)/gm, "");
        this.processData(message);
        if (intervalId) {
          clearInterval(intervalId);
        }
      },
      "\r\n"
    );
  }

  parseMessage = (message) => {
    const parsed = message.split("|");
    return {
      type: parsed[0],
      data: parsed[1]
    }
  }

  processData = (message) => {
    const {type, data} = this.parseMessage(message);
    switch (type) {
      case 'detected':
        this.setState({glassDetected: data === 'true'});
        break;
      case 'filling':
        this.setState({filling: data === 'true'});
        break;
      default:
    }
  }

  startFilling = async () => {
    console.warn('startFilling');
    await BluetoothSerial.clear();
    await BluetoothSerial.write("FERNET|30|COCA@");
  }

  render() {
    const { glassDetected, filling } = this.state;
    return (
      <HOCComponent filling={filling} glassDetected={glassDetected} startFilling={this.startFilling} />
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(Home);
