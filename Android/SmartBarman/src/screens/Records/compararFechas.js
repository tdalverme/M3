import React from 'react';
import moment from 'moment';

export default (aux) =>{
    fechaActual = moment(new Date())
    return fechaActual.diff(moment(aux.fecha),'hours') < 8
}