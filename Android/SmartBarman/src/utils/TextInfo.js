import React from 'react'
import {Text,  StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  
    text2:{
        textAlign:'center',
        color:'white',
        fontWeight:'bold',
        fontSize:16
    }

})
export default({color,title}) => {
let colorFinal = color ?'#efb810':'white'
    return(
        <Text style = {{color:colorFinal}}>
            {title}
        </Text>
    )
}