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
  
  title: {
    fontSize: 22,
    color: 'black',
    textAlign: 'center',
  },
  section: {
    flex: 0.2,
    margin: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    flex: 0.5,
    color: 'black',
    fontSize: 18,
  },
  picker: {
    flex: 0.5,
    height: 40,
    width: '100%',
    alignSelf: 'center',
    fontSize: 18,
  },
});

let realm;

export default class Records extends PureComponent {
  state = {
    loading: true,
    data : [{key:'a1',bebida:'axel'}]
  };

  constructor(props) {
    super(props);
    realm = new Realm({ path: 'UserDatabase.realm' });

  }
  async componentDidMount() {

    
   
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
      <View  style={styles.container}>
      <FlatList  
      keyExtractor = {(item, index) => index.toString()}
      data = {data} 
     
      // data= {[
      //   {key:'1',name:"asdasd"},
      //   {key:'2',name:"asdasgd"},
      //   {key:'3',name:"asdassd"}
      // ]}
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
                <Text style= {{textAlign:'left'}}>{ parseFloat(item.porcentajeAlcoholico).toFixed(2)}% </Text> 
              </View>  
            </View>
          
            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal}>
                <Text>Fecha </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {{textAlign:'left'}}>{ item.fecha } </Text>
              </View>
            </View>

            <View style = {styles.containerHorizontal}>
              <View style = {styles.containerHorizontal} >
                <Text>Puntaje </Text>
              </View>
              <View style = {styles.containerHorizontal}>
                <Text style= {{textAlign:'left'}}>{ item.puntaje } </Text>
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
