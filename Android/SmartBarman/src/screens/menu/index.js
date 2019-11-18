import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground
} from 'react-native';
import ButtonMenu from '../../utils/ButtonMenu'
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
    fontFamily:'italic',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },

});


const Menu = ({ navigation }) =>{
  realm = new Realm({ path: 'UserDatabase.realm' });
  realm.write(() => {        
      if (
          realm.objects('Drink').filter((aux)=>aux.name === 'Fernet con COCA')
          .length == 0
      ) {
          realm.create('Drink',{
            name: 'Fernet con Coca',
            ingredient1 : 'FERNET',
            ingredient1Percentage : 30,
            ingredient2 : 'COCA',
            graduacionAlc : 39
          });
      }
      if (
        realm.objects('Drink').filter((aux)=>aux.name === 'Gancia con Sprite')
        .length == 0
    ) {
        realm.create('Drink',{
          name: 'Gancia con Sprite',
          ingredient1 : 'GANCIA',
          ingredient1Percentage : 30,
          ingredient2 : 'SPRITE',
          graduacionAlc : 39
        });
    }
  })
  
  
  return( 
    <View style={{ flex: 1,backgroundColor:'red' }}>
      
      <ImageBackground style={{
          flex:1,
          alignItems:'center'
        }} 
        source={require('../../../assets/menu_principal.jpg')}>
        <View style={{flex:0.7}}>
            <View style={{flex:0.4,justifyContent:'center'}}>
              <Text style={styles.title}>SmartBarman</Text>
            </View>
            <View  style={{flex:0.6,justifyContent:'flex-start',}}>
              <ButtonMenu  title="Preparar un trago" 
              onPress={() => { navigation.navigate('Connection'); }}/>

              <ButtonMenu  title="Ver mi estado alcohólico"
              onPress={() => { navigation.navigate('Records'); }}/>

              <ButtonMenu  title="Agregar Huella"
              onPress={() => { navigation.navigate(''); }}/>
            </View>
        </View>
      </ImageBackground>

    </View>

  );
}
Menu.navigationOptions = ({navigation}) => {
  return({
    header:null
  })
}

export default Menu;
