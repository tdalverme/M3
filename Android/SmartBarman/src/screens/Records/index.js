import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Image,
  Button
} from 'react-native';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: 'space-between',

    backgroundColor: 'white',
    padding: 10,
  },
  

});

let realm;

export default class Records extends PureComponent {
  state = {
    loading: true,
    graduacionAlc : null,
  };

  async componentDidMount() {
    realm = new Realm({ path: 'UserDatabase.realm' });
    //Auto Genera lote de prueba
    realm.write(() => {        
      realm.create('Ingested',{ bebida: 'Fernet de Coca',
                               graduacionAlc : 0.30,
                               fecha : '10/10/2019',
                               cantidad : 250.00
                             });
    });
    realm.write(() => {        
      realm.create('Ingested',{ bebida: 'Gancia con Sprite',
                               graduacionAlc : 0.20,
                               fecha : '10/10/2019',
                               cantidad : 250
                             });
    });
    realm.write(() => {        
      realm.create('Ingested',{ bebida: 'Agua',
                               graduacionAlc : 0.00,
                               fecha : '10/10/2019',
                               cantidad : 50
                             });
    });
    realm.write(() => {        
      realm.create('Ingested',{ bebida: 'fernet con coca',
                               graduacionAlc : 0.10,
                               fecha : '10/10/2019',
                               cantidad : 7
                             });
    });
    // for (let index = 0; index < 100; index++) {
    //   realm.write(() => {        
    //     realm.create('Ingested',{ bebida: 'fernet con coca',
    //                              graduacionAlc : 0.10,
    //                              fecha : '10/10/2019',
    //                              cantidad : 7
    //                            });
    //   });
    // }
    //fin lote de prueba

    let tragos = realm.objects('Ingested').filter(aux=>1==1)
    let aux = 0 ;
    tragos.forEach(t0 => {
      aux += t0.graduacionAlc * t0.cantidad      
    });
    
    this.setState({graduacionAlc:aux,loading:false})
  }

  render() {
    const { loading, graduacionAlc } = this.state;

    return (
      loading?
      <View style={styles.cargando}>
       <ActivityIndicator/>
      </View>
      :
      <View style={styles.container}>
        <View style={{paddingTop:10}}>  
          <Text>Tu nivel de alcohol en sangre es de {parseFloat(graduacionAlc).toFixed(2)} G/l</Text>
          <Text>Tu nivel es <Text style={{fontWeight:'bold'}}>{'moderado'}</Text></Text>
        </View>
        <Image style={{width:'100%'}}
        source ={require('./moderado.png')} />
        <Button title="Ver Detalle"  
        onPress={({navigation})=>{this.props.navigation.navigate('RecordsDetail');}}/>
      </View>

    );
  }
}
Records.navigationOptions = ({navigation}) => {
  return({
    headerTitle:'Estado Alcoholico',
  })
}
