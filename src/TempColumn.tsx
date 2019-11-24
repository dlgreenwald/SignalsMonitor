import React, { Component } from 'react';
import './App.css';
import CardDeck from 'react-bootstrap/CardDeck'
import TempDisplay from './TempDisplay'



interface MyProps {
    //Remove me
    curTemps:Map<string, { 'date': Date; 'value': Number; }>,
    probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
};
interface MyState {
    curTemps:Map<string, { 'date': Date; 'value': Number; }>,
    probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
};
  
  class TempColumn extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state =  {
            curTemps:props.curTemps,
            probeDetails:props.probeDetails
        }
    }

    componentWillReceiveProps(nextProps:MyProps) {
        this.setState({ curTemps: nextProps.curTemps, probeDetails:nextProps.probeDetails  });  
      }



    render() {
        var TempElements:Array<any> = [];
        this.state.probeDetails.forEach((device, key) => 
            TempElements.push(<TempDisplay name={key} probe={device}/>)
            
            
            )
        return(
            <>
            <CardDeck  style={{display:"flex", flexDirection:"column"}}>
                {TempElements}
            </CardDeck>
            </>
        )
    }

  }

  export default TempColumn;