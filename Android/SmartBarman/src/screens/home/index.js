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

class Home extends Component {
  state = {
    glassDetected: false
  };



  async componentDidMount() {
    this.events = this.props.events;

    this.events.on("bluetoothDisabled", () => {
      ToastAndroid.show("Bluetooth desactivado.", ToastAndroid.SHORT);
      console.warn('Se desactivo el bluetooth');
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
        console.warn(data);
        this.setState({glassDetected: data === 'true'});
        break;
      default:
    }
  }

  render() {
    const { glassDetected } = this.state;
    return (
      <HomeScreen glassDetected={glassDetected} />
    );
  }
}


export default withSubscription({
    subscriptionName: 'events',
    destroyOnWillUnmount: true,
})(Home);
