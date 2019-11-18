import React from 'react'
import {TouchableHighlight,Text,StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  
    button:{
        backgroundColor:'#efb810',
        paddingVertical: 10,
        paddingHorizontal:20,
        borderRadius:4,
        opacity:0.9,
        margin:10,
    },
    text:{
        textAlign:'center',
        color:'white',
        fontWeight:'bold',
        fontSize:20
    }
})
export default({title,onPress}) => 
<TouchableHighlight style = {styles.button} onPress={onPress} >
    <Text style = {styles.text}>{title}</Text>
</TouchableHighlight>