import React from 'react';
import Navigation from './src/Navigation';
import { NavigationEvents } from 'react-navigation';

const Realm = require('realm');

//  Realm.deleteFile({ path: 'UserDatabase.realm'})
const UserSchema = {
  name: 'User',
  properties: {
    username: 'string',
    height: 'float',
    weight: 'float',
    alcoholLevel: {type: 'float', optional: true},
    alcoholicDrinkPercentage: {type: 'float', optional: true}
  }
};

const DrinkSchema = {
  name: 'Drink',
  properties: {
    name: 'string',
    ingredient1:'string',
    ingredient1Percentage: 'float',
    ingredient2:'string',
    graduacionAlc: 'float'
  }
};

const DrinksIngestedSchema = {
  name : 'Ingested',
  properties:{
    bebida: 'string',
    graduacionAlc : 'float',
    fecha : 'date',
    porcentaje : 'float'
  }
}



export default class App extends React.Component {

  componentWillMount() {
    Realm.open({
      path: 'UserDatabase.realm',
      schema: [UserSchema, DrinkSchema,DrinksIngestedSchema]
    });
  }

  render() {
    return <Navigation />;
  }
}
