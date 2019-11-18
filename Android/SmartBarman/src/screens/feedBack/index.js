import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  View,
  Picker,
  ImageBackground  
} from 'react-native';
import ButtonMenu from '../../utils/ButtonMenu'
import Slider from "react-native-slider"
import TextInfo from '../../utils/TextInfo'
const Realm = require('realm');


const styles = StyleSheet.create({
 
  text:{
      textAlign:'center',
      color:'white',
      fontWeight:'bold',
      fontSize:20
  },
 
})


let realm;
export default class RegisterScreen extends PureComponent {
  state = {
    value : 0,
    textColor :1

  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.navigation = props.navigation;
  }

  actualizarGraduacion = () =>{
    const valor = -this.state.value;
    realm = new Realm({ path: 'UserDatabase.realm' });
    this.bebida = realm.objects('Drink').filter(aux=>aux.name == 'Fernet con Coca')[0];
    realm.write(() => {
      this.bebida.ingredient1Percentage = this.bebida.ingredient1Percentage + parseInt(valor);
    });
    this.navigation.navigate('Records')
  }
  handleChange = (value) =>{
    let thumbTintColor;
    let textColor;
    const valueAux = Math.abs(value);
    if(value == 0 ){
      textColor = 1
    }else if (value > 0 ){
      textColor = 2
    }else if (value < 0 ){
      textColor = 0
    }
    this.setState({value:value,textColor})
  }

  render() {
    return (
        
      <ImageBackground style={{
        flex:1
      }}
      source={require('../../../assets/seleccion_bebida.jpg')}>
        <View style= {{flex:0.6,justifyContent:'space-between',opacity:1}}  >
         
          <View style ={{flex:0.4,justifyContent:'center',justifyItems:'center',alignItems:'center'}}>
              <Text style={styles.text}>¿Qué tal el {this.navigation.getParam('bebida')}?</Text>
              <TextInfo title={'SmartBarman aprende de tu historial'} color={false}/>
          </View>
          <View style={{flex:0.6,padding:50}}>
            <View style= {{flex:0.5,flexDirection:'row',justifyContent:'space-around'}}>
              <View>
                <TextInfo title={'Flojito'} color={this.state.textColor==0?true:false}/>
              </View>
              <View>
                <TextInfo title={'Ideal'} color={this.state.textColor==1?true:false}/>
              </View>
              <View>
                <TextInfo title={'Fuerte'} color={this.state.textColor==2?true:false}/>
              </View>
            </View>
            <Slider 
                thumbTintColor = {'#efb810'}
                minimumValue={-10}
                maximumValue={10}
                step={1}
              value={this.state.value || 0}
              onValueChange={valor=>this.handleChange(valor)}
            />
            
            <View>
            <ButtonMenu title={'Finalizar'}
              onPress={this.actualizarGraduacion}/>
        
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }
}
