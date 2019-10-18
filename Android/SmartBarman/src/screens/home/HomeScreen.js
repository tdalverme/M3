import React, {PureComponent} from 'react';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

const GlassDetectedMessage = ({ detected }) => {
  if(detected) {
    return (
      <View style={{width: '100%', backgroundColor: 'green', flex: 0.1, selfAlign: 'flex-start', alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{color: 'white', padding: 10 }}> El vaso está en posición </Text>
      </View>
    )
  }
  return (
    <View style={{width: '100%', backgroundColor: 'red', flex: 0.1, selfAlign: 'flex-start', alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: 'white', padding: 10 }}> Posicione el vaso para comenzar </Text>
    </View>
  )
}

const HomeScreen = ({ glassDetected }) => {
  return (
    <View style={styles.container}>
      <GlassDetectedMessage detected={glassDetected} />
    </View>
  );
}

export default HomeScreen;
