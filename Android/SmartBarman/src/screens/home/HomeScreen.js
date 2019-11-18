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
  Image
} from 'react-native';
import ButtonMenu from '../../utils/ButtonMenu'
import ButtonSlider from '../../utils/ButtonSlider'
const Realm = require('realm');

import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text:{
    color:'white',
    textAlign:'center',
    fontSize:22,
    fontWeight:'bold'
  },
  mensaje:{
    fontSize:22,
    color:'white',
    textAlign:'center'
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
    flex: 0.13,
    backgroundColor: '#393D42'
  }
});

const GlassDetectedMessage = ({ detected }) => {
  if (!detected) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>{'El vaso no está en posición'}</Text>
      </View>
    );
  }
};
let realm;
class HomeScreen extends PureComponent {
  
  state = {
  
  };
  constructor(props){
    super(props)
    this.navigae = props.navigate
    this.glassDetected = this.props.glassDetected
    this.startFilling = this.props.startFilling
    this.navigateMenuHome = this.props.navigateMenuHome
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink')
   
  }
  render(){
    let serviceBebida = this.bebida.map( (s, i) => {
      return <Picker.Item key={s.name} value={s.name} label={s.name} />
    });

    return(
      <View style={styles.container}>
        <ImageBackground style={{
          flex:1,
        }}
        source={require('../../../assets/seleccion_bebida.jpg')}>       
         
          <View style={{ flex: 0.7,
                        flexDirection: 'column',
                        justifyContent:'center',
                        alignItems:'center'}}>
            <View style={{flex:0.8,flexDirection:'row',
                                  justifyContent:'space-between',
                                  alignItems:'center'}}>
              
              
            <ButtonSlider title={'<'} onPress={()=>ToastAndroid.show("No se encontraron tragos", ToastAndroid.SHORT)}/>
            <Image style={{width:200,height:200}} source={require('../../../assets/fernet.jpg')} />
            <ButtonSlider title={'>'} onPress={()=>ToastAndroid.show("No se encontraron tragos", ToastAndroid.SHORT)}/>
            

            </View>
            <View style={{flex:0.2,justifyContent:'flex-start'}}>
              <Text style={styles.text}>Fernet con Coca</Text>
            </View>
            {/* <Picker  
              selectedValue={this.state.value|| '0'}
              items={this.bebida}
              onValueChange={(valor,indice) => {
                this.setState({bebida:valor.name})  
              }}>
                {serviceBebida}
            </Picker> */}
          </View>
          <View style={{flex:0.3,alignItems:'center'}}>
            <ButtonMenu title={'Comenzar'} onPress={this.startFilling}/>
          {/* <ButtonMenu title={'Volver al Inicio'} onPress=/> */}

          </View>
          <View style={{flex:0.5,justifyContent:'flex-end'}}>
            <GlassDetectedMessage detected={this.glassDetected} />
          </View>
        </ImageBackground>   
      </View>
    );
  }
}

HomeScreen.navigationOptions = ({navigation}) => {
  return{
    headerTitle: 'Estado Alcohólico',
    headerLeft:(<View></View>)
  }
}
export default HomeScreen;
