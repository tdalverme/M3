import React from 'react'
import {TextInput,Text,StyleSheet,View} from 'react-native'

const styles = StyleSheet.create({
  
    text:{
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
      },
      section: {
        display:'flex',
        flex:1,
        flexWrap:'nowrap',
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection: 'row',
      },
      label: {
        flex: 0.5,
        color: 'white',
        textAlign:'center',
        fontSize: 18,
      },
      picker: {
        flex: 0.5,
        width:'80%',
        height: 40,
        alignSelf: 'center',
        fontSize: 18,
      },
      colums:{
        flex:0.5,
        flexDirection:'row',
        justifyContent:'center'
      }
})
export default({onChangeText,value,title,keyboardType}) => {
    return (
    <View style={styles.section}>
      <View style={styles.colums}>
        <Text style={styles.label} >{title}</Text>
      </View>
      <View style={styles.colums}>
        <TextInput 
            underlineColorAndroid={'grey'}
            style={{...styles.picker,...styles.label}}
            onChangeText={ onChangeText }
            keyboardType={keyboardType?keyboardType:'default'}
            value={value}
        />

        </View>
    </View>
    )
}