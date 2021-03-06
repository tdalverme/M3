import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';
import {
  Text,
  View,
  TouchableHighlight
} from 'react-native';

import MenuScreen from './screens/menu';
import HomeScreen from './screens/home';
import ConnectionScreen from './screens/connection/ConnectionScreen';
import HomeScreenComponent from './screens/home/HomeScreen';
import RegisterScreen from './screens/register';
import RecordsScreen from  './screens/Records/';
import RecordsDetailScreen from  './screens/Records/detail.js';
import feedBack from  './screens/feedBack';

const Stack = createStackNavigator({
  Records: RecordsScreen ,
  RecordsDetail : RecordsDetailScreen,
  Menu: MenuScreen,
  Home: HomeScreen,
  Connection: ConnectionScreen,
  Register: RegisterScreen,
  FeedBack: feedBack,
  homeScreenComponent: HomeScreenComponent
}, {
  initialRouteName: 'Register',

  defaultNavigationOptions: ({ navigation }) =>(    {
    headerLeft:(
      <View style={{flex:1}}>
        <TouchableHighlight onPress={()=>navigation.navigate('Menu')}>
          <Text style = {{padding:20,fontSize:30,color:'#efb810'}}>{'<'}</Text>
          </TouchableHighlight>
        </View>),
      headerStyle: {
        backgroundColor: '#393D42',
    },
    headerStyle: {
      backgroundColor: 'black',
    },
    headerTitle:<View style={{flex:0.8}}>
                  <Text style={{textAlign:'center',
                                fontSize:28,
                                color:'white',
                                fontWeight:'bold'}}>
                    SmartBarman
                  </Text>
                </View>,
    headerTintColor: 'white',
    headerTitleStyle: {
      fontSize: 22,
      fontWeight: 'bold',
    },
  })


});

const App = createAppContainer(Stack);

export default App;
