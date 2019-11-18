import React from 'react'
import {TouchableHighlight,Text,StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  
    button:{
        flex:1,
        justifyContent:'center',
        backgroundColor:'#efb810',
        width:50,
        opacity:0.9,
        height:50,
        margin:10
    },
    text:{
        textAlign:'center',
        color:'white',
        fontSize:30
    }
})
export default({title,onPress}) => 
<TouchableHighlight style = {{...styles.button}} onPress={onPress} >
    <Text style = {styles.text}>{title}</Text>
</TouchableHighlight>


