import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Button,
  Image,
  View
} from 'react-native';


const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 10,
  },
  containerHorizontal:{

    flex: 1,
    flexDirection : 'row',
    justifyContent: 'space-between',
    flexWrap : "nowrap",
  },
  containerVertical:{
    flex: 1,
    flexDirection : 'column',
    justifyContent: 'space-between',
    flexWrap : "nowrap",
    padding: 8,
    borderBottomWidth :1,
    borderBottomColor: 'grey'
  },
  cargando:{
    flex: 1,
    alignItems:'center',
    justifyContent:'center'
  },
  title: {
    fontSize: 22,
    color: 'black',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },

});


const Menu = ({navigation})=> {
    return (
    <View style={{flex:1}}>
        
        <Image source ={require('./menu_principal.jpg')} />
        <View style={styles.container}>
            
            <Button title = "Preparar un trago"
            onPress={()=>{navigation.navigate('Home')}}/>
            <Button title = "Ver mi estado alcoholico"
            onPress={()=>{navigation.navigate('Records')}}/>
            <Button title = "Editar mis datos"
            onPress={()=>{navigation.navigate('')}}/>
        </View>

    </View>

    );
  
}
Menu.navigationOptions = ({navigation}) => {
  return({
    headerTitle:'SmartDrink',
  })
}
export default Menu;
