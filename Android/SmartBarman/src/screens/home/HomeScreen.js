import React, { PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  ToastAndroid,
  FlatList,
  TouchableHighlight,
  Picker,
  ImageBackground,
  Image,
} from 'react-native';
import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import ButtonMenu from '../../utils/ButtonMenu';
import ButtonSlider from '../../utils/ButtonSlider';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  mensaje: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
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
  contenedor: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.2,
    backgroundColor: '#D8000C',
  },
});

const GlassDetectedMessage = ({ detected, filling }) => {
  if (!detected && !filling) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>El vaso no está en posición</Text>
      </View>
    );
  }
};
let realm;

class HomeScreen extends PureComponent {
  render() {
    const {
      glassDetected, startFilling, filling, bebidas, currentDrink, changeCurrentDrink,
    } = this.props;

    return (
      <View style={styles.container}>
        <ImageBackground
          style={{
            flex: 1,
          }}
          source={require('../../../assets/seleccion_bebida.jpg')}
        >
          <View style={{
            flex: 0.7,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <View style={{
              flex: 0.8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            >
              <ButtonSlider
                title={'<'}
                onPress={() => {
                  if (currentDrink - 1 >= 0) {
                    changeCurrentDrink(currentDrink - 1);
                  }
                }}
              />
              <Image style={{ width: 200, height: 200 }} source={currentDrink === 0 ? require('../../../assets/fernet.jpg') : require('../../../assets/ron-con-coca-cola.jpg')} />
              <ButtonSlider
                title={'>'}
                onPress={() => {
                  if (currentDrink + 1 < bebidas.length) {
                    changeCurrentDrink(currentDrink + 1);
                  }
                }}
              />
            </View>
            <View style={{ flex: 0.2, justifyContent: 'flex-start' }}>
              <Text style={styles.text}>{bebidas[currentDrink] ? bebidas[currentDrink].name : ''}</Text>
            </View>
          </View>
          <View style={{ flex: 0.3, alignItems: 'center' }}>
            <ButtonMenu title="Comenzar" onPress={() => { startFilling(bebidas[currentDrink]); }} />

          </View>
          <View style={{ flex: 0.5, justifyContent: 'flex-end' }}>
            {!filling && <GlassDetectedMessage detected={glassDetected} filling={filling} />}
          </View>
        </ImageBackground>
      </View>
    );
  }
}

HomeScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: 'Estado Alcohólico',
  headerLeft: (<View />),
});

export default HomeScreen;
