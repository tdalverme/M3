import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import MenuScreen from './screens/menu';
import HomeScreen from './screens/home';
import ConnectionScreen from './screens/connection/ConnectionScreen';
import RegisterScreen from './screens/register';
import RecordsScreen from  './screens/Records/';
import RecordsDetailScreen from  './screens/Records/detail.js';

const Stack = createStackNavigator({
  Records: RecordsScreen ,
  RecordsDetail : RecordsDetailScreen,
  Menu: MenuScreen,
  Home: HomeScreen,
  Connection: ConnectionScreen,
  Register: RegisterScreen,
}, {
  initialRouteName: 'Menu'
});

const App = createAppContainer(Stack);

export default App;
