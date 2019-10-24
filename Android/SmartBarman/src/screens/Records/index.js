import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  View
} from 'react-native';

const Realm = require('realm');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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

let realm;

export default class Records extends PureComponent {
  state = {
    loading: true,
    data : []
  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });

  }
  async componentDidMount() {
    // #Descomentar para generar lote de prueba 
    // realm.write(() => {        
    //   realm.create('Ingested',{ bebida: 'Fernet de Coca',
    //                            porcentajeAlcoholico : 0.30,
    //                            fecha : '10/10/2019',
    //                            puntaje : 1
    //                          });
    // });
    // realm.write(() => {        
    //   realm.create('Ingested',{ bebida: 'Gancia con Sprite',
    //                            porcentajeAlcoholico : 0.20,
    //                            fecha : '10/10/2019',
    //                            puntaje : -1
    //                          });
    // });
    // realm.write(() => {        
    //   realm.create('Ingested',{ bebida: 'Agua',
    //                            porcentajeAlcoholico : 0.00,
    //                            fecha : '10/10/2019',
    //                            puntaje : 1
    //                          });
    // });
    // realm.write(() => {        
    //   realm.create('Ingested',{ bebida: 'fernet con coca',
    //                            porcentajeAlcoholico : 0.10,
    //                            fecha : '10/10/2019',
    //                            puntaje : 7
    //                          });
    // });
    // for (let index = 0; index < 100; index++) {
    //   realm.write(() => {        
    //     realm.create('Ingested',{ bebida: 'fernet con coca',
    //                              porcentajeAlcoholico : 0.10,
    //                              fecha : '10/10/2019',
    //                              puntaje : 7
    //                            });
    //   });
    // }
    let r = realm.objects('Ingested')
    this.setState({data:r,loading:false})
  }

  render() {
    const { loading, data } = this.state;

    return (
      loading?
      <View style={styles.cargando}>
       <ActivityIndicator/>
      </View>
      :
      <View  style={styles.container}>
      <FlatList  
      keyExtractor = {(item, index) => index.toString()}
      data = {data} 
      renderItem = {({ item }) => (
        <View style = {styles.containerHorizontal}>
          <View style = {styles.containerVertical}>
            <Text >
               { item.bebida }
            </Text>
          </View>
          <View style = {styles.containerVertical}>
            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}> 
                <Text>Alcohol </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  {parseFloat(item.porcentajeAlcoholico).toFixed(2)}% 
                </Text> 
              </View>  
            </View>
          
            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}>
                <Text>Fecha </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  { item.fecha } 
                </Text>
              </View>
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal} >
                <Text>Puntaje </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {styles.textLeft}>
                  { item.puntaje } 
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      />
    </View>

    );
  }
}
Records.navigationOptions = ({navigation}) => {
  return({
    headerTitle:'Historial de Tragos',
  })
}
