import React from 'react';
import {
  View, StyleSheet, ActivityIndicator, Text, Image,
} from 'react-native';

const coca_image = require('../../../' + 'assets/coca-cola.png');
const fernet_image = require('../../../' + 'assets/fernet_2.jpg');

const Filling = ({ drink }) => (
  <View style={{
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  }}
  >
    <View style={{ flex: 0.3 }}>
      <Text style={{
        padding: 20, textAlign: 'center', fontSize: 18, color: 'white',
      }}
      >
        Llenando el vaso con
        {' '}
        {drink}
        {' '}
...
      </Text>
    </View>

    <View style={{ flex: 0.5 }}>
      <Image
        style={{ margin: 10, height: 200, width: 200 }}
        source={drink === 'FERNET' ? fernet_image : coca_image}
      />
    </View>

    <View style={{ flex: 0.2 }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  </View>
);

export default (Comp) => ({
  drink, filling, glassDetected, children, ...props
}) => (
  <View style={{ flex: 1 }}>
    <Comp {...props}>
      {children}
    </Comp>
    {filling && glassDetected
        && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center' },
          ]}
        >
          <Filling drink={drink} />
        </View>
        )}
  </View>
);
