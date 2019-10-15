import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import HomeScreen from './screens/home/HomeScreen';
import ConnectionScreen from './screens/connection/ConnectionScreen';

const Stack = createStackNavigator({
  Home: HomeScreen,
  Connection: ConnectionScreen,
}, {
  initialRouteName: 'Connection'
});

const App = createAppContainer(Stack);

export default App;
