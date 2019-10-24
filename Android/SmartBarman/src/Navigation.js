import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import HomeScreen from './screens/home';
import ConnectionScreen from './screens/connection/ConnectionScreen';
import RegisterScreen from './screens/register';
import MenuPrincipal from  './screens/menu';

const Stack = createStackNavigator({
  Menu: MenuPrincipal ,
  Home: HomeScreen,
  Connection: ConnectionScreen,
  Register: RegisterScreen,
}, {
  initialRouteName: 'Menu'
});

const App = createAppContainer(Stack);

export default App;
