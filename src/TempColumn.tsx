import React, { Component } from 'react';
import './App.css';
import CardDeck from 'react-bootstrap/CardDeck'
import TempDisplay from './TempDisplay'



interface MyProps {
    curTemps:Map<string, { 'date': Date; 'value': Number; }>,
    probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
};
interface MyState {

}
  class TempColumn extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state =  {
            curTemps:props.curTemps,
            probeDetails:props.probeDetails
        }
    }

    render() {
        var TempElements:Array<JSX.Element> = [];
        this.props.probeDetails.forEach((device, key) => 
            TempElements.push(<TempDisplay key={key} name={key} probe={device}/>)
    )
        return(
            <>
            <div id="cardDeckContainer" className="row">
                <CardDeck id="cardDeck" className="col">
                    {TempElements}
                </CardDeck>
            </div>
            </>
        )
    }

  }

  export default TempColumn;