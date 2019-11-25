import React, { Component } from 'react';
import './App.css';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import {CardProps} from 'react-bootstrap/Card'


interface MyProps {name: string, probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}};
interface MyState {
    name: string, 
    background:CardProps["bg"],
    text:CardProps["text"],
    probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}};
  
  class TempDisplay extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state = {
            probe:props.probe,
            name:props.name,
            background:"light",
            text:"secondary"
        }
    }

    componentWillReceiveProps(nextProps:MyProps) {
        var temp:Number = Number(this.state.probe.temp);
        var alarmHigh:Number = Number(this.state.probe.alarmHigh);
        var alarmLow:Number = Number(this.state.probe.alarmLow);

        var newBackground:CardProps["bg"] = 'light';
        var newText:CardProps["text"] = "secondary";
        if((alarmLow < temp) && (temp < alarmHigh)){
            newBackground = 'light';
            newText = 'secondary';
        }
        if((alarmLow > temp)){
            newBackground = "primary";
            newText = 'white';
        }
        if((temp > alarmHigh)){
            newBackground = "danger";
            newText="white";
        }

        this.setState({...nextProps, background:newBackground, text:newText});  
      }


    render() {
        return(
            <>
            <Card className="m-2" bg={this.state.background} style={{flex: 1}} text={this.state.text}>
                <Card.Title>{this.state.name}</Card.Title>
                <Card.Body>
                    <Row>
                        <Col>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>MinAlarm</Row><Row>{this.state.probe.alarmLow}</Row></Col></Row>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>MaxAlarm</Row><Row>{this.state.probe.alarmHigh}</Row></Col></Row>
                        </Col>
                        <Col>
                            <Row style={{fontSize:"xxx-large", writingMode:"vertical-lr"}}>{this.state.probe.temp}°</Row>
                        </Col>
                        <Col>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>Min</Row><Row>{this.state.probe.min}</Row></Col></Row>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>Max</Row><Row>{this.state.probe.max}</Row></Col></Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            </>
        )
    }

  }

  export default TempDisplay;

