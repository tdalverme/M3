import React from 'react';
import {
  View, StyleSheet, ActivityIndicator, Text, Image,
} from 'react-native';

const coca_image = require('../../../assets/coca-cola.png');
const fernet_image = require('../../../assets/fernet.jpg');

const Filling = ({}) => (
  <View style={{
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  }}
  >
    <View style={{ flex: 0.3 }}>
      <Text style={{
        padding: 20, textAlign: 'center', fontSize: 18, color: 'white',
      }}
      >
        Llenando el vaso ...
      </Text>
    </View>

    <View style={{ flex: 0.5 }}>
      <Image
        style={{ margin: 10, height: 200, width: 200 }}
        source={fernet_image}
      />
    </View>

    <View style={{ flex: 0.2 }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  </View>
);

export default (Comp) => ({ filling, children, ...props }) => (
  <View style={{ flex: 1 }}>
    <Comp {...props}>
      {children}
    </Comp>
    {filling
        && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center' },
          ]}
        >
          <Filling />
        </View>
        )}
  </View>
);
